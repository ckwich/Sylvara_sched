import { Prisma, EquipmentType, type PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const CUSTOMER_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';

function baseJob() {
  return {
    id: JOB_ID,
    customerId: CUSTOMER_ID,
    equipmentType: EquipmentType.CRANE,
    salesRepCode: 'JD',
    jobSiteAddress: '1 Main St',
    town: 'Natick',
    completedDate: null as Date | null,
    completedByUserId: null as string | null,
    completionNotes: null as string | null,
    amountDollars: new Prisma.Decimal('1000'),
    estimateHoursCurrent: new Prisma.Decimal('2'),
    travelHoursEstimate: new Prisma.Decimal('0'),
    approvalDate: null as Date | null,
    approvalCall: null as string | null,
    confirmedText: null as string | null,
    confirmedByUserId: null as string | null,
    confirmedAt: null as Date | null,
    craneModelSuitability: null as 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null,
    requiresSpiderLift: false,
    winterFlag: false,
    frozenGroundFlag: false,
    notesRaw: '',
    notesLastParsedAt: null as Date | null,
    notesParseConfidence: null as Record<string, unknown> | null,
    pushUpIfPossible: false,
    mustBeFirstJob: false,
    preferredStartMinute: null as number | null,
    preferredEndMinute: null as number | null,
    preferredStartTime: null as Date | null,
    preferredEndTime: null as Date | null,
    availabilityNotes: null as string | null,
    noEmail: false,
    contactAllowed: true,
    contactOwnerUserId: null as string | null,
    contactInstructions: null as string | null,
    accessNotes: null as string | null,
    createdAt: new Date('2026-03-04T00:00:00.000Z'),
    updatedAt: new Date('2026-03-04T00:00:00.000Z'),
    deletedAt: null as Date | null,
    estimateId: null as string | null,
  };
}

function makeCrudPrisma() {
  const customer = {
    id: CUSTOMER_ID,
    name: 'Acme Tree Service',
    phone: null,
    email: null,
    createdAt: new Date('2026-03-04T00:00:00.000Z'),
    updatedAt: new Date('2026-03-04T00:00:00.000Z'),
    deletedAt: null as Date | null,
  };
  let job = baseJob();
  const scheduleSegments: Array<{
    id: string;
    startDatetime: Date;
    endDatetime: Date;
    scheduledHoursOverride: Prisma.Decimal | null;
    deletedAt: Date | null;
  }> = [];
  const estimateHistoryRows: Array<Record<string, unknown>> = [];
  const activityLogRows: Array<Record<string, unknown>> = [];

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === ACTOR_ID ? { id: ACTOR_ID } : null,
    },
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    customer: {
      create: async ({ data }: { data: { name: string } }) => {
        customer.name = data.name;
        return customer;
      },
      update: async ({ data }: { data: { name: string } }) => {
        customer.name = data.name;
        return customer;
      },
    },
    job: {
      findFirst: async ({ where }: { where: { id: string } }) => {
        if (where.id !== job.id || job.deletedAt !== null) {
          return null;
        }
        return {
          ...job,
          customer,
          requirements: [],
          jobBlockers: [],
          scheduleSegments: scheduleSegments.filter((segment) => segment.deletedAt === null),
          estimateHistory: [...estimateHistoryRows].reverse(),
        };
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        job = {
          ...job,
          ...data,
          id: JOB_ID,
          customerId: customer.id,
          updatedAt: new Date('2026-03-04T00:01:00.000Z'),
        } as typeof job;
        return job;
      },
      update: async ({ data }: { data: Record<string, unknown> }) => {
        job = {
          ...job,
          ...data,
          updatedAt: new Date('2026-03-04T00:02:00.000Z'),
        };
        return job;
      },
    },
    estimateHistory: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        estimateHistoryRows.push(data);
        return data;
      },
    },
    activityLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        activityLogRows.push(data);
        return data;
      },
    },
    $transaction: async <T>(
      input:
        | ((tx: {
            customer: typeof prisma.customer;
            job: typeof prisma.job;
            estimateHistory: typeof prisma.estimateHistory;
            activityLog: typeof prisma.activityLog;
          }) => Promise<T>)
        | Promise<unknown>[],
    ) => {
      if (Array.isArray(input)) {
        return Promise.all(input) as Promise<T>;
      }
      return input({
        customer: prisma.customer,
        job: prisma.job,
        estimateHistory: prisma.estimateHistory,
        activityLog: prisma.activityLog,
      });
    },
  };

  return {
    prisma: prisma as unknown as PrismaClient,
    state: {
      get job() {
        return job;
      },
      estimateHistoryRows,
      activityLogRows,
      scheduleSegments,
      customer,
    },
  };
}

describe('jobs CRUD routes', () => {
  test('POST /api/jobs creates job + customer and returns TBS', async () => {
    const mock = makeCrudPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: '/api/jobs',
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        customerName: '  New Customer  ',
        equipmentType: 'CRANE',
        salesRepCode: ' J.D. ',
        jobSiteAddress: '55 Elm St',
        town: 'Wellesley',
        amountDollars: 1200,
        estimateHoursCurrent: 3,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.job.derivedState).toBe('TBS');
    expect(body.job.salesRepCode).toBe('JD');
    expect(mock.state.customer.name).toBe('New Customer');
    await app.close();
  });

  test('PATCH /api/jobs/:id changing estimate creates EstimateHistory row', async () => {
    const mock = makeCrudPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/jobs/${JOB_ID}`,
      headers: lanAuthHeaders('PATCH', ACTOR_ID),
      payload: {
        estimateHoursCurrent: 4,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(mock.state.estimateHistoryRows.length).toBe(1);
    expect(response.json().job.estimateHoursCurrent).toBe('4');
    await app.close();
  });

  test('POST /api/jobs/:id/complete marks completed state', async () => {
    const mock = makeCrudPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${JOB_ID}/complete`,
      headers: lanAuthHeaders('POST', ACTOR_ID),
      payload: {
        completedDate: '2026-03-05',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().job.derivedState).toBe('COMPLETED');
    expect(response.json().job.completedByUserId).toBe(ACTOR_ID);
    await app.close();
  });

  test('POST /api/jobs/:id/uncomplete clears completed date and re-derives state', async () => {
    const mock = makeCrudPrisma();
    mock.state.job.completedDate = new Date('2026-03-05T00:00:00.000Z');
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'POST',
      url: `/api/jobs/${JOB_ID}/uncomplete`,
      headers: lanAuthHeaders('POST', ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().job.completedDate).toBeNull();
    expect(response.json().job.derivedState).toBe('TBS');
    await app.close();
  });

  test('GET /api/jobs derives state and runs single hours aggregate query', async () => {
    const job1 = {
      ...baseJob(),
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      customerId: 'aaaaaaaa-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      salesRepCode: 'JD',
      amountDollars: new Prisma.Decimal('100'),
      estimateHoursCurrent: new Prisma.Decimal('2'),
    };
    const job2 = {
      ...baseJob(),
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      customerId: 'cccccccc-dddd-4ddd-8ddd-dddddddddddd',
      salesRepCode: 'MJ',
      amountDollars: new Prisma.Decimal('200'),
      estimateHoursCurrent: new Prisma.Decimal('2'),
    };
    let queryRawCalls = 0;

    const app = buildServer({
      prisma: {
        job: {
          findMany: async () => [
            {
              ...job1,
              customer: { id: job1.customerId, name: 'A Customer' },
            },
            {
              ...job2,
              customer: { id: job2.customerId, name: 'B Customer' },
            },
          ],
          count: async () => 2,
        },
        jobBlocker: {
          groupBy: async () => [{ jobId: job1.id, _count: { _all: 1 } }],
        },
        requirement: {
          groupBy: async () => [{ jobId: job1.id, _count: { _all: 2 } }],
        },
        $queryRaw: async () => {
          queryRawCalls += 1;
          return [{ job_id: job2.id, hours: 2 }];
        },
        $transaction: async <T>(input: Promise<unknown>[]) => Promise.all(input) as Promise<T>,
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/jobs',
      headers: lanAuthHeaders('GET', ACTOR_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(queryRawCalls).toBe(1);
    expect(body.data).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(50);
    const tbs = body.data.find((job: { id: string }) => job.id === job1.id);
    const full = body.data.find((job: { id: string }) => job.id === job2.id);
    expect(tbs.derivedState).toBe('TBS');
    expect(full.derivedState).toBe('FULLY_SCHEDULED');
    expect(tbs.activeBlockerCount).toBe(1);
    expect(tbs.unmetRequirementCount).toBe(2);
    await app.close();
  });

  test('salesRepCode normalization on PATCH stores uppercase', async () => {
    const mock = makeCrudPrisma();
    const app = buildServer({ prisma: mock.prisma });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/jobs/${JOB_ID}`,
      headers: lanAuthHeaders('PATCH', ACTOR_ID),
      payload: {
        salesRepCode: ' a.b-9 ',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().job.salesRepCode).toBe('AB9');
    expect(mock.state.job.salesRepCode).toBe('AB9');
    await app.close();
  });
});
