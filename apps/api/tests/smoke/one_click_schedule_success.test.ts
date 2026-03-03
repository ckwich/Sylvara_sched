import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

const TEST_TZ = 'America/New_York';

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
    const createdLinks: Array<{ scheduleSegmentId: number; rosterId: number }> = [];

    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '4',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: 99,
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
      segmentRosterLink: {
        create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => {
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
            create: () => Promise<{ id: number; startDatetime: Date; endDatetime: Date }>;
          };
          segmentRosterLink: {
            create: (args: { data: { scheduleSegmentId: number; rosterId: number } }) => Promise<{
              scheduleSegmentId: number;
              rosterId: number;
            }>;
          };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: number; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async () => ({
              id: 123,
              startDatetime: makeDate('2026-03-02', 480),
              endDatetime: makeDate('2026-03-02', 720),
            }),
          },
          segmentRosterLink: {
            create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => {
              createdLinks.push(data);
              return data;
            },
          },
          activityLog: {
            create: async () => undefined,
          },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
        date: '2026-03-02',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.segment.id).toBe(123);
    expect(createdLinks).toHaveLength(1);
    expect(createdLinks[0].rosterId).toBe(99);
    await app.close();
  });

  test('rejects when proposed segment crosses local midnight', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '1',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: 99,
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
      segmentRosterLink: { create: async () => undefined },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async () => undefined,
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
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
    const createdLinks: Array<{ scheduleSegmentId: number; rosterId: number }> = [];
    const createdSegments: Array<{ id: number; startDatetime: Date; endDatetime: Date }> = [];
    let nextSegmentId = 200;

    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '2',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: 99,
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
      segmentRosterLink: {
        create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => {
          createdLinks.push(data);
          return data;
        },
      },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async (
        fn: (tx: {
          scheduleSegment: {
            create: (args: { data: { startDatetime: Date; endDatetime: Date } }) => Promise<{
              id: number;
              startDatetime: Date;
              endDatetime: Date;
            }>;
          };
          segmentRosterLink: {
            create: (args: { data: { scheduleSegmentId: number; rosterId: number } }) => Promise<{
              scheduleSegmentId: number;
              rosterId: number;
            }>;
          };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: number; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async ({ data }: { data: { startDatetime: Date; endDatetime: Date } }) => {
              const created = {
                id: nextSegmentId,
                startDatetime: data.startDatetime,
                endDatetime: data.endDatetime,
              };
              nextSegmentId += 1;
              createdSegments.push(created);
              return created;
            },
          },
          segmentRosterLink: {
            create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => {
              createdLinks.push(data);
              return data;
            },
          },
          activityLog: { create: async () => undefined },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });

    const first = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
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
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
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
      createdLinks.some((link) => link.scheduleSegmentId === firstBody.segment.id && link.rosterId === 99),
    ).toBe(true);
    expect(
      createdLinks.some((link) => link.scheduleSegmentId === secondBody.segment.id && link.rosterId === 99),
    ).toBe(true);
    await app.close();
  });

  test('creates roster when missing and homeBaseId is provided', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '1',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => null,
        create: async () => ({
          id: 99,
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
      activityLog: { create: async () => undefined },
      segmentRosterLink: { create: async () => ({}) },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async (
        fn: (tx: {
          scheduleSegment: { create: () => Promise<{ id: number }> };
          segmentRosterLink: { create: () => Promise<Record<string, unknown>> };
          activityLog: { create: () => Promise<void> };
        }) => Promise<{ id: number }>,
      ) =>
        fn({
          scheduleSegment: { create: async () => ({ id: 123 }) },
          segmentRosterLink: { create: async () => ({}) },
          activityLog: { create: async () => undefined },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
        date: '2026-03-02',
        homeBaseId: 5,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    await app.close();
  });
});
