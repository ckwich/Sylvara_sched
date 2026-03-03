import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

const LAN_SECRET = 'office-shared-secret';

describe('LAN guard', () => {
  test('GET /api/health is allowed without bearer in LAN mode', async () => {
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

  test('rejects write route when bearer is invalid', async () => {
    const app = buildServer({ prisma: {} as PrismaClient }, { lanModeEnabled: true, lanSharedSecret: LAN_SECRET });

    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs/10/preferred-channels',
      headers: {
        authorization: 'Bearer wrong-secret',
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

  test('allows routes with valid bearer and keeps downstream behavior', async () => {
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
      headers: {
        authorization: `Bearer ${LAN_SECRET}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      companyTimezone: 'America/New_York',
      operatingStartMinute: 480,
      operatingEndMinute: 1020,
    });
    await app.close();
  });
});
