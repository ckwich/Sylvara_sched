-- M2 foundations: schedule-segment user action events + history query indexes

ALTER TYPE "ScheduleEventType" ADD VALUE IF NOT EXISTS 'SEGMENT_CREATED';
ALTER TYPE "ScheduleEventType" ADD VALUE IF NOT EXISTS 'SEGMENT_UPDATED';
ALTER TYPE "ScheduleEventType" ADD VALUE IF NOT EXISTS 'SEGMENT_MOVED';
ALTER TYPE "ScheduleEventType" ADD VALUE IF NOT EXISTS 'SEGMENT_RESIZED';
ALTER TYPE "ScheduleEventType" ADD VALUE IF NOT EXISTS 'SEGMENT_DELETED';

CREATE INDEX IF NOT EXISTS "idx_schedule_events_job_created_at"
  ON "schedule_events" ("job_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_schedule_events_actor_created_at"
  ON "schedule_events" ("actor_user_id", "created_at" DESC)
  WHERE "actor_user_id" IS NOT NULL;

