import { isValidMinuteOfDay } from '@sylvara/shared';
import type { MinuteWindow } from './types.js';

const TWENTY_FOUR_HOUR = /(?<!\d)([01]\d|2[0-3]):([0-5]\d)\s*[-–]\s*([01]\d|2[0-3]):([0-5]\d)(?!\d)/i;
const TWELVE_HOUR_BOTH_SUFFIX =
  /(?<!\d)(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\s*[-–]\s*(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)(?!\d)/i;
const TWELVE_HOUR_SHARED_SUFFIX =
  /(?<!\d)(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*[-–]\s*(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)(?!\d)/i;

function withGlobal(regex: RegExp): RegExp {
  return new RegExp(regex.source, `${regex.flags.includes('i') ? 'i' : ''}g`);
}

function toMinute24(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function toMinute12(hour: number, minute: number, suffix: string): number {
  const normalizedHour = hour % 12;
  const offset = suffix.toLowerCase() === 'pm' ? 12 : 0;
  return (normalizedHour + offset) * 60 + minute;
}

function safeWindow(startMinute: number, endMinute: number): MinuteWindow | null {
  if (!isValidMinuteOfDay(startMinute) || !isValidMinuteOfDay(endMinute)) {
    return null;
  }

  if (endMinute <= startMinute) {
    return null;
  }

  return { startMinute, endMinute };
}

export function parseCustomerAvailabilityWindow(availabilityNotes?: string | null): MinuteWindow | null {
  if (!availabilityNotes) {
    return null;
  }

  const norm = availabilityNotes.replace(/\s+\bto\b\s+/gi, '-');

  const candidates: Array<{ index: number; window: MinuteWindow }> = [];

  for (const m24 of norm.matchAll(withGlobal(TWENTY_FOUR_HOUR))) {
    if (m24.index === undefined) {
      continue;
    }
    const start = toMinute24(Number(m24[1]), Number(m24[2]));
    const end = toMinute24(Number(m24[3]), Number(m24[4]));
    const window = safeWindow(start, end);
    if (window) {
      candidates.push({ index: m24.index, window });
    }
  }

  for (const m12Both of norm.matchAll(withGlobal(TWELVE_HOUR_BOTH_SUFFIX))) {
    if (m12Both.index === undefined) {
      continue;
    }
    const start = toMinute12(Number(m12Both[1]), Number(m12Both[2] ?? '0'), m12Both[3]);
    const end = toMinute12(Number(m12Both[4]), Number(m12Both[5] ?? '0'), m12Both[6]);
    const window = safeWindow(start, end);
    if (window) {
      candidates.push({ index: m12Both.index, window });
    }
  }

  for (const m12Shared of norm.matchAll(withGlobal(TWELVE_HOUR_SHARED_SUFFIX))) {
    if (m12Shared.index === undefined) {
      continue;
    }
    const suffix = m12Shared[5];
    const start = toMinute12(Number(m12Shared[1]), Number(m12Shared[2] ?? '0'), suffix);
    const end = toMinute12(Number(m12Shared[3]), Number(m12Shared[4] ?? '0'), suffix);
    const window = safeWindow(start, end);
    if (window) {
      candidates.push({ index: m12Shared.index, window });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.index - b.index);
  return candidates[0].window;
}

export function isIntervalInsideWindow(interval: MinuteWindow, window: MinuteWindow): boolean {
  return interval.startMinute >= window.startMinute && interval.endMinute <= window.endMinute;
}
