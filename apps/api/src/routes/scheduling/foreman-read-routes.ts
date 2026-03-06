import { Prisma } from '@prisma/client';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { dateOnlyToUtc, localDayBoundsUtc, type AppDeps, uuidSchema } from './_shared.js';

const foremanScheduleQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includeTravel: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value === 'true'),
});

const foremanActivityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function extractNumericDiffValue(diff: Prisma.JsonValue | null, key: string): number | null {
  if (!diff || typeof diff !== 'object' || Array.isArray(diff)) {
    return null;
  }
  const value = (diff as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
}

export function registerForemanReadRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/foremen/:foremanPersonId/schedule', async (request, reply) => {
    const paramsSchema = z.object({ foremanPersonId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    const query = foremanScheduleQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid schedule query.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            query: query.success ? undefined : query.error.flatten(),
          },
        },
      });
    }

    const orgSettings = await deps.prisma.orgSettings.findFirst();
    const timezone = orgSettings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const serviceDate = dateOnlyToUtc(query.data.date);
    const { startUtc: dayStartUtc, endUtc: dayEndUtc } = localDayBoundsUtc(query.data.date, timezone);

    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: params.data.foremanPersonId,
        date: serviceDate,
      },
    });

    if (!roster) {
      return reply.code(200).send({
        roster: null,
        scheduleSegments: [],
        travelSegments: query.data.includeTravel ? [] : undefined,
      });
    }

    const scheduleSegments = await deps.prisma.scheduleSegment.findMany({
      where: {
        deletedAt: null,
        segmentRosterLink: {
          is: {
            rosterId: roster.id,
          },
        },
        startDatetime: { lt: dayEndUtc },
        endDatetime: { gt: dayStartUtc },
      },
      orderBy: { startDatetime: 'asc' },
    });

    const travelSegments = query.data.includeTravel
      ? await deps.prisma.travelSegment.findMany({
          where: {
            foremanPersonId: params.data.foremanPersonId,
            deletedAt: null,
            startDatetime: { lt: dayEndUtc },
            endDatetime: { gt: dayStartUtc },
          },
          orderBy: { startDatetime: 'asc' },
        })
      : undefined;

    return reply.code(200).send({
      roster,
      scheduleSegments,
      travelSegments,
    });
  });

  app.get('/api/foremen/:foremanPersonId/activity', async (request, reply) => {
    const paramsSchema = z.object({ foremanPersonId: uuidSchema });
    const params = paramsSchema.safeParse(request.params);
    const query = foremanActivityQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid foreman activity request.',
          details: {
            params: params.success ? undefined : params.error.flatten(),
            query: query.success ? undefined : query.error.flatten(),
          },
        },
      });
    }

    const serviceDate = dateOnlyToUtc(query.data.date);
    const roster = await deps.prisma.foremanDayRoster.findFirst({
      where: {
        foremanPersonId: params.data.foremanPersonId,
        date: serviceDate,
      },
      select: {
        id: true,
      },
    });
    if (!roster) {
      return reply.code(200).send({ entries: [] });
    }

    const linkedSegments = await deps.prisma.scheduleSegment.findMany({
      where: {
        segmentRosterLink: {
          is: {
            rosterId: roster.id,
          },
        },
      },
      select: {
        id: true,
        jobId: true,
      },
    });
    const linkedSegmentIds = linkedSegments.map((segment) => segment.id);
    const jobIdBySegmentId = new Map(linkedSegments.map((segment) => [segment.id, segment.jobId]));

    const logs = await deps.prisma.activityLog.findMany({
      where: {
        OR: [
          {
            entityType: 'ForemanDayRoster',
            entityId: roster.id,
          },
          ...(linkedSegmentIds.length > 0
            ? [
                {
                  entityType: 'ScheduleSegment',
                  entityId: { in: linkedSegmentIds },
                },
              ]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        createdAt: true,
        actionType: true,
        actorDisplay: true,
        actorUserId: true,
        entityType: true,
        entityId: true,
        diff: true,
      },
    });

    return reply.code(200).send({
      entries: logs.map((log) => {
        const isSegment = log.entityType === 'ScheduleSegment';
        const segmentId = isSegment ? log.entityId : null;
        const jobIdFromMap = segmentId ? jobIdBySegmentId.get(segmentId) ?? null : null;
        return {
          createdAt: log.createdAt,
          action: log.actionType,
          actorDisplay: log.actorDisplay,
          actorUserId: log.actorUserId,
          segmentId,
          jobId: jobIdFromMap ?? extractNumericDiffValue(log.diff, 'jobId'),
        };
      }),
    });
  });
}
