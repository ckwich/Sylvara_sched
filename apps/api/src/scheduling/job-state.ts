import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

export type DerivedJobState = 'TBS' | 'PARTIALLY_SCHEDULED' | 'FULLY_SCHEDULED' | 'COMPLETED';

export function computeScheduledEffectiveHours(input: {
  timezone: string;
  segments: Array<{
    startDatetime: Date;
    endDatetime: Date;
    scheduledHoursOverride: Prisma.Decimal | string | number | null;
  }>;
}): Prisma.Decimal {
  let total = new Prisma.Decimal(0);

  for (const segment of input.segments) {
    if (segment.scheduledHoursOverride !== null) {
      total = total.add(new Prisma.Decimal(segment.scheduledHoursOverride));
      continue;
    }

    const startLocal = DateTime.fromJSDate(segment.startDatetime, { zone: 'utc' }).setZone(input.timezone);
    const endLocal = DateTime.fromJSDate(segment.endDatetime, { zone: 'utc' }).setZone(input.timezone);
    const durationMinutes = Math.round(endLocal.diff(startLocal, 'minutes').minutes);
    total = total.add(new Prisma.Decimal(durationMinutes).div(60));
  }

  return total;
}

export function deriveJobState(input: {
  completedDate: Date | null;
  estimateHoursCurrent: Prisma.Decimal | string | number | null;
  scheduledEffectiveHours: Prisma.Decimal;
}): DerivedJobState {
  if (input.completedDate !== null) {
    return 'COMPLETED';
  }

  if (input.scheduledEffectiveHours.lte(0)) {
    return 'TBS';
  }

  if (input.estimateHoursCurrent === null) {
    return 'PARTIALLY_SCHEDULED';
  }

  const estimate = new Prisma.Decimal(input.estimateHoursCurrent);
  if (input.scheduledEffectiveHours.lt(estimate.sub(new Prisma.Decimal('0.01')))) {
    return 'PARTIALLY_SCHEDULED';
  }

  return 'FULLY_SCHEDULED';
}

