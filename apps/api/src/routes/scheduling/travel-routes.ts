import { Prisma, SegmentSource, TravelType } from '@prisma/client';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import { requireActor, requireMutationPermission } from '../../http/route-helpers.js';
import { reject } from '../../scheduling/availability.js';
import {
  crossesLocalMidnight,
  dateOnlyToUtc,
  localDateAtMinute,
  localDateIso,
  localDayBoundsUtc,
  minuteOfLocalDate,
  parseIsoDatetime,
  type AppDeps,
  uuidSchema,
} from './_shared.js';

const closeOutBodySchema = z.object({
  foremanPersonId: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().positive(),
});

const createTravelBodySchema = z.object({
  foremanPersonId: uuidSchema,
  travelType: z.nativeEnum(TravelType),
  startDatetime: z.string().datetime({ offset: true }),
  endDatetime: z.string().datetime({ offset: true }),
  relatedJobId: uuidSchema.optional(),
  notes: z.string().optional(),
});

export function registerTravelRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/travel/close-out-day', async (request, reply) => {
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
    const parsed = closeOutBodySchema.safeParse(request.body);
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
    const serviceDate = dateOnlyToUtc(body.date);
    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const { startUtc: dayStartUtc, endUtc: dayEndUtc } = localDayBoundsUtc(body.date, timezone);

    const existingEnd = await deps.prisma.travelSegment.findFirst({
      where: {
        foremanPersonId: body.foremanPersonId,
        travelType: TravelType.END_OF_DAY,
        deletedAt: null,
        startDatetime: { lt: dayEndUtc },
        endDatetime: { gt: dayStartUtc },
      },
    });

    if (existingEnd) {
      return reply
        .code(200)
        .send(reject('END_OF_DAY_ALREADY_EXISTS', 'An active END_OF_DAY travel segment already exists.'));
    }

    const segments = await deps.prisma.scheduleSegment.findMany({
      where: {
        deletedAt: null,
        startDatetime: { lt: dayEndUtc },
        endDatetime: { gt: dayStartUtc },
        segmentRosterLink: {
          is: {
            roster: {
              foremanPersonId: body.foremanPersonId,
              date: serviceDate,
            },
          },
        },
      },
      select: {
        id: true,
        jobId: true,
        endDatetime: true,
      },
    });

    if (segments.length === 0) {
      return reply.code(200).send(reject('NO_ONSITE_SEGMENTS', 'No onsite segments found for close out.'));
    }

    const latestEndMinute = Math.max(
      ...segments.map((s: { endDatetime: Date }) => minuteOfLocalDate(s.endDatetime, timezone)),
    );
    const endMinute = latestEndMinute + body.durationMinutes;

    if (endMinute > 1440) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'END_OF_DAY travel would cross midnight.'));
    }

    const startDatetime = localDateAtMinute(body.date, latestEndMinute, timezone);
    const endDatetime = localDateAtMinute(body.date, endMinute, timezone);
    if (crossesLocalMidnight(startDatetime, endDatetime, timezone)) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'END_OF_DAY travel would cross local midnight.'));
    }

    const travel = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.travelSegment.create({
        data: {
          foremanPersonId: body.foremanPersonId,
          serviceDate,
          startDatetime,
          endDatetime,
          travelType: TravelType.END_OF_DAY,
          source: SegmentSource.MANUAL,
          createdByUserId: actorUserId,
        },
      });

      const latestSegment = segments.reduce((latest, segment) =>
        segment.endDatetime > latest.endDatetime ? segment : latest,
      );

      await tx.scheduleEvent.create({
        data: {
          jobId: latestSegment.jobId,
          eventType: 'MANUAL_EDIT',
          source: 'USER_ACTION',
          fromAt: startDatetime,
          toAt: endDatetime,
          actorUserId,
          rawSnippet: JSON.stringify({
            action: 'CLOSE_OUT_DAY',
            travelType: TravelType.END_OF_DAY,
            foremanPersonId: body.foremanPersonId,
            date: body.date,
          }),
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'TravelSegment',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId,
          actorDisplay,
          diff: {
            foremanPersonId: body.foremanPersonId,
            date: body.date,
            startDatetime,
            endDatetime,
          },
        },
      });

      return created;
    });

    return reply.code(200).send({
      result: 'ACCEPT',
      warnings: [],
      travelSegment: travel,
    });
  });

  app.post('/api/travel/create', async (request, reply) => {
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
    const parsed = createTravelBodySchema.safeParse(request.body);
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

    if (endDatetime <= startDatetime) {
      return reply.code(400).send({
        error: {
          code: 'INVALID_DURATION',
          message: 'Travel segment end must be after start.',
          details: {},
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    if (crossesLocalMidnight(startDatetime, endDatetime, timezone)) {
      return reply.code(400).send({
        error: {
          code: 'CROSSES_MIDNIGHT',
          message: 'Travel segment must not cross local midnight.',
          details: {},
        },
      });
    }

    const foreman = await deps.prisma.resource.findFirst({
      where: {
        id: body.foremanPersonId,
        deletedAt: null,
        resourceType: 'PERSON',
        isForeman: true,
      },
      select: { id: true },
    });
    if (!foreman) {
      return reply.code(404).send({
        error: {
          code: 'FOREMAN_NOT_FOUND',
          message: 'Foreman not found.',
          details: {},
        },
      });
    }

    if (body.relatedJobId) {
      const relatedJob = await deps.prisma.job.findFirst({
        where: {
          id: body.relatedJobId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!relatedJob) {
        return reply.code(404).send({
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'Related job not found.',
            details: {},
          },
        });
      }
    }

    const overlappingTravel = await deps.prisma.travelSegment.findFirst({
      where: {
        foremanPersonId: body.foremanPersonId,
        deletedAt: null,
        startDatetime: { lt: endDatetime },
        endDatetime: { gt: startDatetime },
      },
      select: { id: true },
    });
    if (overlappingTravel) {
      return reply.code(409).send({
        error: {
          code: 'TRAVEL_OVERLAP_CONFLICT',
          message: 'Travel segment overlaps an existing travel segment.',
          details: {},
        },
      });
    }

    const localServiceDate = localDateIso(startDatetime, timezone);
    const serviceDate = dateOnlyToUtc(localServiceDate);

    const travelSegment = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.travelSegment.create({
        data: {
          foremanPersonId: body.foremanPersonId,
          relatedJobId: body.relatedJobId ?? null,
          serviceDate,
          startDatetime,
          endDatetime,
          travelType: body.travelType,
          source: SegmentSource.MANUAL,
          notes: body.notes,
          createdByUserId: actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'TravelSegment',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId,
          actorDisplay,
          diff: {
            foremanPersonId: created.foremanPersonId,
            relatedJobId: created.relatedJobId,
            serviceDate: localServiceDate,
            startDatetime: created.startDatetime,
            endDatetime: created.endDatetime,
            travelType: created.travelType,
            notes: created.notes,
          },
        },
      });

      return created;
    });

    return reply.code(201).send({ travelSegment });
  });
}
