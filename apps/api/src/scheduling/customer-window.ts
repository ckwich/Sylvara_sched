import { isValidMinuteOfDay } from '@sylvara/shared';
import type { MinuteWindow } from './types.js';

const TWENTY_FOUR_HOUR = /(?<!\d)([01]\d|2[0-3]):([0-5]\d)\s*[-–]\s*([01]\d|2[0-3]):([0-5]\d)(?!\d)/i;
const TWELVE_HOUR_BOTH_SUFFIX =
  /(?<!\d)(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\s*[-–]\s*(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)(?!\d)/i;
const TWELVE_HOUR_SHARED_SUFFIX =
  /(?<!\d)(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*[-–]\s*(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)(?!\d)/i;

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

  const candidates: Array<{ index: number; window: MinuteWindow | null }> = [];

  const m24 = TWENTY_FOUR_HOUR.exec(norm);
  if (m24 && m24.index >= 0) {
    const start = toMinute24(Number(m24[1]), Number(m24[2]));
    const end = toMinute24(Number(m24[3]), Number(m24[4]));
    candidates.push({ index: m24.index, window: safeWindow(start, end) });
  }

  const m12Both = TWELVE_HOUR_BOTH_SUFFIX.exec(norm);
  if (m12Both && m12Both.index >= 0) {
    const start = toMinute12(Number(m12Both[1]), Number(m12Both[2] ?? '0'), m12Both[3]);
    const end = toMinute12(Number(m12Both[4]), Number(m12Both[5] ?? '0'), m12Both[6]);
    candidates.push({ index: m12Both.index, window: safeWindow(start, end) });
  }

  const m12Shared = TWELVE_HOUR_SHARED_SUFFIX.exec(norm);
  if (m12Shared && m12Shared.index >= 0) {
    const suffix = m12Shared[5];
    const start = toMinute12(Number(m12Shared[1]), Number(m12Shared[2] ?? '0'), suffix);
    const end = toMinute12(Number(m12Shared[3]), Number(m12Shared[4] ?? '0'), suffix);
    candidates.push({ index: m12Shared.index, window: safeWindow(start, end) });
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
