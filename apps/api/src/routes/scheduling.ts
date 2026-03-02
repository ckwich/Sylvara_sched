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
  minutesFromEstimatedHoursRoundedToTen,
  reject,
  requirementWarnings,
} from '../scheduling/availability.js';
import {
  isIntervalInsideWindow,
  parseCustomerAvailabilityWindow,
} from '../scheduling/customer-window.js';
import type { MinuteWindow } from '../scheduling/types.js';

const oneClickBodySchema = z.object({
  jobId: z.number().int().positive(),
  foremanPersonId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

function minuteOfUtcDate(value: Date): number {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function utcDateAtMinute(date: string, minute: number): Date {
  const start = dateOnlyToUtc(date);
  return new Date(start.getTime() + minute * 60_000);
}

function occupiedFromSegments(segments: Array<{ startDatetime: Date; endDatetime: Date }>): MinuteWindow[] {
  return segments.map((segment) => ({
    startMinute: minuteOfUtcDate(segment.startDatetime),
    endMinute: minuteOfUtcDate(segment.endDatetime),
  }));
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

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: body.foremanPersonId,
        date: serviceDate,
      },
      include: {
        homeBase: true,
      },
    });

    if (!roster) {
      return reply.code(200).send(reject('ROSTER_NOT_FOUND', 'No foreman roster exists for that date.'));
    }

    const [travel, onsite, orgSettings] = await Promise.all([
      deps.prisma.travelSegment.findMany({
        where: {
          foremanPersonId: body.foremanPersonId,
          serviceDate,
          deletedAt: null,
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
              rosterId: roster.id,
            },
          },
        },
        select: {
          startDatetime: true,
          endDatetime: true,
        },
      }),
      deps.prisma.orgSettings.findFirst(),
    ]);

    const occupied = [...occupiedFromSegments(travel), ...occupiedFromSegments(onsite)];
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

    const startMinute = findFirstFittingStartMinute({
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

    const startDatetime = utcDateAtMinute(body.date, startMinute);
    const endDatetime = utcDateAtMinute(body.date, endMinute);

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

    const existingEnd = await deps.prisma.travelSegment.findFirst({
      where: {
        foremanPersonId: body.foremanPersonId,
        serviceDate,
        travelType: TravelType.END_OF_DAY,
        deletedAt: null,
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
        endDatetime: true,
      },
    });

    if (segments.length === 0) {
      return reply.code(200).send(reject('NO_ONSITE_SEGMENTS', 'No onsite segments found for close out.'));
    }

    const latestEndMinute = Math.max(...segments.map((s: { endDatetime: Date }) => minuteOfUtcDate(s.endDatetime)));
    const endMinute = latestEndMinute + body.durationMinutes;

    if (endMinute > 1440) {
      return reply.code(200).send(reject('CROSSES_MIDNIGHT', 'END_OF_DAY travel would cross midnight.'));
    }

    const travel = await deps.prisma.travelSegment.create({
      data: {
        foremanPersonId: body.foremanPersonId,
        serviceDate,
        startDatetime: utcDateAtMinute(body.date, latestEndMinute),
        endDatetime: utcDateAtMinute(body.date, endMinute),
        travelType: TravelType.END_OF_DAY,
        source: SegmentSource.MANUAL,
        createdByUserId: 1,
      },
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
    });

    return reply.code(200).send({
      ok: true,
      channels: body.data.channels,
    });
  });
}
