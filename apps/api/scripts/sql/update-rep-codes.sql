-- update-rep-codes.sql
-- Maps demo placeholder rep codes to production Iron Tree rep codes.
-- Run this AFTER importing jobs with seed-lan-demo or any demo data.
--
-- Mapping:
--   REP1 -> ANTHONY  (Anthony Lauria)
--   REP2 -> DENNIS   (Dennis Silvio)
--   REP3 -> MICHAEL  (Michael ?)
--
-- Idempotent: safe to run multiple times.

BEGIN;

-- Update jobs table
UPDATE jobs
SET sales_rep_code = CASE sales_rep_code
  WHEN 'REP1' THEN 'ANTHONY'
  WHEN 'REP2' THEN 'DENNIS'
  WHEN 'REP3' THEN 'MICHAEL'
END
WHERE sales_rep_code IN ('REP1', 'REP2', 'REP3')
  AND deleted_at IS NULL;

-- Update weekly_backlog_snapshots (if any exist with demo rep codes)
UPDATE weekly_backlog_snapshots
SET sales_rep_code = CASE sales_rep_code
  WHEN 'REP1' THEN 'ANTHONY'
  WHEN 'REP2' THEN 'DENNIS'
  WHEN 'REP3' THEN 'MICHAEL'
END
WHERE sales_rep_code IN ('REP1', 'REP2', 'REP3')
  AND deleted_at IS NULL;

COMMIT;
