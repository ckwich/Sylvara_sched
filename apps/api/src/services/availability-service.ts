import type { PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, localDateMinuteToUtc } from '@sylvara/shared';

export type AvailabilityWarning = {
  code: 'RESOURCE_OVER_CAPACITY';
  resourceId: string;
  resourceName: string;
  reserved: number;
  available: number;
};

export type ConflictWarning = {
  code: 'PERSON_ON_MULTIPLE_ROSTERS';
  resourceId: string;
  resourceName: string;
  rosterIds: string[];
};

function nextDateIso(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

async function resolveTimezone(prisma: PrismaClient): Promise<string> {
  const settings = await prisma.orgSettings.findFirst({
    where: { deletedAt: null },
    select: { companyTimezone: true },
  });
  return settings?.companyTimezone ?? DEFAULT_TIMEZONE;
}

export async function checkResourceAvailability(
  prisma: PrismaClient,
  date: string,
  resourceId: string,
): Promise<AvailabilityWarning | null> {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      inventoryQuantity: true,
    },
  });
  if (!resource) {
    return null;
  }

  const timezone = await resolveTimezone(prisma);
  const startUtc = localDateMinuteToUtc(date, 0, timezone);
  const endUtc = localDateMinuteToUtc(nextDateIso(date), 0, timezone);

  const reservations = await prisma.resourceReservation.findMany({
    where: {
      resourceId: resource.id,
      deletedAt: null,
      scheduleSegment: {
        deletedAt: null,
        startDatetime: { lt: endUtc },
        endDatetime: { gt: startUtc },
      },
    },
    select: {
      quantity: true,
    },
  });

  const reserved = reservations.reduce((sum, item) => sum + item.quantity, 0);
  if (reserved > resource.inventoryQuantity) {
    return {
      code: 'RESOURCE_OVER_CAPACITY',
      resourceId: resource.id,
      resourceName: resource.name,
      reserved,
      available: resource.inventoryQuantity,
    };
  }
  return null;
}

export async function checkPersonConflict(
  prisma: PrismaClient,
  date: string,
  personResourceId: string,
): Promise<ConflictWarning | null> {
  const person = await prisma.resource.findFirst({
    where: {
      id: personResourceId,
      resourceType: 'PERSON',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });
  if (!person) {
    return null;
  }

  const day = new Date(`${date}T00:00:00.000Z`);
  const memberships = await prisma.foremanDayRosterMember.findMany({
    where: {
      personResourceId,
      date: day,
      deletedAt: null,
      roster: {
        deletedAt: null,
      },
    },
    select: {
      rosterId: true,
    },
  });

  const rosterIds = Array.from(new Set(memberships.map((item) => item.rosterId)));
  if (rosterIds.length > 1) {
    return {
      code: 'PERSON_ON_MULTIPLE_ROSTERS',
      resourceId: person.id,
      resourceName: person.name,
      rosterIds,
    };
  }
  return null;
}
