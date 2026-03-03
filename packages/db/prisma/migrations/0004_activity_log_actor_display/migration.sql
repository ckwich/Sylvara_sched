ALTER TABLE "activity_logs"
  ADD COLUMN IF NOT EXISTS "actor_display" TEXT;
