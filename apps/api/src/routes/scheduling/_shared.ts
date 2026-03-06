import { Prisma, type PrismaClient } from '@prisma/client';
import {
  DEFAULT_TIMEZONE,
  isUtcOnLocalTenMinuteBoundary,
  localDateBoundsToUtc,
  localDateMinuteToUtc,
  parseIsoToUtcDate,
  utcToLocalDateStr,
  utcToLocalParts,
} from '@sylvara/shared';
import { z } from 'zod';
import { computeScheduledEffectiveHours, deriveJobState } from '../../scheduling/job-state.js';

export type AppDeps = {
  prisma: PrismaClient;
};

export const uuidSchema = z.string().uuid();

export function dateOnlyToUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function localDayBoundsUtc(localDate: string, timezone: string): { startUtc: Date; endUtc: Date } {
  return localDateBoundsToUtc(localDate, timezone);
}

export function minuteOfLocalDate(value: Date, timezone: string): number {
  const local = utcToLocalParts(value, timezone);
  return local.hour * 60 + local.minute;
}

export function localDateAtMinute(date: string, minute: number, timezone: string): Date {
  return localDateMinuteToUtc(date, minute, timezone);
}

export function crossesLocalMidnight(start: Date, end: Date, timezone: string): boolean {
  return utcToLocalDateStr(start, timezone) !== utcToLocalDateStr(end, timezone);
}

export function localDateIso(value: Date, timezone: string): string {
  return utcToLocalDateStr(value, timezone);
}

export function isTenMinuteBoundary(value: Date, timezone: string): boolean {
  return isUtcOnLocalTenMinuteBoundary(value, timezone);
}

export function parseIsoDatetime(value: string): Date | null {
  return parseIsoToUtcDate(value);
}

export async function getDerivedJobState(input: {
  prisma: PrismaClient;
  jobId: string;
  timezone: string;
}) {
  const job = await input.prisma.job.findUnique({
    where: { id: input.jobId },
    select: {
      id: true,
      completedDate: true,
      estimateHoursCurrent: true,
    },
  });

  if (!job) {
    return null;
  }

  const activeSegments = await input.prisma.scheduleSegment.findMany({
    where: {
      jobId: input.jobId,
      deletedAt: null,
      segmentRosterLink: {
        isNot: null,
      },
    },
    select: {
      startDatetime: true,
      endDatetime: true,
      scheduledHoursOverride: true,
    },
  });

  const scheduledEffectiveHours = computeScheduledEffectiveHours({
    timezone: input.timezone,
    segments: activeSegments,
  });

  return {
    jobId: input.jobId,
    scheduledEffectiveHours: scheduledEffectiveHours.toString(),
    state: deriveJobState({
      completedDate: job.completedDate,
      estimateHoursCurrent: job.estimateHoursCurrent,
      scheduledEffectiveHours,
    }),
  };
}

export async function hasActiveBookingConflict(input: {
  prisma: PrismaClient;
  foremanPersonId: string;
  serviceDate: Date;
  startDatetime: Date;
  endDatetime: Date;
  excludeScheduleSegmentId?: string;
}): Promise<boolean> {
  const [overlappingSegment, overlappingTravel] = await Promise.all([
    input.prisma.scheduleSegment.findFirst({
      where: {
        deletedAt: null,
        ...(input.excludeScheduleSegmentId !== undefined
          ? { id: { not: input.excludeScheduleSegmentId } }
          : {}),
        startDatetime: { lt: input.endDatetime },
        endDatetime: { gt: input.startDatetime },
        segmentRosterLink: {
          is: {
            roster: {
              foremanPersonId: input.foremanPersonId,
              date: input.serviceDate,
            },
          },
        },
      },
      select: { id: true },
    }),
    input.prisma.travelSegment.findFirst({
      where: {
        foremanPersonId: input.foremanPersonId,
        deletedAt: null,
        startDatetime: { lt: input.endDatetime },
        endDatetime: { gt: input.startDatetime },
      },
      select: { id: true },
    }),
  ]);

  return overlappingSegment !== null || overlappingTravel !== null;
}

export function resolveTimezone(input: { companyTimezone: string | null | undefined }): string {
  return input.companyTimezone ?? DEFAULT_TIMEZONE;
}

export function toDecimalHours(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}
