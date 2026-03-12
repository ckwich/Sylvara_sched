-- prior-week-snapshot.sql
-- Seeds a weekly_backlog_snapshots entry for the most recent Saturday (2026-03-07, ISO week 10).
-- Includes per-rep rows AND equipment-level total rows.
-- Uses production rep codes (ANTHONY, DENNIS, MICHAEL).
--
-- This populates the "prior_week_dollars" column in the Summ report and
-- provides the week 10 data point in the Comparable report.
--
-- Values are based on the Iron Tree demo backlog with slight adjustments
-- to show realistic week-over-week change.
--
-- Idempotent: rows that conflict with existing data are skipped.
-- If you need to re-seed, DELETE existing rows for this snapshot_date first:
--   DELETE FROM weekly_backlog_snapshots WHERE snapshot_date = '2026-03-07';

BEGIN;

-- ============================================================
-- CRANE per-rep rows
-- ============================================================

-- ANTHONY: 2 crane jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'CRANE'::"EquipmentType", 'ANTHONY',
  2200.00, 3200.00, 5400.00,
  5.00, 6.00, 11.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'CRANE'::"EquipmentType"
    AND sales_rep_code = 'ANTHONY' AND deleted_at IS NULL
);

-- DENNIS: 2 crane jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'CRANE'::"EquipmentType", 'DENNIS',
  4500.00, 2800.00, 7300.00,
  4.00, 5.00, 9.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'CRANE'::"EquipmentType"
    AND sales_rep_code = 'DENNIS' AND deleted_at IS NULL
);

-- MICHAEL: 2 crane jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'CRANE'::"EquipmentType", 'MICHAEL',
  3600.00, 4100.00, 7700.00,
  6.00, 8.00, 14.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'CRANE'::"EquipmentType"
    AND sales_rep_code = 'MICHAEL' AND deleted_at IS NULL
);

-- CRANE equipment-level total (sales_rep_code IS NULL)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'CRANE'::"EquipmentType", NULL,
  10300.00, 10100.00, 20400.00,
  15.00, 19.00, 34.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'CRANE'::"EquipmentType"
    AND sales_rep_code IS NULL AND deleted_at IS NULL
);


-- ============================================================
-- BUCKET per-rep rows
-- ============================================================

-- ANTHONY: 2 bucket jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'BUCKET'::"EquipmentType", 'ANTHONY',
  1100.00, 1250.00, 2350.00,
  2.00, 3.00, 5.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'BUCKET'::"EquipmentType"
    AND sales_rep_code = 'ANTHONY' AND deleted_at IS NULL
);

-- DENNIS: 2 bucket jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'BUCKET'::"EquipmentType", 'DENNIS',
  1400.00, 950.00, 2350.00,
  4.00, 2.50, 6.50,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'BUCKET'::"EquipmentType"
    AND sales_rep_code = 'DENNIS' AND deleted_at IS NULL
);

-- MICHAEL: 2 bucket jobs (1 scheduled, 1 TBS)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'BUCKET'::"EquipmentType", 'MICHAEL',
  1800.00, 800.00, 2600.00,
  3.50, 2.00, 5.50,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'BUCKET'::"EquipmentType"
    AND sales_rep_code = 'MICHAEL' AND deleted_at IS NULL
);

-- BUCKET equipment-level total (sales_rep_code IS NULL)
INSERT INTO weekly_backlog_snapshots (
  snapshot_date, year, week_number, equipment_type, sales_rep_code,
  scheduled_dollars, tbs_dollars, total_dollars,
  scheduled_hours, tbs_hours, total_hours,
  crew_count, crew_count_override
) SELECT
  '2026-03-07'::date, 2026, 10, 'BUCKET'::"EquipmentType", NULL,
  4300.00, 3000.00, 7300.00,
  9.50, 7.50, 17.00,
  4.00, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots
  WHERE snapshot_date = '2026-03-07' AND equipment_type = 'BUCKET'::"EquipmentType"
    AND sales_rep_code IS NULL AND deleted_at IS NULL
);

COMMIT;
