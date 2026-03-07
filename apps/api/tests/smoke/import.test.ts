import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';
import type { PrismaClient } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { importMasterSheet } from '../../scripts/import-master-sheet';

type InMemoryState = {
  customers: Array<{ id: string; name: string; deletedAt: Date | null }>;
  jobs: Array<Record<string, unknown>>;
  scheduleSegments: Array<Record<string, unknown>>;
  scheduleEvents: Array<Record<string, unknown>>;
  requirements: Array<Record<string, unknown>>;
  requirementTypes: Array<{ id: string; code: string; label: string }>;
  customerRisks: Array<Record<string, unknown>>;
};

function createPrismaMock(state: InMemoryState): PrismaClient {
  let customerSeq = 1;
  let jobSeq = 1;
  let segmentSeq = 1;
  let eventSeq = 1;
  let requirementSeq = 1;
  let riskSeq = 1;
  let reqTypeSeq = 1;

  const tx = {
    orgSettings: {
      findFirst: async () => ({ companyTimezone: 'America/New_York' }),
    },
    requirementType: {
      upsert: async ({ where, create, update }: { where: { code: string }; create: { code: string; label: string }; update: { label: string } }) => {
        const existing = state.requirementTypes.find((type) => type.code === where.code);
        if (existing) {
          existing.label = update.label;
          return existing;
        }
        const created = { id: `req-type-${reqTypeSeq++}`, code: create.code, label: create.label };
        state.requirementTypes.push(created);
        return created;
      },
      findMany: async ({ where }: { where: { code: { in: string[] } } }) =>
        state.requirementTypes.filter((type) => where.code.in.includes(type.code)).map((type) => ({ id: type.id, code: type.code })),
    },
    customer: {
      findFirst: async ({ where }: { where: { name: { equals: string } } }) =>
        state.customers.find((customer) => customer.name.toLowerCase() === where.name.equals.toLowerCase()) ?? null,
      create: async ({ data }: { data: { name: string } }) => {
        const created = { id: `customer-${customerSeq++}`, name: data.name, deletedAt: null as Date | null };
        state.customers.push(created);
        return created;
      },
    },
    job: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `job-${jobSeq++}`, ...data };
        state.jobs.push(created);
        return created;
      },
    },
    scheduleSegment: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `segment-${segmentSeq++}`, ...data };
        state.scheduleSegments.push(created);
        return created;
      },
    },
    scheduleEvent: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `event-${eventSeq++}`, ...data };
        state.scheduleEvents.push(created);
        return created;
      },
    },
    requirement: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `requirement-${requirementSeq++}`, ...data };
        state.requirements.push(created);
        return created;
      },
    },
    customerRisk: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `risk-${riskSeq++}`, ...data };
        state.customerRisks.push(created);
        return created;
      },
    },
  };

  const prisma = {
    ...tx,
    $transaction: async (input: unknown) => {
      if (typeof input === 'function') {
        return (input as (client: typeof tx) => unknown)(tx);
      }
      throw new Error('Array transaction mode not supported in this mock');
    },
  };

  return prisma as unknown as PrismaClient;
}

async function writeFixtureWorkbook(filePath: string) {
  const workbook = new ExcelJS.Workbook();

  const crane = workbook.addWorksheet('CRANE');
  crane.getRow(1).values = ['Customer Name', 'Address', 'Town', 'Approval Call', 'Confirmed', 'Approval Date', 'Scheduled Date', '$', 'Hours TBS', 'Scheduled Hours', '1090', '1060', 'Either', 'Winter', 'Frozen', 'Notes', 'Stump', 'Signed'];
  crane.getRow(2).getCell(1).value = 'Acme Tree';
  crane.getRow(2).getCell(2).value = '10 main st';
  crane.getRow(2).getCell(3).value = 'beverly';
  crane.getRow(2).getCell(7).value = '3/4/2026';
  crane.getRow(2).getCell(8).value = 1200;
  crane.getRow(2).getCell(10).value = 3;
  crane.getRow(2).getCell(16).value = 'DTL RS 3/4 PER AL';

  crane.getRow(3).getCell(1).value = 'No Segment Co';
  crane.getRow(3).getCell(2).value = '12 elm st';
  crane.getRow(3).getCell(3).value = 'salem';
  crane.getRow(3).getCell(8).value = 800;
  crane.getRow(3).getCell(9).value = 2;
  crane.getRow(3).getCell(16).value = '';

  const completed = workbook.addWorksheet('2026 Crane Completed');
  completed.getRow(1).values = crane.getRow(1).values;
  completed.getRow(2).getCell(1).value = 'Completed Co';
  completed.getRow(2).getCell(2).value = '99 oak st';
  completed.getRow(2).getCell(3).value = 'lynn';
  completed.getRow(2).getCell(6).value = '2/20/2026';
  completed.getRow(2).getCell(8).value = 1500;
  completed.getRow(2).getCell(10).value = 4;

  const unable = workbook.addWorksheet('UNABLE TO BE SCHEDULED');
  unable.getRow(1).values = crane.getRow(1).values;
  unable.getRow(2).getCell(1).value = 'Unable Co';
  unable.getRow(2).getCell(2).value = '77 pine st';
  unable.getRow(2).getCell(3).value = 'gloucester';
  unable.getRow(2).getCell(8).value = 900;
  unable.getRow(2).getCell(10).value = 2;

  await workbook.xlsx.writeFile(filePath);
}

describe('master sheet import script', () => {
  test('imports fixture workbook with expected side effects', async () => {
    const state: InMemoryState = {
      customers: [],
      jobs: [],
      scheduleSegments: [],
      scheduleEvents: [],
      requirements: [],
      requirementTypes: [],
      customerRisks: [],
    };

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sylvara-import-'));
    const workbookPath = path.join(tmpDir, 'fixture.xlsx');
    await writeFixtureWorkbook(workbookPath);

    try {
      const prisma = createPrismaMock(state);
      const reconciliation = await importMasterSheet(prisma, workbookPath);

      expect(reconciliation).toHaveProperty('sheets');
      expect(reconciliation).toHaveProperty('totals');

      expect(state.scheduleSegments.length).toBe(1);

      const idByCode = new Map(state.requirementTypes.map((type) => [type.code, type.id]));
      expect(state.requirements.some((req) => req.requirementTypeId === idByCode.get('POLICE_DETAIL'))).toBe(true);

      expect(state.scheduleEvents.some((event) => event.eventType === 'RESCHEDULE_TO' && event.source === 'LEGACY_PARSE')).toBe(true);

      const completedJob = state.jobs.find((job) => job.importSource === '2026 Crane Completed');
      expect(completedJob?.completedDate).toBeTruthy();

      const unableJob = state.jobs.find((job) => job.importSource === 'UNABLE TO BE SCHEDULED');
      expect(unableJob?.unable).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
