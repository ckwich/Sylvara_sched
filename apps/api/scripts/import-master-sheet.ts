import { EquipmentType, EventSource, Prisma, PrismaClient, RequirementStatus, ScheduleEventType, SegmentType } from '@prisma/client';
import ExcelJS from 'exceljs';
import { localDateMinuteToUtc } from '@sylvara/shared';
import { DEFAULT_TIMEZONE } from '@sylvara/shared';

type ParseWarning = {
  row: number;
  field: string;
  raw: string;
  reason: string;
};

type SheetReconciliation = {
  rowsRead: number;
  rowsSkipped: number;
  jobsCreated: number;
  segmentsCreated: number;
  scheduleEventsCreated: number;
  requirementsCreated: number;
  parseWarnings: ParseWarning[];
};

type ImportReconciliation = {
  sheets: Record<string, SheetReconciliation>;
  totals: {
    jobsCreated: number;
    segmentsCreated: number;
    scheduleEventsCreated: number;
    requirementsCreated: number;
    totalParseWarnings: number;
  };
  unhappyMatched: number;
  unhappyUnmatched: number;
};

type SheetConfig = {
  name: string;
  equipmentType: EquipmentType;
  completed: boolean;
  unable: boolean;
};

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends' | '$use'>;

const COL = {
  customerName: 0,
  address: 1,
  town: 2,
  approvalCall: 3,
  confirmed: 4,
  approvalDate: 5,
  scheduledDate: 6,
  amountDollars: 7,
  hoursTbs: 8,
  scheduledHours: 9,
  model1090OrLift: 10,
  model1060: 11,
  modelEither: 12,
  winterFlag: 13,
  frozenFlag: 14,
  notes: 15,
  stumpLanguage: 16,
  signed: 17,
} as const;

const JOB_SHEETS: SheetConfig[] = [
  { name: 'CRANE', equipmentType: EquipmentType.CRANE, completed: false, unable: false },
  { name: 'BUCKET', equipmentType: EquipmentType.BUCKET, completed: false, unable: false },
  { name: '2026 Crane Completed', equipmentType: EquipmentType.CRANE, completed: true, unable: false },
  { name: '2026 Bucket Completed', equipmentType: EquipmentType.BUCKET, completed: true, unable: false },
  { name: "Winter_26-'27_Crane", equipmentType: EquipmentType.CRANE, completed: false, unable: false },
  { name: "Winter 26-'27_Bucket", equipmentType: EquipmentType.BUCKET, completed: false, unable: false },
  { name: 'DS Crane TBS', equipmentType: EquipmentType.CRANE, completed: false, unable: false },
  { name: 'DS Bucket TBS', equipmentType: EquipmentType.BUCKET, completed: false, unable: false },
  { name: 'DS OLD CRANE', equipmentType: EquipmentType.CRANE, completed: false, unable: false },
  { name: 'DS OLD BUCKET', equipmentType: EquipmentType.BUCKET, completed: false, unable: false },
  { name: 'UNABLE TO BE SCHEDULED', equipmentType: EquipmentType.CRANE, completed: false, unable: true },
];

const UNHAPPY_SHEET_NAME = 'Unhappy Customer';

const REP_MARKERS = new Set(['ANTHONY:', 'DENNIS:', 'MICHAEL:']);
const SUMMARY_MARKERS = new Set(['TOTAL HRS:', 'TOTAL:']);

const REQUIRED_REQUIREMENT_TYPES = [
  { code: 'POLICE_DETAIL', label: 'Police Detail' },
  { code: 'CRANE_AND_BOOM_PERMIT', label: 'Crane & Boom Permit' },
  { code: 'TREE_PERMIT', label: 'Tree Permit' },
  { code: 'NEIGHBOR_CONSENT', label: 'Neighbor Consent' },
  { code: 'NO_EMAIL', label: 'No Email' },
  { code: 'CUSTOMER_HOME', label: 'Customer Must Be Home' },
  { code: 'NO_PARKING', label: 'No Parking' },
  { code: 'LOG_TRUCK', label: 'Log Truck Required' },
  { code: 'CONCOM', label: 'Conservation Commission' },
] as const;

function getCellValue(row: ExcelJS.Row, index: number): ExcelJS.CellValue {
  return row.getCell(index + 1).value;
}

function cellToString(value: ExcelJS.CellValue): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toUpperCase() === 'N/A') {
      return null;
    }
    return trimmed;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return cellToString(value.text);
  }
  if (typeof value === 'object' && 'result' in value) {
    return cellToString(value.result ?? null);
  }
  return null;
}

function cellHasValue(value: ExcelJS.CellValue): boolean {
  const asString = cellToString(value);
  if (asString !== null) {
    return true;
  }
  return typeof value === 'number' || value instanceof Date;
}

function parseDecimal(value: ExcelJS.CellValue): Prisma.Decimal | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Prisma.Decimal(value);
  }
  const asString = cellToString(value);
  if (!asString) {
    return null;
  }
  const normalized = asString.replace(/[$,\s]/g, '');
  if (!normalized) {
    return null;
  }
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return new Prisma.Decimal(numeric);
}

function dateOnlyUtcFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDateToken(token: string): Date | null {
  const match = token.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) {
    return null;
  }
  const month = Number(match[1]);
  const day = Number(match[2]);
  let year: number;
  if (!match[3]) {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const candidate = new Date(Date.UTC(currentYear, month - 1, day));
    const today = dateOnlyUtcFromDate(now);
    year = candidate.getTime() >= today.getTime() ? currentYear : currentYear - 1;
  } else {
    const parsedYear = Number(match[3]);
    year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
  }
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }
  return parsed;
}

function parseSpreadsheetDate(value: ExcelJS.CellValue): Date | null {
  if (value instanceof Date) {
    return dateOnlyUtcFromDate(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = Math.round((value - 25569) * 86400 * 1000);
    const parsed = new Date(millis);
    if (!Number.isNaN(parsed.getTime())) {
      return dateOnlyUtcFromDate(parsed);
    }
    return null;
  }
  const asString = cellToString(value);
  if (!asString) {
    return null;
  }

  const firstDate = asString.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
  if (!firstDate) {
    const parsed = new Date(asString);
    if (!Number.isNaN(parsed.getTime())) {
      return dateOnlyUtcFromDate(parsed);
    }
    return null;
  }
  return parseDateToken(firstDate[1]);
}

function toDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function titleCase(value: string | null): string {
  if (!value) {
    return '';
  }
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCustomerName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeSalesRepCode(value: string | null): string {
  if (!value) {
    return 'LEGACY';
  }
  const normalized = value.replace(':', '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
  return normalized || 'LEGACY';
}

function repMarkerFromRow(row: ExcelJS.Row): string | null {
  const c6 = (cellToString(getCellValue(row, COL.scheduledDate)) ?? '').toUpperCase();
  const c4 = (cellToString(getCellValue(row, COL.confirmed)) ?? '').toUpperCase();
  if (REP_MARKERS.has(c6)) {
    return c6;
  }
  if (REP_MARKERS.has(c4)) {
    return c4;
  }
  return null;
}

function isSummaryRow(row: ExcelJS.Row): boolean {
  const c6 = (cellToString(getCellValue(row, COL.scheduledDate)) ?? '').toUpperCase();
  const c4 = (cellToString(getCellValue(row, COL.confirmed)) ?? '').toUpperCase();
  return SUMMARY_MARKERS.has(c6) || SUMMARY_MARKERS.has(c4);
}

function isHeaderRow(row: ExcelJS.Row): boolean {
  const customer = (cellToString(getCellValue(row, COL.customerName)) ?? '').toUpperCase();
  return customer.includes('CUSTOMER NAME');
}

function deriveCraneModel(row: ExcelJS.Row): 'MODEL_1090' | 'MODEL_1060' | 'EITHER' | null {
  if (cellHasValue(getCellValue(row, COL.model1090OrLift))) {
    return 'MODEL_1090';
  }
  if (cellHasValue(getCellValue(row, COL.model1060))) {
    return 'MODEL_1060';
  }
  if (cellHasValue(getCellValue(row, COL.modelEither))) {
    return 'EITHER';
  }
  return null;
}

function parseEstimateHours(row: ExcelJS.Row): Prisma.Decimal | null {
  return (
    parseDecimal(getCellValue(row, COL.scheduledHours)) ??
    parseDecimal(getCellValue(row, COL.hoursTbs)) ??
    parseDecimal(getCellValue(row, COL.model1090OrLift)) ??
    parseDecimal(getCellValue(row, COL.model1060)) ??
    parseDecimal(getCellValue(row, COL.modelEither))
  );
}

function parseActorCode(snippet: string): string | null {
  const match = snippet.match(/\bPER\s+([A-Z]{1,4})\b/i);
  return match ? match[1].toUpperCase() : null;
}

function parseNotesDate(dateText: string): Date | null {
  const token = dateText.trim();
  return parseDateToken(token);
}

type ParsedScheduleEvent = {
  eventType: ScheduleEventType;
  fromAt: Date | null;
  toAt: Date | null;
  rawSnippet: string;
  actorCode: string | null;
};

function parseScheduleEvents(notes: string): { events: ParsedScheduleEvent[]; unparsed: ParseWarning[] } {
  const events: ParsedScheduleEvent[] = [];
  const unparsed: ParseWarning[] = [];

  const patterns: Array<{
    regex: RegExp;
    eventType: ScheduleEventType;
    map: (match: RegExpExecArray) => { fromDateText?: string; toDateText?: string };
  }> = [
    {
      regex: /RS\s+TO\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+FROM\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+PER\s+[A-Z]{1,4})?/gi,
      eventType: ScheduleEventType.DATE_SWAP,
      map: (m) => ({ toDateText: m[1], fromDateText: m[2] }),
    },
    {
      regex: /(?:P\/U\s+TO|PU\s+TO)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+PER\s+[A-Z]{1,4})?/gi,
      eventType: ScheduleEventType.DATE_SWAP,
      map: (m) => ({ toDateText: m[1] }),
    },
    {
      regex: /(?:TBRS\s+FROM|TBRS)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+PER\s+[A-Z]{1,4})?/gi,
      eventType: ScheduleEventType.TBS_FROM,
      map: (m) => ({ fromDateText: m[1] }),
    },
    {
      regex: /(?:R\/S|RS\s+TO|RS)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+PER\s+[A-Z]{1,4})?/gi,
      eventType: ScheduleEventType.RESCHEDULE_TO,
      map: (m) => ({ toDateText: m[1] }),
    },
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(notes)) !== null) {
      const snippet = match[0].trim();
      const mapped = pattern.map(match);
      const fromAt = mapped.fromDateText ? parseNotesDate(mapped.fromDateText) : null;
      const toAt = mapped.toDateText ? parseNotesDate(mapped.toDateText) : null;

      if ((mapped.fromDateText && !fromAt) || (mapped.toDateText && !toAt)) {
        unparsed.push({
          row: 0,
          field: 'notesRaw',
          raw: snippet,
          reason: 'Unable to parse schedule event date',
        });
        continue;
      }

      events.push({
        eventType: pattern.eventType,
        fromAt,
        toAt,
        rawSnippet: snippet,
        actorCode: parseActorCode(snippet),
      });
    }
  }

  return { events, unparsed };
}

type ParsedRequirement = { code: string; rawSnippet: string };

function parseRequirements(notes: string, equipmentType: EquipmentType): ParsedRequirement[] {
  const out: ParsedRequirement[] = [];

  const addMatches = (regex: RegExp, code: string) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(notes)) !== null) {
      out.push({ code, rawSnippet: match[0].trim() });
    }
  };

  addMatches(/\bCONCOM\b/gi, 'CONCOM');
  addMatches(/\bNO\s+EMAIL\b/gi, 'NO_EMAIL');
  addMatches(/\bCUSTOMER\s+MUST\s+BE\s+HOME\b/gi, 'CUSTOMER_HOME');
  addMatches(/\bNO\s+PARKING\b/gi, 'NO_PARKING');
  addMatches(/\b(?:W\/\s*LOG\s+TRUCK|LOG\s+TRUCK)\b/gi, 'LOG_TRUCK');
  addMatches(/\b(?:NEIGHBOR\s+CONSENT|PERMISSION\s+FROM\s+NEIGHBOR|NEEDS\s+PERMISSION)\b/gi, 'NEIGHBOR_CONSENT');
  addMatches(/\b(?:DETAIL\s+NOT\s+SHOWING|W\/\s*DETAIL|DTL|DETAIL)\b/gi, 'POLICE_DETAIL');
  addMatches(/\bTREE\s+PERMIT\b/gi, 'TREE_PERMIT');

  const permitRegex = /\b(?:PERMIT|CBP)\b/gi;
  let permitMatch: RegExpExecArray | null;
  while ((permitMatch = permitRegex.exec(notes)) !== null) {
    out.push({
      code: equipmentType === EquipmentType.BUCKET ? 'TREE_PERMIT' : 'CRANE_AND_BOOM_PERMIT',
      rawSnippet: permitMatch[0].trim(),
    });
  }

  return out;
}

async function getOrCreateCustomer(tx: TxClient, name: string) {
  const existing = await tx.customer.findFirst({
    where: {
      deletedAt: null,
      name: { equals: name, mode: 'insensitive' },
    },
  });
  if (existing) {
    return existing;
  }
  return tx.customer.create({ data: { name } });
}

async function ensureRequirementTypes(tx: TxClient): Promise<Map<string, string>> {
  for (const type of REQUIRED_REQUIREMENT_TYPES) {
    await tx.requirementType.upsert({
      where: { code: type.code },
      update: { label: type.label, active: true, deletedAt: null },
      create: { code: type.code, label: type.label, active: true },
    });
  }

  const types = await tx.requirementType.findMany({
    where: { code: { in: REQUIRED_REQUIREMENT_TYPES.map((type) => type.code) } },
    select: { id: true, code: true },
  });

  return new Map(types.map((type) => [type.code, type.id]));
}

async function processSheet(
  tx: TxClient,
  worksheet: ExcelJS.Worksheet,
  config: SheetConfig,
  timezone: string,
  requirementTypeIds: Map<string, string>,
): Promise<SheetReconciliation> {
  const result: SheetReconciliation = {
    rowsRead: 0,
    rowsSkipped: 0,
    jobsCreated: 0,
    segmentsCreated: 0,
    scheduleEventsCreated: 0,
    requirementsCreated: 0,
    parseWarnings: [],
  };

  let currentRepCode: string | null = null;

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const marker = repMarkerFromRow(row);
    if (marker) {
      currentRepCode = marker;
      result.rowsSkipped += 1;
      continue;
    }

    const customerNameRaw = cellToString(getCellValue(row, COL.customerName));
    if (!customerNameRaw || isHeaderRow(row) || isSummaryRow(row)) {
      result.rowsSkipped += 1;
      continue;
    }

    result.rowsRead += 1;

    const customerName = normalizeCustomerName(customerNameRaw);
    const customer = await getOrCreateCustomer(tx, customerName);

    const jobSiteAddress = titleCase(cellToString(getCellValue(row, COL.address)));
    const town = titleCase(cellToString(getCellValue(row, COL.town)));

    const approvalDate = parseSpreadsheetDate(getCellValue(row, COL.approvalDate));
    const scheduledDate = parseSpreadsheetDate(getCellValue(row, COL.scheduledDate));
    const amountDollars = parseDecimal(getCellValue(row, COL.amountDollars)) ?? new Prisma.Decimal(0);
    const scheduledHours = parseDecimal(getCellValue(row, COL.scheduledHours));
    const estimateHoursCurrent = parseEstimateHours(row);

    let completedDate: Date | null = null;
    if (config.completed) {
      completedDate = scheduledDate ?? approvalDate;
      if (!completedDate) {
        result.parseWarnings.push({
          row: rowNumber,
          field: 'completedDate',
          raw: String(getCellValue(row, COL.scheduledDate) ?? ''),
          reason: 'Completed row missing both scheduled and approval date',
        });
      }
    }

    const notesRaw = cellToString(getCellValue(row, COL.notes)) ?? '';

    const linkedEquipmentNote = /\bBUCKET\s+ALSO\b/i.test(notesRaw)
      ? 'BUCKET'
      : /\bCRANE\s+ALSO\b/i.test(notesRaw)
        ? 'CRANE'
        : null;

    const hasStumpLanguage = cellHasValue(getCellValue(row, COL.stumpLanguage));
    const stumpLanguage = cellToString(getCellValue(row, COL.stumpLanguage));

    const requiresSpiderLiftFromNotes = config.equipmentType === EquipmentType.BUCKET && /\bLIFT\b/i.test(notesRaw);

    const job = await tx.job.create({
      data: {
        customerId: customer.id,
        equipmentType: config.equipmentType,
        salesRepCode: normalizeSalesRepCode(currentRepCode),
        jobSiteAddress,
        town,
        completedDate,
        amountDollars,
        estimateHoursCurrent,
        travelHoursEstimate: new Prisma.Decimal(0),
        approvalDate,
        approvalCall: cellToString(getCellValue(row, COL.approvalCall)),
        confirmedText: cellToString(getCellValue(row, COL.confirmed)),
        craneModelSuitability: config.equipmentType === EquipmentType.CRANE ? deriveCraneModel(row) : null,
        requiresSpiderLift:
          config.equipmentType === EquipmentType.BUCKET
            ? cellHasValue(getCellValue(row, COL.model1090OrLift)) || requiresSpiderLiftFromNotes
            : false,
        winterFlag: cellHasValue(getCellValue(row, COL.winterFlag)),
        frozenGroundFlag: cellHasValue(getCellValue(row, COL.frozenFlag)),
        notesRaw,
        hasClimb: /\bCLIMB\b/i.test(notesRaw),
        isSigned: cellHasValue(getCellValue(row, COL.signed)),
        hasStumpLanguage,
        stumpLanguage,
        importSource: config.name,
        importRow: rowNumber,
        unable: config.unable,
        linkedEquipmentNote,
      },
    });
    result.jobsCreated += 1;

    if (scheduledHours !== null) {
      if (scheduledDate) {
        const durationHours = estimateHoursCurrent ?? scheduledHours;
        const startMinute = 8 * 60;
        const durationMinutes = Math.max(0, Math.ceil(durationHours.toNumber() * 60));
        let endMinute = startMinute + durationMinutes;
        if (endMinute > 1439) {
          endMinute = 1439;
          result.parseWarnings.push({
            row: rowNumber,
            field: 'scheduledHours',
            raw: durationHours.toString(),
            reason: 'Scheduled segment exceeded local midnight and was capped at 23:59',
          });
        }

        const dateIso = toDateIso(scheduledDate);
        const startDatetime = localDateMinuteToUtc(dateIso, startMinute, timezone);
        const endDatetime = localDateMinuteToUtc(dateIso, endMinute, timezone);

        await tx.scheduleSegment.create({
          data: {
            jobId: job.id,
            segmentType: SegmentType.PRIMARY,
            startDatetime,
            endDatetime,
            createdByUserId: null,
          },
        });
        result.segmentsCreated += 1;
      } else {
        result.parseWarnings.push({
          row: rowNumber,
          field: 'scheduledDate',
          raw: String(getCellValue(row, COL.scheduledDate) ?? ''),
          reason: 'Scheduled hours present but no valid scheduled date found',
        });
      }
    }

    const { events, unparsed } = parseScheduleEvents(notesRaw);
    for (const warning of unparsed) {
      result.parseWarnings.push({ ...warning, row: rowNumber });
    }

    for (const event of events) {
      await tx.scheduleEvent.create({
        data: {
          jobId: job.id,
          eventType: event.eventType,
          source: EventSource.LEGACY_PARSE,
          fromAt: event.fromAt,
          toAt: event.toAt,
          actorCode: event.actorCode,
          rawSnippet: event.rawSnippet,
        },
      });
      result.scheduleEventsCreated += 1;
    }

    for (const requirement of parseRequirements(notesRaw, config.equipmentType)) {
      const requirementTypeId = requirementTypeIds.get(requirement.code);
      if (!requirementTypeId) {
        result.parseWarnings.push({
          row: rowNumber,
          field: 'notesRaw',
          raw: requirement.rawSnippet,
          reason: `Requirement type ${requirement.code} not found`,
        });
        continue;
      }
      await tx.requirement.create({
        data: {
          jobId: job.id,
          requirementTypeId,
          status: RequirementStatus.REQUIRED,
          source: 'LEGACY_PARSE',
          rawSnippet: requirement.rawSnippet,
        },
      });
      result.requirementsCreated += 1;
    }
  }

  return result;
}

async function processUnhappyCustomerSheet(tx: TxClient, worksheet: ExcelJS.Worksheet): Promise<{ matched: number; unmatched: number }> {
  let matched = 0;
  let unmatched = 0;

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const customerNameRaw = cellToString(getCellValue(row, COL.customerName));
    if (!customerNameRaw || isHeaderRow(row) || isSummaryRow(row)) {
      continue;
    }

    const customerName = normalizeCustomerName(customerNameRaw);
    const customer = await tx.customer.findFirst({
      where: {
        deletedAt: null,
        name: { equals: customerName, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (!customer) {
      unmatched += 1;
      continue;
    }

    const severityRaw = parseDecimal(getCellValue(row, COL.approvalCall));
    const severity = severityRaw ? Number(severityRaw.toString()) : null;

    await tx.customerRisk.create({
      data: {
        customerId: customer.id,
        severity: severity !== null && Number.isFinite(severity) ? Math.round(severity) : null,
        status: 'OPEN',
        narrative: cellToString(getCellValue(row, COL.hoursTbs)),
      },
    });
    matched += 1;
  }

  return { matched, unmatched };
}

export async function importMasterSheet(prisma: PrismaClient, workbookPath: string): Promise<ImportReconciliation> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(workbookPath);

  const settings = await prisma.orgSettings.findFirst({
    where: { deletedAt: null },
    select: { companyTimezone: true },
  });
  const timezone = settings?.companyTimezone ?? DEFAULT_TIMEZONE;

  const sheets: Record<string, SheetReconciliation> = {};
  let unhappyMatched = 0;
  let unhappyUnmatched = 0;

  for (const config of JOB_SHEETS) {
    const worksheet = workbook.getWorksheet(config.name);
    if (!worksheet) {
      sheets[config.name] = {
        rowsRead: 0,
        rowsSkipped: 0,
        jobsCreated: 0,
        segmentsCreated: 0,
        scheduleEventsCreated: 0,
        requirementsCreated: 0,
        parseWarnings: [
          {
            row: 0,
            field: 'sheet',
            raw: config.name,
            reason: 'Sheet not found',
          },
        ],
      };
      continue;
    }

    try {
      const sheetResult = await prisma.$transaction(async (tx) => {
        const requirementTypeIds = await ensureRequirementTypes(tx);
        return processSheet(tx, worksheet, config, timezone, requirementTypeIds);
      });
      sheets[config.name] = sheetResult;
    } catch (error) {
      sheets[config.name] = {
        rowsRead: 0,
        rowsSkipped: 0,
        jobsCreated: 0,
        segmentsCreated: 0,
        scheduleEventsCreated: 0,
        requirementsCreated: 0,
        parseWarnings: [
          {
            row: 0,
            field: 'sheet',
            raw: config.name,
            reason: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }

  const unhappySheet = workbook.getWorksheet(UNHAPPY_SHEET_NAME);
  if (unhappySheet) {
    const result = await prisma.$transaction((tx) => processUnhappyCustomerSheet(tx, unhappySheet));
    unhappyMatched = result.matched;
    unhappyUnmatched = result.unmatched;
  }

  const sheetEntries = Object.values(sheets);
  return {
    sheets,
    totals: {
      jobsCreated: sheetEntries.reduce((sum, entry) => sum + entry.jobsCreated, 0),
      segmentsCreated: sheetEntries.reduce((sum, entry) => sum + entry.segmentsCreated, 0),
      scheduleEventsCreated: sheetEntries.reduce((sum, entry) => sum + entry.scheduleEventsCreated, 0),
      requirementsCreated: sheetEntries.reduce((sum, entry) => sum + entry.requirementsCreated, 0),
      totalParseWarnings: sheetEntries.reduce((sum, entry) => sum + entry.parseWarnings.length, 0),
    },
    unhappyMatched,
    unhappyUnmatched,
  };
}

async function main() {
  const cliPath = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  const workbookPath = cliPath ?? process.env.MASTER_SHEET_PATH;
  if (!workbookPath) {
    throw new Error('MASTER_SHEET_PATH not set and no workbook path passed as first CLI argument.');
  }

  const prisma = new PrismaClient();
  try {
    const reconciliation = await importMasterSheet(prisma, workbookPath);
    console.log(JSON.stringify(reconciliation, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

const entryArg = process.argv[1];
if (entryArg) {
  const entryUrl = new URL(`file://${entryArg.replace(/\\/g, '/')}`).href;
  if (import.meta.url === entryUrl) {
    main().catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
  }
}
