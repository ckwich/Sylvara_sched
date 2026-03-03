import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

describe('A5 reject active blocker', () => {
  test('rejects one-click attempt with ACTIVE_BLOCKER', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: 10,
          estimateHoursCurrent: '4',
          availabilityNotes: null,
          requirements: [],
          jobBlockers: [{ id: 1, status: 'ACTIVE' }],
        }),
      },
      foremanDayRoster: { findFirst: async () => null },
      travelSegment: { findMany: async () => [] },
      scheduleSegment: { findMany: async () => [] },
      orgSettings: { findFirst: async () => null },
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
        date: '2026-03-02',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('ACTIVE_BLOCKER');
    await app.close();
  });

  test('returns 401 when actor header is missing', async () => {
    const app = buildServer({ prisma: {} as PrismaClient });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      payload: {
        jobId: 10,
        foremanPersonId: 77,
        date: '2026-03-02',
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
