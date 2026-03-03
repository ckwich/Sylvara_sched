import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { PrismaClient, EquipmentType, ResourceType, UserRole } from '@prisma/client';
import { buildServer } from '../../src/server';

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error('TEST_DATABASE_URL (or DATABASE_URL) is required for integration tests.');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

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

async function truncateTestTables() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "activity_logs",
      "schedule_events",
      "segment_roster_links",
      "schedule_segments",
      "travel_segments",
      "foreman_day_rosters",
      "foreman_day_roster_members",
      "resource_reservations",
      "job_preferred_channels",
      "job_access_constraints",
      "requirements",
      "requirement_types",
      "job_blockers",
      "blocker_reasons",
      "estimate_history",
      "vacated_slots",
      "jobs",
      "customers",
      "home_bases",
      "resources",
      "org_settings",
      "users"
    RESTART IDENTITY CASCADE
  `);
}

async function seedBaseFixture() {
  const actor = await prisma.user.create({
    data: {
      name: 'Scheduler One',
      email: 'scheduler1@example.com',
      role: UserRole.SCHEDULER,
    },
  });

  await prisma.orgSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      companyTimezone: 'America/New_York',
    },
    update: {
      companyTimezone: 'America/New_York',
    },
  });

  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Customer',
      phone: '555-0100',
      email: 'acme@example.com',
    },
  });

  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      jobSiteAddress: '100 Main St',
      town: 'Albany',
      amountDollars: '1000',
      estimateHoursCurrent: '2',
      travelHoursEstimate: '0',
      notesRaw: '',
    },
  });

  const homeBase = await prisma.homeBase.create({
    data: {
      name: 'Base A',
      addressLine1: '1 Depot Way',
      city: 'Albany',
      state: 'NY',
      postalCode: '12207',
      openingMinute: 420,
      closingMinute: 1020,
    },
  });

  const foreman = await prisma.resource.create({
    data: {
      resourceType: ResourceType.PERSON,
      name: 'Foreman A',
      isForeman: true,
    },
  });

  const roster = await prisma.foremanDayRoster.create({
    data: {
      date: new Date('2026-03-03T00:00:00.000Z'),
      foremanPersonId: foreman.id,
      homeBaseId: homeBase.id,
      preferredStartMinute: 480,
      createdByUserId: actor.id,
    },
  });

  return { actor, job, roster, foreman };
}

describe('schedule segment integration (real postgres)', () => {
  beforeEach(async () => {
    await truncateTestTables();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('CRUD + foreman/job read endpoints exclude orphan segments', async () => {
    const { actor, job, roster, foreman } = await seedBaseFixture();
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
        segmentType: 'PRIMARY',
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
});
