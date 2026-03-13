import { Prisma, SegmentType, type PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, wallClockHoursBetween } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import { requireActor, requireMutationPermission } from '../../http/route-helpers.js';
import {
  checkPersonConflict,
  checkResourceAvailability,
} from '../../services/availability-service.js';
import { computeScheduledEffectiveHours } from '../../scheduling/job-state.js';
import {
  crossesLocalMidnight,
  dateOnlyToUtc,
  getDerivedJobState,
  hasActiveBookingConflict,
  isTenMinuteBoundary,
  localDateIso,
  parseIsoDatetime,
  type AppDeps,
  uuidSchema,
} from './_shared.js';

const createSegmentBodySchema = z.object({
  jobId: uuidSchema,
  rosterId: uuidSchema,
  startDatetime: z.string().datetime({ offset: true }),
  endDatetime: z.string().datetime({ offset: true }),
  segmentType: z.nativeEnum(SegmentType).optional().default(SegmentType.PRIMARY),
  scheduledHoursOverride: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

const updateSegmentBodySchema = z.object({
  startDatetime: z.string().datetime({ offset: true }).optional(),
  endDatetime: z.string().datetime({ offset: true }).optional(),
  scheduledHoursOverride: z.number().positive().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
const segmentIdParamsSchema = z.object({
  segmentId: uuidSchema,
});
const reservationIdParamsSchema = z.object({
  segmentId: uuidSchema,
  reservationId: uuidSchema,
});
const createReservationBodySchema = z.object({
  resourceId: uuidSchema,
  quantity: z.number().int().min(1).optional().default(1),
});

type VacatedWindow = {
  sourceAction: 'DELETED' | 'MOVED' | 'SHORTENED';
  startDatetime: Date;
  endDatetime: Date;
};

function computeWallClockHours(input: { startDatetime: Date; endDatetime: Date; timezone: string }): Prisma.Decimal {
  return computeScheduledEffectiveHours({
    timezone: input.timezone,
    segments: [
      {
        startDatetime: input.startDatetime,
        endDatetime: input.endDatetime,
        scheduledHoursOverride: null,
      },
    ],
  });
}

function deriveVacatedWindowsForPatch(input: {
  previousStart: Date;
  previousEnd: Date;
  nextStart: Date;
  nextEnd: Date;
  timezone: string;
}): VacatedWindow[] {
  const startChanged = input.previousStart.getTime() !== input.nextStart.getTime();
  const endChanged = input.previousEnd.getTime() !== input.nextEnd.getTime();
  if (!startChanged && !endChanged) {
    return [];
  }

  const previousDurationMinutes = Math.round(
    wallClockHoursBetween(input.previousStart, input.previousEnd, input.timezone) * 60,
  );
  const nextDurationMinutes = Math.round(
    wallClockHoursBetween(input.nextStart, input.nextEnd, input.timezone) * 60,
  );
  const movedOnly =
    startChanged &&
    endChanged &&
    previousDurationMinutes === nextDurationMinutes &&
    input.nextStart.getTime() - input.previousStart.getTime() ===
      input.nextEnd.getTime() - input.previousEnd.getTime();
  if (movedOnly) {
    return [
      {
        sourceAction: 'MOVED',
        startDatetime: input.previousStart,
        endDatetime: input.previousEnd,
      },
    ];
  }

  const windows: VacatedWindow[] = [];
  if (input.nextStart.getTime() > input.previousStart.getTime()) {
    windows.push({
      sourceAction: 'SHORTENED',
      startDatetime: input.previousStart,
      endDatetime: input.nextStart,
    });
  }
  if (input.nextEnd.getTime() < input.previousEnd.getTime()) {
    windows.push({
      sourceAction: 'SHORTENED',
      startDatetime: input.nextEnd,
      endDatetime: input.previousEnd,
    });
  }
  return windows;
}

async function createVacatedSlots(input: {
  tx: Prisma.TransactionClient;
  windows: VacatedWindow[];
  sourceSegmentId: string;
  equipmentType: 'CRANE' | 'BUCKET';
  timezone: string;
}): Promise<Array<{ id: string; sourceAction: 'DELETED' | 'MOVED' | 'SHORTENED'; startDatetime: Date; endDatetime: Date; slotHours: Prisma.Decimal }>> {
  const createdSlots: Array<{
    id: string;
    sourceAction: 'DELETED' | 'MOVED' | 'SHORTENED';
    startDatetime: Date;
    endDatetime: Date;
    slotHours: Prisma.Decimal;
  }> = [];
  for (const window of input.windows) {
    const slotHours = computeWallClockHours({
      startDatetime: window.startDatetime,
      endDatetime: window.endDatetime,
      timezone: input.timezone,
    });
    if (slotHours.lte(0)) {
      continue;
    }

    const created = (await input.tx.vacatedSlot.create({
      data: {
        sourceSegmentId: input.sourceSegmentId,
        sourceAction: window.sourceAction,
        startDatetime: window.startDatetime,
        endDatetime: window.endDatetime,
        slotHours,
        equipmentType: input.equipmentType,
        status: 'OPEN',
      },
      select: {
        id: true,
        sourceAction: true,
        startDatetime: true,
        endDatetime: true,
        slotHours: true,
      },
    })) as
      | {
          id: string;
          sourceAction: 'DELETED' | 'MOVED' | 'SHORTENED';
          startDatetime: Date;
          endDatetime: Date;
          slotHours: Prisma.Decimal;
        }
      | undefined;
    if (created?.id) {
      createdSlots.push(created);
    }
  }
  return createdSlots;
}

async function collectAvailabilityWarnings(input: {
  prisma: PrismaClient;
  serviceDate: string;
  rosterId: string;
}): Promise<Array<{ code: string; message: string }>> {
  const prismaAny = input.prisma as unknown as {
    resourceReservation?: { findMany?: (...args: unknown[]) => Promise<Array<{ resourceId: string }>> };
    foremanDayRosterMember?: { findMany?: (...args: unknown[]) => Promise<Array<{ personResourceId: string }>> };
  };
  if (!prismaAny.resourceReservation?.findMany || !prismaAny.foremanDayRosterMember?.findMany) {
    return [];
  }

  const [reservations, rosterMembers] = await Promise.all([
    input.prisma.resourceReservation.findMany({
      where: {
        deletedAt: null,
        scheduleSegment: {
          deletedAt: null,
          segmentRosterLink: {
            is: {
              roster: {
                date: new Date(`${input.serviceDate}T00:00:00.000Z`),
                deletedAt: null,
              },
            },
          },
        },
      },
      select: {
        resourceId: true,
      },
    }),
    input.prisma.foremanDayRosterMember.findMany({
      where: {
        rosterId: input.rosterId,
        deletedAt: null,
      },
      select: {
        personResourceId: true,
      },
    }),
  ]);

  const warnings: Array<{ code: string; message: string }> = [];
  const resourceIds = Array.from(new Set(reservations.map((item) => item.resourceId)));
  for (const resourceId of resourceIds) {
    const warning = await checkResourceAvailability(input.prisma, input.serviceDate, resourceId);
    if (warning) {
      warnings.push({
        code: warning.code,
        message: `${warning.resourceName} reserved ${warning.reserved} > available ${warning.available}.`,
      });
    }
  }

  const personIds = Array.from(new Set(rosterMembers.map((item) => item.personResourceId)));
  for (const personId of personIds) {
    const warning = await checkPersonConflict(input.prisma, input.serviceDate, personId);
    if (warning) {
      warnings.push({
        code: warning.code,
        message: `${warning.resourceName} appears on multiple rosters for ${input.serviceDate}.`,
      });
    }
  }

  return warnings;
}

export function registerSegmentRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/schedule-segments/:segmentId/reservations', async (request, reply) => {
    const params = segmentIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid segment id.',
          details: params.error.flatten(),
        },
      });
    }

    const reservations = await deps.prisma.resourceReservation.findMany({
      where: {
        scheduleSegmentId: params.data.segmentId,
        deletedAt: null,
      },
      include: {
        resource: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return reply.code(200).send({ reservations });
  });

  app.post('/api/schedule-segments/:segmentId/reservations', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = segmentIdParamsSchema.safeParse(request.params);
    const body = createReservationBodySchema.safeParse(request.body);
    if (!params.success || !body.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid reservation payload.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            body: body.success ? undefined : body.error.flatten(),
          },
        },
      });
    }

    const [segment, resource] = await Promise.all([
      deps.prisma.scheduleSegment.findFirst({
        where: {
          id: params.data.segmentId,
          deletedAt: null,
        },
        select: { id: true },
      }),
      deps.prisma.resource.findFirst({
        where: {
          id: body.data.resourceId,
          deletedAt: null,
        },
        select: {
          id: true,
          resourceType: true,
          inventoryQuantity: true,
          name: true,
        },
      }),
    ]);

    if (!segment) {
      return reply.code(404).send({
        error: {
          code: 'SEGMENT_NOT_FOUND',
          message: 'Schedule segment not found.',
          details: {},
        },
      });
    }
    if (!resource) {
      return reply.code(404).send({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found.',
          details: {},
        },
      });
    }

    const requestedQuantity = body.data.quantity;
    if (resource.resourceType === 'PERSON' && requestedQuantity !== 1) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'PERSON reservations must have quantity 1.',
          details: {},
        },
      });
    }
    if (resource.resourceType === 'EQUIPMENT' && requestedQuantity > resource.inventoryQuantity) {
      return reply.code(400).send({
        error: {
          code: 'RESOURCE_CAPACITY_EXCEEDED',
          message: 'Requested quantity exceeds inventory quantity.',
          details: {
            requested: requestedQuantity,
            available: resource.inventoryQuantity,
          },
        },
      });
    }

    const reservation = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.resourceReservation.findFirst({
        where: {
          scheduleSegmentId: segment.id,
          resourceId: resource.id,
        },
        select: { id: true, deletedAt: true },
      });

      if (existing) {
        return tx.resourceReservation.update({
          where: { id: existing.id },
          data: {
            quantity: resource.resourceType === 'PERSON' ? 1 : requestedQuantity,
            deletedAt: null,
          },
          include: {
            resource: true,
          },
        });
      }

      return tx.resourceReservation.create({
        data: {
          scheduleSegmentId: segment.id,
          resourceId: resource.id,
          quantity: resource.resourceType === 'PERSON' ? 1 : requestedQuantity,
        },
        include: {
          resource: true,
        },
      });
    });

    return reply.code(201).send({ reservation });
  });

  app.delete('/api/schedule-segments/:segmentId/reservations/:reservationId', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }

    const params = reservationIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid reservation id.',
          details: params.error.flatten(),
        },
      });
    }

    const existing = await deps.prisma.resourceReservation.findFirst({
      where: {
        id: params.data.reservationId,
        scheduleSegmentId: params.data.segmentId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    if (!existing) {
      return reply.code(404).send({
        error: {
          code: 'RESERVATION_NOT_FOUND',
          message: 'Reservation not found.',
          details: {},
        },
      });
    }

    await deps.prisma.resourceReservation.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return reply.code(204).send();
  });

  app.get('/api/jobs/:jobId/schedule-segments', async (request, reply) => {
    const paramsSchema = z.object({ jobId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid job id.',
          details: params.error.flatten(),
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst({ where: { deletedAt: null } });
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;

    const segments = await deps.prisma.scheduleSegment.findMany({
      where: {
        jobId: params.data.jobId,
        deletedAt: null,
        segmentRosterLink: {
          isNot: null,
        },
      },
      orderBy: { startDatetime: 'asc' },
      include: {
        segmentRosterLink: {
          include: {
            roster: true,
          },
        },
      },
    });

    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: params.data.jobId,
      timezone,
    });
    if (!jobState) {
      return reply.code(404).send({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found.',
          details: {},
        },
      });
    }

    return reply.code(200).send({
      segments,
      jobState,
    });
  });

  app.post('/api/schedule-segments', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;
    const parsed = createSegmentBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body.',
          details: parsed.error.flatten(),
        },
      });
    }

    const body = parsed.data;
    const startDatetime = parseIsoDatetime(body.startDatetime);
    const endDatetime = parseIsoDatetime(body.endDatetime);
    if (!startDatetime || !endDatetime) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid datetime values.',
          details: {},
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst({ where: { deletedAt: null } });
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    if (endDatetime <= startDatetime) {
      return reply.code(400).send({
        error: {
          code: 'INVALID_DURATION',
          message: 'Segment end must be after start.',
          details: {},
        },
      });
    }

    if (crossesLocalMidnight(startDatetime, endDatetime, timezone)) {
      return reply.code(400).send({
        error: {
          code: 'CROSSES_MIDNIGHT',
          message: 'Segment must not cross local midnight.',
          details: {},
        },
      });
    }

    if (!isTenMinuteBoundary(startDatetime, timezone) || !isTenMinuteBoundary(endDatetime, timezone)) {
      return reply.code(400).send({
        error: {
          code: 'INVALID_INCREMENT',
          message: 'Segment start and end must align to 10-minute increments.',
          details: {},
        },
      });
    }

    const [job, roster] = await Promise.all([
      deps.prisma.job.findUnique({
        where: { id: body.jobId },
        select: {
          id: true,
          frozenGroundFlag: true,
          winterFlag: true,
          jobBlockers: {
            where: {
              deletedAt: null,
              status: 'ACTIVE',
            },
            select: { id: true },
          },
        },
      }),
      deps.prisma.foremanDayRoster.findUnique({
        where: { id: body.rosterId },
        select: { id: true, date: true, foremanPersonId: true },
      }),
    ]);
    if (!job) {
      return reply.code(404).send({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found.',
          details: {},
        },
      });
    }
    const activeBlockers = Array.isArray(job.jobBlockers) ? job.jobBlockers : [];
    if (activeBlockers.length > 0) {
      return reply.code(200).send({
        result: 'REJECT',
        error: {
          code: 'ACTIVE_BLOCKER',
          message: 'Job has active blockers.',
        },
      });
    }
    if (!roster) {
      return reply.code(404).send({
        error: {
          code: 'ROSTER_NOT_FOUND',
          message: 'Roster not found.',
          details: {},
        },
      });
    }

    const rosterLocalDate = localDateIso(roster.date, 'UTC');
    const segmentLocalDate = localDateIso(startDatetime, timezone);
    if (rosterLocalDate !== segmentLocalDate) {
      return reply.code(400).send({
        error: {
          code: 'ROSTER_DATE_MISMATCH',
          message: 'Segment date must match roster date in company timezone.',
          details: {},
        },
      });
    }

    const hasConflict = await hasActiveBookingConflict({
      prisma: deps.prisma,
      foremanPersonId: roster.foremanPersonId,
      serviceDate: roster.date,
      startDatetime,
      endDatetime,
    });
    if (hasConflict) {
      return reply.code(409).send({
        error: {
          code: 'SCHEDULE_CONFLICT',
          message: 'Segment overlaps existing booking.',
          details: {},
        },
      });
    }

    const created = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const segment = await tx.scheduleSegment.create({
        data: {
          jobId: body.jobId,
          segmentType: body.segmentType,
          startDatetime,
          endDatetime,
          scheduledHoursOverride:
            body.scheduledHoursOverride !== undefined
              ? new Prisma.Decimal(body.scheduledHoursOverride)
              : undefined,
          notes: body.notes,
          createdByUserId: actorUserId,
        },
      });

      await tx.segmentRosterLink.create({
        data: {
          scheduleSegmentId: segment.id,
          rosterId: body.rosterId,
          createdByUserId: actorUserId,
        },
      });

      await tx.scheduleEvent.create({
        data: {
          jobId: body.jobId,
          eventType: 'SEGMENT_CREATED',
          source: 'USER_ACTION',
          fromAt: startDatetime,
          toAt: endDatetime,
          actorUserId,
          rawSnippet: JSON.stringify({
            segmentId: segment.id,
            rosterId: body.rosterId,
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: segment.id,
          actionType: 'SEGMENT_CREATED',
          actorUserId,
          actorDisplay,
          diff: {
            jobId: body.jobId,
            rosterId: body.rosterId,
            startDatetime,
            endDatetime,
            scheduledHoursOverride: body.scheduledHoursOverride ?? null,
          },
        },
      });

      return segment;
    });

    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: body.jobId,
      timezone,
    });
    const warnings = await collectAvailabilityWarnings({
      prisma: deps.prisma,
      serviceDate: rosterLocalDate,
      rosterId: body.rosterId,
    });
    if (job.frozenGroundFlag === true) {
      warnings.push({
        code: 'FROZEN_GROUND_REQUIRED',
        message: 'This job requires frozen ground conditions.',
      });
    }
    if (job.winterFlag === true) {
      warnings.push({
        code: 'WINTER_PREFERRED',
        message: 'This job is preferred for winter scheduling.',
      });
    }

    return reply.code(200).send({
      segment: created,
      jobState,
      warnings,
    });
  });

  app.patch('/api/schedule-segments/:segmentId', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;
    const paramsSchema = z.object({ segmentId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    const parsed = updateSegmentBodySchema.safeParse(request.body);
    if (!params.success || !parsed.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            body: parsed.success ? undefined : parsed.error.flatten(),
          },
        },
      });
    }

    const existing = await deps.prisma.scheduleSegment.findFirst({
      where: {
        id: params.data.segmentId,
        deletedAt: null,
      },
      include: {
        segmentRosterLink: {
          include: {
            roster: true,
          },
        },
      },
    });

    if (!existing) {
      return reply.code(404).send({
        error: {
          code: 'SEGMENT_NOT_FOUND',
          message: 'Schedule segment not found.',
          details: {},
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst({ where: { deletedAt: null } });
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const nextStart = parsed.data.startDatetime
      ? parseIsoDatetime(parsed.data.startDatetime)
      : existing.startDatetime;
    const nextEnd = parsed.data.endDatetime
      ? parseIsoDatetime(parsed.data.endDatetime)
      : existing.endDatetime;
    if (!nextStart || !nextEnd) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid datetime values.',
          details: {},
        },
      });
    }

    if (nextEnd <= nextStart) {
      return reply.code(400).send({
        error: {
          code: 'INVALID_DURATION',
          message: 'Segment end must be after start.',
          details: {},
        },
      });
    }
    if (crossesLocalMidnight(nextStart, nextEnd, timezone)) {
      return reply.code(400).send({
        error: {
          code: 'CROSSES_MIDNIGHT',
          message: 'Segment must not cross local midnight.',
          details: {},
        },
      });
    }
    if (!isTenMinuteBoundary(nextStart, timezone) || !isTenMinuteBoundary(nextEnd, timezone)) {
      return reply.code(400).send({
        error: {
          code: 'INVALID_INCREMENT',
          message: 'Segment start and end must align to 10-minute increments.',
          details: {},
        },
      });
    }

    if (existing.segmentRosterLink) {
      const rosterLocalDate = localDateIso(existing.segmentRosterLink.roster.date, 'UTC');
      const segmentLocalDate = localDateIso(nextStart, timezone);
      if (rosterLocalDate !== segmentLocalDate) {
        return reply.code(400).send({
          error: {
            code: 'ROSTER_DATE_MISMATCH',
            message: 'Segment date must match roster date in company timezone.',
            details: {},
          },
        });
      }

      const hasConflict = await hasActiveBookingConflict({
        prisma: deps.prisma,
        foremanPersonId: existing.segmentRosterLink.roster.foremanPersonId,
        serviceDate: existing.segmentRosterLink.roster.date,
        startDatetime: nextStart,
        endDatetime: nextEnd,
        excludeScheduleSegmentId: existing.id,
      });
      if (hasConflict) {
        return reply.code(409).send({
          error: {
            code: 'SCHEDULE_CONFLICT',
            message: 'Segment overlaps existing booking.',
            details: {},
          },
        });
      }
    }

    const jobForVacatedSlot = await deps.prisma.job.findUnique({
      where: {
        id: existing.jobId,
      },
      select: {
        equipmentType: true,
        frozenGroundFlag: true,
        winterFlag: true,
        deletedAt: true,
      },
    });
    if (!jobForVacatedSlot || (jobForVacatedSlot.deletedAt ?? null) !== null) {
      return reply.code(404).send({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found.',
          details: {},
        },
      });
    }

    const startChanged = existing.startDatetime.getTime() !== nextStart.getTime();
    const endChanged = existing.endDatetime.getTime() !== nextEnd.getTime();
    const previousDurationMinutes = Math.round(
      wallClockHoursBetween(existing.startDatetime, existing.endDatetime, timezone) * 60,
    );
    const nextDurationMinutes = Math.round(
      wallClockHoursBetween(nextStart, nextEnd, timezone) * 60,
    );
    const movedOnly =
      previousDurationMinutes === nextDurationMinutes &&
      (existing.startDatetime.getTime() !== nextStart.getTime() ||
        existing.endDatetime.getTime() !== nextEnd.getTime());

    const eventType =
      !startChanged && !endChanged
        ? 'SEGMENT_UPDATED'
        : movedOnly
          ? 'SEGMENT_MOVED'
          : 'SEGMENT_RESIZED';
    const eventFromAt = endChanged ? existing.endDatetime : existing.startDatetime;
    const eventToAt = endChanged ? nextEnd : nextStart;
    const vacatedWindows = deriveVacatedWindowsForPatch({
      previousStart: existing.startDatetime,
      previousEnd: existing.endDatetime,
      nextStart,
      nextEnd,
      timezone,
    });

    const updated = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const segment = await tx.scheduleSegment.update({
        where: { id: existing.id },
        data: {
          startDatetime: nextStart,
          endDatetime: nextEnd,
          scheduledHoursOverride:
            parsed.data.scheduledHoursOverride !== undefined
              ? parsed.data.scheduledHoursOverride === null
                ? null
                : new Prisma.Decimal(parsed.data.scheduledHoursOverride)
              : undefined,
          notes: parsed.data.notes !== undefined ? parsed.data.notes : undefined,
        },
      });

      const createdVacatedSlots = await createVacatedSlots({
        tx,
        windows: vacatedWindows,
        sourceSegmentId: existing.id,
        equipmentType: jobForVacatedSlot.equipmentType,
        timezone,
      });
      for (const vacatedSlot of createdVacatedSlots) {
        await tx.activityLog.create({
          data: {
            entityType: 'VacatedSlot',
            entityId: vacatedSlot.id,
            actionType: 'VACATED_SLOT_CREATED',
            actorUserId,
            actorDisplay,
            diff: {
              sourceSegmentId: existing.id,
              sourceAction: vacatedSlot.sourceAction,
              startDatetime: vacatedSlot.startDatetime,
              endDatetime: vacatedSlot.endDatetime,
              slotHours: vacatedSlot.slotHours.toString(),
              equipmentType: jobForVacatedSlot.equipmentType,
            },
          },
        });
      }

      await tx.scheduleEvent.create({
        data: {
          jobId: existing.jobId,
          eventType,
          source: 'USER_ACTION',
          fromAt: eventFromAt,
          toAt: eventToAt,
          actorUserId,
          rawSnippet: JSON.stringify({
            segmentId: existing.id,
            oldStart: existing.startDatetime,
            oldEnd: existing.endDatetime,
            newStart: nextStart,
            newEnd: nextEnd,
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: existing.id,
          actionType: eventType,
          actorUserId,
          actorDisplay,
          diff: {
            oldStart: existing.startDatetime,
            oldEnd: existing.endDatetime,
            newStart: nextStart,
            newEnd: nextEnd,
          },
        },
      });

      return {
        segment,
        vacatedSlotId: createdVacatedSlots[0]?.id ?? null,
      };
    });

    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: existing.jobId,
      timezone,
    });

    const warnings: Array<{ code: string; message: string }> = [];
    if (jobForVacatedSlot.frozenGroundFlag) {
      warnings.push({
        code: 'FROZEN_GROUND_REQUIRED',
        message: 'This job requires frozen ground conditions.',
      });
    }
    if (jobForVacatedSlot.winterFlag) {
      warnings.push({
        code: 'WINTER_PREFERRED',
        message: 'This job is preferred for winter scheduling.',
      });
    }

    return reply.code(200).send({
      segment: updated.segment,
      jobState,
      vacatedSlotId: updated.vacatedSlotId,
      warnings,
    });
  });

  app.delete('/api/schedule-segments/:segmentId', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;
    const paramsSchema = z.object({ segmentId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid segment id.',
          details: params.error.flatten(),
        },
      });
    }

    const existing = await deps.prisma.scheduleSegment.findFirst({
      where: {
        id: params.data.segmentId,
        deletedAt: null,
      },
      select: {
        id: true,
        jobId: true,
        startDatetime: true,
        endDatetime: true,
      },
    });
    if (!existing) {
      return reply.code(404).send({
        error: {
          code: 'SEGMENT_NOT_FOUND',
          message: 'Schedule segment not found.',
          details: {},
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst({ where: { deletedAt: null } });
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const jobForVacatedSlot = await deps.prisma.job.findUnique({
      where: {
        id: existing.jobId,
      },
      select: {
        equipmentType: true,
        deletedAt: true,
      },
    });
    if (!jobForVacatedSlot || (jobForVacatedSlot.deletedAt ?? null) !== null) {
      return reply.code(404).send({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found.',
          details: {},
        },
      });
    }
    const deletedAt = new Date();
    const deletedResult = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.scheduleSegment.update({
        where: { id: existing.id },
        data: { deletedAt },
      });

      const createdVacatedSlots = await createVacatedSlots({
        tx,
        windows: [
          {
            sourceAction: 'DELETED',
            startDatetime: existing.startDatetime,
            endDatetime: existing.endDatetime,
          },
        ],
        sourceSegmentId: existing.id,
        equipmentType: jobForVacatedSlot.equipmentType,
        timezone,
      });
      for (const vacatedSlot of createdVacatedSlots) {
        await tx.activityLog.create({
          data: {
            entityType: 'VacatedSlot',
            entityId: vacatedSlot.id,
            actionType: 'VACATED_SLOT_CREATED',
            actorUserId,
            actorDisplay,
            diff: {
              sourceSegmentId: existing.id,
              sourceAction: vacatedSlot.sourceAction,
              startDatetime: vacatedSlot.startDatetime,
              endDatetime: vacatedSlot.endDatetime,
              slotHours: vacatedSlot.slotHours.toString(),
              equipmentType: jobForVacatedSlot.equipmentType,
            },
          },
        });
      }

      await tx.scheduleEvent.create({
        data: {
          jobId: existing.jobId,
          eventType: 'SEGMENT_DELETED',
          source: 'USER_ACTION',
          fromAt: existing.startDatetime,
          toAt: existing.endDatetime,
          actorUserId,
          rawSnippet: JSON.stringify({
            segmentId: existing.id,
            deletedAt,
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: existing.id,
          actionType: 'SEGMENT_DELETED',
          actorUserId,
          actorDisplay,
          diff: {
            deletedAt,
          },
        },
      });

      return {
        vacatedSlotId: createdVacatedSlots[0]?.id ?? null,
      };
    });

    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: existing.jobId,
      timezone,
    });

    return reply.code(200).send({
      ok: true,
      jobState,
      vacatedSlotId: deletedResult.vacatedSlotId,
    });
  });

  app.patch('/api/schedule-segments/:segmentId/restore', async (request, reply) => {
    const actor = await requireActor({
      prisma: deps.prisma,
      request,
      reply,
      unauthenticatedBody: UNAUTHENTICATED_ERROR,
    });
    if (!actor) {
      return;
    }
    if (!requireMutationPermission({ role: actor.actorRole, reply })) {
      return;
    }
    const actorUserId = actor.actorUserId;
    const actorDisplay = actor.actorDisplay;
    const paramsSchema = z.object({ segmentId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid segment id.',
          details: params.error.flatten(),
        },
      });
    }

    const existing = await deps.prisma.scheduleSegment.findUnique({
      where: { id: params.data.segmentId },
      select: {
        id: true,
        jobId: true,
        startDatetime: true,
        endDatetime: true,
        deletedAt: true,
      },
    });
    if (!existing) {
      return reply.code(404).send({
        error: {
          code: 'SEGMENT_NOT_FOUND',
          message: 'Schedule segment not found.',
          details: {},
        },
      });
    }
    if (!existing.deletedAt) {
      return reply.code(409).send({
        error: {
          code: 'SEGMENT_NOT_DELETED',
          message: 'Schedule segment is already active.',
          details: {},
        },
      });
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.scheduleSegment.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });

      await tx.scheduleEvent.create({
        data: {
          jobId: existing.jobId,
          eventType: 'SEGMENT_UPDATED',
          source: 'USER_ACTION',
          fromAt: existing.deletedAt,
          toAt: new Date(),
          actorUserId,
          rawSnippet: JSON.stringify({
            segmentId: existing.id,
            restored: true,
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: existing.id,
          actionType: 'SEGMENT_RESTORED',
          actorUserId,
          actorDisplay,
          diff: {
            restored: true,
          },
        },
      });
    });

    const orgSettings = await deps.prisma.orgSettings.findFirst({ where: { deletedAt: null } });
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: existing.jobId,
      timezone,
    });

    return reply.code(200).send({
      ok: true,
      jobState,
    });
  });
}
