import { UserRole, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';

function createMockPrisma() {
  const dismissals: Array<{
    id: string;
    dismissedByUserId: string;
    conflictDate: Date;
    conflictType: string;
    conflictKey: string;
    dismissedAt: Date;
    deletedAt: Date | null;
  }> = [];

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === ACTOR_ID ? { id: ACTOR_ID, role: UserRole.MANAGER, active: true } : null,
    },
    scheduleSegment: {
      findMany: async () => [],
    },
    foremanDayRosterMember: {
      findMany: async () => [],
    },
    orgSettings: {
      findFirst: async () => ({
        operatingStartMinute: 300,
        operatingEndMinute: 1140,
      }),
    },
    resource: {
      count: async () => 4,
    },
    schedulingConflictDismissal: {
      upsert: async ({
        where,
        create,
      }: {
        where: {
          dismissedByUserId_conflictDate_conflictType_conflictKey: {
            dismissedByUserId: string;
            conflictDate: Date;
            conflictType: string;
            conflictKey: string;
          };
        };
        create: {
          dismissedByUserId: string;
          conflictDate: Date;
          conflictType: string;
          conflictKey: string;
        };
      }) => {
        const existing = dismissals.find(
          (item) =>
            item.dismissedByUserId === where.dismissedByUserId_conflictDate_conflictType_conflictKey.dismissedByUserId &&
            item.conflictDate.toISOString() ===
              where.dismissedByUserId_conflictDate_conflictType_conflictKey.conflictDate.toISOString() &&
            item.conflictType === where.dismissedByUserId_conflictDate_conflictType_conflictKey.conflictType &&
            item.conflictKey === where.dismissedByUserId_conflictDate_conflictType_conflictKey.conflictKey,
        );
        if (existing) {
          existing.deletedAt = null;
          existing.dismissedAt = new Date();
          return existing;
        }
        const created = {
          id: `dismissal-${dismissals.length + 1}`,
          dismissedByUserId: create.dismissedByUserId,
          conflictDate: create.conflictDate,
          conflictType: create.conflictType,
          conflictKey: create.conflictKey,
          dismissedAt: new Date(),
          deletedAt: null,
        };
        dismissals.push(created);
        return created;
      },
      findMany: async () => dismissals.filter((item) => item.deletedAt === null),
    },
    $transaction: async <T>(input: Promise<unknown>[]) => Promise.all(input) as Promise<T>,
  };

  return { prisma: prisma as unknown as PrismaClient, dismissals };
}

describe('conflicts endpoints', () => {
  test('GET /api/conflicts?date= returns response shape', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/conflicts?date=2026-03-07',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { date: string; conflicts: unknown[] };
    expect(body.date).toBe('2026-03-07');
    expect(Array.isArray(body.conflicts)).toBe(true);
    await app.close();
  });

  test('GET /api/conflicts without date returns 400', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/conflicts',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  test('POST /api/conflicts/dismiss records dismissal', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'POST',
      url: '/api/conflicts/dismiss',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        date: '2026-03-07',
        conflictType: 'PERSON_CONFLICT',
        conflictKey: 'person-1',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(mock.dismissals).toHaveLength(1);
    await app.close();
  });

  test('GET /api/conflicts/dismissals returns dismissals for date', async () => {
    const mock = createMockPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    await app.inject({
      method: 'POST',
      url: '/api/conflicts/dismiss',
      headers: testAuthHeaders(ACTOR_ID),
      payload: {
        date: '2026-03-07',
        conflictType: 'PERSON_CONFLICT',
        conflictKey: 'person-1',
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/conflicts/dismissals?date=2026-03-07',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().dismissals).toHaveLength(1);
    await app.close();
  });
});
