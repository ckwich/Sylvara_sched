ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS raw_snippet TEXT NULL;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS estimate_id UUID NULL;

CREATE TABLE IF NOT EXISTS seasonal_freeze_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS scheduling_conflict_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dismissed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conflict_date DATE NOT NULL,
  conflict_type VARCHAR(100) NOT NULL,
  conflict_key TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  UNIQUE (dismissed_by_user_id, conflict_date, conflict_type, conflict_key)
);

CREATE TABLE IF NOT EXISTS schedule_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  schedule_segment_id UUID NULL REFERENCES schedule_segments(id) ON DELETE SET NULL,
  notification_type VARCHAR(50) NOT NULL,
  sent_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  channels_sent JSONB NOT NULL DEFAULT '[]',
  channels_suppressed JSONB NULL,
  customer_response VARCHAR(50) NULL,
  customer_responded_at TIMESTAMPTZ NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);
