import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

function makeUtcDate(iso: string): Date {
  return new Date(iso);
}

describe('A3 click-to-create snap and no-overlap', () => {
  test('floors 09:19 to 09:10 and places non-overlapping block', async () => {
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
          preferredStartMinute: 540,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: {
        findMany: async () => [
          {
            startDatetime: makeUtcDate('2026-03-02T14:00:00.000Z'),
            endDatetime: makeUtcDate('2026-03-02T14:10:00.000Z'),
          },
        ],
      },
      scheduleSegment: {
        findMany: async () => [
          {
            startDatetime: makeUtcDate('2026-03-02T16:00:00.000Z'),
            endDatetime: makeUtcDate('2026-03-02T17:00:00.000Z'),
          },
        ],
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'America/New_York',
          operatingStartMinute: 300,
          operatingStartTime: null,
        }),
      },
      segmentRosterLink: {
        create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => data,
      },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
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
          activityLog: {
            create: () => Promise<void>;
          };
        }) => Promise<{ id: number; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async () => ({
              id: 123,
              startDatetime: makeUtcDate('2026-03-02T14:10:00.000Z'),
              endDatetime: makeUtcDate('2026-03-02T15:10:00.000Z'),
            }),
          },
          segmentRosterLink: {
            create: async ({ data }: { data: { scheduleSegmentId: number; rosterId: number } }) => data,
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
        requestedStartMinute: 559,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.segment.startDatetime).toContain('2026-03-02T14:10:00.000Z');
    await app.close();
  });
});
