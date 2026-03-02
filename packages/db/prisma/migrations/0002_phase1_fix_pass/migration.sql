-- Phase 1 fix pass: time anchors in minutes, notes default, preferred channel enum, segment_group_id partial index

-- Add minute-from-midnight columns (0..1439)
ALTER TABLE "jobs"
  ADD COLUMN "preferred_start_minute" INTEGER,
  ADD COLUMN "preferred_end_minute" INTEGER;

ALTER TABLE "home_bases"
  ADD COLUMN "opening_minute" INTEGER,
  ADD COLUMN "closing_minute" INTEGER;

ALTER TABLE "foreman_day_rosters"
  ADD COLUMN "preferred_start_minute" INTEGER,
  ADD COLUMN "preferred_end_minute" INTEGER;

ALTER TABLE "org_settings"
  ADD COLUMN "operating_start_minute" INTEGER,
  ADD COLUMN "operating_end_minute" INTEGER;

-- Backfill minute columns from existing TIME columns
UPDATE "jobs"
SET
  "preferred_start_minute" = CASE
    WHEN "preferred_start_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "preferred_start_time")::int * 60
      + EXTRACT(MINUTE FROM "preferred_start_time")::int
  END,
  "preferred_end_minute" = CASE
    WHEN "preferred_end_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "preferred_end_time")::int * 60
      + EXTRACT(MINUTE FROM "preferred_end_time")::int
  END;

UPDATE "home_bases"
SET
  "opening_minute" = CASE
    WHEN "opening_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "opening_time")::int * 60
      + EXTRACT(MINUTE FROM "opening_time")::int
  END,
  "closing_minute" = CASE
    WHEN "closing_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "closing_time")::int * 60
      + EXTRACT(MINUTE FROM "closing_time")::int
  END;

UPDATE "foreman_day_rosters"
SET
  "preferred_start_minute" = CASE
    WHEN "preferred_start_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "preferred_start_time")::int * 60
      + EXTRACT(MINUTE FROM "preferred_start_time")::int
  END,
  "preferred_end_minute" = CASE
    WHEN "preferred_end_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "preferred_end_time")::int * 60
      + EXTRACT(MINUTE FROM "preferred_end_time")::int
  END;

UPDATE "org_settings"
SET
  "operating_start_minute" = CASE
    WHEN "operating_start_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "operating_start_time")::int * 60
      + EXTRACT(MINUTE FROM "operating_start_time")::int
  END,
  "operating_end_minute" = CASE
    WHEN "operating_end_time" IS NULL THEN NULL
    ELSE EXTRACT(HOUR FROM "operating_end_time")::int * 60
      + EXTRACT(MINUTE FROM "operating_end_time")::int
  END;

-- Range checks for minute columns
ALTER TABLE "jobs"
  ADD CONSTRAINT "chk_jobs_preferred_start_minute_range"
    CHECK ("preferred_start_minute" IS NULL OR "preferred_start_minute" BETWEEN 0 AND 1439),
  ADD CONSTRAINT "chk_jobs_preferred_end_minute_range"
    CHECK ("preferred_end_minute" IS NULL OR "preferred_end_minute" BETWEEN 0 AND 1439);

ALTER TABLE "home_bases"
  ADD CONSTRAINT "chk_home_bases_opening_minute_range"
    CHECK ("opening_minute" IS NULL OR "opening_minute" BETWEEN 0 AND 1439),
  ADD CONSTRAINT "chk_home_bases_closing_minute_range"
    CHECK ("closing_minute" IS NULL OR "closing_minute" BETWEEN 0 AND 1439);

ALTER TABLE "foreman_day_rosters"
  ADD CONSTRAINT "chk_foreman_day_rosters_preferred_start_minute_range"
    CHECK ("preferred_start_minute" IS NULL OR "preferred_start_minute" BETWEEN 0 AND 1439),
  ADD CONSTRAINT "chk_foreman_day_rosters_preferred_end_minute_range"
    CHECK ("preferred_end_minute" IS NULL OR "preferred_end_minute" BETWEEN 0 AND 1439);

ALTER TABLE "org_settings"
  ADD CONSTRAINT "chk_org_settings_operating_start_minute_range"
    CHECK ("operating_start_minute" IS NULL OR "operating_start_minute" BETWEEN 0 AND 1439),
  ADD CONSTRAINT "chk_org_settings_operating_end_minute_range"
    CHECK ("operating_end_minute" IS NULL OR "operating_end_minute" BETWEEN 0 AND 1439);

-- Keep notes_raw required, but make inserts safer for direct-entry jobs
ALTER TABLE "jobs"
  ALTER COLUMN "notes_raw" SET DEFAULT '';

-- Convert preferred channel free-text to enum with fail-fast validation
CREATE TYPE "PreferredChannel" AS ENUM ('CALL', 'TEXT', 'EMAIL');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "job_preferred_channels"
    WHERE UPPER(TRIM("channel")) NOT IN ('CALL', 'TEXT', 'EMAIL')
  ) THEN
    RAISE EXCEPTION
      'job_preferred_channels.channel has invalid values after UPPER(TRIM); expected CALL, TEXT, or EMAIL';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "job_id", UPPER(TRIM("channel")) AS norm_channel, COUNT(*) AS c
      FROM "job_preferred_channels"
      GROUP BY "job_id", UPPER(TRIM("channel"))
      HAVING COUNT(*) > 1
    ) dup
  ) THEN
    RAISE EXCEPTION
      'job_preferred_channels normalization creates duplicate (job_id, channel) values';
  END IF;
END $$;

UPDATE "job_preferred_channels"
SET "channel" = UPPER(TRIM("channel"));

ALTER TABLE "job_preferred_channels"
  ALTER COLUMN "channel" TYPE "PreferredChannel"
  USING "channel"::"PreferredChannel";

-- Partial index for linked midnight-split lookups
CREATE INDEX "idx_schedule_segments_segment_group_id_not_null"
  ON "schedule_segments" ("segment_group_id")
  WHERE "segment_group_id" IS NOT NULL;
