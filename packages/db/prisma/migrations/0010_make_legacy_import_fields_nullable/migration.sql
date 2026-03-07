ALTER TABLE customer_risks
  ALTER COLUMN severity DROP NOT NULL;

ALTER TABLE schedule_segments
  ALTER COLUMN created_by_user_id DROP NOT NULL;
