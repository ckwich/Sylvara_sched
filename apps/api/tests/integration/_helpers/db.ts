import {
  EquipmentType,
  PrismaClient,
  ResourceType,
  SegmentType,
  UserRole,
} from '@prisma/client';

const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';

export function makePrisma(): PrismaClient {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL (or DATABASE_URL) is required for integration tests.');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });
}

export async function resetDb(prisma: PrismaClient): Promise<void> {
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

export async function seedBase(
  prisma: PrismaClient,
  input?: {
    date?: string;
    estimateHoursCurrent?: string;
    availabilityNotes?: string | null;
    rosterPreferredStartMinute?: number | null;
  },
) {
  const date = input?.date ?? '2026-03-03';

  const actor = await prisma.user.create({
    data: {
      name: 'Scheduler One',
      email: 'scheduler1@example.com',
      role: UserRole.SCHEDULER,
    },
  });

  await prisma.orgSettings.upsert({
    where: { id: ORG_SETTINGS_ID },
    create: {
      id: ORG_SETTINGS_ID,
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
      estimateHoursCurrent: input?.estimateHoursCurrent ?? '2',
      travelHoursEstimate: '0',
      notesRaw: '',
      availabilityNotes: input?.availabilityNotes ?? null,
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
      date: new Date(`${date}T00:00:00.000Z`),
      foremanPersonId: foreman.id,
      homeBaseId: homeBase.id,
      preferredStartMinute: input?.rosterPreferredStartMinute ?? 480,
      createdByUserId: actor.id,
    },
  });

  return { actor, job, homeBase, foreman, roster, date };
}

export async function linkSegmentToRoster(
  prisma: PrismaClient,
  input: { scheduleSegmentId: string; rosterId: string; createdByUserId: string },
) {
  return prisma.segmentRosterLink.create({
    data: {
      scheduleSegmentId: input.scheduleSegmentId,
      rosterId: input.rosterId,
      createdByUserId: input.createdByUserId,
    },
  });
}

export async function createLinkedSegment(
  prisma: PrismaClient,
  input: {
    jobId: string;
    rosterId: string;
    createdByUserId: string;
    startDatetime: Date;
    endDatetime: Date;
  },
) {
  const segment = await prisma.scheduleSegment.create({
    data: {
      jobId: input.jobId,
      segmentType: SegmentType.PRIMARY,
      startDatetime: input.startDatetime,
      endDatetime: input.endDatetime,
      createdByUserId: input.createdByUserId,
    },
  });
  await linkSegmentToRoster(prisma, {
    scheduleSegmentId: segment.id,
    rosterId: input.rosterId,
    createdByUserId: input.createdByUserId,
  });
  return segment;
}

