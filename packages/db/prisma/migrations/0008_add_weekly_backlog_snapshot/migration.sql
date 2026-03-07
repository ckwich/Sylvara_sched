ALTER TABLE org_settings
  ADD COLUMN IF NOT EXISTS sales_per_day DECIMAL(12,2) NULL;

CREATE TABLE IF NOT EXISTS weekly_backlog_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  equipment_type "EquipmentType" NOT NULL,
  sales_rep_code TEXT NULL,
  scheduled_dollars DECIMAL(12,2) NULL,
  tbs_dollars DECIMAL(12,2) NULL,
  total_dollars DECIMAL(12,2) NULL,
  scheduled_hours DECIMAL(10,2) NOT NULL,
  tbs_hours DECIMAL(10,2) NOT NULL,
  total_hours DECIMAL(10,2) NOT NULL,
  crew_count DECIMAL(10,2) NOT NULL,
  crew_count_override DECIMAL(10,2) NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ(6) NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_weekly_snapshot_date_equipment_rep
  ON weekly_backlog_snapshots (snapshot_date, equipment_type, sales_rep_code);

CREATE UNIQUE INDEX IF NOT EXISTS weekly_backlog_snapshots_null_rep_unique
  ON weekly_backlog_snapshots (snapshot_date, equipment_type)
  WHERE sales_rep_code IS NULL;
