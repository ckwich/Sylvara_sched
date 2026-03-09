import { Prisma, type PrismaClient, RequirementStatus } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { createTestVerifier, testAuthHeaders } from '../fixtures/test-auth.js';

const MANAGER_ID = '11111111-1111-4111-8111-111111111111';
const VIEWER_ID = '11111111-1111-4111-8111-111111111112';
const SEGMENT_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';
const SLOT_ID = '44444444-4444-4444-8444-444444444444';

type PushupHarness = {
  app: ReturnType<typeof buildServer>;
  createdSegments: Array<Record<string, unknown>>;
  updatedSlots: Array<Record<string, unknown>>;
};

function buildPatchHarness() {
  const vacatedCreates: Array<Record<string, unknown>> = [];
  const existing = {
    id: SEGMENT_ID,
    jobId: JOB_ID,
    startDatetime: new Date('2026-03-03T14:00:00.000Z'),
    endDatetime: new Date('2026-03-03T18:00:00.000Z'),
    scheduledHoursOverride: null as null,
    notes: null as string | null,
    segmentRosterLink: null,
    job: {
      equipmentType: 'CRANE' as const,
    },
  };

  const prisma = {
    user: {
      findUnique: async () => ({ id: MANAGER_ID, role: 'MANAGER', active: true }),
    },
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    scheduleSegment: {
      findFirst: async () => existing,
      findMany: async () => [],
    },
    job: {
      findUnique: async () => ({
        id: JOB_ID,
        equipmentType: 'CRANE',
        completedDate: null,
        estimateHoursCurrent: '4',
        deletedAt: null,
      }),
    },
    $transaction: async (
      fn: (tx: {
        scheduleSegment: { update: (args: { data: Record<string, unknown> }) => Promise<typeof existing> };
        vacatedSlot: { create: (args: { data: Record<string, unknown> }) => Promise<void> };
        scheduleEvent: { create: () => Promise<void> };
        activityLog: { create: () => Promise<void> };
      }) => Promise<unknown>,
    ) =>
      fn({
        scheduleSegment: {
          update: async ({ data }) => {
            if (data.startDatetime instanceof Date) {
              existing.startDatetime = data.startDatetime;
            }
            if (data.endDatetime instanceof Date) {
              existing.endDatetime = data.endDatetime;
            }
            if (typeof data.notes === 'string' || data.notes === null) {
              existing.notes = data.notes;
            }
            return existing;
          },
        },
        vacatedSlot: {
          create: async ({ data }) => {
            vacatedCreates.push(data);
          },
        },
        scheduleEvent: { create: async () => undefined },
        activityLog: { create: async () => undefined },
      }),
  };

  return {
    app: buildServer({ prisma: prisma as unknown as PrismaClient }, { verifyToken: createTestVerifier() }),
    vacatedCreates,
    existing,
  };
}

function buildPushupHarness(): PushupHarness {
  const createdSegments: Array<Record<string, unknown>> = [];
  const updatedSlots: Array<Record<string, unknown>> = [];

  const slots = [
    {
      id: SLOT_ID,
      sourceSegmentId: SEGMENT_ID,
      startDatetime: new Date('2026-03-03T14:00:00.000Z'),
      endDatetime: new Date('2026-03-03T17:00:00.000Z'),
      slotHours: new Prisma.Decimal('3'),
      equipmentType: 'CRANE' as const,
      status: 'OPEN' as const,
      deletedAt: null,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      sourceSegmentId: SEGMENT_ID,
      startDatetime: new Date('2026-03-03T18:00:00.000Z'),
      endDatetime: new Date('2026-03-03T20:00:00.000Z'),
      slotHours: new Prisma.Decimal('2'),
      equipmentType: 'CRANE' as const,
      status: 'DISMISSED' as const,
      deletedAt: null,
    },
  ];

  const jobs = [
    {
      id: JOB_ID,
      customerId: 'cust-1',
      jobSiteAddress: '1 Main St',
      town: 'Beverly',
      equipmentType: 'CRANE' as const,
      craneModelSuitability: 'MODEL_1090' as const,
      estimateHoursCurrent: new Prisma.Decimal('2'),
      approvalDate: new Date('2026-01-10T00:00:00.000Z'),
      salesRepCode: 'REP1',
      winterFlag: false,
      frozenGroundFlag: false,
      preferredStartTime: null,
      preferredEndTime: null,
      customer: { name: 'Acme Tree' },
      jobBlockers: [],
      requirements: [],
      deletedAt: null,
      pushUpIfPossible: true,
      completedDate: null,
    },
    {
      id: 'job-2',
      customerId: 'cust-2',
      jobSiteAddress: '2 Oak St',
      town: 'Salem',
      equipmentType: 'CRANE' as const,
      craneModelSuitability: null,
      estimateHoursCurrent: new Prisma.Decimal('5'),
      approvalDate: new Date('2026-01-09T00:00:00.000Z'),
      salesRepCode: 'REP2',
      winterFlag: true,
      frozenGroundFlag: false,
      preferredStartTime: null,
      preferredEndTime: null,
      customer: { name: 'Bravo Tree' },
      jobBlockers: [{ id: 'b1', notes: null, blockerReason: { label: 'Permit hold' } }],
      requirements: [
        {
          id: 'r1',
          status: RequirementStatus.REQUIRED,
          requirementType: { label: 'Police Detail' },
        },
      ],
      deletedAt: null,
      pushUpIfPossible: true,
      completedDate: null,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      customerId: 'cust-3',
      jobSiteAddress: '3 Pine St',
      town: 'Danvers',
      equipmentType: 'BUCKET' as const,
      craneModelSuitability: null,
      estimateHoursCurrent: new Prisma.Decimal('3'),
      approvalDate: new Date('2026-01-11T00:00:00.000Z'),
      salesRepCode: 'REP3',
      winterFlag: false,
      frozenGroundFlag: false,
      preferredStartTime: null,
      preferredEndTime: null,
      customer: { name: 'Bucket Co' },
      jobBlockers: [],
      requirements: [],
      deletedAt: null,
      pushUpIfPossible: true,
      completedDate: null,
    },
  ];

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id === MANAGER_ID) {
          return { id: MANAGER_ID, role: 'MANAGER', active: true };
        }
        if (where.id === VIEWER_ID) {
          return { id: VIEWER_ID, role: 'VIEWER', active: true };
        }
        return null;
      },
    },
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    vacatedSlot: {
      findFirst: async ({ where }: { where: { id: string; deletedAt: null } }) =>
        slots.find((slot) => slot.id === where.id && slot.deletedAt === null) ?? null,
      findMany: async () => slots.filter((slot) => slot.status === 'OPEN').map((slot) => ({
        id: slot.id,
        startDatetime: slot.startDatetime,
        endDatetime: slot.endDatetime,
        slotHours: slot.slotHours,
        equipmentType: slot.equipmentType,
        status: slot.status,
      })),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const slot = slots.find((item) => item.id === where.id);
        if (!slot) {
          throw new Error('slot not found');
        }
        Object.assign(slot, data);
        updatedSlots.push({ id: slot.id, ...data });
        return slot;
      },
    },
    job: {
      findFirst: async ({ where }: { where: { id: string; deletedAt: null } }) =>
        jobs.find((job) => job.id === where.id && job.deletedAt === null) ?? null,
      findMany: async ({ where }: { where?: { equipmentType?: 'CRANE' | 'BUCKET' } }) =>
        jobs.filter((job) => (where?.equipmentType ? job.equipmentType === where.equipmentType : true)),
    },
    scheduleSegment: {
      findMany: async ({ where }: { where?: { jobId?: { in: string[] } } }) => {
        if (where?.jobId?.in) {
          return [];
        }
        return [];
      },
      findFirst: async () => ({ id: SEGMENT_ID, segmentRosterLink: null }),
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `segment-${createdSegments.length + 1}`, ...data };
        createdSegments.push(created);
        return created;
      },
    },
    segmentRosterLink: {
      create: async () => undefined,
    },
    activityLog: {
      create: async () => undefined,
    },
    $transaction: async (input: unknown) => {
      if (typeof input === 'function') {
        return (input as (tx: {
          scheduleSegment: { create: typeof prisma.scheduleSegment.create };
          segmentRosterLink: { create: typeof prisma.segmentRosterLink.create };
          vacatedSlot: { update: typeof prisma.vacatedSlot.update };
          activityLog: { create: typeof prisma.activityLog.create };
        }) => Promise<unknown>)({
          scheduleSegment: prisma.scheduleSegment,
          segmentRosterLink: prisma.segmentRosterLink,
          vacatedSlot: prisma.vacatedSlot,
          activityLog: prisma.activityLog,
        });
      }
      throw new Error('Unsupported transaction mode in mock');
    },
  };

  return {
    app: buildServer({ prisma: prisma as unknown as PrismaClient }, { verifyToken: createTestVerifier() }),
    createdSegments,
    updatedSlots,
  };
}

describe('pushup smoke', () => {
  test('delete/move/shorten/no-op vacated-slot behavior remains correct', async () => {
    const moveHarness = buildPatchHarness();

    const moveResponse = await moveHarness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: testAuthHeaders(MANAGER_ID),
      payload: {
        startDatetime: '2026-03-03T17:00:00.000Z',
        endDatetime: '2026-03-03T21:00:00.000Z',
      },
    });
    expect(moveResponse.statusCode).toBe(200);
    expect(moveHarness.vacatedCreates[0]?.sourceAction).toBe('MOVED');

    const shortenHarness = buildPatchHarness();
    const shortenResponse = await shortenHarness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: testAuthHeaders(MANAGER_ID),
      payload: {
        endDatetime: '2026-03-03T17:00:00.000Z',
      },
    });
    expect(shortenResponse.statusCode).toBe(200);
    expect(shortenHarness.vacatedCreates[0]?.sourceAction).toBe('SHORTENED');

    const noOpHarness = buildPatchHarness();
    const noOpResponse = await noOpHarness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: testAuthHeaders(MANAGER_ID),
      payload: { notes: 'notes only' },
    });
    expect(noOpResponse.statusCode).toBe(200);
    expect(noOpHarness.vacatedCreates).toHaveLength(0);

    const deleteHarness = buildPatchHarness();
    const deleteResponse = await deleteHarness.app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: testAuthHeaders(MANAGER_ID),
    });
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteHarness.vacatedCreates.some((slot) => slot.sourceAction === 'DELETED')).toBe(true);

    await Promise.all([
      moveHarness.app.close(),
      shortenHarness.app.close(),
      noOpHarness.app.close(),
      deleteHarness.app.close(),
    ]);
  });

  test('GET /api/pushup/candidates returns shape and tier ordering', async () => {
    const harness = buildPushupHarness();
    const response = await harness.app.inject({
      method: 'GET',
      url: `/api/pushup/candidates?vacatedSlotId=${SLOT_ID}`,
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      vacatedSlot: { id: string };
      candidates: Array<{ jobId: string; tier: number }>;
    };

    expect(body.vacatedSlot.id).toBe(SLOT_ID);
    expect(Array.isArray(body.candidates)).toBe(true);
    expect(body.candidates.length).toBeGreaterThan(1);
    expect(body.candidates[0].tier).toBe(1);
    expect(body.candidates[1].tier).toBe(2);

    await harness.app.close();
  });

  test('GET /api/pushup/candidates returns empty for non-open slot', async () => {
    const harness = buildPushupHarness();
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/pushup/candidates?vacatedSlotId=55555555-5555-4555-8555-555555555555',
      headers: testAuthHeaders(MANAGER_ID),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { candidates: unknown[] };
    expect(body.candidates).toHaveLength(0);

    await harness.app.close();
  });

  test('POST /api/pushup/apply creates segment and marks slot USED', async () => {
    const harness = buildPushupHarness();
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/pushup/apply',
      headers: testAuthHeaders(MANAGER_ID),
      payload: {
        vacatedSlotId: SLOT_ID,
        jobId: JOB_ID,
        allocatedHours: 2,
        startDatetime: '2026-03-03T14:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { result: 'ACCEPT' | 'REJECT' };
    expect(body.result).toBe('ACCEPT');
    expect(harness.createdSegments.length).toBe(1);
    expect(harness.updatedSlots.some((slot) => slot.status === 'USED')).toBe(true);

    await harness.app.close();
  });

  test('POST /api/pushup/apply wrong equipment rejects', async () => {
    const harness = buildPushupHarness();
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/pushup/apply',
      headers: testAuthHeaders(MANAGER_ID),
      payload: {
        vacatedSlotId: SLOT_ID,
        jobId: '66666666-6666-4666-8666-666666666666',
        allocatedHours: 1,
        startDatetime: '2026-03-03T14:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { result: 'ACCEPT' | 'REJECT' };
    expect(body.result).toBe('REJECT');

    await harness.app.close();
  });

  test('POST /api/pushup/dismiss marks slot DISMISSED', async () => {
    const harness = buildPushupHarness();
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/pushup/dismiss',
      headers: testAuthHeaders(MANAGER_ID),
      payload: { vacatedSlotId: SLOT_ID },
    });

    expect(response.statusCode).toBe(200);
    expect(harness.updatedSlots.some((slot) => slot.status === 'DISMISSED')).toBe(true);

    await harness.app.close();
  });

  test('VIEWER gets 403 on pushup write endpoints', async () => {
    const harness = buildPushupHarness();

    const applyResponse = await harness.app.inject({
      method: 'POST',
      url: '/api/pushup/apply',
      headers: testAuthHeaders(VIEWER_ID, 'VIEWER'),
      payload: {
        vacatedSlotId: SLOT_ID,
        jobId: JOB_ID,
        allocatedHours: 1,
        startDatetime: '2026-03-03T14:00:00.000Z',
      },
    });
    expect(applyResponse.statusCode).toBe(403);

    const dismissResponse = await harness.app.inject({
      method: 'POST',
      url: '/api/pushup/dismiss',
      headers: testAuthHeaders(VIEWER_ID, 'VIEWER'),
      payload: { vacatedSlotId: SLOT_ID },
    });
    expect(dismissResponse.statusCode).toBe(403);

    await harness.app.close();
  });
});
