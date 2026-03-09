import type { PrismaClient, UserRole } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { BLOCKER_REASONS, REQUIREMENT_TYPES } from '../../scripts/seed-admin-lists';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const VIEWER_ID = '22222222-2222-4222-8222-222222222222';

function buildPrisma(roleById: Record<string, UserRole>) {
  const upsertLog = {
    requirementTypes: [] as string[],
    blockerReasons: [] as string[],
    accessConstraints: [] as string[],
  };

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const role = roleById[where.id];
        return role ? { id: where.id, role, active: true } : null;
      },
    },
    requirementType: {
      upsert: async ({ where }: { where: { code: string } }) => {
        upsertLog.requirementTypes.push(where.code);
        return {};
      },
      findMany: async () => [],
    },
    blockerReason: {
      upsert: async ({ where }: { where: { code: string } }) => {
        upsertLog.blockerReasons.push(where.code);
        return {};
      },
      findMany: async () => [],
    },
    accessConstraint: {
      upsert: async ({ where }: { where: { code: string } }) => {
        upsertLog.accessConstraints.push(where.code);
        return {};
      },
      findMany: async () => [],
    },
    seasonalFreezeWindow: {
      findMany: async () => [],
    },
    job: {
      findMany: async ({ select }: { select?: Record<string, unknown> }) => {
        if (select?.importSource) {
          return [
            { importSource: 'CRANE' },
            { importSource: 'CRANE' },
            { importSource: 'BUCKET' },
          ];
        }
        if (select?.linkedEquipmentNote) {
          return [
            {
              id: 'job-unresolved-1',
              linkedEquipmentNote: 'BUCKET',
              jobSiteAddress: '1 Main St',
              town: 'Salem',
              customer: { name: 'Unresolved Customer' },
            },
          ];
        }
        return [
          {
            id: 'job-unable-1',
            town: 'Beverly',
            customer: { name: 'Unable Customer' },
          },
        ];
      },
      count: async () => 2,
    },
    scheduleSegment: {
      count: async () => 5,
    },
    scheduleEvent: {
      count: async () => 7,
    },
    requirement: {
      count: async () => 9,
    },
    $transaction: async <T>(input: Promise<T>[]) => Promise.all(input),
  };

  return { prisma: prisma as unknown as PrismaClient, upsertLog };
}

describe('admin endpoints', () => {
  test('GET /api/admin/import-summary returns correct shape', async () => {
    const mock = buildPrisma({ [MANAGER_ID]: 'MANAGER' });
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/import-summary',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(Array.isArray(payload.importSources)).toBe(true);
    expect(payload.totals.segmentsCreated).toBe(5);
    expect(payload.totals.scheduleEventsCreated).toBe(7);
    expect(payload.totals.requirementsCreated).toBe(9);
    expect(payload.pendingNotesReview.count).toBe(2);
    await app.close();
  });

  test('seed script seeds expected requirement types and blocker reasons', async () => {
    const requirementCodes = new Set(REQUIREMENT_TYPES.map((item) => item.code));
    const blockerCodes = new Set(BLOCKER_REASONS.map((item) => item.code));
    expect(requirementCodes).toEqual(
      new Set(['POLICE_DETAIL', 'CRANE_AND_BOOM_PERMIT', 'TREE_PERMIT']),
    );
    expect(blockerCodes).toEqual(
      new Set([
        'PERMIT_PENDING',
        'CUSTOMER_UNRESPONSIVE',
        'ACCESS_BLOCKED',
        'NEIGHBOR_CONSENT_NEEDED',
        'FROZEN_GROUND_REQUIRED',
        'WINTER_TIMING',
        'UTILITY_COORDINATION',
        'WEATHER_DELAY',
        'OTHER',
      ]),
    );
  });

  test('VIEWER cannot access /api/admin/* endpoints', async () => {
    const mock = buildPrisma({ [VIEWER_ID]: 'VIEWER' });
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/requirement-types',
      headers: testAuthHeaders(VIEWER_ID, 'VIEWER'),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('FORBIDDEN');
    await app.close();
  });
});
