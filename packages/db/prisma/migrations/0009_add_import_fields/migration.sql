ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS has_climb BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_signed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_stump_language BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stump_language TEXT NULL,
  ADD COLUMN IF NOT EXISTS import_source TEXT NULL,
  ADD COLUMN IF NOT EXISTS import_row INTEGER NULL,
  ADD COLUMN IF NOT EXISTS unable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_equipment_note TEXT NULL,
  ADD COLUMN IF NOT EXISTS linked_job_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_linked_job_id_fkey'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_linked_job_id_fkey
      FOREIGN KEY (linked_job_id) REFERENCES jobs(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
