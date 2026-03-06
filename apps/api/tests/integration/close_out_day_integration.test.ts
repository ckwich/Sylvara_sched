import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { TravelType } from '@prisma/client';
import { buildServer } from '../../src/server';
import { createLinkedSegment, makePrisma, resetDb, seedBase } from './_helpers/db';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const prisma = makePrisma();
const TEST_TZ = 'America/New_York';

function localDate(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '0');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0');
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

describe('close-out-day integration (real postgres)', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('happy path creates END_OF_DAY travel with actor attribution and local-day boundaries', async () => {
    const { actor, job, roster, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '2',
    });

    await createLinkedSegment(prisma, {
      jobId: job.id,
      rosterId: roster.id,
      createdByUserId: actor.id,
      startDatetime: new Date('2026-03-03T14:00:00.000Z'),
      endDatetime: new Date('2026-03-03T16:00:00.000Z'),
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        foremanPersonId: foreman.id,
        date,
        durationMinutes: 45,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.travelSegment).toBeDefined();

    const travel = await prisma.travelSegment.findMany({
      where: {
        foremanPersonId: foreman.id,
        serviceDate: new Date(`${date}T00:00:00.000Z`),
        deletedAt: null,
      },
    });
    expect(travel).toHaveLength(1);
    expect(travel[0].travelType).toBe(TravelType.END_OF_DAY);
    expect(travel[0].serviceDate.toISOString().startsWith('2026-03-03')).toBe(true);

    const startLocalDate = localDate(travel[0].startDatetime.toISOString(), TEST_TZ);
    const endLocalDate = localDate(travel[0].endDatetime.toISOString(), TEST_TZ);
    expect(startLocalDate).toBe('2026-03-03');
    expect(endLocalDate).toBe('2026-03-03');

    const activity = await prisma.activityLog.findFirst({
      where: {
        entityType: 'TravelSegment',
        entityId: travel[0].id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(activity).not.toBeNull();
    expect(activity?.actorUserId).toBe(actor.id);

    const event = await prisma.scheduleEvent.findFirst({
      where: {
        actorUserId: actor.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(event).not.toBeNull();
    expect(event?.eventType).toBe('MANUAL_EDIT');
    await app.close();
  });

  test('repeat call is deterministic and keeps exactly one active END_OF_DAY travel', async () => {
    const { actor, job, roster, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '2',
    });

    await createLinkedSegment(prisma, {
      jobId: job.id,
      rosterId: roster.id,
      createdByUserId: actor.id,
      startDatetime: new Date('2026-03-03T14:00:00.000Z'),
      endDatetime: new Date('2026-03-03T16:00:00.000Z'),
    });

    const app = buildServer({ prisma });

    const first = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        foremanPersonId: foreman.id,
        date,
        durationMinutes: 45,
      },
    });
    expect(first.statusCode).toBe(200);
    expect(first.json().result).toBe('ACCEPT');

    const second = await app.inject({
      method: 'POST',
      url: '/api/travel/close-out-day',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        foremanPersonId: foreman.id,
        date,
        durationMinutes: 45,
      },
    });
    expect(second.statusCode).toBe(200);
    const secondBody = second.json();
    expect(secondBody.result).toBe('REJECT');
    expect(secondBody.rejections[0].code).toBe('END_OF_DAY_ALREADY_EXISTS');

    const activeCount = await prisma.travelSegment.count({
      where: {
        foremanPersonId: foreman.id,
        serviceDate: new Date(`${date}T00:00:00.000Z`),
        travelType: TravelType.END_OF_DAY,
        deletedAt: null,
      },
    });
    expect(activeCount).toBe(1);
    await app.close();
  });
});
