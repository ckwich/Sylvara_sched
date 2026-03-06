import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';

function makeDate(date: string, minute: number) {
  return new Date(new Date(`${date}T00:00:00.000Z`).getTime() + minute * 60_000);
}

describe('A4 one-click rejects when no contiguous slot exists', () => {
  test('returns NO_CONTIGUOUS_SLOT_AT_CLICK', async () => {
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
          preferredStartMinute: 480,
          preferredStartTime: null,
          homeBase: { openingMinute: 420, openingTime: null },
        }),
      },
      travelSegment: {
        findMany: async () => [
          {
            startDatetime: makeDate('2026-03-02', 480),
            endDatetime: makeDate('2026-03-02', 1439),
          },
        ],
      },
      scheduleSegment: {
        findMany: async () => [],
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'UTC',
          operatingStartMinute: 0,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      segmentRosterLink: {
        create: async () => undefined,
      },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async () => undefined,
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('NO_CONTIGUOUS_SLOT_AT_CLICK');
    await app.close();
  });
});
