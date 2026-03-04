import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { SegmentType } from '@prisma/client';
import { buildServer } from '../../src/server';
import { createLinkedSegment, makePrisma, resetDb, seedBase } from './_helpers/db';

const prisma = makePrisma();

function localParts(iso: string, timeZone: string): { date: string; minute: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));

  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '0');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    minute: hour * 60 + minute,
  };
}

describe('schedule segment integration (real postgres)', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('CRUD + foreman/job read endpoints exclude orphan segments', async () => {
    const { actor, job, roster, foreman } = await seedBase(prisma);
    const app = buildServer({ prisma });

    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });

    expect(created.statusCode).toBe(200);
    const createdBody = created.json();
    expect(createdBody.segment).toBeDefined();
    const createdSegmentId = createdBody.segment.id as number;

    const foremanRead = await app.inject({
      method: 'GET',
      url: `/api/foremen/${foreman.id}/schedule?date=2026-03-03`,
    });
    expect(foremanRead.statusCode).toBe(200);
    const foremanBody = foremanRead.json();
    expect(foremanBody.scheduleSegments).toHaveLength(1);
    expect(foremanBody.scheduleSegments[0].id).toBe(createdSegmentId);
    const local = localParts(foremanBody.scheduleSegments[0].startDatetime, 'America/New_York');
    expect(local.date).toBe('2026-03-03');
    expect(local.minute).toBe(540);

    const jobRead = await app.inject({
      method: 'GET',
      url: `/api/jobs/${job.id}/schedule-segments`,
    });
    expect(jobRead.statusCode).toBe(200);
    const jobBody = jobRead.json();
    expect(jobBody.segments).toHaveLength(1);
    expect(jobBody.jobState.state).toBe('FULLY_SCHEDULED');

    await prisma.scheduleSegment.create({
      data: {
        jobId: job.id,
        segmentType: SegmentType.PRIMARY,
        startDatetime: new Date('2026-03-03T18:00:00.000Z'),
        endDatetime: new Date('2026-03-03T19:00:00.000Z'),
        createdByUserId: actor.id,
      },
    });

    const foremanWithOrphan = await app.inject({
      method: 'GET',
      url: `/api/foremen/${foreman.id}/schedule?date=2026-03-03`,
    });
    expect(foremanWithOrphan.statusCode).toBe(200);
    expect(foremanWithOrphan.json().scheduleSegments).toHaveLength(1);

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${createdSegmentId}`,
      headers: { 'x-actor-user-id': String(actor.id) },
    });
    expect(deleted.statusCode).toBe(200);

    const foremanAfterDelete = await app.inject({
      method: 'GET',
      url: `/api/foremen/${foreman.id}/schedule?date=2026-03-03`,
    });
    expect(foremanAfterDelete.statusCode).toBe(200);
    expect(foremanAfterDelete.json().scheduleSegments).toHaveLength(0);

    await app.close();
  });

  test('rejects overlapping create and update with 409 and leaves DB unchanged', async () => {
    const { actor, job, roster } = await seedBase(prisma);
    const app = buildServer({ prisma });

    const first = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    expect(first.statusCode).toBe(200);

    const overlapCreate = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T14:30:00.000Z',
        endDatetime: '2026-03-03T15:30:00.000Z',
      },
    });
    expect(overlapCreate.statusCode).toBe(409);
    expect(overlapCreate.json().error.code).toBe('SCHEDULE_CONFLICT');

    const second = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T15:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    expect(second.statusCode).toBe(200);
    const secondId = second.json().segment.id as number;

    const overlapUpdate = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${secondId}`,
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        startDatetime: '2026-03-03T14:30:00.000Z',
        endDatetime: '2026-03-03T15:30:00.000Z',
      },
    });
    expect(overlapUpdate.statusCode).toBe(409);
    expect(overlapUpdate.json().error.code).toBe('SCHEDULE_CONFLICT');

    const secondDb = await prisma.scheduleSegment.findUnique({
      where: { id: secondId },
      select: { startDatetime: true, endDatetime: true },
    });
    expect(secondDb?.startDatetime.toISOString()).toBe('2026-03-03T15:00:00.000Z');
    expect(secondDb?.endDatetime.toISOString()).toBe('2026-03-03T16:00:00.000Z');

    const activeCount = await prisma.scheduleSegment.count({
      where: { jobId: job.id, deletedAt: null },
    });
    expect(activeCount).toBe(2);
    await app.close();
  });

  test('writes resize schedule_event using previous and new end datetimes', async () => {
    const { actor, job, roster } = await seedBase(prisma);
    const app = buildServer({ prisma });
    const created = await createLinkedSegment(prisma, {
      jobId: job.id,
      rosterId: roster.id,
      createdByUserId: actor.id,
      startDatetime: new Date('2026-03-03T14:00:00.000Z'),
      endDatetime: new Date('2026-03-03T15:00:00.000Z'),
    });

    const patched = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${created.id}`,
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    expect(patched.statusCode).toBe(200);

    const event = await prisma.scheduleEvent.findFirst({
      where: {
        jobId: job.id,
        eventType: 'SEGMENT_RESIZED',
      },
      orderBy: { createdAt: 'desc' },
      select: { fromAt: true, toAt: true },
    });
    expect(event?.fromAt?.toISOString()).toBe('2026-03-03T15:00:00.000Z');
    expect(event?.toAt?.toISOString()).toBe('2026-03-03T16:00:00.000Z');
    await app.close();
  });

  test('returns foreman/day activity feed scoped to roster-linked segments', async () => {
    const { actor, job, roster, foreman } = await seedBase(prisma);
    const app = buildServer({ prisma });

    const createdDayOne = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T15:00:00.000Z',
      },
    });
    expect(createdDayOne.statusCode).toBe(200);
    const dayOneSegmentId = createdDayOne.json().segment.id as number;

    const rosterDayTwo = await prisma.foremanDayRoster.create({
      data: {
        date: new Date('2026-03-04T00:00:00.000Z'),
        foremanPersonId: foreman.id,
        homeBaseId: roster.homeBaseId,
        createdByUserId: actor.id,
      },
    });

    const createdDayTwo = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: rosterDayTwo.id,
        startDatetime: '2026-03-04T14:00:00.000Z',
        endDatetime: '2026-03-04T15:00:00.000Z',
      },
    });
    expect(createdDayTwo.statusCode).toBe(200);
    const dayTwoSegmentId = createdDayTwo.json().segment.id as number;

    const dayOneActivity = await app.inject({
      method: 'GET',
      url: `/api/foremen/${foreman.id}/activity?date=2026-03-03`,
    });
    expect(dayOneActivity.statusCode).toBe(200);
    const dayOneBody = dayOneActivity.json() as {
      entries: Array<{ segmentId: number | null; action: string; jobId: number | null }>;
    };
    expect(dayOneBody.entries.length).toBeGreaterThan(0);
    expect(dayOneBody.entries.some((entry) => entry.segmentId === dayOneSegmentId)).toBe(true);
    expect(dayOneBody.entries.some((entry) => entry.segmentId === dayTwoSegmentId)).toBe(false);
    expect(dayOneBody.entries[0]?.action).toBeTruthy();
    expect(dayOneBody.entries[0]?.jobId).toBe(job.id);

    await app.close();
  });

  test('supports delete then restore undo path for a schedule segment', async () => {
    const { actor, job, roster, foreman } = await seedBase(prisma);
    const app = buildServer({ prisma });

    const created = await app.inject({
      method: 'POST',
      url: '/api/schedule-segments',
      headers: { 'x-actor-user-id': String(actor.id) },
      payload: {
        jobId: job.id,
        rosterId: roster.id,
        startDatetime: '2026-03-03T14:00:00.000Z',
        endDatetime: '2026-03-03T16:00:00.000Z',
      },
    });
    expect(created.statusCode).toBe(200);
    const segmentId = created.json().segment.id as number;

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/schedule-segments/${segmentId}`,
      headers: { 'x-actor-user-id': String(actor.id) },
    });
    expect(deleted.statusCode).toBe(200);

    const restored = await app.inject({
      method: 'PATCH',
      url: `/api/schedule-segments/${segmentId}/restore`,
      headers: { 'x-actor-user-id': String(actor.id) },
    });
    expect(restored.statusCode).toBe(200);

    const foremanRead = await app.inject({
      method: 'GET',
      url: `/api/foremen/${foreman.id}/schedule?date=2026-03-03`,
    });
    expect(foremanRead.statusCode).toBe(200);
    expect(foremanRead.json().scheduleSegments).toHaveLength(1);

    await app.close();
  });
});
