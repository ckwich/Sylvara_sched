import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';

describe('org settings endpoints', () => {
  test('GET /api/org-settings returns timezone', async () => {
    const app = buildServer({
      prisma: {
        orgSettings: {
          findFirst: async () => ({
            companyTimezone: 'America/New_York',
            operatingStartMinute: 480,
            operatingEndMinute: 1020,
          }),
        },
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/org-settings',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      companyTimezone: 'America/New_York',
      operatingStartMinute: 480,
      operatingEndMinute: 1020,
    });
    await app.close();
  });

  test('PATCH /api/org-settings requires actor', async () => {
    const app = buildServer({ prisma: {} as PrismaClient });
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      payload: {
        companyTimezone: 'America/Chicago',
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

  test('PATCH /api/org-settings rejects invalid timezone', async () => {
    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: 1 }),
        },
      } as unknown as PrismaClient,
    });
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: {
        'x-actor-user-id': '1',
      },
      payload: {
        companyTimezone: 'Not/A_Real_Zone',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });

  test('PATCH /api/org-settings updates timezone for valid value', async () => {
    const captured: { companyTimezone?: string; actorUserId?: number } = {};
    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: 7 }),
        },
        $transaction: async (
          fn: (tx: {
            orgSettings: {
              upsert: (args: {
                create: { companyTimezone: string };
              }) => Promise<{
                companyTimezone: string;
                operatingStartMinute: null;
                operatingEndMinute: null;
              }>;
            };
            activityLog: {
              create: (args: { data: { actorUserId: number } }) => Promise<void>;
            };
          }) => Promise<{
            companyTimezone: string;
            operatingStartMinute: null;
            operatingEndMinute: null;
          }>,
        ) =>
          fn({
            orgSettings: {
              upsert: async ({ create }) => {
                captured.companyTimezone = create.companyTimezone;
                return {
                  companyTimezone: create.companyTimezone,
                  operatingStartMinute: null,
                  operatingEndMinute: null,
                };
              },
            },
            activityLog: {
              create: async ({ data }) => {
                captured.actorUserId = data.actorUserId;
              },
            },
          }),
      } as unknown as PrismaClient,
    });
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: {
        'x-actor-user-id': '7',
      },
      payload: {
        companyTimezone: 'America/Chicago',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().companyTimezone).toBe('America/Chicago');
    expect(captured.companyTimezone).toBe('America/Chicago');
    expect(captured.actorUserId).toBe(7);
    await app.close();
  });

  test('PATCH /api/org-settings transaction rolls back when activity log write fails', async () => {
    let timezone = 'America/New_York';
    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: 9 }),
        },
        $transaction: async (
          fn: (tx: {
            orgSettings: {
              upsert: (args: { create: { companyTimezone: string } }) => Promise<{
                companyTimezone: string;
                operatingStartMinute: null;
                operatingEndMinute: null;
              }>;
            };
            activityLog: {
              create: () => Promise<void>;
            };
          }) => Promise<unknown>,
        ) => {
          const staged = { timezone };
          const result = await fn({
            orgSettings: {
              upsert: async ({ create }) => {
                staged.timezone = create.companyTimezone;
                return {
                  companyTimezone: staged.timezone,
                  operatingStartMinute: null,
                  operatingEndMinute: null,
                };
              },
            },
            activityLog: {
              create: async () => {
                throw new Error('log failure');
              },
            },
          });
          timezone = staged.timezone;
          return result;
        },
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: {
        'x-actor-user-id': '9',
      },
      payload: {
        companyTimezone: 'America/Chicago',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(timezone).toBe('America/New_York');
    await app.close();
  });
});
