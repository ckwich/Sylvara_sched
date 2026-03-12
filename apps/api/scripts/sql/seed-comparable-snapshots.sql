-- seed-comparable-snapshots.sql
-- Seeds weekly_backlog_snapshots with historical comparable data.
-- Equipment-level totals only (sales_rep_code IS NULL, dollar fields NULL).
-- Uses Saturday-anchored dates to match snapshot-service.ts production behavior.
--
-- Data spans 2024-03-02 through 2026-03-07 (~105 weeks per equipment type).
-- Hours use a deterministic seasonal curve:
--   Peak: May-October | Ramp: March-April, November | Low: December-February
--
-- Idempotent: rows that conflict with existing data are skipped.
-- Run on a fresh database or after wiping comparable snapshots.

BEGIN;

INSERT INTO weekly_backlog_snapshots (
  snapshot_date,
  year,
  week_number,
  equipment_type,
  sales_rep_code,
  scheduled_dollars,
  tbs_dollars,
  total_dollars,
  scheduled_hours,
  tbs_hours,
  total_hours,
  crew_count,
  crew_count_override
)
SELECT
  sat_date,
  EXTRACT(ISOYEAR FROM sat_date)::int,
  EXTRACT(WEEK FROM sat_date)::int,
  eq_type,
  NULL,   -- sales_rep_code (equipment-level totals)
  NULL,   -- scheduled_dollars (historical hours-only data)
  NULL,   -- tbs_dollars
  NULL,   -- total_dollars
  ROUND((base_sched * sf)::numeric, 2),
  ROUND((base_tbs * sf)::numeric, 2),
  ROUND(((base_sched + base_tbs) * sf)::numeric, 2),
  crew_ct,
  NULL    -- crew_count_override
FROM (
  -- Generate every Saturday from March 2024 through March 2026
  SELECT d::date AS sat_date
  FROM generate_series(
    '2024-03-02'::date,
    '2026-03-07'::date,
    '7 days'::interval
  ) AS d
) dates
CROSS JOIN (
  -- Equipment types with base hours and crew counts
  -- CRANE: higher hours, steady 4 crews
  -- BUCKET: lower hours, steady 4 crews
  VALUES
    ('CRANE'::"EquipmentType", 85.0, 125.0, 4.0),
    ('BUCKET'::"EquipmentType", 55.0,  85.0, 4.0)
) AS eq(eq_type, base_sched, base_tbs, crew_ct)
CROSS JOIN LATERAL (
  SELECT CASE
    -- Winter (Dec-Feb): low season ~35% capacity
    WHEN EXTRACT(MONTH FROM sat_date) IN (12, 1, 2) THEN
      0.30 + 0.10 * SIN(EXTRACT(DOY FROM sat_date)::numeric * 0.17)
    -- Spring ramp (Mar-Apr): ~70% capacity
    WHEN EXTRACT(MONTH FROM sat_date) IN (3, 4) THEN
      0.65 + 0.10 * SIN(EXTRACT(DOY FROM sat_date)::numeric * 0.23)
    -- Peak season (May-Oct): ~100% capacity
    WHEN EXTRACT(MONTH FROM sat_date) BETWEEN 5 AND 10 THEN
      0.90 + 0.15 * SIN(EXTRACT(DOY FROM sat_date)::numeric * 0.31)
    -- Fall wind-down (Nov): ~55% capacity
    ELSE
      0.50 + 0.10 * SIN(EXTRACT(DOY FROM sat_date)::numeric * 0.13)
  END AS sf
) seasonal
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_backlog_snapshots w
  WHERE w.snapshot_date = dates.sat_date
    AND w.equipment_type = eq.eq_type
    AND w.sales_rep_code IS NULL
    AND w.deleted_at IS NULL
);

COMMIT;
