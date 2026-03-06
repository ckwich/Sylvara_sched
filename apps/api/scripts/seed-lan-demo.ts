import { EquipmentType, PrismaClient, ResourceType, UserRole } from '@prisma/client';
import { DEFAULT_TIMEZONE, localDateMinuteToUtc } from '@sylvara/shared';

const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';
const COMPANY_TIMEZONE = DEFAULT_TIMEZONE;

if (process.env.NODE_ENV === 'production') {
  console.error('seed-lan-demo is disabled in production.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith('--date='))?.slice('--date='.length) ?? todayDateOnly();

const prisma = new PrismaClient();

type SeedJob = {
  customerName: string;
  town: string;
  equipmentType: EquipmentType;
  salesRepCode: 'REP1' | 'REP2' | 'REP3';
  amountDollars: string;
  estimateHoursCurrent: string;
  pushUpIfPossible?: boolean;
  schedulePlan?: {
    foremanName: string;
    startMinute: number;
    durationMinutes: number;
  };
};

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDateOnlyUtc(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid --date value: ${value}`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

async function wipeExistingData() {
  await prisma.activityLog.deleteMany();
  await prisma.segmentRosterLink.deleteMany();
  await prisma.resourceReservation.deleteMany();
  await prisma.scheduleNotificationLog.deleteMany();
  await prisma.scheduleEvent.deleteMany();
  await prisma.travelSegment.deleteMany();

  // Requested wipe order starts here.
  await prisma.vacatedSlot.deleteMany();
  await prisma.scheduleSegment.deleteMany();
  await prisma.foremanDayRosterMember.deleteMany();
  await prisma.foremanDayRoster.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.jobPreferredChannel.deleteMany();
  await prisma.jobAccessConstraint.deleteMany();
  await prisma.estimateHistory.deleteMany();
  await prisma.jobBlocker.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.homeBase.deleteMany();
  await prisma.orgSettings.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const serviceDate = parseDateOnlyUtc(dateArg);

  await wipeExistingData();

  const actor = await prisma.user.create({
    data: {
      name: 'Dispatch Manager',
      email: 'dispatch@irontreeservice.com',
      role: UserRole.MANAGER,
      active: true,
    },
  });

  const orgSettings = await prisma.orgSettings.create({
    data: {
      id: ORG_SETTINGS_ID,
      companyTimezone: COMPANY_TIMEZONE,
      operatingStartMinute: 300,
      operatingEndMinute: 1140,
    },
  });

  const homeBases = await Promise.all([
    prisma.homeBase.create({
      data: {
        name: 'Iron Tree - Beverly',
        addressLine1: '12 Rantoul St',
        city: 'Beverly',
        state: 'MA',
        postalCode: '01915',
        openingMinute: 300,
        closingMinute: 1140,
        active: true,
      },
    }),
    prisma.homeBase.create({
      data: {
        name: 'Iron Tree - Natick',
        addressLine1: '22 North Main St',
        city: 'Natick',
        state: 'MA',
        postalCode: '01760',
        openingMinute: 300,
        closingMinute: 1140,
        active: true,
      },
    }),
  ]);

  const foremanNames = ['Mike D.', 'Tom R.', 'Chris B.', 'Jason W.'] as const;
  const crewMembersByForeman: Record<(typeof foremanNames)[number], string[]> = {
    'Mike D.': ['Steve M.', 'Dave K.'],
    'Tom R.': ['Luis R.', 'Brian T.'],
    'Chris B.': ['Kevin F.', 'Mark S.'],
    'Jason W.': ['Paul N.', 'Eric H.'],
  };

  const foremen = await Promise.all(
    foremanNames.map((name) =>
      prisma.resource.create({
        data: {
          resourceType: ResourceType.PERSON,
          name,
          inventoryQuantity: 1,
          isForeman: true,
          active: true,
        },
      }),
    ),
  );

  const crewResources = await Promise.all(
    Object.values(crewMembersByForeman)
      .flat()
      .map((name) =>
        prisma.resource.create({
          data: {
            resourceType: ResourceType.PERSON,
            name,
            inventoryQuantity: 1,
            isForeman: false,
            active: true,
          },
        }),
      ),
  );

  const foremanByName = new Map(foremen.map((foreman) => [foreman.name, foreman]));
  const crewByName = new Map(crewResources.map((crew) => [crew.name, crew]));

  const rosters = await Promise.all(
    foremen.map((foreman, index) =>
      prisma.foremanDayRoster.create({
        data: {
          date: serviceDate,
          foremanPersonId: foreman.id,
          homeBaseId: index < 2 ? homeBases[0].id : homeBases[1].id,
          preferredStartMinute: 420,
          preferredEndMinute: 960,
          createdByUserId: actor.id,
        },
      }),
    ),
  );
  const rosterByForemanId = new Map(rosters.map((roster) => [roster.foremanPersonId, roster]));

  const rosterMembers = await Promise.all(
    foremanNames.flatMap((foremanName) =>
      crewMembersByForeman[foremanName].map((crewName, idx) =>
        prisma.foremanDayRosterMember.create({
          data: {
            rosterId: rosterByForemanId.get(foremanByName.get(foremanName)!.id)!.id,
            date: serviceDate,
            personResourceId: crewByName.get(crewName)!.id,
            role: idx === 0 ? 'CLIMBER' : 'GROUND',
          },
        }),
      ),
    ),
  );

  const jobsToSeed: SeedJob[] = [
    // TBS (5)
    {
      customerName: 'Harbor View Condo Association',
      town: 'Marblehead',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      amountDollars: '3200.00',
      estimateHoursCurrent: '6.00',
      pushUpIfPossible: true,
    },
    {
      customerName: 'Essex Street Properties',
      town: 'Salem',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP2',
      amountDollars: '2800.00',
      estimateHoursCurrent: '5.00',
    },
    {
      customerName: 'Lighthouse Estates HOA',
      town: 'Gloucester',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP3',
      amountDollars: '4100.00',
      estimateHoursCurrent: '8.00',
    },
    {
      customerName: 'Maple Hill Residence',
      town: 'Newton',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP1',
      amountDollars: '1250.00',
      estimateHoursCurrent: '3.00',
    },
    {
      customerName: 'Oak Lane Residence',
      town: 'Wellesley',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP2',
      amountDollars: '950.00',
      estimateHoursCurrent: '2.50',
    },
    // PARTIALLY_SCHEDULED (4)
    {
      customerName: 'Pine Meadow Farm',
      town: 'Andover',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP3',
      amountDollars: '3600.00',
      estimateHoursCurrent: '6.00',
      schedulePlan: { foremanName: 'Mike D.', startMinute: 420, durationMinutes: 180 },
    },
    {
      customerName: 'Green Street Commons',
      town: 'Beverly',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP1',
      amountDollars: '2200.00',
      estimateHoursCurrent: '5.00',
      schedulePlan: { foremanName: 'Tom R.', startMinute: 480, durationMinutes: 180 },
    },
    {
      customerName: 'Lexington Woodlands LLC',
      town: 'Lexington',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP2',
      amountDollars: '1400.00',
      estimateHoursCurrent: '4.00',
      schedulePlan: { foremanName: 'Chris B.', startMinute: 540, durationMinutes: 120 },
    },
    {
      customerName: 'South Main Property Group',
      town: 'Natick',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP3',
      amountDollars: '1800.00',
      estimateHoursCurrent: '3.50',
      schedulePlan: { foremanName: 'Jason W.', startMinute: 780, durationMinutes: 120 },
    },
    // FULLY_SCHEDULED (2)
    {
      customerName: 'Cedar Knoll Estates',
      town: 'Needham',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP1',
      amountDollars: '1100.00',
      estimateHoursCurrent: '2.00',
      schedulePlan: { foremanName: 'Mike D.', startMinute: 660, durationMinutes: 120 },
    },
    {
      customerName: 'Willow Creek Apartments',
      town: 'Salem',
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'REP2',
      amountDollars: '4500.00',
      estimateHoursCurrent: '4.00',
      schedulePlan: { foremanName: 'Tom R.', startMinute: 720, durationMinutes: 240 },
    },
    // Extra BUCKET mixed in requested area
    {
      customerName: 'Old Town Real Estate Trust',
      town: 'Needham',
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: 'REP3',
      amountDollars: '800.00',
      estimateHoursCurrent: '2.00',
    },
  ];

  const createdJobs: Array<{ id: string; customerId: string; town: string; schedulePlan?: SeedJob['schedulePlan'] }> =
    [];
  for (const seedJob of jobsToSeed) {
    const customer = await prisma.customer.create({
      data: {
        name: seedJob.customerName,
      },
    });

    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        equipmentType: seedJob.equipmentType,
        salesRepCode: seedJob.salesRepCode,
        jobSiteAddress: `${Math.floor(Math.random() * 900) + 100} ${seedJob.town} St`,
        town: seedJob.town,
        amountDollars: seedJob.amountDollars,
        estimateHoursCurrent: seedJob.estimateHoursCurrent,
        travelHoursEstimate: '0.50',
        notesRaw: '',
        pushUpIfPossible: seedJob.pushUpIfPossible ?? false,
      },
    });

    createdJobs.push({
      id: job.id,
      customerId: customer.id,
      town: job.town,
      schedulePlan: seedJob.schedulePlan,
    });
  }

  const createdSegments: string[] = [];
  for (const scheduledJob of createdJobs.filter((job) => job.schedulePlan)) {
    const schedulePlan = scheduledJob.schedulePlan!;
    const foreman = foremanByName.get(schedulePlan.foremanName);
    if (!foreman) {
      continue;
    }
    const roster = rosterByForemanId.get(foreman.id);
    if (!roster) {
      continue;
    }

    const startDatetime = localDateMinuteToUtc(dateArg, schedulePlan.startMinute, COMPANY_TIMEZONE);
    const endDatetime = localDateMinuteToUtc(
      dateArg,
      schedulePlan.startMinute + schedulePlan.durationMinutes,
      COMPANY_TIMEZONE,
    );

    const segment = await prisma.scheduleSegment.create({
      data: {
        jobId: scheduledJob.id,
        segmentType: 'PRIMARY',
        startDatetime,
        endDatetime,
        createdByUserId: actor.id,
      },
    });

    await prisma.segmentRosterLink.create({
      data: {
        scheduleSegmentId: segment.id,
        rosterId: roster.id,
        createdByUserId: actor.id,
      },
    });

    createdSegments.push(segment.id);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        date: dateArg,
        orgSettingsId: orgSettings.id,
        actorUserId: actor.id,
        homeBaseIds: homeBases.map((homeBase) => homeBase.id),
        foremanIds: foremen.map((foreman) => foreman.id),
        crewMemberIds: crewResources.map((crewMember) => crewMember.id),
        rosterIds: rosters.map((roster) => roster.id),
        rosterMemberIds: rosterMembers.map((member) => member.id),
        customerIds: createdJobs.map((job) => job.customerId),
        jobIds: createdJobs.map((job) => job.id),
        scheduleSegmentIds: createdSegments,
        counts: {
          jobsTotal: createdJobs.length,
          tbs: 5,
          partiallyScheduled: 4,
          fullyScheduled: 2,
          pushUpIfPossible: 1,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
