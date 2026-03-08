import { prisma } from '@sylvara/db';
import { fileURLToPath } from 'node:url';

type SeedClient = {
  requirementType: {
    upsert: (args: {
      where: { code: string };
      update: { label: string; active: boolean; deletedAt: null };
      create: { code: string; label: string; active: boolean };
    }) => Promise<unknown>;
  };
  blockerReason: SeedClient['requirementType'];
  accessConstraint: SeedClient['requirementType'];
};

export const BLOCKER_REASONS = [
  { code: 'PERMIT_PENDING', label: 'Permit Pending' },
  { code: 'CUSTOMER_UNRESPONSIVE', label: 'Customer Unresponsive' },
  { code: 'ACCESS_BLOCKED', label: 'Access Blocked' },
  { code: 'NEIGHBOR_CONSENT_NEEDED', label: 'Neighbor Consent Needed' },
  { code: 'FROZEN_GROUND_REQUIRED', label: 'Frozen Ground Required' },
  { code: 'WINTER_TIMING', label: 'Winter Timing' },
  { code: 'UTILITY_COORDINATION', label: 'Utility Coordination' },
  { code: 'WEATHER_DELAY', label: 'Weather Delay' },
  { code: 'OTHER', label: 'Other' },
] as const;

export const ACCESS_CONSTRAINTS = [
  { code: 'DRIVEWAY_BLOCKED', label: 'Driveway blocked' },
  { code: 'NEIGHBOR_DRIVEWAY_ACCESS', label: 'Neighbor driveway access' },
  { code: 'GATE_CODE_NEEDED', label: 'Gate/code needed' },
  { code: 'VEHICLES_MUST_BE_MOVED', label: 'Vehicles must be moved' },
  { code: 'STREET_PARKING_CONSTRAINTS', label: 'Street/parking constraints' },
  { code: 'OTHER', label: 'Other' },
] as const;

export const REQUIREMENT_TYPES = [
  { code: 'POLICE_DETAIL', label: 'Police Detail' },
  { code: 'CRANE_AND_BOOM_PERMIT', label: 'Crane & Boom Permit' },
  { code: 'TREE_PERMIT', label: 'Tree Permit' },
] as const;

export async function seedAdminLists(client: SeedClient): Promise<void> {
  for (const item of REQUIREMENT_TYPES) {
    await prisma.requirementType.upsert({
      where: { code: item.code },
      update: { label: item.label, active: true, deletedAt: null },
      create: { code: item.code, label: item.label, active: true },
    });
  }

  for (const item of BLOCKER_REASONS) {
    await prisma.blockerReason.upsert({
      where: { code: item.code },
      update: { label: item.label, active: true, deletedAt: null },
      create: { code: item.code, label: item.label, active: true },
    });
  }

  for (const item of ACCESS_CONSTRAINTS) {
    await prisma.accessConstraint.upsert({
      where: { code: item.code },
      update: { label: item.label, active: true, deletedAt: null },
      create: { code: item.code, label: item.label, active: true },
    });
  }

  console.log(
    JSON.stringify(
      {
        seeded: {
          requirementTypes: REQUIREMENT_TYPES.length,
          blockerReasons: BLOCKER_REASONS.length,
          accessConstraints: ACCESS_CONSTRAINTS.length,
        },
      },
      null,
      2,
    ),
  );
}

async function main() {
  await seedAdminLists(prisma);
}
const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
