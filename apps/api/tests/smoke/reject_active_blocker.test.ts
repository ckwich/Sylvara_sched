import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const FOREMAN_ID = '33333333-3333-4333-8333-333333333333';

describe('A5 reject active blocker', () => {
  test('rejects one-click attempt with ACTIVE_BLOCKER', async () => {
    const fakePrisma = {
      job: {
        findUnique: async () => ({
          id: JOB_ID,
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
      user: { findUnique: async () => ({ id: ACTOR_ID }) },
      segmentRosterLink: { create: async () => undefined },
      jobPreferredChannel: { deleteMany: async () => undefined, createMany: async () => undefined },
      $transaction: async () => undefined,
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
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
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
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

  test('returns 401 when actor header user does not exist', async () => {
    const fakePrisma = {
      user: { findUnique: async () => null },
    } as unknown as PrismaClient;
    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: { 'x-actor-user-id': 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' },
      payload: {
        jobId: JOB_ID,
        foremanPersonId: FOREMAN_ID,
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

