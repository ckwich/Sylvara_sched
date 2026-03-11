/**
 * Human-readable display labels for ScheduleEventType enum values.
 *
 * Use `scheduleEventLabel(eventType)` to get a display-friendly label
 * instead of rendering raw enum codes like "TBS_FROM" in the UI.
 */
export const SCHEDULE_EVENT_LABELS: Record<string, string> = {
  TBS_FROM: 'To Be Rescheduled',
  RESCHEDULE_TO: 'Rescheduled',
  DATE_SWAP: 'Date Swap',
  NOTE_PARSE_EVENT: 'Parsed from Notes',
  MANUAL_EDIT: 'Manual Edit',
  SEGMENT_CREATED: 'Segment Created',
  SEGMENT_UPDATED: 'Segment Updated',
  SEGMENT_MOVED: 'Segment Moved',
  SEGMENT_RESIZED: 'Segment Resized',
  SEGMENT_DELETED: 'Segment Deleted',
};

/** Returns a human-readable label for a schedule event type, falling back to the raw value. */
export function scheduleEventLabel(eventType: string): string {
  return SCHEDULE_EVENT_LABELS[eventType] ?? eventType;
}
