import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

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
          const row = { id: created.length + 1, ...data };
          created.push(row);
          return row;
        },
      },
      scheduleSegment: {
        findMany: async () => [
          { id: 1, endDatetime: makeDate('2026-03-02', 720) },
          { id: 2, endDatetime: makeDate('2026-03-02', 930) },
        ],
      },
      orgSettings: {
        findFirst: async () => ({
          companyTimezone: 'America/New_York',
          operatingStartMinute: 300,
          operatingStartTime: null,
        }),
      },
      user: { findUnique: async () => ({ id: 1 }) },
      segmentRosterLink: { create: async () => undefined },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async (
        fn: (tx: {
          travelSegment: { create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>> };
          activityLog: { create: () => Promise<void> };
        }) => Promise<Record<string, unknown>>,
      ) =>
        fn({
          travelSegment: {
            create: async ({ data }: { data: Record<string, unknown> }) => {
              const row = { id: created.length + 1, ...data };
              created.push(row);
              return row;
            },
          },
          activityLog: {
            create: async () => undefined,
          },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });

    const first = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: { 'x-actor-user-id': '1' },
      payload: {
        foremanPersonId: 77,
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
      headers: { 'x-actor-user-id': '1' },
      payload: {
        foremanPersonId: 77,
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
    const app = buildServer({ prisma: {} as PrismaClient });
    const response = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      payload: {
        foremanPersonId: 77,
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
    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: { 'x-actor-user-id': '999999' },
      payload: {
        foremanPersonId: 77,
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
