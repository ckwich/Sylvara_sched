import { EquipmentType, Prisma, type PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, utcToLocalDateStr } from '@sylvara/shared';

export type SnapshotResult =
  | { status: 'CREATED'; snapshot_date: string; counts: { repRows: number; totalRows: number } }
  | { status: 'DUPLICATE'; snapshot_date: string; existingSnapshotDate: string };

type SnapshotRow = {
  snapshotDate: Date;
  year: number;
  weekNumber: number;
  equipmentType: EquipmentType;
  salesRepCode: string | null;
  scheduledDollars: Prisma.Decimal | null;
  tbsDollars: Prisma.Decimal | null;
  totalDollars: Prisma.Decimal | null;
  scheduledHours: Prisma.Decimal;
  tbsHours: Prisma.Decimal;
  totalHours: Prisma.Decimal;
  crewCount: Prisma.Decimal;
  crewCountOverride: Prisma.Decimal | null;
};

function parseDateOnlyUtc(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function localDayOfWeek(dateOnly: string): number {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function shiftDateOnly(dateOnly: string, dayDelta: number): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + dayDelta));
  return shifted.toISOString().slice(0, 10);
}

function toSaturdayAnchorDateOnly(inputDate: Date, timezone: string): string {
  const localDate = utcToLocalDateStr(inputDate, timezone);
  const dow = localDayOfWeek(localDate); // Sunday=0 ... Saturday=6
  const daysToSubtract = (dow + 1) % 7;
  return shiftDateOnly(localDate, -daysToSubtract);
}

function isoWeekYearAndNumber(value: Date): { year: number; weekNumber: number } {
  const utcMidnight = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const isoDay = ((utcMidnight.getUTCDay() + 6) % 7) + 1; // Mon=1 ... Sun=7
  const thursday = new Date(utcMidnight);
  thursday.setUTCDate(utcMidnight.getUTCDate() + 4 - isoDay);
  const weekYear = thursday.getUTCFullYear();
  const weekOne = new Date(Date.UTC(weekYear, 0, 1));
  const weekOneIsoDay = ((weekOne.getUTCDay() + 6) % 7) + 1;
  const weekOneThursday = new Date(weekOne);
  weekOneThursday.setUTCDate(weekOne.getUTCDate() + 4 - weekOneIsoDay);
  const diffMs = thursday.getTime() - weekOneThursday.getTime();
  const weekNumber = 1 + Math.round(diffMs / 604800000);
  return { year: weekYear, weekNumber };
}

function hasScheduledSegment(jobId: string, scheduledJobIds: Set<string>): boolean {
  return scheduledJobIds.has(jobId);
}

function sumDecimal(values: Array<Prisma.Decimal | null | undefined>): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>((acc, value) => {
    const next = value ?? new Prisma.Decimal(0);
    return acc.add(next);
  }, new Prisma.Decimal(0));
}

async function buildRowsForEquipment(input: {
  prisma: PrismaClient;
  snapshotDate: Date;
  year: number;
  weekNumber: number;
  equipmentType: EquipmentType;
  crewCount: Prisma.Decimal;
}): Promise<SnapshotRow[]> {
  const jobs = await input.prisma.job.findMany({
    where: {
      deletedAt: null,
      completedDate: null,
      equipmentType: input.equipmentType,
    },
    select: {
      id: true,
      salesRepCode: true,
      amountDollars: true,
      estimateHoursCurrent: true,
    },
  });

  const jobIds = jobs.map((job) => job.id);
  const scheduledRows =
    jobIds.length === 0
      ? []
      : await input.prisma.scheduleSegment.groupBy({
          by: ['jobId'],
          where: {
            deletedAt: null,
            jobId: { in: jobIds },
          },
          _count: {
            _all: true,
          },
        });

  const scheduledJobIds = new Set(scheduledRows.map((row) => row.jobId));
  const jobsByRep = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const rep = job.salesRepCode;
    const existing = jobsByRep.get(rep);
    if (existing) {
      existing.push(job);
    } else {
      jobsByRep.set(rep, [job]);
    }
  }

  const rows: SnapshotRow[] = [];
  for (const [salesRepCode, repJobs] of jobsByRep.entries()) {
    const scheduledJobs = repJobs.filter((job) => hasScheduledSegment(job.id, scheduledJobIds));
    const tbsJobs = repJobs.filter((job) => !hasScheduledSegment(job.id, scheduledJobIds));

    const scheduledDollars = sumDecimal(scheduledJobs.map((job) => job.amountDollars));
    const tbsDollars = sumDecimal(tbsJobs.map((job) => job.amountDollars));
    const totalDollars = scheduledDollars.add(tbsDollars);
    const scheduledHours = sumDecimal(scheduledJobs.map((job) => job.estimateHoursCurrent));
    const tbsHours = sumDecimal(tbsJobs.map((job) => job.estimateHoursCurrent));
    const totalHours = scheduledHours.add(tbsHours);

    rows.push({
      snapshotDate: input.snapshotDate,
      year: input.year,
      weekNumber: input.weekNumber,
      equipmentType: input.equipmentType,
      salesRepCode,
      scheduledDollars,
      tbsDollars,
      totalDollars,
      scheduledHours,
      tbsHours,
      totalHours,
      crewCount: input.crewCount,
      crewCountOverride: null,
    });
  }

  const equipmentScheduledJobs = jobs.filter((job) => hasScheduledSegment(job.id, scheduledJobIds));
  const equipmentTbsJobs = jobs.filter((job) => !hasScheduledSegment(job.id, scheduledJobIds));
  const equipmentScheduledDollars = sumDecimal(equipmentScheduledJobs.map((job) => job.amountDollars));
  const equipmentTbsDollars = sumDecimal(equipmentTbsJobs.map((job) => job.amountDollars));
  const equipmentScheduledHours = sumDecimal(equipmentScheduledJobs.map((job) => job.estimateHoursCurrent));
  const equipmentTbsHours = sumDecimal(equipmentTbsJobs.map((job) => job.estimateHoursCurrent));

  rows.push({
    snapshotDate: input.snapshotDate,
    year: input.year,
    weekNumber: input.weekNumber,
    equipmentType: input.equipmentType,
    salesRepCode: null,
    scheduledDollars: equipmentScheduledDollars,
    tbsDollars: equipmentTbsDollars,
    totalDollars: equipmentScheduledDollars.add(equipmentTbsDollars),
    scheduledHours: equipmentScheduledHours,
    tbsHours: equipmentTbsHours,
    totalHours: equipmentScheduledHours.add(equipmentTbsHours),
    crewCount: input.crewCount,
    crewCountOverride: null,
  });

  return rows;
}

export async function captureSnapshot(prisma: PrismaClient, date = new Date()): Promise<SnapshotResult> {
  const settings = await prisma.orgSettings.findFirst({
    where: { deletedAt: null },
    select: { companyTimezone: true },
  });
  const timezone = settings?.companyTimezone ?? DEFAULT_TIMEZONE;

  const saturdayDateOnly = toSaturdayAnchorDateOnly(date, timezone);
  const snapshotDate = parseDateOnlyUtc(saturdayDateOnly);
  const iso = isoWeekYearAndNumber(snapshotDate);

  const existingTotals = await prisma.weeklyBacklogSnapshot.findFirst({
    where: {
      snapshotDate,
      equipmentType: EquipmentType.CRANE,
      salesRepCode: null,
      deletedAt: null,
    },
    select: { snapshotDate: true },
  });
  if (existingTotals) {
    return {
      status: 'DUPLICATE',
      snapshot_date: saturdayDateOnly,
      existingSnapshotDate: formatDateOnly(existingTotals.snapshotDate),
    };
  }
  const existingBucketTotals = await prisma.weeklyBacklogSnapshot.findFirst({
    where: {
      snapshotDate,
      equipmentType: EquipmentType.BUCKET,
      salesRepCode: null,
      deletedAt: null,
    },
    select: { snapshotDate: true },
  });
  if (existingBucketTotals) {
    return {
      status: 'DUPLICATE',
      snapshot_date: saturdayDateOnly,
      existingSnapshotDate: formatDateOnly(existingBucketTotals.snapshotDate),
    };
  }

  const activeForemanCount = await prisma.resource.count({
    where: {
      deletedAt: null,
      active: true,
      isForeman: true,
      resourceType: 'PERSON',
    },
  });
  const crewCount = new Prisma.Decimal(activeForemanCount);

  const [craneRows, bucketRows] = await Promise.all([
    buildRowsForEquipment({
      prisma,
      snapshotDate,
      year: iso.year,
      weekNumber: iso.weekNumber,
      equipmentType: EquipmentType.CRANE,
      crewCount,
    }),
    buildRowsForEquipment({
      prisma,
      snapshotDate,
      year: iso.year,
      weekNumber: iso.weekNumber,
      equipmentType: EquipmentType.BUCKET,
      crewCount,
    }),
  ]);

  const rows = [...craneRows, ...bucketRows];
  await prisma.$transaction(async (tx) => {
    await tx.weeklyBacklogSnapshot.createMany({
      data: rows,
    });
  });

  const totalRows = rows.length;
  const repRows = totalRows - 2;

  return {
    status: 'CREATED',
    snapshot_date: saturdayDateOnly,
    counts: {
      repRows,
      totalRows,
    },
  };
}
