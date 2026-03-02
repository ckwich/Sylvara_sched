import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

function makeDate(date: string, minute: number) {
  return new Date(new Date(`${date}T00:00:00.000Z`).getTime() + minute * 60_000);
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
      payload: {
        jobId: 10,
        foremanPersonId: 77,
        date: '2026-03-02',
        requestedStartMinute: 1435,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('CROSSES_MIDNIGHT');
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
