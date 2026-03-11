export function placeholder() {
  return 'shared';
}

export {
  DEFAULT_TIMEZONE,
} from './constants';

export {
  MINUTES_PER_DAY,
  formatMinuteToHHMM,
  isUtcOnLocalTenMinuteBoundary,
  isValidMinuteOfDay,
  localDateBoundsToUtc,
  localDateMinuteToUtc,
  minuteFieldUpdate,
  minuteFromLegacyTime,
  parseIsoToUtcDate,
  parseHHMMToMinute,
  resolveAnchorMinute,
  utcToLocalDateStr,
  utcToLocalParts,
  wallClockHoursBetween,
} from './time-of-day';

export type {
  DetectedRequirement,
  DetectedScheduleEvent,
  ParsedNotes,
  ParsedNotesConfidence,
} from './notes-parser';
export { parseNotes } from './notes-parser';

export type { UserRole } from './roles';
export { ROLE_PERMISSIONS } from './roles';

export { SCHEDULE_EVENT_LABELS, scheduleEventLabel } from './schedule-events';
