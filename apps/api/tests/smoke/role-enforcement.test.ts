import type { PrismaClient, UserRole } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const VIEWER_ID = '11111111-1111-4111-8111-111111111111';
const SCHEDULER_ID = '22222222-2222-4222-8222-222222222222';
const MANAGER_ID = '33333333-3333-4333-8333-333333333333';

function createApp(roleById: Record<string, UserRole>) {
  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const role = roleById[where.id];
        if (!role) {
          return null;
        }
        return { id: where.id, role, active: true };
      },
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: 'America/New_York',
        operatingStartMinute: 300,
        operatingEndMinute: 1140,
      }),
    },
    $transaction: async (
      fn: (tx: {
        orgSettings: {
          upsert: (args: unknown) => Promise<{
            companyTimezone: string;
            operatingStartMinute: number | null;
            operatingEndMinute: number | null;
          }>;
        };
        activityLog: { create: (args: unknown) => Promise<void> };
      }) => Promise<unknown>,
    ) =>
      fn({
        orgSettings: {
          upsert: async () => ({
            companyTimezone: 'America/New_York',
            operatingStartMinute: 300,
            operatingEndMinute: 1140,
          }),
        },
        activityLog: {
          create: async () => undefined,
        },
      }),
  } as unknown as PrismaClient;

  return buildServer({ prisma });
}

describe('role enforcement', () => {
  test('VIEWER cannot call mutation endpoint', async () => {
    const app = createApp({
      [VIEWER_ID]: 'VIEWER',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/resources',
      headers: lanAuthHeaders('POST', VIEWER_ID),
      payload: {
        name: 'Loader',
        resourceType: 'EQUIPMENT',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('FORBIDDEN');
    await app.close();
  });

  test('SCHEDULER cannot call manager-only endpoint', async () => {
    const app = createApp({
      [SCHEDULER_ID]: 'SCHEDULER',
    });

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: lanAuthHeaders('PATCH', SCHEDULER_ID),
      payload: {
        companyTimezone: 'America/New_York',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('FORBIDDEN');
    await app.close();
  });

  test('MANAGER can call manager-only endpoint', async () => {
    const app = createApp({
      [MANAGER_ID]: 'MANAGER',
    });

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/org-settings',
      headers: lanAuthHeaders('PATCH', MANAGER_ID),
      payload: {
        companyTimezone: 'America/New_York',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().companyTimezone).toBe('America/New_York');
    await app.close();
  });
});
