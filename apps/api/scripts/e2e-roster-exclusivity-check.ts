import { PrismaClient, ResourceType, UserRole } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  console.error('e2e-roster-exclusivity-check is disabled in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const suffix = Date.now();
  const date = new Date('2026-03-03T00:00:00.000Z');

  const actor = await prisma.user.create({
    data: {
      name: `E2E Actor ${suffix}`,
      email: `e2e-roster-${suffix}@example.com`,
      role: UserRole.SCHEDULER,
      active: true,
    },
  });

  const homeBase = await prisma.homeBase.create({
    data: {
      name: `E2E Base ${suffix}`,
      addressLine1: '1 Test Way',
      city: 'Albany',
      state: 'NY',
      postalCode: '12207',
    },
  });

  const foremanA = await prisma.resource.create({
    data: {
      resourceType: ResourceType.PERSON,
      name: `E2E Foreman A ${suffix}`,
      isForeman: true,
    },
  });
  const foremanB = await prisma.resource.create({
    data: {
      resourceType: ResourceType.PERSON,
      name: `E2E Foreman B ${suffix}`,
      isForeman: true,
    },
  });
  const crew = await prisma.resource.create({
    data: {
      resourceType: ResourceType.PERSON,
      name: `E2E Crew ${suffix}`,
      isForeman: false,
    },
  });

  const rosterA = await prisma.foremanDayRoster.create({
    data: {
      date,
      foremanPersonId: foremanA.id,
      homeBaseId: homeBase.id,
      createdByUserId: actor.id,
    },
  });
  const rosterB = await prisma.foremanDayRoster.create({
    data: {
      date,
      foremanPersonId: foremanB.id,
      homeBaseId: homeBase.id,
      createdByUserId: actor.id,
    },
  });

  await prisma.foremanDayRosterMember.create({
    data: {
      rosterId: rosterA.id,
      date,
      personResourceId: crew.id,
      role: 'GROUND',
    },
  });

  let uniqueViolationObserved = false;
  try {
    await prisma.foremanDayRosterMember.create({
      data: {
        rosterId: rosterB.id,
        date,
        personResourceId: crew.id,
        role: 'GROUND',
      },
    });
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === 'P2002') {
      uniqueViolationObserved = true;
    } else {
      throw error;
    }
  }

  if (!uniqueViolationObserved) {
    throw new Error('Expected roster exclusivity unique violation was not observed.');
  }

  console.log(
    JSON.stringify({
      ok: true,
      date: '2026-03-03',
      uniqueViolationObserved,
    }),
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
