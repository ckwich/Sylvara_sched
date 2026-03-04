import { DateTime } from 'luxon';

export const MINUTES_PER_DAY = 1440;

export type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

export function isValidMinuteOfDay(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < MINUTES_PER_DAY;
}

export function parseHHMMToMinute(value: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    throw new Error(`Invalid HH:MM value: ${value}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour * 60 + minute;
}

export function formatMinuteToHHMM(value: number): string {
  if (!isValidMinuteOfDay(value)) {
    throw new Error(`Minute value must be between 0 and 1439: ${value}`);
  }

  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Convert a UTC Date to local wall-clock parts in the provided IANA timezone.
 *
 * @param utcDate UTC timestamp to project into local wall-clock values.
 * @param timezone IANA timezone (e.g. "America/New_York") used for conversion.
 */
export function utcToLocalParts(utcDate: Date, timezone: string): LocalDateParts {
  const local = DateTime.fromJSDate(utcDate, { zone: 'utc' }).setZone(timezone);
  return {
    year: local.year,
    month: local.month,
    day: local.day,
    hour: local.hour,
    minute: local.minute,
    second: local.second,
    millisecond: local.millisecond,
  };
}

/**
 * Compute wall-clock duration in fractional hours between UTC timestamps using a local timezone.
 *
 * @param startUtc UTC start timestamp.
 * @param endUtc UTC end timestamp.
 * @param timezone IANA timezone used for wall-clock duration semantics.
 */
export function wallClockHoursBetween(startUtc: Date, endUtc: Date, timezone: string): number {
  const startLocal = DateTime.fromJSDate(startUtc, { zone: 'utc' }).setZone(timezone);
  const endLocal = DateTime.fromJSDate(endUtc, { zone: 'utc' }).setZone(timezone);
  return endLocal.diff(startLocal, 'minutes').minutes / 60;
}

/**
 * Convert a local date (YYYY-MM-DD) and minute-of-day into a UTC Date.
 *
 * @param dateStr Local calendar date string (YYYY-MM-DD).
 * @param minuteOfDay Minute offset from local midnight (0-1439).
 * @param timezone IANA timezone used to interpret the local date/time.
 */
export function localDateMinuteToUtc(dateStr: string, minuteOfDay: number, timezone: string): Date {
  const local = DateTime.fromISO(dateStr, { zone: timezone }).startOf('day').plus({ minutes: minuteOfDay });
  return local.toUTC().toJSDate();
}

/**
 * Return local date string (YYYY-MM-DD) for a UTC timestamp in a timezone.
 *
 * @param utcDate UTC timestamp.
 * @param timezone IANA timezone used to resolve local date.
 */
export function utcToLocalDateStr(utcDate: Date, timezone: string): string {
  return DateTime.fromJSDate(utcDate, { zone: 'utc' }).setZone(timezone).toISODate() ?? '';
}

/**
 * Return local day bounds in UTC for a local date string.
 *
 * @param dateStr Local date string (YYYY-MM-DD).
 * @param timezone IANA timezone used for local day interpretation.
 */
export function localDateBoundsToUtc(dateStr: string, timezone: string): { startUtc: Date; endUtc: Date } {
  const start = DateTime.fromISO(dateStr, { zone: timezone }).startOf('day');
  const end = start.plus({ days: 1 });
  return { startUtc: start.toUTC().toJSDate(), endUtc: end.toUTC().toJSDate() };
}

/**
 * Parse an ISO datetime string and convert to UTC Date.
 *
 * @param value ISO datetime string (with offset/zone).
 * @returns UTC Date when valid, otherwise null.
 */
export function parseIsoToUtcDate(value: string): Date | null {
  const parsed = DateTime.fromISO(value, { setZone: true });
  if (!parsed.isValid) {
    return null;
  }
  return parsed.toUTC().toJSDate();
}

/**
 * Check if a UTC timestamp lands on a 10-minute boundary in local wall-clock time.
 *
 * @param utcDate UTC timestamp to test.
 * @param timezone IANA timezone used for local boundary check.
 */
export function isUtcOnLocalTenMinuteBoundary(utcDate: Date, timezone: string): boolean {
  const local = utcToLocalParts(utcDate, timezone);
  return local.minute % 10 === 0 && local.second === 0 && local.millisecond === 0;
}

export function minuteFromLegacyTime(legacyTime: Date): number {
  // Prisma maps SQL TIME to JS Date; read wall-clock via UTC to avoid local timezone drift.
  return legacyTime.getUTCHours() * 60 + legacyTime.getUTCMinutes();
}

export function resolveAnchorMinute(input: {
  minute?: number | null;
  legacyTime?: Date | null;
}): number | null {
  if (input.minute !== null && input.minute !== undefined) {
    if (!isValidMinuteOfDay(input.minute)) {
      throw new Error(`Minute value must be between 0 and 1439: ${input.minute}`);
    }

    return input.minute;
  }

  if (input.legacyTime) {
    return minuteFromLegacyTime(input.legacyTime);
  }

  return null;
}

export function minuteFieldUpdate(input: {
  minute?: number | null;
  hhmm?: string | null;
}): number | null {
  if (input.minute !== null && input.minute !== undefined) {
    if (!isValidMinuteOfDay(input.minute)) {
      throw new Error(`Minute value must be between 0 and 1439: ${input.minute}`);
    }

    return input.minute;
  }

  if (input.hhmm) {
    return parseHHMMToMinute(input.hhmm);
  }

  return null;
}
