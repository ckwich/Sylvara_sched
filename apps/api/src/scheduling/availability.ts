import { MINUTES_PER_DAY, isValidMinuteOfDay } from '@sylvara/shared';
import { Prisma } from '@prisma/client';
import type { AttemptResult, MinuteWindow, Warning } from './types.js';

export function coalesceIntervals(intervals: MinuteWindow[]): MinuteWindow[] {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].sort((a, b) => a.startMinute - b.startMinute);
  const out: MinuteWindow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = out[out.length - 1];

    if (current.startMinute <= last.endMinute) {
      last.endMinute = Math.max(last.endMinute, current.endMinute);
    } else {
      out.push({ ...current });
    }
  }

  return out;
}

export function findFirstFittingStartMinute(input: {
  occupied: MinuteWindow[];
  anchorMinute: number;
  durationMinutes: number;
}): number | null {
  if (!isValidMinuteOfDay(input.anchorMinute) || input.durationMinutes <= 0) {
    return null;
  }

  const occupied = coalesceIntervals(input.occupied);
  let cursor = input.anchorMinute;

  for (const block of occupied) {
    if (cursor + input.durationMinutes <= block.startMinute) {
      return cursor;
    }

    if (cursor < block.endMinute) {
      cursor = block.endMinute;
    }
  }

  if (cursor + input.durationMinutes <= MINUTES_PER_DAY) {
    return cursor;
  }

  return null;
}

export function minutesFromEstimatedHoursRoundedToTen(onsiteHours: Prisma.Decimal): number {
  if (onsiteHours.lte(0)) {
    return 0;
  }

  const exactMinutes = Number(
    onsiteHours.mul(60).toDecimalPlaces(0, Prisma.Decimal.ROUND_UP).toString(),
  );
  return Math.ceil(exactMinutes / 10) * 10;
}

export function requirementWarnings(statuses: string[]): Warning[] {
  const warnings: Warning[] = [];
  const nonApproved = statuses.some((status) => status !== 'APPROVED' && status !== 'NOT_REQUIRED');
  if (nonApproved) {
    warnings.push({
      code: 'REQ_NOT_APPROVED',
      message: 'One or more requirements are not approved.',
    });
  }

  if (statuses.includes('DENIED')) {
    warnings.push({
      code: 'REQ_DENIED_PRESENT',
      message: 'At least one requirement is denied.',
    });
  }

  const unmet = statuses.some((status) => status === 'REQUIRED' || status === 'REQUESTED');
  if (unmet) {
    warnings.push({
      code: 'REQ_UNMET_PRESENT',
      message: 'Required items are present but not satisfied.',
    });
  }

  return warnings;
}

export function reject(code: string, message: string): AttemptResult<Record<string, never>> {
  return {
    result: 'REJECT',
    warnings: [],
    rejections: [{ code, message }],
  };
}
