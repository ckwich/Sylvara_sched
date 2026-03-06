import { afterEach, describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PreferredChannel, PrismaClient } from '@prisma/client';

const LAN_SECRET = 'office-shared-secret-123456';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
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
  test('fails startup when LAN secret is too short', async () => {
    enableLanMode();
    expect(() =>
      buildServer({ prisma: {} as PrismaClient }, { lanModeEnabled: true, lanSharedSecret: 'short-secret' }),
    ).toThrow('LAN_SHARED_SECRET is required and must be at least 24 characters when LAN_MODE=true');
  });

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
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
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
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
        'x-lan-user': ACTOR_ID,
        'x-actor-user-id': ACTOR_ID,
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
            findUnique: async ({ where }: { where: { id: string } }) =>
              where.id === ACTOR_ID ? { id: ACTOR_ID, active: true } : null,
          },
          job: {
            findUnique: async () => ({ id: JOB_ID }),
          },
          $transaction: async (
            fn: (tx: {
              jobPreferredChannel: {
                deleteMany: (args: { where: { jobId: string } }) => Promise<void>;
                createMany: (args: { data: Array<{ jobId: string; channel: PreferredChannel }> }) => Promise<void>;
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
      url: `/api/jobs/${JOB_ID}/preferred-channels`,
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
        'x-lan-user': ACTOR_ID,
      },
      payload: {
        channels: ['CALL', 'TEXT'],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(captured.actorDisplay).toBe(ACTOR_ID);
    expect(captured.channels).toEqual(['CALL', 'TEXT']);
    await app.close();
  });
});

