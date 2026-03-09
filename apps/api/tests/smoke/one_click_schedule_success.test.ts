import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const TEST_TZ = 'America/New_York';
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';
const SEGMENT_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const HOME_BASE_ID = '55555555-5555-4555-8555-555555555555';

function makeDate(date: string, minute: number) {
  return new Date(new Date(`${date}T00:00:00.000Z`).getTime() + minute * 60_000);
}

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

describe('A2 one-click schedule success', () => {
  test('creates onsite segment and roster link without END_OF_DAY travel', async () => {
    const createdLinks: Array<{ scheduleSegmentId: string; rosterId: string }> = [];

    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
          estimateHoursCurrent: '4',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: ROSTER_ID,
          preferredStartMinute: 480,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: {
        findMany: async () => [],
      },
      scheduleSegment: {
        findMany: async () => [],
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'UTC',
          operatingStartMinute: 300,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      segmentRosterLink: {
        create: async ({ data }: { data: { scheduleSegmentId: string; rosterId: string } }) => {
          createdLinks.push(data);
          return data;
        },
      },
      jobPreferredChannel: {
        deleteMany: async () => undefined,
        createMany: async () => undefined,
      },
      $transaction: async (
        fn: (tx: {
          scheduleSegment: {
            create: () => Promise<{ id: string; startDatetime: Date; endDatetime: Date }>;
          };
          segmentRosterLink: {
            create: (args: { data: { scheduleSegmentId: string; rosterId: string } }) => Promise<{
              scheduleSegmentId: string;
              rosterId: string;
            }>;
          };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: string; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async () => ({
              id: SEGMENT_ID,
              startDatetime: makeDate('2026-03-02', 480),
              endDatetime: makeDate('2026-03-02', 720),
            }),
          },
          segmentRosterLink: {
            create: async ({ data }: { data: { scheduleSegmentId: string; rosterId: string } }) => {
              createdLinks.push(data);
              return data;
            },
          },
          activityLog: {
            create: async () => undefined,
          },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.segment.id).toBe(SEGMENT_ID);
    expect(createdLinks).toHaveLength(1);
    expect(createdLinks[0].rosterId).toBe(ROSTER_ID);
    await app.close();
  });

  test('rejects when proposed segment crosses local midnight', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
          estimateHoursCurrent: '1',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: ROSTER_ID,
          preferredStartMinute: 1435,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: { findMany: async () => [] },
      scheduleSegment: { findMany: async () => [] },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'America/New_York',
          operatingStartMinute: 300,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      segmentRosterLink: { create: async () => undefined },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async () => undefined,
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-03',
        requestedStartMinute: 1410,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('CROSSES_MIDNIGHT');
    await app.close();
  });

  test('places repeat attempts deterministically without overlap and reuses same roster link', async () => {
    const createdLinks: Array<{ scheduleSegmentId: string; rosterId: string }> = [];
    const createdSegments: Array<{ id: string; startDatetime: Date; endDatetime: Date }> = [];
    let nextSegmentId = 200;

    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
          estimateHoursCurrent: '2',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: ROSTER_ID,
          preferredStartMinute: 420,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: { findMany: async () => [] },
      scheduleSegment: {
        findMany: async () => createdSegments,
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: TEST_TZ,
          operatingStartMinute: 420,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      segmentRosterLink: {
        create: async ({ data }: { data: { scheduleSegmentId: string; rosterId: string } }) => {
          createdLinks.push(data);
          return data;
        },
      },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async (
        fn: (tx: {
          scheduleSegment: {
            create: (args: { data: { startDatetime: Date; endDatetime: Date } }) => Promise<{
              id: string;
              startDatetime: Date;
              endDatetime: Date;
            }>;
          };
          segmentRosterLink: {
            create: (args: { data: { scheduleSegmentId: string; rosterId: string } }) => Promise<{
              scheduleSegmentId: string;
              rosterId: string;
            }>;
          };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: string; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async ({ data }: { data: { startDatetime: Date; endDatetime: Date } }) => {
              const created = {
                id: `00000000-0000-0000-0000-${String(nextSegmentId).padStart(12, '0')}`,
                startDatetime: data.startDatetime,
                endDatetime: data.endDatetime,
              };
              nextSegmentId += 1;
              createdSegments.push(created);
              return created;
            },
          },
          segmentRosterLink: {
            create: async ({ data }: { data: { scheduleSegmentId: string; rosterId: string } }) => {
              createdLinks.push(data);
              return data;
            },
          },
          activityLog: { create: async () => undefined },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });

    const first = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-03',
        requestedStartMinute: 420,
      },
    });

    const firstBody = first.json();
    expect(first.statusCode).toBe(200);
    expect(firstBody.result).toBe('ACCEPT');

    const second = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-03',
      },
    });

    const secondBody = second.json();
    expect(second.statusCode).toBe(200);
    expect(secondBody.result).toBe('ACCEPT');

    const firstLocalStart = localParts(firstBody.segment.startDatetime, TEST_TZ);
    const firstLocalEnd = localParts(firstBody.segment.endDatetime, TEST_TZ);
    const secondLocalStart = localParts(secondBody.segment.startDatetime, TEST_TZ);
    const secondLocalEnd = localParts(secondBody.segment.endDatetime, TEST_TZ);

    expect(firstLocalStart.date).toBe('2026-03-03');
    expect(firstLocalEnd.date).toBe('2026-03-03');
    expect(secondLocalStart.date).toBe('2026-03-03');
    expect(secondLocalEnd.date).toBe('2026-03-03');
    expect(secondLocalStart.minute).toBeGreaterThanOrEqual(firstLocalEnd.minute);
    expect(secondLocalStart.minute % 10).toBe(0);
    expect(
      createdLinks.some(
        (link) => link.scheduleSegmentId === firstBody.segment.id && link.rosterId === ROSTER_ID,
      ),
    ).toBe(true);
    expect(
      createdLinks.some(
        (link) => link.scheduleSegmentId === secondBody.segment.id && link.rosterId === ROSTER_ID,
      ),
    ).toBe(true);
    await app.close();
  });

  test('creates roster when missing and homeBaseId is provided', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
          estimateHoursCurrent: '1',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => null,
        create: async () => ({
          id: ROSTER_ID,
          preferredStartMinute: null,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: { findMany: async () => [] },
      scheduleSegment: { findMany: async () => [] },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'UTC',
          operatingStartMinute: 300,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      activityLog: { create: async () => undefined },
      segmentRosterLink: { create: async () => ({}) },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async (
        fn: (tx: {
          scheduleSegment: { create: () => Promise<{ id: string }> };
          segmentRosterLink: { create: () => Promise<Record<string, unknown>> };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: string }>,
      ) =>
        fn({
          scheduleSegment: { create: async () => ({ id: SEGMENT_ID }) },
          segmentRosterLink: { create: async () => ({}) },
          activityLog: { create: async () => undefined },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
        homeBaseId: HOME_BASE_ID,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    await app.close();
  });
});
