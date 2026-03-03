import { describe, expect, test } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';

const TEST_TZ = 'America/New_York';

function localParts(iso: string, timeZone: string): { date: string; minute: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));

  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '0');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    minute: hour * 60 + minute,
  };
}

function buildCrudPrisma(): PrismaClient {
  const rosterDate = new Date('2026-03-03T00:00:00.000Z');
  const segments: Array<{
    id: number;
    jobId: number;
    startDatetime: Date;
    endDatetime: Date;
    deletedAt: Date | null;
    scheduledHoursOverride: number | null;
  }> = [];
  const links: Array<{ scheduleSegmentId: number; rosterId: number }> = [];
  let nextSegmentId = 100;

  const fake = {
    user: {
      findUnique: async ({ where }: { where: { id: number } }) =>
        where.id === 1 ? { id: 1 } : null,
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: TEST_TZ,
      }),
    },
    job: {
      findUnique: async ({ where }: { where: { id: number } }) => {
        if (where.id !== 10) {
          return null;
        }
        return {
          id: 10,
          completedDate: null,
          estimateHoursCurrent: '2',
        };
      },
    },
    foremanDayRoster: {
      findUnique: async ({ where }: { where: { id: number } }) => {
        if (where.id !== 99) {
          return null;
        }
        return {
          id: 99,
          date: rosterDate,
        };
      },
    },
    scheduleSegment: {
      findMany: async ({ where }: { where: { jobId?: number; deletedAt?: null } }) =>
        segments.filter(
          (s) =>
            (where.jobId === undefined || s.jobId === where.jobId) &&
            (where.deletedAt !== null || s.deletedAt === null) &&
            links.some((l) => l.scheduleSegmentId === s.id),
        ),
      findFirst: async ({ where }: { where: { id: number; deletedAt: null } }) => {
        const found = segments.find((s) => s.id === where.id && s.deletedAt === null);
        if (!found) {
          return null;
        }
        return {
          ...found,
          segmentRosterLink: {
            roster: {
              id: 99,
              date: rosterDate,
            },
          },
        };
      },
    },
    $transaction: async (
      fn: (tx: {
        scheduleSegment: {
          create: (args: {
            data: {
              jobId: number;
              startDatetime: Date;
              endDatetime: Date;
              scheduledHoursOverride?: number;
            };
          }) => Promise<{
            id: number;
            jobId: number;
            startDatetime: Date;
            endDatetime: Date;
            scheduledHoursOverride: number | null;
          }>;
          update: (args: {
            where: { id: number };
            data: {
              startDatetime?: Date;
              endDatetime?: Date;
              deletedAt?: Date;
              scheduledHoursOverride?: number | null;
            };
          }) => Promise<{
            id: number;
            jobId: number;
            startDatetime: Date;
            endDatetime: Date;
            scheduledHoursOverride: number | null;
            deletedAt: Date | null;
          }>;
        };
        segmentRosterLink: {
          create: (args: { data: { scheduleSegmentId: number; rosterId: number } }) => Promise<{
            scheduleSegmentId: number;
            rosterId: number;
          }>;
        };
        scheduleEvent: {
          create: () => Promise<void>;
        };
        activityLog: {
          create: () => Promise<void>;
        };
      }) => Promise<unknown>,
    ) =>
      fn({
        scheduleSegment: {
          create: async ({ data }) => {
            const created = {
              id: nextSegmentId,
              jobId: data.jobId,
              startDatetime: data.startDatetime,
              endDatetime: data.endDatetime,
              scheduledHoursOverride: data.scheduledHoursOverride ?? null,
              deletedAt: null,
            };
            nextSegmentId += 1;
            segments.push(created);
            return created;
          },
          update: async ({ where, data }) => {
            const found = segments.find((s) => s.id === where.id);
            if (!found) {
              throw new Error('missing segment');
            }
            if (data.startDatetime) {
              found.startDatetime = data.startDatetime;
            }
            if (data.endDatetime) {
              found.endDatetime = data.endDatetime;
            }
            if (data.deletedAt) {
              found.deletedAt = data.deletedAt;
            }
            if (data.scheduledHoursOverride !== undefined) {
              found.scheduledHoursOverride = data.scheduledHoursOverride;
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
        activityLog: { create: async () => undefined },
      }),
  } as unknown as PrismaClient;

  return fake;
}

describe('M2 schedule segment CRUD', () => {
  test('creates segment with roster link and returns derived state', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        rosterId: 99,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.jobState.state).toBe('FULLY_SCHEDULED');
    const local = localParts(body.segment.startDatetime, TEST_TZ);
    expect(local.date).toBe('2026-03-03');
    expect(local.minute).toBe(540);
    await app.close();
  });

  test('moves/resizes segment with same validations', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        rosterId: 99,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    const createdBody = created.json();

    const moved = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${createdBody.segment.id}`,
      headers: { 'x-actor-user-id': '1' },
      payload: {
        startDatetime: '2026-03-03T14:10:00.000Z',
        endDatetime: '2026-03-03T15:40:00.000Z',
      },
    });

    expect(moved.statusCode).toBe(200);
    const movedBody = moved.json();
    const local = localParts(movedBody.segment.startDatetime, TEST_TZ);
    expect(local.minute % 10).toBe(0);
    expect(movedBody.jobState.state).toBe('PARTIALLY_SCHEDULED');
    await app.close();
  });

  test('soft-deletes segment', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        rosterId: 99,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const createdBody = created.json();

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${createdBody.segment.id}`,
      headers: { 'x-actor-user-id': '1' },
    });

    expect(deleted.statusCode).toBe(200);
    const deletedBody = deleted.json();
    expect(deletedBody.ok).toBe(true);
    expect(deletedBody.jobState.state).toBe('TBS');
    await app.close();
  });

  test('state transitions FULLY_SCHEDULED to TBS after delete', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        rosterId: 99,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const createBody = created.json();
    expect(createBody.jobState.state).toBe('FULLY_SCHEDULED');

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${createBody.segment.id}`,
      headers: { 'x-actor-user-id': '1' },
    });
    const deleteBody = deleted.json();
    expect(deleteBody.jobState.state).toBe('TBS');
    await app.close();
  });
});

