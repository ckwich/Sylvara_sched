import { EquipmentType, Prisma, UserRole, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const SCHEDULER_ID = '22222222-2222-4222-8222-222222222222';
const VIEWER_ID = '33333333-3333-4333-8333-333333333333';

function buildSnapshotPrisma() {
  const snapshots: Array<Record<string, unknown>> = [];
  const users = new Map<string, { id: string; role: UserRole; active: boolean }>([
    [MANAGER_ID, { id: MANAGER_ID, role: UserRole.MANAGER, active: true }],
    [SCHEDULER_ID, { id: SCHEDULER_ID, role: UserRole.SCHEDULER, active: true }],
    [VIEWER_ID, { id: VIEWER_ID, role: UserRole.VIEWER, active: true }],
  ]);

  const jobs = [
    {
      id: 'aaaa1111-1111-4111-8111-111111111111',
      salesRepCode: 'REP1',
      equipmentType: EquipmentType.CRANE,
      amountDollars: new Prisma.Decimal('1000'),
      estimateHoursCurrent: new Prisma.Decimal('4'),
      completedDate: null,
      deletedAt: null,
    },
    {
      id: 'bbbb2222-2222-4222-8222-222222222222',
      salesRepCode: 'REP2',
      equipmentType: EquipmentType.BUCKET,
      amountDollars: new Prisma.Decimal('500'),
      estimateHoursCurrent: new Prisma.Decimal('3'),
      completedDate: null,
      deletedAt: null,
    },
  ];

  const scheduledJobIds = new Set<string>(['aaaa1111-1111-4111-8111-111111111111']);

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => users.get(where.id) ?? null,
    },
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    weeklyBacklogSnapshot: {
      findFirst: async ({ where }: { where: { snapshotDate: Date; equipmentType: EquipmentType; salesRepCode: null; deletedAt: null } }) =>
        snapshots.find(
          (row) =>
            row.snapshotDate instanceof Date &&
            row.snapshotDate.toISOString().slice(0, 10) === where.snapshotDate.toISOString().slice(0, 10) &&
            row.equipmentType === where.equipmentType &&
            row.salesRepCode === null,
        )
          ? { snapshotDate: where.snapshotDate }
          : null,
      createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
        snapshots.push(...data);
        return { count: data.length };
      },
    },
    resource: {
      count: async () => 2,
    },
    job: {
      findMany: async ({ where }: { where: { equipmentType: EquipmentType } }) =>
        jobs.filter((job) => job.equipmentType === where.equipmentType),
    },
    scheduleSegment: {
      groupBy: async ({ where }: { where: { jobId: { in: string[] } } }) =>
        where.jobId.in
          .filter((jobId) => scheduledJobIds.has(jobId))
          .map((jobId) => ({ jobId, _count: { _all: 1 } })),
    },
    $transaction: async <T>(fn: (tx: { weeklyBacklogSnapshot: { createMany: (args: { data: Array<Record<string, unknown>> }) => Promise<{ count: number }> } }) => Promise<T>) =>
      fn({
        weeklyBacklogSnapshot: {
          createMany: async ({ data }) => {
            snapshots.push(...data);
            return { count: data.length };
          },
        },
      }),
  };

  return { prisma: prisma as unknown as PrismaClient, snapshots };
}

describe('snapshot trigger route', () => {
  test('POST /api/snapshots/trigger as MANAGER returns CREATED and counts', async () => {
    const mock = buildSnapshotPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/snapshots/trigger',
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-04' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; counts: { totalRows: number; repRows: number }; snapshot_date: string };
    expect(body.status).toBe('CREATED');
    expect(body.counts.totalRows).toBe(4);
    expect(body.counts.repRows).toBe(2);
    expect(body.snapshot_date).toBe('2026-03-01');

    const craneDateRows = mock.snapshots.filter(
      (row) =>
        row.equipmentType === 'CRANE' &&
        row.snapshotDate instanceof Date &&
        row.snapshotDate.toISOString().slice(0, 10) === '2026-03-01',
    );
    expect(craneDateRows.length).toBeGreaterThan(0);

    const hasNullRep = mock.snapshots.some((row) => row.equipmentType === 'CRANE' && row.salesRepCode === null);
    const hasRepRow = mock.snapshots.some((row) => row.equipmentType === 'CRANE' && row.salesRepCode === 'REP1');
    expect(hasNullRep).toBe(true);
    expect(hasRepRow).toBe(true);

    await app.close();
  });

  test('POST /api/snapshots/trigger duplicate week returns 409 SNAPSHOT_DUPLICATE', async () => {
    const mock = buildSnapshotPrisma();
    mock.snapshots.push({
      snapshotDate: new Date('2026-03-01T00:00:00.000Z'),
      equipmentType: 'CRANE',
      salesRepCode: null,
    });
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/snapshots/trigger',
      headers: lanAuthHeaders('POST', MANAGER_ID),
      payload: { date: '2026-03-04' },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('SNAPSHOT_DUPLICATE');
    await app.close();
  });

  test('POST /api/snapshots/trigger as SCHEDULER returns 403', async () => {
    const mock = buildSnapshotPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/snapshots/trigger',
      headers: lanAuthHeaders('POST', SCHEDULER_ID),
      payload: {},
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  test('POST /api/snapshots/trigger as VIEWER returns 403', async () => {
    const mock = buildSnapshotPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/snapshots/trigger',
      headers: lanAuthHeaders('POST', VIEWER_ID),
      payload: {},
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });
});
