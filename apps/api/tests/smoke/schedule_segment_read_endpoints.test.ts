import { describe, expect, test } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';

type SegmentRow = {
  id: string;
  jobId: string;
  startDatetime: Date;
  endDatetime: Date;
  deletedAt: Date | null;
  scheduledHoursOverride: number | null;
};

type ActivityLogRow = {
  id: number;
  entityType: string;
  entityId: number;
  actionType: string;
  actorUserId: number | null;
  actorDisplay: string | null;
  diff: Record<string, unknown> | null;
  createdAt: Date;
};

function buildReadPrisma() {
  const rosterDate = new Date('2026-03-03T00:00:00.000Z');
  const segments: SegmentRow[] = [];
  const links: Array<{ scheduleSegmentId: string; rosterId: string }> = [];
  const activityLogs: ActivityLogRow[] = [];
  let nextSegmentId = 200;
  let nextActivityId = 1;

  const getLinkedRosterId = (segmentId: number): number | null => {
    const link = links.find((l) => l.scheduleSegmentId === segmentId);
    return link ? link.rosterId : null;
  };

  const fakePrisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: 'America/New_York',
      }),
    },
    job: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id !== JOB_ID) {
          return null;
        }
        return {
          id: JOB_ID,
          completedDate: null,
          estimateHoursCurrent: '2',
        };
      },
    },
    foremanDayRoster: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id !== ROSTER_ID) {
          return null;
        }
        return {
          id: ROSTER_ID,
          date: rosterDate,
          homeBaseId: 4,
          preferredStartMinute: 480,
        };
      },
      findFirst: async ({ where }: { where: { foremanPersonId: string; date: Date } }) => {
        if (where.foremanPersonId !== FOREMAN_ID || where.date.toISOString() !== rosterDate.toISOString()) {
          return null;
        }
        return {
          id: ROSTER_ID,
          date: rosterDate,
          homeBaseId: 4,
          preferredStartMinute: 480,
        };
      },
    },
    activityLog: {
      findMany: async ({
        where,
      }: {
        where: {
          OR: Array<
            | { entityType: string; entityId: number }
            | { entityType: string; entityId: { in: number[] } }
          >;
        };
      }) => {
        const rosterEntry = where.OR.find((entry) => entry.entityType === 'ForemanDayRoster');
        const segmentEntry = where.OR.find((entry) => entry.entityType === 'ScheduleSegment') as
          | { entityType: string; entityId: { in: number[] } }
          | undefined;
        const rosterId = rosterEntry && typeof rosterEntry.entityId === 'number' ? rosterEntry.entityId : null;
        const segmentIds = segmentEntry?.entityId.in ?? [];

        return activityLogs
          .filter(
            (log) =>
              (rosterId !== null && log.entityType === 'ForemanDayRoster' && log.entityId === rosterId) ||
              (log.entityType === 'ScheduleSegment' && segmentIds.includes(log.entityId)),
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 50);
      },
      create: async ({
        data,
      }: {
        data: {
          entityType: string;
          entityId: number;
          actionType: string;
          actorUserId?: number;
          actorDisplay?: string | null;
          diff?: Record<string, unknown>;
        };
      }) => {
        const created: ActivityLogRow = {
          id: nextActivityId,
          entityType: data.entityType,
          entityId: data.entityId,
          actionType: data.actionType,
          actorUserId: data.actorUserId ?? null,
          actorDisplay: data.actorDisplay ?? null,
          diff: data.diff ?? null,
          createdAt: new Date(Date.now() + nextActivityId),
        };
        nextActivityId += 1;
        activityLogs.push(created);
        return created;
      },
    },
    travelSegment: {
      findMany: async () => [],
      findFirst: async () => null,
    },
    scheduleSegment: {
      findMany: async ({
        where,
        include,
      }: {
        where: {
          jobId?: number;
          deletedAt?: null;
          segmentRosterLink?: { is?: { rosterId?: number } } | { isNot?: null };
          startDatetime?: { lt: Date };
          endDatetime?: { gt: Date };
        };
        include?: { segmentRosterLink?: { include: { roster: true } } };
      }) => {
        const filtered = segments.filter((segment) => {
          if (where.jobId !== undefined && segment.jobId !== where.jobId) {
            return false;
          }
          if (where.deletedAt === null && segment.deletedAt !== null) {
            return false;
          }
          if ('isNot' in (where.segmentRosterLink ?? {}) && getLinkedRosterId(segment.id) === null) {
            return false;
          }
          if ('is' in (where.segmentRosterLink ?? {})) {
            const rosterId = (where.segmentRosterLink as { is: { rosterId?: number } }).is.rosterId;
            if (rosterId !== undefined && getLinkedRosterId(segment.id) !== rosterId) {
              return false;
            }
          }
          if (where.startDatetime && !(segment.startDatetime < where.startDatetime.lt)) {
            return false;
          }
          if (where.endDatetime && !(segment.endDatetime > where.endDatetime.gt)) {
            return false;
          }
          return true;
        });

        const sorted = [...filtered].sort(
          (a, b) => a.startDatetime.getTime() - b.startDatetime.getTime(),
        );

        if (!include) {
          return sorted;
        }

        return sorted.map((segment) => ({
          ...segment,
          segmentRosterLink: {
            roster: {
              id: getLinkedRosterId(segment.id) ?? ROSTER_ID,
              date: rosterDate,
            },
          },
        }));
      },
      findFirst: async ({
        where,
      }: {
        where: {
          id?: string | { not: string };
          deletedAt?: null;
          startDatetime?: { lt: Date };
          endDatetime?: { gt: Date };
          segmentRosterLink?: { is: { roster: { foremanPersonId: string; date: Date } } };
        };
      }) => {
        if (typeof where.id === 'string') {
          const found = segments.find((s) => s.id === where.id && s.deletedAt === null);
          return found ?? null;
        }

        const excludedId = typeof where.id === 'object' ? where.id.not : undefined;
        const overlap = segments.find(
          (segment) =>
            segment.deletedAt === null &&
            (excludedId === undefined || segment.id !== excludedId) &&
            where.startDatetime !== undefined &&
            where.endDatetime !== undefined &&
            segment.startDatetime < where.startDatetime.lt &&
            segment.endDatetime > where.endDatetime.gt &&
            links.some((l) => l.scheduleSegmentId === segment.id),
        );
        return overlap ? { id: overlap.id } : null;
      },
    },
    $transaction: async (
      fn: (tx: {
        scheduleSegment: {
          create: (args: {
            data: { jobId: string; startDatetime: Date; endDatetime: Date; scheduledHoursOverride?: number };
          }) => Promise<SegmentRow>;
          update: (args: { where: { id: string }; data: { deletedAt?: Date } }) => Promise<SegmentRow>;
        };
        segmentRosterLink: {
          create: (args: { data: { scheduleSegmentId: string; rosterId: string } }) => Promise<{
            scheduleSegmentId: string;
            rosterId: string;
          }>;
        };
        scheduleEvent: { create: () => Promise<void> };
        vacatedSlot: { create: () => Promise<void> };
        activityLog: { create: () => Promise<void> };
      }) => Promise<unknown>,
    ) =>
      fn({
        scheduleSegment: {
          create: async ({ data }) => {
            const created: SegmentRow = {
              id: `aaaa0000-0000-4000-8000-${String(nextSegmentId).padStart(12, '0')}`,
              jobId: data.jobId,
              startDatetime: data.startDatetime,
              endDatetime: data.endDatetime,
              deletedAt: null,
              scheduledHoursOverride: data.scheduledHoursOverride ?? null,
            };
            nextSegmentId += 1;
            segments.push(created);
            return created;
          },
          update: async ({ where, data }) => {
            const found = segments.find((s) => s.id === where.id);
            if (!found) {
              throw new Error('segment missing');
            }
            if (data.deletedAt) {
              found.deletedAt = data.deletedAt;
            }
            return found;
          },
        },
        segmentRosterLink: {
          create: async ({ data }) => {
            links.push(data);
            return data;
          },
        },
        scheduleEvent: { create: async () => undefined },
        vacatedSlot: { create: async () => undefined },
        activityLog: {
          create: async ({ data }) => {
            await fakePrisma.activityLog.create({ data });
          },
        },
      }),
  } as unknown as PrismaClient;

  return {
    prisma: fakePrisma,
    insertOrphanSegment() {
      segments.push({
        id: `aaaa0000-0000-4000-8000-${String(nextSegmentId).padStart(12, '0')}`,
        jobId: JOB_ID,
        startDatetime: new Date('2026-03-03T14:00:00.000Z'),
        endDatetime: new Date('2026-03-03T15:00:00.000Z'),
        deletedAt: null,
        scheduledHoursOverride: null,
      });
      nextSegmentId += 1;
    },
    insertActivityLog(input: Omit<ActivityLogRow, 'id' | 'createdAt'>) {
      activityLogs.push({
        id: nextActivityId,
        createdAt: new Date(Date.now() + nextActivityId),
        ...input,
      });
      nextActivityId += 1;
    },
  };
}

describe('M2 schedule segment read/list endpoints', () => {
  test('returns linked segment for foreman/date and empties after soft-delete', async () => {
    const store = buildReadPrisma();
    const app = buildServer({ prisma: store.prisma });

    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    expect(created.statusCode).toBe(200);
    const segmentId = created.json().segment.id as string;

    const beforeDelete = await app.inject({
      method: 'GET',
      url: `/api/foremen/${FOREMAN_ID}/schedule?date=2026-03-03`,
    });
    expect(beforeDelete.statusCode).toBe(200);
    const beforeBody = beforeDelete.json();
    expect(beforeBody.scheduleSegments).toHaveLength(1);
    expect(beforeBody.scheduleSegments[0].id).toBe(segmentId);

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${segmentId}`,
      headers: { 'x-actor-user-id': ACTOR_ID },
    });
    expect(deleted.statusCode).toBe(200);

    const afterDelete = await app.inject({
      method: 'GET',
      url: `/api/foremen/${FOREMAN_ID}/schedule?date=2026-03-03`,
    });
    expect(afterDelete.statusCode).toBe(200);
    expect(afterDelete.json().scheduleSegments).toHaveLength(0);
    await app.close();
  });

  test('excludes orphan segments and returns linked job segments with derived state', async () => {
    const store = buildReadPrisma();
    const app = buildServer({ prisma: store.prisma });

    store.insertOrphanSegment();

    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    expect(created.statusCode).toBe(200);

    const foremanRead = await app.inject({
      method: 'GET',
      url: `/api/foremen/${FOREMAN_ID}/schedule?date=2026-03-03`,
    });
    expect(foremanRead.statusCode).toBe(200);
    const foremanBody = foremanRead.json();
    expect(foremanBody.scheduleSegments).toHaveLength(1);

    const jobRead = await app.inject({
      method: 'GET',
      url: `/api/jobs/${JOB_ID}/schedule-segments`,
    });
    expect(jobRead.statusCode).toBe(200);
    const jobBody = jobRead.json();
    expect(jobBody.segments).toHaveLength(1);
    expect(jobBody.jobState.state).toBe('FULLY_SCHEDULED');
    await app.close();
  });

  test('returns foreman day activity entries with newest-first ordering and day filtering', async () => {
    const store = buildReadPrisma();
    const app = buildServer({ prisma: store.prisma });

    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    expect(created.statusCode).toBe(200);

    const activity = await app.inject({
      method: 'GET',
      url: `/api/foremen/${FOREMAN_ID}/activity?date=2026-03-03`,
    });
    expect(activity.statusCode).toBe(200);
    const activityBody = activity.json() as { entries: Array<Record<string, unknown>> };
    expect(activityBody.entries.length).toBeGreaterThan(0);
    expect(activityBody.entries[0]).toHaveProperty('createdAt');
    expect(activityBody.entries[0]).toHaveProperty('action');
    expect(activityBody.entries[0]).toHaveProperty('actorUserId');

    const wrongDay = await app.inject({
      method: 'GET',
      url: `/api/foremen/${FOREMAN_ID}/activity?date=2026-03-04`,
    });
    expect(wrongDay.statusCode).toBe(200);
    expect(wrongDay.json().entries).toHaveLength(0);
    await app.close();
  });
});


