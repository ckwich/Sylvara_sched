import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import type { PrismaClient } from '@prisma/client';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const ACTOR_1_ID = '11111111-1111-4111-8111-111111111111';
const ACTOR_7_ID = '77777777-7777-4777-8777-777777777777';
const ACTOR_9_ID = '99999999-9999-4999-8999-999999999999';

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
      headers: lanAuthHeaders('GET', ACTOR_1_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      companyTimezone: 'America/New_York',
      operatingStartMinute: 480,
      operatingEndMinute: 1020,
      sales_per_day: null,
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
          findUnique: async () => ({ id: ACTOR_1_ID }),
        },
      } as unknown as PrismaClient,
    });
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: lanAuthHeaders('PATCH', ACTOR_1_ID),
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
    const captured: { companyTimezone?: string; actorUserId?: string } = {};
    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: ACTOR_7_ID }),
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
              create: (args: { data: { actorUserId: string } }) => Promise<void>;
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
                  salesPerDay: null,
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
      headers: lanAuthHeaders('PATCH', ACTOR_7_ID),
      payload: {
        companyTimezone: 'America/Chicago',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().companyTimezone).toBe('America/Chicago');
    expect(captured.companyTimezone).toBe('America/Chicago');
    expect(captured.actorUserId).toBe(ACTOR_7_ID);
    await app.close();
  });

  test('PATCH /api/org-settings transaction rolls back when activity log write fails', async () => {
    let timezone = 'America/New_York';
    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: ACTOR_9_ID }),
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
                  salesPerDay: null,
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
      headers: lanAuthHeaders('PATCH', ACTOR_9_ID),
      payload: {
        companyTimezone: 'America/Chicago',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(timezone).toBe('America/New_York');
    await app.close();
  });
});
