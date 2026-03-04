import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient, PreferredChannel } from '@prisma/client';

const ACTOR_ID = '42424242-4242-4242-8242-424242424242';
const JOB_ID = '22222222-2222-4222-8222-222222222222';

describe('preferred channels auth-backed actor attribution', () => {
  test('returns 401 when actor header is missing', async () => {
    const app = buildServer({ prisma: {} as PrismaClient });
    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
      payload: {
        channels: ['CALL'],
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

  test('uses actor header for activity log write', async () => {
    const captured: { actorUserId?: string; channels?: PreferredChannel[] } = {};
    const fakePrisma = {
      user: {
        findUnique: async ({ where }: { where: { id: string } }) =>
          where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
      },
      job: {
        findUnique: async ({ where }: { where: { id: string } }) =>
          where.id === JOB_ID ? { id: JOB_ID } : null,
      },
      $transaction: async (
        fn: (tx: {
          jobPreferredChannel: {
            deleteMany: (args: { where: { jobId: string } }) => Promise<void>;
            createMany: (args: { data: Array<{ jobId: string; channel: PreferredChannel }> }) => Promise<void>;
          };
          activityLog: {
            create: (args: { data: { actorUserId: string; diff: { preferredChannels: PreferredChannel[] } } }) => Promise<void>;
          };
        }) => Promise<void>,
      ) =>
        fn({
          jobPreferredChannel: {
            deleteMany: async () => undefined,
            createMany: async ({ data }) => {
              captured.channels = data.map((row) => row.channel);
            },
          },
          activityLog: {
            create: async ({ data }) => {
              captured.actorUserId = data.actorUserId;
            },
          },
        }),
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        channels: ['CALL', 'TEXT'],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      channels: ['CALL', 'TEXT'],
    });
    expect(captured.actorUserId).toBe(ACTOR_ID);
    expect(captured.channels).toEqual(['CALL', 'TEXT']);
    await app.close();
  });

  test('returns 404 when job does not exist and does not write', async () => {
    let transactionCalled = false;
    const fakePrisma = {
      user: {
        findUnique: async ({ where }: { where: { id: string } }) =>
          where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
      },
      job: {
        findUnique: async () => null,
      },
      $transaction: async () => {
        transactionCalled = true;
      },
    } as unknown as PrismaClient;

    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/99999999-9999-4999-8999-999999999999/preferred-channels',
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        channels: ['CALL'],
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('JOB_NOT_FOUND');
    expect(transactionCalled).toBe(false);
    await app.close();
  });

  test('returns 401 when actor header user does not exist', async () => {
    const fakePrisma = {
      user: { findUnique: async () => null },
    } as unknown as PrismaClient;
    const app = buildServer({ prisma: fakePrisma });
    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
      headers: { 'x-actor-user-id': 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' },
      payload: {
        channels: ['CALL'],
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

