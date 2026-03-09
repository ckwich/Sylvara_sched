import { EquipmentType, Prisma, UserRole, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const SCHEDULER_ID = '22222222-2222-4222-8222-222222222222';
const VIEWER_ID = '33333333-3333-4333-8333-333333333333';

type SnapshotRow = {
  snapshotDate: Date;
  year: number;
  weekNumber: number;
  equipmentType: EquipmentType;
  salesRepCode: string | null;
  totalDollars: Prisma.Decimal | null;
  scheduledHours: Prisma.Decimal;
  tbsHours: Prisma.Decimal;
  totalHours: Prisma.Decimal;
  crewCount: Prisma.Decimal;
  crewCountOverride: Prisma.Decimal | null;
  deletedAt: Date | null;
};

function buildReportsPrisma() {
  const users = new Map<string, { id: string; role: UserRole; active: boolean }>([
    [MANAGER_ID, { id: MANAGER_ID, role: UserRole.MANAGER, active: true }],
    [SCHEDULER_ID, { id: SCHEDULER_ID, role: UserRole.SCHEDULER, active: true }],
    [VIEWER_ID, { id: VIEWER_ID, role: UserRole.VIEWER, active: true }],
  ]);

  const snapshots: SnapshotRow[] = [
    {
      snapshotDate: new Date('2025-12-27T00:00:00.000Z'),
      year: 2025,
      weekNumber: 52,
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      totalDollars: new Prisma.Decimal('1500'),
      scheduledHours: new Prisma.Decimal('4'),
      tbsHours: new Prisma.Decimal('2'),
      totalHours: new Prisma.Decimal('6'),
      crewCount: new Prisma.Decimal('2'),
      crewCountOverride: null,
      deletedAt: null,
    },
    {
      snapshotDate: new Date('2025-12-27T00:00:00.000Z'),
      year: 2025,
      weekNumber: 52,
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP1',
      totalDollars: new Prisma.Decimal('500'),
      scheduledHours: new Prisma.Decimal('3'),
      tbsHours: new Prisma.Decimal('1'),
      totalHours: new Prisma.Decimal('4'),
      crewCount: new Prisma.Decimal('2'),
      crewCountOverride: null,
      deletedAt: null,
    },
    {
      snapshotDate: new Date('2025-12-27T00:00:00.000Z'),
      year: 2025,
      weekNumber: 52,
      equipmentType: EquipmentType.CRANE,
      salesRepCode: null,
      totalDollars: new Prisma.Decimal('2000'),
      scheduledHours: new Prisma.Decimal('12'),
      tbsHours: new Prisma.Decimal('8'),
      totalHours: new Prisma.Decimal('20'),
      crewCount: new Prisma.Decimal('3'),
      crewCountOverride: null,
      deletedAt: null,
    },
    {
      snapshotDate: new Date('2025-12-27T00:00:00.000Z'),
      year: 2025,
      weekNumber: 52,
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: null,
      totalDollars: new Prisma.Decimal('1000'),
      scheduledHours: new Prisma.Decimal('10'),
      tbsHours: new Prisma.Decimal('5'),
      totalHours: new Prisma.Decimal('15'),
      crewCount: new Prisma.Decimal('2'),
      crewCountOverride: new Prisma.Decimal('2.5'),
      deletedAt: null,
    },
  ];

  const jobs = [
    {
      id: 'job-1',
      salesRepCode: 'REP1',
      equipmentType: EquipmentType.CRANE,
      amountDollars: new Prisma.Decimal('2500'),
      completedDate: null,
      deletedAt: null,
    },
    {
      id: 'job-2',
      salesRepCode: 'REP2',
      equipmentType: EquipmentType.BUCKET,
      amountDollars: new Prisma.Decimal('1200'),
      completedDate: null,
      deletedAt: null,
    },
  ];

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => users.get(where.id) ?? null,
    },
    orgSettings: {
      findFirst: async () => ({
        companyTimezone: 'America/New_York',
        salesPerDay: null,
      }),
    },
    job: {
      findMany: async () => jobs,
    },
    scheduleSegment: {
      groupBy: async () => [{ jobId: 'job-1' }],
    },
    weeklyBacklogSnapshot: {
      findMany: async ({
        where,
        distinct,
      }: {
        where: {
          deletedAt?: null;
          salesRepCode?: { not: null } | null;
          year?: { in: number[] };
          equipmentType?: EquipmentType;
        };
        distinct?: Array<'year'>;
      }) => {
        let rows = snapshots.filter((row) => row.deletedAt === null);
        if (where.salesRepCode?.not === null) {
          rows = rows.filter((row) => row.salesRepCode !== null);
        }
        if (where.salesRepCode === null) {
          rows = rows.filter((row) => row.salesRepCode === null);
        }
        if (where.year?.in) {
          rows = rows.filter((row) => where.year?.in.includes(row.year));
        }
        if (where.equipmentType) {
          rows = rows.filter((row) => row.equipmentType === where.equipmentType);
        }

        if (distinct?.includes('year')) {
          const years = Array.from(new Set(rows.map((row) => row.year))).sort((a, b) => b - a);
          return years.map((year) => ({ year }));
        }

        return rows;
      },
    },
    $transaction: async <T>(input: Promise<unknown>[]) => Promise.all(input) as Promise<T>,
  };

  return prisma as unknown as PrismaClient;
}

describe('reports endpoints', () => {
  test('GET /api/reports/summ returns expected shape', async () => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/summ',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      report_date: string;
      rows: Array<{ sales_rep_code: string; combined_total_dollars: number }>;
      totals: { combined_total_dollars: number };
    };
    expect(body.report_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(body.rows)).toBe(true);
    expect(body.rows[0].sales_rep_code).toBe('REP1');
    expect(typeof body.totals.combined_total_dollars).toBe('number');
    await app.close();
  });

  test('GET /api/reports/summ returns days_sales_in_backlog null when sales_per_day is not set', async () => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/summ',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().days_sales_in_backlog).toBeNull();
    await app.close();
  });

  test.each([
    ['MANAGER', MANAGER_ID],
    ['SCHEDULER', SCHEDULER_ID],
    ['VIEWER', VIEWER_ID],
  ])('GET /api/reports/summ is accessible by %s', async (_label, actorId) => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/summ',
      headers: testAuthHeaders(actorId, _label),
    });
    expect(response.statusCode).toBe(200);
    await app.close();
  });

  test('GET /api/reports/comparable returns expected shape and available years', async () => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/comparable',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      available_years: number[];
      crane: Record<string, Record<string, unknown>>;
      bucket: Record<string, Record<string, unknown>>;
    };
    expect(body.available_years).toContain(2025);
    expect(body.crane['2025']).toBeDefined();
    expect(body.bucket['2025']).toBeDefined();
    await app.close();
  });

  test('GET /api/reports/comparable?years=2025 filters to requested year', async () => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/comparable?years=2025',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { crane: Record<string, unknown>; bucket: Record<string, unknown> };
    expect(Object.keys(body.crane)).toEqual(['2025']);
    expect(Object.keys(body.bucket)).toEqual(['2025']);
    await app.close();
  });

  test.each([
    ['MANAGER', MANAGER_ID],
    ['SCHEDULER', SCHEDULER_ID],
    ['VIEWER', VIEWER_ID],
  ])('GET /api/reports/comparable is accessible by %s', async (_label, actorId) => {
    const app = buildServer({ prisma: buildReportsPrisma() }, { verifyToken: createTestVerifier() });
    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/comparable',
      headers: testAuthHeaders(actorId, _label),
    });
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
