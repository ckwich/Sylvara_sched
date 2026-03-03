import {
  Prisma,
  PreferredChannel,
  SegmentSource,
  SegmentType,
  TravelType,
  type PrismaClient,
} from '@prisma/client';
import { resolveAnchorMinute } from '@sylvara/db';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  isUnauthenticatedError,
  requireActorUserId,
  UNAUTHENTICATED_ERROR,
} from '../http/actor.js';
import {
  findFirstFittingStartMinute,
  findStartAtClickedTime,
  minutesFromEstimatedHoursRoundedToTen,
  reject,
  requirementWarnings,
} from '../scheduling/availability.js';
import {
  isIntervalInsideWindow,
  parseCustomerAvailabilityWindow,
} from '../scheduling/customer-window.js';
import { computeScheduledEffectiveHours, deriveJobState } from '../scheduling/job-state.js';
import type { MinuteWindow } from '../scheduling/types.js';
import { DateTime } from 'luxon';

const oneClickBodySchema = z.object({
  jobId: z.number().int().positive(),
  foremanPersonId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  homeBaseId: z.number().int().positive().optional(),
  requestedStartMinute: z.number().int().min(0).max(1439).optional(),
  includeStartOfDayTravel: z.boolean().optional().default(false),
});

const closeOutBodySchema = z.object({
  foremanPersonId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().positive(),
});

const preferredChannelsSchema = z.object({
  channels: z.array(z.nativeEnum(PreferredChannel)).max(3),
});

const createSegmentBodySchema = z.object({
  jobId: z.number().int().positive(),
  rosterId: z.number().int().positive(),
  startDatetime: z.string().datetime({ offset: true }),
  endDatetime: z.string().datetime({ offset: true }),
  segmentType: z.nativeEnum(SegmentType).optional().default(SegmentType.PRIMARY),
  scheduledHoursOverride: z.number().positive().optional(),
  notes: z.string().optional(),
});

const updateSegmentBodySchema = z.object({
  startDatetime: z.string().datetime({ offset: true }).optional(),
  endDatetime: z.string().datetime({ offset: true }).optional(),
  scheduledHoursOverride: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

type AppDeps = {
  prisma: PrismaClient;
};

function dateOnlyToUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function localDayBoundsUtc(localDate: string, timezone: string): { startUtc: Date; endUtc: Date } {
  const start = DateTime.fromISO(localDate, { zone: timezone }).startOf('day');
  const end = start.plus({ days: 1 });
  return { startUtc: start.toUTC().toJSDate(), endUtc: end.toUTC().toJSDate() };
}

function minuteOfLocalDate(value: Date, timezone: string): number {
  const local = DateTime.fromJSDate(value, { zone: 'utc' }).setZone(timezone);
  return local.hour * 60 + local.minute;
}

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

function localDateAtMinute(date: string, minute: number, timezone: string): Date {
  const local = DateTime.fromISO(date, { zone: timezone })
    .startOf('day')
    .plus({ minutes: minute });
  return local.toUTC().toJSDate();
}

function crossesLocalMidnight(start: Date, end: Date, timezone: string): boolean {
  const localStart = DateTime.fromJSDate(start, { zone: 'utc' }).setZone(timezone);
  const localEnd = DateTime.fromJSDate(end, { zone: 'utc' }).setZone(timezone);
  return localStart.toISODate() !== localEnd.toISODate();
}

function localDateIso(value: Date, timezone: string): string {
  return DateTime.fromJSDate(value, { zone: 'utc' }).setZone(timezone).toISODate() ?? '';
}

function isTenMinuteBoundary(value: Date, timezone: string): boolean {
  const local = DateTime.fromJSDate(value, { zone: 'utc' }).setZone(timezone);
  return local.minute % 10 === 0 && local.second === 0 && local.millisecond === 0;
}

function parseIsoDatetime(value: string): Date | null {
  const parsed = DateTime.fromISO(value, { setZone: true });
  if (!parsed.isValid) {
    return null;
  }
  return parsed.toUTC().toJSDate();
}

async function getDerivedJobState(input: {
  prisma: PrismaClient;
  jobId: number;
  timezone: string;
}) {
  const job = await input.prisma.job.findUnique({
    where: { id: input.jobId },
    select: {
      id: true,
      completedDate: true,
      estimateHoursCurrent: true,
    },
  });

  if (!job) {
    return null;
  }

  const activeSegments = await input.prisma.scheduleSegment.findMany({
    where: {
      jobId: input.jobId,
      deletedAt: null,
      segmentRosterLink: {
        isNot: null,
      },
    },
    select: {
      startDatetime: true,
      endDatetime: true,
      scheduledHoursOverride: true,
    },
  });

  const scheduledEffectiveHours = computeScheduledEffectiveHours({
    timezone: input.timezone,
    segments: activeSegments,
  });

  return {
    jobId: input.jobId,
    scheduledEffectiveHours: scheduledEffectiveHours.toString(),
    state: deriveJobState({
      completedDate: job.completedDate,
      estimateHoursCurrent: job.estimateHoursCurrent,
      scheduledEffectiveHours,
    }),
  };
}

export function registerSchedulingRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/schedule/one-click-attempt', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

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
    const timezone = orgSettings?.companyTimezone ?? 'America/New_York';
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

    // Authoritative anchor order:
    // 1) roster preferred start
    // 2) earliest event start on that day
    // 3) home base opening
    // 4) org operating start
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

  app.post('/api/travel/close-out-day', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

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
    const timezone = orgSettings?.companyTimezone ?? 'America/New_York';
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

      await tx.activityLog.create({
        data: {
          entityType: 'TravelSegment',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId,
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

  app.post('/api/schedule-segments', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

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

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? 'America/New_York';
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
      deps.prisma.job.findUnique({ where: { id: body.jobId }, select: { id: true } }),
      deps.prisma.foremanDayRoster.findUnique({
        where: { id: body.rosterId },
        select: { id: true, date: true },
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
    if (!roster) {
      return reply.code(404).send({
        error: {
          code: 'ROSTER_NOT_FOUND',
          message: 'Roster not found.',
          details: {},
        },
      });
    }

    const rosterLocalDate = DateTime.fromJSDate(roster.date, { zone: 'utc' }).toISODate();
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

    return reply.code(200).send({
      segment: created,
      jobState,
    });
  });

  app.patch('/api/schedule-segments/:segmentId', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

    const paramsSchema = z.object({ segmentId: z.coerce.number().int().positive() });
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

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? 'America/New_York';
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
      const rosterLocalDate = DateTime.fromJSDate(existing.segmentRosterLink.roster.date, { zone: 'utc' }).toISODate();
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
    }

    const previousDurationMinutes = Math.round(
      DateTime.fromJSDate(existing.endDatetime, { zone: 'utc' })
        .setZone(timezone)
        .diff(DateTime.fromJSDate(existing.startDatetime, { zone: 'utc' }).setZone(timezone), 'minutes').minutes,
    );
    const nextDurationMinutes = Math.round(
      DateTime.fromJSDate(nextEnd, { zone: 'utc' })
        .setZone(timezone)
        .diff(DateTime.fromJSDate(nextStart, { zone: 'utc' }).setZone(timezone), 'minutes').minutes,
    );
    const movedOnly =
      previousDurationMinutes === nextDurationMinutes &&
      (existing.startDatetime.getTime() !== nextStart.getTime() ||
        existing.endDatetime.getTime() !== nextEnd.getTime());

    const eventType =
      existing.startDatetime.getTime() === nextStart.getTime() &&
      existing.endDatetime.getTime() === nextEnd.getTime()
        ? 'SEGMENT_UPDATED'
        : movedOnly
          ? 'SEGMENT_MOVED'
          : 'SEGMENT_RESIZED';

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

      await tx.scheduleEvent.create({
        data: {
          jobId: existing.jobId,
          eventType,
          source: 'USER_ACTION',
          fromAt: existing.startDatetime,
          toAt: nextStart,
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
          diff: {
            oldStart: existing.startDatetime,
            oldEnd: existing.endDatetime,
            newStart: nextStart,
            newEnd: nextEnd,
          },
        },
      });

      return segment;
    });

    const jobState = await getDerivedJobState({
      prisma: deps.prisma,
      jobId: existing.jobId,
      timezone,
    });

    return reply.code(200).send({
      segment: updated,
      jobState,
    });
  });

  app.delete('/api/schedule-segments/:segmentId', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

    const paramsSchema = z.object({ segmentId: z.coerce.number().int().positive() });
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

    const deletedAt = new Date();
    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.scheduleSegment.update({
        where: { id: existing.id },
        data: { deletedAt },
      });

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
          diff: {
            deletedAt,
          },
        },
      });
    });

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? 'America/New_York';
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

  app.post('/api/jobs/:jobId/preferred-channels', async (request, reply) => {
    let actorUserId: number;
    try {
      actorUserId = await requireActorUserId(deps.prisma, request);
    } catch (error) {
      if (isUnauthenticatedError(error)) {
        return reply.code(401).send(UNAUTHENTICATED_ERROR);
      }
      throw error;
    }

    const paramsSchema = z.object({
      jobId: z.coerce.number().int().positive(),
    });
    const params = paramsSchema.safeParse(request.params);
    const body = preferredChannelsSchema.safeParse(request.body);

    if (!params.success || !body.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid preferred channels payload.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            body: body.success ? undefined : body.error.flatten(),
          },
        },
      });
    }

    await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.jobPreferredChannel.deleteMany({
        where: { jobId: params.data.jobId },
      });

      if (body.data.channels.length > 0) {
        await tx.jobPreferredChannel.createMany({
          data: body.data.channels.map((channel) => ({
            jobId: params.data.jobId,
            channel,
          })),
        });
      }

      await tx.activityLog.create({
        data: {
          entityType: 'Job',
          entityId: params.data.jobId,
          actionType: 'UPDATED',
          actorUserId,
          diff: {
            preferredChannels: body.data.channels,
          },
        },
      });
    });

    return reply.code(200).send({
      ok: true,
      channels: body.data.channels,
    });
  });
}
