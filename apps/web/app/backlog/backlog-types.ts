import type { JobDerivedState, JobSummary } from '../../lib/api';

export type EquipmentFilter = 'ALL' | 'CRANE' | 'BUCKET';
export type EquipmentType = 'CRANE' | 'BUCKET';

export const NON_COMPLETED_STATES: JobDerivedState[] = ['TBS', 'PARTIALLY_SCHEDULED', 'FULLY_SCHEDULED'];
export const SECTION_ORDER: EquipmentType[] = ['CRANE', 'BUCKET'];

export const STATE_LABELS: Record<JobDerivedState, string> = {
  TBS: 'TBS',
  PARTIALLY_SCHEDULED: 'Partial',
  FULLY_SCHEDULED: 'Full',
  COMPLETED: 'Completed',
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  CRANE: 'Crane Jobs',
  BUCKET: 'Bucket Jobs',
};

export type NumericTotals = {
  estimateHours: number;
  scheduledHours: number;
  remainingHours: number;
  amountDollars: number;
};

export type RepGroup = {
  repCode: string;
  jobs: JobSummary[];
  totals: NumericTotals;
};

export type SectionData = {
  equipmentType: EquipmentType;
  groups: RepGroup[];
  totals: NumericTotals;
};
