import { afterEach, describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PreferredChannel, PrismaClient } from '@prisma/client';

const LAN_SECRET = 'office-shared-secret';
const ORIGINAL_LAN_MODE = process.env.LAN_MODE;

function enableLanMode() {
  process.env.LAN_MODE = 'true';
}

afterEach(() => {
  if (ORIGINAL_LAN_MODE === undefined) {
    delete process.env.LAN_MODE;
  } else {
    process.env.LAN_MODE = ORIGINAL_LAN_MODE;
  }
});

describe('LAN guard', () => {
  test('GET /api/health is allowed without bearer in LAN mode', async () => {
    enableLanMode();
    const app = buildServer({ prisma: {} as PrismaClient }, { lanModeEnabled: true, lanSharedSecret: LAN_SECRET });

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    await app.close();
  });

  test('rejects read route when bearer is missing', async () => {
    enableLanMode();
    const app = buildServer(
      {
        prisma: {
          orgSettings: {
            findFirst: async () => ({
              companyTimezone: 'America/New_York',
              operatingStartMinute: 480,
              operatingEndMinute: 1020,
            }),
          },
        } as unknown as PrismaClient,
      },
      { lanModeEnabled: true, lanSharedSecret: LAN_SECRET },
    );

    const response = await app.inject({
      method: 'GET',
      url: '/api/org-settings',
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

  test('rejects write route when x-lan-user is missing', async () => {
    enableLanMode();
    const app = buildServer({ prisma: {} as PrismaClient }, { lanModeEnabled: true, lanSharedSecret: LAN_SECRET });

    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/10/preferred-channels',
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
      },
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

  test('rejects write route when x-actor-user-id is sent in LAN mode', async () => {
    enableLanMode();
    const app = buildServer({ prisma: {} as PrismaClient }, { lanModeEnabled: true, lanSharedSecret: LAN_SECRET });

    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/10/preferred-channels',
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
        'x-lan-user': 'Cole',
        'x-actor-user-id': '1',
      },
      payload: {
        channels: ['CALL'],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'x-actor-user-id is not allowed in LAN mode.',
      },
    });
    await app.close();
  });

  test('accepts write with valid bearer + x-lan-user and persists actor_display', async () => {
    enableLanMode();
    const captured: { actorDisplay?: string | null; channels?: PreferredChannel[] } = {};
    const app = buildServer(
      {
        prisma: {
          user: {
            findFirst: async () => ({ id: 1 }),
          },
          job: {
            findUnique: async () => ({ id: 10 }),
          },
          $transaction: async (
            fn: (tx: {
              jobPreferredChannel: {
                deleteMany: (args: { where: { jobId: number } }) => Promise<void>;
                createMany: (args: { data: Array<{ jobId: number; channel: PreferredChannel }> }) => Promise<void>;
              };
              activityLog: {
                create: (args: { data: { actorDisplay?: string | null; diff: { preferredChannels: PreferredChannel[] } } }) => Promise<void>;
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
                  captured.actorDisplay = data.actorDisplay ?? null;
                },
              },
            }),
        } as unknown as PrismaClient,
      },
      { lanModeEnabled: true, lanSharedSecret: LAN_SECRET },
    );

    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/10/preferred-channels',
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
        'x-lan-user': 'Cole',
      },
      payload: {
        channels: ['CALL', 'TEXT'],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(captured.actorDisplay).toBe('Cole');
    expect(captured.channels).toEqual(['CALL', 'TEXT']);
    await app.close();
  });
});
