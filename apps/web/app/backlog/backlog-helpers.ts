import type { JobSummary } from '../../lib/api';
import { SECTION_ORDER, type NumericTotals, type SectionData } from './backlog-types';

export function parseDecimal(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeTotals(): NumericTotals {
  return {
    estimateHours: 0,
    scheduledHours: 0,
    remainingHours: 0,
    amountDollars: 0,
  };
}

function addJobToTotals(totals: NumericTotals, job: JobSummary): NumericTotals {
  return {
    estimateHours: totals.estimateHours + parseDecimal(job.estimateHoursCurrent),
    scheduledHours: totals.scheduledHours + parseDecimal(job.scheduledEffectiveHours),
    remainingHours: totals.remainingHours + parseDecimal(job.remainingHours),
    amountDollars: totals.amountDollars + parseDecimal(job.amountDollars),
  };
}

export function formatHours(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatDollars(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function summarize(jobs: JobSummary[]): NumericTotals {
  return jobs.reduce((running, job) => addJobToTotals(running, job), makeTotals());
}

export function buildSections(jobs: JobSummary[]): SectionData[] {
  return SECTION_ORDER.map((equipmentType) => {
    const equipmentJobs = jobs.filter((job) => job.equipmentType === equipmentType);
    const byRep = new Map<string, JobSummary[]>();

    for (const job of equipmentJobs) {
      const repCode = job.salesRepCode || 'UNASSIGNED';
      const current = byRep.get(repCode) ?? [];
      byRep.set(repCode, [...current, job]);
    }

    const groups = Array.from(byRep.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([repCode, repJobs]) => ({
        repCode,
        jobs: repJobs,
        totals: summarize(repJobs),
      }));

    return {
      equipmentType,
      groups,
      totals: summarize(equipmentJobs),
    };
  });
}
