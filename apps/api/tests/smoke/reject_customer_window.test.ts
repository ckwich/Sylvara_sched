import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

function makeUtcDate(iso: string): Date {
  return new Date(iso);
}

function buildWindowConflictPrisma(availabilityNotes: string | null): PrismaClient {
  const fakePrisma = {
    job: {
      findUnique: async () => ({
        id: 10,
        estimateHoursCurrent: '2',
        availabilityNotes,
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
      findMany: async () => [
        {
          startDatetime: makeUtcDate('2026-03-03T12:00:00.000Z'),
          endDatetime: makeUtcDate('2026-03-03T22:00:00.000Z'),
        },
      ],
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: 'America/New_York',
        operatingStartMinute: 420,
        operatingStartTime: null,
      }),
    },
    segmentRosterLink: { create: async () => undefined },
    jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
    $transaction: async () => undefined,
  } as unknown as PrismaClient;

  return fakePrisma;
}

describe('A6 customer window conflict and unconfigured warning', () => {
  test.each(['09:00-11:00', '9am-11am', '9-11am', '9 to 11am', '7am-5pm', '7:00am-5:00pm'])(
    'rejects CUSTOMER_WINDOW_CONFLICT when only outside-window capacity remains (%s)',
    async (availabilityNotes) => {
      const app = buildServer({ prisma: buildWindowConflictPrisma(availabilityNotes) });

      const response = await app.inject({
        method: 'POST',
        url: '/api/schedule/one-click-attempt',
        headers: { 'x-actor-user-id': '1' },
        payload: {
          jobId: 10,
          foremanPersonId: 77,
          date: '2026-03-03',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.result).toBe('REJECT');
      expect(body.rejections[0].code).toBe('CUSTOMER_WINDOW_CONFLICT');
      await app.close();
    },
  );

  test('accepts and warns CUSTOMER_WINDOW_NOT_CONFIGURED when window cannot be parsed', async () => {
    const createdLinks: Array<{ scheduleSegmentId: number; rosterId: number }> = [];
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '1',
          availabilityNotes: 'mornings only',
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: 99,
          preferredStartMinute: 600,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: { findMany: async () => [] },
      scheduleSegment: { findMany: async () => [] },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'America/New_York',
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
          scheduleSegment: { create: () => Promise<{ id: number; startDatetime: Date; endDatetime: Date }> };
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
              id: 333,
              startDatetime: makeUtcDate('2026-03-03T15:00:00.000Z'),
              endDatetime: makeUtcDate('2026-03-03T16:00:00.000Z'),
            }),
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
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        jobId: 10,
        foremanPersonId: 77,
        date: '2026-03-03',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.warnings.map((w: { code: string }) => w.code)).toContain('CUSTOMER_WINDOW_NOT_CONFIGURED');
    expect(
      createdLinks.some((link) => link.scheduleSegmentId === 333 && link.rosterId === 99),
    ).toBe(true);
    await app.close();
  });
});
