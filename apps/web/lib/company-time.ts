type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function parseLocalDatetimeInput(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
}

function localPartsInZone(date: Date, timeZone: string): DateParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string, fallback: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? fallback);
  return {
    year: get('year', '0'),
    month: get('month', '1'),
    day: get('day', '1'),
    hour: get('hour', '0'),
    minute: get('minute', '0'),
  };
}

function offsetMillisecondsAt(date: Date, timeZone: string): number {
  const parts = localPartsInZone(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
  return asUtc - date.getTime();
}

function sameParts(a: DateParts, b: DateParts): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute
  );
}

export function companyLocalInputToUtcIso(value: string, companyTimezone: string): string {
  const input = parseLocalDatetimeInput(value);
  if (!input) {
    throw new Error('VALIDATION_ERROR: Invalid datetime-local input.');
  }

  let utcMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0, 0);
  for (let i = 0; i < 4; i += 1) {
    const offsetMs = offsetMillisecondsAt(new Date(utcMs), companyTimezone);
    const next = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0, 0) - offsetMs;
    if (next === utcMs) {
      break;
    }
    utcMs = next;
  }

  const candidate = new Date(utcMs);
  const candidateParts = localPartsInZone(candidate, companyTimezone);
  if (!sameParts(input, candidateParts)) {
    throw new Error(
      `VALIDATION_ERROR: Datetime ${value} is invalid or ambiguous in ${companyTimezone}.`,
    );
  }

  return candidate.toISOString();
}

export function browserTimezoneDiffers(companyTimezone: string): boolean {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return browserTimezone !== companyTimezone;
}
