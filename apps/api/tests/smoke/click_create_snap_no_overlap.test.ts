import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

const TEST_TZ = 'America/New_York';
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';
const SEGMENT_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function makeUtcDate(iso: string): Date {
  return new Date(iso);
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

describe('A3 click-to-create snap and no-overlap', () => {
  test('floors 09:19 to 09:10 and places non-overlapping block', async () => {
    const createdLinks: Array<{ scheduleSegmentId: string; rosterId: string }> = [];
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
            startDatetime: makeUtcDate('2026-03-03T16:00:00.000Z'),
            endDatetime: makeUtcDate('2026-03-03T17:00:00.000Z'),
          },
        ],
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: TEST_TZ,
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
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
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
          activityLog: {
            create: () => Promise<void>;
          };
        }) => Promise<{ id: string; startDatetime: Date; endDatetime: Date }>,
      ) =>
        fn({
          scheduleSegment: {
            create: async () => ({
              id: SEGMENT_ID,
              startDatetime: makeUtcDate('2026-03-03T14:10:00.000Z'),
              endDatetime: makeUtcDate('2026-03-03T15:10:00.000Z'),
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

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-03',
        requestedStartMinute: 559,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    const local = localParts(body.segment.startDatetime, TEST_TZ);
    expect(local.date).toBe('2026-03-03');
    expect(local.minute).toBe(550);
    expect(
      createdLinks.some((link) => link.scheduleSegmentId === SEGMENT_ID && link.rosterId === ROSTER_ID),
    ).toBe(true);
    await app.close();
  });
});

