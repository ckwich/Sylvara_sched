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

export function registerSchedulingRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post('/api/schedule/one-click-attempt', async (request, reply) => {
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
          createdByUserId: 1,
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
          actorUserId: 1,
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
          createdByUserId: 1,
        },
      });

      await tx.segmentRosterLink.create({
        data: {
          scheduleSegmentId: segment.id,
          rosterId: roster.id,
          createdByUserId: 1,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'ScheduleSegment',
          entityId: segment.id,
          actionType: 'SEGMENT_ADDED',
          actorUserId: 1,
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
          createdByUserId: 1,
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'TravelSegment',
          entityId: created.id,
          actionType: 'CREATED',
          actorUserId: 1,
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

  app.post('/api/jobs/:jobId/preferred-channels', async (request, reply) => {
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
          actorUserId: 1,
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
