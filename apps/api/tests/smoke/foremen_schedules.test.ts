import { describe, expect, test } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const ROSTER_ID = '44444444-4444-4444-8444-444444444444';

function buildForemenSchedulesPrisma() {
  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => (where.id === ACTOR_ID ? { id: ACTOR_ID } : null),
    },
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    resource: {
      findMany: async () => [{ id: FOREMAN_ID }],
    },
    foremanDayRoster: {
      findMany: async () => [
        {
          id: ROSTER_ID,
          foremanPersonId: FOREMAN_ID,
          date: new Date('2026-03-03T00:00:00.000Z'),
          homeBaseId: '55555555-5555-4555-8555-555555555555',
          preferredStartMinute: 300,
          preferredEndMinute: 1140,
          notes: null,
          createdByUserId: ACTOR_ID,
          createdAt: new Date('2026-03-03T00:00:00.000Z'),
          updatedAt: new Date('2026-03-03T00:00:00.000Z'),
          deletedAt: null,
          preferredStartTime: null,
          preferredEndTime: null,
        },
      ],
    },
    scheduleSegment: {
      findMany: async () => [
        {
          id: '66666666-6666-4666-8666-666666666666',
          jobId: '77777777-7777-4777-8777-777777777777',
          segmentType: 'PRIMARY',
          startDatetime: new Date('2026-03-03T13:00:00.000Z'),
          endDatetime: new Date('2026-03-03T15:00:00.000Z'),
          scheduledHoursOverride: null,
          notes: null,
          createdByUserId: ACTOR_ID,
          createdAt: new Date('2026-03-03T00:00:00.000Z'),
          updatedAt: new Date('2026-03-03T00:00:00.000Z'),
          deletedAt: null,
          segmentGroupId: null,
          segmentRosterLink: {
            rosterId: ROSTER_ID,
          },
        },
      ],
    },
    travelSegment: {
      findMany: async () => [
        {
          id: '88888888-8888-4888-8888-888888888888',
          foremanPersonId: FOREMAN_ID,
          relatedJobId: null,
          serviceDate: new Date('2026-03-03T00:00:00.000Z'),
          startDatetime: new Date('2026-03-03T12:30:00.000Z'),
          endDatetime: new Date('2026-03-03T13:00:00.000Z'),
          travelType: 'START_OF_DAY',
          source: 'MANUAL',
          locked: false,
          notes: null,
          createdByUserId: ACTOR_ID,
          createdAt: new Date('2026-03-03T00:00:00.000Z'),
          updatedAt: new Date('2026-03-03T00:00:00.000Z'),
          deletedAt: null,
        },
      ],
    },
  };

  return prisma as unknown as PrismaClient;
}

describe('foremen schedules batch endpoint', () => {
  test('GET /api/foremen/schedules returns map keyed by foremanId', async () => {
    const app = buildServer({ prisma: buildForemenSchedulesPrisma() });

    const response = await app.inject({
      method: 'GET',
      url: `/api/foremen/schedules?date=2026-03-03&foremanIds=${FOREMAN_ID}`,
      headers: lanAuthHeaders('GET', ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      schedules: Record<string, { scheduleSegments: unknown[]; travelSegments: unknown[]; roster: { id: string } | null }>;
    };

    expect(body.schedules[FOREMAN_ID]).toBeDefined();
    expect(body.schedules[FOREMAN_ID].roster?.id).toBe(ROSTER_ID);
    expect(body.schedules[FOREMAN_ID].scheduleSegments).toHaveLength(1);
    expect(body.schedules[FOREMAN_ID].travelSegments).toHaveLength(1);
    await app.close();
  });

  test('GET /api/foremen/schedules returns 400 when date is missing or malformed', async () => {
    const app = buildServer({ prisma: buildForemenSchedulesPrisma() });

    const missingDate = await app.inject({
      method: 'GET',
      url: '/api/foremen/schedules',
      headers: lanAuthHeaders('GET', ACTOR_ID),
    });
    expect(missingDate.statusCode).toBe(400);

    const malformedDate = await app.inject({
      method: 'GET',
      url: '/api/foremen/schedules?date=03-03-2026',
      headers: lanAuthHeaders('GET', ACTOR_ID),
    });
    expect(malformedDate.statusCode).toBe(400);
    await app.close();
  });
});
