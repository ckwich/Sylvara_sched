import { Prisma, EquipmentType, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';

type MockJob = {
  id: string;
  customerId: string;
  customerName: string;
  equipmentType: EquipmentType;
  salesRepCode: string;
  jobSiteAddress: string;
  town: string;
  amountDollars: Prisma.Decimal;
  estimateHoursCurrent: Prisma.Decimal;
  completedDate: Date | null;
  pushUpIfPossible: boolean;
  createdAt: Date;
};

function buildFilteringPrisma() {
  const jobs: MockJob[] = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      customerId: '20000000-0000-4000-8000-000000000001',
      customerName: 'Anderson Tree Care',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      jobSiteAddress: '12 Crane St',
      town: 'Beverly',
      amountDollars: new Prisma.Decimal('1200'),
      estimateHoursCurrent: new Prisma.Decimal('4'),
      completedDate: null,
      pushUpIfPossible: false,
      createdAt: new Date('2026-03-05T00:00:00.000Z'),
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      customerId: '20000000-0000-4000-8000-000000000002',
      customerName: 'Baker Family',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP2',
      jobSiteAddress: '99 Elm Ave',
      town: 'Natick',
      amountDollars: new Prisma.Decimal('800'),
      estimateHoursCurrent: new Prisma.Decimal('3'),
      completedDate: null,
      pushUpIfPossible: true,
      createdAt: new Date('2026-03-04T00:00:00.000Z'),
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      customerId: '20000000-0000-4000-8000-000000000003',
      customerName: 'Crane Legacy',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      jobSiteAddress: '44 Maple Rd',
      town: 'Salem',
      amountDollars: new Prisma.Decimal('950'),
      estimateHoursCurrent: new Prisma.Decimal('2'),
      completedDate: new Date('2026-03-01T00:00:00.000Z'),
      pushUpIfPossible: false,
      createdAt: new Date('2026-03-03T00:00:00.000Z'),
    },
  ];

  let lastTake = 0;

  const applyWhere = (where: Record<string, unknown>) => {
    return jobs.filter((job) => {
      if ((where.completedDate as Date | null | undefined) === null && job.completedDate !== null) {
        return false;
      }
      if (where.equipmentType && job.equipmentType !== where.equipmentType) {
        return false;
      }

      const town = where.town as { contains?: string } | undefined;
      if (town?.contains && !job.town.toLowerCase().includes(town.contains.toLowerCase())) {
        return false;
      }

      const salesRepCode = where.salesRepCode as { equals?: string } | undefined;
      if (salesRepCode?.equals && job.salesRepCode.toLowerCase() !== salesRepCode.equals.toLowerCase()) {
        return false;
      }

      const or = where.OR as Array<Record<string, unknown>> | undefined;
      if (or && or.length > 0) {
        const term =
          ((or[0].customer as { name: { contains: string } })?.name?.contains ??
            (or[1]?.jobSiteAddress as { contains: string })?.contains) || '';
        const normalized = term.toLowerCase();
        if (
          !job.customerName.toLowerCase().includes(normalized) &&
          !job.jobSiteAddress.toLowerCase().includes(normalized)
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => (where.id === ACTOR_ID ? { id: ACTOR_ID } : null),
    },
    job: {
      findMany: async ({ where, skip, take }: { where: Record<string, unknown>; skip: number; take: number }) => {
        lastTake = take;
        const filtered = applyWhere(where).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return filtered.slice(skip, skip + take).map((job) => ({
          ...job,
          customer: {
            id: job.customerId,
            name: job.customerName,
          },
        }));
      },
      count: async ({ where }: { where: Record<string, unknown> }) => applyWhere(where).length,
    },
    jobBlocker: {
      groupBy: async () => [],
    },
    requirement: {
      groupBy: async () => [],
    },
    $queryRaw: async () => [] as Array<{ job_id: string; hours: number }>,
    $transaction: async <T>(input: Promise<unknown>[]) => Promise.all(input) as Promise<T>,
  };

  return {
    prisma: prisma as unknown as PrismaClient,
    getLastTake: () => lastTake,
  };
}

describe('jobs filtering and pagination', () => {
  test('GET /api/jobs with no params returns paginated response shape', async () => {
    const mock = buildFilteringPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toMatchObject({
      page: 1,
      pageSize: 50,
      total: 2,
      totalPages: 1,
    });
    await app.close();
  });

  test('GET /api/jobs?equipmentType=CRANE returns only crane jobs', async () => {
    const mock = buildFilteringPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs?equipmentType=CRANE',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: Array<{ equipmentType: string }> };
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((job) => job.equipmentType === 'CRANE')).toBe(true);
    await app.close();
  });

  test('GET /api/jobs?search=... returns matching jobs', async () => {
    const mock = buildFilteringPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs?search=elm',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: Array<{ jobSiteAddress: string; customerName: string }> };
    expect(body.data).toHaveLength(1);
    expect(body.data[0].jobSiteAddress).toContain('Elm');
    await app.close();
  });

  test('GET /api/jobs?page=1&pageSize=5 respects pagination params', async () => {
    const mock = buildFilteringPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs?page=1&pageSize=5',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: unknown[]; pagination: { page: number; pageSize: number } };
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(5);
    expect(body.data.length).toBeLessThanOrEqual(5);
    await app.close();
  });

  test('GET /api/jobs?pageSize=999 clamps pageSize to 200', async () => {
    const mock = buildFilteringPrisma();
    const app = buildServer({ prisma: mock.prisma }, { verifyToken: createTestVerifier() });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs?pageSize=999',
      headers: testAuthHeaders(ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { pagination: { pageSize: number } };
    expect(body.pagination.pageSize).toBe(200);
    expect(mock.getLastTake()).toBe(200);
    await app.close();
  });
});
