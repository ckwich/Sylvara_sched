import { ResourceType, type PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseDateOnlyUtc, requireActor, validationError } from '../http/route-helpers.js';

type AppDeps = {
  prisma: PrismaClient;
};

const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => parseDateOnlyUtc(value) !== null, 'Invalid calendar date.'),
});

const dismissBodySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => parseDateOnlyUtc(value) !== null, 'Invalid calendar date.'),
  conflictType: z.string().min(1),
  conflictKey: z.string().min(1),
});

type ConflictEntry = {
  type: 'EQUIPMENT_DOUBLE_BOOKING' | 'PERSON_CONFLICT' | 'CAPACITY_WARNING' | 'JOB_OVERLAP';
  severity: 'ERROR' | 'WARNING';
  message: string;
  affected_entities: Array<{ id: string; name: string; type: string }>;
  foreman_ids: string[];
};

export function registerConflictRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/conflicts', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }

    const query = dateQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationError(reply, 'Invalid conflict query.', query.error.flatten());
    }
    const date = query.data.date;
    const serviceDate = parseDateOnlyUtc(date)!;

    const [segments, memberships, orgSettings, activePeople] = await deps.prisma.$transaction([
      deps.prisma.scheduleSegment.findMany({
        where: {
          deletedAt: null,
          segmentRosterLink: {
            is: {
              deletedAt: null,
              roster: {
                date: serviceDate,
                deletedAt: null,
              },
            },
          },
        },
        select: {
          id: true,
          jobId: true,
          startDatetime: true,
          endDatetime: true,
          segmentRosterLink: {
            select: {
              roster: {
                select: {
                  id: true,
                  foremanPersonId: true,
                },
              },
            },
          },
          resourceReservations: {
            where: { deletedAt: null },
            select: {
              quantity: true,
              resource: {
                select: {
                  id: true,
                  name: true,
                  inventoryQuantity: true,
                },
              },
            },
          },
        },
      }),
      deps.prisma.foremanDayRosterMember.findMany({
        where: {
          date: serviceDate,
          deletedAt: null,
          roster: {
            deletedAt: null,
          },
        },
        select: {
          rosterId: true,
          roster: {
            select: {
              foremanPersonId: true,
            },
          },
          personResource: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      deps.prisma.orgSettings.findFirst({
        where: { deletedAt: null },
        select: {
          operatingStartMinute: true,
          operatingEndMinute: true,
        },
      }),
      deps.prisma.resource.count({
        where: {
          deletedAt: null,
          active: true,
          resourceType: ResourceType.PERSON,
        },
      }),
    ]);

    const conflicts: ConflictEntry[] = [];

    const equipmentMap = new Map<
      string,
      { name: string; available: number; reserved: number; foremanIds: Set<string> }
    >();
    for (const segment of segments) {
      const foremanId = segment.segmentRosterLink?.roster.foremanPersonId;
      for (const reservation of segment.resourceReservations) {
        const existing = equipmentMap.get(reservation.resource.id) ?? {
          name: reservation.resource.name,
          available: reservation.resource.inventoryQuantity,
          reserved: 0,
          foremanIds: new Set<string>(),
        };
        existing.reserved += reservation.quantity;
        if (foremanId) {
          existing.foremanIds.add(foremanId);
        }
        equipmentMap.set(reservation.resource.id, existing);
      }
    }
    for (const [resourceId, summary] of equipmentMap.entries()) {
      if (summary.reserved > summary.available) {
        conflicts.push({
          type: 'EQUIPMENT_DOUBLE_BOOKING',
          severity: 'ERROR',
          message: `${summary.name} reserved ${summary.reserved} > available ${summary.available}.`,
          affected_entities: [{ id: resourceId, name: summary.name, type: 'RESOURCE' }],
          foreman_ids: Array.from(summary.foremanIds),
        });
      }
    }

    const personMap = new Map<
      string,
      { name: string; rosterIds: Set<string>; foremanIds: Set<string> }
    >();
    for (const member of memberships) {
      const personId = member.personResource.id;
      const existing = personMap.get(personId) ?? {
        name: member.personResource.name,
        rosterIds: new Set<string>(),
        foremanIds: new Set<string>(),
      };
      existing.rosterIds.add(member.rosterId);
      existing.foremanIds.add(member.roster.foremanPersonId);
      personMap.set(personId, existing);
    }
    for (const [personId, summary] of personMap.entries()) {
      if (summary.rosterIds.size > 1) {
        conflicts.push({
          type: 'PERSON_CONFLICT',
          severity: 'ERROR',
          message: `${summary.name} appears on multiple rosters for ${date}.`,
          affected_entities: [{ id: personId, name: summary.name, type: 'PERSON' }],
          foreman_ids: Array.from(summary.foremanIds),
        });
      }
    }

    const jobMap = new Map<string, { foremanIds: Set<string> }>();
    for (const segment of segments) {
      const foremanId = segment.segmentRosterLink?.roster.foremanPersonId;
      if (!foremanId) {
        continue;
      }
      const existing = jobMap.get(segment.jobId) ?? { foremanIds: new Set<string>() };
      existing.foremanIds.add(foremanId);
      jobMap.set(segment.jobId, existing);
    }
    for (const [jobId, summary] of jobMap.entries()) {
      if (summary.foremanIds.size > 1) {
        conflicts.push({
          type: 'JOB_OVERLAP',
          severity: 'ERROR',
          message: `Job ${jobId} appears on multiple foreman rosters for ${date}.`,
          affected_entities: [{ id: jobId, name: jobId, type: 'JOB' }],
          foreman_ids: Array.from(summary.foremanIds),
        });
      }
    }

    const dailyHours =
      orgSettings?.operatingStartMinute !== null &&
      orgSettings?.operatingStartMinute !== undefined &&
      orgSettings?.operatingEndMinute !== null &&
      orgSettings?.operatingEndMinute !== undefined
        ? Math.max(0, (orgSettings.operatingEndMinute - orgSettings.operatingStartMinute) / 60)
        : 14;
    const totalHours = segments.reduce(
      (sum, segment) => sum + (segment.endDatetime.getTime() - segment.startDatetime.getTime()) / 3600000,
      0,
    );
    const capacityHours = activePeople * dailyHours;
    if (totalHours > capacityHours) {
      conflicts.push({
        type: 'CAPACITY_WARNING',
        severity: 'WARNING',
        message: `Scheduled hours ${totalHours.toFixed(1)} exceed capacity ${capacityHours.toFixed(1)}.`,
        affected_entities: [],
        foreman_ids: [],
      });
    }

    return reply.code(200).send({
      date,
      conflicts,
    });
  });

  app.post('/api/conflicts/dismiss', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }

    const body = dismissBodySchema.safeParse(request.body);
    if (!body.success) {
      return validationError(reply, 'Invalid dismissal payload.', body.error.flatten());
    }

    const conflictDate = parseDateOnlyUtc(body.data.date)!;
    const dismissal = await deps.prisma.schedulingConflictDismissal.upsert({
      where: {
        dismissedByUserId_conflictDate_conflictType_conflictKey: {
          dismissedByUserId: actor.actorUserId,
          conflictDate,
          conflictType: body.data.conflictType,
          conflictKey: body.data.conflictKey,
        },
      },
      create: {
        dismissedByUserId: actor.actorUserId,
        conflictDate,
        conflictType: body.data.conflictType,
        conflictKey: body.data.conflictKey,
      },
      update: {
        deletedAt: null,
        dismissedAt: new Date(),
      },
    });

    return reply.code(200).send({ dismissal });
  });

  app.get('/api/conflicts/dismissals', async (request, reply) => {
    const actor = await requireActor({ request, reply, prisma: deps.prisma });
    if (!actor) {
      return;
    }

    const query = dateQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationError(reply, 'Invalid dismissal query.', query.error.flatten());
    }

    const conflictDate = parseDateOnlyUtc(query.data.date)!;
    const dismissals = await deps.prisma.schedulingConflictDismissal.findMany({
      where: {
        dismissedByUserId: actor.actorUserId,
        conflictDate,
        deletedAt: null,
      },
      orderBy: {
        dismissedAt: 'desc',
      },
    });

    return reply.code(200).send({ dismissals });
  });
}
