import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';
const SEGMENT_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

function makeUtcDate(iso: string): Date {
  return new Date(iso);
}

function buildWindowConflictPrisma(availabilityNotes: string | null): PrismaClient {
  const fakePrisma = {
    job: {
      findUnique: async () => ({
        id: JOB_ID,
        estimateHoursCurrent: '2',
        availabilityNotes,
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
    user: { findUnique: async () => ({ id: ACTOR_ID }) },
    segmentRosterLink: { create: async () => undefined },
    jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
    $transaction: async () => undefined,
  } as unknown as PrismaClient;

  return fakePrisma;
}

describe('A6 customer window conflict and unconfigured warning', () => {
  test.each([
    '09:00-11:00',
    '9am-11am',
    '9-11am',
    '9 to 11am',
    '7am-5pm',
    '7:00am-5:00pm',
    'mornings only, 7am-5pm',
  ])(
    'rejects CUSTOMER_WINDOW_CONFLICT when only outside-window capacity remains (%s)',
    async (availabilityNotes) => {
      const app = buildServer({ prisma: buildWindowConflictPrisma(availabilityNotes) }, { verifyToken: createTestVerifier() });

      const response = await app.inject({
        method: 'POST',
        url: '/api/schedule/one-click-attempt',
        headers: testAuthHeaders(ACTOR_ID),
        payload: {
          jobId: JOB_ID,
          foremanPersonId: FOREMAN_ID,
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
    const createdLinks: Array<{ scheduleSegmentId: string; rosterId: string }> = [];
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
          estimateHoursCurrent: '1',
          availabilityNotes: 'mornings only',
          requirements: [],
          jobBlockers: [],
        }),
      },
      foremanDayRoster: {
        findFirst: async () => ({
          id: ROSTER_ID,
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
          scheduleSegment: { create: () => Promise<{ id: string; startDatetime: Date; endDatetime: Date }> };
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
              startDatetime: makeUtcDate('2026-03-03T15:00:00.000Z'),
              endDatetime: makeUtcDate('2026-03-03T16:00:00.000Z'),
            }),
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
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-03',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.warnings.map((w: { code: string }) => w.code)).toContain('CUSTOMER_WINDOW_NOT_CONFIGURED');
    expect(
      createdLinks.some((link) => link.scheduleSegmentId === SEGMENT_ID && link.rosterId === ROSTER_ID),
    ).toBe(true);
    await app.close();
  });
});
