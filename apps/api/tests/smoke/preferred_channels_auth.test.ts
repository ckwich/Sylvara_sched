import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient, PreferredChannel } from '@prisma/client';

describe('preferred channels auth-backed actor attribution', () => {
  test('returns 401 when actor header is missing', async () => {
    const app = buildServer({ prisma: {} as PrismaClient });
    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/10/preferred-channels',
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
    const captured: { actorUserId?: number; channels?: PreferredChannel[] } = {};
    const fakePrisma = {
      $transaction: async (
        fn: (tx: {
          jobPreferredChannel: {
            deleteMany: (args: { where: { jobId: number } }) => Promise<void>;
            createMany: (args: { data: Array<{ jobId: number; channel: PreferredChannel }> }) => Promise<void>;
          };
          activityLog: {
            create: (args: { data: { actorUserId: number; diff: { preferredChannels: PreferredChannel[] } } }) => Promise<void>;
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
      url: '/api/jobs/10/preferred-channels',
      headers: { 'x-actor-user-id': '42' },
      payload: {
        channels: ['CALL', 'TEXT'],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      channels: ['CALL', 'TEXT'],
    });
    expect(captured.actorUserId).toBe(42);
    expect(captured.channels).toEqual(['CALL', 'TEXT']);
    await app.close();
  });
});
