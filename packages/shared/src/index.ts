export function placeholder() {
  return 'shared';
}

export {
  DEFAULT_TIMEZONE,
} from './constants.js';

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
} from './time-of-day.js';

export type {
  DetectedRequirement,
  DetectedScheduleEvent,
  ParsedNotes,
  ParsedNotesConfidence,
} from './notes-parser.js';
export { parseNotes } from './notes-parser.js';

export type { UserRole } from './roles.js';
export { ROLE_PERMISSIONS } from './roles.js';

export { SCHEDULE_EVENT_LABELS, scheduleEventLabel } from './schedule-events.js';
