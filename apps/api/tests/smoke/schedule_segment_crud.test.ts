import { describe, expect, test } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const TEST_TZ = 'America/New_York';
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';

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
  const foremanPersonId = FOREMAN_ID;
  const segments: Array<{
    id: string;
    jobId: string;
    startDatetime: Date;
    endDatetime: Date;
    deletedAt: Date | null;
    scheduledHoursOverride: number | null;
  }> = [];
  const links: Array<{ scheduleSegmentId: string; rosterId: string }> = [];
  const travelSegments: Array<{ id: number; startDatetime: Date; endDatetime: Date; deletedAt: Date | null }> = [];
  let nextSegmentId = 100;

  const fake = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: TEST_TZ,
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
          foremanPersonId,
        };
      },
    },
    scheduleSegment: {
      findMany: async ({ where }: { where: { jobId?: string; deletedAt?: null } }) =>
        segments.filter(
          (s) =>
            (where.jobId === undefined || s.jobId === where.jobId) &&
            (where.deletedAt !== null || s.deletedAt === null) &&
            links.some((l) => l.scheduleSegmentId === s.id),
        ),
      findFirst: async ({
        where,
      }: {
        where: {
          id?: string | { not: string };
          deletedAt?: null;
          startDatetime?: { lt: Date };
          endDatetime?: { gt: Date };
          segmentRosterLink?: {
            is: { roster: { foremanPersonId: string; date: Date } };
          };
        };
      }) => {
        if (typeof where.id === 'string') {
          const found = segments.find((s) => s.id === where.id && s.deletedAt === null);
          if (!found) {
            return null;
          }
          return {
            ...found,
            segmentRosterLink: {
              roster: {
                id: ROSTER_ID,
                date: rosterDate,
                foremanPersonId,
              },
            },
          };
        }

        const excludedId = typeof where.id === 'object' ? where.id.not : undefined;
        const overlap = segments.find(
          (s) =>
            s.deletedAt === null &&
            (excludedId === undefined || s.id !== excludedId) &&
            where.startDatetime !== undefined &&
            where.endDatetime !== undefined &&
            s.startDatetime < where.startDatetime.lt &&
            s.endDatetime > where.endDatetime.gt &&
            links.some((l) => l.scheduleSegmentId === s.id && l.rosterId === ROSTER_ID),
        );
        return overlap ? { id: overlap.id } : null;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const found = segments.find((s) => s.id === where.id);
        return found ?? null;
      },
    },
    travelSegment: {
      findFirst: async ({
        where,
      }: {
        where: {
          foremanPersonId: string;
          deletedAt: null;
          startDatetime: { lt: Date };
          endDatetime: { gt: Date };
        };
      }) =>
        travelSegments.find(
          (s) =>
            s.deletedAt === null &&
            s.startDatetime < where.startDatetime.lt &&
            s.endDatetime > where.endDatetime.gt,
        ) ?? null,
    },
    $transaction: async (
      fn: (tx: {
        scheduleSegment: {
          create: (args: {
            data: {
              jobId: string;
              startDatetime: Date;
              endDatetime: Date;
              scheduledHoursOverride?: number;
            };
          }) => Promise<{
            id: string;
            jobId: string;
            startDatetime: Date;
            endDatetime: Date;
            scheduledHoursOverride: number | null;
          }>;
          update: (args: {
            where: { id: string };
            data: {
              startDatetime?: Date;
              endDatetime?: Date;
              deletedAt?: Date;
              scheduledHoursOverride?: number | null;
            };
          }) => Promise<{
            id: string;
            jobId: string;
            startDatetime: Date;
            endDatetime: Date;
            scheduledHoursOverride: number | null;
            deletedAt: Date | null;
          }>;
        };
        segmentRosterLink: {
          create: (args: { data: { scheduleSegmentId: string; rosterId: string } }) => Promise<{
            scheduleSegmentId: string;
            rosterId: string;
          }>;
        };
        scheduleEvent: {
          create: () => Promise<void>;
        };
        vacatedSlot: {
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
              id: `ffff0000-0000-4000-8000-${String(nextSegmentId).padStart(12, '0')}`,
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
            if (data.deletedAt === null) {
              found.deletedAt = null;
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
        vacatedSlot: { create: async () => undefined },
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
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
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
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    const createdBody = created.json();

    const moved = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${createdBody.segment.id}`,
      headers: lanAuthHeaders('PATCH', ACTOR_ID),
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
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const createdBody = created.json();

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${createdBody.segment.id}`,
      headers: lanAuthHeaders('DELETE', ACTOR_ID),
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
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const createBody = created.json();
    expect(createBody.jobState.state).toBe('FULLY_SCHEDULED');

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${createBody.segment.id}`,
      headers: lanAuthHeaders('DELETE', ACTOR_ID),
    });
    const deleteBody = deleted.json();
    expect(deleteBody.jobState.state).toBe('TBS');
    await app.close();
  });

  test('restores soft-deleted segment for undo path', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const segmentId = created.json().segment.id as string;

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${segmentId}`,
      headers: lanAuthHeaders('DELETE', ACTOR_ID),
    });
    expect(deleted.statusCode).toBe(200);

    const restored = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${segmentId}/restore`,
      headers: lanAuthHeaders('PATCH', ACTOR_ID),
    });
    expect(restored.statusCode).toBe(200);
    expect(restored.json().ok).toBe(true);
    await app.close();
  });

  test('rejects overlapping segment create', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:30:00.000Z',
        endDatetime: '2026-03-03T15:30:00.000Z',
      },
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().error.code).toBe('SCHEDULE_CONFLICT');
    await app.close();
  });

  test('rejects update that moves segment into overlap', async () => {
    const app = buildServer({ prisma: buildCrudPrisma() });
    await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        rosterId: ROSTER_ID,
        startDatetime: '2026-03-03T15:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    const secondId = second.json().segment.id as string;

    const update = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${secondId}`,
      headers: lanAuthHeaders('PATCH', ACTOR_ID),
      payload: {
        startDatetime: '2026-03-03T14:30:00.000Z',
        endDatetime: '2026-03-03T15:30:00.000Z',
      },
    });
    expect(update.statusCode).toBe(409);
    expect(update.json().error.code).toBe('SCHEDULE_CONFLICT');
    await app.close();
  });
});
