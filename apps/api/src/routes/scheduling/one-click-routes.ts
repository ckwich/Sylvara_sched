import { Prisma, SegmentType } from '@prisma/client';
import { resolveAnchorMinute } from '@sylvara/db';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UNAUTHENTICATED_ERROR } from '../../http/actor.js';
import { requireActor, requireMutationPermission } from '../../http/route-helpers.js';
import {
  findFirstFittingStartMinute,
  findStartAtClickedTime,
  minutesFromEstimatedHoursRoundedToTen,
  reject,
  requirementWarnings,
} from '../../scheduling/availability.js';
import {
  isIntervalInsideWindow,
  parseCustomerAvailabilityWindow,
} from '../../scheduling/customer-window.js';
import type { MinuteWindow } from '../../scheduling/types.js';
import {
  crossesLocalMidnight,
  dateOnlyToUtc,
  localDateAtMinute,
  localDayBoundsUtc,
  minuteOfLocalDate,
  type AppDeps,
  uuidSchema,
} from './_shared.js';

const oneClickBodySchema = z.object({
  jobId: uuidSchema,
  foremanPersonId: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  homeBaseId: uuidSchema.optional(),
  requestedStartMinute: z.number().int().min(0).max(1439).optional(),
  includeStartOfDayTravel: z.boolean().optional().default(false),
});

function splitToLocalDayIntervals(input: {
  segments: Array<{ startDatetime: Date; endDatetime: Date }>;
  timezone: string;
  dayStartUtc: Date;
  dayEndUtc: Date;
}): MinuteWindow[] {
  const dayStartMs = input.dayStartUtc.getTime();
  const dayEndMs = input.dayEndUtc.getTime();

  return input.segments.flatMap((segment) => {
    const startMs = Math.max(segment.startDatetime.getTime(), dayStartMs);
    const endMs = Math.min(segment.endDatetime.getTime(), dayEndMs);
    if (endMs <= startMs) {
      return [];
    }

    const clippedStart = new Date(startMs);
    const clippedEnd = new Date(endMs);
    return [
      {
        startMinute: minuteOfLocalDate(clippedStart, input.timezone),
        endMinute: minuteOfLocalDate(clippedEnd, input.timezone),
      },
    ];
  });
}

export function registerOneClickRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/schedule/one-click-attempt', async (request, reply) => {
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
    const parsed = oneClickBodySchema.safeParse(request.body);
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

    const job = await deps.prisma.job.findUnique({
      where: { id: body.jobId },
      include: {
        requirements: true,
        jobBlockers: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!job) {
      return reply.code(404).send(reject('JOB_NOT_FOUND', 'Job not found.'));
    }

    if (job.jobBlockers.length > 0) {
      return reply.code(200).send(reject('ACTIVE_BLOCKER', 'Job has active blockers.'));
    }

    if (!job.estimateHoursCurrent || new Prisma.Decimal(job.estimateHoursCurrent).lte(0)) {
      return reply
        .code(200)
        .send(reject('NO_CONTIGUOUS_SLOT_AT_CLICK', 'Job estimate hours are required for one-click scheduling.'));
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const { startUtc: dayStartUtc, endUtc: dayEndUtc } = localDayBoundsUtc(body.date, timezone);

    let roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: body.foremanPersonId,
        date: serviceDate,
      },
      include: {
        homeBase: true,
      },
    });

    if (!roster) {
      if (!body.homeBaseId) {
        return reply.code(200).send(reject('HOME_BASE_REQUIRED', 'homeBaseId is required to create roster.'));
      }

      roster = await deps.prisma.foremanDayRoster.create({
        data: {
          foremanPersonId: body.foremanPersonId,
          date: serviceDate,
          homeBaseId: body.homeBaseId,
          createdByUserId: actorUserId,
        },
        include: {
          homeBase: true,
        },
      });

      await deps.prisma.activityLog.create({
        data: {
          entityType: 'ForemanDayRoster',
          entityId: roster.id,
          actionType: 'CREATED',
          actorUserId,
          actorDisplay,
          diff: {
            foremanPersonId: body.foremanPersonId,
            date: body.date,
            homeBaseId: body.homeBaseId,
          },
        },
      });
    }

    const [travel, onsite] = await Promise.all([
      deps.prisma.travelSegment.findMany({
        where: {
          foremanPersonId: body.foremanPersonId,
          deletedAt: null,
          startDatetime: { lt: dayEndUtc },
          endDatetime: { gt: dayStartUtc },
        },
        select: {
          startDatetime: true,
          endDatetime: true,
        },
      }),
      deps.prisma.scheduleSegment.findMany({
        where: {
          deletedAt: null,
          segmentRosterLink: {
            is: {
              roster: {
                foremanPersonId: body.foremanPersonId,
                date: serviceDate,
              },
            },
          },
          startDatetime: { lt: dayEndUtc },
          endDatetime: { gt: dayStartUtc },
        },
        select: {
          startDatetime: true,
          endDatetime: true,
        },
      }),
    ]);

    const occupied = [
      ...splitToLocalDayIntervals({
        segments: travel,
        timezone,
        dayStartUtc,
        dayEndUtc,
      }),
      ...splitToLocalDayIntervals({
        segments: onsite,
        timezone,
        dayStartUtc,
        dayEndUtc,
      }),
    ];
    const earliestEvent = occupied.length > 0 ? Math.min(...occupied.map((v) => v.startMinute)) : null;

    const rosterPreferred = resolveAnchorMinute({
      minute: roster.preferredStartMinute,
      legacyTime: roster.preferredStartTime,
    });
    const homeBaseOpening = resolveAnchorMinute({
      minute: roster.homeBase?.openingMinute,
      legacyTime: roster.homeBase?.openingTime,
    });
    const operatingStart = resolveAnchorMinute({
      minute: orgSettings?.operatingStartMinute,
      legacyTime: orgSettings?.operatingStartTime,
    });

    const anchorMinute = rosterPreferred ?? earliestEvent ?? homeBaseOpening ?? operatingStart ?? 0;
    const durationMinutes = minutesFromEstimatedHoursRoundedToTen(new Prisma.Decimal(job.estimateHoursCurrent));

    if (body.requestedStartMinute !== undefined) {
      const snapped = Math.floor(body.requestedStartMinute / 10) * 10;
      if (snapped + durationMinutes > 1440) {
        return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'Segment would cross local midnight.'));
      }
    }

    const startMinute =
      body.requestedStartMinute !== undefined
        ? findStartAtClickedTime({
            occupied,
            clickedMinute: body.requestedStartMinute,
            durationMinutes,
          })
        : findFirstFittingStartMinute({
            occupied,
            anchorMinute,
            durationMinutes,
          });

    if (startMinute === null) {
      return reply.code(200).send(reject('NO_CONTIGUOUS_SLOT_AT_CLICK', 'No contiguous slot can fit this job.'));
    }

    const endMinute = startMinute + durationMinutes;
    if (endMinute > 1440) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'Segment would cross midnight.'));
    }

    const parsedWindow = parseCustomerAvailabilityWindow(job.availabilityNotes);
    if (parsedWindow && !isIntervalInsideWindow({ startMinute, endMinute }, parsedWindow)) {
      return reply
        .code(200)
        .send(reject('CUSTOMER_WINDOW_CONFLICT', 'Proposed segment is outside customer availability window.'));
    }

    const warnings = requirementWarnings(job.requirements.map((req: { status: string }) => req.status));
    if (!parsedWindow) {
      warnings.push({
        code: 'CUSTOMER_WINDOW_NOT_CONFIGURED',
        message: 'Customer availability window is not configured.',
      });
    }

    const startDatetime = localDateAtMinute(body.date, startMinute, timezone);
    const endDatetime = localDateAtMinute(body.date, endMinute, timezone);
    if (crossesLocalMidnight(startDatetime, endDatetime, timezone)) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'Segment would cross local midnight.'));
    }

    const result = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const segment = await tx.scheduleSegment.create({
        data: {
          jobId: job.id,
          segmentType: SegmentType.PRIMARY,
          startDatetime,
          endDatetime,
          createdByUserId: actorUserId,
        },
      });

      await tx.segmentRosterLink.create({
        data: {
          scheduleSegmentId: segment.id,
          rosterId: roster.id,
          createdByUserId: actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: segment.id,
          actionType: 'SEGMENT_ADDED',
          actorUserId,
          actorDisplay,
          diff: {
            jobId: job.id,
            startDatetime,
            endDatetime,
            rosterId: roster.id,
          },
        },
      });

      return segment;
    });

    return reply.code(200).send({
      result: 'ACCEPT',
      warnings,
      segment: result,
    });
  });
}
