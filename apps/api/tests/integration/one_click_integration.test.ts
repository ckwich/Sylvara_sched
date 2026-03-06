import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { buildServer } from '../../src/server';
import { makePrisma, resetDb, seedBase } from './_helpers/db';
import { lanAuthHeaders } from '../fixtures/lanAuthHeaders';

const prisma = makePrisma();
const TEST_TZ = 'America/New_York';

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

describe('one-click scheduling integration (real postgres)', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('snap floors requestedStartMinute 559 to 550 local and creates segment', async () => {
    const { actor, job, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '1',
      availabilityNotes: null,
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        jobId: job.id,
        foremanPersonId: foreman.id,
        date,
        requestedStartMinute: 559,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    const local = localParts(body.segment.startDatetime, TEST_TZ);
    expect(local.date).toBe('2026-03-03');
    expect(local.minute).toBe(550);

    const linkCount = await prisma.segmentRosterLink.count({
      where: { scheduleSegmentId: body.segment.id },
    });
    expect(linkCount).toBe(1);
    await app.close();
  });

  test('rejects CROSSES_MIDNIGHT when requested start forces segment past local midnight', async () => {
    const { actor, job, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '1',
      availabilityNotes: null,
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        jobId: job.id,
        foremanPersonId: foreman.id,
        date,
        requestedStartMinute: 1410,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('CROSSES_MIDNIGHT');
    await app.close();
  });

  test('rejects CUSTOMER_WINDOW_CONFLICT for parseable window that excludes proposed segment', async () => {
    const { actor, job, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '2',
      availabilityNotes: '9am-11am',
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        jobId: job.id,
        foremanPersonId: foreman.id,
        date,
        requestedStartMinute: 630,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('REJECT');
    expect(body.rejections[0].code).toBe('CUSTOMER_WINDOW_CONFLICT');
    await app.close();
  });

  test('accepts with CUSTOMER_WINDOW_NOT_CONFIGURED warning when window is unparseable', async () => {
    const { actor, job, foreman, date } = await seedBase(prisma, {
      date: '2026-03-03',
      estimateHoursCurrent: '1',
      availabilityNotes: 'mornings only',
    });

    const app = buildServer({ prisma });
    const response = await app.inject({
      method: 'POST',
      url: '/api/schedule/one-click-attempt',
      headers: lanAuthHeaders('POST', String(actor.id)),
      payload: {
        jobId: job.id,
        foremanPersonId: foreman.id,
        date,
        requestedStartMinute: 630,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result).toBe('ACCEPT');
    expect(body.warnings.map((w: { code: string }) => w.code)).toContain(
      'CUSTOMER_WINDOW_NOT_CONFIGURED',
    );
    await app.close();
  });
});
