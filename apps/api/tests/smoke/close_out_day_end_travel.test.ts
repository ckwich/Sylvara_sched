import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';
const SEGMENT_1_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SEGMENT_2_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function makeDate(date: string, minute: number) {
  return new Date(new Date(`${date}T00:00:00.000Z`).getTime() + minute * 60_000);
}

describe('A7 close out day END_OF_DAY travel', () => {
  test('creates first END_OF_DAY and rejects second active one', async () => {
    const created: Array<Record<string, unknown>> = [];

    const fakePrisma = {
      job: { findUnique: async () => null },
      foremanDayRoster: { findFirst: async () => null },
      travelSegment: {
        findMany: async () => [],
        findFirst: async () => created[0] ?? null,
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const row = {
            id: `00000000-0000-0000-0000-${String(created.length + 1).padStart(12, '0')}`,
            ...data,
          };
          created.push(row);
          return row;
        },
      },
      scheduleSegment: {
        findMany: async () => [
          { id: SEGMENT_1_ID, endDatetime: makeDate('2026-03-02', 720) },
          { id: SEGMENT_2_ID, endDatetime: makeDate('2026-03-02', 930) },
        ],
      },
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
      $transaction: async (
        fn: (tx: {
          travelSegment: { create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>> };
          scheduleEvent: { create: () => Promise<void> };
          activityLog: { create: () => Promise<void> };
        }) => Promise<Record<string, unknown>>,
      ) =>
        fn({
          travelSegment: {
            create: async ({ data }: { data: Record<string, unknown> }) => {
              const row = {
                id: `00000000-0000-0000-0000-${String(created.length + 1).padStart(12, '0')}`,
                ...data,
              };
              created.push(row);
              return row;
            },
          },
          scheduleEvent: {
            create: async () => undefined,
          },
          activityLog: {
            create: async () => undefined,
          },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });

    const first = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
        durationMinutes: 45,
      },
    });

    expect(first.statusCode).toBe(200);
    const firstBody = first.json();
    expect(firstBody.result).toBe('ACCEPT');
    expect(firstBody.travelSegment.travelType).toBe('END_OF_DAY');

    const second = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
        durationMinutes: 45,
      },
    });

    expect(second.statusCode).toBe(200);
    const secondBody = second.json();
    expect(secondBody.result).toBe('REJECT');
    expect(secondBody.rejections[0].code).toBe('END_OF_DAY_ALREADY_EXISTS');
    await app.close();
  });

  test('returns 401 when actor header is missing', async () => {
    const app = buildServer({ prisma: {} as PrismaClient }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      payload: {
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
        durationMinutes: 45,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      },
    });
    await app.close();
  });

  test('returns 401 when actor header user does not exist', async () => {
    const fakePrisma = {
      user: { findUnique: async () => null },
    } as unknown as PrismaClient;
    const app = buildServer({ prisma: fakePrisma }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: testAuthHeaders('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
      payload: {
        foremanPersonId: FOREMAN_ID,
        date: '2026-03-02',
        durationMinutes: 45,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      },
    });
    await app.close();
  });
});
