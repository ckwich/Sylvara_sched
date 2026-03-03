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
