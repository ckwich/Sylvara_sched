export const MINUTES_PER_DAY = 1440;

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
