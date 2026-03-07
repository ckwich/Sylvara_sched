import { EquipmentType, Prisma, PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

type EquipmentSection = 'CRANE' | 'BUCKET';
type MetricName = 'scheduledHours' | 'tbsHours' | 'totalHours' | 'crewCount';

type WeekMetrics = {
  scheduledHours: Prisma.Decimal | null;
  tbsHours: Prisma.Decimal | null;
  totalHours: Prisma.Decimal | null;
  crewCount: Prisma.Decimal | null;
  yearHint: number | null;
};

type ParseResult = {
  rows: Array<{
    snapshotDate: Date;
    year: number;
    weekNumber: number;
    equipmentType: EquipmentType;
    salesRepCode: null;
    scheduledDollars: null;
    tbsDollars: null;
    totalDollars: null;
    scheduledHours: Prisma.Decimal;
    tbsHours: Prisma.Decimal;
    totalHours: Prisma.Decimal;
    crewCount: Prisma.Decimal;
    crewCountOverride: null;
  }>;
  reconciliation: {
    yearsParsed: number[];
    weeksReadPerYear: Record<string, number>;
    snapshotsCreated: number;
    weeksSkippedAllNull: number;
    parseErrors: Array<{ row: number; reason: string }>;
  };
};

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

function dateOnlyToUtc(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function shiftDateOnly(value: Date, dayDelta: number): Date {
  const shifted = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + dayDelta));
  return shifted;
}

function normalizeToSunday(value: Date): Date {
  const utc = dateOnlyToUtc(value);
  const dow = utc.getUTCDay(); // Sunday = 0
  return shiftDateOnly(utc, -dow);
}

function parseNumeric(value: ExcelJS.CellValue): Prisma.Decimal | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Prisma.Decimal(value);
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/[$,%\s,]/g, '').trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return new Prisma.Decimal(parsed);
    }
    return null;
  }
  if (typeof value === 'object' && 'result' in value) {
    return parseNumeric(value.result ?? null);
  }
  return null;
}

function parseDateCell(value: ExcelJS.CellValue): Date | null {
  if (value instanceof Date) {
    return dateOnlyToUtc(value);
  }
  if (typeof value === 'number') {
    // Excel serial date (1900 system with leap-year bug offset)
    const millis = Math.round((value - 25569) * 86400 * 1000);
    const parsed = new Date(millis);
    if (!Number.isNaN(parsed.getTime())) {
      return dateOnlyToUtc(parsed);
    }
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return dateOnlyToUtc(parsed);
    }
  }
  return null;
}

function detectMetricLabel(cells: string[]): MetricName | null {
  const joined = cells.join(' ').toUpperCase();
  if (joined.includes('ON BOARD')) {
    return 'scheduledHours';
  }
  if (joined.includes('TO BE SCHED') || joined.includes('TBS')) {
    return 'tbsHours';
  }
  if (joined.includes('TOTAL')) {
    return 'totalHours';
  }
  if (joined.includes('CREW')) {
    return 'crewCount';
  }
  return null;
}

function detectEquipment(cells: string[], previous: EquipmentSection | null): EquipmentSection | null {
  const joined = cells.join(' ').toUpperCase();
  if (joined.includes('CRANE')) {
    return 'CRANE';
  }
  if (joined.includes('BUCKET')) {
    return 'BUCKET';
  }
  return previous;
}

function detectYear(cells: string[]): number | null {
  for (const cell of cells) {
    const maybeYear = Number(cell.trim());
    if (Number.isInteger(maybeYear) && maybeYear >= 2010 && maybeYear <= 2100) {
      return maybeYear;
    }
  }
  return null;
}

async function parseComparableWorkbook(path: string): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Workbook has no worksheets.');
  }

  const parseErrors: Array<{ row: number; reason: string }> = [];
  const weekMetricsByKey = new Map<string, WeekMetrics>();
  const weekColumns = new Map<number, Date>();
  const yearsSeen = new Set<number>();
  const weeksReadPerYear = new Map<number, Set<string>>();

  let currentEquipment: EquipmentSection | null = null;
  let currentYearHint: number | null = null;

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const stringCells = row.values
      .slice(1)
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);
    if (stringCells.length === 0 && row.cellCount === 0) {
      continue;
    }

    const detectedYear = detectYear(stringCells);
    if (detectedYear !== null) {
      currentYearHint = detectedYear;
      yearsSeen.add(detectedYear);
    }

    currentEquipment = detectEquipment(stringCells, currentEquipment);

    // Detect week header columns whenever this row has multiple date-like cells.
    let headerDateCells = 0;
    const rowDateColumns = new Map<number, Date>();
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const parsedDate = parseDateCell(cell.value);
      if (parsedDate) {
        headerDateCells += 1;
        rowDateColumns.set(colNumber, parsedDate);
      }
    });
    if (headerDateCells >= 4) {
      weekColumns.clear();
      for (const [col, date] of rowDateColumns.entries()) {
        weekColumns.set(col, date);
      }
      continue;
    }

    const metric = detectMetricLabel(stringCells);
    if (!metric || !currentEquipment || weekColumns.size === 0) {
      continue;
    }

    for (const [colNumber, date] of weekColumns.entries()) {
      const metricValue = parseNumeric(row.getCell(colNumber).value);
      const weekSunday = normalizeToSunday(date);
      const key = `${currentEquipment}|${weekSunday.toISOString().slice(0, 10)}`;
      const existing = weekMetricsByKey.get(key) ?? {
        scheduledHours: null,
        tbsHours: null,
        totalHours: null,
        crewCount: null,
        yearHint: currentYearHint,
      };
      existing[metric] = metricValue;
      if (existing.yearHint === null) {
        existing.yearHint = currentYearHint;
      }
      weekMetricsByKey.set(key, existing);
    }
  }

  const rows: ParseResult['rows'] = [];
  let weeksSkippedAllNull = 0;

  for (const [key, metrics] of weekMetricsByKey.entries()) {
    const [equipment, dateOnly] = key.split('|');
    const snapshotDate = new Date(`${dateOnly}T00:00:00.000Z`);
    const hasAnyMetric =
      metrics.scheduledHours !== null ||
      metrics.tbsHours !== null ||
      metrics.totalHours !== null ||
      metrics.crewCount !== null;
    if (!hasAnyMetric) {
      weeksSkippedAllNull += 1;
      continue;
    }

    const iso = isoWeekYearAndNumber(snapshotDate);
    const year = metrics.yearHint ?? iso.year;
    if (!weeksReadPerYear.has(year)) {
      weeksReadPerYear.set(year, new Set());
    }
    weeksReadPerYear.get(year)!.add(dateOnly);

    rows.push({
      snapshotDate,
      year,
      weekNumber: iso.weekNumber,
      equipmentType: equipment as EquipmentType,
      salesRepCode: null,
      scheduledDollars: null,
      tbsDollars: null,
      totalDollars: null,
      scheduledHours: metrics.scheduledHours ?? new Prisma.Decimal(0),
      tbsHours: metrics.tbsHours ?? new Prisma.Decimal(0),
      totalHours:
        metrics.totalHours ?? (metrics.scheduledHours ?? new Prisma.Decimal(0)).add(metrics.tbsHours ?? new Prisma.Decimal(0)),
      crewCount: metrics.crewCount ?? new Prisma.Decimal(0),
      crewCountOverride: null,
    });
  }

  return {
    rows,
    reconciliation: {
      yearsParsed: Array.from(yearsSeen).sort((a, b) => a - b),
      weeksReadPerYear: Object.fromEntries(
        Array.from(weeksReadPerYear.entries()).map(([year, weeks]) => [String(year), weeks.size]),
      ),
      snapshotsCreated: rows.length,
      weeksSkippedAllNull,
      parseErrors,
    },
  };
}

async function main() {
  const cliPath = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  const inputPath = cliPath ?? process.env.COMPARABLE_SHEET_PATH;
  if (!inputPath) {
    throw new Error('Comparable workbook path is required via COMPARABLE_SHEET_PATH or first CLI argument.');
  }

  const prisma = new PrismaClient();
  try {
    const parsed = await parseComparableWorkbook(inputPath);
    const created = await prisma.weeklyBacklogSnapshot.createMany({
      data: parsed.rows,
      skipDuplicates: true,
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          inputPath,
          yearsParsed: parsed.reconciliation.yearsParsed,
          weeksReadPerYear: parsed.reconciliation.weeksReadPerYear,
          snapshotsAttempted: parsed.rows.length,
          snapshotsCreated: created.count,
          weeksSkippedAllNull: parsed.reconciliation.weeksSkippedAllNull,
          parseErrors: parsed.reconciliation.parseErrors,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
