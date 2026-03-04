import { EquipmentType, PrismaClient, ResourceType, UserRole } from '@prisma/client';

const ORG_SETTINGS_ID = '11111111-1111-4111-8111-111111111111';

if (process.env.NODE_ENV === 'production') {
  console.error('seed-lan-demo is disabled in production.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith('--date='))?.slice('--date='.length) ?? '2026-03-03';

const prisma = new PrismaClient();

function parseDateOnlyUtc(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid --date value: ${value}`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const serviceDate = parseDateOnlyUtc(dateArg);

  const actor =
    (await prisma.user.findFirst({ where: { active: true }, orderBy: { id: 'asc' } })) ??
    (await prisma.user.create({
      data: {
        name: 'LAN Scheduler',
        email: `lan-scheduler-${Date.now()}@example.com`,
        role: UserRole.SCHEDULER,
        active: true,
      },
    }));

  await prisma.orgSettings.upsert({
    where: { id: ORG_SETTINGS_ID },
    update: { companyTimezone: 'America/New_York' },
    create: { id: ORG_SETTINGS_ID, companyTimezone: 'America/New_York' },
  });

  const homeBase =
    (await prisma.homeBase.findFirst({ where: { name: 'LAN Demo Base' } })) ??
    (await prisma.homeBase.create({
      data: {
        name: 'LAN Demo Base',
        addressLine1: '100 Demo Rd',
        city: 'Albany',
        state: 'NY',
        postalCode: '12207',
        openingMinute: 420,
        closingMinute: 1020,
      },
    }));

  const foreman =
    (await prisma.resource.findFirst({ where: { name: 'LAN Demo Foreman' } })) ??
    (await prisma.resource.create({
      data: {
        resourceType: ResourceType.PERSON,
        name: 'LAN Demo Foreman',
        isForeman: true,
      },
    }));

  const customer =
    (await prisma.customer.findFirst({ where: { name: 'LAN Demo Customer' } })) ??
    (await prisma.customer.create({ data: { name: 'LAN Demo Customer' } }));

  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      equipmentType: EquipmentType.CRANE,
      salesRepCode: 'LAN',
      jobSiteAddress: '200 Demo Jobsite Ave',
      town: 'Albany',
      amountDollars: '1250.00',
      estimateHoursCurrent: '2.00',
      travelHoursEstimate: '0.50',
      notesRaw: '',
      availabilityNotes: '7am-5pm',
    },
  });

  const roster = await prisma.foremanDayRoster.upsert({
    where: {
      date_foremanPersonId: {
        date: serviceDate,
        foremanPersonId: foreman.id,
      },
    },
    update: {},
    create: {
      date: serviceDate,
      foremanPersonId: foreman.id,
      homeBaseId: homeBase.id,
      preferredStartMinute: 480,
      createdByUserId: actor.id,
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        actorUserId: actor.id,
        homeBaseId: homeBase.id,
        foremanPersonId: foreman.id,
        rosterId: roster.id,
        jobId: job.id,
        date: dateArg,
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

