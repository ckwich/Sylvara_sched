import { EquipmentType, Prisma, type PrismaClient } from '@prisma/client';
import { DEFAULT_TIMEZONE, utcToLocalDateStr } from '@sylvara/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireActor, validationError } from '../http/route-helpers.js';

type AppDeps = {
  prisma: PrismaClient;
};

const comparableQuerySchema = z.object({
  years: z.string().optional(),
  equipment: z.enum(['CRANE', 'BUCKET', 'ALL']).optional().default('ALL'),
});

type SummAccumulator = {
  salesRepCode: string;
  bucketScheduled: Prisma.Decimal;
  bucketTbs: Prisma.Decimal;
  craneScheduled: Prisma.Decimal;
  craneTbs: Prisma.Decimal;
};

function decimalOrZero(value: Prisma.Decimal | null): Prisma.Decimal {
  return value ?? new Prisma.Decimal(0);
}

function toNumber(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

function parseYearsParam(value: string | undefined): number[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((token) => Number(token.trim()))
    .filter((year) => Number.isInteger(year) && year >= 2015 && year <= 2040);
}

function dateOnlyFromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function registerReportRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get('/api/reports/summ', async (request, reply) => {
    if (!(await requireActor({ request, reply, prisma: deps.prisma }))) {
      return;
    }

    const [settings, jobs, scheduledGroups, snapshots] = await deps.prisma.$transaction([
      deps.prisma.orgSettings.findFirst({
        where: { deletedAt: null },
        select: {
          companyTimezone: true,
          salesPerDay: true,
        },
      }),
      deps.prisma.job.findMany({
        where: {
          deletedAt: null,
          completedDate: null,
        },
        select: {
          id: true,
          salesRepCode: true,
          equipmentType: true,
          amountDollars: true,
        },
      }),
      deps.prisma.scheduleSegment.groupBy({
        by: ['jobId'],
        where: {
          deletedAt: null,
        },
        orderBy: {
          jobId: 'asc',
        },
      }),
      deps.prisma.weeklyBacklogSnapshot.findMany({
        where: {
          deletedAt: null,
          salesRepCode: { not: null },
        },
        select: {
          snapshotDate: true,
          salesRepCode: true,
          totalDollars: true,
        },
        orderBy: [{ snapshotDate: 'desc' }],
      }),
    ]);

    const timezone = settings?.companyTimezone ?? DEFAULT_TIMEZONE;
    const reportDate = utcToLocalDateStr(new Date(), timezone);
    const scheduledJobIds = new Set(scheduledGroups.map((row) => row.jobId));
    const rowsByRep = new Map<string, SummAccumulator>();

    for (const job of jobs) {
      const rep = job.salesRepCode.trim();
      const current = rowsByRep.get(rep) ?? {
        salesRepCode: rep,
        bucketScheduled: new Prisma.Decimal(0),
        bucketTbs: new Prisma.Decimal(0),
        craneScheduled: new Prisma.Decimal(0),
        craneTbs: new Prisma.Decimal(0),
      };
      const amount = decimalOrZero(job.amountDollars);
      const isScheduled = scheduledJobIds.has(job.id);

      if (job.equipmentType === EquipmentType.BUCKET) {
        if (isScheduled) {
          current.bucketScheduled = current.bucketScheduled.add(amount);
        } else {
          current.bucketTbs = current.bucketTbs.add(amount);
        }
      } else if (isScheduled) {
        current.craneScheduled = current.craneScheduled.add(amount);
      } else {
        current.craneTbs = current.craneTbs.add(amount);
      }

      rowsByRep.set(rep, current);
    }

    const snapshotsByRep = new Map<string, Prisma.Decimal | null>();
    for (const rep of rowsByRep.keys()) {
      const repSnapshots = snapshots.filter(
        (row) => row.salesRepCode === rep && dateOnlyFromUtc(row.snapshotDate) < reportDate,
      );
      if (repSnapshots.length === 0) {
        snapshotsByRep.set(rep, null);
        continue;
      }

      const latestDate = dateOnlyFromUtc(repSnapshots[0].snapshotDate);
      const latestRows = repSnapshots.filter((row) => dateOnlyFromUtc(row.snapshotDate) === latestDate);
      if (latestRows.some((row) => row.totalDollars === null)) {
        snapshotsByRep.set(rep, null);
        continue;
      }

      snapshotsByRep.set(
        rep,
        latestRows.reduce(
          (sum, row) => sum.add(row.totalDollars ?? new Prisma.Decimal(0)),
          new Prisma.Decimal(0),
        ),
      );
    }

    const rows = Array.from(rowsByRep.values()).map((row) => {
      const bucketTotal = row.bucketScheduled.add(row.bucketTbs);
      const craneTotal = row.craneScheduled.add(row.craneTbs);
      const combinedScheduled = row.bucketScheduled.add(row.craneScheduled);
      const combinedTbs = row.bucketTbs.add(row.craneTbs);
      const combinedTotal = combinedScheduled.add(combinedTbs);
      const priorWeek = snapshotsByRep.get(row.salesRepCode) ?? null;

      return {
        sales_rep_code: row.salesRepCode,
        bucket_scheduled_dollars: row.bucketScheduled.toNumber(),
        bucket_tbs_dollars: row.bucketTbs.toNumber(),
        bucket_total_dollars: bucketTotal.toNumber(),
        crane_scheduled_dollars: row.craneScheduled.toNumber(),
        crane_tbs_dollars: row.craneTbs.toNumber(),
        crane_total_dollars: craneTotal.toNumber(),
        combined_scheduled_dollars: combinedScheduled.toNumber(),
        combined_tbs_dollars: combinedTbs.toNumber(),
        combined_total_dollars: combinedTotal.toNumber(),
        pct_of_total: 0,
        prior_week_dollars: toNumber(priorWeek),
      };
    });

    rows.sort((a, b) => b.combined_total_dollars - a.combined_total_dollars);

    const totals = rows.reduce(
      (acc, row) => {
        acc.bucketScheduled = acc.bucketScheduled.add(row.bucket_scheduled_dollars);
        acc.bucketTbs = acc.bucketTbs.add(row.bucket_tbs_dollars);
        acc.craneScheduled = acc.craneScheduled.add(row.crane_scheduled_dollars);
        acc.craneTbs = acc.craneTbs.add(row.crane_tbs_dollars);
        if (row.prior_week_dollars !== null) {
          acc.priorWeek = acc.priorWeek.add(row.prior_week_dollars);
          acc.priorWeekCount += 1;
        }
        return acc;
      },
      {
        bucketScheduled: new Prisma.Decimal(0),
        bucketTbs: new Prisma.Decimal(0),
        craneScheduled: new Prisma.Decimal(0),
        craneTbs: new Prisma.Decimal(0),
        priorWeek: new Prisma.Decimal(0),
        priorWeekCount: 0,
      },
    );

    const bucketTotal = totals.bucketScheduled.add(totals.bucketTbs);
    const craneTotal = totals.craneScheduled.add(totals.craneTbs);
    const combinedScheduled = totals.bucketScheduled.add(totals.craneScheduled);
    const combinedTbs = totals.bucketTbs.add(totals.craneTbs);
    const combinedTotal = combinedScheduled.add(combinedTbs);

    for (const row of rows) {
      row.pct_of_total = combinedTotal.eq(0)
        ? 0
        : new Prisma.Decimal(row.combined_total_dollars).div(combinedTotal).toNumber();
    }

    const salesPerDay = settings?.salesPerDay ?? null;
    const priorWeekDollars = totals.priorWeekCount === 0 ? null : totals.priorWeek;
    const daysSalesInBacklog =
      salesPerDay === null || salesPerDay.lte(0) ? null : combinedTotal.div(salesPerDay);
    const priorWeekDaysSales =
      salesPerDay === null || salesPerDay.lte(0) || priorWeekDollars === null
        ? null
        : priorWeekDollars.div(salesPerDay);
    const daysSalesChange =
      daysSalesInBacklog === null || priorWeekDaysSales === null
        ? null
        : daysSalesInBacklog.sub(priorWeekDaysSales);

    return reply.code(200).send({
      report_date: reportDate,
      sales_per_day: toNumber(salesPerDay),
      rows,
      totals: {
        bucket_scheduled_dollars: totals.bucketScheduled.toNumber(),
        bucket_tbs_dollars: totals.bucketTbs.toNumber(),
        bucket_total_dollars: bucketTotal.toNumber(),
        crane_scheduled_dollars: totals.craneScheduled.toNumber(),
        crane_tbs_dollars: totals.craneTbs.toNumber(),
        crane_total_dollars: craneTotal.toNumber(),
        combined_scheduled_dollars: combinedScheduled.toNumber(),
        combined_tbs_dollars: combinedTbs.toNumber(),
        combined_total_dollars: combinedTotal.toNumber(),
        prior_week_dollars: toNumber(priorWeekDollars),
      },
      days_sales_in_backlog: toNumber(daysSalesInBacklog),
      prior_week_days_sales: toNumber(priorWeekDaysSales),
      days_sales_change: toNumber(daysSalesChange),
    });
  });

  app.get('/api/reports/comparable', async (request, reply) => {
    if (!(await requireActor({ request, reply, prisma: deps.prisma }))) {
      return;
    }

    const parsed = comparableQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return validationError(reply, 'Invalid comparable report query.', parsed.error.flatten());
    }

    const requestedYears = parseYearsParam(parsed.data.years);
    const [availableYearsRows, snapshots] = await deps.prisma.$transaction([
      deps.prisma.weeklyBacklogSnapshot.findMany({
        where: {
          deletedAt: null,
          salesRepCode: null,
        },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      }),
      deps.prisma.weeklyBacklogSnapshot.findMany({
        where: {
          deletedAt: null,
          salesRepCode: null,
          ...(requestedYears.length > 0 ? { year: { in: requestedYears } } : {}),
          ...(parsed.data.equipment === 'ALL'
            ? {}
            : {
                equipmentType:
                  parsed.data.equipment === 'CRANE' ? EquipmentType.CRANE : EquipmentType.BUCKET,
              }),
        },
        select: {
          year: true,
          weekNumber: true,
          equipmentType: true,
          scheduledHours: true,
          tbsHours: true,
          totalHours: true,
          crewCount: true,
          crewCountOverride: true,
          snapshotDate: true,
        },
        orderBy: [{ year: 'desc' }, { weekNumber: 'asc' }],
      }),
    ]);

    const availableYears = availableYearsRows.map((row) => row.year).sort((a, b) => b - a);
    const targetYears =
      requestedYears.length > 0
        ? requestedYears.filter((year) => availableYears.includes(year))
        : availableYears;

    const includeCrane = parsed.data.equipment === 'ALL' || parsed.data.equipment === 'CRANE';
    const includeBucket = parsed.data.equipment === 'ALL' || parsed.data.equipment === 'BUCKET';

    const build = (equipmentType: EquipmentType, enabled: boolean) => {
      if (!enabled) {
        return {} as Record<number, Record<number, unknown>>;
      }

      const byYear: Record<number, Record<number, unknown>> = {};
      for (const year of targetYears) {
        byYear[year] = {};
        for (let week = 1; week <= 53; week += 1) {
          byYear[year][week] = null;
        }
      }

      for (const row of snapshots) {
        if (row.equipmentType !== equipmentType || !targetYears.includes(row.year)) {
          continue;
        }
        const effectiveCrewCount = row.crewCountOverride ?? row.crewCount;
        byYear[row.year][row.weekNumber] = {
          scheduled_hours: row.scheduledHours.toNumber(),
          tbs_hours: row.tbsHours.toNumber(),
          total_hours: row.totalHours.toNumber(),
          crew_count: effectiveCrewCount.toNumber(),
          crew_days: row.totalHours.mul(effectiveCrewCount).toNumber(),
          snapshot_date: dateOnlyFromUtc(row.snapshotDate),
        };
      }
      return byYear;
    };

    return reply.code(200).send({
      available_years: availableYears,
      crane: build(EquipmentType.CRANE, includeCrane),
      bucket: build(EquipmentType.BUCKET, includeBucket),
    });
  });
}
