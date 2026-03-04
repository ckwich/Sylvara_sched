import { describe, expect, test } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildServer } from '../../src/server';

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const SEGMENT_ID = '22222222-2222-4222-8222-222222222222';
const JOB_ID = '33333333-3333-4333-8333-333333333333';

describe('A8 vacated slot on delete', () => {
  test('Soft-delete segment creates VacatedSlot(DELETED) OPEN with matching start/end and equipment type', async () => {
    const vacatedCreates: Array<Record<string, unknown>> = [];
    const startDatetime = new Date('2026-03-03T14:00:00.000Z');
    const endDatetime = new Date('2026-03-03T18:00:00.000Z');

    const app = buildServer({
      prisma: {
        user: {
          findUnique: async () => ({ id: ACTOR_ID }),
        },
        orgSettings: {
          findFirst: async () => ({ companyTimezone: 'America/New_York' }),
        },
        scheduleSegment: {
          findFirst: async () => ({
            id: SEGMENT_ID,
            jobId: JOB_ID,
            startDatetime,
            endDatetime,
            job: {
              equipmentType: 'CRANE',
            },
          }),
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
            scheduleSegment: { update: () => Promise<void> };
            vacatedSlot: { create: (args: { data: Record<string, unknown> }) => Promise<void> };
            scheduleEvent: { create: () => Promise<void> };
            activityLog: { create: () => Promise<void> };
          }) => Promise<void>,
        ) =>
          fn({
            scheduleSegment: { update: async () => undefined },
            vacatedSlot: {
              create: async ({ data }) => {
                vacatedCreates.push(data);
              },
            },
            scheduleEvent: { create: async () => undefined },
            activityLog: { create: async () => undefined },
          }),
      } as unknown as PrismaClient,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${SEGMENT_ID}`,
      headers: { 'x-actor-user-id': ACTOR_ID },
    });

    expect(response.statusCode).toBe(200);
    expect(vacatedCreates).toHaveLength(1);
    const created = vacatedCreates[0];
    expect(created.sourceAction).toBe('DELETED');
    expect(created.status).toBe('OPEN');
    expect(created.startDatetime).toEqual(startDatetime);
    expect(created.endDatetime).toEqual(endDatetime);
    expect(Number(created.slotHours)).toBeGreaterThan(0);
    expect(created.equipmentType).toBe('CRANE');
    await app.close();
  });
});
