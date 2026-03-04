import { describe, expect, test } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const SEGMENT_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';

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
      findUnique: async () => ({ id: ACTOR_ID }),
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
    app: buildServer({ prisma: prisma as unknown as PrismaClient }),
    vacatedCreates,
    existing,
  };
}

describe('A9 vacated slot on move and shorten', () => {
  test('Move segment creates VacatedSlot(MOVED) for old window', async () => {
    const harness = buildPatchHarness();
    const oldStart = new Date(harness.existing.startDatetime.getTime());
    const oldEnd = new Date(harness.existing.endDatetime.getTime());

    const response = await harness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        startDatetime: '2026-03-03T17:00:00.000Z',
        endDatetime: '2026-03-03T21:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(harness.vacatedCreates).toHaveLength(1);
    const slot = harness.vacatedCreates[0];
    expect(slot.sourceAction).toBe('MOVED');
    expect(slot.startDatetime).toEqual(oldStart);
    expect(slot.endDatetime).toEqual(oldEnd);
    expect(Number(slot.slotHours)).toBeGreaterThan(0);
    await harness.app.close();
  });

  test('Shorten segment end creates VacatedSlot(SHORTENED) for released tail', async () => {
    const harness = buildPatchHarness();
    const oldEnd = new Date(harness.existing.endDatetime.getTime());

    const response = await harness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        endDatetime: '2026-03-03T17:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(harness.vacatedCreates).toHaveLength(1);
    const slot = harness.vacatedCreates[0];
    expect(slot.sourceAction).toBe('SHORTENED');
    expect(slot.startDatetime).toEqual(new Date('2026-03-03T17:00:00.000Z'));
    expect(slot.endDatetime).toEqual(oldEnd);
    expect(Number(slot.slotHours)).toBeGreaterThan(0);
    await harness.app.close();
  });

  test('No-op notes-only edit does not create a VacatedSlot', async () => {
    const harness = buildPatchHarness();

    const response = await harness.app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: { 'x-actor-user-id': ACTOR_ID },
      payload: {
        notes: 'Updated notes only',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(harness.vacatedCreates).toHaveLength(0);
    await harness.app.close();
  });
});
