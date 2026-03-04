import { ApiRequestError } from '../../lib/api';

export const PX_PER_MINUTE = 1.5;
export const START_SCROLL_MINUTE = 5 * 60;

export const WARNING_MESSAGES: Record<string, string> = {
  REQ_NOT_APPROVED: 'One or more permits are not yet approved.',
  FROZEN_GROUND_REQUIRED: 'This job requires frozen ground conditions.',
  WINTER_PREFERRED: 'This job is preferred for winter scheduling.',
};

export function formatDateHeading(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function minuteToLabel(minute: number): string {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export function localMinuteFromIso(iso: string, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = formatter.formatToParts(new Date(iso));
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

export function nextDate(date: string, deltaDays: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + deltaDays);
  return value.toISOString().slice(0, 10);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Request failed.';
}

