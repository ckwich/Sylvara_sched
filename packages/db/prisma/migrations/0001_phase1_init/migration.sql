-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'SCHEDULER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CustomerRiskStatus" AS ENUM ('OPEN', 'MONITORING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('CRANE', 'BUCKET');

-- CreateEnum
CREATE TYPE "CraneModelSuitability" AS ENUM ('MODEL_1090', 'MODEL_1060', 'EITHER');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('REQUIRED', 'REQUESTED', 'APPROVED', 'DENIED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('PRIMARY', 'RETURN_VISIT');

-- CreateEnum
CREATE TYPE "TravelType" AS ENUM ('START_OF_DAY', 'END_OF_DAY', 'BETWEEN_JOBS');

-- CreateEnum
CREATE TYPE "SegmentSource" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "ScheduleEventType" AS ENUM ('RESCHEDULE_TO', 'TBS_FROM', 'DATE_SWAP', 'NOTE_PARSE_EVENT', 'MANUAL_EDIT');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('LEGACY_PARSE', 'USER_ACTION');

-- CreateEnum
CREATE TYPE "VacatedSlotAction" AS ENUM ('DELETED', 'MOVED', 'SHORTENED');

-- CreateEnum
CREATE TYPE "VacatedSlotStatus" AS ENUM ('OPEN', 'USED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "JobBlockerStatus" AS ENUM ('ACTIVE', 'CLEARED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('EQUIPMENT', 'PERSON');

-- CreateEnum
CREATE TYPE "RosterMemberRole" AS ENUM ('CLIMBER', 'GROUND', 'OPERATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_reasons" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "risk_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_risks" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "narrative" TEXT,
    "status" "CustomerRiskStatus" NOT NULL,
    "owner_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customer_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_risk_reasons" (
    "id" SERIAL NOT NULL,
    "customer_risk_id" INTEGER NOT NULL,
    "risk_reason_id" INTEGER NOT NULL,

    CONSTRAINT "customer_risk_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "equipment_type" "EquipmentType" NOT NULL,
    "sales_rep_code" TEXT NOT NULL,
    "job_site_address" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "completed_date" DATE,
    "completed_by_user_id" INTEGER,
    "completion_notes" TEXT,
    "amount_dollars" DECIMAL(12,2) NOT NULL,
    "estimate_hours_current" DECIMAL(10,2),
    "travel_hours_estimate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "approval_date" DATE,
    "approval_call" TEXT,
    "confirmed_text" TEXT,
    "confirmed_by_user_id" INTEGER,
    "confirmed_at" TIMESTAMPTZ(6),
    "crane_model_suitability" "CraneModelSuitability",
    "requires_spider_lift" BOOLEAN NOT NULL DEFAULT false,
    "winter_flag" BOOLEAN NOT NULL DEFAULT false,
    "frozen_ground_flag" BOOLEAN NOT NULL DEFAULT false,
    "notes_raw" TEXT NOT NULL,
    "notes_last_parsed_at" TIMESTAMPTZ(6),
    "notes_parse_confidence" JSONB,
    "push_up_if_possible" BOOLEAN NOT NULL DEFAULT false,
    "must_be_first_job" BOOLEAN NOT NULL DEFAULT false,
    "preferred_start_time" TIME(6),
    "preferred_end_time" TIME(6),
    "availability_notes" TEXT,
    "no_email" BOOLEAN NOT NULL DEFAULT false,
    "contact_allowed" BOOLEAN NOT NULL DEFAULT true,
    "contact_owner_user_id" INTEGER,
    "contact_instructions" TEXT,
    "access_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_history" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "changed_by_user_id" INTEGER NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,
    "previous_amount_dollars" DECIMAL(12,2),
    "new_amount_dollars" DECIMAL(12,2),
    "previous_estimate_hours" DECIMAL(10,2),
    "new_estimate_hours" DECIMAL(10,2),
    "note" TEXT,

    CONSTRAINT "estimate_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "requirement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "requirement_type_id" INTEGER NOT NULL,
    "status" "RequirementStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_segments" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "segment_group_id" UUID,
    "segment_type" "SegmentType" NOT NULL,
    "start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "end_datetime" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_hours_override" DECIMAL(10,2),
    "deleted_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedule_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_segments" (
    "id" SERIAL NOT NULL,
    "foreman_person_id" INTEGER NOT NULL,
    "related_job_id" INTEGER,
    "service_date" DATE NOT NULL,
    "start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "end_datetime" TIMESTAMPTZ(6) NOT NULL,
    "travel_type" "TravelType" NOT NULL,
    "source" "SegmentSource" NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "travel_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_events" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "event_type" "ScheduleEventType" NOT NULL,
    "source" "EventSource" NOT NULL,
    "from_at" TIMESTAMPTZ(6),
    "to_at" TIMESTAMPTZ(6),
    "actor_user_id" INTEGER,
    "actor_code" TEXT,
    "raw_snippet" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacated_slots" (
    "id" SERIAL NOT NULL,
    "source_segment_id" INTEGER NOT NULL,
    "source_action" "VacatedSlotAction" NOT NULL,
    "start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "end_datetime" TIMESTAMPTZ(6) NOT NULL,
    "slot_hours" DECIMAL(10,2) NOT NULL,
    "equipment_type" "EquipmentType" NOT NULL,
    "status" "VacatedSlotStatus" NOT NULL DEFAULT 'OPEN',
    "chosen_job_id" INTEGER,
    "chosen_segment_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissed_at" TIMESTAMPTZ(6),
    "dismissed_by_user_id" INTEGER,

    CONSTRAINT "vacated_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocker_reasons" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blocker_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_blockers" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "blocker_reason_id" INTEGER NOT NULL,
    "status" "JobBlockerStatus" NOT NULL,
    "notes" TEXT,
    "created_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cleared_at" TIMESTAMPTZ(6),
    "cleared_by_user_id" INTEGER,

    CONSTRAINT "job_blockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" SERIAL NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "inventory_quantity" INTEGER NOT NULL DEFAULT 1,
    "is_foreman" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_reservations" (
    "id" SERIAL NOT NULL,
    "schedule_segment_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "resource_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_bases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "opening_time" TIME(6),
    "closing_time" TIME(6),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "home_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foreman_day_rosters" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "foreman_person_id" INTEGER NOT NULL,
    "home_base_id" INTEGER NOT NULL,
    "preferred_start_time" TIME(6),
    "preferred_end_time" TIME(6),
    "notes" TEXT,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "foreman_day_rosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foreman_day_roster_members" (
    "id" SERIAL NOT NULL,
    "roster_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "person_resource_id" INTEGER NOT NULL,
    "role" "RosterMemberRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foreman_day_roster_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_roster_links" (
    "id" SERIAL NOT NULL,
    "schedule_segment_id" INTEGER NOT NULL,
    "roster_id" INTEGER NOT NULL,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segment_roster_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_constraints" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "access_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_access_constraints" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "access_constraint_id" INTEGER NOT NULL,

    CONSTRAINT "job_access_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_preferred_channels" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,

    CONSTRAINT "job_preferred_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "action_type" TEXT NOT NULL,
    "diff" JSONB,
    "actor_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_runs" (
    "id" SERIAL NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "run_by_user_id" INTEGER,
    "source_filename" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL,
    "summary_json" JSONB,

    CONSTRAINT "import_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_row_maps" (
    "id" SERIAL NOT NULL,
    "import_run_id" INTEGER NOT NULL,
    "sheet_name" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "raw_row_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_row_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "company_timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "operating_start_time" TIME(6),
    "operating_end_time" TIME(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "risk_reasons_code_key" ON "risk_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_customer_risk_reason" ON "customer_risk_reasons"("customer_risk_id", "risk_reason_id");

-- CreateIndex
CREATE INDEX "idx_jobs_equipment_type" ON "jobs"("equipment_type");

-- CreateIndex
CREATE INDEX "idx_jobs_town" ON "jobs"("town");

-- CreateIndex
CREATE INDEX "idx_jobs_completed_date" ON "jobs"("completed_date");

-- CreateIndex
CREATE INDEX "idx_jobs_customer_id" ON "jobs"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_types_code_key" ON "requirement_types"("code");

-- CreateIndex
CREATE INDEX "idx_requirements_status" ON "requirements"("status");

-- CreateIndex
CREATE INDEX "idx_requirements_requirement_type_id" ON "requirements"("requirement_type_id");

-- CreateIndex
CREATE INDEX "idx_schedule_segments_start_datetime" ON "schedule_segments"("start_datetime");

-- CreateIndex
CREATE INDEX "idx_schedule_segments_end_datetime" ON "schedule_segments"("end_datetime");

-- CreateIndex
CREATE INDEX "idx_travel_segments_foreman_service_date" ON "travel_segments"("foreman_person_id", "service_date");

-- CreateIndex
CREATE INDEX "idx_travel_segments_start_datetime" ON "travel_segments"("start_datetime");

-- CreateIndex
CREATE INDEX "idx_travel_segments_end_datetime" ON "travel_segments"("end_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "blocker_reasons_code_key" ON "blocker_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_resource_reservation_segment_resource" ON "resource_reservations"("schedule_segment_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_foreman_day_roster_date_foreman" ON "foreman_day_rosters"("date", "foreman_person_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_foreman_day_roster_member_date_person" ON "foreman_day_roster_members"("date", "person_resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_segment_roster_link_segment" ON "segment_roster_links"("schedule_segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_constraints_code_key" ON "access_constraints"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_job_access_constraint" ON "job_access_constraints"("job_id", "access_constraint_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_job_preferred_channel" ON "job_preferred_channels"("job_id", "channel");

-- CreateIndex
CREATE INDEX "idx_activity_log_entity" ON "activity_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "customer_risks" ADD CONSTRAINT "customer_risks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_risks" ADD CONSTRAINT "customer_risks_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_risk_reasons" ADD CONSTRAINT "customer_risk_reasons_customer_risk_id_fkey" FOREIGN KEY ("customer_risk_id") REFERENCES "customer_risks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_risk_reasons" ADD CONSTRAINT "customer_risk_reasons_risk_reason_id_fkey" FOREIGN KEY ("risk_reason_id") REFERENCES "risk_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_confirmed_by_user_id_fkey" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_contact_owner_user_id_fkey" FOREIGN KEY ("contact_owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_history" ADD CONSTRAINT "estimate_history_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_history" ADD CONSTRAINT "estimate_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_requirement_type_id_fkey" FOREIGN KEY ("requirement_type_id") REFERENCES "requirement_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_segments" ADD CONSTRAINT "schedule_segments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_segments" ADD CONSTRAINT "schedule_segments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_segments" ADD CONSTRAINT "travel_segments_foreman_person_id_fkey" FOREIGN KEY ("foreman_person_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_segments" ADD CONSTRAINT "travel_segments_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_segments" ADD CONSTRAINT "travel_segments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacated_slots" ADD CONSTRAINT "vacated_slots_source_segment_id_fkey" FOREIGN KEY ("source_segment_id") REFERENCES "schedule_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacated_slots" ADD CONSTRAINT "vacated_slots_chosen_job_id_fkey" FOREIGN KEY ("chosen_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacated_slots" ADD CONSTRAINT "vacated_slots_chosen_segment_id_fkey" FOREIGN KEY ("chosen_segment_id") REFERENCES "schedule_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacated_slots" ADD CONSTRAINT "vacated_slots_dismissed_by_user_id_fkey" FOREIGN KEY ("dismissed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_blockers" ADD CONSTRAINT "job_blockers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_blockers" ADD CONSTRAINT "job_blockers_blocker_reason_id_fkey" FOREIGN KEY ("blocker_reason_id") REFERENCES "blocker_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_blockers" ADD CONSTRAINT "job_blockers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_blockers" ADD CONSTRAINT "job_blockers_cleared_by_user_id_fkey" FOREIGN KEY ("cleared_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_schedule_segment_id_fkey" FOREIGN KEY ("schedule_segment_id") REFERENCES "schedule_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreman_day_rosters" ADD CONSTRAINT "foreman_day_rosters_foreman_person_id_fkey" FOREIGN KEY ("foreman_person_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreman_day_rosters" ADD CONSTRAINT "foreman_day_rosters_home_base_id_fkey" FOREIGN KEY ("home_base_id") REFERENCES "home_bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreman_day_rosters" ADD CONSTRAINT "foreman_day_rosters_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreman_day_roster_members" ADD CONSTRAINT "foreman_day_roster_members_roster_id_fkey" FOREIGN KEY ("roster_id") REFERENCES "foreman_day_rosters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreman_day_roster_members" ADD CONSTRAINT "foreman_day_roster_members_person_resource_id_fkey" FOREIGN KEY ("person_resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_roster_links" ADD CONSTRAINT "segment_roster_links_schedule_segment_id_fkey" FOREIGN KEY ("schedule_segment_id") REFERENCES "schedule_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_roster_links" ADD CONSTRAINT "segment_roster_links_roster_id_fkey" FOREIGN KEY ("roster_id") REFERENCES "foreman_day_rosters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_roster_links" ADD CONSTRAINT "segment_roster_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_access_constraints" ADD CONSTRAINT "job_access_constraints_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_access_constraints" ADD CONSTRAINT "job_access_constraints_access_constraint_id_fkey" FOREIGN KEY ("access_constraint_id") REFERENCES "access_constraints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_preferred_channels" ADD CONSTRAINT "job_preferred_channels_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_run_by_user_id_fkey" FOREIGN KEY ("run_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_row_maps" ADD CONSTRAINT "import_row_maps_import_run_id_fkey" FOREIGN KEY ("import_run_id") REFERENCES "import_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Phase 1 manual constraints/indexes not expressible in Prisma schema
ALTER TABLE "resources"
  ADD CONSTRAINT "chk_resources_person_inventory_quantity"
  CHECK ("resource_type" <> 'PERSON' OR "inventory_quantity" = 1);

CREATE INDEX "idx_segments_active_by_job"
  ON "schedule_segments" ("job_id")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_segments_active_by_job_datetime"
  ON "schedule_segments" ("job_id", "start_datetime")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "uq_travel_start_of_day_active_per_foreman_date"
  ON "travel_segments" ("foreman_person_id", "service_date")
  WHERE "deleted_at" IS NULL AND "travel_type" = 'START_OF_DAY';

CREATE UNIQUE INDEX "uq_travel_end_of_day_active_per_foreman_date"
  ON "travel_segments" ("foreman_person_id", "service_date")
  WHERE "deleted_at" IS NULL AND "travel_type" = 'END_OF_DAY';
