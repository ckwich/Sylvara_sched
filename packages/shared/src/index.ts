export function placeholder() {
  return 'shared';
}

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
