export function placeholder() {
  return 'shared';
}

export {
  MINUTES_PER_DAY,
  formatMinuteToHHMM,
  isValidMinuteOfDay,
  minuteFieldUpdate,
  minuteFromLegacyTime,
  parseHHMMToMinute,
  resolveAnchorMinute,
} from './time-of-day.js';

export type {
  DetectedRequirement,
  DetectedScheduleEvent,
  ParsedNotes,
  ParsedNotesConfidence,
} from './notes-parser.js';
export { parseNotes } from './notes-parser.js';
