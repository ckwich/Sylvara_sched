--
-- PostgreSQL database dump
--

\restrict R6BGpmkGYZBW2Oqry3hRyktAttRBXfIoxUzhXDgg3z1S2lBMc0eElC8VX1opzOR

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-12 14:24:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 65976)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 921 (class 1247 OID 66036)
-- Name: CraneModelSuitability; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CraneModelSuitability" AS ENUM (
    'MODEL_1090',
    'MODEL_1060',
    'EITHER'
);


ALTER TYPE public."CraneModelSuitability" OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 66022)
-- Name: CustomerRiskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CustomerRiskStatus" AS ENUM (
    'OPEN',
    'MONITORING',
    'RESOLVED'
);


ALTER TYPE public."CustomerRiskStatus" OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 66030)
-- Name: EquipmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EquipmentType" AS ENUM (
    'CRANE',
    'BUCKET'
);


ALTER TYPE public."EquipmentType" OWNER TO postgres;

--
-- TOC entry 939 (class 1247 OID 66088)
-- Name: EventSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventSource" AS ENUM (
    'LEGACY_PARSE',
    'USER_ACTION'
);


ALTER TYPE public."EventSource" OWNER TO postgres;

--
-- TOC entry 957 (class 1247 OID 66132)
-- Name: ImportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ImportStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."ImportStatus" OWNER TO postgres;

--
-- TOC entry 948 (class 1247 OID 66110)
-- Name: JobBlockerStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobBlockerStatus" AS ENUM (
    'ACTIVE',
    'CLEARED'
);


ALTER TYPE public."JobBlockerStatus" OWNER TO postgres;

--
-- TOC entry 1044 (class 1247 OID 66650)
-- Name: PreferredChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PreferredChannel" AS ENUM (
    'CALL',
    'TEXT',
    'EMAIL'
);


ALTER TYPE public."PreferredChannel" OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 66044)
-- Name: RequirementStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequirementStatus" AS ENUM (
    'REQUIRED',
    'REQUESTED',
    'APPROVED',
    'DENIED',
    'NOT_REQUIRED'
);


ALTER TYPE public."RequirementStatus" OWNER TO postgres;

--
-- TOC entry 951 (class 1247 OID 66116)
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'EQUIPMENT',
    'PERSON'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- TOC entry 954 (class 1247 OID 66122)
-- Name: RosterMemberRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RosterMemberRole" AS ENUM (
    'CLIMBER',
    'GROUND',
    'OPERATOR',
    'OTHER'
);


ALTER TYPE public."RosterMemberRole" OWNER TO postgres;

--
-- TOC entry 936 (class 1247 OID 66076)
-- Name: ScheduleEventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ScheduleEventType" AS ENUM (
    'RESCHEDULE_TO',
    'TBS_FROM',
    'DATE_SWAP',
    'NOTE_PARSE_EVENT',
    'MANUAL_EDIT',
    'SEGMENT_CREATED',
    'SEGMENT_UPDATED',
    'SEGMENT_MOVED',
    'SEGMENT_RESIZED',
    'SEGMENT_DELETED'
);


ALTER TYPE public."ScheduleEventType" OWNER TO postgres;

--
-- TOC entry 933 (class 1247 OID 66070)
-- Name: SegmentSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SegmentSource" AS ENUM (
    'MANUAL',
    'AUTO'
);


ALTER TYPE public."SegmentSource" OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 66056)
-- Name: SegmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SegmentType" AS ENUM (
    'PRIMARY',
    'RETURN_VISIT'
);


ALTER TYPE public."SegmentType" OWNER TO postgres;

--
-- TOC entry 930 (class 1247 OID 66062)
-- Name: TravelType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TravelType" AS ENUM (
    'START_OF_DAY',
    'END_OF_DAY',
    'BETWEEN_JOBS'
);


ALTER TYPE public."TravelType" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 66014)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'MANAGER',
    'SCHEDULER',
    'VIEWER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- TOC entry 942 (class 1247 OID 66094)
-- Name: VacatedSlotAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VacatedSlotAction" AS ENUM (
    'DELETED',
    'MOVED',
    'SHORTENED'
);


ALTER TYPE public."VacatedSlotAction" OWNER TO postgres;

--
-- TOC entry 945 (class 1247 OID 66102)
-- Name: VacatedSlotStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VacatedSlotStatus" AS ENUM (
    'OPEN',
    'USED',
    'DISMISSED'
);


ALTER TYPE public."VacatedSlotStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 65967)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 66336)
-- Name: access_constraints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_constraints (
    id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.access_constraints OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 66360)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action_type text NOT NULL,
    diff jsonb,
    actor_user_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actor_display text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 66263)
-- Name: blocker_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocker_reasons (
    id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.blocker_reasons OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 66177)
-- Name: customer_risk_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_risk_reasons (
    id uuid NOT NULL,
    customer_risk_id uuid NOT NULL,
    risk_reason_id uuid NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_risk_reasons OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 66168)
-- Name: customer_risks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_risks (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    severity integer,
    narrative text,
    status public."CustomerRiskStatus" NOT NULL,
    owner_user_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_risks OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 66149)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 66200)
-- Name: estimate_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estimate_history (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    changed_by_user_id uuid NOT NULL,
    changed_at timestamp(6) with time zone NOT NULL,
    previous_amount_dollars numeric(12,2),
    new_amount_dollars numeric(12,2),
    previous_estimate_hours numeric(10,2),
    new_estimate_hours numeric(10,2),
    note text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.estimate_history OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 66322)
-- Name: foreman_day_roster_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foreman_day_roster_members (
    id uuid NOT NULL,
    roster_id uuid NOT NULL,
    date date NOT NULL,
    person_resource_id uuid NOT NULL,
    role public."RosterMemberRole" NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.foreman_day_roster_members OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 66313)
-- Name: foreman_day_rosters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foreman_day_rosters (
    id uuid NOT NULL,
    date date NOT NULL,
    foreman_person_id uuid NOT NULL,
    home_base_id uuid NOT NULL,
    preferred_start_time time(6) without time zone,
    preferred_end_time time(6) without time zone,
    notes text,
    created_by_user_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    preferred_start_minute integer,
    preferred_end_minute integer,
    deleted_at timestamp with time zone,
    CONSTRAINT chk_foreman_day_rosters_preferred_end_minute_range CHECK (((preferred_end_minute IS NULL) OR ((preferred_end_minute >= 0) AND (preferred_end_minute <= 1439)))),
    CONSTRAINT chk_foreman_day_rosters_preferred_start_minute_range CHECK (((preferred_start_minute IS NULL) OR ((preferred_start_minute >= 0) AND (preferred_start_minute <= 1439))))
);


ALTER TABLE public.foreman_day_rosters OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 66303)
-- Name: home_bases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.home_bases (
    id uuid NOT NULL,
    name text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    opening_time time(6) without time zone,
    closing_time time(6) without time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    opening_minute integer,
    closing_minute integer,
    deleted_at timestamp with time zone,
    CONSTRAINT chk_home_bases_closing_minute_range CHECK (((closing_minute IS NULL) OR ((closing_minute >= 0) AND (closing_minute <= 1439)))),
    CONSTRAINT chk_home_bases_opening_minute_range CHECK (((opening_minute IS NULL) OR ((opening_minute >= 0) AND (opening_minute <= 1439))))
);


ALTER TABLE public.home_bases OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 66377)
-- Name: import_row_maps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.import_row_maps (
    id uuid NOT NULL,
    import_run_id uuid NOT NULL,
    sheet_name text NOT NULL,
    row_number integer NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    raw_row_json jsonb NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.import_row_maps OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 66369)
-- Name: import_runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.import_runs (
    id uuid NOT NULL,
    started_at timestamp(6) with time zone NOT NULL,
    finished_at timestamp(6) with time zone,
    run_by_user_id uuid,
    source_filename text NOT NULL,
    status public."ImportStatus" NOT NULL,
    summary_json jsonb,
    deleted_at timestamp with time zone
);


ALTER TABLE public.import_runs OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 66346)
-- Name: job_access_constraints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_access_constraints (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    access_constraint_id uuid NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.job_access_constraints OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 66273)
-- Name: job_blockers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_blockers (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    blocker_reason_id uuid NOT NULL,
    status public."JobBlockerStatus" NOT NULL,
    notes text,
    created_by_user_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cleared_at timestamp(6) with time zone,
    cleared_by_user_id uuid,
    deleted_at timestamp with time zone
);


ALTER TABLE public.job_blockers OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 66352)
-- Name: job_preferred_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_preferred_channels (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    channel public."PreferredChannel" NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.job_preferred_channels OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 66183)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    equipment_type public."EquipmentType" NOT NULL,
    sales_rep_code text NOT NULL,
    job_site_address text NOT NULL,
    town text NOT NULL,
    completed_date date,
    completed_by_user_id uuid,
    completion_notes text,
    amount_dollars numeric(12,2) NOT NULL,
    estimate_hours_current numeric(10,2),
    travel_hours_estimate numeric(10,2) DEFAULT 0 NOT NULL,
    approval_date date,
    approval_call text,
    confirmed_text text,
    confirmed_by_user_id uuid,
    confirmed_at timestamp(6) with time zone,
    crane_model_suitability public."CraneModelSuitability",
    requires_spider_lift boolean DEFAULT false NOT NULL,
    winter_flag boolean DEFAULT false NOT NULL,
    frozen_ground_flag boolean DEFAULT false NOT NULL,
    notes_raw text DEFAULT ''::text NOT NULL,
    notes_last_parsed_at timestamp(6) with time zone,
    notes_parse_confidence jsonb,
    push_up_if_possible boolean DEFAULT false NOT NULL,
    must_be_first_job boolean DEFAULT false NOT NULL,
    preferred_start_time time(6) without time zone,
    preferred_end_time time(6) without time zone,
    availability_notes text,
    no_email boolean DEFAULT false NOT NULL,
    contact_allowed boolean DEFAULT true NOT NULL,
    contact_owner_user_id uuid,
    contact_instructions text,
    access_notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    preferred_start_minute integer,
    preferred_end_minute integer,
    deleted_at timestamp with time zone,
    estimate_id uuid,
    has_climb boolean DEFAULT false NOT NULL,
    is_signed boolean DEFAULT false NOT NULL,
    has_stump_language boolean DEFAULT false NOT NULL,
    stump_language text,
    import_source text,
    import_row integer,
    unable boolean DEFAULT false NOT NULL,
    linked_equipment_note text,
    linked_job_id uuid,
    CONSTRAINT chk_jobs_preferred_end_minute_range CHECK (((preferred_end_minute IS NULL) OR ((preferred_end_minute >= 0) AND (preferred_end_minute <= 1439)))),
    CONSTRAINT chk_jobs_preferred_start_minute_range CHECK (((preferred_start_minute IS NULL) OR ((preferred_start_minute >= 0) AND (preferred_start_minute <= 1439))))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 66386)
-- Name: org_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_settings (
    id uuid NOT NULL,
    company_timezone text DEFAULT 'America/New_York'::text NOT NULL,
    operating_start_time time(6) without time zone,
    operating_end_time time(6) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    operating_start_minute integer,
    operating_end_minute integer,
    deleted_at timestamp with time zone,
    sales_per_day numeric(12,2),
    CONSTRAINT chk_org_settings_operating_end_minute_range CHECK (((operating_end_minute IS NULL) OR ((operating_end_minute >= 0) AND (operating_end_minute <= 1439)))),
    CONSTRAINT chk_org_settings_operating_start_minute_range CHECK (((operating_start_minute IS NULL) OR ((operating_start_minute >= 0) AND (operating_start_minute <= 1439))))
);


ALTER TABLE public.org_settings OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 66208)
-- Name: requirement_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirement_types (
    id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.requirement_types OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 66218)
-- Name: requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirements (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    requirement_type_id uuid NOT NULL,
    status public."RequirementStatus" NOT NULL,
    notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone,
    source text,
    raw_snippet text
);


ALTER TABLE public.requirements OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 66294)
-- Name: resource_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_reservations (
    id uuid NOT NULL,
    schedule_segment_id uuid NOT NULL,
    resource_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.resource_reservations OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 66282)
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id uuid NOT NULL,
    resource_type public."ResourceType" NOT NULL,
    name text NOT NULL,
    inventory_quantity integer DEFAULT 1 NOT NULL,
    is_foreman boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT chk_resources_person_inventory_quantity CHECK (((resource_type <> 'PERSON'::public."ResourceType") OR (inventory_quantity = 1)))
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 66158)
-- Name: risk_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.risk_reasons (
    id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.risk_reasons OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 66246)
-- Name: schedule_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_events (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    event_type public."ScheduleEventType" NOT NULL,
    source public."EventSource" NOT NULL,
    from_at timestamp(6) with time zone,
    to_at timestamp(6) with time zone,
    actor_user_id uuid,
    actor_code text,
    raw_snippet text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.schedule_events OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 66706)
-- Name: schedule_notification_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_notification_logs (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    schedule_segment_id uuid,
    notification_type text NOT NULL,
    sent_by_user_id uuid NOT NULL,
    channels_sent jsonb DEFAULT '[]'::jsonb NOT NULL,
    channels_suppressed jsonb,
    customer_response text,
    customer_responded_at timestamp with time zone,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.schedule_notification_logs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 66227)
-- Name: schedule_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_segments (
    id uuid NOT NULL,
    job_id uuid NOT NULL,
    segment_group_id uuid,
    segment_type public."SegmentType" NOT NULL,
    start_datetime timestamp(6) with time zone NOT NULL,
    end_datetime timestamp(6) with time zone NOT NULL,
    scheduled_hours_override numeric(10,2),
    deleted_at timestamp(6) with time zone,
    notes text,
    created_by_user_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public.schedule_segments OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 66690)
-- Name: scheduling_conflict_dismissals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduling_conflict_dismissals (
    id uuid NOT NULL,
    dismissed_by_user_id uuid NOT NULL,
    conflict_date date NOT NULL,
    conflict_type text NOT NULL,
    conflict_key text NOT NULL,
    dismissed_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.scheduling_conflict_dismissals OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 66675)
-- Name: seasonal_freeze_windows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasonal_freeze_windows (
    id uuid NOT NULL,
    label text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    notes text,
    active boolean DEFAULT true NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.seasonal_freeze_windows OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 66329)
-- Name: segment_roster_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.segment_roster_links (
    id uuid NOT NULL,
    schedule_segment_id uuid NOT NULL,
    roster_id uuid NOT NULL,
    created_by_user_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.segment_roster_links OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 66236)
-- Name: travel_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.travel_segments (
    id uuid NOT NULL,
    foreman_person_id uuid NOT NULL,
    related_job_id uuid,
    service_date date NOT NULL,
    start_datetime timestamp(6) with time zone NOT NULL,
    end_datetime timestamp(6) with time zone NOT NULL,
    travel_type public."TravelType" NOT NULL,
    source public."SegmentSource" NOT NULL,
    locked boolean DEFAULT false NOT NULL,
    notes text,
    created_by_user_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp(6) with time zone
);


ALTER TABLE public.travel_segments OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 66139)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public."UserRole" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    deleted_at timestamp with time zone,
    clerk_id text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 66255)
-- Name: vacated_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacated_slots (
    id uuid NOT NULL,
    source_segment_id uuid NOT NULL,
    source_action public."VacatedSlotAction" NOT NULL,
    start_datetime timestamp(6) with time zone NOT NULL,
    end_datetime timestamp(6) with time zone NOT NULL,
    slot_hours numeric(10,2) NOT NULL,
    equipment_type public."EquipmentType" NOT NULL,
    status public."VacatedSlotStatus" DEFAULT 'OPEN'::public."VacatedSlotStatus" NOT NULL,
    chosen_job_id uuid,
    chosen_segment_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dismissed_at timestamp(6) with time zone,
    dismissed_by_user_id uuid,
    deleted_at timestamp with time zone
);


ALTER TABLE public.vacated_slots OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 107210)
-- Name: weekly_backlog_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_backlog_snapshots (
    id uuid NOT NULL,
    snapshot_date date NOT NULL,
    year integer NOT NULL,
    week_number integer NOT NULL,
    equipment_type public."EquipmentType" NOT NULL,
    sales_rep_code text,
    scheduled_dollars numeric(12,2),
    tbs_dollars numeric(12,2),
    total_dollars numeric(12,2),
    scheduled_hours numeric(10,2) NOT NULL,
    tbs_hours numeric(10,2) NOT NULL,
    total_hours numeric(10,2) NOT NULL,
    crew_count numeric(10,2) NOT NULL,
    crew_count_override numeric(10,2),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(6) with time zone
);


ALTER TABLE public.weekly_backlog_snapshots OWNER TO postgres;

--
-- TOC entry 3838 (class 0 OID 65967)
-- Dependencies: 216
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9b3d6afb-77e6-4e8e-ad46-aa63850e605a	091d0f00f447c1a523bdd053efe41b1a8877b1f1df09bc72ec8842f44e980016	2026-03-05 00:22:06.098381+00	0001_phase1_init	\N	\N	2026-03-05 00:22:05.844905+00	1
6bef5cf8-86da-4a8c-978e-df3c3bf43df4	e55fa62dd01ecb50db485de0b8edc3b4a9c124a4f10b45837ecf37691d5cc7d4	2026-03-05 00:22:06.121308+00	0002_phase1_fix_pass	\N	\N	2026-03-05 00:22:06.099912+00	1
088564db-a471-4612-8e48-548bf860722c	523ee955d47cbf74a31c73f6793811dceb88e7ac20859022ea43b062e8e06b47	2026-03-05 00:22:06.131625+00	0003_m2_schedule_segment_foundations	\N	\N	2026-03-05 00:22:06.122834+00	1
c2d6d88f-677a-4e2b-a1d0-2ee14eaf9be9	db6ba612c87cd8821c508510a38a0e4356f66bef4c45083a518a0f4cb1d59fdc	2026-03-05 00:22:06.136919+00	0004_activity_log_actor_display	\N	\N	2026-03-05 00:22:06.133205+00	1
20897ea9-d012-42aa-bf13-59abd1c789ff	4941c098902fbfaa9ba7f4aa66749e0f7f7a7900702aa3bd1498f8f02e1d81db	2026-03-05 00:22:06.147618+00	0005_add_deleted_at_all_tables	\N	\N	2026-03-05 00:22:06.138713+00	1
3c71b02b-dcfc-49dc-864d-1ed05ceaa817	7ae9f6324f54921df63cb72c16c7c103c8503cc795c76892696728f11e7ea518	2026-03-05 00:22:06.173142+00	0006_schema_additions	\N	\N	2026-03-05 00:22:06.148868+00	1
d1be0637-075c-48fb-887d-32fc3cf3b67a	95fffde1375757e8cdc07715fcb2a84b2b0f2e4ce780dd47ce9597deee1c3b9b	2026-03-06 23:26:18.692953+00	0007_add_jobs_sales_rep_code_index	\N	\N	2026-03-06 23:26:18.678909+00	1
3a3b921b-2f58-44ff-98c4-55d266dc253e	7287a5f521d46d04fb34c683323425ceb71fb709e104e4d492ea5c576f4ca1b3	2026-03-06 23:26:19.217743+00	20260306232619_add_weekly_backlog_snapshot	\N	\N	2026-03-06 23:26:19.178245+00	1
2dce9b5d-3081-400c-a76a-f7fc33269db6	bd1bb389bde290a986020fed563da1bbf55dce7604fd3a54323250ddf9092a11	2026-03-07 00:04:17.963705+00	0008_add_weekly_backlog_snapshot	\N	\N	2026-03-07 00:04:17.950367+00	1
396b68d9-d66e-458a-96b2-3dcb3288273d	fa36e419b18610ed5ca6b9128ae2b2ffe388f14dddb8f4d649064a80e537c390	2026-03-07 09:54:34.031134+00	0009_add_import_fields	\N	\N	2026-03-07 09:54:34.016797+00	1
dce9654e-5b2a-4a49-a53d-46d404761203	b36ba4e55bb8a0c198f618589e27927d3755d600b619d045f3681ae1f214ad2a	2026-03-07 09:54:34.038432+00	0010_make_legacy_import_fields_nullable	\N	\N	2026-03-07 09:54:34.032647+00	1
7bf46b77-d7ec-4d2d-8a81-e0963c45ce14	d92e67ba537029182019e4c85533e60268a154d514eef23aacd9faf55f39f4fa	2026-03-09 22:00:56.041607+00	0011_add_clerk_id_to_user	\N	\N	2026-03-09 22:00:56.025882+00	1
\.


--
-- TOC entry 3860 (class 0 OID 66336)
-- Dependencies: 238
-- Data for Name: access_constraints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_constraints (id, code, label, active, created_at, updated_at, deleted_at) FROM stdin;
b7193cb0-e717-4a3c-84d9-cecfa4f3df0b	DRIVEWAY_BLOCKED	Driveway blocked	t	2026-03-07 23:05:40.69+00	2026-03-08 07:30:27.142+00	\N
fddb63bd-9239-46df-a5cb-ff4819bcd3c6	NEIGHBOR_DRIVEWAY_ACCESS	Neighbor driveway access	t	2026-03-07 23:05:40.693+00	2026-03-08 07:30:27.144+00	\N
8c907941-6c24-4d0f-85c9-409a687262a2	GATE_CODE_NEEDED	Gate/code needed	t	2026-03-07 23:05:40.695+00	2026-03-08 07:30:27.145+00	\N
bce3535e-4d4f-42f2-ae08-cc5d0b7d5e7a	VEHICLES_MUST_BE_MOVED	Vehicles must be moved	t	2026-03-07 23:05:40.696+00	2026-03-08 07:30:27.147+00	\N
216382a8-a8a0-43c8-930b-d53a9c8b420d	STREET_PARKING_CONSTRAINTS	Street/parking constraints	t	2026-03-07 23:05:40.697+00	2026-03-08 07:30:27.148+00	\N
7ebd89ef-8578-4f94-a66e-88302fa4b5b2	OTHER	Other	t	2026-03-07 23:05:40.698+00	2026-03-08 07:30:27.15+00	\N
\.


--
-- TOC entry 3863 (class 0 OID 66360)
-- Dependencies: 241
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, entity_type, entity_id, action_type, diff, actor_user_id, created_at, actor_display, deleted_at) FROM stdin;
c1b1eec0-719b-4a6c-b915-24b4e0a0da15	ScheduleSegment	6381b6b7-68ca-4579-b948-2b13c5440bbe	SEGMENT_ADDED	{"jobId": "9ad9e518-29b6-4f53-b435-dd9502b8ced5", "rosterId": "8baab01b-113a-4d7e-b866-aebd85217de8", "endDatetime": "2026-03-03T20:10:00.000Z", "startDatetime": "2026-03-03T14:10:00.000Z"}	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:51.392+00	\N	\N
9cfe3cfc-d3fe-4577-9f39-673fc555dd6b	ForemanDayRoster	486d8298-d149-4396-82db-496d331b61b8	CREATED	{"date": "2026-03-09", "notes": null, "homeBaseId": "87533035-d342-419b-85c3-112378e3e650", "foremanPersonId": "18bc7f63-8666-459e-b180-f977c68197f3", "preferredEndMinute": null, "preferredStartMinute": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:58:25.098+00	\N	\N
f7e5e660-b8f6-449c-a4ba-bb4e0bac2c5b	ScheduleSegment	ac9afc01-1f82-4bed-97ee-75173cee158c	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "486d8298-d149-4396-82db-496d331b61b8", "endDatetime": "2026-03-09T18:00:00.000Z", "startDatetime": "2026-03-09T12:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:58:25.178+00	\N	\N
b265c6c4-9417-46ed-b7fd-d7752b16f1a5	VacatedSlot	09041628-b973-49ff-b4f6-e10bc117aa05	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-09T18:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-09T12:00:00.000Z", "sourceSegmentId": "ac9afc01-1f82-4bed-97ee-75173cee158c"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:59:56.296+00	\N	\N
ecbade0c-7e31-4b03-b8fb-87ef4d3caa84	ScheduleSegment	ac9afc01-1f82-4bed-97ee-75173cee158c	SEGMENT_DELETED	{"deletedAt": "2026-03-10T00:59:56.287Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:59:56.299+00	\N	\N
032b64d1-72a7-408a-9a14-ff991f5f3a4b	ScheduleSegment	5b782ff3-888b-4339-944e-cc9fbc010da7	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "486d8298-d149-4396-82db-496d331b61b8", "endDatetime": "2026-03-09T18:00:00.000Z", "startDatetime": "2026-03-09T12:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 01:04:26.861+00	\N	\N
eed5f99e-a5fb-4baf-9903-394a6d1572d4	VacatedSlot	b1ed53ac-78c5-4ea1-9479-2bc32c0ed9d2	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-09T18:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-09T12:00:00.000Z", "sourceSegmentId": "5b782ff3-888b-4339-944e-cc9fbc010da7"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 01:04:31.24+00	\N	\N
d774c0aa-291b-49fc-af45-2c9e4bb77428	ScheduleSegment	5b782ff3-888b-4339-944e-cc9fbc010da7	SEGMENT_DELETED	{"deletedAt": "2026-03-10T01:04:31.235Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 01:04:31.242+00	\N	\N
2e05a1bf-e78e-4703-b3d1-9cce9f644063	Resource	18bc7f63-8666-459e-b180-f977c68197f3	DELETED	{"deletedAt": "2026-03-10T23:13:30.704Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:13:30.718+00	\N	\N
633cfa46-c92e-48e6-8526-c58d6881e784	Resource	e14b6897-1152-40d8-97b2-829c1dc6ea85	DELETED	{"deletedAt": "2026-03-10T23:16:27.505Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:16:27.509+00	\N	\N
b7b3195d-1ec0-45bc-b096-768875914cae	Resource	1a004204-5c0b-4b0a-bcbc-452e450da45f	DELETED	{"deletedAt": "2026-03-10T23:22:25.041Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:22:25.046+00	\N	\N
f0b6c6a8-1de5-48c5-8d48-ab6f732b1156	ForemanDayRoster	b797b156-1e69-4e56-b2ec-5c4c594c447f	CREATED	{"date": "2026-03-10", "notes": null, "homeBaseId": "87533035-d342-419b-85c3-112378e3e650", "foremanPersonId": "bb3e098c-d85e-43a7-9014-c1951c019dff", "preferredEndMinute": null, "preferredStartMinute": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:23.597+00	\N	\N
3f53090c-62b1-40f4-97e5-f55e80690862	ScheduleSegment	5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "b797b156-1e69-4e56-b2ec-5c4c594c447f", "endDatetime": "2026-03-10T20:10:00.000Z", "startDatetime": "2026-03-10T14:10:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:23.664+00	\N	\N
cdbeebbc-57ae-4899-871f-a325afbadf2a	VacatedSlot	3cf22191-af1f-4302-b066-6b3da60833b7	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-10T20:10:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-10T14:10:00.000Z", "sourceSegmentId": "5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:30.715+00	\N	\N
a496f495-b4c7-48e3-9aca-1ef089b529af	ScheduleSegment	5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d	SEGMENT_DELETED	{"deletedAt": "2026-03-10T23:38:30.708Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:30.718+00	\N	\N
09f6ab95-7e83-4e64-9004-0067a0db6b7a	HomeBase	87533035-d342-419b-85c3-112378e3e650	DELETED	{"name": "E2E Base 1772819991966", "deletedAt": "2026-03-10T23:59:47.193Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:59:47.197+00	\N	\N
baadbab5-ba84-4cb2-9e41-04cf75e4c317	Job	7e28f8bb-5b7d-484e-b02c-da1b32b8be80	UPDATED	{"salesRepCode": {"to": "AUSTIN", "from": "UNASSIGNED"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 18:28:03.666+00	\N	\N
ab331405-0a16-42f8-ab88-e269a27616b5	User	cf9b9684-5d14-4a6d-81aa-0b1c63af19db	UPDATED	{"to": false, "from": true, "field": "active"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 18:37:08.993+00	\N	\N
b4307f42-7301-41bb-9aaa-064078c41583	ForemanDayRoster	b2791150-9976-4616-bb95-9bab215d6386	CREATED	{"date": "2026-03-11", "notes": null, "homeBaseId": "007f9821-f0f1-4e81-85f1-088a13015858", "foremanPersonId": "bb3e098c-d85e-43a7-9014-c1951c019dff", "preferredEndMinute": null, "preferredStartMinute": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:51.838+00	\N	\N
88c3c7fa-f626-4b45-9bb0-e084c1e1ce72	ScheduleSegment	f325874c-5384-41e8-87e1-510c286617d5	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "b2791150-9976-4616-bb95-9bab215d6386", "endDatetime": "2026-03-11T17:00:00.000Z", "startDatetime": "2026-03-11T11:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:51.909+00	\N	\N
83afa11b-5673-4fe0-95f1-1d52fbc891df	ForemanDayRoster	ac04c969-2738-4153-a813-2cd3113f8459	CREATED	{"date": "2026-03-11", "notes": null, "homeBaseId": "007f9821-f0f1-4e81-85f1-088a13015858", "foremanPersonId": "84745f0b-85ce-492d-9460-70551f132780", "preferredEndMinute": null, "preferredStartMinute": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:59.974+00	\N	\N
87ed81e0-28fd-4b8f-90de-d010d02717a9	ScheduleSegment	c70df85d-610e-4e18-acc0-7156597c0f72	SEGMENT_CREATED	{"jobId": "4142cedb-6a9a-42d9-b93b-50e305307342", "rosterId": "ac04c969-2738-4153-a813-2cd3113f8459", "endDatetime": "2026-03-11T16:00:00.000Z", "startDatetime": "2026-03-11T13:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:00.059+00	\N	\N
11652d5c-6889-4f07-8466-61894f5f0c21	ForemanDayRoster	e97da361-77b6-4595-ac17-5bd11d52b9db	CREATED	{"date": "2026-03-11", "notes": null, "homeBaseId": "007f9821-f0f1-4e81-85f1-088a13015858", "foremanPersonId": "6fca4882-85f1-4b89-8b24-f7b3757202b6", "preferredEndMinute": null, "preferredStartMinute": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:06.945+00	\N	\N
b0d70933-f086-44d9-aa64-fd18e51058ab	ScheduleSegment	bf335ed6-4c29-4979-9820-a76ead60eabe	SEGMENT_CREATED	{"jobId": "5402fe73-681a-4778-9b0d-25d4c2152746", "rosterId": "e97da361-77b6-4595-ac17-5bd11d52b9db", "endDatetime": "2026-03-11T12:30:00.000Z", "startDatetime": "2026-03-11T11:30:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:07+00	\N	\N
5c7ebe72-74a6-4eee-ae88-aa11c206a663	VacatedSlot	cab52ff9-e641-4a92-9fa5-d80a169b70f6	VACATED_SLOT_CREATED	{"slotHours": "1", "endDatetime": "2026-03-11T12:30:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-11T11:30:00.000Z", "sourceSegmentId": "bf335ed6-4c29-4979-9820-a76ead60eabe"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:38.832+00	\N	\N
dcfdd7ff-4c53-458a-a727-d914fc993100	ScheduleSegment	bf335ed6-4c29-4979-9820-a76ead60eabe	SEGMENT_DELETED	{"deletedAt": "2026-03-11T19:23:38.826Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:38.836+00	\N	\N
c0d22fdc-75b6-4827-a8b6-7c7f7cf46d42	VacatedSlot	9a40fdaa-6786-40b1-bad5-3336d71f09e3	VACATED_SLOT_CREATED	{"slotHours": "3", "endDatetime": "2026-03-11T16:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-11T13:00:00.000Z", "sourceSegmentId": "c70df85d-610e-4e18-acc0-7156597c0f72"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:50.821+00	\N	\N
0cf7639f-8ec2-45ad-948d-c14ecbced03c	ScheduleSegment	c70df85d-610e-4e18-acc0-7156597c0f72	SEGMENT_DELETED	{"deletedAt": "2026-03-11T19:23:50.816Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:50.824+00	\N	\N
b8e35e81-4232-47a9-88ad-bc8cd6b39996	VacatedSlot	888f865e-d96f-4d13-a60b-b29e1c63bbf8	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-11T17:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-11T11:00:00.000Z", "sourceSegmentId": "f325874c-5384-41e8-87e1-510c286617d5"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:57.721+00	\N	\N
da7ac446-5064-4a97-a9cb-4c9d3956e386	ScheduleSegment	f325874c-5384-41e8-87e1-510c286617d5	SEGMENT_DELETED	{"deletedAt": "2026-03-11T19:23:57.716Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:23:57.722+00	\N	\N
20519f09-666a-4bf2-abe2-26dbca27814f	VacatedSlot	888f865e-d96f-4d13-a60b-b29e1c63bbf8	PUSHUP_DISMISSED	{"dismissedAt": "2026-03-11T19:24:02.250Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:24:02.255+00	\N	\N
0e768373-6bd0-4586-9fb1-6ec2b2b16eb3	ScheduleSegment	ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "b2791150-9976-4616-bb95-9bab215d6386", "endDatetime": "2026-03-11T19:00:00.000Z", "startDatetime": "2026-03-11T13:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:31:11.658+00	\N	\N
b01d2719-70f4-4ba2-bbc8-178ce8bbcb95	VacatedSlot	e3fdd5fe-2cff-405d-8003-a46e279aa870	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-11T19:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-11T13:00:00.000Z", "sourceSegmentId": "ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:31:32.599+00	\N	\N
f1bcd4d4-f214-4e03-8570-4164898ea2b1	ScheduleSegment	ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e	SEGMENT_DELETED	{"deletedAt": "2026-03-11T19:31:32.592Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:31:32.604+00	\N	\N
c3ac088f-eda7-4fa7-9822-4e009571d27e	VacatedSlot	cab52ff9-e641-4a92-9fa5-d80a169b70f6	PUSHUP_DISMISSED	{"dismissedAt": "2026-03-11T20:04:20.376Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:04:20.381+00	\N	\N
74479dd6-c6b8-4f8c-a8a6-e3f98dffd295	VacatedSlot	cab52ff9-e641-4a92-9fa5-d80a169b70f6	PUSHUP_DISMISSED	{"dismissedAt": "2026-03-11T20:04:24.955Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:04:24.959+00	\N	\N
dddfd4f8-a327-44f8-a029-21f2ec903ec2	ScheduleSegment	abb433c8-ef20-4c41-b576-e8cbcef665f5	SEGMENT_CREATED	{"jobId": "039a90f3-10c0-4b52-8e60-bc6b87b9e7df", "rosterId": "b2791150-9976-4616-bb95-9bab215d6386", "endDatetime": "2026-03-11T18:00:00.000Z", "startDatetime": "2026-03-11T12:00:00.000Z", "scheduledHoursOverride": null}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:34.497+00	\N	\N
9602640d-3036-4633-ae40-4db040f8d980	VacatedSlot	16d6a8b6-ed4e-4ac0-ba27-be0842722e8c	VACATED_SLOT_CREATED	{"slotHours": "6", "endDatetime": "2026-03-11T18:00:00.000Z", "sourceAction": "DELETED", "equipmentType": "CRANE", "startDatetime": "2026-03-11T12:00:00.000Z", "sourceSegmentId": "abb433c8-ef20-4c41-b576-e8cbcef665f5"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:38.401+00	\N	\N
a8789cf6-c454-464d-9515-316beed29ca1	ScheduleSegment	abb433c8-ef20-4c41-b576-e8cbcef665f5	SEGMENT_DELETED	{"deletedAt": "2026-03-11T20:12:38.395Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:38.404+00	\N	\N
79beb73c-ea29-4f1c-aee4-1072f287ca2e	VacatedSlot	16d6a8b6-ed4e-4ac0-ba27-be0842722e8c	PUSHUP_DISMISSED	{"dismissedAt": "2026-03-11T20:12:45.366Z"}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:45.372+00	\N	\N
e5a0f60c-91f9-4429-9f27-292a335786d9	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:14:27.465Z", "from": null}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:14:27.471+00	\N	\N
807002cb-3dae-4610-9ccb-0cf965da1f91	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:14:31.001Z", "from": "2026-03-11T20:14:27.465Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:14:31.006+00	\N	\N
ba40206a-adc3-47c7-9461-a26600ac18a9	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:14:32.418Z", "from": "2026-03-11T20:14:31.001Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:14:32.422+00	\N	\N
302007b5-1369-43c6-9638-a9848826cdb1	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:14:34.270Z", "from": "2026-03-11T20:14:32.418Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:14:34.275+00	\N	\N
0e0d95e8-5d2b-4120-a254-74dd10e66cb7	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:15:27.110Z", "from": "2026-03-11T20:14:34.270Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:15:27.114+00	\N	\N
a1bfe73f-062d-4932-ba0c-79e01690a72a	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:15:28.135Z", "from": "2026-03-11T20:15:27.110Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:15:28.139+00	\N	\N
165ec291-486e-4897-8c9f-1b95397b1588	Job	bbc6a8e4-57c5-4534-b400-fea490abc92f	NOTE_PARSED	{"notesLastParsedAt": {"to": "2026-03-11T20:15:29.324Z", "from": "2026-03-11T20:15:28.135Z"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:15:29.328+00	\N	\N
4c660b67-f60d-43e9-a475-2374cdd8c701	HomeBase	007f9821-f0f1-4e81-85f1-088a13015858	UPDATED	{"addressLine1": {"to": "64 Dunham Rd.", "from": "12 Rantoul St"}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:17:57.494+00	\N	\N
e177e081-58fe-4f7a-9659-b98915455c10	Job	4c447d7b-bc77-48cc-865f-f3a8e08160df	UPDATED	{"pushUpIfPossible": {"to": true, "from": false}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:27:32.87+00	\N	\N
bca65f77-af18-4339-bad9-6244c452bc4e	Job	4c447d7b-bc77-48cc-865f-f3a8e08160df	UPDATED	{}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:27:39.809+00	\N	\N
81c3b9e1-78fa-4616-bcc5-1b3d376cdb98	Job	f64e590b-9ab8-405c-ae56-395f944072b2	UPDATED	{"pushUpIfPossible": {"to": true, "from": false}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:27:53.171+00	\N	\N
a27a7e4b-3f8f-44b3-9fc9-74ce181c0e57	Job	f64e590b-9ab8-405c-ae56-395f944072b2	UPDATED	{}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:27:54.805+00	\N	\N
a5e7297e-afe7-4512-af66-660de9fc62b0	Job	ff11a553-e8fb-4d0b-9dee-beaed8ed7015	UPDATED	{"pushUpIfPossible": {"to": true, "from": false}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:28:14.62+00	\N	\N
47825445-58c0-49d6-853f-6917823c2968	Job	ff11a553-e8fb-4d0b-9dee-beaed8ed7015	UPDATED	{}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:28:16.157+00	\N	\N
28d648fa-83ae-4cf9-ab8b-564160af3e00	Job	d8ba4db5-14c4-4dc6-b90c-079a8810f31c	UPDATED	{"pushUpIfPossible": {"to": true, "from": false}}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:28:20.902+00	\N	\N
679ac2dc-50bb-455f-bc1c-f8201ad075a0	Job	d8ba4db5-14c4-4dc6-b90c-079a8810f31c	UPDATED	{}	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:28:22.315+00	\N	\N
\.


--
-- TOC entry 3852 (class 0 OID 66263)
-- Dependencies: 230
-- Data for Name: blocker_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocker_reasons (id, code, label, active, created_at, updated_at, deleted_at) FROM stdin;
538e4624-e8ac-4638-a619-7f45a3cf739d	PERMIT_PENDING	Permit Pending	t	2026-03-07 23:05:40.675+00	2026-03-08 07:30:27.128+00	\N
2e3a20e7-7080-4ff3-bea3-d30732799c9a	CUSTOMER_UNRESPONSIVE	Customer Unresponsive	t	2026-03-07 23:05:40.679+00	2026-03-08 07:30:27.13+00	\N
0f855933-bcee-4a27-b896-2119d2d5f929	ACCESS_BLOCKED	Access Blocked	t	2026-03-07 23:05:40.681+00	2026-03-08 07:30:27.131+00	\N
32d58e8f-1116-4268-a763-bcdef7cc0ff7	NEIGHBOR_CONSENT_NEEDED	Neighbor Consent Needed	t	2026-03-07 23:05:40.682+00	2026-03-08 07:30:27.133+00	\N
fb46beea-3bb5-4741-aec3-f0e5daa877a7	FROZEN_GROUND_REQUIRED	Frozen Ground Required	t	2026-03-07 23:05:40.683+00	2026-03-08 07:30:27.134+00	\N
e9dd063e-1105-4041-bd24-e682f5d1c70c	WINTER_TIMING	Winter Timing	t	2026-03-07 23:05:40.685+00	2026-03-08 07:30:27.135+00	\N
6e033d82-3603-4505-9a99-c9ac3cb53cbd	UTILITY_COORDINATION	Utility Coordination	t	2026-03-07 23:05:40.686+00	2026-03-08 07:30:27.137+00	\N
175b5279-97fd-4f20-9dcc-61da424e2d47	WEATHER_DELAY	Weather Delay	t	2026-03-07 23:05:40.687+00	2026-03-08 07:30:27.139+00	\N
784a054c-f23b-40a8-9683-67bbb325d264	OTHER	Other	t	2026-03-07 23:05:40.688+00	2026-03-08 07:30:27.141+00	\N
\.


--
-- TOC entry 3843 (class 0 OID 66177)
-- Dependencies: 221
-- Data for Name: customer_risk_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_risk_reasons (id, customer_risk_id, risk_reason_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 3842 (class 0 OID 66168)
-- Dependencies: 220
-- Data for Name: customer_risks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_risks (id, customer_id, severity, narrative, status, owner_user_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3840 (class 0 OID 66149)
-- Dependencies: 218
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, email, created_at, updated_at, deleted_at) FROM stdin;
abae1162-c276-4a61-89f8-dd72d2902dda	Gally, Keith	\N	\N	2026-03-07 10:27:50.76+00	2026-03-07 10:27:50.76+00	\N
a7ed71f6-fb88-4bb0-83cf-599d69ad6259	Moran, Judy	\N	\N	2026-03-07 10:27:50.79+00	2026-03-07 10:27:50.79+00	\N
047de35c-6e24-425c-839f-87433af5eaf9	Storella, Barbara	\N	\N	2026-03-07 10:27:50.799+00	2026-03-07 10:27:50.799+00	\N
f23796f3-4f52-4b0d-bee9-1f041c7439d1	Andover Arborists	\N	\N	2026-03-07 10:27:50.815+00	2026-03-07 10:27:50.815+00	\N
14ebbd64-eceb-4d12-8679-a2ef8d36af76	Kirylo, Joe	\N	\N	2026-03-07 10:27:50.822+00	2026-03-07 10:27:50.822+00	\N
60928a59-3ce3-4fc9-99e6-6d6ce70d530e	Marciniak, Dylan	\N	\N	2026-03-07 10:27:50.844+00	2026-03-07 10:27:50.844+00	\N
a83a0e41-b6f1-4ab5-b287-866c5f972d9c	Weatherly Drive Condominium Trust	\N	\N	2026-03-07 10:27:50.85+00	2026-03-07 10:27:50.85+00	\N
43b4153b-6106-428f-a965-9d870e4fc65e	Miceli, Phil	\N	\N	2026-03-07 10:27:50.857+00	2026-03-07 10:27:50.857+00	\N
f57dac4e-7104-4e4c-8abe-ec9ab89d3ef8	Denny, Genna	\N	\N	2026-03-07 10:27:50.868+00	2026-03-07 10:27:50.868+00	\N
93e4799a-8d4e-47f9-b190-a5241b7bd33a	Green, Judy	\N	\N	2026-03-07 10:27:50.875+00	2026-03-07 10:27:50.875+00	\N
b424c7b2-fb5a-4437-8775-e4539463626a	McCarthy, Alice	\N	\N	2026-03-07 10:27:50.879+00	2026-03-07 10:27:50.879+00	\N
76a133d6-e7a5-41af-8f65-a0b9fc4d3409	Cunningham, Lee	\N	\N	2026-03-07 10:27:50.885+00	2026-03-07 10:27:50.885+00	\N
9e3955b6-4ae6-4712-b785-4d1d2474c095	Buckley, Paul	\N	\N	2026-03-07 10:27:50.904+00	2026-03-07 10:27:50.904+00	\N
3deab94c-b660-49f7-93cf-68bca325e940	Harrison, Julian	\N	\N	2026-03-07 10:27:50.911+00	2026-03-07 10:27:50.911+00	\N
7e843fc5-410e-4ca0-a5f1-1c0099ca6065	Bartlett's Reach Town House Community	\N	\N	2026-03-07 10:27:50.915+00	2026-03-07 10:27:50.915+00	\N
c2dc3cbf-d031-4590-9dae-eb4709c5f3d1	Shams, Nasser	\N	\N	2026-03-07 10:27:50.921+00	2026-03-07 10:27:50.921+00	\N
b7b2466f-54a3-4128-9a3a-ec04cdfde1c4	Lowe, Chris	\N	\N	2026-03-07 10:27:50.927+00	2026-03-07 10:27:50.927+00	\N
cea7168a-046f-4fcd-be7a-04900a005719	Miller, Lois	\N	\N	2026-03-07 10:27:50.933+00	2026-03-07 10:27:50.933+00	\N
47288e6e-45d4-4993-832c-9e4688d76113	Piazza, Sal	\N	\N	2026-03-07 10:27:50.939+00	2026-03-07 10:27:50.939+00	\N
3bfcb4cd-7ac4-4a15-bff9-6a6ecba8d58c	Moore, David	\N	\N	2026-03-07 10:27:50.946+00	2026-03-07 10:27:50.946+00	\N
465de2cd-3a02-4d42-8028-7cbdf5d88eaa	Mansfield, Jen	\N	\N	2026-03-07 10:27:50.952+00	2026-03-07 10:27:50.952+00	\N
6358e372-c503-4082-b7fa-c3ccefff6871	Garden In The Woods	\N	\N	2026-03-07 10:27:50.957+00	2026-03-07 10:27:50.957+00	\N
3a292d10-79cf-4ea8-9161-d640e2ad116a	Anderson, Rick	\N	\N	2026-03-07 10:27:50.961+00	2026-03-07 10:27:50.961+00	\N
b1f593cf-6ad0-4fb8-81d6-56f1d9670667	Aurora Property Management	\N	\N	2026-03-07 10:27:50.967+00	2026-03-07 10:27:50.967+00	\N
2810a043-7aa9-4eea-bf45-288c3c89bb8f	McCarthy, Tiffany	\N	\N	2026-03-07 10:27:50.971+00	2026-03-07 10:27:50.971+00	\N
987278b4-a7f7-46e4-8ec5-ca7e8447cfbe	Scotti, Sarah	\N	\N	2026-03-07 10:27:50.975+00	2026-03-07 10:27:50.975+00	\N
52b453b6-9266-4375-870b-88dc8aaa3eb9	Essler, Kathy	\N	\N	2026-03-07 10:27:50.978+00	2026-03-07 10:27:50.978+00	\N
e17d485c-d565-4592-828d-65b68e4e5618	Gemme, Eric	\N	\N	2026-03-07 10:27:50.983+00	2026-03-07 10:27:50.983+00	\N
fdecbe0e-16f5-4160-bae4-fcdf00640c7b	Lucas, Karen	\N	\N	2026-03-07 10:27:50.989+00	2026-03-07 10:27:50.989+00	\N
b1fceb64-126c-4c0f-83e5-b1a1099a71b9	Four Leaf Site Solutions	\N	\N	2026-03-07 10:27:50.993+00	2026-03-07 10:27:50.993+00	\N
80ec846d-c496-4747-9171-e97fa33abebf	Watson, Paul	\N	\N	2026-03-07 10:27:50.998+00	2026-03-07 10:27:50.998+00	\N
c063bac3-34f8-4bda-a3ac-10f9ed7a28d6	Gladstone, Brett	\N	\N	2026-03-07 10:27:51.003+00	2026-03-07 10:27:51.003+00	\N
026f25b1-ef1a-4edc-b91d-48ee4a6feefb	Burbank, Cindy	\N	\N	2026-03-07 10:27:51.007+00	2026-03-07 10:27:51.007+00	\N
218f97ce-95ea-453c-8d8e-516d3bfb6336	Ipswich Fish and Game	\N	\N	2026-03-07 10:27:51.012+00	2026-03-07 10:27:51.012+00	\N
9b886e71-48bc-4f68-ba24-09c4f0594a75	Beaton, Dan	\N	\N	2026-03-07 10:27:51.015+00	2026-03-07 10:27:51.015+00	\N
dd707c0e-ad6e-408c-ba04-ddfa9b08a697	SavaTree Lincoln	\N	\N	2026-03-07 10:27:51.019+00	2026-03-07 10:27:51.019+00	\N
f71de4ad-3597-4294-8c76-cf2dcbdf4a6b	Reichheld, James	\N	\N	2026-03-07 10:27:51.023+00	2026-03-07 10:27:51.023+00	\N
e2fbdce6-3337-4023-88d8-0612a3581835	Olmsted, James	\N	\N	2026-03-07 10:27:51.028+00	2026-03-07 10:27:51.028+00	\N
7bc7b252-2d5d-45ab-a1d2-6d98baecb50d	DDS/Metro Residential Services	\N	\N	2026-03-07 10:27:51.036+00	2026-03-07 10:27:51.036+00	\N
9c0dbcb0-f88e-4916-bf49-08e06db1067e	Roberts, Emily	\N	\N	2026-03-07 10:27:51.044+00	2026-03-07 10:27:51.044+00	\N
a58615ab-5af1-4302-9dae-fdfe903888c0	Fordyce, Jim	\N	\N	2026-03-07 10:27:51.052+00	2026-03-07 10:27:51.052+00	\N
e27e04c6-aa48-4943-b75c-131711c447ee	Fitzgerald, Neil	\N	\N	2026-03-07 10:27:51.059+00	2026-03-07 10:27:51.059+00	\N
3db1baa1-ea11-4523-981c-2a498a9c73a1	Lin, Edica	\N	\N	2026-03-07 10:27:51.067+00	2026-03-07 10:27:51.067+00	\N
94b28cb0-9ef2-4959-a6a5-34f262ffb420	Sondhi, Chandra	\N	\N	2026-03-07 10:27:51.086+00	2026-03-07 10:27:51.086+00	\N
60a14175-b5dc-485b-96f7-27567075a741	Doherty, John	\N	\N	2026-03-07 10:27:51.093+00	2026-03-07 10:27:51.093+00	\N
2d318651-d2e4-4d68-b231-18d0c742d601	Reines, Eric	\N	\N	2026-03-07 10:27:51.098+00	2026-03-07 10:27:51.098+00	\N
2da16779-6f44-44bf-8d25-ce7c9d33fbda	Stohr, Thomas	\N	\N	2026-03-07 10:27:51.106+00	2026-03-07 10:27:51.106+00	\N
633dbacd-89e4-4a7c-8758-d0875e221507	Gaudette, Leonard	\N	\N	2026-03-07 10:27:51.11+00	2026-03-07 10:27:51.11+00	\N
deb0cf1e-ab2c-4453-b826-d1c4594e6136	Britt, Erin	\N	\N	2026-03-07 10:27:51.115+00	2026-03-07 10:27:51.115+00	\N
02ab56b2-d9a3-4fd9-bade-18d6c5b4ef1d	Lewis, Kristin	\N	\N	2026-03-07 10:27:51.119+00	2026-03-07 10:27:51.119+00	\N
15f4147e-a4fd-4f5c-b2ab-f6f643c9f276	Village Estates Condominium	\N	\N	2026-03-07 10:27:51.124+00	2026-03-07 10:27:51.124+00	\N
d2a95312-f96d-4316-b321-cd1fe3ca89b7	Latshaw, Michael	\N	\N	2026-03-07 10:27:51.128+00	2026-03-07 10:27:51.128+00	\N
1ed17530-f5d0-4dd5-807a-916669e957b7	Dolan, Eric	\N	\N	2026-03-07 10:27:51.133+00	2026-03-07 10:27:51.133+00	\N
d1d7929f-560a-42e5-bc43-211e7cce4933	Glassett, Tom	\N	\N	2026-03-07 10:27:51.136+00	2026-03-07 10:27:51.136+00	\N
87dea936-62a3-48a4-951c-ca1446c2aacb	Perlman, Marc and Laura	\N	\N	2026-03-07 10:27:51.139+00	2026-03-07 10:27:51.139+00	\N
1bc2810d-ba06-49c8-968e-acd113756402	Litschers, Adrian	\N	\N	2026-03-07 10:27:51.142+00	2026-03-07 10:27:51.142+00	\N
00f17768-033e-400f-bad6-e0eef8e4d37e	Neubauer, Cynthia	\N	\N	2026-03-07 10:27:51.146+00	2026-03-07 10:27:51.146+00	\N
6d941f58-345c-42b8-addf-1d30dbcf7302	Squires , Susan	\N	\N	2026-03-07 10:27:51.15+00	2026-03-07 10:27:51.15+00	\N
4d007eaf-bf3d-452d-b81a-657d86fdefa6	Fitzsimmons, Paula	\N	\N	2026-03-07 10:27:51.155+00	2026-03-07 10:27:51.155+00	\N
42b5e810-21ea-4ccb-b42f-9ce3a8254e64	Goldberg, Carol Ann	\N	\N	2026-03-07 10:27:51.159+00	2026-03-07 10:27:51.159+00	\N
057bac3f-da29-4de6-89d9-1477d44386d3	Harbor View Condo Association	\N	\N	2026-03-06 17:59:50.347+00	2026-03-06 17:59:50.347+00	\N
61ace6eb-a2ab-46bf-9d83-39fc149a15e1	Essex Street Properties	\N	\N	2026-03-06 17:59:50.353+00	2026-03-06 17:59:50.353+00	\N
b1b32aef-8026-4677-8647-18d9f0be49e4	Lighthouse Estates HOA	\N	\N	2026-03-06 17:59:50.356+00	2026-03-06 17:59:50.356+00	\N
830a446e-8a05-478f-ae3d-2319e2486e32	Maple Hill Residence	\N	\N	2026-03-06 17:59:50.359+00	2026-03-06 17:59:50.359+00	\N
a36d14c4-87a0-4142-bc80-b30cd77097da	Oak Lane Residence	\N	\N	2026-03-06 17:59:50.362+00	2026-03-06 17:59:50.362+00	\N
40760f31-c3ca-4014-bcde-4a6464815320	Pine Meadow Farm	\N	\N	2026-03-06 17:59:50.369+00	2026-03-06 17:59:50.369+00	\N
e45c8fbe-3a60-4215-aa42-49521ad69690	Green Street Commons	\N	\N	2026-03-06 17:59:50.372+00	2026-03-06 17:59:50.372+00	\N
fa86f28f-aa52-466e-bec5-187ff97d7378	Lexington Woodlands LLC	\N	\N	2026-03-06 17:59:50.375+00	2026-03-06 17:59:50.375+00	\N
3b9d79b3-ba2c-4c76-bb98-1cb46f819c02	South Main Property Group	\N	\N	2026-03-06 17:59:50.378+00	2026-03-06 17:59:50.378+00	\N
c49d0d5d-d272-4d43-adb0-3a4bf3998cee	Cedar Knoll Estates	\N	\N	2026-03-06 17:59:50.382+00	2026-03-06 17:59:50.382+00	\N
56b69d3a-40d6-47ea-89be-3065ed84517c	Willow Creek Apartments	\N	\N	2026-03-06 17:59:50.385+00	2026-03-06 17:59:50.385+00	\N
67e39435-c6d3-4662-9c26-0f5f099099a4	Old Town Real Estate Trust	\N	\N	2026-03-06 17:59:50.388+00	2026-03-06 17:59:50.388+00	\N
df7875ec-2514-4ebf-baaf-81a8c5ef7ff4	Stone, Danny	\N	\N	2026-03-07 10:27:51.162+00	2026-03-07 10:27:51.162+00	\N
62477504-20ae-4739-a300-eba0c3af20a6	Bailey, Patricia	\N	\N	2026-03-07 10:27:51.167+00	2026-03-07 10:27:51.167+00	\N
dcb4c11f-f441-4f39-bcd9-3b832ffd7e03	Ciancarelli, Sean	\N	\N	2026-03-07 10:27:51.171+00	2026-03-07 10:27:51.171+00	\N
e112935c-6cc1-42f2-bee9-68e3bc2a8147	Solari, George	\N	\N	2026-03-07 10:27:51.176+00	2026-03-07 10:27:51.176+00	\N
25520b87-8f89-4104-92c8-7e08e1a0354e	Wood, Kellie	\N	\N	2026-03-07 10:27:51.179+00	2026-03-07 10:27:51.179+00	\N
94c368db-8499-4301-bf0a-a22c098ed4bc	Boyle, John	\N	\N	2026-03-07 10:27:51.184+00	2026-03-07 10:27:51.184+00	\N
fbac1f37-28f0-4077-b694-71f5f8692267	Sault, Matthew	\N	\N	2026-03-07 10:27:51.187+00	2026-03-07 10:27:51.187+00	\N
8d58a5d5-6c75-4c10-a709-34040641f926	Tsoukalas, Scott	\N	\N	2026-03-07 10:27:51.191+00	2026-03-07 10:27:51.191+00	\N
cf85fb11-db25-47b4-84bf-eb7db8d7dcf9	Seavey, Paul	\N	\N	2026-03-07 10:27:51.195+00	2026-03-07 10:27:51.195+00	\N
cf858e73-f80d-4d0a-ae23-014324a58afa	Holland, Debra	\N	\N	2026-03-07 10:27:51.2+00	2026-03-07 10:27:51.2+00	\N
9f2963b4-f729-4a1f-9722-5083af1b0db4	Hennessey, James	\N	\N	2026-03-07 10:27:51.205+00	2026-03-07 10:27:51.205+00	\N
b675ee5d-63a6-44ef-bfaa-20180bfb8357	Hogan, Ned	\N	\N	2026-03-07 10:27:51.211+00	2026-03-07 10:27:51.211+00	\N
52427901-db9b-4d3c-95ba-ccf08a109fe0	Ricci, Adam	\N	\N	2026-03-07 10:27:51.217+00	2026-03-07 10:27:51.217+00	\N
4059ab88-20dd-4aee-a337-d94748c69058	Woolston, Crispin	\N	\N	2026-03-07 10:27:51.222+00	2026-03-07 10:27:51.222+00	\N
39d243a6-43fa-4106-a716-e18257b00ef8	Ready, Jim	\N	\N	2026-03-07 10:27:51.226+00	2026-03-07 10:27:51.226+00	\N
a284c980-2d27-45f8-9e0e-9f8d92943034	Hurley, Jesse	\N	\N	2026-03-07 10:27:51.23+00	2026-03-07 10:27:51.23+00	\N
adcfb57a-be5e-4f1e-b1ba-888781575caf	Marshall, Lynn	\N	\N	2026-03-07 10:27:51.234+00	2026-03-07 10:27:51.234+00	\N
d58c08ed-4a55-4ea7-8944-0abb17a0d24c	Allen, Natalie	\N	\N	2026-03-07 10:27:51.238+00	2026-03-07 10:27:51.238+00	\N
a17c94e5-f779-43a8-b387-33f827468abd	Clements, Martyn	\N	\N	2026-03-07 10:27:51.241+00	2026-03-07 10:27:51.241+00	\N
c880dcc2-ae50-4782-a5a0-493ca80273b3	T. Silveria	\N	\N	2026-03-07 10:27:51.249+00	2026-03-07 10:27:51.249+00	\N
2dfd9b4c-e5e9-4a6c-a9c3-34ec44555f66	O'Connell, Michael	\N	\N	2026-03-07 10:27:51.253+00	2026-03-07 10:27:51.253+00	\N
c801cc82-87bc-4c07-9da2-75ed6d72def9	Jolliffe, Robin	\N	\N	2026-03-07 10:27:51.257+00	2026-03-07 10:27:51.257+00	\N
9bf2e645-97dc-4ebc-aa3d-3f1181660363	Larson, Chris	\N	\N	2026-03-07 10:27:51.263+00	2026-03-07 10:27:51.263+00	\N
f9bb50f6-57a8-4af2-9a31-32c758b3b1ad	Vose, Julia	\N	\N	2026-03-07 10:27:51.272+00	2026-03-07 10:27:51.272+00	\N
5906bd03-c575-4217-9a4f-72cf8bc774da	Downer Brothers Landscaping	\N	\N	2026-03-07 10:27:51.276+00	2026-03-07 10:27:51.276+00	\N
86dcc3c6-fc72-4272-bc10-987c0737d7d9	Votze, Paul	\N	\N	2026-03-07 10:27:51.283+00	2026-03-07 10:27:51.283+00	\N
64ee6c97-1f6f-49bd-8946-99cf63e5d1ba	Gorczyca, Karen	\N	\N	2026-03-07 10:27:51.287+00	2026-03-07 10:27:51.287+00	\N
7906de09-3b50-4634-98c9-772d538e7dcc	All Pro Snow Company	\N	\N	2026-03-07 10:27:51.291+00	2026-03-07 10:27:51.291+00	\N
fde11dec-b829-49d0-94d1-1f6cc0c3a207	Gatcombe, Danelle	\N	\N	2026-03-07 10:27:51.295+00	2026-03-07 10:27:51.295+00	\N
66d24f2c-9986-40b6-aa4b-77d9e379d8a5	Pritchard, Dave	\N	\N	2026-03-07 10:27:51.299+00	2026-03-07 10:27:51.299+00	\N
7211e8fc-1e90-48df-bd8e-248e6cf22642	Jutras, Robert	\N	\N	2026-03-07 10:27:51.302+00	2026-03-07 10:27:51.302+00	\N
e0089ba2-a4b8-4f88-8116-b2ea3e9d6f4a	MRS Property Management	\N	\N	2026-03-07 10:27:51.306+00	2026-03-07 10:27:51.306+00	\N
03885929-3978-4d41-82e1-3d4f9ae37ce8	Marr, Mike	\N	\N	2026-03-07 10:27:51.316+00	2026-03-07 10:27:51.316+00	\N
1f413835-5f36-467d-a94d-457f2b6314aa	Preston, Lynne	\N	\N	2026-03-07 10:27:51.32+00	2026-03-07 10:27:51.32+00	\N
bd6a4e49-4f46-4623-9ff5-13c1d9c12179	Windhill Builders LLC	\N	\N	2026-03-07 10:27:51.324+00	2026-03-07 10:27:51.324+00	\N
538f0595-c2ec-494f-bf3c-b3ca4f080c2e	The Edge Water House	\N	\N	2026-03-07 10:27:51.329+00	2026-03-07 10:27:51.329+00	\N
a33cb71f-7ab0-46e4-866f-1fab799ddf11	Healey, Dan	\N	\N	2026-03-07 10:27:51.332+00	2026-03-07 10:27:51.332+00	\N
8e734ad2-83be-4923-ae57-33a6e8f19fb6	SCHWARTZ, DAVID	\N	\N	2026-03-07 10:27:51.335+00	2026-03-07 10:27:51.335+00	\N
90bceb13-cc2d-416c-945c-5c79868ab1cb	Tallasken, Danielle	\N	\N	2026-03-07 10:27:51.338+00	2026-03-07 10:27:51.338+00	\N
f50d59a8-b930-4350-9957-c50827405210	Edwards, Marlys	\N	\N	2026-03-07 10:27:51.341+00	2026-03-07 10:27:51.341+00	\N
23c4b93e-9be3-42ea-a355-6c9ac353515e	MRS Propery Management	\N	\N	2026-03-07 10:27:51.344+00	2026-03-07 10:27:51.344+00	\N
5500803e-2999-41de-8138-4b8182bcca60	Wenham Country Club	\N	\N	2026-03-07 10:27:51.349+00	2026-03-07 10:27:51.349+00	\N
0dbba991-83a9-427f-95ff-3e28700b05ac	ECP	\N	\N	2026-03-07 10:27:51.351+00	2026-03-07 10:27:51.351+00	\N
081f498a-98cb-4939-8eee-084ea051d194	Pine Acres Camp	\N	\N	2026-03-07 10:27:51.354+00	2026-03-07 10:27:51.354+00	\N
e71fcd29-4ae1-48ba-8fde-b0aa5d6257d0	Tuxbury Campground	\N	\N	2026-03-07 10:27:51.357+00	2026-03-07 10:27:51.357+00	\N
da71033b-bbeb-464d-915b-4391052db512	Sandy Beach Campground	\N	\N	2026-03-07 10:27:51.36+00	2026-03-07 10:27:51.36+00	\N
30ccc871-c427-4a2b-bf15-bd7ab26c63a4	Pikcilingus, Sarah	\N	\N	2026-03-07 10:27:51.362+00	2026-03-07 10:27:51.362+00	\N
a9d2606d-2255-4aa6-a8ff-763d0aa4ef98	Gartaganis, Marinos	\N	\N	2026-03-07 10:27:51.366+00	2026-03-07 10:27:51.366+00	\N
0f2836d6-2046-4a32-bc5c-8a37fd8bee13	Meyers, Nate	\N	\N	2026-03-07 10:27:51.37+00	2026-03-07 10:27:51.37+00	\N
8a6ef8dd-aba1-4028-a205-d57feb3c161e	Wacker, Laura	\N	\N	2026-03-07 10:27:51.374+00	2026-03-07 10:27:51.374+00	\N
62168ad9-d6ac-407d-9b21-23100a291705	Hinton, Steve	\N	\N	2026-03-07 10:27:51.378+00	2026-03-07 10:27:51.378+00	\N
668d80f2-76f0-409a-a2ff-6b627c2073dc	Tepermeister, Igor	\N	\N	2026-03-07 10:27:51.383+00	2026-03-07 10:27:51.383+00	\N
ba2163d6-298e-41e4-845f-4540a37d776f	Ng, Norman	\N	\N	2026-03-07 10:27:51.395+00	2026-03-07 10:27:51.395+00	\N
0c6d171a-8e72-49b9-b22b-7e1d0bd17873	Lopez, Raul	\N	\N	2026-03-07 10:27:51.399+00	2026-03-07 10:27:51.399+00	\N
98bcfbae-e37d-4a72-8816-5086db757f04	Solomon, Darin	\N	\N	2026-03-07 10:27:51.405+00	2026-03-07 10:27:51.405+00	\N
442c9996-775e-493d-b703-d95942b458ce	Frisiello, Bob	\N	\N	2026-03-07 10:27:51.408+00	2026-03-07 10:27:51.408+00	\N
58f12f00-431f-447f-b6e9-001f7b37e53b	Aria, Charles	\N	\N	2026-03-07 10:27:51.413+00	2026-03-07 10:27:51.413+00	\N
b2c4e818-e419-4427-a744-ab1489e569e8	Sano, Jeff	\N	\N	2026-03-07 10:27:51.417+00	2026-03-07 10:27:51.417+00	\N
ecd173ce-3efc-43d2-bb24-3360a7d4d82c	Tedesco Country Club	\N	\N	2026-03-07 10:27:51.422+00	2026-03-07 10:27:51.422+00	\N
f50a32ef-4022-41bb-abbc-0595c73b7e4e	Goddard, Mary	\N	\N	2026-03-07 10:27:51.426+00	2026-03-07 10:27:51.426+00	\N
1e57282a-0a7b-418f-8d33-71666b128ae3	Smith, Cindy	\N	\N	2026-03-07 10:27:51.43+00	2026-03-07 10:27:51.43+00	\N
81feedf0-cb57-45fd-998f-8407512da6ed	Gagne, Brant	\N	\N	2026-03-07 10:27:51.434+00	2026-03-07 10:27:51.434+00	\N
2d7565f4-9215-401a-8330-373fa2d3ba61	Mitchell, Jim	\N	\N	2026-03-07 10:27:51.44+00	2026-03-07 10:27:51.44+00	\N
53a0051d-e1a4-4b26-acc8-add46c4134f7	Friend, Chris	\N	\N	2026-03-07 10:27:51.445+00	2026-03-07 10:27:51.445+00	\N
bed1d51d-1c0b-42cc-b371-7a8c6812371f	Yannone, John	\N	\N	2026-03-07 10:27:51.449+00	2026-03-07 10:27:51.449+00	\N
953510bd-d294-40fd-b3d0-3661045341b4	Haviland, Paul	\N	\N	2026-03-07 10:27:51.453+00	2026-03-07 10:27:51.453+00	\N
a9dfb6a3-7a74-4c89-8377-74edb54a326b	Lasdin, Rich	\N	\N	2026-03-07 10:27:51.456+00	2026-03-07 10:27:51.456+00	\N
93033a76-050d-4257-9bb4-e854cf1c7434	TSD	\N	\N	2026-03-07 10:27:51.464+00	2026-03-07 10:27:51.464+00	\N
7d344027-8d7c-41f7-bf8e-92773d839ecb	Walke, Bernie	\N	\N	2026-03-07 10:27:51.469+00	2026-03-07 10:27:51.469+00	\N
5c4ed46e-ceea-4caa-942e-5200f4a52795	Nataupsky, Adam	\N	\N	2026-03-07 10:27:51.475+00	2026-03-07 10:27:51.475+00	\N
c5a5bc74-2f41-492f-ae4e-e127bcdfdee7	Boyd, Walter	\N	\N	2026-03-07 10:27:51.481+00	2026-03-07 10:27:51.481+00	\N
9408eaf5-128a-4226-8fa9-464f162866a9	Leone, Ben	\N	\N	2026-03-07 10:27:51.485+00	2026-03-07 10:27:51.485+00	\N
1c9fc170-112b-46bd-ac07-38594d2a76e5	Zimbelman, Adrian	\N	\N	2026-03-07 10:27:51.49+00	2026-03-07 10:27:51.49+00	\N
e94c33fe-f565-45bb-a3ef-176324c268fb	Zumbado, Ellen	\N	\N	2026-03-07 10:27:51.494+00	2026-03-07 10:27:51.494+00	\N
316cf47a-4341-41e9-8b1c-6a9979845f8e	Lawler, Sami	\N	\N	2026-03-07 10:27:51.498+00	2026-03-07 10:27:51.498+00	\N
84245de4-03ab-4fcf-99f4-9554bab105f7	Mcalister, Diane	\N	\N	2026-03-07 10:27:51.501+00	2026-03-07 10:27:51.501+00	\N
fe871253-09a7-44a0-9afb-60001ba9d559	Bouley, Sally	\N	\N	2026-03-07 10:27:51.506+00	2026-03-07 10:27:51.506+00	\N
1a75b6d3-77d6-496a-babb-7feea1278688	Nemergut, Kara	\N	\N	2026-03-07 10:27:51.509+00	2026-03-07 10:27:51.509+00	\N
8c442bf1-eb55-4208-8660-1edccd6c5e41	Warzecha, Kyle	\N	\N	2026-03-07 10:27:51.513+00	2026-03-07 10:27:51.513+00	\N
afe17784-59e4-4df0-bfb4-8bb5769e9de5	Driscoll, Fred	\N	\N	2026-03-07 10:27:51.517+00	2026-03-07 10:27:51.517+00	\N
6392b6df-8951-4d81-b99e-25a7ada18e14	Jones, Jeff	\N	\N	2026-03-07 10:27:51.521+00	2026-03-07 10:27:51.521+00	\N
d0a0ccf4-8cf9-42e7-9035-746b805e7c2a	Rizzo, John	\N	\N	2026-03-07 10:27:51.525+00	2026-03-07 10:27:51.525+00	\N
0589af73-a939-44ad-8705-6813cd138346	McKinney, Marie	\N	\N	2026-03-07 10:27:51.53+00	2026-03-07 10:27:51.53+00	\N
84f7f35c-90df-4bfa-8899-bc863236e24e	Driscoll, John	\N	\N	2026-03-07 10:27:51.534+00	2026-03-07 10:27:51.534+00	\N
cd343daf-71d8-44a8-9554-83cc02de4f84	Murphy, Chris	\N	\N	2026-03-07 10:27:51.538+00	2026-03-07 10:27:51.538+00	\N
a9c9d1d0-d1e2-451d-ae8b-a08d61867ffe	Murphy, Jerome	\N	\N	2026-03-07 10:27:51.543+00	2026-03-07 10:27:51.543+00	\N
89083bf4-10db-422e-98b6-0c4d20775c7a	Brady, William	\N	\N	2026-03-07 10:27:51.547+00	2026-03-07 10:27:51.547+00	\N
f439a1d3-972f-439d-935a-5d2c6f622149	Bartlett, Jenn	\N	\N	2026-03-07 10:27:51.551+00	2026-03-07 10:27:51.551+00	\N
1de5c0b9-19e0-43ee-8ddc-518c301a13e9	Duncan, Lynn	\N	\N	2026-03-07 10:27:51.557+00	2026-03-07 10:27:51.557+00	\N
583a47a0-d1d9-4490-9d51-cc7cf01b0ff8	Mawn, Barry	\N	\N	2026-03-07 10:27:51.56+00	2026-03-07 10:27:51.56+00	\N
03c50c02-029a-4fe3-9884-336e3ef5b4f7	Holway, Dan	\N	\N	2026-03-07 10:27:51.564+00	2026-03-07 10:27:51.564+00	\N
9bc206d0-f1e9-40e6-8a3c-0c943dfcec4e	Guleksen, Eric	\N	\N	2026-03-07 10:27:51.568+00	2026-03-07 10:27:51.568+00	\N
d91268e3-01d1-4e8f-86a8-baa79371804d	McCormack, Shawn	\N	\N	2026-03-07 10:27:51.572+00	2026-03-07 10:27:51.572+00	\N
e8419fd5-4345-44fa-8bee-6f7bfbee8096	Holland, Camden	\N	\N	2026-03-07 10:27:51.578+00	2026-03-07 10:27:51.578+00	\N
a02ac884-c430-4dc3-98e6-15df4b8d5b34	Navarro, Alex	\N	\N	2026-03-07 10:27:51.583+00	2026-03-07 10:27:51.583+00	\N
538ba4c2-7a13-40b8-9d73-19c3efe16cc7	Backry, Frank	\N	\N	2026-03-07 10:27:51.589+00	2026-03-07 10:27:51.589+00	\N
813c68a8-ec1e-448a-8da4-ee8af817fc6b	Kitov, Mike	\N	\N	2026-03-07 10:27:51.594+00	2026-03-07 10:27:51.594+00	\N
1b1dd09e-e1c2-4532-98b8-c48e88873be6	Dawes, Candice	\N	\N	2026-03-07 10:27:51.599+00	2026-03-07 10:27:51.599+00	\N
412c2dae-c39c-4a20-923a-dcd132c9f946	Landscape Planners	\N	\N	2026-03-07 10:27:51.606+00	2026-03-07 10:27:51.606+00	\N
4dbb6f90-d148-4718-b4fe-d176401e3d4c	Skalabrin, Mark	\N	\N	2026-03-07 10:27:51.611+00	2026-03-07 10:27:51.611+00	\N
93ed8a45-584a-47f6-be85-728070aa6347	Hammerle, Daniel	\N	\N	2026-03-07 10:27:51.615+00	2026-03-07 10:27:51.615+00	\N
7f95e0ed-dd76-4ce6-aff7-e0bd3a31a12c	Dentremont, Paul	\N	\N	2026-03-07 10:27:51.622+00	2026-03-07 10:27:51.622+00	\N
eaf6c2b5-63cd-425e-bd50-b00eeac63af9	Eaton, Bruce	\N	\N	2026-03-07 10:27:51.627+00	2026-03-07 10:27:51.627+00	\N
6c3ae586-e6ab-4210-a1b0-3ccfb6fd3ee9	Mongeau, Peter	\N	\N	2026-03-07 10:27:51.63+00	2026-03-07 10:27:51.63+00	\N
df57c944-22c9-4a42-b25f-ab39617b1d8b	Olsson, Nacy	\N	\N	2026-03-07 10:27:51.635+00	2026-03-07 10:27:51.635+00	\N
9adbaae2-99b5-4c61-b524-4f4f18956cc0	Efstratios, Chad	\N	\N	2026-03-07 10:27:51.641+00	2026-03-07 10:27:51.641+00	\N
318873f4-6907-41c5-a879-2616a1ec1da0	Morse, Jeff	\N	\N	2026-03-07 10:27:51.645+00	2026-03-07 10:27:51.645+00	\N
dcd3008e-1086-4910-b2eb-69cad5be7bef	Boyle, Whitney	\N	\N	2026-03-07 10:27:51.649+00	2026-03-07 10:27:51.649+00	\N
36bc7b02-a484-4a6d-a528-5376320f8d06	Wheeler, Mike	\N	\N	2026-03-07 10:27:51.653+00	2026-03-07 10:27:51.653+00	\N
36d4ff1b-b925-42a9-a3d2-c5a30efa01a7	Coughlin, Mike	\N	\N	2026-03-07 10:27:51.657+00	2026-03-07 10:27:51.657+00	\N
aaf74dc2-0133-45f3-9e2c-1b972cbe1f80	Ergott, Matthew	\N	\N	2026-03-07 10:27:51.661+00	2026-03-07 10:27:51.661+00	\N
df804402-c030-4a3c-a6d9-331ac345b0d5	Conant, Keith	\N	\N	2026-03-07 10:27:51.665+00	2026-03-07 10:27:51.665+00	\N
d265993c-c81f-4783-8799-ee5a1fa0eaf6	East Coast Comfort	\N	\N	2026-03-07 10:27:51.669+00	2026-03-07 10:27:51.669+00	\N
6ee1611c-9e21-4657-b015-7471ae2da04d	Sheehan, John	\N	\N	2026-03-07 10:27:51.672+00	2026-03-07 10:27:51.672+00	\N
e75cdab1-128f-41b5-a1b6-f9231fcb978e	O'Shea, Tara	\N	\N	2026-03-07 10:27:51.676+00	2026-03-07 10:27:51.676+00	\N
e20a4438-8fc1-469a-963a-55bcad45d4fb	Jameson, John	\N	\N	2026-03-07 10:27:51.68+00	2026-03-07 10:27:51.68+00	\N
eba5b25d-2485-4313-9b48-eb8367b715a7	McBride, Bridget	\N	\N	2026-03-07 10:27:51.684+00	2026-03-07 10:27:51.684+00	\N
66cdd60c-715b-4769-a7ee-453968ad4341	Mazzaglia, Evan	\N	\N	2026-03-07 10:27:51.688+00	2026-03-07 10:27:51.688+00	\N
cbdf8094-8dbd-4a83-bdc2-20c6c2c9fc18	Cerundolo, Laura	\N	\N	2026-03-07 10:27:51.692+00	2026-03-07 10:27:51.692+00	\N
1895aa69-dba4-4615-8cde-f7d2149934f2	Wong, Sam	\N	\N	2026-03-07 10:27:51.697+00	2026-03-07 10:27:51.697+00	\N
5019607d-f846-420b-8c8a-a28cf3b0659d	Sloane, Bob	\N	\N	2026-03-07 10:27:51.701+00	2026-03-07 10:27:51.701+00	\N
892c20a3-628c-4c9a-9135-787ed960de77	Wilk, John	\N	\N	2026-03-07 10:27:51.705+00	2026-03-07 10:27:51.705+00	\N
e1c63a30-72c1-4da5-9d06-7f456b68bb2d	Personal Touch Land	\N	\N	2026-03-07 10:27:51.709+00	2026-03-07 10:27:51.709+00	\N
f8f86f75-b0cc-4321-b102-afaa7af11178	Barresi, Kelly	\N	\N	2026-03-07 10:27:51.714+00	2026-03-07 10:27:51.714+00	\N
6034f38e-539a-4b07-aac0-d98447efcc4f	Kokos, Casey	\N	\N	2026-03-07 10:27:51.717+00	2026-03-07 10:27:51.717+00	\N
7bb5e199-b70f-44b3-a371-e660899ccd83	Landscape By The Sea	\N	\N	2026-03-07 10:27:51.722+00	2026-03-07 10:27:51.722+00	\N
1845a67e-1af6-480a-9edc-338211e8b39e	Davis, Gisella	\N	\N	2026-03-07 10:27:51.726+00	2026-03-07 10:27:51.726+00	\N
a5c6299a-b36a-493a-b136-ea08dc0fdcd7	Latty, Bonnie	\N	\N	2026-03-07 10:27:51.73+00	2026-03-07 10:27:51.73+00	\N
0685866f-6734-4e9d-b6ec-cd45100ca519	Jamieson, John	\N	\N	2026-03-07 10:27:51.734+00	2026-03-07 10:27:51.734+00	\N
fbc6b8cc-3810-4a28-848b-602c6092c45e	Doherty, Ian	\N	\N	2026-03-07 10:27:51.737+00	2026-03-07 10:27:51.737+00	\N
ffe44738-2dfd-4efe-b018-545f501609ad	Roy, Briana	\N	\N	2026-03-07 10:27:51.744+00	2026-03-07 10:27:51.744+00	\N
a43d9c2a-9334-42ca-9c98-b0487ab052ba	Felteau, Hannah	\N	\N	2026-03-07 10:27:51.749+00	2026-03-07 10:27:51.749+00	\N
1a459379-b806-44a7-8a1c-a561f73aeaf5	Donovan, Jay	\N	\N	2026-03-07 10:27:51.753+00	2026-03-07 10:27:51.753+00	\N
938a7b57-8888-4cdf-9eab-d49770251b44	Frontier Landscaping	\N	\N	2026-03-07 10:27:51.757+00	2026-03-07 10:27:51.757+00	\N
511938d0-de59-45e8-a48c-3058f0109427	Corliss Landscaping	\N	\N	2026-03-07 10:27:51.763+00	2026-03-07 10:27:51.763+00	\N
ec13a62f-51ed-4116-b604-700cc74b4e31	Fennell Construction	\N	\N	2026-03-07 10:27:51.766+00	2026-03-07 10:27:51.766+00	\N
f0bae4e8-68bb-4ef2-9002-e53c7dac3c10	Browning, Steve	\N	\N	2026-03-07 10:27:51.77+00	2026-03-07 10:27:51.77+00	\N
f1149265-528f-4666-b48b-d94a4404712f	Webb, Ben	\N	\N	2026-03-07 10:27:51.775+00	2026-03-07 10:27:51.775+00	\N
4b9e81db-3e88-4844-bbd5-f8e37aaa9509	Barclay, Phil	\N	\N	2026-03-07 10:27:51.783+00	2026-03-07 10:27:51.783+00	\N
ab86b846-7027-4983-9316-36cc664c6ff3	GenStar Property	\N	\N	2026-03-07 10:27:51.787+00	2026-03-07 10:27:51.787+00	\N
00e805d3-21ac-49cc-aa17-bfcb66ad028a	Weatherall, Laura	\N	\N	2026-03-07 10:27:51.792+00	2026-03-07 10:27:51.792+00	\N
b99b7780-f0e2-4091-9c57-197e76732f24	Tackeff, Roger	\N	\N	2026-03-07 10:27:51.797+00	2026-03-07 10:27:51.797+00	\N
b8016c88-4c58-4793-b192-b6277c9571cb	Billington, Jennifer	\N	\N	2026-03-07 10:27:51.803+00	2026-03-07 10:27:51.803+00	\N
9bea5c60-604a-4198-b52d-3421ca553bb0	Candland, Christopher	\N	\N	2026-03-07 10:27:51.81+00	2026-03-07 10:27:51.81+00	\N
4f23c8a1-53b2-4689-9154-b0bd2d95c06f	McCarthy, John	\N	\N	2026-03-07 10:27:51.813+00	2026-03-07 10:27:51.813+00	\N
9d1f9a4f-c382-4dc5-ba39-0b24301cc197	Stone, Matthew T	\N	\N	2026-03-07 10:27:51.818+00	2026-03-07 10:27:51.818+00	\N
3a12e641-411e-4bd9-af81-c4528e9e470b	Sodder, Arnold	\N	\N	2026-03-07 10:27:51.822+00	2026-03-07 10:27:51.822+00	\N
8a4c39ef-218f-4140-be7c-4ebd51fe7229	Kennedy, Steve	\N	\N	2026-03-07 10:27:51.828+00	2026-03-07 10:27:51.828+00	\N
f67b053a-4b08-4ea0-b86e-701906aebb92	Medugno, Donna	\N	\N	2026-03-07 10:27:51.832+00	2026-03-07 10:27:51.832+00	\N
428ba494-e8c5-4997-bc37-8a0733bcc778	Jones, Richard	\N	\N	2026-03-07 10:27:51.837+00	2026-03-07 10:27:51.837+00	\N
b346ee7d-15bc-4da0-bc2a-4fcdc582b034	Lerose, Dan	\N	\N	2026-03-07 10:27:51.842+00	2026-03-07 10:27:51.842+00	\N
8364a7d3-e5ab-4f23-a808-e40ed41ed4e3	Permut, Susan	\N	\N	2026-03-07 10:27:51.845+00	2026-03-07 10:27:51.845+00	\N
74922113-0f05-42e8-a22e-163a043186b4	Chanda, Jyotirmay	\N	\N	2026-03-07 10:27:51.849+00	2026-03-07 10:27:51.849+00	\N
6b87d053-19a3-4ac7-b89f-9abb438d4f26	Stutius, Nancy	\N	\N	2026-03-07 10:27:51.855+00	2026-03-07 10:27:51.855+00	\N
d83e93c8-4a19-4cb0-b91b-e0bfbad6bd1d	Gilberti, Jayson	\N	\N	2026-03-07 10:27:51.86+00	2026-03-07 10:27:51.86+00	\N
37bb5d40-dba3-437c-b650-50aac1da353d	Hirzel, Alan	\N	\N	2026-03-07 10:27:51.865+00	2026-03-07 10:27:51.865+00	\N
2ab61b88-26d4-4591-9262-4fc9040f55e4	Carlson, Jack	\N	\N	2026-03-07 10:27:51.869+00	2026-03-07 10:27:51.869+00	\N
47fd116b-94a7-49f1-abf7-56a262223239	Keydel, Jim	\N	\N	2026-03-07 10:27:51.874+00	2026-03-07 10:27:51.874+00	\N
8f1e0d29-a244-47d0-af6e-e97ae8776ecb	Bannister, Nicholas	\N	\N	2026-03-07 10:27:51.887+00	2026-03-07 10:27:51.887+00	\N
bac91d83-1888-4559-95cc-9dedc2f23578	Smith, Nicole	\N	\N	2026-03-07 10:27:51.891+00	2026-03-07 10:27:51.891+00	\N
c035a873-8fae-4869-b315-9d0261936982	Robles, Rene	\N	\N	2026-03-07 10:27:51.895+00	2026-03-07 10:27:51.895+00	\N
f2f70b73-a4f1-4fc5-892a-517a2b02451d	The Dow Company	\N	\N	2026-03-07 10:27:51.898+00	2026-03-07 10:27:51.898+00	\N
7e21054d-d284-4443-83f1-00991fae7576	The Dow Co.	\N	\N	2026-03-07 10:27:51.905+00	2026-03-07 10:27:51.905+00	\N
cf678107-6f03-4435-8c48-9522adff7c6c	MacDonald, Bill	\N	\N	2026-03-07 10:27:51.912+00	2026-03-07 10:27:51.912+00	\N
61ce6236-3ca7-427c-96ed-29a6de671985	Mishkin, Robert	\N	\N	2026-03-07 10:27:51.916+00	2026-03-07 10:27:51.916+00	\N
39412db5-1cfe-4a82-94f4-3cabde1c9380	Hevener, Suzanne	\N	\N	2026-03-07 10:27:51.92+00	2026-03-07 10:27:51.92+00	\N
8fba72bf-592b-40e3-a3c8-e3d9b3972d0e	Chao, Cecilia	\N	\N	2026-03-07 10:27:51.923+00	2026-03-07 10:27:51.923+00	\N
26a12ca5-4114-40c3-9d11-8d903f7165c5	Boulay, Tom	\N	\N	2026-03-07 10:27:51.927+00	2026-03-07 10:27:51.927+00	\N
993d2b43-74c9-41e8-966a-d18e9b884b14	Smith, Eric	\N	\N	2026-03-07 10:27:51.93+00	2026-03-07 10:27:51.93+00	\N
ec35c59c-cc4c-45b3-bb10-bf9e2e943cb7	Rocheford, Jeremey	\N	\N	2026-03-07 10:27:51.934+00	2026-03-07 10:27:51.934+00	\N
1b605509-97ca-4025-9c65-071a41a7a21c	Molloy, Justin	\N	\N	2026-03-07 10:27:51.941+00	2026-03-07 10:27:51.941+00	\N
bc6fba85-1116-4863-90a2-b05782e8aabc	Porter, Thomas James	\N	\N	2026-03-07 10:27:51.944+00	2026-03-07 10:27:51.944+00	\N
9178db91-04b9-4325-a4c8-dc3574e001b2	Nicolas, Dan	\N	\N	2026-03-07 10:27:51.948+00	2026-03-07 10:27:51.948+00	\N
fc6f7377-5c14-40df-a21a-0ac312738bd5	Fisher, Jaime	\N	\N	2026-03-07 10:27:51.951+00	2026-03-07 10:27:51.951+00	\N
b16a198c-6c92-4711-9fd9-699ce6e602f2	Harris, Daniel	\N	\N	2026-03-07 10:27:51.954+00	2026-03-07 10:27:51.954+00	\N
527bc8cf-cdbf-4a94-81a3-83a9c022892d	Lafferty, Andrew	\N	\N	2026-03-07 10:27:51.958+00	2026-03-07 10:27:51.958+00	\N
9d79bb91-1c9c-41d3-bbf1-a7b1bffbeafa	Marchand-Davis, Joy & Scott	\N	\N	2026-03-07 10:27:51.961+00	2026-03-07 10:27:51.961+00	\N
b6b7c6cf-7fc3-4795-8c77-b8a34b9d0c9e	CM Conway Construction	\N	\N	2026-03-07 10:27:51.965+00	2026-03-07 10:27:51.965+00	\N
37d71c0f-b200-4f28-865b-7db04de01678	Desmond, Jack	\N	\N	2026-03-07 10:27:51.968+00	2026-03-07 10:27:51.968+00	\N
3474a489-4df5-4bae-9fe6-b66635ab22eb	Donahue, Lauren	\N	\N	2026-03-07 10:27:51.971+00	2026-03-07 10:27:51.971+00	\N
d685e5c0-f99d-4143-8251-c5886f7b8588	Johnson, Bill	\N	\N	2026-03-07 10:27:51.978+00	2026-03-07 10:27:51.978+00	\N
7389abb1-b59d-4b8e-bc49-31437ed0783f	Bucci, Ken	\N	\N	2026-03-07 10:27:51.984+00	2026-03-07 10:27:51.984+00	\N
9f183f8e-d36e-42f2-a69a-ed0e7511f684	Pizzi, Lauren	\N	\N	2026-03-07 10:27:51.987+00	2026-03-07 10:27:51.987+00	\N
a76b8196-9b91-4160-9e89-b4b63557d9cc	Anno, Kate	\N	\N	2026-03-07 10:27:51.991+00	2026-03-07 10:27:51.991+00	\N
1b499fc5-7a36-48c0-b142-cc252957e74e	Eddowes, Paul	\N	\N	2026-03-07 10:27:51.997+00	2026-03-07 10:27:51.997+00	\N
8e611796-4201-4ac3-b47e-f5da5a81df38	Brown, Stephaine	\N	\N	2026-03-07 10:27:52+00	2026-03-07 10:27:52+00	\N
f7b9e401-78f5-4532-afa1-c312a4f2a34d	Hathaway, Alden	\N	\N	2026-03-07 10:27:52.004+00	2026-03-07 10:27:52.004+00	\N
43f6a6e8-93af-4e93-b25e-9781e61a189e	Polsonetti, Tim	\N	\N	2026-03-07 10:27:52.007+00	2026-03-07 10:27:52.007+00	\N
92774bd8-6ef4-4864-8f32-c449f56810ae	Gagnon, Rick	\N	\N	2026-03-07 10:27:52.011+00	2026-03-07 10:27:52.011+00	\N
b2f862bc-8b3f-4e94-a8b4-52b6be75c582	Grew, Paul	\N	\N	2026-03-07 10:27:52.014+00	2026-03-07 10:27:52.014+00	\N
4d47e76c-ba7c-470d-9461-b869d7883c5d	Murray, Richard	\N	\N	2026-03-07 10:27:52.017+00	2026-03-07 10:27:52.017+00	\N
01fb323a-30f9-4166-a8cc-75d1605c0303	Tankel, Richard	\N	\N	2026-03-07 10:27:52.021+00	2026-03-07 10:27:52.021+00	\N
24204b7f-a039-414d-9a06-7cf8300c8569	Donovan, Steven	\N	\N	2026-03-07 10:27:52.024+00	2026-03-07 10:27:52.024+00	\N
2b9d6eaf-681c-404d-be66-bc7458860488	Enderlin, Kate	\N	\N	2026-03-07 10:27:52.028+00	2026-03-07 10:27:52.028+00	\N
0ba75834-b23a-4774-8172-4c491f79c9ab	Duchesneau, Michael	\N	\N	2026-03-07 10:27:52.032+00	2026-03-07 10:27:52.032+00	\N
2d3be3ac-a292-4e22-8fe4-31104e544361	Reynolds, Timothy	\N	\N	2026-03-07 10:27:52.035+00	2026-03-07 10:27:52.035+00	\N
4f7d8fea-095f-46aa-b4df-c27341ee4559	Cole Landscaping	\N	\N	2026-03-07 10:27:52.042+00	2026-03-07 10:27:52.042+00	\N
d614c390-d2a4-476b-bef8-f56f20ecf41d	Decarney, Mario	\N	\N	2026-03-07 10:27:52.045+00	2026-03-07 10:27:52.045+00	\N
861ec0b1-9e1d-45da-ada5-e15a6b3bc273	Recio, Belinda	\N	\N	2026-03-07 10:27:52.049+00	2026-03-07 10:27:52.049+00	\N
c2745d96-cf35-4f7a-adca-22540ea4af51	Whitney Land Management	\N	\N	2026-03-07 10:27:52.056+00	2026-03-07 10:27:52.056+00	\N
d01fe742-ced0-45ba-9ac5-739b0fdd92a8	Silva, Jeffery	\N	\N	2026-03-07 10:27:52.06+00	2026-03-07 10:27:52.06+00	\N
bae35f6e-eba9-48d6-84f2-113f070f2180	Gavin, John	\N	\N	2026-03-07 10:27:52.063+00	2026-03-07 10:27:52.063+00	\N
60a4d4a0-8171-4584-aacf-e32d3b8fbc70	Heil, Andrea	\N	\N	2026-03-07 10:27:52.067+00	2026-03-07 10:27:52.067+00	\N
fb89aabc-40e3-48fd-a6c7-d6065b1c1714	Scout & Associates General Contractors	\N	\N	2026-03-07 10:27:52.071+00	2026-03-07 10:27:52.071+00	\N
8a8b6cc6-8545-4b8d-a88d-f5633487ab51	Denny, Mark	\N	\N	2026-03-07 10:27:52.075+00	2026-03-07 10:27:52.075+00	\N
6bc40809-2f4c-495a-901a-b59c7aa5089b	Smolinsky, Carol	\N	\N	2026-03-07 10:27:52.078+00	2026-03-07 10:27:52.078+00	\N
2cef772c-eb5d-43cf-bc9e-fdb3bf55001f	Juergens, Tom	\N	\N	2026-03-07 10:27:52.081+00	2026-03-07 10:27:52.081+00	\N
8887ef66-2f87-44a0-850c-d67b5cc5d62f	Saluto, George	\N	\N	2026-03-07 10:27:52.085+00	2026-03-07 10:27:52.085+00	\N
1ee10b52-2d6e-4328-9150-e6130aa2d1e0	McCaul, John	\N	\N	2026-03-07 10:27:52.089+00	2026-03-07 10:27:52.089+00	\N
e97e7cd9-e81f-419b-b4cd-eb5724b9bb4f	Thompson, Margaret	\N	\N	2026-03-07 10:27:52.092+00	2026-03-07 10:27:52.092+00	\N
4d37445e-bcae-4694-b15f-cf014738f3e9	Great North Property Management	\N	\N	2026-03-07 10:27:52.102+00	2026-03-07 10:27:52.102+00	\N
553f5dec-3c5f-410c-a338-92cfd9e97141	Donnell, John	\N	\N	2026-03-07 10:27:52.107+00	2026-03-07 10:27:52.107+00	\N
50205b6e-b085-4a6d-a407-aa85ba167d75	Gallagher, Leana	\N	\N	2026-03-07 10:27:52.111+00	2026-03-07 10:27:52.111+00	\N
ff536a33-a52f-46f5-9333-d51b9c5520eb	Coltin, Mark	\N	\N	2026-03-07 10:27:52.115+00	2026-03-07 10:27:52.115+00	\N
eceb45d2-866e-4dee-8f86-44791c35fa0f	Contractors Choice Fence Supply	\N	\N	2026-03-07 10:27:52.119+00	2026-03-07 10:27:52.119+00	\N
175b6ade-a85c-411d-8eae-3bf7880deb9f	Rabbitt, Bob	\N	\N	2026-03-07 10:27:52.123+00	2026-03-07 10:27:52.123+00	\N
ea638e17-7c99-47d7-9099-0d2985d44555	Enfield, Stephen	\N	\N	2026-03-07 10:27:52.127+00	2026-03-07 10:27:52.127+00	\N
758a72ed-0039-4034-bdeb-7a405e7b320d	Smolinksy, Carol	\N	\N	2026-03-07 10:27:52.13+00	2026-03-07 10:27:52.13+00	\N
50653095-2b63-412c-8fd9-2694d26b520f	Rolph, Abbie	\N	\N	2026-03-07 10:27:52.134+00	2026-03-07 10:27:52.134+00	\N
5c3ae967-bb1f-4df6-9f27-c62a8d887e77	Klimowicz, Phil	\N	\N	2026-03-07 10:27:52.137+00	2026-03-07 10:27:52.137+00	\N
244a76f1-66b3-4c9b-bc06-afe7cedb2e41	Walnut Grove Cemetery	\N	\N	2026-03-07 10:27:52.141+00	2026-03-07 10:27:52.141+00	\N
46bc4dad-6bd2-4341-975a-83160cae906b	Moffie, Gary	\N	\N	2026-03-07 10:27:52.144+00	2026-03-07 10:27:52.144+00	\N
fd202acb-08e6-4762-a7ae-296ba7c22185	City of Salem	\N	\N	2026-03-07 10:27:52.148+00	2026-03-07 10:27:52.148+00	\N
580efffb-cd56-48f8-8f71-5507d6422e7f	Hagan, Ed	\N	\N	2026-03-07 10:27:52.155+00	2026-03-07 10:27:52.155+00	\N
e10d12cb-1a4f-4077-9c5d-97e016b4a560	Stuart, Janice	\N	\N	2026-03-07 10:27:52.158+00	2026-03-07 10:27:52.158+00	\N
ecc6047e-e4c6-415a-85bc-bb73e5d8b713	Coleman, Daniel	\N	\N	2026-03-07 10:27:52.162+00	2026-03-07 10:27:52.162+00	\N
0bd57963-fe25-4fa9-b52b-32a3aec76af9	Cronin, Mike	\N	\N	2026-03-07 10:27:52.165+00	2026-03-07 10:27:52.165+00	\N
9ce44dd5-9502-4cee-9981-b910d0e6df43	Davis, Jeff	\N	\N	2026-03-07 10:27:52.168+00	2026-03-07 10:27:52.168+00	\N
cf799264-cafd-4ce9-b70f-38366fe79d09	Guido, Sandy	\N	\N	2026-03-07 10:27:52.172+00	2026-03-07 10:27:52.172+00	\N
d6d11994-e59b-43f3-866f-7e8cd81487cb	Town of Newbury: Tree Warden	\N	\N	2026-03-07 10:27:52.178+00	2026-03-07 10:27:52.178+00	\N
64c6d566-4ddc-4483-85d5-676ca19ee21b	Bashaw, Brett	\N	\N	2026-03-07 10:27:52.182+00	2026-03-07 10:27:52.182+00	\N
a9d00ed6-eb4e-4e7e-b83f-909cb95bfeb0	Martellone, Tom	\N	\N	2026-03-07 10:27:52.185+00	2026-03-07 10:27:52.185+00	\N
b28b6cc3-878b-4119-b89e-60590ef70380	Vangelist, Jenn	\N	\N	2026-03-07 10:27:52.188+00	2026-03-07 10:27:52.188+00	\N
7a7695c1-f6cf-493f-ac9b-0e1dac6b9bcf	Balaram, Robyn	\N	\N	2026-03-07 10:27:52.192+00	2026-03-07 10:27:52.192+00	\N
6a51127b-2f34-4a8e-8c10-afff1365cf43	Thorton, Philip	\N	\N	2026-03-07 10:27:52.196+00	2026-03-07 10:27:52.196+00	\N
1f524213-df8f-47ce-9584-f7514b652a1c	Muto, Peter	\N	\N	2026-03-07 10:27:52.2+00	2026-03-07 10:27:52.2+00	\N
c15bba38-74f1-41be-98a4-c32978cbeaf2	Linda Bangs Design	\N	\N	2026-03-07 10:27:52.204+00	2026-03-07 10:27:52.204+00	\N
fa490ea4-7595-489f-bb96-49c00e9af0e3	Etha C. Indeck Trust	\N	\N	2026-03-07 10:27:52.209+00	2026-03-07 10:27:52.209+00	\N
f8fa2db8-6d40-493e-9184-035dab7c7dca	Gemini Properties	\N	\N	2026-03-07 10:27:52.212+00	2026-03-07 10:27:52.212+00	\N
fb0d6d72-3d6a-4f94-bf42-745dfeba8a4c	Chickering, Jim	\N	\N	2026-03-07 10:27:52.216+00	2026-03-07 10:27:52.216+00	\N
ca261052-e1e6-4ced-8723-cdfd5679f03c	D'Ambrosio, Ralph	\N	\N	2026-03-07 10:27:52.222+00	2026-03-07 10:27:52.222+00	\N
21ba8286-d2dc-4a25-9629-668992d8a088	Damato, Justin	\N	\N	2026-03-07 10:27:52.225+00	2026-03-07 10:27:52.225+00	\N
96b1ce78-b448-4644-82b2-70f4ac188f41	Melanson Development	\N	\N	2026-03-07 10:27:52.229+00	2026-03-07 10:27:52.229+00	\N
eb8a19cb-5161-4a3b-9801-d1732f29336b	Vaillancourt, Todd	\N	\N	2026-03-07 10:27:52.236+00	2026-03-07 10:27:52.236+00	\N
1089f83c-cf73-449a-a23f-8668cac2660a	Blue, Natalie	\N	\N	2026-03-07 10:27:52.24+00	2026-03-07 10:27:52.24+00	\N
c93cdc4e-9ca4-4d50-90c6-de2467ef44be	Pagliarulo, Joe	\N	\N	2026-03-07 10:27:52.245+00	2026-03-07 10:27:52.245+00	\N
07c4fe10-310d-43fd-acaf-06f36b742fa9	Mason, Alexander	\N	\N	2026-03-07 10:27:52.249+00	2026-03-07 10:27:52.249+00	\N
df58122b-db4b-4f42-942a-c57bae1bc4fa	Congdon, William	\N	\N	2026-03-07 10:27:52.253+00	2026-03-07 10:27:52.253+00	\N
41cbffc1-2115-4ddf-8fb4-90c869cb456c	Gemini Property Management	\N	\N	2026-03-07 10:27:52.257+00	2026-03-07 10:27:52.257+00	\N
6054a248-b880-40ed-a6ba-c96f682d056b	Fisher, Jamie	\N	\N	2026-03-07 10:27:52.26+00	2026-03-07 10:27:52.26+00	\N
44923a04-4457-4ef1-bbc5-0c14f1f25389	Chaimovich, Tom	\N	\N	2026-03-07 10:27:52.264+00	2026-03-07 10:27:52.264+00	\N
195ea816-7b17-4685-9063-42694c13d712	Kelley, Sarah	\N	\N	2026-03-07 10:27:52.268+00	2026-03-07 10:27:52.268+00	\N
2884cf43-84e4-409b-a89d-701b86bf3700	Primrose, Rick	\N	\N	2026-03-07 10:27:52.272+00	2026-03-07 10:27:52.272+00	\N
a8e2cd54-02e2-4954-93b0-dfb6d0d1b4d8	Fucillo, Jean	\N	\N	2026-03-07 10:27:52.276+00	2026-03-07 10:27:52.276+00	\N
267e6f4d-9b96-49de-84d1-32b4754ec724	Trust, Etha C. Indeck	\N	\N	2026-03-07 10:27:52.279+00	2026-03-07 10:27:52.279+00	\N
2768b26c-aa85-4116-8551-c38e6c962204	Hoffman, Matt	\N	\N	2026-03-07 10:27:52.283+00	2026-03-07 10:27:52.283+00	\N
0722916d-9f33-447a-9960-97d922f4502e	Kilpatrick. Russ	\N	\N	2026-03-07 10:27:52.287+00	2026-03-07 10:27:52.287+00	\N
c291d8b0-de60-4273-abb0-5efa2f504b05	City of Beverly	\N	\N	2026-03-07 10:27:52.291+00	2026-03-07 10:27:52.291+00	\N
f17d3baf-f229-4c69-b72c-9f715d11dbce	Kimball, Jeff	\N	\N	2026-03-07 10:27:52.294+00	2026-03-07 10:27:52.294+00	\N
a854f578-0207-4072-ac0a-c09a3ccece98	Quinn, Rick	\N	\N	2026-03-07 10:27:52.298+00	2026-03-07 10:27:52.298+00	\N
dc296e24-59f7-457c-9bac-66be52653d6f	Levine, Casey	\N	\N	2026-03-07 10:27:52.305+00	2026-03-07 10:27:52.305+00	\N
6fcc8826-99e8-4083-970c-00b3b6c05adb	Maestranzi, John	\N	\N	2026-03-07 10:27:52.309+00	2026-03-07 10:27:52.309+00	\N
ebd14c5d-1da7-477d-bc9f-cce37262f20e	Notas, Nick	\N	\N	2026-03-07 10:27:52.312+00	2026-03-07 10:27:52.312+00	\N
863d99f6-0b3c-4dc5-a62f-3279f337d11f	Bobrek, John	\N	\N	2026-03-07 10:27:52.316+00	2026-03-07 10:27:52.316+00	\N
ec8bcb46-7410-4acb-907b-44147684ea99	Durlacher, Greg	\N	\N	2026-03-07 10:27:52.319+00	2026-03-07 10:27:52.319+00	\N
246596bc-0359-4455-9ed3-2f9422d341b0	Dunbar, Kristin	\N	\N	2026-03-07 10:27:52.323+00	2026-03-07 10:27:52.323+00	\N
245bf0a0-9020-4cbf-a9bd-4aa5909738c4	Young, Elizabeth	\N	\N	2026-03-07 10:27:52.326+00	2026-03-07 10:27:52.326+00	\N
c20c250f-22ff-49c9-b632-f7a58973328e	Provenzamo, Charles	\N	\N	2026-03-07 10:27:52.33+00	2026-03-07 10:27:52.33+00	\N
7e47f408-4929-4386-ba5e-d2fa11d73b9c	Pasquale, Marcos	\N	\N	2026-03-07 10:27:52.339+00	2026-03-07 10:27:52.339+00	\N
d02a6c01-65af-47fb-99e5-51da9070286c	Palagiri, Rohith	\N	\N	2026-03-07 10:27:52.342+00	2026-03-07 10:27:52.342+00	\N
4623ad78-5cd7-4062-a2b4-f1b70c3366c1	United Civil	\N	\N	2026-03-07 10:27:52.346+00	2026-03-07 10:27:52.346+00	\N
aeee9dc8-15ea-4a36-a6f8-28bf1f496e28	King, Roger	\N	\N	2026-03-07 10:27:52.349+00	2026-03-07 10:27:52.349+00	\N
fa5cc74d-dc65-435a-b55d-a9db558c6c42	Moschella, Joanne	\N	\N	2026-03-07 10:27:52.353+00	2026-03-07 10:27:52.353+00	\N
37801df6-0342-4d20-bcd0-0dd93b041f92	The Galantes	\N	\N	2026-03-07 10:27:52.356+00	2026-03-07 10:27:52.356+00	\N
a4b561da-007a-4028-b9dc-ee0424b482ea	Glenn Battistelli Construction	\N	\N	2026-03-07 10:27:52.36+00	2026-03-07 10:27:52.36+00	\N
c65ad20f-b653-4fa3-8dec-723e59d24583	Kelliher, Patrick	\N	\N	2026-03-07 10:27:52.363+00	2026-03-07 10:27:52.363+00	\N
978a27d7-0a30-4f5c-9f56-8702495e8b0e	Thissell, John	\N	\N	2026-03-07 10:27:52.367+00	2026-03-07 10:27:52.367+00	\N
a6d85630-7273-4c5c-9d4c-45e5b8dbb082	Nichols, Georgia	\N	\N	2026-03-07 10:27:52.37+00	2026-03-07 10:27:52.37+00	\N
6d97dc24-2939-4194-b6ab-a7a92a786492	Town of Wenham DPW	\N	\N	2026-03-07 10:27:52.377+00	2026-03-07 10:27:52.377+00	\N
1e74b001-e765-4180-931b-0963abb994e2	Gray, Kevin	\N	\N	2026-03-07 10:27:52.38+00	2026-03-07 10:27:52.38+00	\N
94563a4f-2c73-4a15-83aa-f44646f212b8	Holbrook, Jake	\N	\N	2026-03-07 10:27:52.384+00	2026-03-07 10:27:52.384+00	\N
ee87ac48-0325-471f-8e47-8b5ed9e0b586	E.P. Management Corp	\N	\N	2026-03-07 10:27:52.388+00	2026-03-07 10:27:52.388+00	\N
4ed397d4-35dd-41aa-a48c-40cd04b1bad8	Shrewsbury, Jesse	\N	\N	2026-03-07 10:27:52.391+00	2026-03-07 10:27:52.391+00	\N
544f3e02-6483-446d-b3dd-758750651700	Orcutt, Victoria	\N	\N	2026-03-07 10:27:52.395+00	2026-03-07 10:27:52.395+00	\N
72950902-bb6f-40b2-9394-38f84f2e2df5	Nezhad, Aimee	\N	\N	2026-03-07 10:27:52.399+00	2026-03-07 10:27:52.399+00	\N
a70778a0-094c-4b05-a529-3d8ef2d20489	Healy, Barbara	\N	\N	2026-03-07 10:27:52.402+00	2026-03-07 10:27:52.402+00	\N
e9fe519d-7b82-4889-84f1-ab828c55c6b4	Corso, Rob	\N	\N	2026-03-07 10:27:52.405+00	2026-03-07 10:27:52.405+00	\N
d9e118a5-8755-4caa-8186-82ef9434c4ee	Tallant, Jonathan	\N	\N	2026-03-07 10:27:52.409+00	2026-03-07 10:27:52.409+00	\N
06f275cb-67d2-440c-b552-13f94151766e	CM&B	\N	\N	2026-03-07 10:27:52.413+00	2026-03-07 10:27:52.413+00	\N
c68a5279-280e-4d14-bbf3-a596d14547ef	EP MGT	\N	\N	2026-03-07 10:27:52.417+00	2026-03-07 10:27:52.417+00	\N
7b76748c-fbce-461b-8f99-036842a2ca12	Denis, Raymond	\N	\N	2026-03-07 10:27:52.424+00	2026-03-07 10:27:52.424+00	\N
d6ab63c8-3212-440b-8c18-7f68d570c6c0	Artistic Landscape	\N	\N	2026-03-07 10:27:52.428+00	2026-03-07 10:27:52.428+00	\N
818ef441-5b48-43f5-8d00-fe0332fdd9c1	Rakowski, Tomek	\N	\N	2026-03-07 10:27:52.432+00	2026-03-07 10:27:52.432+00	\N
76bf6759-b682-4671-9d5f-07ac13d248ee	Manzi, Joe	\N	\N	2026-03-07 10:27:52.435+00	2026-03-07 10:27:52.435+00	\N
af4136b0-e787-4d92-9fa1-4c3389682851	Wigglesworth, Tom	\N	\N	2026-03-07 10:27:52.438+00	2026-03-07 10:27:52.438+00	\N
ef8435a5-770e-4955-9db9-84acdf05a38e	Wendell, Wayne	\N	\N	2026-03-07 10:27:52.442+00	2026-03-07 10:27:52.442+00	\N
bf577631-737d-4690-8f78-2542ba72683e	Evans, Morgan	\N	\N	2026-03-07 10:27:52.449+00	2026-03-07 10:27:52.449+00	\N
ab32d1a9-6a86-4c87-a415-c90a0b86c086	Sabatino, Denise	\N	\N	2026-03-07 10:27:52.455+00	2026-03-07 10:27:52.455+00	\N
6dc92c90-9adf-4e94-82cf-5e212407e9cf	Gilfus, Maria	\N	\N	2026-03-07 10:27:52.458+00	2026-03-07 10:27:52.458+00	\N
d69752b7-1134-4a94-b2a1-3dc3c79c8fec	Berecz, Frank	\N	\N	2026-03-07 10:27:52.462+00	2026-03-07 10:27:52.462+00	\N
412bde1d-b10c-439c-bbf7-65c9fb54f033	Fadel, Dimitri	\N	\N	2026-03-07 10:27:52.465+00	2026-03-07 10:27:52.465+00	\N
c69e5fbd-90a4-40d7-affc-0ff527d467b2	Ormiston, Greg	\N	\N	2026-03-07 10:27:52.468+00	2026-03-07 10:27:52.468+00	\N
043ad842-4ba8-46a1-a2f4-b3f9b183abb9	Hemeon, Lynda	\N	\N	2026-03-07 10:27:52.475+00	2026-03-07 10:27:52.475+00	\N
9268620d-f5a1-4a56-b7d6-01aac4723ddf	Squires, Bill	\N	\N	2026-03-07 10:27:52.478+00	2026-03-07 10:27:52.478+00	\N
0a56af05-ba9a-400c-965d-1e7598818f15	Pilkons, Paul	\N	\N	2026-03-07 10:27:52.482+00	2026-03-07 10:27:52.482+00	\N
7331cc56-3470-4dbc-9d19-47f3e5600068	Sabin, Wendy	\N	\N	2026-03-07 10:27:52.485+00	2026-03-07 10:27:52.485+00	\N
b33cc330-3125-4213-96e9-20f6af972e20	Dearborn, Chris	\N	\N	2026-03-07 10:27:52.488+00	2026-03-07 10:27:52.488+00	\N
2eaf2461-ff91-47ac-b14a-0fe281d2a636	Tobiassen, Alexanda	\N	\N	2026-03-07 10:27:52.492+00	2026-03-07 10:27:52.492+00	\N
b811776a-7b7b-4b91-8f32-34461a3813d3	Bienvenue, Richard	\N	\N	2026-03-07 10:27:52.495+00	2026-03-07 10:27:52.495+00	\N
5f6645d3-ee26-46f4-9f8b-0c0530efe530	Cheever, Joe	\N	\N	2026-03-07 10:27:52.499+00	2026-03-07 10:27:52.499+00	\N
9cd98ddf-bb06-4ee7-81de-1ef001519825	Augustin, Cristina	\N	\N	2026-03-07 10:27:52.502+00	2026-03-07 10:27:52.502+00	\N
02b10fec-e851-43d9-b544-13feeb77c8ac	Crotty, Thomas	\N	\N	2026-03-07 10:27:52.505+00	2026-03-07 10:27:52.505+00	\N
a41f1ffc-a4af-4e6a-a4c2-9443420b789d	Page, Tuny	\N	\N	2026-03-07 10:27:52.509+00	2026-03-07 10:27:52.509+00	\N
7f110a87-e26b-4613-8681-b562d83051d5	Salem State University	\N	\N	2026-03-07 10:27:52.512+00	2026-03-07 10:27:52.512+00	\N
345bbf9c-350d-46e9-8617-60abbe12cd08	Bacon, Lynn	\N	\N	2026-03-07 10:27:52.518+00	2026-03-07 10:27:52.518+00	\N
c9f8cc48-074a-42e7-adb1-98e5ea617202	Bagarella, Adam	\N	\N	2026-03-07 10:27:52.522+00	2026-03-07 10:27:52.522+00	\N
7b57da71-8653-43b0-8a20-b03416078674	Hyde, Douglas	\N	\N	2026-03-07 10:27:52.526+00	2026-03-07 10:27:52.526+00	\N
ec65bd6d-4f02-4d37-8ab8-e7cae043be90	Landesign	\N	\N	2026-03-07 10:27:52.529+00	2026-03-07 10:27:52.529+00	\N
00b97d30-c74d-4167-bd6b-b2c39b791559	O'Flynn Residence	\N	\N	2026-03-07 10:27:52.533+00	2026-03-07 10:27:52.533+00	\N
e3470ab4-8bab-4559-8833-3f3e197d0699	ND Land	\N	\N	2026-03-07 10:27:52.536+00	2026-03-07 10:27:52.536+00	\N
34e33994-7f30-4394-bc9a-f40e928fe2c2	Gowdy, Trevor	\N	\N	2026-03-07 10:27:52.54+00	2026-03-07 10:27:52.54+00	\N
89a9303a-78ab-4bea-a806-a16ca9697a09	Block, Kevin	\N	\N	2026-03-07 10:27:52.543+00	2026-03-07 10:27:52.543+00	\N
863fd1a0-7da3-460b-9395-e19e34143e3d	Town of Lynnfield	\N	\N	2026-03-07 10:27:52.547+00	2026-03-07 10:27:52.547+00	\N
caa5354d-031d-4857-8423-50964b65e3c3	Pitt Pipeline	\N	\N	2026-03-07 10:27:52.553+00	2026-03-07 10:27:52.553+00	\N
cbf605ee-4bbf-4c44-92a5-3099f5b529a2	ND Landscape	\N	\N	2026-03-07 10:27:52.557+00	2026-03-07 10:27:52.557+00	\N
c110b614-9db4-476e-a14a-0e2fa845986b	Landmark School	\N	\N	2026-03-07 10:27:52.56+00	2026-03-07 10:27:52.56+00	\N
51034a97-2b60-44d9-a55e-1c53df022340	Parker, Lynne	\N	\N	2026-03-07 10:27:52.564+00	2026-03-07 10:27:52.564+00	\N
4cce9c7d-9979-4aea-a1b7-316f9ecd4fd5	Mediate Management	\N	\N	2026-03-07 10:27:52.572+00	2026-03-07 10:27:52.572+00	\N
ef7e06d3-04ea-43a9-8ccb-d38dac02504b	JC Grounds Management	\N	\N	2026-03-07 10:27:52.575+00	2026-03-07 10:27:52.575+00	\N
8dc1449d-d145-42c4-b373-6d243a2b69f0	Reinold, Daniel	\N	\N	2026-03-07 10:27:52.578+00	2026-03-07 10:27:52.578+00	\N
131b50e4-e3a2-400b-a801-a71a1147effe	O'Lear, Edward	\N	\N	2026-03-07 10:27:52.582+00	2026-03-07 10:27:52.582+00	\N
6ccb12af-b293-4a60-8141-80dee2967bcf	Reid, Morgan	\N	\N	2026-03-07 10:27:52.586+00	2026-03-07 10:27:52.586+00	\N
421fcac3-3eab-4b83-aba3-09e7ba7d364d	Stallings, Ben	\N	\N	2026-03-07 10:27:52.592+00	2026-03-07 10:27:52.592+00	\N
5db9f38d-296c-4dfe-a7ce-f0b7d83b3230	Searle, Will	\N	\N	2026-03-07 10:27:52.595+00	2026-03-07 10:27:52.595+00	\N
65e10c77-566d-4e2d-8b12-d200d9cb876a	Tappin, Ryan	\N	\N	2026-03-07 10:27:52.599+00	2026-03-07 10:27:52.599+00	\N
86a3b5d7-7bc9-486a-8011-a461ff615e33	ABOG	\N	\N	2026-03-07 10:27:52.603+00	2026-03-07 10:27:52.603+00	\N
d9581eb3-0191-4f8f-9ddf-9b0a3d6d1c71	Krummel, Daniel	\N	\N	2026-03-07 10:27:52.606+00	2026-03-07 10:27:52.606+00	\N
5d6318ed-7bc1-4657-99a7-e3cc149ec11c	Bodenheimer, Rose Marie	\N	\N	2026-03-07 10:27:52.61+00	2026-03-07 10:27:52.61+00	\N
e50a0130-595b-441c-b679-bf76655176da	Snider, James	\N	\N	2026-03-07 10:27:52.613+00	2026-03-07 10:27:52.613+00	\N
27c064e0-239a-4824-9fd2-258209278411	Green, Kim	\N	\N	2026-03-07 10:27:52.617+00	2026-03-07 10:27:52.617+00	\N
eec64d5a-5750-45d0-8280-ab8b892bae1a	Raj, Milan	\N	\N	2026-03-07 10:27:52.621+00	2026-03-07 10:27:52.621+00	\N
5e6b2583-5f5b-408a-85d0-0493d432a8bf	Leete, Thomas	\N	\N	2026-03-07 10:27:52.624+00	2026-03-07 10:27:52.624+00	\N
293595a4-8b07-4962-87a2-f98ea6a3ef25	Roy, Randy	\N	\N	2026-03-07 10:27:52.628+00	2026-03-07 10:27:52.628+00	\N
b39cd743-c9b9-4b55-8bb1-e4b38ff225f6	Cataldo, Chessie	\N	\N	2026-03-07 10:27:52.631+00	2026-03-07 10:27:52.631+00	\N
74847b71-8ef0-4751-a63f-9bafd9232054	Zydlewski, Walter	\N	\N	2026-03-07 10:27:52.635+00	2026-03-07 10:27:52.635+00	\N
e8982610-6422-45ec-b127-5fc6a0922fb2	Gutierrez, Isabel	\N	\N	2026-03-07 10:27:52.639+00	2026-03-07 10:27:52.639+00	\N
f69aef88-1099-4659-b84f-2cb82acd0bae	McNeill, Liz	\N	\N	2026-03-07 10:27:52.642+00	2026-03-07 10:27:52.642+00	\N
d8b955cc-879a-48c3-bc83-ec8c0d1aeacf	Bruce, John	\N	\N	2026-03-07 10:27:52.645+00	2026-03-07 10:27:52.645+00	\N
74520d17-c3f7-49d7-804f-c9eb26cc6802	Glixon, Judith	\N	\N	2026-03-07 10:27:52.649+00	2026-03-07 10:27:52.649+00	\N
4a1ceef6-3fc1-43f4-8792-023dea84a723	Shen, Solomon	\N	\N	2026-03-07 10:27:52.652+00	2026-03-07 10:27:52.652+00	\N
f1a355ef-3734-4978-a832-60e5c5676802	Fink, Gerry	\N	\N	2026-03-07 10:27:52.656+00	2026-03-07 10:27:52.656+00	\N
f4831517-d879-407b-a12b-4300f1a855a9	Soucy, Jonathan	\N	\N	2026-03-07 10:27:52.659+00	2026-03-07 10:27:52.659+00	\N
863f4264-1904-4c0b-b249-96f85db17de4	Messier, Joseph	\N	\N	2026-03-07 10:27:52.663+00	2026-03-07 10:27:52.663+00	\N
0bc138a6-fe83-4d64-9cc3-ddbbc27bf15a	Epstein, Alan	\N	\N	2026-03-07 10:27:52.667+00	2026-03-07 10:27:52.667+00	\N
88043e7e-d961-468f-9dc2-3dcde9b4e10f	Laich, Marcus	\N	\N	2026-03-07 10:27:52.67+00	2026-03-07 10:27:52.67+00	\N
506b0dd3-c007-4aaf-ab94-7c46ac734e2e	Smith, Mike	\N	\N	2026-03-07 10:27:52.674+00	2026-03-07 10:27:52.674+00	\N
db880e8e-17fd-4aa6-b686-fb074869fd43	Appel, Jackie	\N	\N	2026-03-07 10:27:52.677+00	2026-03-07 10:27:52.677+00	\N
2e474c82-620d-4638-8132-1c0dd7737384	Giannetti, Joe	\N	\N	2026-03-07 10:27:52.681+00	2026-03-07 10:27:52.681+00	\N
49eee104-d613-4525-8740-231f4a1c0bcb	Merrifield Garden & Design	\N	\N	2026-03-07 10:27:52.688+00	2026-03-07 10:27:52.688+00	\N
e4d61941-8e5c-4015-93b6-2cf4af37c59d	Schebesta, Michael	\N	\N	2026-03-07 10:27:52.691+00	2026-03-07 10:27:52.691+00	\N
3a387d46-e2ae-4196-8d44-333597357876	Connors, Patricia	\N	\N	2026-03-07 10:27:52.695+00	2026-03-07 10:27:52.695+00	\N
7d7b9dc2-cc41-4087-93a5-d15c6530af72	Wu, Chris	\N	\N	2026-03-07 10:27:52.699+00	2026-03-07 10:27:52.699+00	\N
3af1c5a4-ce5c-4b6e-91cb-47879235eece	Jones, Edward	\N	\N	2026-03-07 10:27:52.702+00	2026-03-07 10:27:52.702+00	\N
8f4c2525-4c5b-4f06-a0f9-0a1ed508eaf4	Ng, Trish	\N	\N	2026-03-07 10:27:52.706+00	2026-03-07 10:27:52.706+00	\N
607714d7-bbea-4fa2-9a50-d274501ec4a2	Ward, Carter	\N	\N	2026-03-07 10:27:52.71+00	2026-03-07 10:27:52.71+00	\N
b2710e3b-b1c1-4de4-97d8-c9e3eb87615b	Bailey, Liz Rover	\N	\N	2026-03-07 10:27:52.714+00	2026-03-07 10:27:52.714+00	\N
85075471-3d1c-4b28-a1ab-7e16ac3292e3	Linear Property Management, LLC	\N	\N	2026-03-07 10:27:52.717+00	2026-03-07 10:27:52.717+00	\N
aee096bb-0f5a-4ce5-a99f-a704fe2c4561	Mastrocola, Ken	\N	\N	2026-03-07 10:27:52.765+00	2026-03-07 10:27:52.765+00	\N
9f1056e8-0bf2-4022-9227-5beef691ba6f	Swaim, Tyler	\N	\N	2026-03-07 10:27:52.77+00	2026-03-07 10:27:52.77+00	\N
43afc396-73bd-4101-b936-fddb227e88e7	Ipswich Country Club	\N	\N	2026-03-07 10:27:52.777+00	2026-03-07 10:27:52.777+00	\N
6cae4540-91b8-44db-b213-0879cfd6d1c5	Hodgson, Ken	\N	\N	2026-03-07 10:27:52.784+00	2026-03-07 10:27:52.784+00	\N
2d2f35d5-6532-4881-803f-eb4aaa53015e	Albright, Bear	\N	\N	2026-03-07 10:27:52.792+00	2026-03-07 10:27:52.792+00	\N
ff94ac8e-547d-49c7-8496-3b1d7dd49e72	Seamonds, Ann	\N	\N	2026-03-07 10:27:52.795+00	2026-03-07 10:27:52.795+00	\N
ce037835-b413-42a5-bed6-a31369dfbf65	Lufkin, Chris	\N	\N	2026-03-07 10:27:52.813+00	2026-03-07 10:27:52.813+00	\N
c15ff011-2a20-45b7-9479-9363735b0511	Silk, Mike	\N	\N	2026-03-07 10:27:52.815+00	2026-03-07 10:27:52.815+00	\N
7c132671-30fc-4c36-b701-be30a38230c7	Goodspeed, Linda	\N	\N	2026-03-07 10:27:52.822+00	2026-03-07 10:27:52.822+00	\N
cc55ba37-35e3-4917-8128-6ff3000da51e	Williamson, Alexis	\N	\N	2026-03-07 10:27:52.836+00	2026-03-07 10:27:52.836+00	\N
e2ac858a-39dc-4384-8dbc-4efa666de014	Wright, Steven	\N	\N	2026-03-07 10:27:52.855+00	2026-03-07 10:27:52.855+00	\N
29b1c37b-50f7-416f-9ddc-89a511bcdd71	Giacalone Contracting & Development Corp	\N	\N	2026-03-07 10:27:52.861+00	2026-03-07 10:27:52.861+00	\N
c333f9c2-26f7-437a-b93a-7ac7d38811af	Pingree School	\N	\N	2026-03-07 10:27:52.874+00	2026-03-07 10:27:52.874+00	\N
4406f13b-12b2-49d3-89cf-79f296268221	Whitman, Peter	\N	\N	2026-03-07 10:27:52.878+00	2026-03-07 10:27:52.878+00	\N
30723735-214b-4e5e-8f21-fbfe9585717d	Dickson, Chris	\N	\N	2026-03-07 10:27:52.881+00	2026-03-07 10:27:52.881+00	\N
993a7b0b-0929-413c-856c-411c891872f5	Bartlett & Steadman Company Inc.	\N	\N	2026-03-07 10:27:52.906+00	2026-03-07 10:27:52.906+00	\N
80adb5fa-8c83-4b28-8e00-2cf1024fe8a6	Patti, Shawn	\N	\N	2026-03-07 10:27:52.915+00	2026-03-07 10:27:52.915+00	\N
c21a7196-753e-4fd6-a9aa-32cdf0b8d7f4	Doyle, Anne	\N	\N	2026-03-07 10:27:52.917+00	2026-03-07 10:27:52.917+00	\N
38417bfb-0d60-4465-8566-2013ac9e02e8	Swierzbin, Tim	\N	\N	2026-03-07 10:27:52.923+00	2026-03-07 10:27:52.923+00	\N
9756bd5c-bec2-4363-a02d-c64d53b7791c	YMCA	\N	\N	2026-03-07 10:27:52.93+00	2026-03-07 10:27:52.93+00	\N
746eef4b-6eaa-4728-8226-f687025bc034	Patel, Jagruti	\N	\N	2026-03-07 10:27:52.932+00	2026-03-07 10:27:52.932+00	\N
6b817aa2-56f1-414f-8337-bda964cdf8a6	AGJ Properties	\N	\N	2026-03-07 10:27:52.935+00	2026-03-07 10:27:52.935+00	\N
9f916661-f348-4bdb-a38c-396ff2308203	Hulse, Chris	\N	\N	2026-03-07 10:27:52.961+00	2026-03-07 10:27:52.961+00	\N
0f05d0c4-011f-46ee-97bd-3d641aab4de4	Disario, Donna	\N	\N	2026-03-07 10:27:52.976+00	2026-03-07 10:27:52.976+00	\N
c2c5b1b0-c5f4-47ab-9b9e-bf21ad256243	Plourde, Cindy	\N	\N	2026-03-07 10:27:52.986+00	2026-03-07 10:27:52.986+00	\N
d098b679-32c8-4ab5-bd86-50eb012dc4ee	Capodilupo, Paul	\N	\N	2026-03-07 10:27:52.991+00	2026-03-07 10:27:52.991+00	\N
a5b25efd-c16d-4086-8a8a-e54f5d24a0f4	Kettenbach, Cara	\N	\N	2026-03-07 10:27:52.994+00	2026-03-07 10:27:52.994+00	\N
543e2d5c-eba0-4978-b4fb-c76872391bcd	Gunn, Andrew	\N	\N	2026-03-07 10:27:52.997+00	2026-03-07 10:27:52.997+00	\N
56114546-c7cd-467a-b964-a6dc4fa8f669	Patrie, Steve	\N	\N	2026-03-07 10:27:52.999+00	2026-03-07 10:27:52.999+00	\N
81b38cf5-a4c9-480d-83f4-141c701f49b7	Seully, Mike	\N	\N	2026-03-07 10:27:53.002+00	2026-03-07 10:27:53.002+00	\N
df94e5be-a665-4360-9331-dd4c92f11ed0	Mitchell, Mary	\N	\N	2026-03-07 10:27:53.005+00	2026-03-07 10:27:53.005+00	\N
e8bf82f5-008c-47c5-9638-0a97ec2727c5	Herold, Jeffrey	\N	\N	2026-03-07 10:27:53.008+00	2026-03-07 10:27:53.008+00	\N
f1ef2376-689b-465a-860a-b8843c1165a9	Bonin, Richard	\N	\N	2026-03-07 10:27:53.011+00	2026-03-07 10:27:53.011+00	\N
2554775c-f895-4a60-a1ba-fb893c8c2eee	Sood, Sanjiv	\N	\N	2026-03-07 10:27:53.013+00	2026-03-07 10:27:53.013+00	\N
3dd4e1ac-0f87-40b8-b804-a8dfb1865764	Downers Bro Land	\N	\N	2026-03-07 10:27:53.016+00	2026-03-07 10:27:53.016+00	\N
a033e700-8c34-4238-853e-b3358cdd3e1d	Stropkay, Craig	\N	\N	2026-03-07 10:27:53.019+00	2026-03-07 10:27:53.019+00	\N
ba422a49-17b6-4cc1-a52e-3ae426fdb19e	Sheehan, Stacey	\N	\N	2026-03-07 10:27:53.021+00	2026-03-07 10:27:53.021+00	\N
c0019d16-2bd5-423d-9076-fde1e136a886	YMCA of the North Shore	\N	\N	2026-03-07 10:27:53.024+00	2026-03-07 10:27:53.024+00	\N
4bccd240-5d39-45fd-8c86-b829e41efb9a	Beaupre, Tom	\N	\N	2026-03-07 10:27:53.027+00	2026-03-07 10:27:53.027+00	\N
5707db0b-7e07-4647-a935-125458476d73	Tzortzis, Dean	\N	\N	2026-03-07 10:27:53.03+00	2026-03-07 10:27:53.03+00	\N
e99c9bed-0d2a-4ddd-a5b4-1f07a2a94ef0	Nolan, Janet	\N	\N	2026-03-07 10:27:53.032+00	2026-03-07 10:27:53.032+00	\N
d5e8ecaa-af56-49ed-8295-8ceb08e800f1	Campot, Peter	\N	\N	2026-03-07 10:27:53.035+00	2026-03-07 10:27:53.035+00	\N
1e14c8d2-80db-4021-b947-cda930fa3b6d	Buchanan, Joan	\N	\N	2026-03-07 10:27:53.037+00	2026-03-07 10:27:53.037+00	\N
8244a077-5bda-4725-b370-bc59892b5498	Matheson, Scott	\N	\N	2026-03-07 10:27:53.042+00	2026-03-07 10:27:53.042+00	\N
05e746d1-dd55-4fa4-a348-6ea35dc94498	Delorenzo, Kevin	\N	\N	2026-03-07 10:27:53.044+00	2026-03-07 10:27:53.044+00	\N
ce18a0f3-42f1-4e92-bde8-44bf763743f3	Soghomonian, Jacques	\N	\N	2026-03-07 10:27:53.047+00	2026-03-07 10:27:53.047+00	\N
6339b35d-d99d-4f29-9fe7-939d866b53b5	Sweeney, Richard	\N	\N	2026-03-07 10:27:53.049+00	2026-03-07 10:27:53.049+00	\N
1c9bd3fb-8b67-4202-b52b-d948bb5d1ded	Whitaker, Terry	\N	\N	2026-03-07 10:27:53.052+00	2026-03-07 10:27:53.052+00	\N
148b0686-fe64-4608-964d-24efd38e4834	Alexander, Doug	\N	\N	2026-03-07 10:27:53.054+00	2026-03-07 10:27:53.054+00	\N
30dc5065-8ff5-40f1-80a7-ebc341e439d5	McCarthy, Cornelius	\N	\N	2026-03-07 10:27:53.059+00	2026-03-07 10:27:53.059+00	\N
995baf47-21fe-48a2-adda-d513efe230d0	Darcus, Meagan	\N	\N	2026-03-07 10:27:53.061+00	2026-03-07 10:27:53.061+00	\N
41d81dbe-f5e8-4e5b-91e5-14d8ea961836	Franson, Kathy	\N	\N	2026-03-07 10:27:53.064+00	2026-03-07 10:27:53.064+00	\N
9d7d5266-4a30-4a36-9d4b-76c33a9b0eb6	Kepnes, Cara	\N	\N	2026-03-07 10:27:53.066+00	2026-03-07 10:27:53.066+00	\N
07471dc1-aa86-4a18-80ff-f3f040a00155	Nardone, Mark	\N	\N	2026-03-07 10:27:53.069+00	2026-03-07 10:27:53.069+00	\N
97e71aba-fb7a-4a47-bb29-4089100cd151	Robbins, Pete	\N	\N	2026-03-07 10:27:53.072+00	2026-03-07 10:27:53.072+00	\N
5a53890d-f7f8-4448-92ab-da8730c8858a	Welch, Margaret	\N	\N	2026-03-07 10:27:53.075+00	2026-03-07 10:27:53.075+00	\N
98cddb94-d6d8-4c2b-b6eb-9fba12046c3f	Peabody Housing Authority	\N	\N	2026-03-07 10:27:53.077+00	2026-03-07 10:27:53.077+00	\N
0bacbba0-98e8-42ae-936e-ab542cfa6bbe	Taggert, Janet	\N	\N	2026-03-07 10:27:53.08+00	2026-03-07 10:27:53.08+00	\N
42d0776d-5137-46c9-9c2d-9833174f1b1a	Feltault, Jerry	\N	\N	2026-03-07 10:27:53.083+00	2026-03-07 10:27:53.083+00	\N
5802dfe8-cf7f-45b7-9c25-fe9105375433	Dekermendjian, Dicken	\N	\N	2026-03-07 10:27:53.086+00	2026-03-07 10:27:53.086+00	\N
ad5163f0-ce1b-45cb-8d17-2a5f80278118	Jalal, El	\N	\N	2026-03-07 10:27:53.09+00	2026-03-07 10:27:53.09+00	\N
24c7b2c9-e65e-432c-90ec-c28610ffab0f	Linear Prop. MGMT	\N	\N	2026-03-07 10:27:53.096+00	2026-03-07 10:27:53.096+00	\N
b182a422-5db6-48e8-a63b-1587522970c1	Doody, Kathy	\N	\N	2026-03-07 10:27:53.099+00	2026-03-07 10:27:53.099+00	\N
17553d2c-a464-4af4-9a7f-2a2cd10dc37e	Johnson, Mark	\N	\N	2026-03-07 10:27:53.122+00	2026-03-07 10:27:53.122+00	\N
cf0af606-bd38-474c-8e20-478ae1306999	Rudenfeld, Louis	\N	\N	2026-03-07 10:27:53.127+00	2026-03-07 10:27:53.127+00	\N
c2f93cf8-d20a-486f-be84-d7968d31cd6c	Lahaie, Robbie	\N	\N	2026-03-07 10:27:53.131+00	2026-03-07 10:27:53.131+00	\N
841fc6c4-d66a-481d-85de-1d3fe6299829	Tyrrell, David	\N	\N	2026-03-07 10:27:53.135+00	2026-03-07 10:27:53.135+00	\N
23843822-1fd5-4b95-a534-15e2b71d9bdb	Flint, Margi	\N	\N	2026-03-07 10:27:53.138+00	2026-03-07 10:27:53.138+00	\N
1efc13d7-f679-42e9-a7ad-d4cdb3699f52	Sims, Doris	\N	\N	2026-03-07 10:27:53.143+00	2026-03-07 10:27:53.143+00	\N
451406dd-83b2-4b7d-b954-b14878b32f95	Kent, Jerry	\N	\N	2026-03-07 10:27:53.148+00	2026-03-07 10:27:53.148+00	\N
5a7feada-ddc1-4192-bca6-81523f5d17bb	Montecalvo, Paul	\N	\N	2026-03-07 10:27:53.152+00	2026-03-07 10:27:53.152+00	\N
c39948cc-15a6-409f-80d3-b5b6366e6b22	Cacciola, Natasha	\N	\N	2026-03-07 10:27:53.156+00	2026-03-07 10:27:53.156+00	\N
2e4b5850-c556-455b-a11e-9dcd950bec80	Perault, Jay	\N	\N	2026-03-07 10:27:53.16+00	2026-03-07 10:27:53.16+00	\N
41042843-3604-402c-b62b-7848e24186bd	Pearce, James	\N	\N	2026-03-07 10:27:53.168+00	2026-03-07 10:27:53.168+00	\N
474ac72c-9d54-408d-b352-530113bcaadf	Trembley, Cody	\N	\N	2026-03-07 10:27:53.171+00	2026-03-07 10:27:53.171+00	\N
8baa1b33-dcf3-493a-9df4-fd678362871c	Ambrosino, Lisa	\N	\N	2026-03-07 10:27:53.174+00	2026-03-07 10:27:53.174+00	\N
0ddf8275-2094-43d0-9540-17802c25feac	Curran, Tom	\N	\N	2026-03-07 10:27:53.177+00	2026-03-07 10:27:53.177+00	\N
3085c721-528c-47db-9000-9ffcf37edccb	Fleming, Alta	\N	\N	2026-03-07 10:27:53.181+00	2026-03-07 10:27:53.181+00	\N
fc2476f2-a086-4d2f-9291-f9c73eeab977	Galis, Michelle	\N	\N	2026-03-07 10:27:53.185+00	2026-03-07 10:27:53.185+00	\N
d311612b-69fc-4a6a-8f76-ae5c9c6b1683	Harris, Charlie	\N	\N	2026-03-07 10:27:53.187+00	2026-03-07 10:27:53.187+00	\N
5f227997-b1ea-4af1-8453-3bd58a4e98e3	Munyon, Derrick	\N	\N	2026-03-07 10:27:53.19+00	2026-03-07 10:27:53.19+00	\N
1a179bff-abfc-4ac1-9716-757de08fd85c	Trefry, Linda	\N	\N	2026-03-07 10:27:53.196+00	2026-03-07 10:27:53.196+00	\N
bb81600c-f5c5-450b-abb7-f75efec233cd	Zapolski, Isabel	\N	\N	2026-03-07 10:27:53.2+00	2026-03-07 10:27:53.2+00	\N
79b69641-99d0-475c-a783-ef2ad24017c7	Fahey, Maria	\N	\N	2026-03-07 10:27:53.203+00	2026-03-07 10:27:53.203+00	\N
89dce7c7-dd27-4230-b40a-8fd467dc8692	Far Corner Golf Course	\N	\N	2026-03-07 10:27:53.206+00	2026-03-07 10:27:53.206+00	\N
979cfd52-3528-43ce-9277-c98e43f48871	Stearns, Jeff	\N	\N	2026-03-07 10:27:53.209+00	2026-03-07 10:27:53.209+00	\N
d7d5a3f1-560c-41f6-92ba-5a08d1fdb6c3	Yight, Erbay	\N	\N	2026-03-07 10:27:53.213+00	2026-03-07 10:27:53.213+00	\N
d5567ff6-41b8-41a9-9885-6325e71ac27f	Firth, Rob	\N	\N	2026-03-07 10:27:53.216+00	2026-03-07 10:27:53.216+00	\N
d747ddd6-7347-4a47-b995-a5479da7c724	Signor, Dan	\N	\N	2026-03-07 10:27:53.218+00	2026-03-07 10:27:53.218+00	\N
dbeab6a9-2a04-483b-9d28-1ca352e2f67b	Larabell, Caroline	\N	\N	2026-03-07 10:27:53.221+00	2026-03-07 10:27:53.221+00	\N
e5c4bb06-f7ee-447a-88ac-dd9202fd56df	Sargent, Gina	\N	\N	2026-03-07 10:27:53.225+00	2026-03-07 10:27:53.225+00	\N
520468cd-695b-4042-bded-02c94efda4e2	McEachern, Glen	\N	\N	2026-03-07 10:27:53.229+00	2026-03-07 10:27:53.229+00	\N
2b9d47a4-cc4e-45e8-b1eb-8a390a7d5733	Swanson, Eric	\N	\N	2026-03-07 10:27:53.232+00	2026-03-07 10:27:53.232+00	\N
2fee6f7b-68d8-4997-bc86-ca9fd485281f	James, Travis	\N	\N	2026-03-07 10:27:53.235+00	2026-03-07 10:27:53.235+00	\N
14c05537-e5a9-481b-b890-d560b4c12111	Schmidt, Per	\N	\N	2026-03-07 10:27:53.238+00	2026-03-07 10:27:53.238+00	\N
be3b2910-3b34-496d-85bc-3db28ea5eb30	Crowninshield MGMT	\N	\N	2026-03-07 10:27:53.241+00	2026-03-07 10:27:53.241+00	\N
5dbfe694-660c-455c-a5cd-591854059869	Logan, Cirilla	\N	\N	2026-03-07 10:27:53.244+00	2026-03-07 10:27:53.244+00	\N
b63a1486-a359-4de5-9dd2-f214b8908afc	R.C. Marc-Aurele Corp. Landscaping	\N	\N	2026-03-07 10:27:53.248+00	2026-03-07 10:27:53.248+00	\N
f4738b13-f201-498c-ab78-952949c79d19	Sadoway, Stephen	\N	\N	2026-03-07 10:27:53.25+00	2026-03-07 10:27:53.25+00	\N
00cb29a0-4558-4e3c-815d-c58fbab85eb2	Manos Landscpaing	\N	\N	2026-03-07 10:27:53.253+00	2026-03-07 10:27:53.253+00	\N
d39758d2-4d4c-44c6-8525-bd2692c12132	Pickering, Kelly	\N	\N	2026-03-07 10:27:53.255+00	2026-03-07 10:27:53.255+00	\N
a6b42ba6-d8f6-411b-93a9-a8a3e15d1b95	Surette, Shane	\N	\N	2026-03-07 10:27:53.258+00	2026-03-07 10:27:53.258+00	\N
fb342d74-ee61-47e1-998d-4ed96e794ec0	Ferrandini, Mark	\N	\N	2026-03-07 10:27:53.262+00	2026-03-07 10:27:53.262+00	\N
4e2834c8-5c09-4ab2-be29-972057be0549	Harrington, Paul	\N	\N	2026-03-07 10:27:53.267+00	2026-03-07 10:27:53.267+00	\N
5c592a92-a455-4740-a365-e4957842e6a0	O'Brien, Melissa	\N	\N	2026-03-07 10:27:53.27+00	2026-03-07 10:27:53.27+00	\N
be542382-1dfb-48fd-ada9-4e2b89fb6ae2	Laky, Russ	\N	\N	2026-03-07 10:27:53.273+00	2026-03-07 10:27:53.273+00	\N
ac1d2ffa-623d-416d-9dda-3d75d91f252b	Roiter, Dana	\N	\N	2026-03-07 10:27:53.277+00	2026-03-07 10:27:53.277+00	\N
04c2927f-7b86-4c1c-9046-0bcef738ffa0	E.P Management	\N	\N	2026-03-07 10:27:53.28+00	2026-03-07 10:27:53.28+00	\N
456db9f0-9eff-4a70-856a-88b3820ac0ba	Castle, Rick	\N	\N	2026-03-07 10:27:53.283+00	2026-03-07 10:27:53.283+00	\N
0ea23fd4-83f7-4747-805a-f4a8b35fad4e	Egounis, Karen	\N	\N	2026-03-07 10:27:53.286+00	2026-03-07 10:27:53.286+00	\N
73971a74-51f0-4aa2-afbb-ce0967adc727	Berkowitz, Mickey	\N	\N	2026-03-07 10:27:53.291+00	2026-03-07 10:27:53.291+00	\N
a55e6cdf-4a5f-4fda-95bb-7818aba1c821	Evans, Tom	\N	\N	2026-03-07 10:27:53.294+00	2026-03-07 10:27:53.294+00	\N
e3c02ad3-3bb3-4aa3-85de-ca3a600c4afc	Jacobsen, Bree	\N	\N	2026-03-07 10:27:53.297+00	2026-03-07 10:27:53.297+00	\N
fe0055af-e9f5-46a8-b43d-c29cc902f052	Martin, Sean	\N	\N	2026-03-07 10:27:53.301+00	2026-03-07 10:27:53.301+00	\N
539a13a2-8e0c-4064-b1b3-5c65e3211cc4	Mcnulty, Tom	\N	\N	2026-03-07 10:27:53.304+00	2026-03-07 10:27:53.304+00	\N
b8db8406-386f-47ee-b564-82dfd8c82c9d	Cavanaugh,Patty	\N	\N	2026-03-07 10:27:53.307+00	2026-03-07 10:27:53.307+00	\N
9051a429-29f5-4fc2-ab57-f4442e5b6c4b	Snietka, Nick	\N	\N	2026-03-07 10:27:53.313+00	2026-03-07 10:27:53.313+00	\N
77a583c1-2698-4b8d-b84a-7a3ef74b4bf1	Brooks & Hill Custom Builders	\N	\N	2026-03-07 10:27:53.317+00	2026-03-07 10:27:53.317+00	\N
2d267484-2fbd-4314-abf6-e22afc205aa9	Tilson, Thomas	\N	\N	2026-03-07 10:27:53.32+00	2026-03-07 10:27:53.32+00	\N
764354fe-d22c-4dbc-ad20-20b6879ef8bb	Town of W. Newbury	\N	\N	2026-03-07 10:27:53.322+00	2026-03-07 10:27:53.322+00	\N
660be50b-3e35-4d15-aced-4675d27f4d44	Mihels	\N	\N	2026-03-07 10:27:53.328+00	2026-03-07 10:27:53.328+00	\N
9fd15d93-63a1-4026-bd58-fe58b41d172c	Shea, Pat	\N	\N	2026-03-07 10:27:53.331+00	2026-03-07 10:27:53.331+00	\N
4ecca04f-79d5-4d14-abc7-0b4d6dc31107	Zemlin, Ray& Nancy	\N	\N	2026-03-07 10:27:53.334+00	2026-03-07 10:27:53.334+00	\N
f4648b4b-d266-4448-9b8b-64a8d93261cf	Kerner, Jonathan	\N	\N	2026-03-07 10:27:53.337+00	2026-03-07 10:27:53.337+00	\N
b3f852d6-fda5-48ee-af42-aa837e17823f	Jancek, Matthew	\N	\N	2026-03-07 10:27:53.345+00	2026-03-07 10:27:53.345+00	\N
467d429e-3341-417b-8f9b-e8ea1caabc42	Bhuju, Babesh	\N	\N	2026-03-07 10:27:53.35+00	2026-03-07 10:27:53.35+00	\N
3df44978-c236-400c-9304-b2d3887ffbd4	Arabatli, Vache	\N	\N	2026-03-07 10:27:53.353+00	2026-03-07 10:27:53.353+00	\N
7f6c0ecd-eecc-45ee-a442-a29d48806861	Chittim, Jennifer	\N	\N	2026-03-07 10:27:53.357+00	2026-03-07 10:27:53.357+00	\N
a3065881-cc8b-4088-8593-c6c5ce28e335	JC Grounds	\N	\N	2026-03-07 10:27:53.361+00	2026-03-07 10:27:53.361+00	\N
83261914-5762-4fb1-9bd0-d653a99922f5	Zitano, Edward	\N	\N	2026-03-07 10:27:53.164+00	2026-03-11 18:28:03.655+00	\N
224bcfe3-0b51-4698-b783-710487a6d569	Dimare, Eric	\N	\N	2026-03-07 10:27:53.326+00	2026-03-11 20:27:39.806+00	\N
dd1517ae-9b8d-49f9-96c0-a04dc7a929ed	Morando, Jimmy	\N	\N	2026-03-07 10:27:53.311+00	2026-03-11 20:27:54.801+00	\N
1c30f500-a1c9-44a4-a9d8-40361c5e76ab	Gibilaro, Gregory	\N	\N	2026-03-07 10:27:51.268+00	2026-03-11 20:28:16.153+00	\N
476093aa-e87b-483e-8480-2dfaccdfed48	Kaplin, Mike	\N	\N	2026-03-07 10:27:52.301+00	2026-03-11 20:28:22.312+00	\N
\.


--
-- TOC entry 3845 (class 0 OID 66200)
-- Dependencies: 223
-- Data for Name: estimate_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estimate_history (id, job_id, changed_by_user_id, changed_at, previous_amount_dollars, new_amount_dollars, previous_estimate_hours, new_estimate_hours, note, deleted_at) FROM stdin;
\.


--
-- TOC entry 3858 (class 0 OID 66322)
-- Dependencies: 236
-- Data for Name: foreman_day_roster_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foreman_day_roster_members (id, roster_id, date, person_resource_id, role, created_at, deleted_at) FROM stdin;
f89fabe3-7059-4414-a670-0ff6c060a80c	9e855cf5-b24b-4790-964d-f24b30ae0746	2026-03-03	76217552-ef4d-4eae-9329-cc724a1ed0aa	GROUND	2026-03-06 17:59:52.002+00	\N
4a8669b4-e978-4f62-897d-e7b4bc4e97b1	3f8c8731-b3ba-47e2-a846-a6185073245c	2026-03-03	5d8b2708-12b3-4cc0-ab03-b7d4a034f295	GROUND	2026-03-06 17:59:50.343+00	\N
c8ede12b-3e4d-4a7e-8541-6b059c8a06c0	b2fa5759-1c74-4980-bbec-98c792bba119	2026-03-03	4a5d6743-29bf-44c6-b5c0-4a3627959262	GROUND	2026-03-06 17:59:50.343+00	\N
215566ee-fa7f-4817-b849-50e3808dda61	8baab01b-113a-4d7e-b866-aebd85217de8	2026-03-03	0ffc42d1-d244-48b9-b7c5-0941637329d5	CLIMBER	2026-03-06 17:59:50.343+00	\N
d2871eec-e818-48e1-8bf2-0b518a857dcd	3f8c8731-b3ba-47e2-a846-a6185073245c	2026-03-03	c678c23f-4f46-46ab-a948-1287ad717b0c	CLIMBER	2026-03-06 17:59:50.343+00	\N
beb011ad-6df1-47e7-806f-7d7a66123967	b2fa5759-1c74-4980-bbec-98c792bba119	2026-03-03	ccae4d6d-aced-4baf-a96a-cf6d3031ed73	CLIMBER	2026-03-06 17:59:50.343+00	\N
da7cd367-3af5-43d2-b6f9-366b52c26ea5	8baab01b-113a-4d7e-b866-aebd85217de8	2026-03-03	c38b3ec9-7414-44de-a5c9-234a00b08551	GROUND	2026-03-06 17:59:50.343+00	\N
df9ebd9d-bd06-4e7e-93fd-9dc04227022f	ed335749-23c4-45e0-9223-0779014596ff	2026-03-03	a09741d8-37ba-4bb8-81c3-e3494753d572	GROUND	2026-03-06 17:59:50.343+00	\N
6496cdc8-343d-4c9d-a43a-27ee125c6be5	ed335749-23c4-45e0-9223-0779014596ff	2026-03-03	5765dcf3-7be4-45c6-9ae1-84cd1e0a7bf1	CLIMBER	2026-03-06 17:59:50.343+00	\N
\.


--
-- TOC entry 3857 (class 0 OID 66313)
-- Dependencies: 235
-- Data for Name: foreman_day_rosters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foreman_day_rosters (id, date, foreman_person_id, home_base_id, preferred_start_time, preferred_end_time, notes, created_by_user_id, created_at, updated_at, preferred_start_minute, preferred_end_minute, deleted_at) FROM stdin;
8baab01b-113a-4d7e-b866-aebd85217de8	2026-03-03	84745f0b-85ce-492d-9460-70551f132780	007f9821-f0f1-4e81-85f1-088a13015858	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.339+00	2026-03-06 17:59:50.339+00	420	960	\N
ed335749-23c4-45e0-9223-0779014596ff	2026-03-03	bb3e098c-d85e-43a7-9014-c1951c019dff	9448de2b-c229-4960-a0a3-a6d965c02a27	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.339+00	2026-03-06 17:59:50.339+00	420	960	\N
3f8c8731-b3ba-47e2-a846-a6185073245c	2026-03-03	6fca4882-85f1-4b89-8b24-f7b3757202b6	007f9821-f0f1-4e81-85f1-088a13015858	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.339+00	2026-03-06 17:59:50.339+00	420	960	\N
b2fa5759-1c74-4980-bbec-98c792bba119	2026-03-03	1a004204-5c0b-4b0a-bcbc-452e450da45f	9448de2b-c229-4960-a0a3-a6d965c02a27	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.339+00	2026-03-06 17:59:50.339+00	420	960	\N
9e855cf5-b24b-4790-964d-f24b30ae0746	2026-03-03	18bc7f63-8666-459e-b180-f977c68197f3	87533035-d342-419b-85c3-112378e3e650	\N	\N	\N	cf9b9684-5d14-4a6d-81aa-0b1c63af19db	2026-03-06 17:59:51.997+00	2026-03-06 17:59:51.997+00	\N	\N	\N
0fc35c7d-0663-406f-886f-768ee5e9d360	2026-03-03	e14b6897-1152-40d8-97b2-829c1dc6ea85	87533035-d342-419b-85c3-112378e3e650	\N	\N	\N	cf9b9684-5d14-4a6d-81aa-0b1c63af19db	2026-03-06 17:59:52+00	2026-03-06 17:59:52+00	\N	\N	\N
486d8298-d149-4396-82db-496d331b61b8	2026-03-09	18bc7f63-8666-459e-b180-f977c68197f3	87533035-d342-419b-85c3-112378e3e650	\N	\N	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:58:25.091+00	2026-03-10 00:58:25.091+00	\N	\N	\N
b797b156-1e69-4e56-b2ec-5c4c594c447f	2026-03-10	bb3e098c-d85e-43a7-9014-c1951c019dff	87533035-d342-419b-85c3-112378e3e650	\N	\N	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:23.594+00	2026-03-10 23:38:23.594+00	\N	\N	\N
b2791150-9976-4616-bb95-9bab215d6386	2026-03-11	bb3e098c-d85e-43a7-9014-c1951c019dff	007f9821-f0f1-4e81-85f1-088a13015858	\N	\N	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:51.834+00	2026-03-11 19:20:51.834+00	\N	\N	\N
ac04c969-2738-4153-a813-2cd3113f8459	2026-03-11	84745f0b-85ce-492d-9460-70551f132780	007f9821-f0f1-4e81-85f1-088a13015858	\N	\N	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:59.972+00	2026-03-11 19:20:59.972+00	\N	\N	\N
e97da361-77b6-4595-ac17-5bd11d52b9db	2026-03-11	6fca4882-85f1-4b89-8b24-f7b3757202b6	007f9821-f0f1-4e81-85f1-088a13015858	\N	\N	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:06.944+00	2026-03-11 19:21:06.944+00	\N	\N	\N
\.


--
-- TOC entry 3856 (class 0 OID 66303)
-- Dependencies: 234
-- Data for Name: home_bases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.home_bases (id, name, address_line1, address_line2, city, state, postal_code, opening_time, closing_time, active, created_at, updated_at, opening_minute, closing_minute, deleted_at) FROM stdin;
9448de2b-c229-4960-a0a3-a6d965c02a27	Iron Tree - Natick	22 North Main St	\N	Natick	MA	01760	\N	\N	t	2026-03-06 17:59:50.303+00	2026-03-06 17:59:50.303+00	300	1140	\N
87533035-d342-419b-85c3-112378e3e650	E2E Base 1772819991966	1 Test Way	\N	Albany	NY	12207	\N	\N	t	2026-03-06 17:59:51.988+00	2026-03-10 23:59:47.195+00	\N	\N	2026-03-10 23:59:47.193+00
007f9821-f0f1-4e81-85f1-088a13015858	Iron Tree - Beverly	64 Dunham Rd.	\N	Beverly	MA	01915	\N	\N	t	2026-03-06 17:59:50.303+00	2026-03-11 20:17:57.492+00	300	1140	\N
\.


--
-- TOC entry 3865 (class 0 OID 66377)
-- Dependencies: 243
-- Data for Name: import_row_maps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.import_row_maps (id, import_run_id, sheet_name, row_number, entity_type, entity_id, raw_row_json, created_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3864 (class 0 OID 66369)
-- Dependencies: 242
-- Data for Name: import_runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.import_runs (id, started_at, finished_at, run_by_user_id, source_filename, status, summary_json, deleted_at) FROM stdin;
\.


--
-- TOC entry 3861 (class 0 OID 66346)
-- Dependencies: 239
-- Data for Name: job_access_constraints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_access_constraints (id, job_id, access_constraint_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 3853 (class 0 OID 66273)
-- Dependencies: 231
-- Data for Name: job_blockers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_blockers (id, job_id, blocker_reason_id, status, notes, created_by_user_id, created_at, cleared_at, cleared_by_user_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 3862 (class 0 OID 66352)
-- Dependencies: 240
-- Data for Name: job_preferred_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_preferred_channels (id, job_id, channel, deleted_at) FROM stdin;
\.


--
-- TOC entry 3844 (class 0 OID 66183)
-- Dependencies: 222
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, customer_id, equipment_type, sales_rep_code, job_site_address, town, completed_date, completed_by_user_id, completion_notes, amount_dollars, estimate_hours_current, travel_hours_estimate, approval_date, approval_call, confirmed_text, confirmed_by_user_id, confirmed_at, crane_model_suitability, requires_spider_lift, winter_flag, frozen_ground_flag, notes_raw, notes_last_parsed_at, notes_parse_confidence, push_up_if_possible, must_be_first_job, preferred_start_time, preferred_end_time, availability_notes, no_email, contact_allowed, contact_owner_user_id, contact_instructions, access_notes, created_at, updated_at, preferred_start_minute, preferred_end_minute, deleted_at, estimate_id, has_climb, is_signed, has_stump_language, stump_language, import_source, import_row, unable, linked_equipment_note, linked_job_id) FROM stdin;
2a5c821d-4046-4561-a813-28f14730fda1	43b4153b-6106-428f-a965-9d870e4fc65e	CRANE	UNASSIGNED	12 Whittier Rd.	Haverhill	\N	\N	\N	6900.00	6.50	0.00	2025-10-28	\N	V, E 1/28*	\N	\N	MODEL_1060	f	f	f	RS 4/6                                                                     WANTS AN APRIL DATE                                               TBRS 1/28-WEATHER                                                       DTL                                        PREFERS AL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.858+00	2026-03-07 10:27:50.858+00	\N	\N	\N	\N	f	t	f	\N	CRANE	9	f	\N	\N
dbb2717a-ff7d-4a06-a6eb-a4fcbb2c8ada	56b69d3a-40d6-47ea-89be-3065ed84517c	CRANE	UNASSIGNED	443 Salem St	Salem	\N	\N	\N	4500.00	4.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.386+00	2026-03-06 17:59:50.386+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
4504bfd3-9382-409c-9688-ee48d4b6c1c2	67e39435-c6d3-4662-9c26-0f5f099099a4	BUCKET	UNASSIGNED	678 Needham St	Needham	\N	\N	\N	800.00	2.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.389+00	2026-03-06 17:59:50.389+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
ad5b7b42-f4fb-48ae-905b-d59fb59d3df8	543e2d5c-eba0-4978-b4fb-c76872391bcd	CRANE	UNASSIGNED	35 Estabrook Rd.	Swampscott	\N	\N	\N	2650.00	2.50	0.00	2023-05-17	E 5/17	\N	\N	\N	MODEL_1060	f	f	f	NEEDS ACCESS AND PERMISSION FROM REARNEIGHBOR FOR #1                                            NEEDS PERMISISON FROM RIGHT NEIGHBOR FOR #2                             NEEDS FENCE REMOVED TO GRIND THE STUMP FULLY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.997+00	2026-03-07 10:27:52.997+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	5	f	\N	\N
be3ba9e1-cdec-4dd1-84de-da2c6cb14ece	56114546-c7cd-467a-b964-a6dc4fa8f669	CRANE	UNASSIGNED	22 Betty Terr.	Lynn	\N	\N	\N	3450.00	3.00	0.00	2023-05-19	E 5/19	\N	\N	\N	MODEL_1060	f	f	f	NEED PERMISSION FROM LEFT AND REAR NEIGHBOR                           …...BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53+00	2026-03-07 10:27:53+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	6	f	BUCKET	\N
8c7568bd-ea33-4ebd-b98a-3b453386361e	df94e5be-a665-4360-9331-dd4c92f11ed0	CRANE	UNASSIGNED	55 Front Nine Dr.	Haverhill	\N	\N	\N	2000.00	2.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.006+00	2026-03-07 10:27:53.006+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	8	f	\N	\N
9a879b8b-c594-409c-997c-98fa5a84a2e9	e8bf82f5-008c-47c5-9638-0a97ec2727c5	CRANE	UNASSIGNED	17 Putney Ln.	Lynnfield	\N	\N	\N	3850.00	4.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.009+00	2026-03-07 10:27:53.009+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	9	f	\N	\N
4989006b-bcba-477c-bde4-9d995b060bf6	2554775c-f895-4a60-a1ba-fb893c8c2eee	CRANE	UNASSIGNED	5 Endicott Rd.	Andover	\N	\N	\N	2400.00	2.00	0.00	2023-05-23	\N	\N	\N	\N	MODEL_1090	f	f	f	... BUCKET ALSO                                         NEEDS PERMISISON FROM LEFT NEIGHBOR	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.014+00	2026-03-07 10:27:53.014+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	11	f	BUCKET	\N
40498ba1-3515-4821-bad5-851c905ba955	3dd4e1ac-0f87-40b8-b804-a8dfb1865764	CRANE	UNASSIGNED	10 Primrose Way	Haverhill	\N	\N	\N	2800.00	2.50	0.00	2023-05-23	\N	\N	\N	\N	MODEL_1060	f	f	f	… BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.017+00	2026-03-07 10:27:53.017+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	12	f	BUCKET	\N
299224c9-1d86-47df-a3c5-226839358324	b424c7b2-fb5a-4437-8775-e4539463626a	CRANE	ANTHONY	185 Ipswich Road	Boxford	\N	\N	\N	0.00	1.00	0.00	2025-11-25	\N	S, E 1/30	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.881+00	2026-03-07 10:27:50.881+00	\N	\N	\N	\N	f	f	f	\N	CRANE	21	f	\N	\N
ce58e9bf-aa4a-49a2-8f09-8e380db33695	76a133d6-e7a5-41af-8f65-a0b9fc4d3409	CRANE	ANTHONY	16 Newhall Lane	Nbpt	\N	\N	\N	1500.00	1.50	0.00	2026-01-14	\N	V, E 1/16*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.887+00	2026-03-07 10:27:50.887+00	\N	\N	\N	\N	f	f	t	YES	CRANE	22	f	\N	\N
18cc9f8a-844f-4eb3-a322-5e747f7859e5	9e3955b6-4ae6-4712-b785-4d1d2474c095	CRANE	ANTHONY	113 Emerald Street	Malden	\N	\N	\N	2000.00	2.00	0.00	2025-12-17	\N	DS	\N	\N	EITHER	f	f	f	RS FOR 3/2                              CAN'T BE A TUESDAY                       TBRS FROM 1/20 - STUCK IN NH AND CAN'T GET DOWN TO PLOW PROPERTY IN TIME	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.905+00	2026-03-07 10:27:50.905+00	\N	\N	\N	\N	f	f	f	\N	CRANE	23	f	\N	\N
db1fc577-2305-4058-99eb-6571cc51ab6f	3deab94c-b660-49f7-93cf-68bca325e940	CRANE	ANTHONY	6 Horseshoe Lane	Hamilton	\N	\N	\N	2500.00	2.50	0.00	2026-02-22	\N	V, E       3/12	\N	\N	MODEL_1060	f	f	f	NEED WRITTEN	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.911+00	2026-03-07 10:27:50.911+00	\N	\N	\N	\N	f	t	f	\N	CRANE	24	f	\N	\N
ef46498f-dfa9-42e1-b669-7ad8204239ee	c2dc3cbf-d031-4590-9dae-eb4709c5f3d1	CRANE	ANTHONY	7 Boyles St.	Beverly	\N	\N	\N	3200.00	3.00	0.00	2026-02-26	\N	DS	\N	\N	MODEL_1060	f	f	f	W/ DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.922+00	2026-03-07 10:27:50.922+00	\N	\N	\N	\N	f	t	f	\N	CRANE	26	f	\N	\N
b39f59fc-645a-4e2d-a352-57a901f71009	b7b2466f-54a3-4128-9a3a-ec04cdfde1c4	CRANE	ANTHONY	34 Orchard Street	Gloucester	\N	\N	\N	3000.00	3.00	0.00	2025-10-30	\N	S, E 2/2	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/26 DUE TO WEATHER                                                          TO BE DONE W/ SAL PIAZZA                                   CARS MUST BE MOVED ON ENTIRE STREET (DEAD END)	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.928+00	2026-03-07 10:27:50.928+00	\N	\N	\N	\N	f	t	f	\N	CRANE	27	f	\N	\N
035053e8-7490-4b3f-a7ad-0202dd3c37cd	cea7168a-046f-4fcd-be7a-04900a005719	CRANE	ANTHONY	9 One Salem Street	S'scott	\N	\N	\N	0.00	3.00	0.00	2025-11-11	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.935+00	2026-03-07 10:27:50.935+00	\N	\N	\N	\N	f	f	f	\N	CRANE	28	f	\N	\N
f8168e0a-ed61-43e4-bffa-5329be56a478	47288e6e-45d4-4993-832c-9e4688d76113	CRANE	ANTHONY	36 Orchard Street	Gloucester	\N	\N	\N	3500.00	3.50	0.00	2025-10-30	\N	S, E 3/5	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/26 DUE TO WEATHER                                     TO BE DONE W/ CHRIS LOWE                                    CARS MUST BE MOVED ON ENTIRE STREET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.941+00	2026-03-07 10:27:50.941+00	\N	\N	\N	\N	f	f	f	\N	CRANE	29	f	\N	\N
704e1330-9bd5-4837-a15d-c3bccfb8144f	3bfcb4cd-7ac4-4a15-bff9-6a6ecba8d58c	CRANE	ANTHONY	13 Poplar St	Ipswich	\N	\N	\N	3700.00	3.75	0.00	2026-02-02	\N	S 2/4	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.947+00	2026-03-07 10:27:50.947+00	\N	\N	\N	\N	f	t	f	\N	CRANE	30	f	\N	\N
7b07bd55-de88-48df-816b-e54b92f6610e	465de2cd-3a02-4d42-8028-7cbdf5d88eaa	CRANE	ANTHONY	58 Standley Street	Beverly	\N	\N	\N	4500.00	4.00	0.00	2025-03-19	\N	DS	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.953+00	2026-03-07 10:27:50.953+00	\N	\N	\N	\N	f	t	f	\N	CRANE	31	f	\N	\N
3d7ae2ad-038c-4e7d-980d-6e142273cb0d	6358e372-c503-4082-b7fa-c3ccefff6871	CRANE	ANTHONY	180 Hemenway Road	Framingham	\N	\N	\N	4000.00	4.00	0.00	2026-02-17	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.958+00	2026-03-07 10:27:50.958+00	\N	\N	\N	\N	f	t	f	\N	CRANE	32	f	\N	\N
c291010f-dad9-4c97-b067-3781494d4a10	b1f593cf-6ad0-4fb8-81d6-56f1d9670667	CRANE	ANTHONY	345 Concord St	Gloucester	\N	\N	\N	5500.00	5.00	0.00	2025-11-20	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.968+00	2026-03-07 10:27:50.968+00	\N	\N	\N	\N	f	t	f	\N	CRANE	34	f	\N	\N
de920ee7-159b-4aca-b290-8d36e7f402b0	2810a043-7aa9-4eea-bf45-288c3c89bb8f	CRANE	ANTHONY	3 Thomas Road	Danvers	\N	\N	\N	6000.00	6.50	0.00	2025-08-03	\N	DS	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.972+00	2026-03-07 10:27:50.972+00	\N	\N	\N	\N	f	f	f	\N	CRANE	35	f	\N	\N
fbca8ea8-12d6-41f6-9390-c1c41d84c64f	987278b4-a7f7-46e4-8ec5-ca7e8447cfbe	CRANE	ANTHONY	231 Main Street	Groveland	\N	\N	\N	6500.00	6.50	0.00	2026-01-23	E 1/23	S, E 1/23	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.975+00	2026-03-07 10:27:50.975+00	\N	\N	\N	\N	f	t	f	\N	CRANE	36	f	\N	\N
84b77bec-855b-4f73-88ce-95e112ec1e67	52b453b6-9266-4375-870b-88dc8aaa3eb9	CRANE	ANTHONY	44 Lothrop St	Beverly	\N	\N	\N	7000.00	7.00	0.00	2026-02-26	\N	S, E      2/25*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.98+00	2026-03-07 10:27:50.98+00	\N	\N	\N	\N	f	f	f	\N	CRANE	37	f	\N	\N
bfe401f9-affe-4490-b03f-3abcc1ed916b	e17d485c-d565-4592-828d-65b68e4e5618	CRANE	ANTHONY	55 Herrick Rd	Boxford	\N	\N	\N	7500.00	7.50	0.00	2026-02-06	\N	DS	\N	\N	MODEL_1060	f	f	f	NO EMAIL OR PHONE #	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.984+00	2026-03-07 10:27:50.984+00	\N	\N	\N	\N	f	t	f	\N	CRANE	38	f	\N	\N
26cc7895-944f-42bb-bf24-7b3a25fdc42a	fdecbe0e-16f5-4160-bae4-fcdf00640c7b	CRANE	ANTHONY	69 Forest Street	Mbts	\N	\N	\N	0.00	8.00	0.00	2025-09-26	\N	S, E 1/8	\N	\N	MODEL_1060	f	t	f	…BUCKET ALSO                              DS HANDLE ALL                                                LATE WINTER EARLY SPRING	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.989+00	2026-03-07 10:27:50.989+00	\N	\N	\N	\N	f	t	f	\N	CRANE	39	f	BUCKET	\N
94d96c54-49f9-4a95-9dd9-57cddef404ad	b1fceb64-126c-4c0f-83e5-b1a1099a71b9	CRANE	ANTHONY	7 Circle St	Marblehead	\N	\N	\N	3000.00	8.00	0.00	2026-01-21	\N	DS	\N	\N	MODEL_1060	f	f	f	RENTAL                                             TO BE DONE  MARCH 17TH OR 18TH	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.993+00	2026-03-07 10:27:50.993+00	\N	\N	\N	\N	f	t	f	\N	CRANE	40	f	\N	\N
563c08a7-993a-418e-b8c4-ee15cfa8597f	abae1162-c276-4a61-89f8-dd72d2902dda	CRANE	ANTHONY	44 Jersey Street	M'head	\N	\N	\N	2500.00	2.50	0.00	2025-11-14	\N	S, E 2/4	\N	\N	EITHER	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.763+00	2026-03-07 10:27:50.763+00	\N	\N	\N	\N	f	f	f	\N	CRANE	2	f	\N	\N
818c8b49-2b16-4bc4-b9b2-d9657da51c1c	7e843fc5-410e-4ca0-a5f1-1c0099ca6065	CRANE	ANTHONY	Bartletts Reach Rd	Amesbury	\N	\N	\N	2000.00	3.00	0.00	2025-10-17	\N	V, E 1/16	\N	\N	MODEL_1090	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.916+00	2026-03-07 10:27:50.916+00	\N	\N	\N	\N	f	t	f	\N	CRANE	25	f	\N	\N
551df28b-d6cd-4014-b990-a6af6f2a9f6d	047de35c-6e24-425c-839f-87433af5eaf9	CRANE	ANTHONY	529 Washington Street	Winchester	\N	\N	\N	4200.00	3.50	0.00	2025-11-22	\N	S, E 2/2	\N	\N	MODEL_1090	f	f	f	RS 3/9                                      TBRS 2/3-THINKS SNOW IS IN THE WAY AND WANTS TO RESCHEDULE                          W/ DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.8+00	2026-03-07 10:27:50.8+00	\N	\N	\N	\N	f	f	f	\N	CRANE	4	f	\N	\N
a295e7d4-8d64-4e81-8c6e-3201e6e2bbee	80ec846d-c496-4747-9171-e97fa33abebf	CRANE	ANTHONY	17 Baker Road	Salisbury	\N	\N	\N	8000.00	8.00	0.00	2025-10-06	\N	V, E 1/30*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.999+00	2026-03-07 10:27:50.999+00	\N	\N	\N	\N	f	f	f	\N	CRANE	41	f	\N	\N
7fbf066b-f950-4969-99f8-7e59ec3d3d91	c063bac3-34f8-4bda-a3ac-10f9ed7a28d6	CRANE	ANTHONY	38 Coppermine Road	Topsfield	\N	\N	\N	7500.00	8.00	0.00	2026-02-22	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.004+00	2026-03-07 10:27:51.004+00	\N	\N	\N	\N	f	t	f	\N	CRANE	42	f	\N	\N
0f943289-8d26-41bb-bee5-62ed9336e681	026f25b1-ef1a-4edc-b91d-48ee4a6feefb	CRANE	ANTHONY	140 Hart Street	Beverly	\N	\N	\N	0.00	12.00	0.00	2025-09-07	\N	DS	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.008+00	2026-03-07 10:27:51.008+00	\N	\N	\N	\N	f	f	f	\N	CRANE	43	f	\N	\N
1808f2b1-083e-4e53-b44f-72471bfcf010	218f97ce-95ea-453c-8d8e-516d3bfb6336	CRANE	ANTHONY	22 Paradise Rd.	Ipswich	\N	\N	\N	2000.00	2.00	0.00	2025-10-14	\N	\N	\N	\N	MODEL_1060	f	f	t	…BUCKET ALSO                         SNOW COVERED OR FROZEN GROUND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.013+00	2026-03-07 10:27:51.013+00	\N	\N	\N	\N	f	t	f	\N	CRANE	44	f	BUCKET	\N
c023f3c0-97bc-45d3-bff8-41ce198f39f1	9b886e71-48bc-4f68-ba24-09c4f0594a75	CRANE	ANTHONY	233 Essex Street	Hamilton	\N	\N	\N	3700.00	3.00	0.00	2026-02-25	\N	\N	\N	\N	MODEL_1060	f	f	f	ASAP	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.016+00	2026-03-07 10:27:51.016+00	\N	\N	\N	\N	f	t	f	\N	CRANE	45	f	\N	\N
c4ae82fc-8a47-4f38-a36e-1d2894c10417	dd707c0e-ad6e-408c-ba04-ddfa9b08a697	CRANE	DENNIS	25 Macarthur Rd	Natick	\N	\N	\N	4800.00	4.00	0.00	2025-11-07	\N	S, E 1/28	\N	\N	MODEL_1090	f	f	f	APRIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.02+00	2026-03-07 10:27:51.02+00	\N	\N	\N	\N	f	f	f	\N	CRANE	54	f	\N	\N
c964a7dd-a5bd-4b72-bae7-e5ebf453cff6	f71de4ad-3597-4294-8c76-cf2dcbdf4a6b	CRANE	DENNIS	478 Washington Street	Wellesley	\N	\N	\N	5000.00	4.00	0.00	2026-02-19	\N	V, E          2/20*	\N	\N	MODEL_1060	f	f	f	EXTRA SPIDER LINES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.024+00	2026-03-07 10:27:51.024+00	\N	\N	\N	\N	f	t	t	YES	CRANE	55	f	\N	\N
195b2172-ef38-4895-8f5a-244ca9b08e32	e2fbdce6-3337-4023-88d8-0612a3581835	CRANE	DENNIS	15 Magazine Street	Cambridge	\N	\N	\N	7800.00	4.50	0.00	2026-01-29	\N	S, E 2/2	\N	\N	MODEL_1060	f	f	f	DTL                                               CBP                                                  MAY HAVE GRINDER LIFT +1HR                            TREE PERMIT NEEDED	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.029+00	2026-03-07 10:27:51.029+00	\N	\N	\N	\N	f	f	f	\N	CRANE	56	f	\N	\N
a5e61c7b-137d-490e-a925-01510083256a	7bc7b252-2d5d-45ab-a1d2-6d98baecb50d	CRANE	DENNIS	465 Waverly Oaks Road	Westborough	\N	\N	\N	7500.00	4.50	0.00	2025-12-01	\N	S, E      2/25*	\N	\N	MODEL_1060	f	f	f	RS 3/4                                       TBRS FROM 2/24 DUE TO WEATHER                                   BAGSTER                                               PO NEEDED	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.037+00	2026-03-07 10:27:51.037+00	\N	\N	\N	\N	f	t	f	\N	CRANE	57	f	\N	\N
02ab6366-5948-48d5-b59e-c4dd0f90e52a	9c0dbcb0-f88e-4916-bf49-08e06db1067e	CRANE	DENNIS	121 Forest Street	Wellesley	\N	\N	\N	6200.00	5.00	0.00	2025-10-30	\N	V, E 1/28	\N	\N	MODEL_1060	f	f	f	RS 3/24                                             TBRS FROM 1/27 DUE TO WEATHER, WANTS TO WAIT UNTIL MARCH                                                   DETAIL                                    2 SETUPS	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.045+00	2026-03-07 10:27:51.045+00	\N	\N	\N	\N	f	f	f	\N	CRANE	58	f	\N	\N
902c0b99-3b4a-4eb3-93a9-227288bbf263	a58615ab-5af1-4302-9dae-fdfe903888c0	CRANE	DENNIS	30 Adams Avenue	Watertown	\N	\N	\N	8700.00	6.50	0.00	2025-12-02	\N	S, E 2/25*	\N	\N	MODEL_1090	f	f	f	RS 3/3                                               TBRS FROM 2/24 DUE TO WEATHER                           MUST HAVE DETAIL                          CREW SHOULD PUT 111 STONELEIGH RD INTO GPS                                                            CLIENT RESPONSIBLE FOR INFORMING NEIGHBOR OF DRIVEWAY BLOCKAGE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.053+00	2026-03-07 10:27:51.053+00	\N	\N	\N	\N	f	t	t	YES	CRANE	59	f	\N	\N
2630f684-0b1b-4c9c-8ebd-76706fe13eab	e27e04c6-aa48-4943-b75c-131711c447ee	CRANE	DENNIS	16 Juniper Ridge Road	Acton	\N	\N	\N	10750.00	12.00	0.00	2026-01-23	E 1/23	S, E     2/25*	\N	\N	MODEL_1090	f	f	f	4 HOUR GO BACK RS 3/3 4 HR GO BACK TBRS FROM 2/24 DUE TO WEATHER                              REMAINDER SCHEDULED 2/24                                                  CREW TO GO BACK FOR 3.5 HOURS TO FINISH                                  RS TO 2/12 FROM 3/3 DUE TO SCHEDULING                                                       XTRA CHIP TRUCK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.06+00	2026-03-07 10:27:51.06+00	\N	\N	\N	\N	f	f	f	\N	CRANE	60	f	\N	\N
d0eeb93b-2a8c-4210-a122-fbfb0f843d52	3db1baa1-ea11-4523-981c-2a498a9c73a1	CRANE	DENNIS	58 Weston Road	Lincoln	\N	\N	\N	13500.00	12.00	0.00	2025-09-17	E 9/17	V, E   2/13	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.068+00	2026-03-07 10:27:51.068+00	\N	\N	\N	\N	f	t	t	YES	CRANE	61	f	\N	\N
744209f6-c2b4-45d3-9abf-823c94db9ae4	2da16779-6f44-44bf-8d25-ce7c9d33fbda	BUCKET	UNASSIGNED	11 Davis Lane	Reading	\N	\N	\N	1800.00	2.50	0.00	2026-01-29	\N	V, E 1/29*	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.107+00	2026-03-07 10:27:51.107+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	6	f	\N	\N
1d57cbdf-6995-40e3-a474-6ec3738a6283	deb0cf1e-ab2c-4453-b826-d1c4594e6136	BUCKET	UNASSIGNED	32 Cedar Crest Avenue	Salem	\N	\N	\N	1600.00	3.00	0.00	2026-01-12	\N	V, E 2/11	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.116+00	2026-03-07 10:27:51.116+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	8	f	\N	\N
9ad9e518-29b6-4f53-b435-dd9502b8ced5	057bac3f-da29-4de6-89d9-1477d44386d3	CRANE	UNASSIGNED	122 Marblehead St	Marblehead	\N	\N	\N	3200.00	6.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.349+00	2026-03-06 17:59:50.349+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
9245811a-b4b6-4036-aa26-e688b186d07a	61ace6eb-a2ab-46bf-9d83-39fc149a15e1	CRANE	UNASSIGNED	885 Salem St	Salem	\N	\N	\N	2800.00	5.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.354+00	2026-03-06 17:59:50.354+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
6cdec07f-346f-4b6d-b27e-a3c0ff64e35c	b1b32aef-8026-4677-8647-18d9f0be49e4	CRANE	UNASSIGNED	222 Gloucester St	Gloucester	\N	\N	\N	4100.00	8.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.357+00	2026-03-06 17:59:50.357+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
b63485b8-53e2-4a59-baf0-47b36dc8171f	830a446e-8a05-478f-ae3d-2319e2486e32	BUCKET	UNASSIGNED	220 Newton St	Newton	\N	\N	\N	1250.00	3.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.361+00	2026-03-06 17:59:50.361+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
ec8b2e28-39c4-4f7a-9b5d-0a9deff400b8	a36d14c4-87a0-4142-bc80-b30cd77097da	BUCKET	UNASSIGNED	787 Wellesley St	Wellesley	\N	\N	\N	950.00	2.50	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.364+00	2026-03-06 17:59:50.364+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
ee317421-e00a-400b-afea-889d65c91cc3	40760f31-c3ca-4014-bcde-4a6464815320	CRANE	UNASSIGNED	143 Andover St	Andover	\N	\N	\N	3600.00	6.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.37+00	2026-03-06 17:59:50.37+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
2d89cdb9-1ffc-41c4-a219-80b8edb3c3a1	e45c8fbe-3a60-4215-aa42-49521ad69690	CRANE	UNASSIGNED	405 Beverly St	Beverly	\N	\N	\N	2200.00	5.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.374+00	2026-03-06 17:59:50.374+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
56ae401b-2901-4d4d-b5a7-3a06093ca7f4	fa86f28f-aa52-466e-bec5-187ff97d7378	BUCKET	UNASSIGNED	124 Lexington St	Lexington	\N	\N	\N	1400.00	4.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.377+00	2026-03-06 17:59:50.377+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
9efe2e5d-fc9f-4aa7-844a-de86e81af1e8	3b9d79b3-ba2c-4c76-bb98-1cb46f819c02	BUCKET	UNASSIGNED	940 Natick St	Natick	\N	\N	\N	1800.00	3.50	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.38+00	2026-03-06 17:59:50.38+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
c6eecbd7-bf51-4527-b227-87e565cb4f87	94b28cb0-9ef2-4959-a6a5-34f262ffb420	BUCKET	ANTHONY	26 Landmark Drive	Methuen	\N	\N	\N	0.00	1.00	0.00	2026-01-06	\N	S, E 2/25*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.087+00	2026-03-07 10:27:51.087+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	2	f	\N	\N
09089313-97f2-457f-a53c-24d9f551c4bb	c49d0d5d-d272-4d43-adb0-3a4bf3998cee	BUCKET	UNASSIGNED	834 Needham St	Needham	\N	\N	\N	1100.00	2.00	0.50	\N	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-06 17:59:50.383+00	2026-03-06 17:59:50.383+00	\N	\N	\N	\N	f	f	f	\N	\N	\N	f	\N	\N
bbc6a8e4-57c5-4534-b400-fea490abc92f	fb342d74-ee61-47e1-998d-4ed96e794ec0	CRANE	ANTHONY	298 High St.	Nbpt	\N	\N	\N	4000.00	4.00	0.00	2022-07-19	\N	\N	\N	\N	MODEL_1060	f	f	f	DETAIL                                 TBRS FROM 8/2  WANTS TO HOLD OFF IS GOING THRU OTHER PROPOSALS	2026-03-11 20:15:29.324+00	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.263+00	2026-03-11 20:15:29.326+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	66	t	\N	\N
074f9995-2f67-4c7c-baf1-10be416b0465	1bc2810d-ba06-49c8-968e-acd113756402	BUCKET	ANTHONY	41 Frances Drive	Nbpt	\N	\N	\N	600.00	1.00	0.00	2025-11-24	\N	V, E 2/2*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.142+00	2026-03-07 10:27:51.142+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	23	f	\N	\N
15b7d653-6df0-42b3-8231-69a4c0d7ac12	00f17768-033e-400f-bad6-e0eef8e4d37e	BUCKET	ANTHONY	192 Storey Avenue	Nbpt	\N	\N	\N	600.00	1.00	0.00	2026-01-06	\N	V, E 2/2*	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.147+00	2026-03-07 10:27:51.147+00	\N	\N	\N	\N	f	f	t	73	BUCKET	24	f	\N	\N
63190d96-2cd2-468b-a15b-b7aec1124864	6d941f58-345c-42b8-addf-1d30dbcf7302	BUCKET	ANTHONY	227 Merrimac Street	Nbpt	\N	\N	\N	600.00	1.00	0.00	2025-09-24	E 9/24	E 2/13                                            S, E 2/4	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.151+00	2026-03-07 10:27:51.151+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	25	f	\N	\N
a9ef6e99-45fe-49cf-887c-9fdd6d640136	4d007eaf-bf3d-452d-b81a-657d86fdefa6	BUCKET	ANTHONY	8 Fuller Farms	Topsfield	\N	\N	\N	600.00	1.00	0.00	2026-01-28	\N	V, E 2/2*	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.155+00	2026-03-07 10:27:51.155+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	26	f	\N	\N
7dd4bd45-7297-4b85-9288-63356cfaad82	42b5e810-21ea-4ccb-b42f-9ce3a8254e64	BUCKET	ANTHONY	19 Lakeside Street	Haverhill	\N	\N	\N	900.00	1.50	0.00	2026-02-20	\N	V,E 2/25	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.159+00	2026-03-07 10:27:51.159+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	27	f	\N	\N
a0c17e3b-c27b-4c12-a313-784a8f16f4be	df7875ec-2514-4ebf-baaf-81a8c5ef7ff4	BUCKET	ANTHONY	196 Penny Road	Melrose	\N	\N	\N	800.00	1.50	0.00	2026-01-14	\N	V, E 1/30*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.163+00	2026-03-07 10:27:51.163+00	\N	\N	\N	\N	f	f	t	73	BUCKET	28	f	\N	\N
a46823d8-6c8a-4776-b477-92ad4d5dfdd2	62477504-20ae-4739-a300-eba0c3af20a6	BUCKET	ANTHONY	80 John Street	Tewksbury	\N	\N	\N	900.00	1.50	0.00	2026-01-09	E 1/9	V, E 1/13*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.168+00	2026-03-07 10:27:51.168+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	29	f	\N	\N
8ce6ef98-c9f0-4ffe-8861-61349ba5481d	dcb4c11f-f441-4f39-bcd9-3b832ffd7e03	BUCKET	ANTHONY	23 Stafford	Danvers	\N	\N	\N	1200.00	2.25	0.00	2025-11-25	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.172+00	2026-03-07 10:27:51.172+00	\N	\N	\N	\N	f	f	t	78	BUCKET	30	f	\N	\N
ebdc384f-bc7a-4dc5-b5f1-a6929a2a6993	e112935c-6cc1-42f2-bee9-68e3bc2a8147	BUCKET	ANTHONY	4 Harrison Street	Nbpt	\N	\N	\N	1200.00	2.50	0.00	2026-02-20	\N	V, E 2/25	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.176+00	2026-03-07 10:27:51.176+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	31	f	\N	\N
a6917eaa-2b51-49db-9b2b-d5084bb2380c	25520b87-8f89-4104-92c8-7e08e1a0354e	BUCKET	ANTHONY	16 Bass River Road	Beverly	\N	\N	\N	1800.00	3.00	0.00	2026-01-28	\N	S, E 2/4	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.18+00	2026-03-07 10:27:51.18+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	32	f	\N	\N
ea6a988c-2811-438f-b284-bd9dad210128	94c368db-8499-4301-bf0a-a22c098ed4bc	BUCKET	ANTHONY	10 Pye Brook Lane	Boxford	\N	\N	\N	1600.00	3.00	0.00	2026-01-22	E 1/22	S, E 1/22	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.184+00	2026-03-07 10:27:51.184+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	33	f	\N	\N
548f2602-99a7-4cb0-9db6-3fab2045a277	fbac1f37-28f0-4077-b694-71f5f8692267	BUCKET	ANTHONY	3 Ipswich Road	Boxford	\N	\N	\N	1500.00	3.00	0.00	2026-01-21	\N	S, E 2/16*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.188+00	2026-03-07 10:27:51.188+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	34	f	\N	\N
f80ff63e-3878-489c-8480-870bfbdac1ac	8d58a5d5-6c75-4c10-a709-34040641f926	BUCKET	ANTHONY	80 Pinehurst Drive	Boxford	\N	\N	\N	0.00	3.00	0.00	2026-02-22	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.192+00	2026-03-07 10:27:51.192+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	35	f	\N	\N
433dcc59-43f8-49cf-b449-32486389b249	cf85fb11-db25-47b4-84bf-eb7db8d7dcf9	BUCKET	ANTHONY	11 Marmion Way	Rockport	\N	\N	\N	1500.00	3.00	0.00	2026-02-20	\N	V, E 2/25	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.196+00	2026-03-07 10:27:51.196+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	36	f	\N	\N
1a63c371-7c41-45f6-a3cd-e7a5a4eb9961	cf858e73-f80d-4d0a-ae23-014324a58afa	BUCKET	ANTHONY	66 Saunders Lane	Rowley	\N	\N	\N	1800.00	3.00	0.00	2025-12-17	\N	S, E 1/30	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.201+00	2026-03-07 10:27:51.201+00	\N	\N	\N	\N	f	f	t	78	BUCKET	37	f	\N	\N
c46dee47-a24f-4f83-8718-b43e564f6d6a	9f2963b4-f729-4a1f-9722-5083af1b0db4	BUCKET	ANTHONY	185 Cherry Street	Wenham	\N	\N	\N	1300.00	3.00	0.00	2025-11-05	\N	V, E   2/13	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.206+00	2026-03-07 10:27:51.206+00	\N	\N	\N	\N	f	f	t	78	BUCKET	38	f	\N	\N
28eee2b5-bd35-4e86-bcf5-f145cfa42f57	b675ee5d-63a6-44ef-bfaa-20180bfb8357	BUCKET	ANTHONY	14 Dix Road	Ipswich	\N	\N	\N	1800.00	3.50	0.00	2025-12-15	\N	V, E 1/30*	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.213+00	2026-03-07 10:27:51.213+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	39	f	\N	\N
5a9e79a1-f772-415c-8df1-fbe4f9a52c85	52427901-db9b-4d3c-95ba-ccf08a109fe0	BUCKET	ANTHONY	17r Shore Rd	N. Reading	\N	\N	\N	1800.00	3.50	0.00	2026-01-28	\N	V,E                   1/30	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.218+00	2026-03-07 10:27:51.218+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	40	f	\N	\N
5476446d-2ab5-483d-b814-513f7b95262d	4059ab88-20dd-4aee-a337-d94748c69058	BUCKET	ANTHONY	395c Ipswich Road	Boxford	\N	\N	\N	2000.00	4.00	0.00	2026-02-20	\N	S,E 2/25	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.222+00	2026-03-07 10:27:51.222+00	\N	\N	\N	\N	f	f	t	73	BUCKET	41	f	\N	\N
bc1fce68-861b-4df1-bcb2-6b06b731b7d0	39d243a6-43fa-4106-a716-e18257b00ef8	BUCKET	ANTHONY	21 Spring St	Essex	\N	\N	\N	0.00	4.00	0.00	2025-12-16	\N	DS	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.227+00	2026-03-07 10:27:51.227+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	42	f	\N	\N
12dc33dc-c367-4979-b717-9605545ff4ad	a284c980-2d27-45f8-9e0e-9f8d92943034	BUCKET	ANTHONY	7 Patton Drive	Hamilton	\N	\N	\N	2400.00	4.00	0.00	2025-10-17	\N	S, E 2/2	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.231+00	2026-03-07 10:27:51.231+00	\N	\N	\N	\N	f	t	t	73	BUCKET	43	f	\N	\N
f1a17b4d-8f30-4a5a-b2bf-45378322f239	adcfb57a-be5e-4f1e-b1ba-888781575caf	BUCKET	ANTHONY	7 Highwood Road	Mbts	\N	\N	\N	2400.00	4.00	0.00	2025-10-29	\N	V, E 2/25*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.234+00	2026-03-07 10:27:51.234+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	44	f	\N	\N
f5eb484e-ec23-47b6-9727-725550e6e1fa	d58c08ed-4a55-4ea7-8944-0abb17a0d24c	BUCKET	ANTHONY	96 North Road	N. Hampton, Nh	\N	\N	\N	2400.00	4.00	0.00	2026-01-16	\N	S, E 3/16	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.238+00	2026-03-07 10:27:51.238+00	\N	\N	\N	\N	f	f	t	MID	BUCKET	45	f	\N	\N
713132a0-8629-4f93-9239-21afee77be02	a17c94e5-f779-43a8-b387-33f827468abd	BUCKET	ANTHONY	167 Main Street	Rockport	\N	\N	\N	2000.00	4.00	0.00	2026-01-15	\N	S, E 2/13*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.242+00	2026-03-07 10:27:51.242+00	\N	\N	\N	\N	f	f	t	73	BUCKET	46	f	\N	\N
9dde3a94-d32a-4fa4-8fd8-a175ccd46304	4d007eaf-bf3d-452d-b81a-657d86fdefa6	BUCKET	ANTHONY	8 Fuller Farms Road	Topsfield	\N	\N	\N	2500.00	4.00	0.00	2025-12-13	\N	V, E 2/2*	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.246+00	2026-03-07 10:27:51.246+00	\N	\N	\N	\N	f	f	t	73	BUCKET	47	f	\N	\N
5383c539-fd56-488e-9a72-6d6dc4afdf94	c880dcc2-ae50-4782-a5a0-493ca80273b3	BUCKET	ANTHONY	18 Brentwood Cir.	Danvers	\N	\N	\N	3000.00	5.00	0.00	2025-10-14	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.25+00	2026-03-07 10:27:51.25+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	48	f	\N	\N
1a0729f9-2f33-495d-97c6-c8196097f841	2dfd9b4c-e5e9-4a6c-a9c3-34ec44555f66	BUCKET	ANTHONY	3 Sias Lane	Wenham	\N	\N	\N	3200.00	5.00	0.00	2025-11-11	\N	S 1/19	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.254+00	2026-03-07 10:27:51.254+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	49	f	\N	\N
09e5dd4d-e98d-4c42-884d-5391a7954cd7	c801cc82-87bc-4c07-9da2-75ed6d72def9	BUCKET	ANTHONY	364 Linebrook Road	Ipswich	\N	\N	\N	4000.00	6.00	0.00	2025-11-13	\N	V, E 2/2*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.258+00	2026-03-07 10:27:51.258+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	50	f	\N	\N
ec61824d-2071-4774-a64d-1280a8161a8f	9bf2e645-97dc-4ebc-aa3d-3f1181660363	BUCKET	ANTHONY	18 North St.	Mbts	\N	\N	\N	3500.00	6.00	0.00	2025-10-27	\N	V, E     2/25	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.264+00	2026-03-07 10:27:51.264+00	\N	\N	\N	\N	f	f	t	78	BUCKET	51	f	\N	\N
336f6273-5010-4fa0-bd04-4f4bced8e33e	1c30f500-a1c9-44a4-a9d8-40361c5e76ab	BUCKET	ANTHONY	165 Perkins Row	Topsfield	\N	\N	\N	3000.00	6.00	0.00	2025-11-24	\N	S     2/13*	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.269+00	2026-03-07 10:27:51.269+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	52	f	\N	\N
903e9c6f-9594-4af0-93b8-7acb15b84e96	f9bb50f6-57a8-4af2-9a31-32c758b3b1ad	BUCKET	ANTHONY	156 Newbury Road	Rowley	\N	\N	\N	4300.00	7.00	0.00	2026-11-08	\N	V, E 2/25*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.273+00	2026-03-07 10:27:51.273+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	53	f	\N	\N
822d3969-4b7c-41d0-bd61-cde984656780	5906bd03-c575-4217-9a4f-72cf8bc774da	BUCKET	ANTHONY	42 Washington Ave	Andover	\N	\N	\N	4800.00	8.00	0.00	2025-11-19	\N	DS	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.277+00	2026-03-07 10:27:51.277+00	\N	\N	\N	\N	f	t	t	78	BUCKET	54	f	\N	\N
9a2895cf-36de-48f3-b919-ff29bc54ff2e	026f25b1-ef1a-4edc-b91d-48ee4a6feefb	BUCKET	ANTHONY	140 Hart Street	Beverly	\N	\N	\N	0.00	8.00	0.00	2025-09-07	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.28+00	2026-03-07 10:27:51.28+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	55	f	\N	\N
c25a4de3-af98-44f5-ba15-3724c78cf99b	86dcc3c6-fc72-4272-bc10-987c0737d7d9	BUCKET	ANTHONY	17 Pinehurst Drive	Boxford	\N	\N	\N	4500.00	8.00	0.00	2025-05-08	\N	S, E 1/30*	\N	\N	\N	t	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.284+00	2026-03-07 10:27:51.284+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	56	f	\N	\N
f7b15fad-e9eb-4c68-af81-4abc27de03c1	64ee6c97-1f6f-49bd-8946-99cf63e5d1ba	BUCKET	ANTHONY	28 St. Louis Ave	Gloucester	\N	\N	\N	0.00	8.00	0.00	2025-11-21	\N	S, E 1/21	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.288+00	2026-03-07 10:27:51.288+00	\N	\N	\N	\N	f	f	t	73	BUCKET	57	f	\N	\N
74db6280-2cee-4cb8-9c8e-5e048c149f3e	7906de09-3b50-4634-98c9-772d538e7dcc	BUCKET	ANTHONY	208 Seven Star Rd	Groveland	\N	\N	\N	0.00	8.00	0.00	2025-10-16	\N	DS	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.292+00	2026-03-07 10:27:51.292+00	\N	\N	\N	\N	f	f	t	MID	BUCKET	58	f	\N	\N
427a8c69-a8c2-4253-a6ca-27f867eb3f9c	fde11dec-b829-49d0-94d1-1f6cc0c3a207	BUCKET	ANTHONY	25 Dwinnell Street	Groveland	\N	\N	\N	4500.00	8.00	0.00	2025-12-15	\N	S, T, E         2/20*	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.296+00	2026-03-07 10:27:51.296+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	59	f	\N	\N
1b92c449-50ee-4989-9fa6-23ce73df5ddc	66d24f2c-9986-40b6-aa4b-77d9e379d8a5	BUCKET	ANTHONY	208 High Road	Newbury	\N	\N	\N	0.00	8.00	0.00	2025-11-03	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.3+00	2026-03-07 10:27:51.3+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	60	f	\N	\N
0d45a9d2-d21f-4358-bbca-feacc45b5e3f	7211e8fc-1e90-48df-bd8e-248e6cf22642	BUCKET	ANTHONY	18 Woodside Road	Topsfield	\N	\N	\N	0.00	8.00	0.00	2025-10-07	\N	V, E 2/13*	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.303+00	2026-03-07 10:27:51.303+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	61	f	\N	\N
f77cc0af-b440-448b-a557-8bb43ef5a7a1	e0089ba2-a4b8-4f88-8116-b2ea3e9d6f4a	BUCKET	ANTHONY	3 Turtle Back Rd	Essex	\N	\N	\N	7500.00	10.00	0.00	2026-01-20	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.307+00	2026-03-07 10:27:51.307+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	62	f	\N	\N
ca0d7d9f-aa01-4ba4-839b-316373d4f55a	fdecbe0e-16f5-4160-bae4-fcdf00640c7b	BUCKET	ANTHONY	69 Forest Street	Mbts	\N	\N	\N	0.00	12.00	0.00	2025-09-26	\N	S, E 1/8	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.31+00	2026-03-07 10:27:51.31+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	63	f	\N	\N
9390bb8e-a7fd-4137-8de5-3ef78ef3d081	03885929-3978-4d41-82e1-3d4f9ae37ce8	BUCKET	ANTHONY	431 Highland Street	Hamilton	\N	\N	\N	9000.00	16.00	0.00	2025-10-17	\N	S, E 2/13*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.317+00	2026-03-07 10:27:51.317+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	65	f	\N	\N
9bfa3707-c6c4-408f-bb05-6d2e02733802	1f413835-5f36-467d-a94d-457f2b6314aa	BUCKET	ANTHONY	297 Sagamore Street	Hamilton	\N	\N	\N	9000.00	16.00	0.00	2025-08-25	E 8/25	V, E 2/13	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.32+00	2026-03-07 10:27:51.32+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	66	f	\N	\N
1dcfafda-6133-4215-8e28-ddd46eb286d0	bd6a4e49-4f46-4623-9ff5-13c1d9c12179	BUCKET	ANTHONY	3 Cayer Way	Ipswich	\N	\N	\N	0.00	16.00	0.00	2025-10-07	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.325+00	2026-03-07 10:27:51.325+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	67	f	\N	\N
582ff8bb-32db-41ac-85dc-266aab5e2820	a33cb71f-7ab0-46e4-866f-1fab799ddf11	BUCKET	ANTHONY	14 Hillside Avenue	Beverly	\N	\N	\N	800.00	1.50	0.00	2026-02-26	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.333+00	2026-03-07 10:27:51.333+00	\N	\N	\N	\N	f	f	t	73	BUCKET	69	f	\N	\N
2c8bca73-3c21-4d2f-9da0-40f031bea65c	8e734ad2-83be-4923-ae57-33a6e8f19fb6	BUCKET	ANTHONY	31 Eastern Point Road	Gloucester	\N	\N	\N	2000.00	4.00	0.00	2025-11-20	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.336+00	2026-03-07 10:27:51.336+00	\N	\N	\N	\N	f	f	t	73	BUCKET	70	f	\N	\N
3e8ff8de-f5c2-4eb2-9ece-326e4b21c571	90bceb13-cc2d-416c-945c-5c79868ab1cb	BUCKET	ANTHONY	21 Sunrise Road	Boxford	\N	\N	\N	3000.00	6.00	0.00	2026-02-26	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.339+00	2026-03-07 10:27:51.339+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	71	f	\N	\N
942cac99-146a-4b1a-bf38-884858b55e4c	f50d59a8-b930-4350-9957-c50827405210	BUCKET	ANTHONY	74 Curzon Mill Road	Nbpt	\N	\N	\N	4100.00	7.00	0.00	2026-01-15	\N	\N	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.342+00	2026-03-07 10:27:51.342+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	72	f	\N	\N
7735d1a9-8268-42b2-b671-927764ab6ed2	23c4b93e-9be3-42ea-a355-6c9ac353515e	BUCKET	ANTHONY	13 Turtle Back Road	Essex	\N	\N	\N	0.00	8.00	0.00	2025-10-02	\N	\N	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.345+00	2026-03-07 10:27:51.345+00	\N	\N	\N	\N	f	f	t	78	BUCKET	73	f	\N	\N
ac056782-a2bf-495e-aa97-82143e8d63c0	218f97ce-95ea-453c-8d8e-516d3bfb6336	BUCKET	ANTHONY	22 Paradise Rd.	Ipswich	\N	\N	\N	5000.00	8.00	0.00	2025-10-14	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.347+00	2026-03-07 10:27:51.347+00	\N	\N	\N	\N	f	f	t	78	BUCKET	74	f	\N	\N
55de4da7-eba8-4d55-bb40-672f00dc59c0	5500803e-2999-41de-8138-4b8182bcca60	BUCKET	ANTHONY	94 Main Street	Wenham	\N	\N	\N	11500.00	12.00	0.00	2025-11-04	\N	\N	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.349+00	2026-03-07 10:27:51.349+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	75	f	\N	\N
8d20100f-9864-4b3b-8f2c-fff98e2d0ae5	0dbba991-83a9-427f-95ff-3e28700b05ac	BUCKET	ANTHONY	84 Freedom Hollow	Salem	\N	\N	\N	0.00	32.00	0.00	2025-08-30	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.352+00	2026-03-07 10:27:51.352+00	\N	\N	\N	\N	f	f	t	8:00AM START	BUCKET	76	f	\N	\N
d262e4b5-6e8c-439a-9454-5f532c591a40	e71fcd29-4ae1-48ba-8fde-b0aa5d6257d0	BUCKET	ANTHONY	167 Campground Rd.	South Hampton, Nh	\N	\N	\N	22500.00	40.00	0.00	2025-10-31	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.358+00	2026-03-07 10:27:51.358+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	78	f	\N	\N
33b449bc-0f88-4ab5-a6bd-0c382f7458a9	da71033b-bbeb-464d-915b-4391052db512	BUCKET	ANTHONY	677 Clement Hill Rd	Contoocook, Nh,	\N	\N	\N	0.00	80.00	0.00	2025-12-18	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.36+00	2026-03-07 10:27:51.36+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	79	f	\N	\N
a1df8255-d890-4098-b4be-834fba9c52cc	30ccc871-c427-4a2b-bf15-bd7ab26c63a4	BUCKET	DENNIS	398 Arlington St.	Acton	\N	\N	\N	0.00	1.00	0.00	2026-02-17	\N	V, E    2/25*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.363+00	2026-03-07 10:27:51.363+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	88	f	\N	\N
d1ec6a60-11f6-4a50-af62-9206e0bbb96b	a9d2606d-2255-4aa6-a8ff-763d0aa4ef98	BUCKET	DENNIS	39 Lawndale St.	Belmont	\N	\N	\N	0.00	1.00	0.00	2026-02-17	\N	S, E     2/25*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.367+00	2026-03-07 10:27:51.367+00	\N	\N	\N	\N	f	f	t	73	BUCKET	89	f	\N	\N
fee49797-99b3-4737-aa9d-69cbcf19bff7	0f2836d6-2046-4a32-bc5c-8a37fd8bee13	BUCKET	DENNIS	33 Shaw Drive	Wayland	\N	\N	\N	2400.00	4.00	0.00	2026-02-18	\N	V, E                2/25*	\N	\N	\N	t	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.371+00	2026-03-07 10:27:51.371+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	90	f	\N	\N
c9ee203d-4a3d-4463-b927-626e29753528	8a6ef8dd-aba1-4028-a205-d57feb3c161e	BUCKET	DENNIS	423 Broadway	Cambridge	\N	\N	\N	6100.00	6.00	0.00	2025-12-17	\N	S, E      2/25*	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.375+00	2026-03-07 10:27:51.375+00	\N	\N	\N	\N	f	f	t	73	BUCKET	91	f	\N	\N
d3d03ffa-909c-4017-ba20-1e1fd3ea6bda	62168ad9-d6ac-407d-9b21-23100a291705	BUCKET	DENNIS	684 East Street	Carlisle	\N	\N	\N	7800.00	8.00	0.00	2026-01-22	E 1/22	S, E 1/22	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.38+00	2026-03-07 10:27:51.38+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	92	f	\N	\N
debd9a9c-a195-4e17-a7dd-cd712428f69b	668d80f2-76f0-409a-a2ff-6b627c2073dc	BUCKET	DENNIS	20 Oakvale Road	Newton	\N	\N	\N	4950.00	8.00	0.00	2025-11-21	\N	V, E   2/25	\N	\N	\N	t	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.384+00	2026-03-07 10:27:51.384+00	\N	\N	\N	\N	f	f	t	73	BUCKET	93	f	\N	\N
ff11a553-e8fb-4d0b-9dee-beaed8ed7015	1c30f500-a1c9-44a4-a9d8-40361c5e76ab	BUCKET	DENNIS	165 Perkins Row	Topsfield	\N	\N	\N	3000.00	6.00	0.00	2025-11-24	\N	\N	\N	\N	\N	f	f	f		\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.954+00	2026-03-11 20:28:16.155+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	101	f	\N	\N
1a873ca7-1dbd-4878-a9df-f899fc210a12	ba2163d6-298e-41e4-845f-4540a37d776f	CRANE	ANTHONY	4 Lexington St	Stoneham	2026-02-26	\N	\N	3450.00	3.50	0.00	2026-01-05	AL	V, E 1/6	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.396+00	2026-03-07 10:27:51.396+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	2	f	\N	\N
a75bc14a-cb05-4e19-a053-fd98da1f6357	538f0595-c2ec-494f-bf3c-b3ca4f080c2e	BUCKET	ANTHONY	65 West Street	Beverly	\N	\N	\N	9750.00	19.50	0.00	2025-11-17	\N	S, E 1/13	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.329+00	2026-03-07 10:27:51.329+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	68	f	\N	\N
dc8f266f-d591-47a5-a028-2776d6d85ecd	081f498a-98cb-4939-8eee-084ea051d194	BUCKET	ANTHONY	74 Freetown Road	Raymond, Nh	\N	\N	\N	22500.00	40.00	0.00	2026-02-17	\N	\N	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.355+00	2026-03-07 10:27:51.355+00	\N	\N	\N	\N	f	f	t	78	BUCKET	77	f	\N	\N
879055a2-e3ca-4d46-b55c-f196bb6c2639	0589af73-a939-44ad-8705-6813cd138346	CRANE	UNASSIGNED	11 Tarbox Ln.	N. Reading	2026-01-06	\N	\N	3450.00	3.00	0.00	2025-10-14	\N	V, E 10/23*	\N	\N	MODEL_1090	f	f	f	… BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.531+00	2026-03-07 10:27:51.531+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	32	f	BUCKET	\N
5ca46c58-87a7-4c5c-b71c-381bc9c04415	5c4ed46e-ceea-4caa-942e-5200f4a52795	CRANE	ANTHONY	11 Green Street	Haverhill	2026-01-28	\N	\N	1950.00	1.50	0.00	2025-11-19	\N	S, E 12/3	\N	\N	MODEL_1060	f	f	f	DETAIL                  NEIGHBOR CONSENT FROM LEFT NEIGHBOR-ALL SET!	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.476+00	2026-03-07 10:27:51.476+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	19	f	\N	\N
780ce44c-3f74-4ea0-8da9-2a12e5e6907c	c5a5bc74-2f41-492f-ae4e-e127bcdfdee7	CRANE	ANTHONY	130 Bickford Street	Lynn	2026-01-20	\N	\N	3500.00	3.50	0.00	2026-10-29	\N	S, E 1/12	\N	\N	MODEL_1060	f	f	f	NEIGHBOR CONSENT-ALL SET!	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.481+00	2026-03-07 10:27:51.481+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	20	f	\N	\N
62252588-c51d-490c-83c7-5e731e8913e4	9408eaf5-128a-4226-8fa9-464f162866a9	CRANE	ANTHONY	96 Bellingham Avenue	Revere	2026-01-20	\N	\N	1900.00	1.50	0.00	2025-10-27	\N	S, E 11/5	\N	\N	MODEL_1060	f	f	f	DTL                                      LEFT NEIGHBOR CONSENT-ALL SET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.486+00	2026-03-07 10:27:51.486+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	21	f	\N	\N
77bd9469-2855-4c26-b63e-99c92b6cae3a	1c9fc170-112b-46bd-ac07-38594d2a76e5	CRANE	ANTHONY	20 Harrison Avenue	Saugus	2026-01-20	\N	\N	2200.00	2.00	0.00	2026-01-12	\N	S, E 1/12	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.491+00	2026-03-07 10:27:51.491+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	22	f	\N	\N
5e59d15b-009e-40a3-95f9-e134a67de011	316cf47a-4341-41e9-8b1c-6a9979845f8e	CRANE	ANTHONY	6 Gale Road	S'scott	2025-01-14	\N	\N	4100.00	3.50	0.00	2025-12-19	\N	S, E 12/22	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.498+00	2026-03-07 10:27:51.498+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	24	f	\N	\N
90f789ad-b2ef-4d28-adc2-75a989b8476c	84245de4-03ab-4fcf-99f4-9554bab105f7	CRANE	ANTHONY	577 Lynnfield Street	Lynn	2026-01-14	\N	\N	2100.00	2.00	0.00	2025-10-22	E 10/22	V, E 10/29*	\N	\N	MODEL_1060	f	f	f	W/DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.502+00	2026-03-07 10:27:51.502+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	25	f	\N	\N
f224f77b-ea5d-41ee-9c19-fd92c546c43c	9adbaae2-99b5-4c61-b524-4f4f18956cc0	CRANE	UNASSIGNED	20 Bowlery Dr.	Rowley	2026-01-31	\N	\N	8000.00	6.00	0.00	2026-01-28	\N	DS	\N	\N	MODEL_1060	f	f	f	BIG SAW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.641+00	2026-03-07 10:27:51.641+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	55	f	\N	\N
27bce37e-18e4-47d3-a69f-a448c9d53f75	5019607d-f846-420b-8c8a-a28cf3b0659d	CRANE	UNASSIGNED	65a Spofford Road	Boxford	2026-01-14	\N	\N	3500.00	3.00	0.00	2026-01-12	\N	S             1/13	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.702+00	2026-03-07 10:27:51.702+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	70	f	\N	\N
4a3b6e89-4055-4d65-8f6f-ecaf98362afc	1b1dd09e-e1c2-4532-98b8-c48e88873be6	CRANE	DENNIS	12 Vineyard Street	Danvers	2026-02-16	\N	\N	7000.00	7.00	0.00	2025-11-17	\N	V, E 2/11*	\N	\N	MODEL_1060	f	f	f	SHOULD BE DONE WEEK OF 2/16 WHEN IT IS FEB VACATION!                            TBRS FROM 2/9 DUE TO SCHOOL ZONE                                                         RS TO 2/9                                                     TBRS FROM 2/13 DUE TO SCHEDULING                                                 W/DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.6+00	2026-03-07 10:27:51.6+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	47	f	\N	\N
c2283226-987b-4e38-991c-ae9ee6111d93	412c2dae-c39c-4a20-923a-dcd132c9f946	CRANE	DENNIS	240 County Road	Ipswich	2026-02-14	\N	\N	4000.00	4.00	0.00	2025-07-25	\N	S, E 12/30	\N	\N	MODEL_1090	f	f	f	TBRS FROM 12/27 DUE TO SNOW                                           MOVED TO 12/27 PER DS                                             RS FOR 12/13                                TBRS FROM 10/18 DUE TO PRESSING JOB                                     …BUCKET ALSO                     TO BE DONE ON SATURDAYS ONLY                                                                                W/DW                                                        DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.607+00	2026-03-07 10:27:51.607+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	48	f	BUCKET	\N
c8e6cdc2-d1e5-4a17-a88d-2500466fdb4c	fbc6b8cc-3810-4a28-848b-602c6092c45e	CRANE	UNASSIGNED	68a Rowley Road	Boxford	2026-01-09	\N	\N	1500.00	1.50	0.00	2025-11-05	\N	V, E 11/11*	\N	\N	MODEL_1060	f	f	f	…BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.738+00	2026-03-07 10:27:51.738+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	79	f	BUCKET	\N
534287f9-e78f-480d-b7f5-907807217281	f1149265-528f-4666-b48b-d94a4404712f	CRANE	UNASSIGNED	223 Forest Street	Reading	2026-01-07	\N	\N	8500.00	8.00	0.00	2025-09-30	E 9/30	V, E, T 1/6*	\N	\N	MODEL_1090	f	f	f	RS TO 1/7                                                       TBRS FROM 12/30 DUE TO ER WORK                                                                        NEEDS CONSENT TO USE NEIGHBORS DRIVEWAY-ALL SET                                       RS TO 12/30                                                                    TBRS FROM 12/23 - WANTS FOLLOWING WEEK                                     W/DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.776+00	2026-03-07 10:27:51.776+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	88	f	\N	\N
17b3344e-7f6d-4bf6-a8db-1df5eb46d5ed	4b9e81db-3e88-4844-bbd5-f8e37aaa9509	CRANE	UNASSIGNED	170 South Street	Reading	2026-01-05	\N	\N	6000.00	6.00	0.00	2025-10-08	\N	V, E 10/24*	\N	\N	MODEL_1060	f	f	f	…BUCKET ALSO                   W/ DTL                             NEED CONSENT TO ACCESS BOB HAGAN'S DRIVEWAY - ALL SET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.783+00	2026-03-07 10:27:51.783+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	89	f	BUCKET	\N
f59f43ed-db55-48f9-bd9f-8ae6655d7de7	ab86b846-7027-4983-9316-36cc664c6ff3	CRANE	UNASSIGNED	156 Locksley Rd.	Lynnfield	2026-01-02	\N	\N	7500.00	5.00	0.00	2025-12-30	\N	V,T                12/30*	\N	\N	MODEL_1060	f	f	f	W/ DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.788+00	2026-03-07 10:27:51.788+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	90	f	\N	\N
92042a6e-dd30-4371-958d-be886df7b4f3	00e805d3-21ac-49cc-aa17-bfcb66ad028a	CRANE	UNASSIGNED	29 Grantland Road	Wellesley	2026-02-18	\N	\N	4900.00	4.00	0.00	2025-12-01	\N	S, E 12/15	\N	\N	MODEL_1060	f	f	f	DETAIL                                    NEIGHBOR CONSENT-ALL SET                            EXTRA DUNNAGE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.792+00	2026-03-07 10:27:51.792+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	91	f	\N	\N
f747cd3f-6d6e-46e3-8b8b-184fbe97c36f	b99b7780-f0e2-4091-9c57-197e76732f24	CRANE	UNASSIGNED	86 Dean Road	Brookline	2026-02-17	\N	\N	9200.00	5.50	0.00	2025-07-10	\N	S, E 2/11	\N	\N	MODEL_1060	f	f	f	RS 2/17                          DTL                                              TOWN PERMIT NEEDED-ALL SET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.798+00	2026-03-07 10:27:51.798+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	92	f	\N	\N
1847f771-3626-41f8-8bab-962d32d3b066	f0bae4e8-68bb-4ef2-9002-e53c7dac3c10	CRANE	ANTHONY	5 Birch St.	Amesbury	2026-01-28	\N	\N	5400.00	5.00	0.00	2025-10-14	\N	S          11/26	\N	\N	MODEL_1060	f	f	f	IF #16 IS APPROVED, 7 HOURS TOTAL                             IF THEY DO #16M NEED WRITTEN PERMISSION FROM NEIGHBOR	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.771+00	2026-03-07 10:27:51.771+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	87	f	\N	\N
9f53d8f9-e5db-4c57-ba81-0fbe087ec326	b8016c88-4c58-4793-b192-b6277c9571cb	CRANE	AUSTIN	87 Hildreth Street	Westford	2026-02-12	\N	\N	5000.00	4.50	0.00	2025-11-19	\N	S, E 12/4	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.803+00	2026-03-07 10:27:51.803+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	93	f	\N	\N
5987b91b-acc7-4e4b-9128-4ef1970825b9	30ccc871-c427-4a2b-bf15-bd7ab26c63a4	CRANE	AUSTIN	398 Arlington St	Acton	2025-02-12	\N	\N	4500.00	4.00	0.00	2025-12-09	\N	V, E 12/11*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.807+00	2026-03-07 10:27:51.807+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	94	f	\N	\N
67232b3f-8ed2-4fcc-9b70-e556483e8d99	d83e93c8-4a19-4cb0-b91b-e0bfbad6bd1d	CRANE	UNASSIGNED	127 Main St.	Groton	2026-01-08	\N	\N	4000.00	3.50	0.00	2025-10-22	E 10/22	V, E 11/6*	\N	\N	MODEL_1060	f	f	f	CONCOM- ALL SET                             NEIGHBOR CONSENT - ALL SET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.86+00	2026-03-07 10:27:51.86+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	106	f	\N	\N
2a314ab6-611a-4bc4-a129-5932f8a879fa	7389abb1-b59d-4b8e-bc49-31437ed0783f	BUCKET	UNASSIGNED	77 Harrison Rd	Peabody	2025-01-13	\N	\N	2800.00	4.00	0.00	2025-12-04	\N	CONFIRMED PER MAUREEN	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.984+00	2026-03-07 10:27:51.984+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	30	f	\N	\N
7342e8a2-fe24-4aef-be41-fac9e143f237	8f1e0d29-a244-47d0-af6e-e97ae8776ecb	BUCKET	ANTHONY	12 Clifton Heights Lane	M'head	2026-02-25	\N	\N	1100.00	1.00	0.00	2026-02-25	\N	S                 2/25	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.888+00	2026-03-07 10:27:51.888+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	2	f	\N	\N
74d4e00a-7de6-4f05-9fb9-956f82ed6664	bac91d83-1888-4559-95cc-9dedc2f23578	BUCKET	ANTHONY	1 Rockaway Avenue	M'head	2026-02-24	\N	\N	5400.00	4.00	0.00	2026-02-23	\N	S                   2/23*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.892+00	2026-03-07 10:27:51.892+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	3	f	\N	\N
8c0c6cf7-03ba-43cf-948f-5b2e4b2f157f	b16a198c-6c92-4711-9fd9-699ce6e602f2	BUCKET	ANTHONY	11 Hewitt St.	M'head	2026-01-23	\N	\N	950.00	1.00	0.00	2026-01-23	\N	AL	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.955+00	2026-03-07 10:27:51.955+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	21	f	\N	\N
9c7ab9df-f323-48a3-b849-43447cb20fa9	fb89aabc-40e3-48fd-a6c7-d6065b1c1714	BUCKET	UNASSIGNED	10r East Garfield	Beverly	2026-02-25	\N	\N	0.00	5.00	0.00	2026-02-24	\N	DS	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.071+00	2026-03-07 10:27:52.071+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	55	f	\N	\N
0f4271c2-a065-4332-bcd1-d659a39654c9	2cef772c-eb5d-43cf-bc9e-fdb3bf55001f	BUCKET	UNASSIGNED	5 Overlook Avenue	Gloucester	2026-02-25	\N	\N	2000.00	2.00	0.00	2026-02-24	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.082+00	2026-03-07 10:27:52.082+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	58	f	\N	\N
26e632ae-4db6-4484-99a8-005ce36ec164	9f183f8e-d36e-42f2-a69a-ed0e7511f684	BUCKET	ANTHONY	8 Charing Cross	Lynnfield	2026-01-14	\N	\N	2300.00	4.00	0.00	2025-12-09	\N	S, E 12/17	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.988+00	2026-03-07 10:27:51.988+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	31	f	\N	\N
754623a6-ac62-4895-9c76-3ccbf1ebaa82	ea638e17-7c99-47d7-9099-0d2985d44555	BUCKET	UNASSIGNED	12 Thompson Ln.	Topsfield	2026-02-16	\N	\N	0.00	1.00	0.00	2026-02-10	\N	V,T           2/13*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.127+00	2026-03-07 10:27:52.127+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	70	f	\N	\N
595a72ec-6a86-4e40-9726-126bb29d2639	175b6ade-a85c-411d-8eae-3bf7880deb9f	BUCKET	DENNIS	141 Crow Lane	Nbpt	2026-02-17	\N	\N	3500.00	6.50	0.00	2025-12-12	\N	S, E 2/13          S               2/16	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.124+00	2026-03-07 10:27:52.124+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	69	f	\N	\N
aa6cb667-14dc-4f10-abfd-7a285c9fff18	c20c250f-22ff-49c9-b632-f7a58973328e	BUCKET	UNASSIGNED	33 Townsend Farm Road	Boxford	2026-01-20	\N	\N	2700.00	5.00	0.00	2025-11-05	\N	V, E 11/26*	\N	\N	\N	f	f	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.33+00	2026-03-07 10:27:52.33+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	126	f	\N	\N
33c4ca0b-5c82-470f-8d79-a6f9c7bf4dcb	4623ad78-5cd7-4062-a2b4-f1b70c3366c1	BUCKET	UNASSIGNED	Lafayette St	Salem	2026-01-16	\N	\N	7500.00	6.00	0.00	2025-12-10	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.346+00	2026-03-07 10:27:52.346+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	131	f	\N	\N
daefde6b-1342-4ce3-987f-342078fe0deb	37801df6-0342-4d20-bcd0-0dd93b041f92	BUCKET	UNASSIGNED	676r Hale Street	Beverly	2026-01-15	\N	\N	0.00	1.00	0.00	2025-07-23	\N	V           1/15*	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.357+00	2026-03-07 10:27:52.357+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	134	f	\N	\N
c0338239-c23f-402b-883b-e66671e47be4	e9fe519d-7b82-4889-84f1-ab828c55c6b4	BUCKET	UNASSIGNED	18 Campbell Road	Middleton	2025-01-13	\N	\N	0.00	0.50	0.00	2025-12-31	\N	V, E 12/31*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.406+00	2026-03-07 10:27:52.406+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	148	f	\N	\N
2863b265-b191-40e4-acfa-390576a2a0b6	6dc92c90-9adf-4e94-82cf-5e212407e9cf	BUCKET	UNASSIGNED	11 Daniel Court	Salisbury	2026-01-07	\N	\N	600.00	1.00	0.00	2025-11-18	\N	S, E 11/20	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.459+00	2026-03-07 10:27:52.459+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	163	f	\N	\N
4505a435-54ed-4568-8f10-f4bdc18a84ce	02b10fec-e851-43d9-b544-13feeb77c8ac	BUCKET	UNASSIGNED	252 Middleton Road	Boxford	2026-01-05	\N	\N	4500.00	8.00	0.00	2025-09-29	E 9/29	S, E 11/20	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.506+00	2026-03-07 10:27:52.506+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	177	f	\N	\N
7e6ad1fa-66ea-40d2-a7f3-ccb4e5d2b05d	544f3e02-6483-446d-b3dd-758750651700	BUCKET	DENNIS	15 Youngs Road	Gloucester	2025-01-13	\N	\N	6000.00	7.00	0.00	2025-11-10	\N	S, E 11/25	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.395+00	2026-03-07 10:27:52.395+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	145	f	\N	\N
54bfe4f1-d885-4320-ac48-cf4ce4263bb9	00b97d30-c74d-4167-bd6b-b2c39b791559	BUCKET	UNASSIGNED	30 Littleneck Rd.	Ipswich	2026-01-23	\N	\N	675.00	2.00	0.00	2025-11-04	\N	S                      1/19	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.533+00	2026-03-07 10:27:52.533+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	185	f	\N	\N
43e3a1c4-2677-4215-98cb-d0e60a790b09	e3470ab4-8bab-4559-8833-3f3e197d0699	BUCKET	UNASSIGNED	40-42 Southpoint	Ipswich	2026-01-23	\N	\N	0.00	0.50	0.00	2026-01-13	\N	ER	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.537+00	2026-03-07 10:27:52.537+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	186	f	\N	\N
26b2a1a8-d85f-4e6d-a632-2754893aa4a8	34e33994-7f30-4394-bc9a-f40e928fe2c2	BUCKET	UNASSIGNED	958 Hale Street	Beverly	2026-09-19	\N	\N	0.00	2.00	0.00	2025-08-29	\N	V                  1/19*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.54+00	2026-03-07 10:27:52.54+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	187	f	\N	\N
dec73ca0-098e-4595-9907-c89fc774748c	863fd1a0-7da3-460b-9395-e19e34143e3d	BUCKET	UNASSIGNED	909 Salem St.	Lynnfield	2025-01-14	\N	\N	875.00	1.50	0.00	2025-12-17	\N	S             12/30	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.55+00	2026-03-07 10:27:52.55+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	190	f	\N	\N
33e559f7-a616-4e70-9af3-87c0bb331e2c	cbf605ee-4bbf-4c44-92a5-3099f5b529a2	BUCKET	UNASSIGNED	Icc Roadways	Ipswich	2026-01-09	\N	\N	9200.00	24.00	0.00	2025-12-18	\N	ER	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.558+00	2026-03-07 10:27:52.558+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	192	f	\N	\N
2b9ead83-fe5f-435a-91b0-bcc6a49f5819	c110b614-9db4-476e-a14a-0e2fa845986b	BUCKET	UNASSIGNED	658 Hale St.	Beverly	2026-01-08	\N	\N	800.00	1.25	0.00	2026-01-06	\N	T               1/7*	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.561+00	2026-03-07 10:27:52.561+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	193	f	\N	\N
29aca8a4-1713-4928-9a88-83b1ad4c0f8f	51034a97-2b60-44d9-a55e-1c53df022340	BUCKET	UNASSIGNED	72 Maple St.	Hamilton	2026-01-08	\N	\N	3350.00	3.00	0.00	2026-01-07	\N	S                  1/7	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.565+00	2026-03-07 10:27:52.565+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	194	f	\N	\N
b1c3866a-cb34-423a-acc3-ff9095ae181c	cbf605ee-4bbf-4c44-92a5-3099f5b529a2	BUCKET	UNASSIGNED	2 Trask Ln.	Beverly	2026-01-03	\N	\N	750.00	1.50	0.00	2025-12-16	\N	ER	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.568+00	2026-03-07 10:27:52.568+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	195	f	\N	\N
25c25004-1321-4ff1-97da-cba342163cc3	ef7e06d3-04ea-43a9-8ccb-d38dac02504b	BUCKET	UNASSIGNED	100 Ashby Road	Bedford	2026-02-17	\N	\N	2900.00	2.50	0.00	2026-02-17	\N	S               2/17	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.576+00	2026-03-07 10:27:52.576+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	197	f	\N	\N
553c0fad-e066-47e0-8ae4-d510d10818b5	421fcac3-3eab-4b83-aba3-09e7ba7d364d	BUCKET	UNASSIGNED	79 Edgewater Drive	Waltham	2026-02-11	\N	\N	3300.00	6.00	0.00	2025-10-06	\N	V, E 12/30*	\N	\N	\N	t	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.593+00	2026-03-07 10:27:52.593+00	\N	\N	\N	\N	f	t	t	73	2026 Bucket Completed	202	f	\N	\N
bf117f65-a690-4afc-b93f-9f7cd13bb514	5db9f38d-296c-4dfe-a7ce-f0b7d83b3230	BUCKET	UNASSIGNED	3 Point Street	Natick	2026-02-11	\N	\N	700.00	1.00	0.00	2026-02-05	\N	V,E             2/5*	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.596+00	2026-03-07 10:27:52.596+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	203	f	\N	\N
70fa7155-bbb1-4fa5-bc61-1c29688b3442	5d6318ed-7bc1-4657-99a7-e3cc149ec11c	BUCKET	UNASSIGNED	42 Mason Terrace	Brookline	2026-02-05	\N	\N	3375.00	3.50	0.00	2026-02-02	\N	S, E 2/4	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.61+00	2026-03-07 10:27:52.61+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	207	f	\N	\N
92a19db8-11b2-47e0-b80c-44162365bd3f	eec64d5a-5750-45d0-8280-ab8b892bae1a	BUCKET	UNASSIGNED	24 Edwards Road	Natick	2026-02-02	\N	\N	3250.00	5.50	0.00	2026-01-23	E 1/23	S, E 1/23                             AM	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.621+00	2026-03-07 10:27:52.621+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	210	f	\N	\N
3920157d-dfd3-4ce3-baaa-6762edd4a3f0	74847b71-8ef0-4751-a63f-9bafd9232054	BUCKET	UNASSIGNED	12 Richard Rd	Marlborough	2026-01-22	\N	\N	4500.00	8.00	0.00	2025-09-09	E 9/9	S          1/20                S                              1/21	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.636+00	2026-03-07 10:27:52.636+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	214	f	\N	\N
7cd9150e-bc10-41be-bddb-b19b487227bf	f1a355ef-3734-4978-a832-60e5c5676802	BUCKET	UNASSIGNED	40 Aston Road	Brookline	2026-01-15	\N	\N	4000.00	6.00	0.00	2025-10-14	\N	S, E 10/30	\N	\N	\N	t	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.657+00	2026-03-07 10:27:52.657+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	220	f	\N	\N
a0a09b5c-474b-432a-8a55-660b3e7769b9	863f4264-1904-4c0b-b249-96f85db17de4	BUCKET	UNASSIGNED	98 North Rd	Bedford	2026-01-14	\N	\N	2800.00	4.50	0.00	2025-12-04	\N	S             1/13	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.664+00	2026-03-07 10:27:52.664+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	222	f	\N	\N
84d953f6-8788-4c33-b67b-dcfd4cdad6ef	2e474c82-620d-4638-8132-1c0dd7737384	BUCKET	UNASSIGNED	25 Locust Street	Burlington	2026-01-12	\N	\N	1500.00	3.00	0.00	2025-11-14	\N	V, E 12/30*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.682+00	2026-03-07 10:27:52.682+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	227	f	\N	\N
6b9ce631-68aa-44a3-b5bc-a7f06249c8de	b2710e3b-b1c1-4de4-97d8-c9e3eb87615b	BUCKET	UNASSIGNED	64 Hillside Avenue	Needham	2025-01-05	\N	\N	1900.00	3.00	0.00	2025-12-11	\N	S, E 12/31	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.715+00	2026-03-07 10:27:52.715+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	236	f	\N	\N
6db87155-94a4-4e39-bdde-0e3cc6904b07	218f97ce-95ea-453c-8d8e-516d3bfb6336	CRANE	UNASSIGNED	22 Paradise Rd.	Ipswich	\N	\N	\N	2000.00	2.00	0.00	2025-10-14	\N	\N	\N	\N	MODEL_1060	f	f	t	…BUCKET ALSO                         SNOW COVERED OR FROZEN GROUND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.779+00	2026-03-07 10:27:52.779+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	18	f	BUCKET	\N
7a02bbb9-81ee-4bbe-9d03-732a8e31300b	4a1ceef6-3fc1-43f4-8792-023dea84a723	BUCKET	AUSTIN	12 Daniels St	Lexington	2026-01-20	\N	\N	1500.00	2.75	0.00	2026-01-05	\N	S             1/6	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.653+00	2026-03-07 10:27:52.653+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	219	f	\N	\N
ccbd8dc1-a8d2-4e89-9613-d6bd7cf51d62	f4831517-d879-407b-a12b-4300f1a855a9	BUCKET	AUSTIN	1 Country Lane	Maynard	2026-01-14	\N	\N	1900.00	3.25	0.00	2025-12-04	\N	V, E 12/11*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.66+00	2026-03-07 10:27:52.66+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	221	f	\N	\N
bef22cb1-0175-47e2-9ce8-4858e1cc9744	ce037835-b413-42a5-bed6-a31369dfbf65	BUCKET	UNASSIGNED	39 Pleasant Valley Rd	Amesbury	\N	\N	\N	3000.00	6.00	0.00	2025-07-24	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.814+00	2026-03-07 10:27:52.814+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	6	f	\N	\N
ec04364b-8a03-4336-960d-a6861bb097d7	c880dcc2-ae50-4782-a5a0-493ca80273b3	BUCKET	UNASSIGNED	18 Brentwood Cir.	Danvers	\N	\N	\N	3000.00	5.00	0.00	2025-10-14	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.853+00	2026-03-07 10:27:52.853+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	30	f	\N	\N
0422929f-2fdf-4ee3-8846-6dee376401f3	218f97ce-95ea-453c-8d8e-516d3bfb6336	BUCKET	UNASSIGNED	22 Paradise Rd.	Ipswich	\N	\N	\N	5000.00	8.00	0.00	2025-10-14	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.89+00	2026-03-07 10:27:52.89+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	53	f	\N	\N
9c4e522a-9c99-44d9-a1ef-db0f5dee0baa	fdecbe0e-16f5-4160-bae4-fcdf00640c7b	CRANE	DENNIS	69 Forest Street	Mbts	\N	\N	\N	0.00	8.00	0.00	2025-09-26	\N	\N	\N	\N	MODEL_1060	f	t	f	…BUCKET ALSO                              DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.788+00	2026-03-07 10:27:52.788+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	23	f	BUCKET	\N
5db8cce2-2f79-44f3-9d86-07529d458cd0	2d2f35d5-6532-4881-803f-eb4aaa53015e	CRANE	DENNIS	54 High Street	Topsfield	\N	\N	\N	0.00	8.00	0.00	2025-09-19	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 12/18 FOR SCHEDULING REASONS                                                         DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.793+00	2026-03-07 10:27:52.793+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	27	f	\N	\N
1ce4bce2-5584-4289-978d-5c568e22679e	9756bd5c-bec2-4363-a02d-c64d53b7791c	BUCKET	UNASSIGNED		Plaistow, Nh	\N	\N	\N	6000.00	12.00	0.00	2025-07-14	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.93+00	2026-03-07 10:27:52.93+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	83	f	\N	\N
85db6242-8836-4bf3-b94b-abfd2ec7cc01	9f916661-f348-4bdb-a38c-396ff2308203	BUCKET	UNASSIGNED	10 Enon Rd.	Wenham	\N	\N	\N	6500.00	12.00	0.00	2023-07-20	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.962+00	2026-03-07 10:27:52.962+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	106	f	\N	\N
7c53fd86-127d-4ed9-b439-e967ffc59aef	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	UNASSIGNED	89-95 Larch Row	Wenham	\N	\N	\N	0.00	4.00	0.00	\N	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.966+00	2026-03-07 10:27:52.966+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	108	f	\N	\N
9c7bfd5c-cdfe-4f7f-9869-fe520c5df215	0f05d0c4-011f-46ee-97bd-3d641aab4de4	BUCKET	UNASSIGNED	487 Main Street	W. Newbury	\N	\N	\N	7500.00	8.00	0.00	2025-04-25	E 4/25	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.976+00	2026-03-07 10:27:52.976+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	114	f	\N	\N
8417ede7-51ad-49f7-ab7f-15ee9e32de82	c2c5b1b0-c5f4-47ab-9b9e-bf21ad256243	CRANE	UNASSIGNED	69 Maple St.	Middleton	\N	\N	\N	6500.00	6.50	0.00	2023-05-16	\N	E               5/17	\N	\N	MODEL_1060	f	f	f	W/ DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.987+00	2026-03-07 10:27:52.987+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	2	f	\N	\N
de5dd2ab-921c-41ff-9018-01529d6386c6	d098b679-32c8-4ab5-bd86-50eb012dc4ee	CRANE	UNASSIGNED	23 Wildewood Dr.	Lynnfield	\N	\N	\N	2650.00	2.50	0.00	2023-05-17	E 5/17	\N	\N	\N	MODEL_1060	f	f	f	NEED PERMISSION FROM NEIGHBOR	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.992+00	2026-03-07 10:27:52.992+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	3	f	\N	\N
254ccc86-a05b-4e55-b993-531621b4b525	a5b25efd-c16d-4086-8a8a-e54f5d24a0f4	CRANE	UNASSIGNED	121 Great Pond Rd.	N. Andover	\N	\N	\N	9600.00	8.00	0.00	2023-05-17	E 5/17	\N	\N	\N	MODEL_1060	f	f	f	W/ BUCKET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.995+00	2026-03-07 10:27:52.995+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	4	f	\N	\N
afd38a83-74a0-481d-b435-528631d4f8c9	dbeab6a9-2a04-483b-9d28-1ca352e2f67b	CRANE	ANTHONY	14 Leonard St.	Gloucester	\N	\N	\N	7000.00	8.00	0.00	2022-12-22	E 12/22	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/23 DUE TO WEATHER                             DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.222+00	2026-03-07 10:27:53.222+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	47	t	\N	\N
3ef8ba36-ac7b-4a30-a9e5-d4476b22e4cf	81b38cf5-a4c9-480d-83f4-141c701f49b7	CRANE	UNASSIGNED	1 Hamilton Rd.	Peabody	\N	\N	\N	8400.00	8.00	0.00	2023-05-19	E 5/19	\N	\N	\N	MODEL_1090	f	f	f	W/ DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.002+00	2026-03-07 10:27:53.002+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	7	f	\N	\N
9a8482dd-ec48-4346-855f-ce97704445a1	a033e700-8c34-4238-853e-b3358cdd3e1d	CRANE	ANTHONY	10 Merril St.	Danvers	\N	\N	\N	1800.00	2.00	0.00	2023-05-16	E 5/17	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.02+00	2026-03-07 10:27:53.02+00	\N	\N	\N	\N	f	f	t	*	DS OLD CRANE	18	f	\N	\N
5de46ea1-65c7-4fa6-8687-45e7c295059a	ba422a49-17b6-4cc1-a52e-3ae426fdb19e	CRANE	ANTHONY	7 Henderson Cir.	Nbpt	\N	\N	\N	1500.00	1.00	0.00	2023-05-17	E 5/17	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.022+00	2026-03-07 10:27:53.022+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	19	f	\N	\N
a0842fad-96b5-419d-838e-9d190573e23a	c0019d16-2bd5-423d-9076-fde1e136a886	CRANE	ANTHONY	140 Haverhill Rd.	East Kingston, Nh	\N	\N	\N	8000.00	16.00	0.00	2023-05-18	\N	\N	\N	\N	\N	f	f	f	978-606-3053	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.025+00	2026-03-07 10:27:53.025+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	20	f	\N	\N
667e76a8-8d50-413f-9b5b-3fc40a36e249	4bccd240-5d39-45fd-8c86-b829e41efb9a	CRANE	ANTHONY	30 Orchard St.	Newbury	\N	\N	\N	7500.00	8.00	0.00	2023-05-18	E 5/18	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.028+00	2026-03-07 10:27:53.028+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	21	f	\N	\N
22460318-1e70-4dd1-9a78-6bfbbaa22a06	5707db0b-7e07-4647-a935-125458476d73	CRANE	ANTHONY	23 Partridge Ln.	Boxford	\N	\N	\N	4300.00	4.00	0.00	2023-05-19	E 5/19	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.03+00	2026-03-07 10:27:53.03+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	22	f	\N	\N
fbaf8633-bc6c-44ea-9d9c-5b00d9a80d1a	e99c9bed-0d2a-4ddd-a5b4-1f07a2a94ef0	CRANE	ANTHONY	6 One Salem St.	S'scott	\N	\N	\N	2400.00	2.50	0.00	2023-05-19	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.033+00	2026-03-07 10:27:53.033+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	23	f	\N	\N
277bccb3-de53-4930-b537-822856a8d559	d5e8ecaa-af56-49ed-8295-8ceb08e800f1	CRANE	ANTHONY	45 River Rd.	Topsfield	\N	\N	\N	3500.00	3.50	0.00	2023-05-19	E 5/19	\N	\N	\N	MODEL_1060	f	f	f	BIG SAW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.035+00	2026-03-07 10:27:53.035+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	24	f	\N	\N
f259c5e6-af34-4777-916e-04a41082b83e	1e14c8d2-80db-4021-b947-cda930fa3b6d	CRANE	ANTHONY	151 West St.	Beverly	\N	\N	\N	0.00	3.50	0.00	2023-05-20	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.038+00	2026-03-07 10:27:53.038+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	25	f	\N	\N
759ad15f-c508-4dc5-b43d-e943e6440de2	8244a077-5bda-4725-b370-bc59892b5498	CRANE	ANTHONY	791 Main St.	Boxford	\N	\N	\N	6000.00	6.00	0.00	2023-05-20	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.042+00	2026-03-07 10:27:53.042+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	26	f	\N	\N
77e319a8-de74-4b3c-88b1-185a810187ab	05e746d1-dd55-4fa4-a348-6ea35dc94498	CRANE	ANTHONY	6 Trask St.	Beverly	\N	\N	\N	2300.00	2.25	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.045+00	2026-03-07 10:27:53.045+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	27	f	\N	\N
c3e53d79-d7b2-44e4-a991-31bd64025e5d	ce18a0f3-42f1-4e92-bde8-44bf763743f3	CRANE	ANTHONY	269 Hale St.	Beverly	\N	\N	\N	1800.00	2.00	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.047+00	2026-03-07 10:27:53.047+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	28	f	\N	\N
b58d4d76-89c0-408a-bb07-0657c5b3ff58	6339b35d-d99d-4f29-9fe7-939d866b53b5	CRANE	ANTHONY	5 Garfield Ave.	Beverly	\N	\N	\N	1500.00	1.50	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.05+00	2026-03-07 10:27:53.05+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	29	f	\N	\N
4c3790c4-1dc1-4110-b07b-6ed19c4ad08c	1c9bd3fb-8b67-4202-b52b-d948bb5d1ded	CRANE	ANTHONY	5 Concord Ter.	Beverly	\N	\N	\N	3000.00	3.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.052+00	2026-03-07 10:27:53.052+00	\N	\N	\N	\N	f	f	t	*	DS OLD CRANE	30	f	\N	\N
4176e079-85a0-44a7-afdc-ee99e6897566	148b0686-fe64-4608-964d-24efd38e4834	CRANE	ANTHONY	21a Lakeshore Rd.	Boxford	\N	\N	\N	8000.00	8.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f	EXTRA PLYWOOD	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.055+00	2026-03-07 10:27:53.055+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	31	f	\N	\N
fdb492fc-c3e9-472c-9372-85287969f9fb	8244a077-5bda-4725-b370-bc59892b5498	CRANE	ANTHONY	791 Main St.	Boxford	\N	\N	\N	6000.00	6.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.057+00	2026-03-07 10:27:53.057+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	32	f	\N	\N
9c597144-876a-4f27-b449-359728dac9e3	30dc5065-8ff5-40f1-80a7-ebc341e439d5	CRANE	ANTHONY	185 Ipswich Rd.	Boxford	\N	\N	\N	0.00	4.00	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f	T&M CRANE TBD BEFORE  6/6                                …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.06+00	2026-03-07 10:27:53.06+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	33	f	BUCKET	\N
506b1e12-5c74-485e-87de-ba4ff36f4054	995baf47-21fe-48a2-adda-d513efe230d0	CRANE	ANTHONY	19 Carolyn Dr.	Danvers	\N	\N	\N	1600.00	1.50	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.062+00	2026-03-07 10:27:53.062+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	34	f	\N	\N
17009d4d-fa20-4e27-8b86-7b421235e569	41d81dbe-f5e8-4e5b-91e5-14d8ea961836	CRANE	ANTHONY	156 Andover St.	Danvers	\N	\N	\N	1800.00	1.50	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f	SATURDAY ONLY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.065+00	2026-03-07 10:27:53.065+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	35	f	\N	\N
3259cd9e-a2ba-42ba-889e-6764d60f706f	9d7d5266-4a30-4a36-9d4b-76c33a9b0eb6	CRANE	ANTHONY	5 Strawberry Ln.	Danvers	\N	\N	\N	1800.00	1.75	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.067+00	2026-03-07 10:27:53.067+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	36	f	\N	\N
bdeefc50-5e20-4b44-a7c1-c85843ba0a8e	07471dc1-aa86-4a18-80ff-f3f040a00155	CRANE	ANTHONY	24 Hodgkins Dr.	Ipswich	\N	\N	\N	3000.00	3.00	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f	NEEDS TBD ON 6/26 OR 6/27	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.07+00	2026-03-07 10:27:53.07+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	37	f	\N	\N
92ccdcb7-33bf-4261-92ed-8411d879969f	97e71aba-fb7a-4a47-bb29-4089100cd151	CRANE	ANTHONY	15 Summit Pl.	Nbpt	\N	\N	\N	2700.00	2.50	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f	DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.072+00	2026-03-07 10:27:53.072+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	38	f	\N	\N
e2c583c3-cbdd-4bac-a8d0-6e736f368bbd	5a53890d-f7f8-4448-92ab-da8730c8858a	CRANE	ANTHONY	82 Curzon Mill Rd.	Nbpt	\N	\N	\N	6000.00	6.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.076+00	2026-03-07 10:27:53.076+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	39	f	\N	\N
ccf6e951-bfa8-4bbb-9db3-4ad55ba475c2	98cddb94-d6d8-4c2b-b6eb-9fba12046c3f	CRANE	ANTHONY	Bresnahan St.	Peabody	\N	\N	\N	4500.00	4.00	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f	W/ BUCKET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.078+00	2026-03-07 10:27:53.078+00	\N	\N	\N	\N	f	f	t	*	DS OLD CRANE	40	f	\N	\N
31df7135-c201-4466-b210-0e0c028630fa	0bacbba0-98e8-42ae-936e-ab542cfa6bbe	CRANE	ANTHONY	39 Cross St.	Rowley	\N	\N	\N	5500.00	5.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f	W/ BUCKET DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.08+00	2026-03-07 10:27:53.08+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	41	f	\N	\N
0df86f31-9b12-479f-9b4c-8fca10d0fe73	42d0776d-5137-46c9-9c2d-9833174f1b1a	CRANE	ANTHONY	17 Blueberry Ln.	Topsfield	\N	\N	\N	6000.00	6.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.084+00	2026-03-07 10:27:53.084+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	42	f	\N	\N
6d06b5ac-7df0-4dba-9d60-cf47f08c8b33	5802dfe8-cf7f-45b7-9c25-fe9105375433	CRANE	DENNIS	62 King Philip Rd.	Sudbury	\N	\N	\N	5100.00	4.50	0.00	2023-05-16	E 5/17	E                5/19	\N	\N	MODEL_1060	f	f	f	W/ DETAIL                                         W/ BUCKET                                                               ROAD CLOSED SIGNS, BAGSTER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.087+00	2026-03-07 10:27:53.087+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	48	f	\N	\N
e4556ee1-d44c-47e5-b8d5-20f49190ff05	ad5163f0-ce1b-45cb-8d17-2a5f80278118	CRANE	DENNIS	275 Princeton Blvd.	Lowell	\N	\N	\N	4500.00	3.50	0.00	2023-05-18	\N	E           5/19	\N	\N	MODEL_1060	f	f	f	1HR TRAVEL DETAIL         PERMIT FROM CITY OF LOWELL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.091+00	2026-03-07 10:27:53.091+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	54	f	\N	\N
347ed469-df79-4d2b-be7e-c299bba0e9d7	24c7b2c9-e65e-432c-90ec-c28610ffab0f	CRANE	DENNIS	1 Bradly Ln.,	Westford	\N	\N	\N	9000.00	8.00	0.00	2023-05-18	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.097+00	2026-03-07 10:27:53.097+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	55	f	\N	\N
f36690a0-7b5b-4887-9a31-47a813970c91	b182a422-5db6-48e8-a63b-1587522970c1	CRANE	DENNIS	201 Riverbend Dr.	Groton	\N	\N	\N	8000.00	8.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1060	f	f	f	EXTRA CHIP TRUCK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.1+00	2026-03-07 10:27:53.1+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	56	f	\N	\N
e04224cc-1d98-4556-b834-5d3ec5963c99	24c7b2c9-e65e-432c-90ec-c28610ffab0f	CRANE	DENNIS	Derby Ln.	Tyngsborough	\N	\N	\N	9000.00	8.00	0.00	2023-05-22	\N	\N	\N	\N	MODEL_1060	f	f	f	AL'S CREW EXTREA CHIP TRUCK                        CONCOM REQUIRED          …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.102+00	2026-03-07 10:27:53.102+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	57	f	BUCKET	\N
4c447d7b-bc77-48cc-865f-f3a8e08160df	224bcfe3-0b51-4698-b783-710487a6d569	CRANE	ANTHONY	38 Hollywood Rd.	Winchester	\N	\N	\N	2000.00	2.00	0.00	2022-09-02	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.327+00	2026-03-11 20:27:39.807+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	94	t	\N	\N
3d10fa1b-3256-4105-ac04-8953a6484de2	841fc6c4-d66a-481d-85de-1d3fe6299829	CRANE	UNASSIGNED	10 Pine Point Rd.	Lynn	\N	\N	\N	3850.00	4.00	0.00	2022-06-23	\N	\N	\N	\N	MODEL_1060	f	f	f	NEEDS CONCOM	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.136+00	2026-03-07 10:27:53.136+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	8	t	\N	\N
92bc48ab-e599-4195-8b7d-239aed729c44	1efc13d7-f679-42e9-a7ad-d4cdb3699f52	CRANE	UNASSIGNED	12 Intervale Rd.	M'head	\N	\N	\N	2850.00	2.50	0.00	2022-12-16	E 12/16	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/27 CONCOM HAS NOT BEEN APPROVED YET                                  CONCOM NEEDED (CUSTOMER IS MEETING WITH CONSERVAION ON 1/10)	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.143+00	2026-03-07 10:27:53.143+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	11	t	\N	\N
94c06dfc-086e-410e-81d0-ea4c91903635	451406dd-83b2-4b7d-b954-b14878b32f95	CRANE	UNASSIGNED	80 Settlers Ridge Rd.	N. Andover	\N	\N	\N	1150.00	1.00	0.00	2022-10-12	\N	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 12/21 DUE TO FAA TBRS FROM 11/22 DUE TO NOT HAVING FAA APPROVAL                                           BD WITH MONTECALVO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.148+00	2026-03-07 10:27:53.148+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	13	t	\N	\N
ca5ba5a1-230a-48d9-837a-20b3abc08496	5a7feada-ddc1-4192-bca6-81523f5d17bb	CRANE	UNASSIGNED	66 Settlers Ridge Rd.	N. Andover	\N	\N	\N	4150.00	4.00	0.00	2022-10-12	\N	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 12/21 DUE TO FAA CREW TO GO BACK FOR 1 HR DUE TO BEING SHUT DOWN FROM NOT HAVING FAA APPROVAL                                                              TBD WITH KENT	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.152+00	2026-03-07 10:27:53.152+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	14	t	\N	\N
7e28f8bb-5b7d-484e-b02c-da1b32b8be80	83261914-5762-4fb1-9bd0-d653a99922f5	CRANE	AUSTIN	17 Nason Rd.,	Swampscott	\N	\N	\N	3400.00	3.00	0.00	2022-11-14	M 11/14	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 12/16 DUE TO CUSTOMER NOT GETTING TOWN APPROVAL, WILL REACH OUT ONCE THEY RECEIVE IT                                                              DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.165+00	2026-03-11 18:28:03.662+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	19	t	\N	\N
e3742aee-fee8-44e5-a0b4-f03525313cbe	474ac72c-9d54-408d-b352-530113bcaadf	CRANE	ANTHONY	16 Woodwell Cir.	Amesbury	\N	\N	\N	3000.00	3.00	0.00	2021-09-29	\N	\N	\N	\N	EITHER	f	f	f	1/12: PER DS, SPRING                    10/12: NOTHING PRESSING                                   9/30: MAY BE REVISED               EITHER CRANE                                  OWNER OF SYLVAN ST GRILLE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.172+00	2026-03-07 10:27:53.172+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	28	t	\N	\N
6bc9332f-fb14-433f-8eff-e44a79c986b2	8baa1b33-dcf3-493a-9df4-fd678362871c	CRANE	ANTHONY	10 Fieldstone Ln.	Beverly	\N	\N	\N	3200.00	3.00	0.00	2022-10-17	\N	\N	\N	\N	MODEL_1060	f	f	f	CONCOM	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.174+00	2026-03-07 10:27:53.174+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	30	t	\N	\N
bae23da8-900a-4998-b643-f18e0ab128bc	0ddf8275-2094-43d0-9540-17802c25feac	CRANE	ANTHONY	30 Wedgemere Rd.	Beverly	\N	\N	\N	3000.00	3.00	0.00	2023-01-05	\N	S     1/11	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.178+00	2026-03-07 10:27:53.178+00	\N	\N	\N	\N	f	f	t	*	UNABLE TO BE SCHEDULED	31	t	\N	\N
f526b896-54df-4c10-93d5-25cfc3ed4c8b	3085c721-528c-47db-9000-9ffcf37edccb	CRANE	ANTHONY	50 Grover St.	Beverly	\N	\N	\N	2700.00	2.50	0.00	2022-12-28	E 12/28	E      1/11*	\N	\N	\N	f	f	f	DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.181+00	2026-03-07 10:27:53.181+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	32	t	\N	\N
cef65e98-81f1-4642-af6c-15538a3cc5af	fc2476f2-a086-4d2f-9291-f9c73eeab977	CRANE	ANTHONY	46 Prince St.	Beverly	\N	\N	\N	5500.00	5.00	0.00	2022-12-05	E 12/5	\N	\N	\N	MODEL_1060	f	f	f	ACCESS NEEDED IN NEIGHBOR'S DWAY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.185+00	2026-03-07 10:27:53.185+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	33	t	\N	\N
660b3f40-9cfb-46f5-bad1-f9388d217014	d311612b-69fc-4a6a-8f76-ae5c9c6b1683	CRANE	ANTHONY	9 Ober St.	Beverly	\N	\N	\N	5500.00	5.00	0.00	2023-01-05	E 1/5	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.188+00	2026-03-07 10:27:53.188+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	34	t	\N	\N
466f3364-c3a2-48b3-96ee-02f57e9b5fe1	5f227997-b1ea-4af1-8453-3bd58a4e98e3	CRANE	ANTHONY	86 Corning St.	Beverly	\N	\N	\N	2000.00	2.00	0.00	2022-12-28	E 12/28	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/30 DUE TO CONCOM NOT BEING APPROVED YET                                        W / DETAIL                                                                         CONCOM NEEDED - ALL SET PER DS	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.191+00	2026-03-07 10:27:53.191+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	35	t	\N	\N
cea6a93e-00e9-4d1e-8cb2-96aa6c404aef	1a179bff-abfc-4ac1-9716-757de08fd85c	CRANE	ANTHONY	324 Elliott St.	Beverly	\N	\N	\N	1500.00	1.00	0.00	2023-01-10	E 1/10	E      1/11                 S                           1/25	\N	\N	MODEL_1060	f	f	f	W/ DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.196+00	2026-03-07 10:27:53.196+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	36	t	\N	\N
119482fe-b12a-411b-b289-696c36b3f6de	bb81600c-f5c5-450b-abb7-f75efec233cd	CRANE	ANTHONY	19 Foster Dr.	Beverly	\N	\N	\N	3000.00	3.00	0.00	2023-01-24	\N	\N	\N	\N	MODEL_1060	f	f	f	ALS CREW                                                STUMP GRINDER ON SITE, CRANE TO LIFT IT IN                                                                            DONT SENT USUAL STUMP LANGUAGE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.201+00	2026-03-07 10:27:53.201+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	37	t	\N	\N
6b46dff4-3439-4251-bbf3-3ae2739e26dc	79b69641-99d0-475c-a783-ef2ad24017c7	CRANE	ANTHONY	188 Georgetown Rd.	Boxford	\N	\N	\N	7500.00	8.00	0.00	2022-10-12	\N	\N	\N	\N	MODEL_1060	f	t	f	WINTER                                                                       …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.204+00	2026-03-07 10:27:53.204+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	39	t	BUCKET	\N
1ec90312-90dd-419e-adc4-b81fe13dbbc2	89dce7c7-dd27-4230-b40a-8fd467dc8692	CRANE	ANTHONY	5 Barker St.	Boxford	\N	\N	\N	3000.00	3.00	0.00	2023-01-25	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.206+00	2026-03-07 10:27:53.206+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	40	t	\N	\N
b0fc5dda-6c69-46e2-912e-3700f37cfbda	979cfd52-3528-43ce-9277-c98e43f48871	CRANE	ANTHONY	15 Wildmeadow Rd.	Boxford	\N	\N	\N	6500.00	7.00	0.00	2022-08-03	\N	\N	\N	\N	\N	f	f	f	TBRS FROM 9/30 DUE TO CONCOM                                           NEEDS CONCOM -ALL SET, OUTSIDE OF BUFFER ZONE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.209+00	2026-03-07 10:27:53.209+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	41	t	\N	\N
6ebdf31c-1b46-416f-a374-bccbeb4d951b	d7d5a3f1-560c-41f6-92ba-5a08d1fdb6c3	CRANE	ANTHONY	36 Townsend Farm Rd.	Boxford	\N	\N	\N	2800.00	2.75	0.00	2023-01-19	E   1/19	\N	\N	\N	MODEL_1060	f	f	f	W/BUCKET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.214+00	2026-03-07 10:27:53.214+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	42	t	\N	\N
7af19bda-bdb6-4545-8056-0081974bd984	d5567ff6-41b8-41a9-9885-6325e71ac27f	CRANE	ANTHONY	9 Bailey Ln.	G'town	\N	\N	\N	3200.00	3.00	0.00	2022-12-29	\N	\N	\N	\N	MODEL_1060	f	f	f	EMAIL ADDRESS IS WRONG	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.217+00	2026-03-07 10:27:53.217+00	\N	\N	\N	\N	f	f	t	*	UNABLE TO BE SCHEDULED	44	t	\N	\N
7db6b9c1-13b1-4448-8a5f-4fc07e87f2fe	d747ddd6-7347-4a47-b995-a5479da7c724	CRANE	ANTHONY	141 North St.	G'town	\N	\N	\N	0.00	4.00	0.00	2022-08-17	\N	\N	\N	\N	MODEL_1060	f	f	f	CLIMBER & 1 GUY              SATURDAY JOB                    T&M	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.219+00	2026-03-07 10:27:53.219+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	45	t	\N	\N
b400a3fd-5dcf-4f2a-a6bf-7d99f386fc30	e5c4bb06-f7ee-447a-88ac-dd9202fd56df	CRANE	ANTHONY	637 Essex Ave.	Gloucester	\N	\N	\N	3200.00	3.00	0.00	2023-01-03	E 1/3	V,E                                   1/17   E,S    1/23	\N	\N	MODEL_1060	f	f	f	DETAILS                                 978-491-1539	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.226+00	2026-03-07 10:27:53.226+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	48	t	\N	\N
48e6c177-c514-4d16-883c-2c35020d5193	520468cd-695b-4042-bded-02c94efda4e2	CRANE	ANTHONY	12 Castle Hill Rd.	Gloucester	\N	\N	\N	3000.00	3.00	0.00	2022-11-29	E 11/29*	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 1/6 DUE TO NOT BEING READY TO PROCEED WITH WORK. WILL REACH OUT WHEN READY …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.23+00	2026-03-07 10:27:53.23+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	49	t	BUCKET	\N
4f4c7160-ddd0-4d3c-ada7-40db5a4e1c5a	2b9d47a4-cc4e-45e8-b1eb-8a390a7d5733	CRANE	ANTHONY	66 Hesperus Ave.	Gloucester	\N	\N	\N	3300.00	4.00	0.00	2023-01-09	E 1/9	S,E                            1/17   E    1/23	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.233+00	2026-03-07 10:27:53.233+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	50	t	\N	\N
27eb78c6-c6e9-425a-97e0-f3576b454f99	2fee6f7b-68d8-4997-bc86-ca9fd485281f	CRANE	ANTHONY	135 Lakeshore Ln.	Hamilton	\N	\N	\N	5000.00	4.00	0.00	2022-10-06	\N	\N	\N	\N	MODEL_1060	f	f	f	AL CREW A SATURDAY IN NOVEMBER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.236+00	2026-03-07 10:27:53.236+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	52	t	\N	\N
17f4a202-e3d5-43d0-be8a-ebe2f8b4dd37	14c05537-e5a9-481b-b890-d560b4c12111	CRANE	ANTHONY	66 Rock Maple Ave.	Hamilton	\N	\N	\N	0.00	8.00	0.00	2022-12-19	E 12/19	\N	\N	\N	MODEL_1060	f	f	f	T&M AL'S CREW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.239+00	2026-03-07 10:27:53.239+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	53	t	\N	\N
66addf5a-d0d1-498c-b06b-e6319efc0796	be3b2910-3b34-496d-85bc-3db28ea5eb30	CRANE	ANTHONY	Westchester Dr.	Haverhill	\N	\N	\N	1500.00	1.50	0.00	2023-01-20	\N	\N	\N	\N	MODEL_1060	f	f	f	… BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.242+00	2026-03-07 10:27:53.242+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	55	t	BUCKET	\N
eeb42dff-e933-46de-ae9d-e13c1a9c15b6	5dbfe694-660c-455c-a5cd-591854059869	CRANE	ANTHONY	265 Topsfield Rd.	Ipswich	\N	\N	\N	3000.00	3.00	0.00	2022-12-22	E 12/22	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/31 DUE TO NEEDING A PERMIT, ON HOLD UNTIL CIRILLA REACH OUT                                                                   CIRILLA IS OUT OF TOWN, HERE IS HER OUT OF TOWN NUMBER : 352-528-6718	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.244+00	2026-03-07 10:27:53.244+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	57	t	\N	\N
41180d82-cdee-49dd-a32b-ac189d15d3c7	b63a1486-a359-4de5-9dd2-f214b8908afc	CRANE	ANTHONY	15 Broadway Ave.	Ipswich	\N	\N	\N	4000.00	4.00	0.00	2022-04-25	DS	\N	\N	\N	MODEL_1060	f	f	f	ON HOLD UNTIL LATE FALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.248+00	2026-03-07 10:27:53.248+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	58	t	\N	\N
958b7e6a-82f1-4e11-a864-0c8cc1c16ea7	f4738b13-f201-498c-ab78-952949c79d19	CRANE	ANTHONY	5 Scott Hill Rd.	Ipswich	\N	\N	\N	4000.00	4.00	0.00	2022-04-22	\N	\N	\N	\N	MODEL_1060	f	t	f	WINTER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.251+00	2026-03-07 10:27:53.251+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	59	t	\N	\N
bd19eb67-2713-4b23-a3ff-3a8e18ea17b1	00cb29a0-4558-4e3c-815d-c58fbab85eb2	CRANE	ANTHONY	95 Old Essex Rd.	Mbts	\N	\N	\N	8500.00	8.00	0.00	2021-05-05	\N	\N	\N	\N	MODEL_1060	f	f	f	POSTPONED FROM 9/13 DUE TO CON COM APPROVAL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.253+00	2026-03-07 10:27:53.253+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	61	t	\N	\N
d9a0c855-d5ce-417a-a706-0691624cbc25	d39758d2-4d4c-44c6-8525-bd2692c12132	CRANE	ANTHONY	7 Dunvegan Dr.	Merrimac	\N	\N	\N	4000.00	4.00	0.00	2022-07-05	\N	\N	\N	\N	MODEL_1090	f	f	f	11/22/22: DS TO REACH OUT                                                     TOPSFIELD POLICE OFFICER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.256+00	2026-03-07 10:27:53.256+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	63	t	\N	\N
6fd0bf8e-26bc-4896-b386-8a519ff31b18	a6b42ba6-d8f6-411b-93a9-a8a3e15d1b95	CRANE	ANTHONY	20 River Rd.	Merrimac	\N	\N	\N	4500.00	4.00	0.00	2022-12-22	E 12/22	E               1/12                  S          1/13	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.259+00	2026-03-07 10:27:53.259+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	64	t	\N	\N
00c5e50a-3b76-4da6-9fdd-3482c7d8e168	4e2834c8-5c09-4ab2-be29-972057be0549	CRANE	ANTHONY	251 High St.	Nbpt	\N	\N	\N	3000.00	3.00	0.00	2023-01-24	\N	\N	\N	\N	MODEL_1060	f	f	f	W/ DETAIL                                            W/ BUCKET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.267+00	2026-03-07 10:27:53.267+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	67	t	\N	\N
ff832cf0-09aa-41ae-9cab-ce2882edbeb6	5c592a92-a455-4740-a365-e4957842e6a0	CRANE	ANTHONY	5 Walnut St.	Nbpt	\N	\N	\N	3000.00	3.00	0.00	2023-01-23	E 1/23	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.271+00	2026-03-07 10:27:53.271+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	68	t	\N	\N
d4e3533d-8d7e-4fe0-9197-0db14ea09af1	be542382-1dfb-48fd-ada9-4e2b89fb6ae2	CRANE	ANTHONY	30 Riverview Dr.	Newbury	\N	\N	\N	1850.00	2.00	0.00	2022-12-20	\N	T             1/12*               V,T              1/13*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.274+00	2026-03-07 10:27:53.274+00	\N	\N	\N	\N	f	f	t	*	UNABLE TO BE SCHEDULED	70	t	\N	\N
0ed8d1e4-3656-4f9e-a0f9-d8fc6bb8f52f	ac1d2ffa-623d-416d-9dda-3d75d91f252b	CRANE	ANTHONY	6 Vaughn Ave.	Newton	\N	\N	\N	7000.00	8.00	0.00	2022-12-14	\N	T     1/11*	\N	\N	MODEL_1060	f	f	f	ACCESS NEEDED IN NEIGHBOR'S DWAY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.277+00	2026-03-07 10:27:53.277+00	\N	\N	\N	\N	f	f	t	*	UNABLE TO BE SCHEDULED	72	t	\N	\N
c28e05c0-f0cf-40dc-b2d0-12445b46af03	04c2927f-7b86-4c1c-9046-0bcef738ffa0	CRANE	ANTHONY	Pinebrook Dr.	Peabody	\N	\N	\N	10000.00	10.00	0.00	2022-11-07	\N	\N	\N	\N	MODEL_1090	f	f	f	NEEDS BOTH 1090 &1060                …..BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.281+00	2026-03-07 10:27:53.281+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	74	t	BUCKET	\N
6bb75d12-ba3a-4bd6-a355-e728d6f16778	456db9f0-9eff-4a70-856a-88b3820ac0ba	CRANE	ANTHONY	15 Summer St.	Rowley	\N	\N	\N	1800.00	1.50	0.00	2022-12-28	E 12/28	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.284+00	2026-03-07 10:27:53.284+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	76	t	\N	\N
ae21c24c-acf8-42be-8f99-dee2516d2ee6	0ea23fd4-83f7-4747-805a-f4a8b35fad4e	CRANE	ANTHONY	11 Wethersfield St.	Rowley	\N	\N	\N	3200.00	3.00	0.00	2022-12-21	E 12/21	E               1/12	\N	\N	MODEL_1060	f	f	f	DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.287+00	2026-03-07 10:27:53.287+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	77	t	\N	\N
b25d3288-89a9-48f4-92b1-99b19cea0838	73971a74-51f0-4aa2-afbb-ce0967adc727	CRANE	ANTHONY	76 Campmeeting Rd.	Topsfield	\N	\N	\N	3500.00	3.50	0.00	2023-01-19	E     1/19	\N	\N	\N	MODEL_1060	f	f	f	… BUCKET ALSO                                      W/ BUCKET                                                  NEEDS CONCOM	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.292+00	2026-03-07 10:27:53.292+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	79	t	BUCKET	\N
85b6b070-fab3-4ffc-b6b0-d8493974ac96	a55e6cdf-4a5f-4fda-95bb-7818aba1c821	CRANE	ANTHONY	45 Fox Run Rd.	Topsfield	\N	\N	\N	0.00	4.00	0.00	2022-04-28	\N	\N	\N	\N	MODEL_1060	f	f	f	T&M                                     WAITING ON CONCOM  …..BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.295+00	2026-03-07 10:27:53.295+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	80	t	BUCKET	\N
150f77db-fc46-4d21-8a94-3218a46e7d13	e3c02ad3-3bb3-4aa3-85de-ca3a600c4afc	CRANE	ANTHONY	41 Alderbrook Dr.	Topsfield	\N	\N	\N	6700.00	7.00	0.00	2021-11-22	\N	\N	\N	\N	MODEL_1060	f	t	f	TBRS FROM 4/11, WANTS TO BE DONE IN WINTER OF '23                                                      WINTER                                            ALS CREW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.298+00	2026-03-07 10:27:53.298+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	81	t	\N	\N
79c9de6b-0136-4baf-a0ca-7cba412e2c7f	fe0055af-e9f5-46a8-b43d-c29cc902f052	CRANE	ANTHONY	73 Bare Hill Rd.	Topsfield	\N	\N	\N	3000.00	3.00	0.00	2022-12-29	E 12/29	E                 1/12	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.301+00	2026-03-07 10:27:53.301+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	82	t	\N	\N
adc5e264-6a07-4742-9657-f06bc7291210	539a13a2-8e0c-4064-b1b3-5c65e3211cc4	CRANE	ANTHONY	18 Coppermine Rd.	Topsfield	\N	\N	\N	3500.00	4.00	0.00	2023-01-03	E 1/3	E            1/12	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.305+00	2026-03-07 10:27:53.305+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	83	t	\N	\N
6677703d-0279-4e0d-9909-4bdf7c7ce14e	b8db8406-386f-47ee-b564-82dfd8c82c9d	CRANE	ANTHONY	82 Cedar St.	Wenham	\N	\N	\N	2500.00	2.25	0.00	2021-11-09	\N	\N	\N	\N	MODEL_1060	f	f	f	DETAIL                            WANTS TO SCHEDULE FOR MAY-----NEEDS TO POSTPONE WILL CALL WHEN SHE IS READY.	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.308+00	2026-03-07 10:27:53.308+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	85	t	\N	\N
5b9dbc7b-3df0-41db-bf3d-7758f3e27f6a	9051a429-29f5-4fc2-ab57-f4442e5b6c4b	CRANE	ANTHONY	32 Mayflower Dr.	Wenham	\N	\N	\N	2000.00	2.00	0.00	2023-01-11	E 1/11	S,E                          1/17   E     1/23	\N	\N	MODEL_1060	f	f	f	CUSTOMER IS WORRIED ABOUT THE TREE WANTS DONE ASAP	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.314+00	2026-03-07 10:27:53.314+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	87	t	\N	\N
4b445333-e58e-4f5e-93c8-e5d7bf1ae2b7	77a583c1-2698-4b8d-b84a-7a3ef74b4bf1	CRANE	ANTHONY	Cart Path Rd.	Weston	\N	\N	\N	0.00	\N	0.00	2021-02-10	\N	\N	\N	\N	\N	f	f	f	HOLD 4 HRS / 1060; POSTPONED FROM 3/6- WAITING ON CON COM                                                   CRANE & CLIMBER ONLY                                           …SEE BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.318+00	2026-03-07 10:27:53.318+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	89	t	BUCKET	\N
d0157bbc-3c78-47fd-89a1-c7a5cd50be9d	2d267484-2fbd-4314-abf6-e22afc205aa9	CRANE	ANTHONY	17 River Meadow Dr.	W. Newbury	\N	\N	\N	3500.00	4.00	0.00	2021-04-20	\N	\N	\N	\N	MODEL_1060	f	t	f	WINTER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.321+00	2026-03-07 10:27:53.321+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	91	t	\N	\N
66e86399-9ddb-4458-9917-988baaee5fd5	764354fe-d22c-4dbc-ad20-20b6879ef8bb	CRANE	ANTHONY		W. Newbury	\N	\N	\N	0.00	8.00	0.00	2022-12-20	\N	DS	\N	\N	MODEL_1060	f	f	f	… BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.323+00	2026-03-07 10:27:53.323+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	92	t	BUCKET	\N
f64e590b-9ab8-405c-ae56-395f944072b2	dd1517ae-9b8d-49f9-96c0-a04dc7a929ed	CRANE	ANTHONY	4 Virginia Pl	Wenham	\N	\N	\N	5000.00	5.00	0.00	2021-08-28	\N	\N	\N	\N	MODEL_1060	f	f	f	FRIEND OF JM'S                      NOTHING PRESSING	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.311+00	2026-03-11 20:27:54.802+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	86	t	\N	\N
5402fe73-681a-4778-9b0d-25d4c2152746	660be50b-3e35-4d15-aced-4675d27f4d44	CRANE	DENNIS		Wenham	\N	\N	\N	0.00	\N	0.00	2020-03-06	\N	\N	\N	\N	\N	f	f	f	HOLD 4 HRS / 1090; PENDING STATUS UPDATE FROM ERIC                                         POSTPONED FROM 3/17; WILL NEED TO BE RESCHEDULED	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.329+00	2026-03-07 10:27:53.329+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	101	t	\N	\N
0167112f-c61a-4463-a991-de74d60100de	9fd15d93-63a1-4026-bd58-fe58b41d172c	CRANE	DENNIS	15 Stanton St.	Wenham	\N	\N	\N	4800.00	5.00	0.00	2022-11-21	\N	\N	\N	\N	MODEL_1060	f	f	t	FROZEN GROUND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.332+00	2026-03-07 10:27:53.332+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	102	t	\N	\N
ba66154d-1fdf-4776-b424-995de750a387	4ecca04f-79d5-4d14-abc7-0b4d6dc31107	CRANE	DENNIS	11 West Hollow	Andover	\N	\N	\N	2800.00	2.25	0.00	2023-01-13	E 1/13	E     1/24*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.334+00	2026-03-07 10:27:53.334+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	123	t	\N	\N
4142cedb-6a9a-42d9-b93b-50e305307342	f4648b4b-d266-4448-9b8b-64a8d93261cf	CRANE	DENNIS	63 Perry St.	Brookline	\N	\N	\N	4000.00	3.00	0.00	2022-11-09	E 11/9	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/9, NEEDS THEIR NEIGHBORS DRIVEWAY CLEARED AND THE DUMPSTER WILL BE REMOVED IN MARCH OF 2023, REACH OUT WITH A MARCH DATE                                                                       TBRS FROM 1/3 DUE TO CREW ISSUES                                                 CLIENT MUST COMMUNICATE WITH NEIGHBOR TO HAVE DWAY CLEARED WE WILL NEED THE ENTIRE DWAY.	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.338+00	2026-03-07 10:27:53.338+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	125	t	\N	\N
70df7148-3022-437f-bc0e-9a1e2460f3e2	86a3b5d7-7bc9-486a-8011-a461ff615e33	CRANE	DENNIS	65 Nixon Rd.	Framingham	\N	\N	\N	6500.00	5.50	0.00	2023-01-11	\N	MB	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/23 DUE TO WEATHER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.341+00	2026-03-07 10:27:53.341+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	127	t	\N	\N
4bdc268c-34ed-42b4-ae19-7a77012d94cb	b3f852d6-fda5-48ee-af42-aa837e17823f	CRANE	DENNIS	309 Garfield Rd.	Concord	\N	\N	\N	8500.00	8.00	0.00	2023-01-23	\N	E      1/24	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.346+00	2026-03-07 10:27:53.346+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	129	t	\N	\N
3cf33822-246e-40dc-9419-05d446c3ebfd	467d429e-3341-417b-8f9b-e8ea1caabc42	CRANE	DENNIS	17 Pegan Ln.	Natick	\N	\N	\N	6000.00	5.75	0.00	2023-01-10	\N	E    1/24	\N	\N	MODEL_1060	f	f	f	W/DW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.35+00	2026-03-07 10:27:53.35+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	131	t	\N	\N
b8ed94c1-e731-4180-8fe3-6750dbebbe8f	3df44978-c236-400c-9304-b2d3887ffbd4	CRANE	DENNIS	94 Lexington St.	Watertown	\N	\N	\N	4500.00	4.00	0.00	2023-01-23	\N	\N	\N	\N	MODEL_1060	f	f	f	W/ DETAIL X 2                                           ELECTRICAL MUST BE REMOVED FROM TREES                                                                    CONTACT INFO IS FOR HIS BROTHER NAMED ANTO                                                                                                                    STUMPS TBD ANOTHER TIME, MANY REQUIREMENTS NEEDED	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.354+00	2026-03-07 10:27:53.354+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	133	t	\N	\N
d29cae55-c875-49d4-b2ed-8dd3fb55c240	7f6c0ecd-eecc-45ee-a442-a29d48806861	CRANE	DENNIS	39 Oxbow Rd.	Wayland	\N	\N	\N	4500.00	4.00	0.00	2023-01-09	E 1/9*	E     1/24*	\N	\N	MODEL_1060	f	f	f	DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.357+00	2026-03-07 10:27:53.357+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	135	t	\N	\N
c7451bdc-1bb0-4c94-8092-91b04008a16f	a3065881-cc8b-4088-8593-c6c5ce28e335	CRANE	DENNIS	330 Billerica Rd.	Chelmsford	\N	\N	\N	2500.00	1.00	0.00	2022-12-05	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/18 DUE TO PERMIT NOT BEING APPROVED IN TIME	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.362+00	2026-03-07 10:27:53.362+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	142	t	\N	\N
039a90f3-10c0-4b52-8e60-bc6b87b9e7df	a3065881-cc8b-4088-8593-c6c5ce28e335	CRANE	DENNIS	330 Billerica Rd.	Chelmsford	\N	\N	\N	6000.00	6.00	0.00	2023-01-04	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 1/18 DUE TO PERMIT NOT BEING APPROVED IN TIME                                               WILL NEED PERMISSION FROM STATE ON HOLD FOR 1/18	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.366+00	2026-03-07 10:27:53.366+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	143	t	\N	\N
873ac612-2547-432b-9f84-c44daee1de0d	3a292d10-79cf-4ea8-9161-d640e2ad116a	CRANE	ANTHONY	126 Washington Street	Boxford	\N	\N	\N	3000.00	5.00	0.00	2025-11-24	\N	S, E 2/2	\N	\N	MODEL_1060	f	f	f	PUSH UP IF POSSIBLE                                RS 3/28                             TBRS FROM 1/31, NEEDS LESS SNOW                                    CRANE AND CLIMBER ONLY	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.962+00	2026-03-07 10:27:50.962+00	\N	\N	\N	\N	f	f	f	\N	CRANE	33	f	\N	\N
81ca1993-64fd-4e6c-b91c-fd1657b3ed28	a7ed71f6-fb88-4bb0-83cf-599d69ad6259	CRANE	ANTHONY	75 Phillips Avenue	S'scott	\N	\N	\N	2500.00	2.50	0.00	2026-02-19	\N	S, E 2/25*	\N	\N	MODEL_1060	f	f	f	…BUCKET ALSO                        WANTS TO BE SCHEDULED IN APRIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.792+00	2026-03-07 10:28:03.118+00	\N	\N	\N	\N	f	t	f	\N	CRANE	3	f	BUCKET	3682c5f0-2ee4-4a78-ac0c-473eac99a8a1
3682c5f0-2ee4-4a78-ac0c-473eac99a8a1	a7ed71f6-fb88-4bb0-83cf-599d69ad6259	BUCKET	ANTHONY	75 Phillips Avenue	S'scott	\N	\N	\N	1100.00	2.00	0.00	2026-02-19	\N	S, E        2/25*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.103+00	2026-03-07 10:28:03.118+00	\N	\N	\N	\N	f	f	t	73	BUCKET	5	f	\N	81ca1993-64fd-4e6c-b91c-fd1657b3ed28
6d98794e-3da3-4e45-ba0e-845ffc537330	ecd173ce-3efc-43d2-bb24-3360a7d4d82c	BUCKET	ANTHONY	154 Tedesco Street	M'head	2025-02-02	\N	\N	21950.00	24.50	0.00	2025-12-23	\N	AL	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.903+00	2026-03-07 10:28:03.13+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	6	f	\N	43116b4b-4207-415d-8efc-d6d93dee3c83
1222ce1d-d5e0-4d54-a7aa-1eff8508e847	f1ef2376-689b-465a-860a-b8843c1165a9	CRANE	UNASSIGNED	44 Cox Ln.	Methuen	\N	\N	\N	10200.00	8.00	0.00	2023-05-22	E 5/22	\N	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.012+00	2026-03-07 10:27:53.012+00	\N	\N	\N	\N	f	f	f	\N	DS OLD CRANE	10	f	\N	\N
d2eba811-8647-44fb-bcae-a4c3c55ce8ac	7e843fc5-410e-4ca0-a5f1-1c0099ca6065	BUCKET	ANTHONY	Bartletts Reach Rd	Amesbury	\N	\N	\N	10500.00	16.00	0.00	2025-10-17	\N	V, E 1/16*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.313+00	2026-03-07 10:27:51.313+00	\N	\N	\N	\N	f	f	t	78	BUCKET	64	f	\N	\N
c6233803-7768-4fac-892e-febbb131ead2	f23796f3-4f52-4b0d-bee9-1f041c7439d1	CRANE	ANTHONY	122 Huntington Road	Boston	\N	\N	\N	5600.00	4.00	0.00	2025-12-19	\N	S, E 1/29                                               S, E 1/22	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.816+00	2026-03-07 10:27:50.816+00	\N	\N	\N	\N	f	t	f	\N	CRANE	5	f	\N	\N
785d866b-e0c0-425b-9d32-f0061d41d3cb	14ebbd64-eceb-4d12-8679-a2ef8d36af76	CRANE	ANTHONY	225 Summer Street	Somerville	\N	\N	\N	5500.00	4.00	0.00	2025-08-29	E 8/29	\N	\N	\N	MODEL_1060	f	f	f	DID NOT REACH OUT TO CUSTOMER                                           RS 3/25                                TBRS FROM 2/25 DUE TO THE AMOUNT OF SNOW                                                   RS 2/25                                                       TBRS 2/3-DUE TO PERMIT AND SNOW                                                             RS FOR 2/3, AL WORKING ON PERMITS AS OF 1/15                                  TBRS FROM 11/25 PER AL - NO PERMIT - JOE WILL REACH OUT                                                                     HAS A HOLD ON 10/14 - CONFIRMED THAT WORKS                                                            DTL                                             NO PARKING AND OCCUPANCY PERMIT REQUIRED                                   TREE REMOVAL PERMIT-ALL SET                     NEED PERMISSION FROM NEIGHBOR	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.823+00	2026-03-07 10:27:50.823+00	\N	\N	\N	\N	f	f	f	\N	CRANE	6	f	\N	\N
088c24db-e94d-4fdf-8313-6c22b73701be	60928a59-3ce3-4fc9-99e6-6d6ce70d530e	CRANE	ANTHONY	5 Liberty Hill Avenue	Salem	\N	\N	\N	6100.00	5.50	0.00	2026-01-08	\N	S, E 1/8	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.846+00	2026-03-07 10:27:50.846+00	\N	\N	\N	\N	f	t	f	\N	CRANE	7	f	\N	\N
d8570710-3e8b-4f7a-a34f-a12bd23655d0	a83a0e41-b6f1-4ab5-b287-866c5f972d9c	CRANE	ANTHONY	70 Weatherly Drive	Salem	\N	\N	\N	5850.00	6.00	0.00	2026-02-16	\N	\N	\N	\N	MODEL_1060	f	f	f	DID NOT REACH OUT TO CUSTOMER                             REVISED 2/25	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.851+00	2026-03-07 10:27:50.851+00	\N	\N	\N	\N	f	f	f	\N	CRANE	8	f	\N	\N
73ecd980-8bc1-44c8-98cf-8c733244e34e	f57dac4e-7104-4e4c-8abe-ec9ab89d3ef8	CRANE	ANTHONY	25 Chatham Way	Lynnfield	\N	\N	\N	8100.00	8.00	0.00	2026-01-19	\N	V, E 1/19*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.869+00	2026-03-07 10:27:50.869+00	\N	\N	\N	\N	f	t	t	YES	CRANE	10	f	\N	\N
1729cf97-6e48-43d0-bc75-9f02d0e819e5	60a14175-b5dc-485b-96f7-27567075a741	BUCKET	ANTHONY	31 Arlington Street	Woburn	\N	\N	\N	750.00	1.50	0.00	2026-02-17	\N	V, E 2/17            S             2/18*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.094+00	2026-03-07 10:27:51.094+00	\N	\N	\N	\N	f	f	t	73	BUCKET	3	f	\N	\N
737594b6-a305-4778-990e-f9557ceee70e	2d318651-d2e4-4d68-b231-18d0c742d601	BUCKET	ANTHONY	215 Green Street	M'head	\N	\N	\N	1800.00	2.00	0.00	2026-02-24	\N	S, E        2/24*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.099+00	2026-03-07 10:27:51.099+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	4	f	\N	\N
1b741987-9cd5-48b1-b573-cef1e8aad0d1	633dbacd-89e4-4a7c-8758-d0875e221507	BUCKET	ANTHONY	85 Market Street	Lawrence	\N	\N	\N	1650.00	3.00	0.00	2025-11-20	\N	S, E 2/2	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.111+00	2026-03-07 10:27:51.111+00	\N	\N	\N	\N	f	f	t	73	BUCKET	7	f	\N	\N
13b6b5b2-6955-4e31-8583-d15a3c4329dd	02ab56b2-d9a3-4fd9-bade-18d6c5b4ef1d	BUCKET	ANTHONY	50 Plymouth Avenue	S'scott	\N	\N	\N	2100.00	4.00	0.00	2026-01-05	\N	V, E 2/25*	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.12+00	2026-03-07 10:27:51.12+00	\N	\N	\N	\N	f	f	t	73	BUCKET	9	f	\N	\N
a9e7b8b6-cc96-463b-a064-960a3cbb75e9	15f4147e-a4fd-4f5c-b2ab-f6f643c9f276	BUCKET	ANTHONY	360 Charles Street	Malden	\N	\N	\N	2450.00	4.50	0.00	2026-02-15	\N	S, E 2/16*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.125+00	2026-03-07 10:27:51.125+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	10	f	\N	\N
945b6629-28f7-48dc-94e8-4295c9a7318d	d2a95312-f96d-4316-b321-cd1fe3ca89b7	BUCKET	ANTHONY	3 Nina Street	Stoneham	\N	\N	\N	3100.00	5.00	0.00	2026-01-07	\N	S, E 1/28	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.129+00	2026-03-07 10:27:51.129+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	11	f	\N	\N
68ddf799-0ab0-4bfc-b2c2-dd1c74704de7	1ed17530-f5d0-4dd5-807a-916669e957b7	BUCKET	ANTHONY	111 Elm Street	M'head	\N	\N	\N	1100.00	2.50	0.00	2026-01-28	\N	\N	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.133+00	2026-03-07 10:27:51.133+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	12	f	\N	\N
9a1e048a-3450-4164-b5a2-7e42fecd498f	d1d7929f-560a-42e5-bc43-211e7cce4933	BUCKET	ANTHONY	96 Chestnut Street	N. Reading	\N	\N	\N	3800.00	5.50	0.00	2025-10-24	\N	V, E 2/2*	\N	\N	\N	t	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.137+00	2026-03-07 10:27:51.137+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	13	f	\N	\N
ba82b37a-3cba-4206-b5af-986ca0d6a6eb	87dea936-62a3-48a4-951c-ca1446c2aacb	BUCKET	ANTHONY	5 Fox Run Rd	Topsfield	\N	\N	\N	2675.00	5.50	0.00	2026-02-25	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.139+00	2026-03-07 10:27:51.139+00	\N	\N	\N	\N	f	f	f	\N	BUCKET	14	f	\N	\N
a31e2463-8b39-4045-9373-3c7df1b788df	4f23c8a1-53b2-4689-9154-b0bd2d95c06f	CRANE	AUSTIN	219 Smith Street	Waltham	2026-02-03	\N	\N	7000.00	5.50	0.00	2025-11-12	\N	V, E 2/2                             V, E 11/24*	\N	\N	MODEL_1060	f	f	f	P/U FROM 2/10                                          …BUCKET ALSO                                          DETAIL                                   w/ BUCKET FOR CLIMBER                                  CLOSE TO WIRES	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.814+00	2026-03-07 10:27:51.814+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	96	f	BUCKET	\N
b3486ac9-9ee9-4cde-ace3-3a6532f110ae	e20a4438-8fc1-469a-963a-55bcad45d4fb	CRANE	DENNIS	14 Rocky Hill Circle	Danvers	2026-01-16	\N	\N	4000.00	4.00	0.00	2026-01-08	\N	DS	\N	\N	MODEL_1060	f	f	f	P/U FROM 3/2 TO 1/16	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.681+00	2026-03-07 10:27:51.681+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	65	f	\N	\N
de4456d9-0089-48f4-9441-67f22eb71adf	538f0595-c2ec-494f-bf3c-b3ca4f080c2e	BUCKET	DENNIS	65 West Street	Beverly	\N	\N	\N	9750.00	19.50	0.00	2025-11-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.834+00	2026-03-07 10:27:52.834+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	17	f	\N	\N
3255e838-9203-4bb8-a315-424de0c9b175	0c6d171a-8e72-49b9-b22b-7e1d0bd17873	CRANE	ANTHONY	3 Buttonwood Lane	Peabody	2026-02-25	\N	\N	2950.00	1.50	0.00	2026-02-24	\N	S, E 2/24	\N	\N	MODEL_1060	f	f	f	ER                                                                                                             DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.4+00	2026-03-07 10:27:51.4+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	3	f	\N	\N
0cbfba9a-3e92-4a13-9edb-eb5ec22ec9a6	98bcfbae-e37d-4a72-8816-5086db757f04	CRANE	ANTHONY	15 Elma Rd	N. Reading	2026-02-25	\N	\N	5600.00	3.00	0.00	2026-02-24	\N	S, E 2/24	\N	\N	MODEL_1060	f	f	f	ER                                       CHIPPER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.406+00	2026-03-07 10:27:51.406+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	4	f	\N	\N
9469eb93-360a-4c6d-8d90-cb76203cf83e	442c9996-775e-493d-b703-d95942b458ce	CRANE	ANTHONY	22 Woodland Dr.	N. Reading	2026-02-16	\N	\N	4300.00	4.50	0.00	2026-01-19	\N	S, E 1/19	\N	\N	MODEL_1060	f	f	f	REAR NEIGHBOR CONSENT. - ALL SET!	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.409+00	2026-03-07 10:27:51.409+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	5	f	\N	\N
77099464-acea-4bfa-86b8-18d1260487da	58f12f00-431f-447f-b6e9-001f7b37e53b	CRANE	ANTHONY	12 Heritage Way	N. Reading	2026-02-16	\N	\N	3700.00	3.50	0.00	2025-11-26	\N	E 12/11              S 12/31	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.414+00	2026-03-07 10:27:51.414+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	6	f	\N	\N
848360de-8ab1-4b04-98f8-1d1965d38838	b2c4e818-e419-4427-a744-ab1489e569e8	CRANE	ANTHONY	5 Buena Vista Ave West	Salem	2026-02-10	\N	\N	1500.00	1.75	0.00	2026-02-05	\N	V,E             2/5*	\N	\N	MODEL_1060	f	f	f	friends and family - jm	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.419+00	2026-03-07 10:27:51.419+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	7	f	\N	\N
7ec58745-a1b8-465f-b5a2-dbd0bd7bcf35	f50a32ef-4022-41bb-abbc-0595c73b7e4e	CRANE	ANTHONY	12 Sussex Court	Haverhill	2026-02-05	\N	\N	3150.00	3.00	0.00	2025-11-18	\N	S, E 12/3	\N	\N	MODEL_1060	f	f	f	WANTS AFTER THE HOLIDAYS	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.427+00	2026-03-07 10:27:51.427+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	9	f	\N	\N
eef15aa8-898d-4fc3-b153-2bcd66958e5c	1e57282a-0a7b-418f-8d33-71666b128ae3	CRANE	ANTHONY	21 Bay View Drive	S'scott	2026-02-05	\N	\N	3800.00	3.50	0.00	2025-12-24	\N	V, E 12/30*      V,T               2/4*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.431+00	2026-03-07 10:27:51.431+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	10	f	\N	\N
f9800a61-defe-422e-9758-7aa2e0373f9d	81feedf0-cb57-45fd-998f-8407512da6ed	CRANE	ANTHONY	101 Bridge Street	Salem	2026-02-05	\N	\N	2750.00	2.50	0.00	2026-01-05	AL	V, E 1/6*	\N	\N	EITHER	f	f	f	PU TO 2/5 FROM 2/6 DUE TO SCHED. PURPOSES                                 W/DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.435+00	2026-03-07 10:27:51.435+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	11	f	\N	\N
f8a2a7bc-626b-4fb3-8868-80d8403335ba	53a0051d-e1a4-4b26-acc8-add46c4134f7	CRANE	ANTHONY	220 Boston Street	N. Andover	2026-02-03	\N	\N	3400.00	3.00	0.00	2026-01-15	\N	S, E 2/2                                 V, E                      1/16*	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.446+00	2026-03-07 10:27:51.446+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	13	f	\N	\N
7cfdb352-51f8-4fb9-bc9c-4b97a2ea6540	bed1d51d-1c0b-42cc-b371-7a8c6812371f	CRANE	ANTHONY	3 Will Sawyer Street	Peabody	2026-02-02	\N	\N	3000.00	3.00	0.00	2026-01-12	\N	V, E 1/14*              S                  2/2	\N	\N	MODEL_1090	f	f	f	PU FROM 2/6 TO 2/2	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.45+00	2026-03-07 10:27:51.45+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	14	f	\N	\N
b76958d7-ed7e-4df9-8651-616b9f7cad03	a9dfb6a3-7a74-4c89-8377-74edb54a326b	CRANE	ANTHONY	185 North St	N. Reading	2026-02-02	\N	\N	2850.00	2.00	0.00	2025-12-31	\N	S, E 2/2	\N	\N	MODEL_1060	f	f	f	RS 2/2                                        TBRS 1/19 DUE TO WEATHER                                                                 DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.457+00	2026-03-07 10:27:51.457+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	16	f	\N	\N
4dd30d6e-f02a-4773-9b44-6b75d02fe618	953510bd-d294-40fd-b3d0-3661045341b4	CRANE	ANTHONY	173 Storey Avenue	Nbpt	2026-02-02	\N	\N	3550.00	3.00	0.00	2025-12-04	\N	V, E 12/11*	\N	\N	MODEL_1090	f	f	f	ASKING FOR DATE                          …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.454+00	2026-03-07 10:28:03.136+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	15	f	BUCKET	f4825f5c-3c6b-4b2a-9fa2-bc005b30d95a
1d9566a0-796e-4a1e-8fa1-75adfea2f498	2d7565f4-9215-401a-8330-373fa2d3ba61	CRANE	ANTHONY	361 Kenoza St	Haverhill	2026-02-03	\N	\N	2950.00	3.00	0.00	2025-12-22	\N	S, E 12/22      S               2/2	\N	\N	EITHER	f	f	f	PU TO 2/3 FROM 2/5                                      PUSH UP IF POSSIBLE                          NO EMAIL	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.44+00	2026-03-07 10:27:51.44+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	12	f	\N	\N
9e6f2916-8eca-4a42-bb2a-a1eddc4dfb32	fe871253-09a7-44a0-9afb-60001ba9d559	CRANE	ANTHONY	17 Sheridan Road	Andover	2026-01-14	\N	\N	3350.00	3.00	0.00	2025-10-20	\N	V, E 10/29*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.506+00	2026-03-07 10:27:51.506+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	26	f	\N	\N
aedade0e-40fc-4a56-81e4-1dff2c929d8e	1a75b6d3-77d6-496a-babb-7feea1278688	CRANE	ANTHONY	9 Pioneer Circle	Andover	2026-01-14	\N	\N	4100.00	4.00	0.00	2025-10-27	\N	V, E 10/29*	\N	\N	EITHER	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.51+00	2026-03-07 10:27:51.51+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	27	f	\N	\N
41f1976e-a03b-466c-8a3f-746754a9cc16	8c442bf1-eb55-4208-8660-1edccd6c5e41	CRANE	ANTHONY	47 Longmeadow Drive	Rowley	2026-01-09	\N	\N	4400.00	4.00	0.00	2025-12-08	\N	S 1/8	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.514+00	2026-03-07 10:27:51.514+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	28	f	\N	\N
7043761e-0df7-4eac-bd8d-2a5c73a7757d	afe17784-59e4-4df0-bfb4-8bb5769e9de5	CRANE	ANTHONY	15 Crestwood Road	N. Reading	2026-01-08	\N	\N	4000.00	3.50	0.00	2025-08-07	E 8/7	V, E 10/29*	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.518+00	2026-03-07 10:27:51.518+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	29	f	\N	\N
2dd509e6-82a4-4797-b846-f3c7e7be6b80	84f7f35c-90df-4bfa-8899-bc863236e24e	CRANE	ANTHONY	19 Crestwood Road	N. Reading	2026-01-06	\N	\N	6100.00	5.50	0.00	2025-12-29	\N	V, E, T 1/5*	\N	\N	MODEL_1090	f	f	f	NEIGHBOR CONSENT TO ACCESS BACK LEFT NEIGHBORS DRIVEWAY - ALL SET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.535+00	2026-03-07 10:27:51.535+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	33	f	\N	\N
f8b4a3b5-a54a-4f63-858c-1b20e0e427c4	cd343daf-71d8-44a8-9554-83cc02de4f84	CRANE	ANTHONY	5 Westward Circle	N. Reading	2026-01-05	\N	\N	2400.00	2.00	0.00	2025-10-13	E 10/29	S, E 11/5	\N	\N	MODEL_1060	f	f	f	…..BUCKET ALSO                        NEIGHBOR PERMISSION	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.539+00	2026-03-07 10:27:51.539+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	34	f	BUCKET	\N
6b6648fa-119c-49e9-828a-f26e86106b8b	7d344027-8d7c-41f7-bf8e-92773d839ecb	CRANE	ANTHONY	197 North Main Street	Middleton	2026-02-02	\N	\N	4500.00	4.50	0.00	2026-01-14	\N	S, E 1/19	\N	\N	MODEL_1060	f	f	f	RS TO 2/2                                                    TBRS 1/19-DUE TO WEATHER                                         …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.47+00	2026-03-07 10:28:03.147+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	18	f	BUCKET	44d120ac-0736-483c-aab9-b4cd8437465a
dd98d1e6-5ff2-4d54-93ec-8e45d084a6f9	e94c33fe-f565-45bb-a3ef-176324c268fb	CRANE	ANTHONY	4 Norwood Street	Winchester	2026-01-20	\N	\N	3300.00	3.00	0.00	2026-01-12	\N	S        1/20	\N	\N	MODEL_1090	f	f	f	P/U FROM 2/3 TO 1/20	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.494+00	2026-03-07 10:27:51.494+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	23	f	\N	\N
c56e0899-81d5-4ad7-8217-8c8aace5c572	6392b6df-8951-4d81-b99e-25a7ada18e14	CRANE	ANTHONY	16 Anthony Road	N. Reading	2026-01-08	\N	\N	3400.00	3.50	0.00	2025-12-23	\N	V, T 1/7*	\N	\N	MODEL_1090	f	f	f	P/U FROM 2/16 TO 1/8                                                      …BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.522+00	2026-03-07 10:27:51.522+00	\N	\N	\N	\N	f	f	t	YES	2026 Crane Completed	30	f	BUCKET	\N
f32ef255-7ff6-4ca4-af50-28198e47a6eb	c035a873-8fae-4869-b315-9d0261936982	BUCKET	ANTHONY	13 George Ave.	Woburn	2026-02-19	\N	\N	0.00	1.50	0.00	2025-10-30	\N	V, E 1/28*	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.895+00	2026-03-07 10:27:51.895+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	4	f	\N	\N
9f86868c-fb1b-4ca7-a4b2-a7f4e76f50b2	f2f70b73-a4f1-4fc5-892a-517a2b02451d	BUCKET	ANTHONY	300 Commonwealth Ave	Danvers	2026-02-17	\N	\N	1100.00	2.00	0.00	2026-02-16	\N	AL	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.899+00	2026-03-07 10:27:51.899+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	5	f	\N	\N
3641c22f-162c-4e54-b711-91dcc5dcc55b	7e21054d-d284-4443-83f1-00991fae7576	BUCKET	ANTHONY	300 Commonwealth Ave.	Danvers	2026-02-12	\N	\N	2900.00	4.00	0.00	2026-02-11	\N	AL	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.906+00	2026-03-07 10:27:51.906+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	7	f	\N	\N
597d56f8-2c60-41b2-b6d8-cd18f95e5821	f2f70b73-a4f1-4fc5-892a-517a2b02451d	BUCKET	ANTHONY	300 Commonwealth Ave	Danvers	2026-12-03	\N	\N	10500.00	12.00	0.00	2025-11-24	\N	AL	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.909+00	2026-03-07 10:27:51.909+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	8	f	\N	\N
41f6a8d0-5b20-43c9-9b73-cd9a2d007870	cf678107-6f03-4435-8c48-9522adff7c6c	BUCKET	ANTHONY	17 Ballardvale Road	Andover	2026-02-11	\N	\N	750.00	1.75	0.00	2026-02-02	\N	S, E 2/4	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.913+00	2026-03-07 10:27:51.913+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	9	f	\N	\N
fe2368a1-1d10-402a-a04e-0a3a23d784c6	61ce6236-3ca7-427c-96ed-29a6de671985	BUCKET	ANTHONY	139 Atlantic Avenue	S'scott	2026-02-05	\N	\N	725.00	1.50	0.00	2026-01-12	\N	S, E 1/12	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.917+00	2026-03-07 10:27:51.917+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	10	f	\N	\N
1bc085be-b70c-42bd-b5b7-31d48c1dfeca	39412db5-1cfe-4a82-94f4-3cabde1c9380	BUCKET	ANTHONY	34 Gale Road	S'scott	2026-02-05	\N	\N	3250.00	5.50	0.00	2026-01-05	\N	V, E                        1/6*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.92+00	2026-03-07 10:27:51.92+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	11	f	\N	\N
87934dff-b9cc-4020-aa66-1f644f38d6fd	8fba72bf-592b-40e3-a3c8-e3d9b3972d0e	BUCKET	ANTHONY	12 Fells Rd	Winchester	2026-02-03	\N	\N	2050.00	4.00	0.00	2025-12-29	\N	S, E 2/2                          V, E 1/28*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.924+00	2026-03-07 10:27:51.924+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	12	f	\N	\N
4c4086e0-4944-4321-a097-07c7981a064a	26a12ca5-4114-40c3-9d11-8d903f7165c5	BUCKET	ANTHONY	24 Hillcrest Parkway	Winchester	2026-02-03	\N	\N	1050.00	2.00	0.00	2026-01-27	\N	V, E 2/2*                                      V, E 1/28*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.928+00	2026-03-07 10:27:51.928+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	13	f	\N	\N
c2feb8f2-f79c-4d34-b9fd-77471ee234c0	993d2b43-74c9-41e8-966a-d18e9b884b14	BUCKET	ANTHONY	11 Winthrop Avenue	Reading	2026-02-03	\N	\N	1900.00	3.00	0.00	2025-12-31	\N	S, E 1/6        S                      2/2	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.931+00	2026-03-07 10:27:51.931+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	14	f	\N	\N
aa16e486-e5d6-4af9-a442-76b6d7b078d3	ec35c59c-cc4c-45b3-bb10-bf9e2e943cb7	BUCKET	ANTHONY	960 Johnson Street	N. Andover	2026-02-03	\N	\N	1700.00	3.00	0.00	2026-01-05	\N	S, E                 1/6	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.935+00	2026-03-07 10:27:51.935+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	15	f	\N	\N
d5fd44d2-b123-4ac3-9612-57f783e954bd	1b605509-97ca-4025-9c65-071a41a7a21c	BUCKET	ANTHONY	13 Meadowlark Farm Ln.	Middleton	2026-02-02	\N	\N	0.00	0.50	0.00	2025-10-30	\N	S, E 1/23        S             2/2	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.941+00	2026-03-07 10:27:51.941+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	17	f	\N	\N
e93d082e-3f48-4dd2-8605-34a09a493ee1	bc6fba85-1116-4863-90a2-b05782e8aabc	BUCKET	ANTHONY	42 Fellsmere Road	Malden	2026-01-28	\N	\N	750.00	1.50	0.00	2026-01-12	\N	S, E  1/13	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.945+00	2026-03-07 10:27:51.945+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	18	f	\N	\N
a28730d1-c265-447a-9088-d49be9fd6bcb	9178db91-04b9-4325-a4c8-dc3574e001b2	BUCKET	ANTHONY	11 West Avenue	Salem	2026-01-28	\N	\N	600.00	1.00	0.00	2026-01-06	\N	S, E             1/8	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.948+00	2026-03-07 10:27:51.948+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	19	f	\N	\N
1ef432b2-debe-42c7-acc7-04ad9049213e	fc6f7377-5c14-40df-a21a-0ac312738bd5	BUCKET	ANTHONY	30 Alberta Avenue	Nbpt	2026-01-23	\N	\N	700.00	1.50	0.00	2025-12-09	\N	S, E 1/19	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.952+00	2026-03-07 10:27:51.952+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	20	f	\N	\N
0626a40a-afc1-4509-863e-704c038e2196	527bc8cf-cdbf-4a94-81a3-83a9c022892d	BUCKET	ANTHONY	351 Lake Street	Haverhill	2026-01-22	\N	\N	2700.00	4.00	0.00	2025-11-05	\N	S, E 12/30	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.958+00	2026-03-07 10:27:51.958+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	22	f	\N	\N
f0969d15-872a-4236-b522-4b515d0c3e05	9d79bb91-1c9c-41d3-bbf1-a7b1bffbeafa	BUCKET	ANTHONY	126 1/2 Federal Street	Salem	2026-01-21	\N	\N	650.00	0.50	0.00	2026-01-19	\N	S            1/20	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.961+00	2026-03-07 10:27:51.961+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	23	f	\N	\N
aa085506-d0eb-45ee-b901-a00b8eed9254	b6b7c6cf-7fc3-4795-8c77-b8a34b9d0c9e	BUCKET	ANTHONY	165 Newburyport Turnpike	Rowley	2026-01-21	\N	\N	2000.00	4.00	0.00	2026-01-21	\N	AL	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.965+00	2026-03-07 10:27:51.965+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	24	f	\N	\N
820ab12f-8696-455c-a5b7-1d4351f489e0	37d71c0f-b200-4f28-865b-7db04de01678	BUCKET	ANTHONY	4 Seamount Road	Peabody	2026-01-21	\N	\N	500.00	1.00	0.00	2026-01-16	\N	V ,E, T 1/20*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.969+00	2026-03-07 10:27:51.969+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	25	f	\N	\N
80b543b9-0299-4fb5-bd90-364eb94d9030	3474a489-4df5-4bae-9fe6-b66635ab22eb	BUCKET	ANTHONY	42 Winthrop Ave	Reading	2026-01-21	\N	\N	3550.00	6.50	0.00	2025-12-08	\N	S, E 12/17                      S, E 1/6	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.972+00	2026-03-07 10:27:51.972+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	26	f	\N	\N
857fd832-109f-4d8d-9e0f-4a700c37fa18	5906bd03-c575-4217-9a4f-72cf8bc774da	BUCKET	ANTHONY	41 Saile Way	N. Andover	2026-01-20	\N	\N	2350.00	4.00	0.00	2025-12-05	AL	S                    1/19	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.975+00	2026-03-07 10:27:51.975+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	27	f	\N	\N
3d906fe4-1910-4989-b734-861941ceb79f	d685e5c0-f99d-4143-8251-c5886f7b8588	BUCKET	ANTHONY	36 Highland Ave	Lynnfield	2026-01-20	\N	\N	2100.00	3.50	0.00	2025-12-08	\N	S, E 12/17	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.978+00	2026-03-07 10:27:51.978+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	28	f	\N	\N
725efcf7-121a-4b32-b076-604da553a955	93033a76-050d-4257-9bb4-e854cf1c7434	BUCKET	ANTHONY	1650 Turnpike St	N. Andover	2026-02-03	\N	\N	14000.00	16.00	0.00	2025-11-22	\N	C, E 1/8*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.938+00	2026-03-07 10:28:03.141+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	16	f	\N	f841dc58-493e-4200-b832-c594a364cea1
44d120ac-0736-483c-aab9-b4cd8437465a	7d344027-8d7c-41f7-bf8e-92773d839ecb	BUCKET	ANTHONY	197 North Main Street	Middleton	2026-01-16	\N	\N	2500.00	4.50	0.00	2026-01-14	\N	S, E 1/15	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.981+00	2026-03-07 10:28:03.147+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	29	f	\N	6b6648fa-119c-49e9-828a-f26e86106b8b
1401503b-4f8e-4bf2-8881-95f1fdfcaa9e	a76b8196-9b91-4160-9e89-b4b63557d9cc	BUCKET	ANTHONY	2 Hawkes Lane	Lynnfield	2026-01-14	\N	\N	2850.00	4.50	0.00	2025-12-08	\N	V, E 12/17*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.991+00	2026-03-07 10:27:51.991+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	32	f	\N	\N
59580b13-4a0f-46fa-a65d-30785b67f27b	7389abb1-b59d-4b8e-bc49-31437ed0783f	BUCKET	ANTHONY	15 Richards Road	Lynnfield	2026-01-13	\N	\N	3200.00	5.00	0.00	2025-12-04	\N	V, E 12/11*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.994+00	2026-03-07 10:27:51.994+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	33	f	\N	\N
cd9e03ff-05e3-4640-b016-4cd3be7654b4	1b499fc5-7a36-48c0-b142-cc252957e74e	BUCKET	ANTHONY	55 Kensington Lane	S'scott	2026-01-12	\N	\N	2350.00	4.00	0.00	2025-12-23	\N	V, E 12/30*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.998+00	2026-03-07 10:27:51.998+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	34	f	\N	\N
3e63bd5b-3aef-4a46-a6d1-1fc00a494b72	8e611796-4201-4ac3-b47e-f5da5a81df38	BUCKET	ANTHONY	230 Johnson Street	N. Andover	2026-01-12	\N	\N	3500.00	4.00	0.00	2026-01-05	\N	V, E           1/5*	\N	\N	\N	f	f	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.001+00	2026-03-07 10:27:52.001+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	35	f	\N	\N
7c818df8-16f9-430f-82ed-4d80b351b22b	f7b9e401-78f5-4532-afa1-c312a4f2a34d	BUCKET	ANTHONY	142 Front Street	M'head	2026-01-12	\N	\N	2450.00	4.00	0.00	2025-12-10	\N	S, E 12/17	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.004+00	2026-03-07 10:27:52.004+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	36	f	\N	\N
2b718582-e8ce-499a-b0bd-42cd21f400e0	43f6a6e8-93af-4e93-b25e-9781e61a189e	BUCKET	ANTHONY	10 Eastman Road	Andover	2026-01-12	\N	\N	2250.00	3.50	0.00	2025-12-30	\N	V, E            1/6*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.008+00	2026-03-07 10:27:52.008+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	37	f	\N	\N
c293a548-8e7a-474f-963c-3a14e0ccbb88	92774bd8-6ef4-4864-8f32-c449f56810ae	BUCKET	ANTHONY	178 West Street	Reading	2026-01-07	\N	\N	950.00	1.50	0.00	2025-11-18	\N	S, E               12/3	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.011+00	2026-03-07 10:27:52.011+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	38	f	\N	\N
192c6a23-577a-4b6e-a335-f6222cefbb25	4d47e76c-ba7c-470d-9461-b869d7883c5d	BUCKET	ANTHONY	89 Central Street	N. Reading	2026-01-07	\N	\N	1500.00	3.00	0.00	2026-01-05	\N	AL	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.018+00	2026-03-07 10:27:52.018+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	40	f	\N	\N
78b79ba2-104b-41f0-803c-434a8470b0c6	01fb323a-30f9-4166-a8cc-75d1605c0303	BUCKET	ANTHONY	9 Lamancha Way	Andover	2025-01-07	\N	\N	0.00	1.00	0.00	2025-12-23	\N	S             12/31	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.021+00	2026-03-07 10:27:52.021+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	41	f	\N	\N
2fcb93e1-bf50-49dd-adf2-65f73aa8bd04	24204b7f-a039-414d-9a06-7cf8300c8569	BUCKET	ANTHONY	17 March Street Court	Salem	2026-01-06	\N	\N	1200.00	2.50	0.00	2025-12-31	\N	S              1/6	\N	\N	\N	f	f	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.025+00	2026-03-07 10:27:52.025+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	42	f	\N	\N
8279a1ac-22f9-491c-8da4-4af000cdd02c	2b9d6eaf-681c-404d-be66-bc7458860488	BUCKET	ANTHONY	22 Woodside Street	Salem	2025-01-06	\N	\N	750.00	1.50	0.00	2025-11-20	\N	S, E                       12/3	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.029+00	2026-03-07 10:27:52.029+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	43	f	\N	\N
38dd0709-37b9-4389-924b-142403ece388	0ba75834-b23a-4774-8172-4c491f79c9ab	BUCKET	ANTHONY	3 Colby Road	Peabody	2026-01-06	\N	\N	1150.00	2.00	0.00	2025-11-29	\N	S, E 12/3	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.032+00	2026-03-07 10:27:52.032+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	44	f	\N	\N
5aa3f4db-c11b-436d-8b04-7a033b9efbec	2d3be3ac-a292-4e22-8fe4-31104e544361	BUCKET	ANTHONY	6 Centennial Drive	Peabody	2026-01-06	\N	\N	1150.00	2.00	0.00	2025-11-18	\N	S, E 12/3	\N	\N	\N	f	f	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.036+00	2026-03-07 10:27:52.036+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	45	f	\N	\N
6e54579a-82d7-4551-aae2-772f6f9017bd	6054a248-b880-40ed-a6ba-c96f682d056b	BUCKET	ANTHONY	30 Alberta Ave	Nbpt	2026-01-23	\N	\N	700.00	1.50	0.00	2026-12-09	\N	S, E 1/19	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.261+00	2026-03-07 10:27:52.261+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	107	f	\N	\N
674b23d6-d9aa-4107-86df-29281671dd98	dc296e24-59f7-457c-9bac-66be52653d6f	BUCKET	ANTHONY	6 Westward Circle	N. Reading	2026-01-21	\N	\N	600.00	1.00	0.00	2026-01-12	\N	V, E 1/13*	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.306+00	2026-03-07 10:27:52.306+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	119	f	\N	\N
9d3559b2-7e83-4f6e-a065-737271a4458e	89a9303a-78ab-4bea-a806-a16ca9697a09	BUCKET	ANTHONY	56 Academy Rd.	N. Andover	2026-01-22	\N	\N	1100.00	1.75	0.00	2025-10-17	\N	ER	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.544+00	2026-03-07 10:27:52.544+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	188	f	\N	\N
d77dc222-2427-4988-af72-26a9a8756d6d	17553d2c-a464-4af4-9a7f-2a2cd10dc37e	CRANE	ANTHONY	31 Rock Brook Way	Boxford	\N	\N	\N	4900.00	4.50	0.00	2022-08-04	\N	\N	\N	\N	MODEL_1090	f	f	f	… BUCKET ALSO                               FALL                                                    NEEDS CONCOM	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.123+00	2026-03-07 10:27:53.123+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	3	t	BUCKET	\N
3df88d10-b1cc-494a-a28d-f72250fb308e	cf0af606-bd38-474c-8e20-478ae1306999	CRANE	ANTHONY	5 Ruth Cir.	Haverhill	\N	\N	\N	3400.00	3.00	0.00	2022-07-28	\N	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 9/8                     CUSTOMER WOULD LIKE A NEW DATE BEFORE 5/1/23	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.127+00	2026-03-07 10:27:53.127+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	5	t	\N	\N
669a5238-3e27-4134-ac7b-4198215300c8	c2f93cf8-d20a-486f-be84-d7968d31cd6c	CRANE	ANTHONY	6 Parker Hill Ave	Lynn	\N	\N	\N	3900.00	4.00	0.00	2022-03-30	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 5/6 DUE TO NOT TAKING DOWN SUPPORT LINE IN TIME                     …BUCKET ALSO                           W/ DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.131+00	2026-03-07 10:27:53.131+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	7	t	BUCKET	\N
8aef876b-a6f9-453b-adbe-7e4079afb186	23843822-1fd5-4b95-a534-15e2b71d9bdb	CRANE	ANTHONY	10 Central St.	M'head	\N	\N	\N	3050.00	2.50	0.00	2022-10-27	E 10/27	\N	\N	\N	MODEL_1060	f	f	f	CRANE PORTION ON HOLD. THERE IS A CAR THAT IS UNABLE TO BE MOVED AND NO ONE KNOWS THE OWNER. POLICE CAN'T TAKE ACTION UNTIL IT SNOWS                                                                        TBRS FROM 11/28 DUE TO DETAIL NOT SHOWING                                                                             DETAIL                  …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.139+00	2026-03-07 10:27:53.139+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	10	t	BUCKET	\N
c2f54f5f-0628-4f82-a740-ae2cf62bdea9	c39948cc-15a6-409f-80d3-b5b6366e6b22	CRANE	ANTHONY	82 Birch St.	Peabody	\N	\N	\N	8050.00	8.00	0.00	2022-05-12	E 5/12	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 6/23, CUSTOMER NEEDS TO POSTPONE                                            DETAIL                                    CLIENTS WILL BE AWAY JULY 4TH-11TH DO NOT SCHEDULE FOR THOSE DATES.	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.156+00	2026-03-07 10:27:53.156+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	16	t	\N	\N
76ffa7fe-9ce7-4510-8235-f68b2169b04b	2e4b5850-c556-455b-a11e-9dcd950bec80	CRANE	ANTHONY	3 Ingraham Terr.	Swampscott	\N	\N	\N	5150.00	4.50	0.00	2022-11-04	E 11/4	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 1/16 DUE TO STILL NEEDING NATIONAL GRID TO COME OUT                                            TBRS FROM 12/16 STILL WAITING ON NATIONAL GRID TO REMOVE A WIRE.	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.16+00	2026-03-07 10:27:53.16+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	18	t	\N	\N
5fc0dc5a-6544-40fe-ba3f-60d8fcb52969	41042843-3604-402c-b62b-7848e24186bd	CRANE	ANTHONY	97 Lake St.	Tewksbury	\N	\N	\N	4000.00	4.00	0.00	2023-01-13	\N	\N	\N	\N	MODEL_1060	f	f	f	FIRM GROUND DUE TO CREW NEEDING TO DRIVE ON LAWN TO AVOID NEEDING A POLICE DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:53.169+00	2026-03-07 10:27:53.169+00	\N	\N	\N	\N	f	f	f	\N	UNABLE TO BE SCHEDULED	21	t	\N	\N
43116b4b-4207-415d-8efc-d6d93dee3c83	ecd173ce-3efc-43d2-bb24-3360a7d4d82c	CRANE	ANTHONY	154 Tedesco Street	M'head	2025-01-21	\N	\N	16000.00	14.50	0.00	2025-12-23	\N	AL	\N	\N	MODEL_1090	f	f	t	FULL 1090 DAY ON FOR 1/21                                      …BUCKET ALSO                                         FULL DAY W 1090                      6.5 HOURS WITH 1060                          FROZEN GROUND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.423+00	2026-03-07 10:28:03.13+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	8	f	BUCKET	6d98794e-3da3-4e45-ba0e-845ffc537330
f4825f5c-3c6b-4b2a-9fa2-bc005b30d95a	953510bd-d294-40fd-b3d0-3661045341b4	BUCKET	ANTHONY	173 Storey Avenue	Nbpt	2026-01-05	\N	\N	500.00	1.00	0.00	2025-12-04	\N	V, E 12/11*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.039+00	2026-03-07 10:28:03.136+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	46	f	\N	4dd30d6e-f02a-4773-9b44-6b75d02fe618
f841dc58-493e-4200-b832-c594a364cea1	93033a76-050d-4257-9bb4-e854cf1c7434	CRANE	ANTHONY	1650 Turnpike St	N. Andover	2026-02-02	\N	\N	1800.00	1.50	0.00	2025-11-22	\N	V, E 1/19*	\N	\N	MODEL_1060	f	f	f	RS TO 2/2                                                       TBRS FROM 1/19 DUE TO WEATHER                                                    CONCOM - ALL SET                                   …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.464+00	2026-03-07 10:28:03.141+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	17	f	BUCKET	725efcf7-121a-4b32-b076-604da553a955
88fb751c-ca8a-48ed-bda2-89629adc437e	93e4799a-8d4e-47f9-b190-a5241b7bd33a	CRANE	AUSTIN	14 Maple Avenue	Wakefield	\N	\N	\N	6400.00	6.00	0.00	2025-10-07	E 10/7	V 1/15*	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:50.876+00	2026-03-07 10:27:50.876+00	\N	\N	\N	\N	f	f	f	\N	CRANE	11	f	\N	\N
229872de-c816-4d20-9197-b3ee91b43d97	9bea5c60-604a-4198-b52d-3421ca553bb0	CRANE	AUSTIN	351 Linden Street	Wellesley	2026-02-04	\N	\N	7000.00	5.50	0.00	2025-11-06	\N	S, E 11/18	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.81+00	2026-03-07 10:27:51.81+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	95	f	\N	\N
6045575d-cef6-4573-974c-c996c19ece6f	9d1f9a4f-c382-4dc5-ba39-0b24301cc197	CRANE	AUSTIN	28 Buena Vista Road	Arlington	2026-02-03	\N	\N	2900.00	2.50	0.00	2026-01-20	\N	S, E 1/21*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.818+00	2026-03-07 10:27:51.818+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	97	f	\N	\N
2fed6735-81aa-4280-977f-9d3f3ff8862d	3a12e641-411e-4bd9-af81-c4528e9e470b	CRANE	AUSTIN	44 Oak Cliff Road	Newton	2026-01-29	\N	\N	6500.00	5.00	0.00	2025-10-27	\N	\N	\N	\N	MODEL_1090	f	f	f	PERFERS TO COMMUNICATE VIA EMAIL                                    DETAIL                                    TREE PERMIT - ALL SET                             CONES AND SIGNS                                 AM SENDING LETTERS TO NEIGHBORS FOR ROAD BLOCKAGE	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.822+00	2026-03-07 10:27:51.822+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	98	f	\N	\N
2c32036e-d340-4550-8da8-55c6a063ce19	8a4c39ef-218f-4140-be7c-4ebd51fe7229	CRANE	AUSTIN	137 Salem Rd	Billerica	2026-01-22	\N	\N	4000.00	4.00	0.00	2025-10-27	\N	S, E 11/6	\N	\N	MODEL_1060	f	f	f	T&M                                    TO BE DONE AT THE SAME TIME AS DONNA MEDUGNO                                       DTL                                 CLOSE FRIEND OF JOHN	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.828+00	2026-03-07 10:27:51.828+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	99	f	\N	\N
07f11d8a-5703-4de7-85d8-d05addb6cb72	f67b053a-4b08-4ea0-b86e-701906aebb92	CRANE	AUSTIN	139 Salem Road	Billerica	2026-01-22	\N	\N	3500.00	4.00	0.00	2025-10-23	\N	S, E 11/6	\N	\N	MODEL_1060	f	f	f	DTL                                         NEIGHBOR'S DRIVEWAY NEEDS TO BE EMPTY                             DONE AT THE SAME TIME AS STEVE KENNEDY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.833+00	2026-03-07 10:27:51.833+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	100	f	\N	\N
1c602d57-2fc2-4734-9acd-4e8c2b8c5abf	428ba494-e8c5-4997-bc37-8a0733bcc778	CRANE	AUSTIN	225 Pheasant Avenue	Arlington	2026-01-20	\N	\N	5500.00	5.50	0.00	2025-10-22	E 10/22	S, E 11/6	\N	\N	MODEL_1090	f	f	f	W/DETAIL                            CONES & SIGNS              8AM, LIVES NEXT TO A SCHOOL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.837+00	2026-03-07 10:27:51.837+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	101	f	\N	\N
639a1fcf-286f-4999-9e44-2c10da972cd6	b346ee7d-15bc-4da0-bc2a-4fcdc582b034	CRANE	AUSTIN	43 Clyde Street	Newton	2026-01-15	\N	\N	7200.00	5.00	0.00	2025-11-10	\N	S, E 1/14	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.842+00	2026-03-07 10:27:51.842+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	102	f	\N	\N
71eba330-9ac6-4ac9-89da-4e318ea2d7c7	8364a7d3-e5ab-4f23-a808-e40ed41ed4e3	CRANE	AUSTIN	51 Royce Road	Newton	2026-01-15	\N	\N	6500.00	5.00	0.00	2025-10-31	\N	S, E 11/13	\N	\N	MODEL_1060	f	f	f	NEIGHBOR CONSENT NEEDED TO STAGE CRANE IN SHARED DRIVEWAY-ALL SET                                                                               PARKING AT FRONT OF HOUSE MUST BE CLEAR ON DAY OF SCHEDULED WORK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.846+00	2026-03-07 10:27:51.846+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	103	f	\N	\N
badd399f-4830-451d-8bb4-597d9ef1b5f2	6b87d053-19a3-4ac7-b89f-9abb438d4f26	CRANE	AUSTIN	80 Country Drive	Weston	2026-01-13	\N	\N	4800.00	4.00	0.00	2025-09-09	E 9/9	S, E 10/30	\N	\N	MODEL_1060	f	f	f	TBRS FROM 11/4-NEIGHBOR WON'T BE AVAILABLE UNTIL 11/6 OR AFTER.                                            NEIGHBOR CONSENT - ALL SET                                             EXTRA CHIP TRUCK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.855+00	2026-03-07 10:27:51.855+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	105	f	\N	\N
11a5c757-86c3-4539-9c4a-552c57b90890	37bb5d40-dba3-437c-b650-50aac1da353d	CRANE	AUSTIN	78 Merriam Street	Weston	2026-01-06	\N	\N	8500.00	8.00	0.00	2025-10-07	\N	S, E 10/23	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.866+00	2026-03-07 10:27:51.866+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	107	f	\N	\N
f284c263-6ce6-4fac-bd1d-06b453a794db	2ab61b88-26d4-4591-9262-4fc9040f55e4	CRANE	AUSTIN	711 Chicopee Row	Groton	2026-01-13	\N	\N	10500.00	8.00	0.00	2025-10-15	\N	S, E 10/30	\N	\N	MODEL_1090	f	f	f	EXTRA CHIP TRUCK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.87+00	2026-03-07 10:27:51.87+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	108	f	\N	\N
84c7dfab-a56b-4f08-98ca-f400a0b90fa0	47fd116b-94a7-49f1-abf7-56a262223239	CRANE	AUSTIN	317 Chicopee Row	Groton	2026-01-08	\N	\N	4000.00	3.50	0.00	2025-10-09	\N	S, E 10/24	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.875+00	2026-03-07 10:27:51.875+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	109	f	\N	\N
01d9bfef-0cf6-469c-99b2-83ce4fec30d7	b2f862bc-8b3f-4e94-a8b4-52b6be75c582	BUCKET	AUSTIN	13 Chestnut Street	N. Reading	2026-01-07	\N	\N	500.00	1.00	0.00	2025-12-18	\N	V, E 12/29*                        V             12/31*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.015+00	2026-03-07 10:27:52.015+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	39	f	\N	\N
941ab667-1008-4080-8443-8b5f82fe593a	4cce9c7d-9979-4aea-a1b7-316f9ecd4fd5	BUCKET	AUSTIN	955 Main St.	Winchester	2026-02-25	\N	\N	4800.00	8.00	0.00	2026-02-20	\N	S,E            2/20*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.572+00	2026-03-07 10:27:52.572+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	196	f	\N	\N
10e9c145-a789-43f9-b4d5-c564c3860c0c	8dc1449d-d145-42c4-b373-6d243a2b69f0	BUCKET	AUSTIN	157 Temple Street	Boston (west Roxbury)	2026-02-17	\N	\N	2200.00	3.00	0.00	2026-01-20	\N	S, E  2/13*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.579+00	2026-03-07 10:27:52.579+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	198	f	\N	\N
13fb622f-224f-4905-95e3-f9b5b8efcd5d	131b50e4-e3a2-400b-a801-a71a1147effe	BUCKET	AUSTIN	39 Inman Street	Cambridge	2026-02-16	\N	\N	3150.00	3.50	0.00	2026-01-13	\N	S, E 2/12                        V,E                                         1/28*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.583+00	2026-03-07 10:27:52.583+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	199	f	\N	\N
a402d7d9-3933-43c3-8c8d-b9284d60d7f5	6ccb12af-b293-4a60-8141-80dee2967bcf	BUCKET	AUSTIN	9 Wichita Terrace	Boston (mattapan)	2026-02-16	\N	\N	900.00	1.00	0.00	2026-01-06	\N	S, E           1/8                            S                                2/5	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.587+00	2026-03-07 10:27:52.587+00	\N	\N	\N	\N	f	t	t	73	2026 Bucket Completed	200	f	\N	\N
e887949f-0233-4e89-9d20-72093084ce78	a9d2606d-2255-4aa6-a8ff-763d0aa4ef98	BUCKET	AUSTIN	39 Lawndale Street	Belmont	2026-02-12	\N	\N	3500.00	5.75	0.00	2025-10-27	\N	V, E 1/19*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.589+00	2026-03-07 10:27:52.589+00	\N	\N	\N	\N	f	t	t	73	2026 Bucket Completed	201	f	\N	\N
6ce07b9c-e573-47bd-95a9-6d3ee2de8026	65e10c77-566d-4e2d-8b12-d200d9cb876a	BUCKET	AUSTIN	16 Carver Road	Wellesley	2026-02-10	\N	\N	5000.00	8.00	0.00	2025-11-08	\N	V, E 12/30*	\N	\N	\N	t	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.6+00	2026-03-07 10:27:52.6+00	\N	\N	\N	\N	f	t	t	73	2026 Bucket Completed	204	f	\N	\N
fcef7146-74bb-477d-af59-993d4a0047af	86a3b5d7-7bc9-486a-8011-a461ff615e33	BUCKET	AUSTIN	242 W Newton Street	Boston (back Bay)	2026-02-09	\N	\N	3800.00	4.00	0.00	2026-01-12	\N	V, E 1/28*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.603+00	2026-03-07 10:27:52.603+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	205	f	\N	\N
c84697c2-bbcb-4fd6-8f02-688360b9ceda	538ba4c2-7a13-40b8-9d73-19c3efe16cc7	CRANE	DENNIS	355 Grapevine Rd	Wenham	2026-02-17	\N	\N	1800.00	2.00	0.00	2026-01-20	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.59+00	2026-03-07 10:27:51.59+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	45	f	\N	\N
96a29eeb-a492-47e5-b8b9-3b3b94a85aea	d9581eb3-0191-4f8f-9ddf-9b0a3d6d1c71	BUCKET	AUSTIN	24 Ivory Street	Boston (west Roxbury)	2026-02-09	\N	\N	3400.00	4.00	0.00	2025-12-23	\N	S, E 1/29                                                      C, E 12/30*                            V, E 1/21	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.607+00	2026-03-07 10:27:52.607+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	206	f	\N	\N
b11aaab6-56c7-4993-8f30-58414235602e	e50a0130-595b-441c-b679-bf76655176da	BUCKET	AUSTIN	69 Baxter Road	Brookline	2025-02-04	\N	\N	7300.00	8.00	0.00	2025-12-01	\N	S, E 1/21	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.614+00	2026-03-07 10:27:52.614+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	208	f	\N	\N
29343dc6-983b-4674-9816-f25576b98f14	27c064e0-239a-4824-9fd2-258209278411	BUCKET	AUSTIN	33 Belmore Rd	Natick	2026-02-02	\N	\N	650.00	1.25	0.00	2026-02-02	AM	AM	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.618+00	2026-03-07 10:27:52.618+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	209	f	\N	\N
77692f70-0b29-44e7-b2e8-421ec338837f	5e6b2583-5f5b-408a-85d0-0493d432a8bf	BUCKET	AUSTIN	6 Parkview Circle	Westford	2026-01-29	\N	\N	2400.00	4.00	0.00	2026-01-20	\N	S, E 1/21         AM	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.625+00	2026-03-07 10:27:52.625+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	211	f	\N	\N
f4017003-65d0-4970-a5bb-ce27d0ad71b1	293595a4-8b07-4962-87a2-f98ea6a3ef25	BUCKET	AUSTIN	14 Adams Lane	Wayland	2026-01-28	\N	\N	3700.00	6.00	0.00	2025-12-10	\N	V, E 12/17*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.628+00	2026-03-07 10:27:52.628+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	212	f	\N	\N
f5771656-c573-4ac0-88e6-a8d13cbcba79	b39cd743-c9b9-4b55-8bb1-e4b38ff225f6	BUCKET	AUSTIN	40 Hosmer Rd	Concord	2026-01-28	\N	\N	0.00	1.00	0.00	2025-12-18	\N	V, E 1/21*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.632+00	2026-03-07 10:27:52.632+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	213	f	\N	\N
659172c4-9181-42a1-84fd-1f3ceba9661f	e8982610-6422-45ec-b127-5fc6a0922fb2	BUCKET	AUSTIN	79 Hatherly Road	Waltham	2026-01-21	\N	\N	2250.00	4.00	0.00	2026-08-19	E 8/19	S, E        12/11	\N	\N	\N	f	f	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.639+00	2026-03-07 10:27:52.639+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	215	f	\N	\N
2ac8650f-0ab1-49ac-a1cb-17e0e8bd97e3	f69aef88-1099-4659-b84f-2cb82acd0bae	BUCKET	AUSTIN	850 Boston Post Road	Weston	2026-01-21	\N	\N	2300.00	4.00	0.00	2025-12-30	\N	AM	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.643+00	2026-03-07 10:27:52.643+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	216	f	\N	\N
05360a89-bc2c-44c0-ac20-de6b9bd264da	d8b955cc-879a-48c3-bc83-ec8c0d1aeacf	BUCKET	AUSTIN	79 Maple Street	Lexington	2026-01-20	\N	\N	1600.00	2.75	0.00	2026-01-08	\N	V, E 1/12*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.646+00	2026-03-07 10:27:52.646+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	217	f	\N	\N
af987815-6e40-4f80-9a7a-f3a566e928e8	74520d17-c3f7-49d7-804f-c9eb26cc6802	BUCKET	AUSTIN	2 Aerial St	Lexington	2026-01-20	\N	\N	1900.00	3.00	0.00	2025-12-11	\N	V, E 12/17*	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.65+00	2026-03-07 10:27:52.65+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	218	f	\N	\N
1f00affe-5163-4701-949c-cfc84ab51f93	0bc138a6-fe83-4d64-9cc3-ddbbc27bf15a	BUCKET	AUSTIN	134 Langdon Street	Newton	2026-01-13	\N	\N	3025.00	6.00	0.00	2025-10-22	E 10/22	V, E 12/4*	\N	\N	\N	t	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.667+00	2026-03-07 10:27:52.667+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	223	f	\N	\N
b9ef6986-e8c2-40d5-954d-1dcf0aa64067	88043e7e-d961-468f-9dc2-3dcde9b4e10f	BUCKET	AUSTIN	87 Gardner Road	Brookline	2026-01-13	\N	\N	500.00	1.00	0.00	2025-12-10	\N	S, E 12/11	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.671+00	2026-03-07 10:27:52.671+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	224	f	\N	\N
98e4fc51-d9ae-4b30-aee7-5da8628183ed	506b0dd3-c007-4aaf-ab94-7c46ac734e2e	BUCKET	AUSTIN	25 Shaw Drive	Wayland	2026-01-09	\N	\N	2600.00	4.50	0.00	2026-01-05	\N	V, T 1/8*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.674+00	2026-03-07 10:27:52.674+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	225	f	\N	\N
2ecf880c-291a-4b0d-b4c8-1fb549f3583d	db880e8e-17fd-4aa6-b686-fb074869fd43	BUCKET	AUSTIN	670 Concord Avenue	Belmont	2026-01-12	\N	\N	1700.00	3.00	0.00	2026-01-08	\N	S, E 1/8	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.678+00	2026-03-07 10:27:52.678+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	226	f	\N	\N
d4f31002-2922-440c-8102-ce35868113c2	74922113-0f05-42e8-a22e-163a043186b4	BUCKET	AUSTIN	26 Fairland Street	Lexington	2026-01-12	\N	\N	3400.00	5.25	0.00	2025-11-14	\N	S, E 11/26	\N	\N	\N	t	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.685+00	2026-03-07 10:27:52.685+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	228	f	\N	\N
82ad91a1-b5f4-40a9-8e69-aa66b87ce282	49eee104-d613-4525-8740-231f4a1c0bcb	BUCKET	AUSTIN	27 Tower Road	Lincoln	2026-01-12	\N	\N	2100.00	3.25	0.00	2025-12-16	\N	S, E            1/6	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.688+00	2026-03-07 10:27:52.688+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	229	f	\N	\N
30d00e6e-5dbe-4727-8a0d-419a664d6d68	e4d61941-8e5c-4015-93b6-2cf4af37c59d	BUCKET	AUSTIN	8 Michael Way	Cambridge	2026-01-08	\N	\N	3700.00	5.00	0.00	2025-11-05	\N	V, E 12/4*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.692+00	2026-03-07 10:27:52.692+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	230	f	\N	\N
fbd3c22f-3dff-4a0d-b9e3-f5108dea50b0	3a387d46-e2ae-4196-8d44-333597357876	BUCKET	AUSTIN	37 Barnesdale Road	Natick	2026-01-07	\N	\N	3900.00	6.00	0.00	2025-11-25	\N	S, E 12/4	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.696+00	2026-03-07 10:27:52.696+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	231	f	\N	\N
e9d0af2a-a05a-409f-90c0-0279bd8f3c64	7d7b9dc2-cc41-4087-93a5-d15c6530af72	BUCKET	AUSTIN	367 Elm Street	Framingham	2026-01-07	\N	\N	1000.00	2.00	0.00	2025-12-09	\N	S       1/5	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.7+00	2026-03-07 10:27:52.7+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	232	f	\N	\N
cc2abe94-1c13-43ec-abbe-420d258b0594	3af1c5a4-ce5c-4b6e-91cb-47879235eece	BUCKET	AUSTIN	17 Saville Street	Cambridge	2026-01-06	\N	\N	4400.00	5.00	0.00	2025-11-10	\N	S, E 11/24	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.703+00	2026-03-07 10:27:52.703+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	233	f	\N	\N
3bf5eac3-2aea-4817-b8cf-af9883e295da	8f4c2525-4c5b-4f06-a0f9-0a1ed508eaf4	BUCKET	AUSTIN	96 Alpine Street	Cambridge	2026-01-06	\N	\N	1950.00	2.75	0.00	2025-11-12	\N	E 11/24*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.707+00	2026-03-07 10:27:52.707+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	234	f	\N	\N
8eb5f73e-d445-434d-9f70-8ed21d96fbc1	607714d7-bbea-4fa2-9a50-d274501ec4a2	BUCKET	AUSTIN	36 Ash Lane	Sherborn	2026-01-05	\N	\N	3250.00	5.00	0.00	2025-11-14	\N	V, E 11/24*	\N	\N	\N	t	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.711+00	2026-03-07 10:27:52.711+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	235	f	\N	\N
ee201fcd-213f-4d08-87f3-4330824084c4	85075471-3d1c-4b28-a1ab-7e16ac3292e3	BUCKET	AUSTIN	1-38 Ellsworth Village Rd	Acton	2026-01-02	\N	\N	4500.00	8.00	0.00	2025-12-08	\N	S 12/30	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.718+00	2026-03-07 10:27:52.718+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	237	f	\N	\N
a92d0f0b-c650-4b1b-861e-e0dbdea6f92d	74922113-0f05-42e8-a22e-163a043186b4	CRANE	AUSTIN	26 Fairland Street	Lexington	2026-01-13	\N	\N	4500.00	4.00	0.00	2025-11-14	\N	S, E 11/26	\N	\N	MODEL_1060	f	f	f	P/U FROM 2/5 TO 1/13                          DETAIL                                  LOG TRUCK AT END                                  ANGLE BLOCKS AND ADDITONAL BLOCKS           WANTS JANUARY DATE	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.85+00	2026-03-07 10:27:51.85+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	104	f	\N	\N
af8d8fb6-a060-4ed4-9cd7-e598015df806	813c68a8-ec1e-448a-8da4-ee8af817fc6b	CRANE	DENNIS	115 Essex Street	Beverly	2026-02-17	\N	\N	7000.00	7.00	0.00	2025-11-10	\N	V, E 12/3*	\N	\N	MODEL_1060	f	f	f	NEEDS CONCOM-ALL SET                                          DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.595+00	2026-03-07 10:27:51.595+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	46	f	\N	\N
1d1ea9f2-40d7-4e80-92e2-789ead8d8727	a9c9d1d0-d1e2-451d-ae8b-a08d61867ffe	CRANE	DENNIS	27 Everett Street	Beverly	2026-02-26	\N	\N	1500.00	1.75	0.00	2026-01-23	NO EMAIL	S 1/30	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.544+00	2026-03-07 10:27:51.544+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	35	f	\N	\N
95827adb-589b-455e-be2c-8210102cc105	89083bf4-10db-422e-98b6-0c4d20775c7a	CRANE	DENNIS	29 Pine Street	Danvers	2026-02-26	\N	\N	6000.00	4.00	0.00	2026-02-24	\N	DS	\N	\N	MODEL_1060	f	f	f	AL CREW MUST MOVE SNOW ON 2/26	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.548+00	2026-03-07 10:27:51.548+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	36	f	\N	\N
11fd9d6c-2834-4b0b-99fc-f6271afb172c	f439a1d3-972f-439d-935a-5d2c6f622149	CRANE	DENNIS	4 Briarwood Drive	Danvers	2026-02-25	\N	\N	3500.00	3.50	0.00	2026-02-16	\N	DS	\N	\N	MODEL_1060	f	f	f	RS 2/25                                       TBRS FROM 2/23 DUE TO WEATHER                                  NO EMAIL OR PHONE #	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.551+00	2026-03-07 10:27:51.551+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	37	f	\N	\N
1fc60b05-06c1-4daf-98dc-8ca7ee87e527	1de5c0b9-19e0-43ee-8ddc-518c301a13e9	CRANE	DENNIS	6 Daniels Road	Wenham	2026-02-25	\N	\N	4000.00	2.00	0.00	2026-02-24	\N	DS	\N	\N	MODEL_1060	f	f	f	ER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.558+00	2026-03-07 10:27:51.558+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	38	f	\N	\N
f826b861-9c38-4268-92e6-cd425f5912b8	583a47a0-d1d9-4490-9d51-cc7cf01b0ff8	CRANE	DENNIS	7 Avalon Avenue	Beverly	2026-02-19	\N	\N	3500.00	3.00	0.00	2025-11-19	\N	V,E 12/3*	\N	\N	MODEL_1060	f	f	f	AFTER JAN 1, WANTS A JAN/FEB DATE                                       WANTS IT DONE AT SAME TIME AS BUCKET (SAME ADDRESS)	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.561+00	2026-03-07 10:27:51.561+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	39	f	\N	\N
2c197911-742b-4786-ae4e-83132ee0fcab	03c50c02-029a-4fe3-9884-336e3ef5b4f7	CRANE	DENNIS	150 Common Lane	Beverly	2026-02-19	\N	\N	5500.00	5.50	0.00	2025-11-17	\N	S, E 12/3	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.565+00	2026-03-07 10:27:51.565+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	40	f	\N	\N
75eb2662-c671-4db9-8c2c-7ebad042a7d7	e8419fd5-4345-44fa-8bee-6f7bfbee8096	CRANE	DENNIS	108 Bachelor Street	W. Newbury	2026-02-18	\N	\N	1000.00	1.00	0.00	2026-02-03	\N	V, E       2/12*	\N	\N	MODEL_1060	f	f	f	RS 2/18                     TBRS FROM 2/11 DUE TO ACCESS ISSUES AND ADDITIONAL SNOW COMING IN                  TO BE DONE W/ ALEX NAVARRO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.578+00	2026-03-07 10:27:51.578+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	43	f	\N	\N
276fe0cd-d3bb-498c-9788-32c85d109625	a02ac884-c430-4dc3-98e6-15df4b8d5b34	CRANE	DENNIS	104 Bachelor Street	W. Newbury	2026-02-18	\N	\N	11000.00	10.00	0.00	2025-11-16	\N	S, E 2/12	\N	\N	MODEL_1060	f	f	f	RS 2/18                     TBRS FROM 2/11 DUE TO ACCESS ISSUES AND ADDITIONAL SNOW COMING IN          ASKING FOR DATE                                                                                                            W/ BUCKET TRUCK                     DTL                                                  TO BE DONE W/ CAMDEN HOLLAND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.584+00	2026-03-07 10:27:51.584+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	44	f	\N	\N
45c9c368-00dd-44f6-a347-6703ac3d57de	4dbb6f90-d148-4718-b4fe-d176401e3d4c	CRANE	DENNIS	175 Crane Neck Street	W. Newbury	2025-02-09	\N	\N	15500.00	16.00	0.00	2025-11-05	\N	S, E 11/25	\N	\N	MODEL_1060	f	f	f	BIG SAW                                  NEIGHBOR CONSET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.612+00	2026-03-07 10:27:51.612+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	49	f	\N	\N
883c6416-17bf-4b7c-a872-2bbc3f91e176	93ed8a45-584a-47f6-be85-728070aa6347	CRANE	DENNIS	37 Cherry Street	Danvers	2026-02-09	\N	\N	2000.00	3.00	0.00	2025-12-22	\N	V, E 1/5*	\N	\N	MODEL_1060	f	f	f	RS 2/9                                                   TBRS 2/16-WIFE SAID IT DOESN'T WORK. TUESDAYS + WEEK OF 3/17-20 DOES NOT WORK AS WELL                                                                   DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.616+00	2026-03-07 10:27:51.616+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	50	f	\N	\N
bcc8063c-5d27-40da-a081-2700ededd36f	7f95e0ed-dd76-4ce6-aff7-e0bd3a31a12c	CRANE	DENNIS	27 Mohawk Circle	G'town	2026-02-05	\N	\N	4000.00	4.00	0.00	2025-11-19	\N	V,E        2/2*	\N	\N	MODEL_1060	f	f	f	PU TO 2/5 FROM 2/12	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.623+00	2026-03-07 10:27:51.623+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	51	f	\N	\N
e843c570-11fd-4b5f-bbac-cd32500c1f06	eaf6c2b5-63cd-425e-bd50-b00eeac63af9	CRANE	DENNIS	128 Main Street	Boxford	2026-02-05	\N	\N	2000.00	2.00	0.00	2025-11-17	\N	V, E 12/16*	\N	\N	MODEL_1060	f	f	f	HE'S CONCERNED THAT WE MAY HAVE TROUBLE GETTING INTO DRIVEWAY DUE TO SNOW. MIGHT NEED TO POSTPONE.	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.628+00	2026-03-07 10:27:51.628+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	52	f	\N	\N
0ee31f29-c822-4a8a-985c-f2966083e64d	df57c944-22c9-4a42-b25f-ab39617b1d8b	CRANE	DENNIS	171 Essex Avenue	Gloucester	2026-02-04	\N	\N	3000.00	3.00	0.00	2025-10-27	\N	S, E 2/4	\N	\N	MODEL_1060	f	f	f	RS 2/4                                          TBRS FROM 1/26 DUE TO WEATHER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.636+00	2026-03-07 10:27:51.636+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	54	f	\N	\N
2e0653fa-9875-472e-b0d8-a4b35c3cf253	318873f4-6907-41c5-a879-2616a1ec1da0	CRANE	DENNIS	15 Essex Street	Hamilton	2026-01-29	\N	\N	7000.00	7.00	0.00	2025-10-22	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.646+00	2026-03-07 10:27:51.646+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	56	f	\N	\N
ba591bba-b3c6-4dec-baee-d5f38e9386fd	36bc7b02-a484-4a6d-a528-5376320f8d06	CRANE	DENNIS	218 Georgetown Rd	Boxford	2026-01-23	\N	\N	3700.00	3.50	0.00	2025-12-11	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.654+00	2026-03-07 10:27:51.654+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	58	f	\N	\N
360bcb96-01a5-4d6f-bcd8-ff732ef5d62a	36d4ff1b-b925-42a9-a3d2-c5a30efa01a7	CRANE	DENNIS	136 Essex Street	Beverly	2026-01-23	\N	\N	1000.00	1.00	0.00	2001-10-22	E 10/22	V, E 11/4*	\N	\N	MODEL_1060	f	f	f	TBD WITH MATTHEW ERGOTT	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.657+00	2026-03-07 10:27:51.657+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	59	f	\N	\N
f4e1bbd4-ff44-454b-9e37-14384732d459	aaf74dc2-0133-45f3-9e2c-1b972cbe1f80	CRANE	DENNIS	140 Essex Street	Beverly	2026-01-23	\N	\N	3500.00	3.50	0.00	2025-10-21	E 10/22	V, E 11/4*	\N	\N	MODEL_1060	f	f	f	W/DETAIL                               TBD WITH MIKE COUGHLIN	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.661+00	2026-03-07 10:27:51.661+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	60	f	\N	\N
1cc65da3-fe0c-4608-8e33-2d4116a4dc33	df804402-c030-4a3c-a6d9-331ac345b0d5	CRANE	DENNIS	4 Surrey Lane	Topsfield	2026-01-23	\N	\N	3700.00	4.00	0.00	2025-10-20	\N	V 11/11*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.666+00	2026-03-07 10:27:51.666+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	61	f	\N	\N
8fec7d74-ab28-4625-9197-0836c4a4768e	d265993c-c81f-4783-8799-ee5a1fa0eaf6	CRANE	DENNIS	250/252 Woburn St	Wilmington	2026-01-22	\N	\N	6000.00	6.00	0.00	2026-01-08	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.67+00	2026-03-07 10:27:51.67+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	62	f	\N	\N
ec92af9a-5893-40bf-be35-1bf7cbbd6ad3	6ee1611c-9e21-4657-b015-7471ae2da04d	CRANE	DENNIS	40 Roosevelt Avenue	Danvers	2026-01-21	\N	\N	7000.00	7.00	0.00	2025-11-04	\N	V, E 1/19*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.673+00	2026-03-07 10:27:51.673+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	63	f	\N	\N
4f62c38a-c9d6-4ae8-b68e-0d1ab138612c	e75cdab1-128f-41b5-a1b6-f9231fcb978e	CRANE	DENNIS	2 Mark Street	Mbts	2026-01-17	\N	\N	3700.00	3.50	0.00	2025-12-12	\N	DS	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.677+00	2026-03-07 10:27:51.677+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	64	f	\N	\N
f4806f85-96f1-4dd4-b153-583a9adb6ca5	eba5b25d-2485-4313-9b48-eb8367b715a7	CRANE	DENNIS	65 Ellsworth Ave	Beverly	2026-01-16	\N	\N	3200.00	3.25	0.00	2025-10-19	\N	V, E 11/11*	\N	\N	MODEL_1060	f	f	f	DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.684+00	2026-03-07 10:27:51.684+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	66	f	\N	\N
405b12bf-ac1c-416c-b5cb-0cccd8542598	66cdd60c-715b-4769-a7ee-453968ad4341	CRANE	DENNIS	16 Country Drive	Beverly	2026-01-16	\N	\N	2000.00	2.00	0.00	2025-11-10	\N	S, E 11/25	\N	\N	MODEL_1060	f	f	f	NEEDS A FRIDAY	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.689+00	2026-03-07 10:27:51.689+00	\N	\N	\N	\N	f	f	t	NO	2026 Crane Completed	67	f	\N	\N
fb0b5323-e400-44ab-94fe-00be5114a0b2	cbdf8094-8dbd-4a83-bdc2-20c6c2c9fc18	CRANE	DENNIS	55 Cross Lane	Beverly	2026-01-16	\N	\N	2500.00	2.50	0.00	2025-11-10	\N	V 12/3*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.693+00	2026-03-07 10:27:51.693+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	68	f	\N	\N
aa6bc917-9ac3-4754-ba37-253bf8bf15ad	e1c63a30-72c1-4da5-9d06-7f456b68bb2d	CRANE	DENNIS	588 Cabot Street	Beverly	2026-01-12	\N	\N	0.00	2.00	0.00	2025-12-21	\N	DS	\N	\N	MODEL_1060	f	f	f	TBRS FROM 12/24, TOO BUSY OF AN AREA	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.71+00	2026-03-07 10:27:51.71+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	72	f	\N	\N
9e99d727-da50-4f92-8d1d-02c7e7c48879	f8f86f75-b0cc-4321-b102-afaa7af11178	CRANE	DENNIS	44 Longbow Road	Danvers	2026-01-12	\N	\N	7000.00	7.00	0.00	2025-10-31	\N	V, E 11/11*	\N	\N	MODEL_1060	f	f	f	…BUCKET ALSO                                           AL CREW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.715+00	2026-03-07 10:27:51.715+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	73	f	BUCKET	\N
5a639098-4dca-41f2-a56c-8028e89a610a	6034f38e-539a-4b07-aac0-d98447efcc4f	CRANE	DENNIS	158 Essex Street	Hamilton	2026-01-12	\N	\N	3000.00	3.00	0.00	2025-10-10	\N	V, E 12/28*	\N	\N	MODEL_1090	f	f	f	LOOKING FOR DATE                    DTL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.718+00	2026-03-07 10:27:51.718+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	74	f	\N	\N
9ba43b7a-f14c-4794-a588-4332229737ca	7bb5e199-b70f-44b3-a371-e660899ccd83	CRANE	DENNIS	27 Hickory Hill Road	Mbts	2026-01-12	\N	\N	4000.00	4.00	0.00	2025-11-04	\N	V, E 11/11*	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.723+00	2026-03-07 10:27:51.723+00	\N	\N	\N	\N	f	f	t	YES	2026 Crane Completed	75	f	\N	\N
e32bc75f-d5e8-44df-a6e2-281e079a7e3a	1845a67e-1af6-480a-9edc-338211e8b39e	CRANE	DENNIS	11 Greenleaf Drive	Danvers	2026-01-10	\N	\N	4000.00	4.00	0.00	2025-10-01	E 10/1	V, E 10/21*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.727+00	2026-03-07 10:27:51.727+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	76	f	\N	\N
92bb88c5-5a54-43a4-891c-225f2bdf938e	dcd3008e-1086-4910-b2eb-69cad5be7bef	CRANE	DENNIS	7 Cedar Hill Drive	Danvers	2026-01-23	\N	\N	4000.00	4.00	0.00	2026-01-05	\N	V, E, T 1/22*	\N	\N	MODEL_1060	f	f	f	P/U FROM 2/9 TO 1/23	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.65+00	2026-03-07 10:27:51.65+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	57	f	\N	\N
688b9814-e983-4612-99b1-7779c224b7f7	a5c6299a-b36a-493a-b136-ea08dc0fdcd7	CRANE	DENNIS	166 Main Street	Boxford	2026-01-09	\N	\N	7000.00	7.00	0.00	2025-09-26	E 9/26	V, E 10/22*	\N	\N	MODEL_1060	f	f	f	…BUCKET	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.731+00	2026-03-07 10:27:51.731+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	77	f	\N	\N
2aa43dbc-dcfc-4c5c-bb54-3ff285e02082	0685866f-6734-4e9d-b6ec-cd45100ca519	CRANE	DENNIS	17 Perley Avenue	Rowley	2026-01-09	\N	\N	2000.00	2.00	0.00	2026-01-08	\N	DS	\N	\N	MODEL_1060	f	f	f	EMAIL BOUNCED BACK	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.734+00	2026-03-07 10:27:51.734+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	78	f	\N	\N
dd58edd4-2414-45ce-ab97-27f57cad4579	0685866f-6734-4e9d-b6ec-cd45100ca519	CRANE	DENNIS	17 Perley Avenue	Rowley	2026-01-09	\N	\N	2000.00	2.00	0.00	2026-01-08	\N	DS	\N	\N	MODEL_1060	f	f	f	PU FROM 2/23 TO 1/9                       DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.741+00	2026-03-07 10:27:51.741+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	80	f	\N	\N
9039b4b9-c3ea-454b-8aba-b68a6e1af8d0	a43d9c2a-9334-42ca-9c98-b0487ab052ba	CRANE	DENNIS	151 Whitehall Road	Amesbury	2026-01-05	\N	\N	4000.00	4.00	0.00	2025-10-08	\N	S, E 10/21*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.75+00	2026-03-07 10:27:51.75+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	82	f	\N	\N
1ead75f2-2126-4bd4-b028-ce5b839fcad6	1a459379-b806-44a7-8a1c-a561f73aeaf5	CRANE	DENNIS	15 Fox Run Dr.	Nbpt	2026-01-05	\N	\N	4000.00	4.00	0.00	2025-10-02	\N	V, E 10/21*	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.754+00	2026-03-07 10:27:51.754+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	83	f	\N	\N
96028009-c8f8-4696-95e2-59c36c38bace	938a7b57-8888-4cdf-9eab-d49770251b44	CRANE	DENNIS	173 South Road	East Kingston, Nh	2026-01-03	\N	\N	12000.00	10.00	0.00	2025-08-25	\N	DS	\N	\N	MODEL_1060	f	f	f	TBRS FROM 11/5 DUE TO ISSUES                                  …BUCKET ALSO                         DTL                                              AL CREW	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.757+00	2026-03-07 10:27:51.757+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	84	f	BUCKET	\N
2f769c18-ccfa-459d-8068-4496ca3272c1	511938d0-de59-45e8-a48c-3058f0109427	CRANE	DENNIS	181 Bridge Street	Hamilton	2026-01-03	\N	\N	4000.00	4.00	0.00	2025-09-24	\N	DS	\N	\N	MODEL_1090	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.763+00	2026-03-07 10:27:51.763+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	85	f	\N	\N
8b15131f-bdfb-4e23-b09a-fb431b11be8c	ec13a62f-51ed-4116-b604-700cc74b4e31	CRANE	DENNIS	25 Basto Terr	Roslindale	2026-01-03	\N	\N	11000.00	4.00	0.00	2025-12-28	\N	DS	\N	\N	MODEL_1060	f	f	f	ER 4HRS                                       BAGSTER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.767+00	2026-03-07 10:27:51.767+00	\N	\N	\N	\N	f	f	f	\N	2026 Crane Completed	86	f	\N	\N
854e5a6e-20c9-4afc-817b-fea8cf3f148a	4f7d8fea-095f-46aa-b4df-c27341ee4559	BUCKET	DENNIS	15 Walnut Park	Lynn	2026-02-26	\N	\N	2000.00	4.00	0.00	2026-02-18	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.043+00	2026-03-07 10:27:52.043+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	47	f	\N	\N
f69812a2-b437-4b07-919a-2d9408018c14	d614c390-d2a4-476b-bef8-f56f20ecf41d	BUCKET	DENNIS	15 Bass River Road	Beverly	2026-03-04	\N	\N	1200.00	2.25	0.00	2026-02-16	\N	S, E                   2/25*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.046+00	2026-03-07 10:27:52.046+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	48	f	\N	\N
7a36f4c0-8258-4160-ad0b-641ad0838510	861ec0b1-9e1d-45da-ada5-e15a6b3bc273	BUCKET	DENNIS	25 Woodbury	Hamilton	2026-02-26	\N	\N	1500.00	2.00	0.00	2026-02-25	\N	S              2/25*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.05+00	2026-03-07 10:27:52.05+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	49	f	\N	\N
ca0e7c9e-bc67-4cb5-8682-5c0b00b1b472	c2745d96-cf35-4f7a-adca-22540ea4af51	BUCKET	DENNIS	59 Cross Lane	Beverly	2026-02-25	\N	\N	2000.00	2.00	0.00	2026-02-24	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.057+00	2026-03-07 10:27:52.057+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	51	f	\N	\N
0d44635e-a1a6-4802-94b3-e0a92732b056	d01fe742-ced0-45ba-9ac5-739b0fdd92a8	BUCKET	DENNIS	95 Hale Street	Beverly	2026-02-25	\N	\N	1800.00	2.00	0.00	2026-02-24	\N	S, E              2/24*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.061+00	2026-03-07 10:27:52.061+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	52	f	\N	\N
5998843f-461c-472b-9b60-d8db57d218ab	bae35f6e-eba9-48d6-84f2-113f070f2180	BUCKET	DENNIS	776 Hale Street	Beverly	2026-02-25	\N	\N	2000.00	1.50	0.00	2026-02-24	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.064+00	2026-03-07 10:27:52.064+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	53	f	\N	\N
19602bbd-33fa-4844-baa9-76a97f3f3e7b	60a4d4a0-8171-4584-aacf-e32d3b8fbc70	BUCKET	DENNIS	16 Sylvan Road	Beverly	2026-02-25	\N	\N	1500.00	1.50	0.00	2026-02-24	\N	S, E   2/24*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.068+00	2026-03-07 10:27:52.068+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	54	f	\N	\N
c0cd0e7e-7505-49ad-b7d4-8b42b185baa7	8a8b6cc6-8545-4b8d-a88d-f5633487ab51	BUCKET	DENNIS	4 Nashua Avenue	Gloucester	2026-02-25	\N	\N	1200.00	1.00	0.00	2026-02-24	\N	S, E  2/24*	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.075+00	2026-03-07 10:27:52.075+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	56	f	\N	\N
16db5066-6227-4b80-b8db-2e7aa4d6adcf	6bc40809-2f4c-495a-901a-b59c7aa5089b	BUCKET	DENNIS	11 Miller Road	Beverly	2026-02-25	\N	\N	5000.00	4.00	0.00	2026-02-24	\N	\N	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.079+00	2026-03-07 10:27:52.079+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	57	f	\N	\N
082bb6de-7370-444f-b285-ba9325c7005f	8887ef66-2f87-44a0-850c-d67b5cc5d62f	BUCKET	DENNIS	37 Longbow Road	Danvers	2026-02-24	\N	\N	800.00	0.50	0.00	2026-02-24	\N	S                 2/24	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.086+00	2026-03-07 10:27:52.086+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	59	f	\N	\N
2872b836-8b2b-4919-bb11-d4cdc9d780c4	1ee10b52-2d6e-4328-9150-e6130aa2d1e0	BUCKET	DENNIS	8 Gott Street	Rockport	2026-02-19	\N	\N	0.00	1.00	0.00	2026-01-14	\N	V, E 2/13                                      DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.089+00	2026-03-07 10:27:52.089+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	60	f	\N	\N
e5e97c4d-0ddf-4663-94f8-52653a837181	e97e7cd9-e81f-419b-b4cd-eb5724b9bb4f	BUCKET	DENNIS	151 Pine Street	Mbts	2026-02-19	\N	\N	900.00	1.50	0.00	2026-01-14	\N	S, E 2/13*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.093+00	2026-03-07 10:27:52.093+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	61	f	\N	\N
f2a04f3c-3531-400d-8214-6c44d2e46209	583a47a0-d1d9-4490-9d51-cc7cf01b0ff8	BUCKET	DENNIS	7 Avalon Avenue	Beverly	2025-02-19	\N	\N	2000.00	4.00	0.00	2025-11-12	\N	S             12/30	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.096+00	2026-03-07 10:27:52.096+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	62	f	\N	\N
4798746d-b5d4-4e22-8243-573d80cb15e0	4d37445e-bcae-4694-b15f-cf014738f3e9	BUCKET	DENNIS	1 Landing Drive	Methuen	2025-02-18	\N	\N	6000.00	12.00	0.00	2025-11-24	\N	V, E 1/13*	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.103+00	2026-03-07 10:27:52.103+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	64	f	\N	\N
cef6495d-4374-46c0-929e-2eb051491bf8	553f5dec-3c5f-410c-a338-92cfd9e97141	BUCKET	DENNIS	14 Cabot Court	Amesbury	2026-02-18	\N	\N	1600.00	3.00	0.00	2025-11-21	\N	S, E 1/30	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.108+00	2026-03-07 10:27:52.108+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	65	f	\N	\N
337ba543-9639-492f-afe2-023df8f5f9ac	50205b6e-b085-4a6d-a407-aa85ba167d75	BUCKET	DENNIS	59 High Road	Newbury	2026-02-18	\N	\N	4000.00	8.00	0.00	2025-09-24	E 9/24	S, E 12/30                    V,T              2/18*	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.112+00	2026-03-07 10:27:52.112+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	66	f	\N	\N
f9af2abe-1b9b-4de7-9f02-7f5b05f616a3	ff536a33-a52f-46f5-9333-d51b9c5520eb	BUCKET	DENNIS	5 Brentwood Way	Ipswich	2026-02-17	\N	\N	800.00	1.50	0.00	2025-05-19	E 5/19	S, E  2/13	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.116+00	2026-03-07 10:27:52.116+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	67	f	\N	\N
b0173bc4-acfe-4ee5-9f93-9edb0c7d1f1b	eceb45d2-866e-4dee-8f86-44791c35fa0f	BUCKET	DENNIS	3 Riverside Drive	Ipswich	2026-02-17	\N	\N	0.00	4.00	0.00	2025-06-26	\N	V, T    2/13*	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.12+00	2026-03-07 10:27:52.12+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	68	f	\N	\N
d6611819-ed0d-4674-b428-b467f1c5c82f	892c20a3-628c-4c9a-9135-787ed960de77	BUCKET	DENNIS	21 University Lane	Mbts	2026-02-26	\N	\N	3500.00	6.00	0.00	2025-12-31	\N	S, E     1/5	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.053+00	2026-03-07 10:28:03.169+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	50	f	\N	e522a793-74ba-4b0b-baea-a13165e4d2be
1dadf426-136d-4370-8cd8-c2eb63ce1b6f	758a72ed-0039-4034-bdeb-7a405e7b320d	BUCKET	DENNIS	11 Miller Road	Beverly	2026-02-16	\N	\N	900.00	1.50	0.00	2026-02-16	\N	S              2/16*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.13+00	2026-03-07 10:27:52.13+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	71	f	\N	\N
c78263a9-04a9-498a-8135-a59b76d231b2	50653095-2b63-412c-8fd9-2694d26b520f	BUCKET	DENNIS	16 Dix Road	Ipswich	2026-02-16	\N	\N	900.00	1.50	0.00	2026-01-16	\N	S, E   2/13     S      2/16*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.135+00	2026-03-07 10:27:52.135+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	72	f	\N	\N
8e5b4590-6e45-44f0-8d4f-c67e9b1fcada	5c3ae967-bb1f-4df6-9f27-c62a8d887e77	BUCKET	DENNIS	31 Howe St.	Ipswich	2026-02-16	\N	\N	0.00	4.00	0.00	2025-11-20	\N	DS	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.138+00	2026-03-07 10:27:52.138+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	73	f	\N	\N
46f5eb47-4e7b-4f66-92b0-0ae7668008d6	244a76f1-66b3-4c9b-bc06-afe7cedb2e41	BUCKET	DENNIS	30 Sylvan St.	Danvers	2026-02-16	\N	\N	0.00	3.00	0.00	2026-02-10	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.141+00	2026-03-07 10:27:52.141+00	\N	\N	\N	\N	f	t	t	78	2026 Bucket Completed	74	f	\N	\N
c06be992-3fe9-4d1a-b279-27ea87ea6a60	46bc4dad-6bd2-4341-975a-83160cae906b	BUCKET	DENNIS	204 Dodge Street	Beverly	2026-02-12	\N	\N	900.00	1.75	0.00	2025-07-17	\N	S, E          1/8	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.145+00	2026-03-07 10:27:52.145+00	\N	\N	\N	\N	f	t	t	78	2026 Bucket Completed	75	f	\N	\N
edc8fa99-598c-498e-a408-cd0e01d1cd6c	fd202acb-08e6-4762-a7ae-296ba7c22185	BUCKET	DENNIS	5 Jefferson Ave	Salem	2026-02-12	\N	\N	0.00	8.00	0.00	2026-02-05	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.149+00	2026-03-07 10:27:52.149+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	76	f	\N	\N
914456d5-5b1b-47e0-a5af-2897a8a8353b	8887ef66-2f87-44a0-850c-d67b5cc5d62f	BUCKET	DENNIS	37 Longbow Road	Danvers	2026-02-10	\N	\N	0.00	1.00	0.00	2026-02-06	\N	V, E 2/6	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.152+00	2026-03-07 10:27:52.152+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	77	f	\N	\N
19e1ec00-e4e4-49ec-9eb7-9fc6e50b1a77	580efffb-cd56-48f8-8f71-5507d6422e7f	BUCKET	DENNIS	25 Candlewood Drive	Topsfield	2026-02-10	\N	\N	1200.00	2.25	0.00	2025-11-19	\N	V, E 12/31*              V, E 1/16*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.156+00	2026-03-07 10:27:52.156+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	78	f	\N	\N
563eddf4-e323-4f43-abb3-31156609b17d	e10d12cb-1a4f-4077-9c5d-97e016b4a560	BUCKET	DENNIS	36 Frances Drive	Nbpt	2026-02-10	\N	\N	700.00	1.00	0.00	2025-06-10	E 6/10	S, E 2/4	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.159+00	2026-03-07 10:27:52.159+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	79	f	\N	\N
aebea9e8-6069-40f9-a05b-a12a703c36a3	ecc6047e-e4c6-415a-85bc-bb73e5d8b713	BUCKET	DENNIS	388 Essex Street	Hamilton	2026-02-09	\N	\N	600.00	1.00	0.00	2026-02-02	\N	V, E 2/2	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.162+00	2026-03-07 10:27:52.162+00	\N	\N	\N	\N	f	t	t	ML	2026 Bucket Completed	80	f	\N	\N
cbd71ac6-f668-454e-b8ce-c22d5067e47c	0bd57963-fe25-4fa9-b52b-32a3aec76af9	BUCKET	DENNIS	10 Grapevine Road	Wenham	2026-02-09	\N	\N	0.00	0.50	0.00	2026-01-20	\N	S, E 1/30	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.166+00	2026-03-07 10:27:52.166+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	81	f	\N	\N
f687f701-102f-4082-8cbb-7af5c4e18a70	9ce44dd5-9502-4cee-9981-b910d0e6df43	BUCKET	DENNIS	13 Puritan Road	Wenham	2026-02-09	\N	\N	600.00	1.00	0.00	2025-11-17	\N	S, E               1/5	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.169+00	2026-03-07 10:27:52.169+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	82	f	\N	\N
1365d323-3e33-4db4-831a-e64eff2ca286	cf799264-cafd-4ce9-b70f-38366fe79d09	BUCKET	DENNIS	25 Fairway Drive	Topsfield	2026-02-09	\N	\N	0.00	1.00	0.00	2026-01-08	\N	V, E 1/30*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.173+00	2026-03-07 10:27:52.173+00	\N	\N	\N	\N	f	f	t	MM	2026 Bucket Completed	83	f	\N	\N
3d04ce09-2b8f-4b16-a95d-c057dc73c77d	ea638e17-7c99-47d7-9099-0d2985d44555	BUCKET	DENNIS	12 Thompson Lane	Topsfield	2026-02-09	\N	\N	700.00	1.25	0.00	2025-09-08	E 9/8	V, E 12/31*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.176+00	2026-03-07 10:27:52.176+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	84	f	\N	\N
6d581fa3-0f4d-43d2-98ef-17e35847d3aa	d6d11994-e59b-43f3-866f-7e8cd81487cb	BUCKET	DENNIS	12 Kent Way	Byfield (newbury)	2026-02-09	\N	\N	2000.00	3.00	0.00	2026-01-14	\N	V, E 1/16*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.179+00	2026-03-07 10:27:52.179+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	85	f	\N	\N
7ff3fe5d-4e87-4b4e-9387-b14ee9f11bd3	64c6d566-4ddc-4483-85d5-676ca19ee21b	BUCKET	DENNIS	141 Low Street	Nbpt	2026-02-09	\N	\N	1500.00	3.00	0.00	2026-01-07	\N	V, E 1/30*	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.182+00	2026-03-07 10:27:52.182+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	86	f	\N	\N
8c6d27f7-561e-48b8-af40-a318d919c2c4	a9d00ed6-eb4e-4e7e-b83f-909cb95bfeb0	BUCKET	DENNIS	127 Elm Street	Newbury	2026-02-09	\N	\N	1200.00	2.25	0.00	2025-09-15	E 9/15	V, E 1/30*	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.186+00	2026-03-07 10:27:52.186+00	\N	\N	\N	\N	f	t	t	MID	2026 Bucket Completed	87	f	\N	\N
5fbb3532-08e1-4d20-9543-d2ede1ecfe68	b28b6cc3-878b-4119-b89e-60590ef70380	BUCKET	DENNIS	8 Linden Circle	G'town	2026-02-05	\N	\N	0.00	1.00	0.00	2026-01-29	\N	V, E 2/2*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.189+00	2026-03-07 10:27:52.189+00	\N	\N	\N	\N	f	t	t	MM	2026 Bucket Completed	88	f	\N	\N
c7f0ed1f-57f0-41be-8862-ab8bca093cdf	7a7695c1-f6cf-493f-ac9b-0e1dac6b9bcf	BUCKET	DENNIS	11 Cold Spring Drive	Boxford	2026-02-05	\N	\N	900.00	1.75	0.00	2025-09-15	E 9/15	V,E             2/2*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.192+00	2026-03-07 10:27:52.192+00	\N	\N	\N	\N	f	t	t	EA	2026 Bucket Completed	89	f	\N	\N
53c76dba-b5c1-424c-b9ac-65cd04170cd2	6a51127b-2f34-4a8e-8c10-afff1365cf43	BUCKET	DENNIS	3 Foster Drive	Beverly	2026-02-05	\N	\N	1200.00	2.25	0.00	2026-01-23	E 1/23	S, E 1/23	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.197+00	2026-03-07 10:27:52.197+00	\N	\N	\N	\N	f	t	t	78	2026 Bucket Completed	90	f	\N	\N
05dcc169-8e78-4aca-a510-2c2d8d783397	1f524213-df8f-47ce-9584-f7514b652a1c	BUCKET	DENNIS	6 Bayview Avenue	Beverly	2026-02-05	\N	\N	0.00	1.00	0.00	2026-01-05	\N	V, E 2/2*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.201+00	2026-03-07 10:27:52.201+00	\N	\N	\N	\N	f	t	t	LMMD	2026 Bucket Completed	91	f	\N	\N
c54f3e77-f7e9-4a9c-b71a-deb8845e3f99	c15bba38-74f1-41be-98a4-c32978cbeaf2	BUCKET	DENNIS	343 Dodge Street	Beverly	2026-02-05	\N	\N	1200.00	2.00	0.00	2025-11-10	\N	V,E        2/2*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.205+00	2026-03-07 10:27:52.205+00	\N	\N	\N	\N	f	t	t	MID	2026 Bucket Completed	92	f	\N	\N
8be93c77-c8c5-4ed1-aa27-4ede31b1fd6a	fa490ea4-7595-489f-bb96-49c00e9af0e3	BUCKET	DENNIS	41 Central St.	Beverly	2026-02-05	\N	\N	0.00	1.00	0.00	2026-01-23	\N	S, E 1/29	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.209+00	2026-03-07 10:27:52.209+00	\N	\N	\N	\N	f	t	t	LMMD	2026 Bucket Completed	93	f	\N	\N
006c8ba4-7faf-4577-bbeb-738e7e143ce1	f8fa2db8-6d40-493e-9184-035dab7c7dca	BUCKET	DENNIS	Nantucket Drive	N. Andover	2025-02-04	\N	\N	6500.00	12.00	0.00	2025-07-21	\N	V, E           1/8	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.213+00	2026-03-07 10:27:52.213+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	94	f	\N	\N
cd79fbe1-24f1-414a-87de-15cd3c9c66a5	fb0d6d72-3d6a-4f94-bf42-745dfeba8a4c	BUCKET	DENNIS	15 Belleau Woods	G'town	2026-02-04	\N	\N	2000.00	4.00	0.00	2025-09-13	E 9/15	V, E 1/16*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.216+00	2026-03-07 10:27:52.216+00	\N	\N	\N	\N	f	t	t	73	2026 Bucket Completed	95	f	\N	\N
a723d96a-50c2-477e-8750-bd7127aaf71e	fd202acb-08e6-4762-a7ae-296ba7c22185	BUCKET	DENNIS	5 Jefferson Ave	Salem	2026-02-04	\N	\N	0.00	8.00	0.00	2025-11-04	\N	DS	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.219+00	2026-03-07 10:27:52.219+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	96	f	\N	\N
335bc3c1-86ee-42cf-ba91-0b140b8aa11b	ca261052-e1e6-4ced-8723-cdfd5679f03c	BUCKET	DENNIS	11 Woodside Lane	Wenham	2026-02-04	\N	\N	1200.00	2.25	0.00	2026-01-13	\N	S,E                   1/27	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.223+00	2026-03-07 10:27:52.223+00	\N	\N	\N	\N	f	t	t	MDEA	2026 Bucket Completed	97	f	\N	\N
d6f77a26-5ebc-4e7f-83ed-227bc1056655	21ba8286-d2dc-4a25-9629-668992d8a088	BUCKET	DENNIS	286 Moulton Street	Hamilton	2026-02-04	\N	\N	3000.00	6.50	0.00	2026-01-23	NO EMAIL	DS	\N	\N	\N	f	f	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.226+00	2026-03-07 10:27:52.226+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	98	f	\N	\N
f391d58f-e53d-40ef-92c5-841a9463e563	96b1ce78-b448-4644-82b2-70f4ac188f41	BUCKET	DENNIS	63 West Street	Beverly	2026-02-03	\N	\N	4500.00	4.00	0.00	2025-10-20	\N	V, E 1/23	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.23+00	2026-03-07 10:27:52.23+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	99	f	\N	\N
1e2762c8-fb4f-453c-a907-fa819a1e02cc	eb8a19cb-5161-4a3b-9801-d1732f29336b	BUCKET	DENNIS	123 Beach Rd	Salisbury	2025-01-29	\N	\N	600.00	1.00	0.00	2025-12-09	\N	S, E 12/30	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.237+00	2026-03-07 10:27:52.237+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	101	f	\N	\N
8614c8f0-66cb-4494-a6c7-a3aab8b9ce02	1089f83c-cf73-449a-a23f-8668cac2660a	BUCKET	DENNIS	27 Burley Street	Wenham	2026-01-29	\N	\N	2000.00	4.00	0.00	2025-12-18	\N	S, E 12/23	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.241+00	2026-03-07 10:27:52.241+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	102	f	\N	\N
65748699-230d-4774-bebf-9a65a748f270	c93cdc4e-9ca4-4d50-90c6-de2467ef44be	BUCKET	DENNIS	261 Dodge Road	Rowley	2026-01-23	\N	\N	1000.00	2.00	0.00	2025-04-21	E 4/21	S, E 1/19	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.246+00	2026-03-07 10:27:52.246+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	103	f	\N	\N
383f505b-0be9-46e9-bb2c-b5bd60d48b83	07c4fe10-310d-43fd-acaf-06f36b742fa9	BUCKET	DENNIS	5 Arrowhead Trail	Ipswich	2026-01-23	\N	\N	1000.00	1.50	0.00	2025-11-13	\N	S, E          1/19	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.25+00	2026-03-07 10:27:52.25+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	104	f	\N	\N
3665d925-a8fe-4975-a4b6-979b1282bccd	df58122b-db4b-4f42-942a-c57bae1bc4fa	BUCKET	DENNIS	28 Choate Lane	Ipswich	2026-01-23	\N	\N	700.00	1.00	0.00	2025-03-21	E 3/21	S, E 1/19	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.254+00	2026-03-07 10:27:52.254+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	105	f	\N	\N
d391463d-38a4-4f00-84eb-09c3e2026db9	41cbffc1-2115-4ddf-8fb4-90c869cb456c	BUCKET	DENNIS	31 Mount Pleasant	Ipswich	2026-01-23	\N	\N	300.00	0.50	0.00	2025-12-09	\N	V, E 1/19*	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.257+00	2026-03-07 10:27:52.257+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	106	f	\N	\N
2f915f8b-001d-47d0-8aec-92a130e51575	44923a04-4457-4ef1-bbc5-0c14f1f25389	BUCKET	DENNIS	38 Moody St	Byfield (newbury)	2026-01-23	\N	\N	2500.00	3.50	0.00	2025-11-12	\N	S          1/19	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.265+00	2026-03-07 10:27:52.265+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	108	f	\N	\N
b6c93668-58c2-4b06-b509-157276986a28	195ea816-7b17-4685-9063-42694c13d712	BUCKET	DENNIS	83 South Street	Mansfield	2026-01-23	\N	\N	4500.00	8.00	0.00	2026-01-08	\N	S, E 1/19	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.268+00	2026-03-07 10:27:52.268+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	109	f	\N	\N
9f25db70-c806-4864-b94a-8f7015241cf8	2884cf43-84e4-409b-a89d-701b86bf3700	BUCKET	DENNIS	240 Atlantic Road	Gloucester	2026-01-23	\N	\N	1800.00	3.00	0.00	2026-01-12	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.273+00	2026-03-07 10:27:52.273+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	110	f	\N	\N
6865295b-1eab-402d-b100-3e53c72ff430	a8e2cd54-02e2-4954-93b0-dfb6d0d1b4d8	BUCKET	DENNIS	6 Birch Road	Hamilton	2026-01-23	\N	\N	3000.00	6.00	0.00	2025-10-19	\N	S, E 12/3                          S, E 1/19	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.276+00	2026-03-07 10:27:52.276+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	111	f	\N	\N
be96ba6d-a6de-4ce5-a941-d545eed9b462	267e6f4d-9b96-49de-84d1-32b4754ec724	BUCKET	DENNIS	41 Central St	Beverly	2026-01-22	\N	\N	1500.00	3.00	0.00	2025-12-10	\N	S, E 12/22	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.28+00	2026-03-07 10:27:52.28+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	112	f	\N	\N
9e1487fe-305b-4cae-9afe-a7b42b6f9988	2768b26c-aa85-4116-8551-c38e6c962204	BUCKET	DENNIS	50 Lothrop St	Beverly	2026-01-22	\N	\N	1500.00	3.00	0.00	2025-12-10	\N	V 12/22*	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.284+00	2026-03-07 10:27:52.284+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	113	f	\N	\N
029563ec-ff56-4ef6-a824-f5b533b7ae99	0722916d-9f33-447a-9960-97d922f4502e	BUCKET	DENNIS	31 Topsfield Road	Wenham	2026-01-22	\N	\N	1200.00	2.25	0.00	2025-12-19	\N	S, E 12/23	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.288+00	2026-03-07 10:27:52.288+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	114	f	\N	\N
178a0b12-6f3b-40c7-b0c5-c3acdb80b98e	c291d8b0-de60-4273-abb0-5efa2f504b05	BUCKET	DENNIS	Beverly Golf & Tennis	Beverly	2026-01-22	\N	\N	7500.00	8.00	0.00	2025-12-10	\N	DS	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.292+00	2026-03-07 10:27:52.292+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	115	f	\N	\N
e163f182-dc2b-4fca-ab24-4b88b50e035a	f17d3baf-f229-4c69-b72c-9f715d11dbce	BUCKET	DENNIS	15 Daniels Road	Wenham	2026-01-22	\N	\N	3500.00	5.00	0.00	2025-11-10	\N	S, E 11/25	\N	\N	\N	t	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.295+00	2026-03-07 10:27:52.295+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	116	f	\N	\N
13a599d9-d056-44b9-8287-f099eadc3ab7	a854f578-0207-4072-ac0a-c09a3ccece98	BUCKET	DENNIS	14 Larch Row	Wenham	2026-01-22	\N	\N	900.00	1.50	0.00	2025-12-18	\N	V, T          1/15*	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.299+00	2026-03-07 10:27:52.299+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	117	f	\N	\N
8aa24e80-fd6b-45f7-a7cd-f94bb4c5cda6	476093aa-e87b-483e-8480-2dfaccdfed48	BUCKET	DENNIS	11 Pine Hill Rd	Swampscott	2026-01-21	\N	\N	600.00	1.00	0.00	2025-12-10	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.302+00	2026-03-07 10:27:52.302+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	118	f	\N	\N
47970bfc-b219-4a12-915d-6d501c4c4020	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	DENNIS	240 Asbury St.	Hamilton	2026-01-21	\N	\N	0.00	4.00	0.00	\N	\N	JM	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.309+00	2026-03-07 10:27:52.309+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	120	f	\N	\N
f9b1050c-58ad-490f-b65d-58b99c1bd544	ebd14c5d-1da7-477d-bc9f-cce37262f20e	BUCKET	DENNIS	38a Collins Street	Danvers	2026-01-21	\N	\N	1500.00	3.00	0.00	2026-01-12	\N	S, E 1/13	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.313+00	2026-03-07 10:27:52.313+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	121	f	\N	\N
61a97d88-6057-40d8-bf50-02f756a71dad	863d99f6-0b3c-4dc5-a62f-3279f337d11f	BUCKET	DENNIS	33 Reservoir Drive	Danvers	2026-01-21	\N	\N	0.00	4.00	0.00	2025-12-22	\N	V, E         1/6*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.316+00	2026-03-07 10:27:52.316+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	122	f	\N	\N
618d415f-6b34-403e-9783-7db8aff1d991	ec8bcb46-7410-4acb-907b-44147684ea99	BUCKET	DENNIS	4 Maudsley View Lane	Amesbury	2025-01-21	\N	\N	1500.00	3.00	0.00	2025-07-24	E 7/24	V, E 12/30*	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.32+00	2026-03-07 10:27:52.32+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	123	f	\N	\N
7240b024-38ef-406c-9a6b-df92ba475cb1	246596bc-0359-4455-9ed3-2f9422d341b0	BUCKET	DENNIS	335 Haverhill Street	N. Reading	2026-01-20	\N	\N	2300.00	4.00	0.00	2026-01-14	\N	S             1/19	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.323+00	2026-03-07 10:27:52.323+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	124	f	\N	\N
3ed45345-07d5-423b-8fee-060e06cf7a90	245bf0a0-9020-4cbf-a9bd-4aa5909738c4	BUCKET	DENNIS	30 Porter Road	Boxford	2026-01-20	\N	\N	1200.00	2.25	0.00	2025-10-20	\N	S                  1/19	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.327+00	2026-03-07 10:27:52.327+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	125	f	\N	\N
ba14933b-1659-4c61-bb75-c9333e4dc659	8887ef66-2f87-44a0-850c-d67b5cc5d62f	BUCKET	DENNIS	37 Longbow Road	Danvers	2026-01-20	\N	\N	2000.00	4.00	0.00	2025-12-19	\N	S, E 12/30	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.333+00	2026-03-07 10:27:52.333+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	127	f	\N	\N
4cd95b3b-585c-4227-9963-405580adf7a6	b424c7b2-fb5a-4437-8775-e4539463626a	BUCKET	DENNIS	185 Ipswich Road	Boxford	2026-01-20	\N	\N	4000.00	8.00	0.00	2025-11-25	\N	S, T 12/16	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.336+00	2026-03-07 10:27:52.336+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	128	f	\N	\N
a67e3310-787f-425f-ba05-dbb5ec1b7aba	7e47f408-4929-4386-ba5e-d2fa11d73b9c	BUCKET	DENNIS	21 Locusts Street	Danvers	2026-01-16	\N	\N	5500.00	8.00	0.00	2026-01-15	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.34+00	2026-03-07 10:27:52.34+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	129	f	\N	\N
9ccdc34c-4bba-4e9f-9a19-4049426ad507	d02a6c01-65af-47fb-99e5-51da9070286c	BUCKET	DENNIS	19 Cressy Street	Beverly	2026-01-16	\N	\N	500.00	0.50	0.00	2026-01-15	\N	V, T, E 1/15*	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.343+00	2026-03-07 10:27:52.343+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	130	f	\N	\N
10b1ecf4-e2ab-4956-83dc-0c17784053f4	aeee9dc8-15ea-4a36-a6f8-28bf1f496e28	BUCKET	DENNIS	8 Sylvester Avenue	Beverly	2026-01-15	\N	\N	1500.00	3.00	0.00	2025-11-10	\N	S, E 11/25	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.35+00	2026-03-07 10:27:52.35+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	132	f	\N	\N
17b94ce4-e5ec-47a8-bdc9-9e17a118f16d	fa5cc74d-dc65-435a-b55d-a9db558c6c42	BUCKET	DENNIS	35 Hayes Avenue	Beverly	2026-01-15	\N	\N	0.00	1.00	0.00	2026-01-08	\N	S            1/12	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.353+00	2026-03-07 10:27:52.353+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	133	f	\N	\N
a0417779-3255-4fb9-b829-846bddca62dd	a4b561da-007a-4028-b9dc-ee0424b482ea	BUCKET	DENNIS	2-8 Berry St	Danvers	2026-01-15	\N	\N	0.00	4.00	0.00	2025-12-09	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.36+00	2026-03-07 10:27:52.36+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	135	f	\N	\N
d005d3f0-f364-4ab6-9bac-ec7aa0a5cd9f	c65ad20f-b653-4fa3-8dec-723e59d24583	BUCKET	DENNIS	6 Ralph Road	Danvers	2026-01-15	\N	\N	600.00	1.00	0.00	2025-12-30	\N	V, T 1/13*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.364+00	2026-03-07 10:27:52.364+00	\N	\N	\N	\N	f	f	t	mid	2026 Bucket Completed	136	f	\N	\N
0c194a00-9a7e-499e-b6dc-c6a88542ad29	978a27d7-0a30-4f5c-9f56-8702495e8b0e	BUCKET	DENNIS	31 Highland Street	Hamilton	2026-01-15	\N	\N	1200.00	2.00	0.00	2025-11-03	\N	V, E 1/8*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.367+00	2026-03-07 10:27:52.367+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	137	f	\N	\N
b92d2d25-9645-4af1-9150-05f93f06e44c	a6d85630-7273-4c5c-9d4c-45e5b8dbb082	BUCKET	DENNIS	114 Topsfield Road	Wenham	2026-01-16	\N	\N	1200.00	2.25	0.00	2025-11-25	\N	V, E 12/31	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.371+00	2026-03-07 10:27:52.371+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	138	f	\N	\N
f1d7d301-0c75-4833-98b2-28e81bacc74c	0bd57963-fe25-4fa9-b52b-32a3aec76af9	BUCKET	DENNIS	10 Grapevine Road	Wenham	2026-01-15	\N	\N	1500.00	3.00	0.00	2025-11-19	\N	S, E 11/25	\N	\N	\N	t	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.374+00	2026-03-07 10:27:52.374+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	139	f	\N	\N
dab9527d-26a1-42dd-8d5f-b6efe126eb1c	6d97dc24-2939-4194-b6ab-a7a92a786492	BUCKET	DENNIS	Larch, Cherry, Monument, Walnut	Wenham	2025-01-14	\N	\N	0.00	16.00	0.00	2025-11-05	\N	DS	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.377+00	2026-03-07 10:27:52.377+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	140	f	\N	\N
c6364219-f12d-4104-b44a-43c402ddee39	1e74b001-e765-4180-931b-0963abb994e2	BUCKET	DENNIS	7 Loma Drive	Gloucester	2026-01-14	\N	\N	2000.00	4.00	0.00	2025-11-26	\N	S, E 12/30	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.381+00	2026-03-07 10:27:52.381+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	141	f	\N	\N
89e45cd2-2766-4c6c-9f69-0791629ba98b	94563a4f-2c73-4a15-83aa-f44646f212b8	BUCKET	DENNIS	13 Fern Street	Beverly	2026-01-14	\N	\N	700.00	1.50	0.00	2025-06-22	E 6/23	V, E          1/5*	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.385+00	2026-03-07 10:27:52.385+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	142	f	\N	\N
da1483c2-a70b-42a5-8a4d-10dfe549f629	ee87ac48-0325-471f-8e47-8b5ed9e0b586	BUCKET	DENNIS	22 Collins Street	Danvers	2026-01-14	\N	\N	600.00	1.00	0.00	2025-12-19	\N	S, E 12/22	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.388+00	2026-03-07 10:27:52.388+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	143	f	\N	\N
c56b53c2-090a-47da-9e3d-5ad1c1173d27	4ed397d4-35dd-41aa-a48c-40cd04b1bad8	BUCKET	DENNIS	13 Thomas Rd	Danvers	2026-01-14	\N	\N	1200.00	2.25	0.00	2026-01-05	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.392+00	2026-03-07 10:27:52.392+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	144	f	\N	\N
e88e58ee-c457-4103-892c-bc230f82c866	72950902-bb6f-40b2-9394-38f84f2e2df5	BUCKET	DENNIS	33 Monument St.	Wenham	2026-01-13	\N	\N	0.00	1.50	0.00	2026-12-23	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.399+00	2026-03-07 10:27:52.399+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	146	f	\N	\N
957bb1cf-cc2b-4891-b696-77e209a81781	a70778a0-094c-4b05-a529-3d8ef2d20489	BUCKET	DENNIS	78 Pye Brook Lane	Boxford	2026-01-13	\N	\N	800.00	1.50	0.00	2026-01-05	\N	S, E             1/6	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.403+00	2026-03-07 10:27:52.403+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	147	f	\N	\N
76f1e5fe-2eb4-4934-9117-472a559cd398	d9e118a5-8755-4caa-8186-82ef9434c4ee	BUCKET	DENNIS	157 King Street	Groveland	2026-01-13	\N	\N	1200.00	2.25	0.00	2026-01-06	\N	S, E             1/8	\N	\N	\N	t	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.41+00	2026-03-07 10:27:52.41+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	149	f	\N	\N
96816a3f-466f-4118-8065-0948d5ab935d	06f275cb-67d2-440c-b552-13f94151766e	BUCKET	DENNIS	85 Sam Fonzo Drive	Beverly	2026-01-13	\N	\N	2500.00	4.00	0.00	2025-11-25	\N	S, E 12/16	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.414+00	2026-03-07 10:27:52.414+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	150	f	\N	\N
df10e84f-40d3-437e-a5f1-59edb735c4c3	c68a5279-280e-4d14-bbf3-a596d14547ef	BUCKET	DENNIS	50 Rantoul Street	Beverly	2026-01-13	\N	\N	1800.00	3.50	0.00	2025-11-25	\N	S, E 12/16	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.418+00	2026-03-07 10:27:52.418+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	151	f	\N	\N
d434f37c-14e6-4cd4-8eb2-b37f34b6bf20	b28b6cc3-878b-4119-b89e-60590ef70380	BUCKET	DENNIS	8 Linden Circle	G'town	2026-01-12	\N	\N	2000.00	4.00	0.00	2025-11-12	\N	V, E 11/25*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.421+00	2026-03-07 10:27:52.421+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	152	f	\N	\N
fef915d9-ac3a-473c-baae-ed0c9baa134b	7b76748c-fbce-461b-8f99-036842a2ca12	BUCKET	DENNIS	8 Lake Avenue	G'town	2026-01-12	\N	\N	1800.00	3.00	0.00	2025-11-13	\N	E 11/25                     T 12/2                          T 12/3*	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.425+00	2026-03-07 10:27:52.425+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	153	f	\N	\N
b3dd5d9f-c478-4014-a3c0-256356b07435	d6ab63c8-3212-440b-8c18-7f68d570c6c0	BUCKET	DENNIS	5 Birch Tree Drive	G'town	2026-01-12	\N	\N	0.00	1.00	0.00	2025-12-15	\N	S, E 12/22	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.428+00	2026-03-07 10:27:52.428+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	154	f	\N	\N
7254ffa3-31e5-47b0-ac03-1bff359bfb8f	818ef441-5b48-43f5-8d00-fe0332fdd9c1	BUCKET	DENNIS	2 Madonna Drive	Hamilton	2026-01-08	\N	\N	600.00	1.00	0.00	2026-01-02	\N	S, E          1/5	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.432+00	2026-03-07 10:27:52.432+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	155	f	\N	\N
cf551fd2-1e23-433e-8d2c-4eb47b130f53	76bf6759-b682-4671-9d5f-07ac13d248ee	BUCKET	DENNIS	16 Everett Street	Beverly	2026-01-08	\N	\N	2300.00	4.00	0.00	2025-11-13	\N	S, E 12/3	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.436+00	2026-03-07 10:27:52.436+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	156	f	\N	\N
422b1304-0ff4-4a01-aa33-26c6b36a6ccb	af4136b0-e787-4d92-9fa1-4c3389682851	BUCKET	DENNIS	22 Preston Place	Beverly	2026-01-08	\N	\N	1500.00	3.00	0.00	2025-11-19	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.439+00	2026-03-07 10:27:52.439+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	157	f	\N	\N
250d0be4-c759-41bf-bc41-0e5dc9899f6c	ef8435a5-770e-4955-9db9-84acdf05a38e	BUCKET	DENNIS	139 Gregory Island Road	Essex	2026-01-08	\N	\N	1200.00	2.00	0.00	2025-11-06	\N	S, E 11/20	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.442+00	2026-03-07 10:27:52.442+00	\N	\N	\N	\N	f	f	t	EA	2026 Bucket Completed	158	f	\N	\N
ccf5cabc-b476-4a61-b227-2af7d9757120	318873f4-6907-41c5-a879-2616a1ec1da0	BUCKET	DENNIS	15 Essex Street	Hamilton	2026-01-08	\N	\N	1000.00	1.50	0.00	2025-10-22	\N	S 1/7	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.446+00	2026-03-07 10:27:52.446+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	159	f	\N	\N
d8cc524e-bbea-4e83-bf0e-d940c7a442e4	bf577631-737d-4690-8f78-2542ba72683e	BUCKET	DENNIS	20 Boardman Avenue	Mbts	2026-01-08	\N	\N	2850.00	5.00	0.00	2025-11-12	\N	S, E 11/20	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.45+00	2026-03-07 10:27:52.45+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	160	f	\N	\N
af25baf3-1716-4402-b4c0-478d37b3e19c	ab32d1a9-6a86-4c87-a415-c90a0b86c086	BUCKET	DENNIS	13 Halls Way	Seabrook, Nh	2026-01-07	\N	\N	900.00	1.50	0.00	2025-11-10	\N	S, E 11/25	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.456+00	2026-03-07 10:27:52.456+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	162	f	\N	\N
522aa8d9-602c-4161-9732-aa2754eb4ce6	d69752b7-1134-4a94-b2a1-3dc3c79c8fec	BUCKET	DENNIS	16 Friedenfels Street	Salisbury	2026-01-07	\N	\N	1500.00	3.00	0.00	2025-11-10	\N	S, E 11/20	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.462+00	2026-03-07 10:27:52.462+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	164	f	\N	\N
e2f48c25-dd95-456b-abb9-b1136565cc1f	412bde1d-b10c-439c-bbf7-65c9fb54f033	BUCKET	DENNIS	44 Baker	Beverly	2026-01-07	\N	\N	2000.00	4.00	0.00	2025-11-24	\N	V, T 1/7*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.466+00	2026-03-07 10:27:52.466+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	165	f	\N	\N
6b716bd0-54f4-4add-8321-ac220f70d868	c69e5fbd-90a4-40d7-affc-0ff527d467b2	BUCKET	DENNIS	47 Sohier Rd	Beverly	2026-01-06	\N	\N	500.00	0.50	0.00	2026-01-05	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.469+00	2026-03-07 10:27:52.469+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	166	f	\N	\N
0bb6e009-c408-472c-a9de-c9591f8bb31a	cf799264-cafd-4ce9-b70f-38366fe79d09	BUCKET	DENNIS	25 Fairway Drive	Topsfield	2026-01-06	\N	\N	5000.00	8.00	0.00	2025-11-20	\N	S, E          12/3	\N	\N	\N	f	t	f	DS HAS IT	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.472+00	2026-03-07 10:27:52.472+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	167	f	\N	\N
120d8b60-30a4-4b7e-9c45-769a877731b3	043ad842-4ba8-46a1-a2f4-b3f9b183abb9	BUCKET	DENNIS	10 Railroad Ave	Rockport	2026-01-06	\N	\N	2000.00	4.00	0.00	2025-12-08	\N	V, T 1/5*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.476+00	2026-03-07 10:27:52.476+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	168	f	\N	\N
403a1ca1-33ad-4adc-89d6-4e90ba4725f8	9268620d-f5a1-4a56-b7d6-01aac4723ddf	BUCKET	DENNIS	1 Chestnut Drive	Rockport	2026-01-06	\N	\N	2000.00	4.00	0.00	2025-12-09	\N	V, T 1/5*	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.479+00	2026-03-07 10:27:52.479+00	\N	\N	\N	\N	f	f	t	MID	2026 Bucket Completed	169	f	\N	\N
d75a506d-9454-4b6a-b36c-3168e1b8b3be	0a56af05-ba9a-400c-965d-1e7598818f15	BUCKET	DENNIS	19 Olsen Road	Peabody	2026-01-06	\N	\N	1800.00	3.50	0.00	2025-10-04	\N	V, T 11/20*	\N	\N	\N	t	f	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.482+00	2026-03-07 10:27:52.482+00	\N	\N	\N	\N	f	f	t	ML	2026 Bucket Completed	170	f	\N	\N
49ea9612-b5db-45bc-94ee-0a97371d76d9	7331cc56-3470-4dbc-9d19-47f3e5600068	BUCKET	DENNIS	2 Riding Club	Danvers	2026-01-06	\N	\N	1700.00	3.00	0.00	2025-11-19	\N	V, E 12/3*	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.486+00	2026-03-07 10:27:52.486+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	171	f	\N	\N
08de227b-12db-4e96-af95-74aec735c36a	b33cc330-3125-4213-96e9-20f6af972e20	BUCKET	DENNIS	72 Cedar St	Wenham	2026-01-05	\N	\N	4000.00	7.00	0.00	2025-11-11	\N	V 11/25*	\N	\N	\N	t	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.489+00	2026-03-07 10:27:52.489+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	172	f	\N	\N
84129197-81cf-40a7-a923-d64da4859a60	2eaf2461-ff91-47ac-b14a-0fe281d2a636	BUCKET	DENNIS	195 Rowley Bridge Road	Topsfield	2026-01-05	\N	\N	1500.00	3.00	0.00	2025-11-05	\N	S, E 11/20	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.493+00	2026-03-07 10:27:52.493+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	173	f	\N	\N
daccacc5-29ca-4e96-a4b9-aee4ea882a7e	b811776a-7b7b-4b91-8f32-34461a3813d3	BUCKET	DENNIS	30 Carter Street	Nbpt	2026-01-05	\N	\N	1200.00	2.00	0.00	2025-11-19	\N	S, E           12/3	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.496+00	2026-03-07 10:27:52.496+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	174	f	\N	\N
b1d16879-bf33-4419-b14f-8cdb3918a66d	5f6645d3-ee26-46f4-9f8b-0c0530efe530	BUCKET	DENNIS	22 Goldsmith Drive	Nbpt	2026-01-05	\N	\N	2300.00	4.00	0.00	2025-11-08	\N	S, E 11/20	\N	\N	\N	f	t	t	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.499+00	2026-03-07 10:27:52.499+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	175	f	\N	\N
6e312c01-0ff9-43ad-98ae-6d515b2e2673	9cd98ddf-bb06-4ee7-81de-1ef001519825	BUCKET	DENNIS	33 Centre Street	Danvers	2026-01-05	\N	\N	2000.00	4.00	0.00	2025-11-14	\N	V, E 11/25*	\N	\N	\N	f	t	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.502+00	2026-03-07 10:27:52.502+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	176	f	\N	\N
315d6584-25c6-4fca-9897-fa48645695e2	a41f1ffc-a4af-4e6a-a4c2-9443420b789d	BUCKET	DENNIS	645 Bay Road	Hamilton	2026-01-02	\N	\N	0.00	1.00	0.00	2025-12-31	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.509+00	2026-03-07 10:27:52.509+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	178	f	\N	\N
991bfdba-6a78-41b1-a8c1-cb9ca05ac527	7f110a87-e26b-4613-8681-b562d83051d5	BUCKET	DENNIS	287 Lafayette St	Salem	2026-01-02	\N	\N	3000.00	6.00	0.00	2025-11-18	\N	DS	\N	\N	\N	f	t	t		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.512+00	2026-03-07 10:27:52.512+00	\N	\N	\N	\N	f	f	t	LMMD	2026 Bucket Completed	179	f	\N	\N
6bfedd2c-4e31-4a8e-9bd3-7c70b5c66e96	7f110a87-e26b-4613-8681-b562d83051d5	BUCKET	DENNIS	352 Lafayette Street	Salem	2026-01-02	\N	\N	600.00	1.00	0.00	2025-12-29	\N	DS	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.515+00	2026-03-07 10:27:52.515+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	180	f	\N	\N
fc03df9d-075c-4969-9089-2c51d840ca24	345bbf9c-350d-46e9-8617-60abbe12cd08	BUCKET	DENNIS	12 Morris Street	Malden	2026-01-02	\N	\N	1200.00	2.25	0.00	2025-12-08	\N	S              12/31	\N	\N	\N	f	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.519+00	2026-03-07 10:27:52.519+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	181	f	\N	\N
323ebcfc-9265-44bd-b0a5-4d3148323a03	c9f8cc48-074a-42e7-adb1-98e5ea617202	BUCKET	DENNIS	22 Forest Street	Malden	2026-01-02	\N	\N	0.00	3.00	0.00	2025-12-23	\N	DS	\N	\N	\N	f	f	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.522+00	2026-03-07 10:27:52.522+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	182	f	\N	\N
2b5df767-15cd-49b6-b3b2-76a7c39767b8	7b57da71-8653-43b0-8a20-b03416078674	BUCKET	DENNIS	50 Baldwin St	Lynn	2026-01-02	\N	\N	0.00	2.00	0.00	2025-12-29	\N	DS	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.526+00	2026-03-07 10:27:52.526+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	183	f	\N	\N
129883b0-dd3a-4fa4-a4c4-9c80f647a04f	c801cc82-87bc-4c07-9da2-75ed6d72def9	BUCKET	DENNIS	364 Linebrook Road	Ipswich	\N	\N	\N	4000.00	6.00	0.00	2025-11-13	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.891+00	2026-03-07 10:27:52.891+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	54	f	\N	\N
dec5b11c-1ff8-4c9c-8ce4-137bb514fbd3	026f25b1-ef1a-4edc-b91d-48ee4a6feefb	CRANE	DENNIS	140 Hart St.	Beverly	\N	\N	\N	0.00	8.00	0.00	2024-11-01	\N	\N	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.749+00	2026-03-07 10:27:52.749+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	5	f	\N	\N
a330fe00-dc03-4285-93c2-41e82e42beb1	465de2cd-3a02-4d42-8028-7cbdf5d88eaa	CRANE	DENNIS	58 Standley Street	Beverly	\N	\N	\N	4500.00	4.00	0.00	2025-03-19	\N	\N	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.751+00	2026-03-07 10:27:52.751+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	6	f	\N	\N
cd3ba7c8-cdff-4f1c-af22-99a5de11280f	583a47a0-d1d9-4490-9d51-cc7cf01b0ff8	CRANE	DENNIS	7 Avalon Avenue	Beverly	\N	\N	\N	3500.00	3.00	0.00	2025-11-19	\N	\N	\N	\N	MODEL_1060	f	t	f	AFTER JAN 1, WANTS A JAN/FEB DATE                                       WANTS IT DONE AT SAME TIME AS BUCKET (SAME ADDRESS)	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.753+00	2026-03-07 10:27:52.753+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	7	f	\N	\N
0333d32a-a443-4d44-90c5-f9ab0b97d8d8	e1c63a30-72c1-4da5-9d06-7f456b68bb2d	CRANE	DENNIS	588 Cabot Street	Beverly	\N	\N	\N	0.00	2.00	0.00	2025-12-21	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS FROM 12/24, TOO BUSY OF AN AREA	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.755+00	2026-03-07 10:27:52.755+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	8	f	\N	\N
197a19fe-c441-4d42-b22d-6d285bacf5c4	863d99f6-0b3c-4dc5-a62f-3279f337d11f	CRANE	DENNIS	33 Reservoir Drive	Danvers	\N	\N	\N	0.00	2.00	0.00	2025-12-22	\N	\N	\N	\N	MODEL_1060	f	f	f	T&M 2HRS                                             …BUCKET ALSO                                          DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.758+00	2026-03-07 10:27:52.758+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	9	f	BUCKET	\N
3b1ae653-3e5d-47d9-989d-f9a9edad1640	2810a043-7aa9-4eea-bf45-288c3c89bb8f	CRANE	DENNIS	3 Thomas Road	Danvers	\N	\N	\N	6000.00	6.50	0.00	2025-08-03	\N	\N	\N	\N	MODEL_1060	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.76+00	2026-03-07 10:27:52.76+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	10	f	\N	\N
9d000807-e95d-44c8-8270-8321b443e79d	93ed8a45-584a-47f6-be85-728070aa6347	CRANE	DENNIS	37 Cherry Street	Danvers	\N	\N	\N	2000.00	3.00	0.00	2025-12-22	\N	\N	\N	\N	MODEL_1060	f	f	f	DETAIL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.762+00	2026-03-07 10:27:52.762+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	11	f	\N	\N
da2ce28f-6be2-478c-b1d3-7d0e8fe6cb5e	aee096bb-0f5a-4ce5-a99f-a704fe2c4561	CRANE	DENNIS	79 Gardner Street	Hamilton	\N	\N	\N	2200.00	2.00	0.00	2025-10-13	\N	\N	\N	\N	MODEL_1060	f	f	f	TBRS 2/16-FEB VACATION                                    TBRS 12/29-WILL WAIT UNTIL FEB	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.765+00	2026-03-07 10:27:52.765+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	13	f	\N	\N
15a68e02-d8a0-411b-9311-5acbbbb9070e	9f1056e8-0bf2-4022-9227-5beef691ba6f	CRANE	DENNIS	180 Asbury Street	Hamilton	\N	\N	\N	3500.00	3.50	0.00	2025-08-08	\N	\N	\N	\N	MODEL_1060	f	t	f	DTL                                                 DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.771+00	2026-03-07 10:27:52.771+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	14	f	\N	\N
c6c5d4a3-0252-4625-af10-7174da5836b6	9bc206d0-f1e9-40e6-8a3c-0c943dfcec4e	CRANE	DENNIS	27 Lakeman's Lane	Ipswich	\N	\N	\N	4500.00	4.00	0.00	2025-06-19	E 6/19	\N	\N	\N	MODEL_1060	f	t	f	TBD IN WINTER                        …BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.774+00	2026-03-07 10:27:52.774+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	16	f	BUCKET	\N
fc862d1f-e46b-423d-8c8e-6679244520cc	412c2dae-c39c-4a20-923a-dcd132c9f946	CRANE	DENNIS	240 County Road	Ipswich	\N	\N	\N	4000.00	4.00	0.00	2025-07-25	\N	\N	\N	\N	MODEL_1090	f	f	f	TBRS FROM 12/27 DUE TO SNOW                                           MOVED TO 12/27 PER DS                                             RS FOR 12/13                                TBRS FROM 10/18 DUE TO PRESSING JOB                                     …BUCKET ALSO                     TO BE DONE ON SATURDAYS ONLY                                                                                W/DW                                                        DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.781+00	2026-03-07 10:27:52.781+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	19	f	BUCKET	\N
1b6147bd-20de-457b-a2f9-bfda6ef01da9	6cae4540-91b8-44db-b213-0879cfd6d1c5	CRANE	DENNIS	140 Linwood Street	Lynn	\N	\N	\N	3500.00	3.00	0.00	2025-09-24	\N	\N	\N	\N	EITHER	f	f	f	TBRS FROM 11/19 - DID NOT CONFIRM WITH CLIENT                                              DS HANDLE ALL	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.785+00	2026-03-07 10:27:52.785+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	21	f	\N	\N
0fd6e824-bfc2-4b66-91a7-45d812091932	7e843fc5-410e-4ca0-a5f1-1c0099ca6065	CRANE	DENNIS	Bartletts Reach Rd	Amesbury	\N	\N	\N	2000.00	3.00	0.00	2025-10-17	\N	DS	\N	\N	MODEL_1090	f	t	f	…BUCKET ALSO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.747+00	2026-03-07 10:27:52.747+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	3	f	BUCKET	\N
aa0f629f-bc51-45df-8e5c-8e07d9f1dc52	ff94ac8e-547d-49c7-8496-3b1d7dd49e72	CRANE	DENNIS	53 Bare Hill Road	Topsfield	\N	\N	\N	2000.00	2.00	0.00	2025-12-22	\N	\N	\N	\N	MODEL_1060	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.796+00	2026-03-07 10:27:52.796+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	28	f	\N	\N
0ae15c22-0a0a-425e-95c9-87fb249a20ae	553f5dec-3c5f-410c-a338-92cfd9e97141	BUCKET	DENNIS	14 Cabot Court	Amesbury	\N	\N	\N	1600.00	3.00	0.00	2025-11-21	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.809+00	2026-03-07 10:27:52.809+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	4	f	\N	\N
6511b408-71c5-491a-8194-93fbda19a191	ec8bcb46-7410-4acb-907b-44147684ea99	BUCKET	DENNIS	4 Maudsley View Lane	Amesbury	\N	\N	\N	1500.00	3.00	0.00	2025-07-24	E 7/24	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.811+00	2026-03-07 10:27:52.811+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	5	f	\N	\N
df51d5e4-335f-4809-94af-83fddb315206	c15ff011-2a20-45b7-9479-9363735b0511	BUCKET	DENNIS	55 Pleasant Valley Rd.	Amesbury	\N	\N	\N	7500.00	8.00	0.00	2025-10-14	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.816+00	2026-03-07 10:27:52.816+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	7	f	\N	\N
aff4471c-2793-40e1-9f56-c2cd90d7473f	5906bd03-c575-4217-9a4f-72cf8bc774da	BUCKET	DENNIS	42 Washington Ave	Andover	\N	\N	\N	4800.00	8.00	0.00	2025-11-19	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.818+00	2026-03-07 10:27:52.818+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	9	f	\N	\N
2080dc0f-127b-4c42-b84d-6d93929fa143	026f25b1-ef1a-4edc-b91d-48ee4a6feefb	BUCKET	DENNIS	140 Hart Street	Beverly	\N	\N	\N	0.00	8.00	0.00	2025-09-07	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.82+00	2026-03-07 10:27:52.82+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	11	f	\N	\N
8f03904b-1f09-4fab-9a4e-5766dd502dc4	7c132671-30fc-4c36-b701-be30a38230c7	BUCKET	DENNIS	5 Marjorie Way	Beverly	\N	\N	\N	600.00	1.00	0.00	2025-07-21	E 7/22	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.823+00	2026-03-07 10:27:52.823+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	12	f	\N	\N
81fe44be-8f52-4f83-89b8-ba790b354ea6	94563a4f-2c73-4a15-83aa-f44646f212b8	BUCKET	DENNIS	13 Fern Street	Beverly	\N	\N	\N	700.00	1.50	0.00	2025-06-22	E 6/23	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.825+00	2026-03-07 10:27:52.825+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	13	f	\N	\N
7c54ecd9-c4be-4c47-b1f8-024e99506fbf	c15bba38-74f1-41be-98a4-c32978cbeaf2	BUCKET	DENNIS	343 Dodge Street	Beverly	\N	\N	\N	1200.00	2.00	0.00	2025-11-10	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.827+00	2026-03-07 10:27:52.827+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	14	f	\N	\N
9dccc6d2-1275-4717-8a67-2ffbe4db7dde	583a47a0-d1d9-4490-9d51-cc7cf01b0ff8	BUCKET	DENNIS	7 Avalon Avenue	Beverly	\N	\N	\N	2000.00	4.00	0.00	2025-11-12	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.829+00	2026-03-07 10:27:52.829+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	15	f	\N	\N
fda77729-f0bc-4c5d-bcec-410533f492ba	46bc4dad-6bd2-4341-975a-83160cae906b	BUCKET	DENNIS	204 Dodge Street	Beverly	\N	\N	\N	900.00	1.75	0.00	2025-07-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.832+00	2026-03-07 10:27:52.832+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	16	f	\N	\N
3a0243c5-6969-4e3d-9fc3-1b67d4b1673b	cc55ba37-35e3-4917-8128-6ff3000da51e	BUCKET	DENNIS	55 Putnam Street	Beverly	\N	\N	\N	700.00	1.50	0.00	2025-07-23	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.837+00	2026-03-07 10:27:52.837+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	18	f	\N	\N
2c485e2b-19c0-48aa-9cfa-dafb14347fe5	7a7695c1-f6cf-493f-ac9b-0e1dac6b9bcf	BUCKET	DENNIS	11 Cold Spring Drive	Boxford	\N	\N	\N	900.00	1.75	0.00	2025-09-15	E 9/15	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.839+00	2026-03-07 10:27:52.839+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	21	f	\N	\N
49cc3019-3b17-47e2-99ec-aac9c3d82673	86dcc3c6-fc72-4272-bc10-987c0737d7d9	BUCKET	DENNIS	17 Pinehurst Drive	Boxford	\N	\N	\N	4500.00	8.00	0.00	2025-05-08	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.841+00	2026-03-07 10:27:52.841+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	22	f	\N	\N
e2fbed65-9bd2-4eb4-ab80-3ad75659a4e9	245bf0a0-9020-4cbf-a9bd-4aa5909738c4	BUCKET	DENNIS	30 Porter Road	Boxford	\N	\N	\N	1200.00	2.25	0.00	2025-10-20	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.843+00	2026-03-07 10:27:52.843+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	23	f	\N	\N
47a2b1d8-35dd-489d-ab9d-388340712f7b	da71033b-bbeb-464d-915b-4391052db512	BUCKET	DENNIS	677 Clement Hill Rd	Contoocook, Nh,	\N	\N	\N	0.00	80.00	0.00	2025-12-18	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.845+00	2026-03-07 10:27:52.845+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	25	f	\N	\N
a54db788-5dbb-482b-89bf-334ef2e87739	863d99f6-0b3c-4dc5-a62f-3279f337d11f	BUCKET	DENNIS	33 Reservoir Drive	Danvers	\N	\N	\N	0.00	4.00	0.00	2025-12-22	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.847+00	2026-03-07 10:27:52.847+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	27	f	\N	\N
2909d250-b316-48f7-a0e2-1d139e39e12c	dcb4c11f-f441-4f39-bcd9-3b832ffd7e03	BUCKET	DENNIS	23 Stafford	Danvers	\N	\N	\N	1200.00	2.25	0.00	2025-11-25	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.849+00	2026-03-07 10:27:52.849+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	28	f	\N	\N
a5c0c561-d444-4c18-a790-ba2ecca223d9	8887ef66-2f87-44a0-850c-d67b5cc5d62f	BUCKET	DENNIS	37 Longbow Road	Danvers	\N	\N	\N	2000.00	4.00	0.00	2025-12-19	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.851+00	2026-03-07 10:27:52.851+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	29	f	\N	\N
67ffcc15-e2c5-4fd7-8af7-7c57fb3a5507	e2ac858a-39dc-4384-8dbc-4efa666de014	BUCKET	DENNIS	116 Collins Street	Danvers	\N	\N	\N	1200.00	2.25	0.00	2025-09-30	E 10/1	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.855+00	2026-03-07 10:27:52.855+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	31	f	\N	\N
118fff0d-628b-49a7-a425-30e0993606d5	7906de09-3b50-4634-98c9-772d538e7dcc	BUCKET	DENNIS	208 Seven Star Rd	Groveland	\N	\N	\N	0.00	8.00	0.00	2025-10-16	\N	\N	\N	\N	\N	t	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.857+00	2026-03-07 10:27:52.857+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	33	f	\N	\N
64bf0b1c-c585-4ef6-91d2-eddc42f7e1e2	fb0d6d72-3d6a-4f94-bf42-745dfeba8a4c	BUCKET	DENNIS	15 Belleau Woods	G'town	\N	\N	\N	2000.00	4.00	0.00	2025-09-13	E 9/15	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.859+00	2026-03-07 10:27:52.859+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	35	f	\N	\N
e9932bd3-3838-4d6b-9123-f94f42e4e699	29b1c37b-50f7-416f-9ddc-89a511bcdd71	BUCKET	DENNIS	Andrew’s Court	Gloucester	\N	\N	\N	0.00	32.00	0.00	2025-11-13	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.862+00	2026-03-07 10:27:52.862+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	37	f	\N	\N
f2c3415b-3a99-419a-b213-c99688a5a223	1e74b001-e765-4180-931b-0963abb994e2	BUCKET	DENNIS	7 Loma Drive	Gloucester	\N	\N	\N	2000.00	4.00	0.00	2025-11-26	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.864+00	2026-03-07 10:27:52.864+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	38	f	\N	\N
3cf1f047-76fb-4f30-8958-099d30864a48	64ee6c97-1f6f-49bd-8946-99cf63e5d1ba	BUCKET	DENNIS	28 St. Louis Ave	Gloucester	\N	\N	\N	0.00	16.00	0.00	2025-11-21	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.866+00	2026-03-07 10:27:52.866+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	39	f	\N	\N
4e453f6e-8cf9-40f4-b7c0-209989a6aef8	8e734ad2-83be-4923-ae57-33a6e8f19fb6	BUCKET	DENNIS	31 Eastern Point Road	Gloucester	\N	\N	\N	2000.00	4.00	0.00	2025-11-20	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.868+00	2026-03-07 10:27:52.868+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	40	f	\N	\N
f70bf41e-b653-4223-90f0-88c0289fcf87	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	DENNIS	240 Asbury St.	Hamilton	\N	\N	\N	0.00	4.00	0.00	\N	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.87+00	2026-03-07 10:27:52.87+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	42	f	\N	\N
f424ac9a-8aa4-418f-a8f5-0eb87febf55b	03885929-3978-4d41-82e1-3d4f9ae37ce8	BUCKET	DENNIS	431 Highland Street	Hamilton	\N	\N	\N	9000.00	16.00	0.00	2025-10-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.872+00	2026-03-07 10:27:52.872+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	43	f	\N	\N
8f7cf710-236a-4707-a3c3-5f070d9c9b5c	c333f9c2-26f7-437a-b93a-7ac7d38811af	BUCKET	DENNIS	551 Highland Street	Hamilton	\N	\N	\N	4500.00	8.00	0.00	2025-11-03	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.874+00	2026-03-07 10:27:52.874+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	44	f	\N	\N
39b34cae-20f8-4878-b022-0b34c1fc6854	1f413835-5f36-467d-a94d-457f2b6314aa	BUCKET	DENNIS	297 Sagamore Street	Hamilton	\N	\N	\N	9000.00	16.00	0.00	2025-08-25	E 8/25	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.876+00	2026-03-07 10:27:52.876+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	45	f	\N	\N
486adfae-ef56-4bfd-aee8-98b596f5ea64	4406f13b-12b2-49d3-89cf-79f296268221	BUCKET	DENNIS	292 Bridge Street	Hamilton	\N	\N	\N	1200.00	2.00	0.00	2025-07-21	E 7/22	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.879+00	2026-03-07 10:27:52.879+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	46	f	\N	\N
670685bd-a8f8-4f5d-a58a-b2c850018850	30723735-214b-4e5e-8f21-fbfe9585717d	BUCKET	DENNIS	20 Drinkwater Rd	Hampton Falls, Nh	\N	\N	\N	8000.00	8.00	0.00	2025-09-24	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.882+00	2026-03-07 10:27:52.882+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	48	f	\N	\N
c2e1cf25-607f-47a3-a83c-354e9401011b	ff536a33-a52f-46f5-9333-d51b9c5520eb	BUCKET	DENNIS	5 Brentwood Way	Ipswich	\N	\N	\N	800.00	1.50	0.00	2025-05-19	E 5/19	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.884+00	2026-03-07 10:27:52.884+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	50	f	\N	\N
43717120-1fbd-497a-a48c-3a0181faee12	eceb45d2-866e-4dee-8f86-44791c35fa0f	BUCKET	DENNIS	3 Riverside Drive	Ipswich	\N	\N	\N	0.00	4.00	0.00	2025-06-26	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.886+00	2026-03-07 10:27:52.886+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	51	f	\N	\N
4ba70f75-f8bf-41ae-abc0-5bc1fdd011fe	7e843fc5-410e-4ca0-a5f1-1c0099ca6065	BUCKET	DENNIS	Bartletts Reach Rd	Amesbury	\N	\N	\N	10500.00	16.00	0.00	2025-10-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.807+00	2026-03-07 10:27:52.807+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	3	f	\N	\N
94b050db-574f-4a00-a9a5-8141525fad5e	bd6a4e49-4f46-4623-9ff5-13c1d9c12179	BUCKET	DENNIS	3 Cayer Way	Ipswich	\N	\N	\N	0.00	16.00	0.00	2025-10-07	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.893+00	2026-03-07 10:27:52.893+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	55	f	\N	\N
4522149d-8ff6-4cd4-845d-2f615c1217f6	7b57da71-8653-43b0-8a20-b03416078674	BUCKET	DENNIS	50 Baldwin St	Lynn	\N	\N	\N	0.00	2.00	0.00	2025-12-29	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.895+00	2026-03-07 10:27:52.895+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	57	f	\N	\N
fdb66586-a119-4687-b9b3-f3d9027c71de	345bbf9c-350d-46e9-8617-60abbe12cd08	BUCKET	DENNIS	12 Morris Street	Malden	\N	\N	\N	1200.00	2.25	0.00	2025-12-08	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.898+00	2026-03-07 10:27:52.898+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	59	f	\N	\N
4d8a3d2a-7fc4-4ec9-8914-8e44aae39126	c9f8cc48-074a-42e7-adb1-98e5ea617202	BUCKET	DENNIS	22 Forest Street	Malden	\N	\N	\N	0.00	3.00	0.00	2025-12-23	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.9+00	2026-03-07 10:27:52.9+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	60	f	\N	\N
308081ea-456c-47dd-8730-35b471602d05	fdecbe0e-16f5-4160-bae4-fcdf00640c7b	BUCKET	DENNIS	69 Forest Street	Mbts	\N	\N	\N	0.00	12.00	0.00	2025-09-26	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.902+00	2026-03-07 10:27:52.902+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	62	f	\N	\N
eac70148-18d7-45b0-8abb-c49f0d7abd68	4d37445e-bcae-4694-b15f-cf014738f3e9	BUCKET	DENNIS	1 Landing Drive	Methuen	\N	\N	\N	6000.00	12.00	0.00	2025-11-24	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.904+00	2026-03-07 10:27:52.904+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	64	f	\N	\N
369a9511-b234-4c89-a7ee-67c6d532d3dc	993a7b0b-0929-413c-856c-411c891872f5	BUCKET	DENNIS	349 Ocean Avenue	M'head	\N	\N	\N	0.00	\N	0.00	2025-02-20	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.907+00	2026-03-07 10:27:52.907+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	66	f	\N	\N
5b10d1f8-33f0-4d30-9443-eb15c57f7a7f	f8fa2db8-6d40-493e-9184-035dab7c7dca	BUCKET	DENNIS	Nantucket Drive	N. Andover	\N	\N	\N	6500.00	12.00	0.00	2025-07-21	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.909+00	2026-03-07 10:27:52.909+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	68	f	\N	\N
9ac5b97b-2164-405b-b17c-8d56cca7bb98	50205b6e-b085-4a6d-a407-aa85ba167d75	BUCKET	DENNIS	59 High Road	Newbury	\N	\N	\N	4000.00	8.00	0.00	2025-09-24	E 9/24	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.911+00	2026-03-07 10:27:52.911+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	70	f	\N	\N
e38ee991-b34e-468c-a898-45867a7403e6	a9d00ed6-eb4e-4e7e-b83f-909cb95bfeb0	BUCKET	DENNIS	127 Elm Street	Newbury	\N	\N	\N	1200.00	2.25	0.00	2025-09-15	E 9/15	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.913+00	2026-03-07 10:27:52.913+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	71	f	\N	\N
3a004a67-519d-4f0f-817f-cf6cd2beae59	80adb5fa-8c83-4b28-8e00-2cf1024fe8a6	BUCKET	DENNIS	5 Maple Terrace	Newbury	\N	\N	\N	600.00	1.00	0.00	2025-06-03	E 6/4	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.915+00	2026-03-07 10:27:52.915+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	72	f	\N	\N
08ef0839-4662-459a-921a-063ce4bea3a5	c21a7196-753e-4fd6-a9aa-32cdf0b8d7f4	BUCKET	DENNIS	37 Plummer Avenue	Nbpt	\N	\N	\N	1800.00	3.50	0.00	2025-06-02	E 6/2	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.918+00	2026-03-07 10:27:52.918+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	74	f	\N	\N
dae53d52-acb8-4ea0-a4a2-afb013bb5ca8	6d941f58-345c-42b8-addf-1d30dbcf7302	BUCKET	DENNIS	227 Merrimac Street	Nbpt	\N	\N	\N	600.00	1.00	0.00	2025-09-24	E 9/24	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.92+00	2026-03-07 10:27:52.92+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	75	f	\N	\N
c2e63c52-bb77-4965-87f2-d801b830ee00	e10d12cb-1a4f-4077-9c5d-97e016b4a560	BUCKET	DENNIS	36 Frances Drive	Nbpt	\N	\N	\N	700.00	1.00	0.00	2025-06-10	E 6/10	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.921+00	2026-03-07 10:27:52.921+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	76	f	\N	\N
55339e0b-7f74-4e9c-913a-885e66fb121d	38417bfb-0d60-4465-8566-2013ac9e02e8	BUCKET	DENNIS	311 Merrimac Street	Nbpt	\N	\N	\N	2800.00	4.00	0.00	2025-07-22	E 7/23	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.924+00	2026-03-07 10:27:52.924+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	77	f	\N	\N
788a9c47-19c9-42b2-80d1-b0a9c23490dc	41cbffc1-2115-4ddf-8fb4-90c869cb456c	BUCKET	DENNIS	Greenbriar Drive	N. Reading	\N	\N	\N	4500.00	8.00	0.00	2025-12-29	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.926+00	2026-03-07 10:27:52.926+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	79	f	\N	\N
a0bb5108-26d1-4cde-b0d6-384d2e17e476	41cbffc1-2115-4ddf-8fb4-90c869cb456c	BUCKET	DENNIS	1-7 Essex Green Drive	Peabody	\N	\N	\N	1800.00	3.00	0.00	2025-11-24	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.928+00	2026-03-07 10:27:52.928+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	81	f	\N	\N
249186aa-8e6f-4981-bbe4-ce6817391388	746eef4b-6eaa-4728-8226-f687025bc034	BUCKET	DENNIS	8 Marchant St.	Rockport	\N	\N	\N	5000.00	8.00	0.00	2024-06-12	E 6/13	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.933+00	2026-03-07 10:27:52.933+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	85	f	\N	\N
12e8428e-c1ef-4b51-ad5c-08c0723da8aa	6b817aa2-56f1-414f-8337-bda964cdf8a6	BUCKET	DENNIS	503 Wethersfield Street	Rowley	\N	\N	\N	0.00	5.00	0.00	2025-09-10	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.935+00	2026-03-07 10:27:52.935+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	87	f	\N	\N
7b53e6ea-388d-42d5-844f-df297cf68cc9	fd202acb-08e6-4762-a7ae-296ba7c22185	BUCKET	DENNIS	5 Jefferson Ave	Salem	\N	\N	\N	0.00	8.00	0.00	2025-11-04	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.937+00	2026-03-07 10:27:52.937+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	89	f	\N	\N
4b3f0434-8269-4d29-a7fa-dd07e97bffe0	0dbba991-83a9-427f-95ff-3e28700b05ac	BUCKET	DENNIS	84 Freedom Hollow	Salem	\N	\N	\N	0.00	32.00	0.00	2025-08-30	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.939+00	2026-03-07 10:27:52.939+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	90	f	\N	\N
fe84914a-42c6-4012-80b7-ac6da2239896	7f110a87-e26b-4613-8681-b562d83051d5	BUCKET	DENNIS	352 Lafayette Street	Salem	\N	\N	\N	600.00	1.00	0.00	2025-12-29	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.941+00	2026-03-07 10:27:52.941+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	91	f	\N	\N
3d2dcc65-9aa1-4efa-8a83-539730ae1e35	c68a5279-280e-4d14-bbf3-a596d14547ef	BUCKET	DENNIS	Emerald Way	Salisbury	\N	\N	\N	0.00	\N	0.00	2025-10-29	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.943+00	2026-03-07 10:27:52.943+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	93	f	\N	\N
7097c2b4-1ef3-40ac-be36-8efaf4f51f73	eb8a19cb-5161-4a3b-9801-d1732f29336b	BUCKET	DENNIS	123 Beach Rd	Salisbury	\N	\N	\N	600.00	1.00	0.00	2025-12-09	\N	\N	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.946+00	2026-03-07 10:27:52.946+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	94	f	\N	\N
4aa05d9b-a650-4938-bff1-8d2ba8091fe7	e71fcd29-4ae1-48ba-8fde-b0aa5d6257d0	BUCKET	DENNIS	167 Campground Rd.	South Hampton, Nh	\N	\N	\N	22500.00	40.00	0.00	2025-10-31	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.948+00	2026-03-07 10:27:52.948+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	96	f	\N	\N
6c510d37-56d2-471c-8107-d5a84fa0f825	ea638e17-7c99-47d7-9099-0d2985d44555	BUCKET	DENNIS	12 Thompson Lane	Topsfield	\N	\N	\N	700.00	1.25	0.00	2025-09-08	E 9/8	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.952+00	2026-03-07 10:27:52.952+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	100	f	\N	\N
1b8175ac-6638-4d27-ae5e-963afa6f5cad	580efffb-cd56-48f8-8f71-5507d6422e7f	BUCKET	DENNIS	25 Candlewood Drive	Topsfield	\N	\N	\N	1200.00	2.25	0.00	2025-11-19	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.956+00	2026-03-07 10:27:52.956+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	102	f	\N	\N
940bdf3d-c10d-482c-b04b-a1330ec4557a	9ce44dd5-9502-4cee-9981-b910d0e6df43	BUCKET	DENNIS	13 Puritan Road	Wenham	\N	\N	\N	600.00	1.00	0.00	2025-11-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.957+00	2026-03-07 10:27:52.957+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	104	f	\N	\N
d8ba4db5-14c4-4dc6-b90c-079a8810f31c	476093aa-e87b-483e-8480-2dfaccdfed48	BUCKET	DENNIS	11 Pine Hill Rd	Swampscott	\N	\N	\N	600.00	1.00	0.00	2025-12-10	\N	\N	\N	\N	\N	f	f	f		\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.95+00	2026-03-11 20:28:22.313+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	98	f	\N	\N
372e215c-3702-4b56-a0f4-1ade9a685f22	9f2963b4-f729-4a1f-9722-5083af1b0db4	BUCKET	DENNIS	185 Cherry Street	Wenham	\N	\N	\N	1500.00	3.00	0.00	2025-11-05	\N	\N	\N	\N	\N	t	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.96+00	2026-03-07 10:27:52.96+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	105	f	\N	\N
cc179767-7623-43ee-b1b4-059cbaa97907	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	DENNIS	80 Larch Row	Wenham	\N	\N	\N	0.00	4.00	0.00	2025-06-06	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.964+00	2026-03-07 10:27:52.964+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	107	f	\N	\N
f40f4b1a-adbe-4c98-a28c-441d5f1ca11f	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	DENNIS	80 Larch Row	Wenham	\N	\N	\N	0.00	16.00	0.00	\N	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.968+00	2026-03-07 10:27:52.968+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	109	f	\N	\N
fdc9c64a-b409-4f6d-b1b6-6bad85f060ca	6fcc8826-99e8-4083-970c-00b3b6c05adb	BUCKET	DENNIS	115 Larch Row	Wenham	\N	\N	\N	0.00	16.00	0.00	\N	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.97+00	2026-03-07 10:27:52.97+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	110	f	\N	\N
d13ec79c-16ac-47c3-9189-732951c3eced	a6d85630-7273-4c5c-9d4c-45e5b8dbb082	BUCKET	DENNIS	114 Topsfield Road	Wenham	\N	\N	\N	1200.00	2.25	0.00	2025-11-25	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.972+00	2026-03-07 10:27:52.972+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	111	f	\N	\N
cf4aad1a-34ee-4a0f-addf-f021be7bc2b4	5500803e-2999-41de-8138-4b8182bcca60	BUCKET	DENNIS	94 Main Street	Wenham	\N	\N	\N	11500.00	12.00	0.00	2025-11-04	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.974+00	2026-03-07 10:27:52.974+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	112	f	\N	\N
2aac27c5-bd20-4513-a7fa-570d226bc4e1	d91268e3-01d1-4e8f-86a8-baa79371804d	BUCKET	DENNIS	27 Central Street	Topsfield	2026-02-19	\N	\N	1800.00	3.50	0.00	2026-01-09	E 1/9	V, E  2/13	\N	\N	\N	t	t	t	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.099+00	2026-03-07 10:28:03.157+00	\N	\N	\N	\N	f	f	t	MDEA	2026 Bucket Completed	63	f	\N	41fdfd20-17d3-4b00-8ba0-ebdb85401bd9
3a91da24-7112-4a59-b6cf-5dffe57831ec	6c3ae586-e6ab-4210-a1b0-3ccfb6fd3ee9	BUCKET	DENNIS	Old Nugent Farm Rd	Gloucester	2025-01-07	\N	\N	10500.00	16.00	0.00	2025-11-10	\N	V, E 11/20*	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.452+00	2026-03-07 10:28:03.164+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	161	f	\N	5efbaa59-65c3-46ee-89fa-d77c229ac6e2
dd9a4a90-8fc2-4036-9eaf-ea181bdaf033	ffe44738-2dfd-4efe-b018-545f501609ad	BUCKET	DENNIS	1 Burnham Lane	Danvers	2025-02-02	\N	\N	9000.00	12.00	0.00	2026-01-03	\N	S, E           1/5	\N	\N	\N	f	t	f	NO	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.233+00	2026-03-07 10:28:03.177+00	\N	\N	\N	\N	f	f	t	78	2026 Bucket Completed	100	f	\N	7fa04c40-ef73-4aa3-b78b-4de9ce0463d1
9f559507-9687-49d7-b96a-5dae24110f57	43afc396-73bd-4101-b936-fddb227e88e7	CRANE	DENNIS	148 Country Club Way	Ipswich	\N	\N	\N	19850.00	12.00	0.00	2025-12-17	\N	\N	\N	\N	MODEL_1060	f	f	t	…BUCKET ALSO                         SNOW COVERED OR FROZEN GROUND	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.777+00	2026-03-07 10:28:03.186+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	17	f	BUCKET	845380fb-30e1-4322-ada4-2d3606e9f339
845380fb-30e1-4322-ada4-2d3606e9f339	43afc396-73bd-4101-b936-fddb227e88e7	BUCKET	DENNIS	148 Country Club Way	Ipswich	\N	\N	\N	12000.00	24.00	0.00	2025-12-17	\N	\N	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.888+00	2026-03-07 10:28:03.186+00	\N	\N	\N	\N	f	f	f	\N	DS Bucket TBS	52	f	\N	9f559507-9687-49d7-b96a-5dae24110f57
4aae2cc7-941c-46ae-9880-1d42e4a9d576	d0a0ccf4-8cf9-42e7-9035-746b805e7c2a	CRANE	DENNIS	73 Atlantic Avenue	S'scott	2026-01-07	\N	\N	7100.00	7.00	0.00	2025-12-08	\N	V, E      1/5*	\N	\N	MODEL_1060	f	f	f	P/U TO 1/6 FROM 1/22	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.526+00	2026-03-07 10:27:51.526+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	31	f	\N	\N
cb21e28f-2733-4bd8-917a-44de6d857ec0	9bc206d0-f1e9-40e6-8a3c-0c943dfcec4e	CRANE	DENNIS	27 Lakeman's Lane	Ipswich	2026-02-19	\N	\N	4500.00	4.00	0.00	2025-06-19	E 6/19	S, E 2/18                   S, E 12/30	\N	\N	MODEL_1060	f	t	f	PUSH UP TO 2/19 FROM 2/25                                          TBD IN WINTER                        …BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.569+00	2026-03-07 10:27:51.569+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	41	f	BUCKET	\N
41fdfd20-17d3-4b00-8ba0-ebdb85401bd9	d91268e3-01d1-4e8f-86a8-baa79371804d	CRANE	DENNIS	27 Central Street	Topsfield	2026-02-19	\N	\N	3500.00	3.50	0.00	2026-01-09	E 1/9	S, E 1/14*	\N	\N	MODEL_1060	f	f	f	P/U TO 2/19                                                                      W/DETAIL                                       TUES OR THURS ONLY                                        ….BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.573+00	2026-03-07 10:28:03.157+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	42	f	BUCKET	2aac27c5-bd20-4513-a7fa-570d226bc4e1
c5bfdf0c-d010-44f1-83bd-8179ce708dfa	1895aa69-dba4-4615-8cde-f7d2149934f2	CRANE	DENNIS	4 Landau Lane	Merrimac	2025-01-15	\N	\N	8000.00	8.00	0.00	2025-11-16	\N	S, E 11/25	\N	\N	MODEL_1060	f	f	f	PUSH UP IF AVAILABLE-DOES NOT LIKE DATE, SAID DS TOLD HIM BEFORE SNOW FALLS, CONSIDERING GOING ELSEWHERE BUT CONFIRMED FOR NOW	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.697+00	2026-03-07 10:27:51.697+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	69	f	\N	\N
e522a793-74ba-4b0b-baea-a13165e4d2be	892c20a3-628c-4c9a-9135-787ed960de77	CRANE	DENNIS	21 University Lane	Mbts	2026-01-13	\N	\N	2500.00	2.50	0.00	2025-12-31	\N	DS	\N	\N	MODEL_1060	f	f	f	P/U TO 1/13                               …BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.705+00	2026-03-07 10:28:03.169+00	\N	\N	\N	\N	f	t	t	YES	2026 Crane Completed	71	f	BUCKET	d6611819-ed0d-4674-b428-b467f1c5c82f
5efbaa59-65c3-46ee-89fa-d77c229ac6e2	6c3ae586-e6ab-4210-a1b0-3ccfb6fd3ee9	CRANE	DENNIS	Old Nugent Farm Rd	Gloucester	2026-02-04	\N	\N	2500.00	4.00	0.00	2025-11-10	\N	S, E 2/2                                         V, E 11/20*	\N	\N	MODEL_1060	f	f	f	P/U TO 2/4 FROM 2/6                                       …BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.631+00	2026-03-07 10:28:03.164+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	53	f	BUCKET	3a91da24-7112-4a59-b6cf-5dffe57831ec
7fa04c40-ef73-4aa3-b78b-4de9ce0463d1	ffe44738-2dfd-4efe-b018-545f501609ad	CRANE	DENNIS	1 Burnham Lane	Danvers	2026-01-08	\N	\N	1800.00	1.75	0.00	2026-01-03	\N	DS	\N	\N	MODEL_1060	f	f	f	P/U TO 1/8                                        …BUCKET ALSO	\N	\N	t	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:51.745+00	2026-03-07 10:28:03.177+00	\N	\N	\N	\N	f	t	f	\N	2026 Crane Completed	81	f	BUCKET	dd9a4a90-8fc2-4036-9eaf-ea181bdaf033
a6655554-553f-45a5-b3f8-4d22531da53f	ec13a62f-51ed-4116-b604-700cc74b4e31	CRANE	DENNIS	25 Basto Terr	Roslindale	\N	\N	\N	11000.00	4.00	0.00	2025-12-28	\N	\N	\N	\N	MODEL_1060	f	f	f	ER 4HRS                                       BAGSTER	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.79+00	2026-03-07 10:27:52.79+00	\N	\N	\N	\N	f	f	f	\N	DS Crane TBS	25	f	\N	\N
73678417-c2e5-4f26-b52c-42436ef11d87	ec65bd6d-4f02-4d37-8ab8-e7cae043be90	BUCKET	ERIC	42 Essex St.	Hamilton	2025-02-05	\N	\N	4500.00	8.00	0.00	2026-01-09	\N	ER	\N	\N	\N	f	f	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.53+00	2026-03-07 10:27:52.53+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	184	f	\N	\N
2c6735a3-2ecc-4306-a3cb-0d0406fbd975	863fd1a0-7da3-460b-9395-e19e34143e3d	BUCKET	ERIC	98 Essex St.	Lynnfield	2025-01-14	\N	\N	675.00	1.00	0.00	2025-12-16	\N	S             12/30	\N	\N	\N	f	t	f		\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.548+00	2026-03-07 10:27:52.548+00	\N	\N	\N	\N	f	f	t	73	2026 Bucket Completed	189	f	\N	\N
de594ad2-98d0-43ff-8860-4282b9afa951	caa5354d-031d-4857-8423-50964b65e3c3	BUCKET	ERIC	600 Asbury St.	Hamilton	2026-01-09	\N	\N	10400.00	16.00	0.00	2026-01-06	\N	ER	\N	\N	\N	f	f	f	YES	\N	\N	f	f	\N	\N	\N	f	t	\N	\N	\N	2026-03-07 10:27:52.554+00	2026-03-07 10:27:52.554+00	\N	\N	\N	\N	f	f	f	\N	2026 Bucket Completed	191	f	\N	\N
\.


--
-- TOC entry 3866 (class 0 OID 66386)
-- Dependencies: 244
-- Data for Name: org_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_settings (id, company_timezone, operating_start_time, operating_end_time, created_at, updated_at, operating_start_minute, operating_end_minute, deleted_at, sales_per_day) FROM stdin;
11111111-1111-4111-8111-111111111111	America/New_York	\N	\N	2026-03-06 17:59:50.301+00	2026-03-06 17:59:50.301+00	300	1140	\N	\N
\.


--
-- TOC entry 3846 (class 0 OID 66208)
-- Dependencies: 224
-- Data for Name: requirement_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requirement_types (id, code, label, active, created_at, updated_at, deleted_at) FROM stdin;
9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	NEIGHBOR_CONSENT	Neighbor Consent	t	2026-03-07 10:27:50.744+00	2026-03-07 10:27:53.116+00	\N
886b379e-79d5-4de1-a6c4-151bc5903aa2	NO_EMAIL	No Email	t	2026-03-07 10:27:50.745+00	2026-03-07 10:27:53.116+00	\N
1aa9c1a4-eb0c-4b60-a210-8fba90059b0a	CUSTOMER_HOME	Customer Must Be Home	t	2026-03-07 10:27:50.747+00	2026-03-07 10:27:53.117+00	\N
c949bbdb-fc47-446c-a1a5-b2fa6fc2d5e5	NO_PARKING	No Parking	t	2026-03-07 10:27:50.749+00	2026-03-07 10:27:53.118+00	\N
38884e08-ffd0-48bf-ac43-85ed33f91866	LOG_TRUCK	Log Truck Required	t	2026-03-07 10:27:50.75+00	2026-03-07 10:27:53.119+00	\N
b420cb97-1c21-4109-92b5-bff705da52cd	CONCOM	Conservation Commission	t	2026-03-07 10:27:50.752+00	2026-03-07 10:27:53.119+00	\N
8b10b3eb-d7f3-4588-b691-dec4e435904e	POLICE_DETAIL	Police Detail	t	2026-03-07 10:27:50.737+00	2026-03-08 07:30:27.119+00	\N
292bb4d9-c24a-499e-9228-d332acf7ce52	CRANE_AND_BOOM_PERMIT	Crane & Boom Permit	t	2026-03-07 10:27:50.741+00	2026-03-08 07:30:27.125+00	\N
4e02c3db-d47b-4297-a9e7-c7295ba4d322	TREE_PERMIT	Tree Permit	t	2026-03-07 10:27:50.743+00	2026-03-08 07:30:27.126+00	\N
\.


--
-- TOC entry 3847 (class 0 OID 66218)
-- Dependencies: 225
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requirements (id, job_id, requirement_type_id, status, notes, created_at, updated_at, deleted_at, source, raw_snippet) FROM stdin;
be3f62d1-ae95-4fad-8853-b1bedb2d2655	551df28b-d6cd-4014-b990-a6af6f2a9f6d	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:50.811+00	2026-03-07 10:27:50.811+00	\N	LEGACY_PARSE	DTL
3ad5bd7c-6021-4ae3-b1bf-1db8891c7df2	785d866b-e0c0-425b-9d32-f0061d41d3cb	c949bbdb-fc47-446c-a1a5-b2fa6fc2d5e5	REQUIRED	\N	2026-03-07 10:27:50.835+00	2026-03-07 10:27:50.835+00	\N	LEGACY_PARSE	NO PARKING
8074e23e-8e2c-45aa-b1b3-7334d5a9e156	785d866b-e0c0-425b-9d32-f0061d41d3cb	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:50.836+00	2026-03-07 10:27:50.836+00	\N	LEGACY_PARSE	PERMISSION FROM NEIGHBOR
2d240dc0-8848-401d-85ff-95459a1b6ca0	785d866b-e0c0-425b-9d32-f0061d41d3cb	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:50.837+00	2026-03-07 10:27:50.837+00	\N	LEGACY_PARSE	DTL
d8d92003-e3fb-4b0e-9833-1d2eb5a3d978	785d866b-e0c0-425b-9d32-f0061d41d3cb	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:50.838+00	2026-03-07 10:27:50.838+00	\N	LEGACY_PARSE	PERMIT
474634a8-6703-467f-b64a-8541919d8595	785d866b-e0c0-425b-9d32-f0061d41d3cb	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:50.839+00	2026-03-07 10:27:50.839+00	\N	LEGACY_PARSE	PERMIT
a972cef1-e0c7-4ab4-9861-58da30fb7f04	785d866b-e0c0-425b-9d32-f0061d41d3cb	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:50.841+00	2026-03-07 10:27:50.841+00	\N	LEGACY_PARSE	PERMIT
50c790af-afaf-48a2-9827-fb713c061b22	785d866b-e0c0-425b-9d32-f0061d41d3cb	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:50.842+00	2026-03-07 10:27:50.842+00	\N	LEGACY_PARSE	PERMIT
4144ca22-2d2c-42d6-abfd-e1da721537c1	2a5c821d-4046-4561-a813-28f14730fda1	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:50.866+00	2026-03-07 10:27:50.866+00	\N	LEGACY_PARSE	DTL
24c8336f-070d-4866-af02-22899c264d8e	ef46498f-dfa9-42e1-b669-7ad8204239ee	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:50.925+00	2026-03-07 10:27:50.925+00	\N	LEGACY_PARSE	DTL
444ff63f-63d5-4334-8beb-4f98b09c00af	bfe401f9-affe-4490-b03f-3abcc1ed916b	886b379e-79d5-4de1-a6c4-151bc5903aa2	REQUIRED	\N	2026-03-07 10:27:50.987+00	2026-03-07 10:27:50.987+00	\N	LEGACY_PARSE	NO EMAIL
b0927a7d-4c1c-45b7-846b-f8c16252b090	195b2172-ef38-4895-8f5a-244ca9b08e32	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.032+00	2026-03-07 10:27:51.032+00	\N	LEGACY_PARSE	DTL
3a5719bc-be92-45d7-bde3-777952fa55c0	195b2172-ef38-4895-8f5a-244ca9b08e32	4e02c3db-d47b-4297-a9e7-c7295ba4d322	REQUIRED	\N	2026-03-07 10:27:51.033+00	2026-03-07 10:27:51.033+00	\N	LEGACY_PARSE	TREE PERMIT
61d48f6c-a82c-4f7f-a8e8-a23753a612d3	195b2172-ef38-4895-8f5a-244ca9b08e32	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:51.033+00	2026-03-07 10:27:51.033+00	\N	LEGACY_PARSE	CBP
f7e7500d-d6c9-4865-bb68-e30b82db177a	195b2172-ef38-4895-8f5a-244ca9b08e32	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:51.034+00	2026-03-07 10:27:51.034+00	\N	LEGACY_PARSE	PERMIT
bb40f724-42ac-48b8-8a0a-261f71ab495a	02ab6366-5948-48d5-b59e-c4dd0f90e52a	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.05+00	2026-03-07 10:27:51.05+00	\N	LEGACY_PARSE	DETAIL
101396dd-b3a0-4424-b8f8-9d3c0175e5ea	902c0b99-3b4a-4eb3-93a9-227288bbf263	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.057+00	2026-03-07 10:27:51.057+00	\N	LEGACY_PARSE	DETAIL
4a68d452-9062-4aaf-852b-08d8fcea177f	3255e838-9203-4bb8-a315-424de0c9b175	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.403+00	2026-03-07 10:27:51.403+00	\N	LEGACY_PARSE	DTL
c94e3f72-9133-4625-9e37-d1d8a249feaa	9469eb93-360a-4c6d-8d90-cb76203cf83e	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.412+00	2026-03-07 10:27:51.412+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
03745bed-ab56-4f96-baef-3b782335c789	f9800a61-defe-422e-9758-7aa2e0373f9d	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.438+00	2026-03-07 10:27:51.438+00	\N	LEGACY_PARSE	DTL
4f2789b9-1188-4067-987b-a0638e0686ba	1d9566a0-796e-4a1e-8fa1-75adfea2f498	886b379e-79d5-4de1-a6c4-151bc5903aa2	REQUIRED	\N	2026-03-07 10:27:51.443+00	2026-03-07 10:27:51.443+00	\N	LEGACY_PARSE	NO EMAIL
e0092d86-12c3-4b3f-b85e-f53b6544f490	b76958d7-ed7e-4df9-8651-616b9f7cad03	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.462+00	2026-03-07 10:27:51.462+00	\N	LEGACY_PARSE	DTL
31e5d2cb-a2e4-4281-af4e-86ea48c525f3	f841dc58-493e-4200-b832-c594a364cea1	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:51.468+00	2026-03-07 10:27:51.468+00	\N	LEGACY_PARSE	CONCOM
2a590919-6c38-4151-9820-782ec416f662	5ca46c58-87a7-4c5c-b71c-381bc9c04415	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.479+00	2026-03-07 10:27:51.479+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
de2266be-4536-45df-856a-5b0b730dbb56	5ca46c58-87a7-4c5c-b71c-381bc9c04415	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.479+00	2026-03-07 10:27:51.479+00	\N	LEGACY_PARSE	DETAIL
b83fec2f-23f3-4044-b274-053d383df1cd	780ce44c-3f74-4ea0-8da9-2a12e5e6907c	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.483+00	2026-03-07 10:27:51.483+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
925449c3-6e80-4eb7-babb-8c647241b390	62252588-c51d-490c-83c7-5e731e8913e4	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.488+00	2026-03-07 10:27:51.488+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
11f6fecb-09bc-47c5-b124-8eb273982deb	62252588-c51d-490c-83c7-5e731e8913e4	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.488+00	2026-03-07 10:27:51.488+00	\N	LEGACY_PARSE	DTL
39c70350-1051-493e-8ef5-62da82c1d007	90f789ad-b2ef-4d28-adc2-75a989b8476c	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.504+00	2026-03-07 10:27:51.504+00	\N	LEGACY_PARSE	W/DETAIL
b42ee14d-4013-47b2-83d3-e036a4880f18	2dd509e6-82a4-4797-b846-f3c7e7be6b80	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.537+00	2026-03-07 10:27:51.537+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
301524c7-be06-4435-8b73-524a8c29d8ea	11fd9d6c-2834-4b0b-99fc-f6271afb172c	886b379e-79d5-4de1-a6c4-151bc5903aa2	REQUIRED	\N	2026-03-07 10:27:51.555+00	2026-03-07 10:27:51.555+00	\N	LEGACY_PARSE	NO EMAIL
c0218aab-d27c-40d5-81c0-1be73e56ec62	41fdfd20-17d3-4b00-8ba0-ebdb85401bd9	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.576+00	2026-03-07 10:27:51.576+00	\N	LEGACY_PARSE	W/DETAIL
d24416ef-3b51-4aa1-954e-4afc806fb1d6	276fe0cd-d3bb-498c-9788-32c85d109625	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.588+00	2026-03-07 10:27:51.588+00	\N	LEGACY_PARSE	DTL
05fce3ff-fafb-4957-89e0-12fc4448c65d	af8d8fb6-a060-4ed4-9cd7-e598015df806	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:51.597+00	2026-03-07 10:27:51.597+00	\N	LEGACY_PARSE	CONCOM
e96d5e10-cb1c-4356-a3a5-76abb46226bc	af8d8fb6-a060-4ed4-9cd7-e598015df806	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.598+00	2026-03-07 10:27:51.598+00	\N	LEGACY_PARSE	DTL
4c87af5d-ad13-4903-b979-eadfff844d57	4a3b6e89-4055-4d65-8f6f-ecaf98362afc	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.605+00	2026-03-07 10:27:51.605+00	\N	LEGACY_PARSE	W/DETAIL
9f0a2f75-a26c-407a-8867-047ea3fbd9c6	883c6416-17bf-4b7c-a872-2bbc3f91e176	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.621+00	2026-03-07 10:27:51.621+00	\N	LEGACY_PARSE	DETAIL
fd6aa35c-11df-4f60-9c9b-90f210587e6f	f4e1bbd4-ff44-454b-9e37-14384732d459	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.663+00	2026-03-07 10:27:51.663+00	\N	LEGACY_PARSE	W/DETAIL
9df4b156-4312-43dc-8fdf-5995a0b0b29c	f4806f85-96f1-4dd4-b153-583a9adb6ca5	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.687+00	2026-03-07 10:27:51.687+00	\N	LEGACY_PARSE	DTL
eb72b38b-f2af-4e07-9e54-e06bcc069bbf	5a639098-4dca-41f2-a56c-8028e89a610a	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.72+00	2026-03-07 10:27:51.72+00	\N	LEGACY_PARSE	DTL
a8b14c2b-ba42-4246-a787-eb28cb380b76	96028009-c8f8-4696-95e2-59c36c38bace	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.761+00	2026-03-07 10:27:51.761+00	\N	LEGACY_PARSE	DTL
fe6c6267-aa3b-4b72-9484-1cbd2f602991	1847f771-3626-41f8-8bab-962d32d3b066	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.773+00	2026-03-07 10:27:51.773+00	\N	LEGACY_PARSE	PERMISSION FROM NEIGHBOR
fda81a65-c8f5-43ac-8b5b-ec04c61aa44e	534287f9-e78f-480d-b7f5-907807217281	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.781+00	2026-03-07 10:27:51.781+00	\N	LEGACY_PARSE	W/DETAIL
d6712dff-d18a-4194-87c5-80631657464c	17b3344e-7f6d-4bf6-a8db-1df5eb46d5ed	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.786+00	2026-03-07 10:27:51.786+00	\N	LEGACY_PARSE	DTL
9596633e-025f-4918-9d35-ebf0cfd288df	f59f43ed-db55-48f9-bd9f-8ae6655d7de7	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.79+00	2026-03-07 10:27:51.79+00	\N	LEGACY_PARSE	DTL
1aa08fe1-a6e8-4a84-9431-da19245426d8	92042a6e-dd30-4371-958d-be886df7b4f3	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.795+00	2026-03-07 10:27:51.795+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
2bad6376-1b0c-40e3-bc62-92449d79348d	92042a6e-dd30-4371-958d-be886df7b4f3	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.795+00	2026-03-07 10:27:51.795+00	\N	LEGACY_PARSE	DETAIL
b5c9377e-67ec-44c5-8520-c6c852b045d7	f747cd3f-6d6e-46e3-8b8b-184fbe97c36f	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.8+00	2026-03-07 10:27:51.8+00	\N	LEGACY_PARSE	DTL
b24265dc-456d-4599-aae4-3e26fcff4401	f747cd3f-6d6e-46e3-8b8b-184fbe97c36f	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:51.801+00	2026-03-07 10:27:51.801+00	\N	LEGACY_PARSE	PERMIT
bbe19ad8-cbf3-43e6-b88d-fd0b3af131a5	a31e2463-8b39-4045-9373-3c7df1b788df	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.816+00	2026-03-07 10:27:51.816+00	\N	LEGACY_PARSE	DETAIL
51b0c5da-7391-436c-ac36-e2dd7698971a	2fed6735-81aa-4280-977f-9d3f3ff8862d	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.825+00	2026-03-07 10:27:51.825+00	\N	LEGACY_PARSE	DETAIL
46628291-6bad-49d7-8463-ed174451604d	2fed6735-81aa-4280-977f-9d3f3ff8862d	4e02c3db-d47b-4297-a9e7-c7295ba4d322	REQUIRED	\N	2026-03-07 10:27:51.826+00	2026-03-07 10:27:51.826+00	\N	LEGACY_PARSE	TREE PERMIT
d1782a1b-fc41-4f14-9374-6004bab22864	2fed6735-81aa-4280-977f-9d3f3ff8862d	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:51.826+00	2026-03-07 10:27:51.826+00	\N	LEGACY_PARSE	PERMIT
dc1150dd-0495-4736-8978-b0a6a319a42f	2c32036e-d340-4550-8da8-55c6a063ce19	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.831+00	2026-03-07 10:27:51.831+00	\N	LEGACY_PARSE	DTL
37a53bdf-852f-493e-a556-cfb455f7d420	07f11d8a-5703-4de7-85d8-d05addb6cb72	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.835+00	2026-03-07 10:27:51.835+00	\N	LEGACY_PARSE	DTL
ef74b610-a3e2-4d23-8fc2-e2b3e4795522	1c602d57-2fc2-4734-9acd-4e8c2b8c5abf	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.84+00	2026-03-07 10:27:51.84+00	\N	LEGACY_PARSE	W/DETAIL
f628f3dc-5180-491a-9d4f-197b9245a12a	71eba330-9ac6-4ac9-89da-4e318ea2d7c7	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.848+00	2026-03-07 10:27:51.848+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
5e9ba5e9-83ca-494b-aa2c-977ddd7d2ccd	a92d0f0b-c650-4b1b-861e-e0dbdea6f92d	38884e08-ffd0-48bf-ac43-85ed33f91866	REQUIRED	\N	2026-03-07 10:27:51.852+00	2026-03-07 10:27:51.852+00	\N	LEGACY_PARSE	LOG TRUCK
f9ba7bb4-da71-4c10-a897-7b79d715baba	a92d0f0b-c650-4b1b-861e-e0dbdea6f92d	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:51.853+00	2026-03-07 10:27:51.853+00	\N	LEGACY_PARSE	DETAIL
65fa4717-4a94-48cf-87c0-52446c67530c	badd399f-4830-451d-8bb4-597d9ef1b5f2	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.858+00	2026-03-07 10:27:51.858+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
d6b99f7b-c4a0-41d0-b251-35360e4cc9a7	67232b3f-8ed2-4fcc-9b70-e556483e8d99	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:51.863+00	2026-03-07 10:27:51.863+00	\N	LEGACY_PARSE	CONCOM
fe418824-def3-4efb-931e-f163576718f4	67232b3f-8ed2-4fcc-9b70-e556483e8d99	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:51.864+00	2026-03-07 10:27:51.864+00	\N	LEGACY_PARSE	NEIGHBOR CONSENT
1c68c74a-ef92-4f47-84ff-92b066cbf64c	9d000807-e95d-44c8-8270-8321b443e79d	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:52.763+00	2026-03-07 10:27:52.763+00	\N	LEGACY_PARSE	DETAIL
fffbee5a-a195-4ec8-a6bf-2e4aacef3503	15a68e02-d8a0-411b-9311-5acbbbb9070e	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:52.772+00	2026-03-07 10:27:52.772+00	\N	LEGACY_PARSE	DTL
2310b8cb-4aeb-4e45-a564-aba1d8b5b6c3	8417ede7-51ad-49f7-ab7f-15ee9e32de82	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:52.989+00	2026-03-07 10:27:52.989+00	\N	LEGACY_PARSE	W/ DETAIL
578a2364-a302-4b72-912a-9061e9e2caab	de5dd2ab-921c-41ff-9018-01529d6386c6	9f91d19d-6822-4a6e-867e-cfb3bbc21ad6	REQUIRED	\N	2026-03-07 10:27:52.993+00	2026-03-07 10:27:52.993+00	\N	LEGACY_PARSE	PERMISSION FROM NEIGHBOR
1b900b9b-9072-4e6a-926c-42e9da6670c0	3ef8ba36-ac7b-4a30-a9e5-d4476b22e4cf	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.003+00	2026-03-07 10:27:53.003+00	\N	LEGACY_PARSE	W/ DETAIL
b6c29e1c-278d-4f89-8f02-b61ab4168710	92ccdcb7-33bf-4261-92ed-8411d879969f	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.073+00	2026-03-07 10:27:53.073+00	\N	LEGACY_PARSE	DETAIL
deabe2d0-ba3b-4392-aafe-6737cacc4ef9	31df7135-c201-4466-b210-0e0c028630fa	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.082+00	2026-03-07 10:27:53.082+00	\N	LEGACY_PARSE	DETAIL
6b7e61bf-1d85-4956-8e8d-610dbd6a075b	6d06b5ac-7df0-4dba-9d60-cf47f08c8b33	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.089+00	2026-03-07 10:27:53.089+00	\N	LEGACY_PARSE	W/ DETAIL
df83168d-7d2c-4bda-9afd-87ba425c5395	e4556ee1-d44c-47e5-b8d5-20f49190ff05	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.094+00	2026-03-07 10:27:53.094+00	\N	LEGACY_PARSE	DETAIL
569ded80-5231-4a1b-bb81-4b26159a9052	e4556ee1-d44c-47e5-b8d5-20f49190ff05	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:53.094+00	2026-03-07 10:27:53.094+00	\N	LEGACY_PARSE	PERMIT
e4f28415-e3b3-4056-b714-847b7339d66d	e04224cc-1d98-4556-b834-5d3ec5963c99	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.103+00	2026-03-07 10:27:53.103+00	\N	LEGACY_PARSE	CONCOM
e1ce1bce-c8f7-40f3-966a-8374b2661784	d77dc222-2427-4988-af72-26a9a8756d6d	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.125+00	2026-03-07 10:27:53.125+00	\N	LEGACY_PARSE	CONCOM
49edea7f-4709-40fe-acb8-c6178d1eda5a	669a5238-3e27-4134-ac7b-4198215300c8	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.133+00	2026-03-07 10:27:53.133+00	\N	LEGACY_PARSE	W/ DETAIL
2bd589ac-1ccc-4ab6-bc04-7be16222af39	3d10fa1b-3256-4105-ac04-8953a6484de2	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.137+00	2026-03-07 10:27:53.137+00	\N	LEGACY_PARSE	CONCOM
967b620a-9dba-4d59-b1ec-4b3732c779f3	8aef876b-a6f9-453b-adbe-7e4079afb186	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.141+00	2026-03-07 10:27:53.141+00	\N	LEGACY_PARSE	DETAIL NOT SHOWING
52223a56-7455-4d2c-a50e-17ad26e90b23	8aef876b-a6f9-453b-adbe-7e4079afb186	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.142+00	2026-03-07 10:27:53.142+00	\N	LEGACY_PARSE	DETAIL
03a435f9-cba2-4031-b19b-fae384c455f3	92bc48ab-e599-4195-8b7d-239aed729c44	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.145+00	2026-03-07 10:27:53.145+00	\N	LEGACY_PARSE	CONCOM
06badea6-971a-431e-b961-135d2b5e1a12	92bc48ab-e599-4195-8b7d-239aed729c44	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.146+00	2026-03-07 10:27:53.146+00	\N	LEGACY_PARSE	CONCOM
c67a1167-0635-4b76-9c2b-dd2d1e44e93c	c2f54f5f-0628-4f82-a740-ae2cf62bdea9	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.158+00	2026-03-07 10:27:53.158+00	\N	LEGACY_PARSE	DETAIL
f61f33e9-672a-4061-aa90-a80970c8297c	7e28f8bb-5b7d-484e-b02c-da1b32b8be80	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.166+00	2026-03-07 10:27:53.166+00	\N	LEGACY_PARSE	DETAIL
bddcdba4-d982-4904-bf24-e0c4c7ae5ea6	5fc0dc5a-6544-40fe-ba3f-60d8fcb52969	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.17+00	2026-03-07 10:27:53.17+00	\N	LEGACY_PARSE	DETAIL
44b5689b-79ad-4cb6-a510-0342792cc3bb	6bc9332f-fb14-433f-8eff-e44a79c986b2	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.175+00	2026-03-07 10:27:53.175+00	\N	LEGACY_PARSE	CONCOM
054c0d38-701e-4cfd-a407-ff3c75e3c9d2	f526b896-54df-4c10-93d5-25cfc3ed4c8b	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.183+00	2026-03-07 10:27:53.183+00	\N	LEGACY_PARSE	DETAIL
c4650109-2891-4b95-b8fa-3bc3452e6bf4	466f3364-c3a2-48b3-96ee-02f57e9b5fe1	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.192+00	2026-03-07 10:27:53.192+00	\N	LEGACY_PARSE	CONCOM
41a6743e-b630-4e10-8aeb-f1371c8425dc	466f3364-c3a2-48b3-96ee-02f57e9b5fe1	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.193+00	2026-03-07 10:27:53.193+00	\N	LEGACY_PARSE	CONCOM
240fbcaa-d069-4cdb-920d-eb5feac5a9b6	466f3364-c3a2-48b3-96ee-02f57e9b5fe1	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.194+00	2026-03-07 10:27:53.194+00	\N	LEGACY_PARSE	DETAIL
70cf00d8-47c2-4ea0-bb09-a158e9402122	cea6a93e-00e9-4d1e-8cb2-96aa6c404aef	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.199+00	2026-03-07 10:27:53.199+00	\N	LEGACY_PARSE	W/ DETAIL
4072e3d8-fc13-468e-b981-a6c45286e0aa	b0fc5dda-6c69-46e2-912e-3700f37cfbda	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.211+00	2026-03-07 10:27:53.211+00	\N	LEGACY_PARSE	CONCOM
de2cbf7d-af23-48bd-8804-3d50cfbd294b	b0fc5dda-6c69-46e2-912e-3700f37cfbda	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.212+00	2026-03-07 10:27:53.212+00	\N	LEGACY_PARSE	CONCOM
59e7c5d0-c1be-44a3-9207-d4d83c01646c	afd38a83-74a0-481d-b435-528631d4f8c9	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.223+00	2026-03-07 10:27:53.223+00	\N	LEGACY_PARSE	DETAIL
19cefdcd-fdc7-4890-9e72-72544f152100	eeb42dff-e933-46de-ae9d-e13c1a9c15b6	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:53.246+00	2026-03-07 10:27:53.246+00	\N	LEGACY_PARSE	PERMIT
c686b1ec-8a4a-445b-8acb-1b0c512a2164	bbc6a8e4-57c5-4534-b400-fea490abc92f	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.265+00	2026-03-07 10:27:53.265+00	\N	LEGACY_PARSE	DETAIL
e3a7ac7e-9807-4472-840c-b1a3c19236ad	00c5e50a-3b76-4da6-9fdd-3482c7d8e168	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.268+00	2026-03-07 10:27:53.268+00	\N	LEGACY_PARSE	W/ DETAIL
63a57379-4171-4ec8-ba07-fda6e78b37f4	ae21c24c-acf8-42be-8f99-dee2516d2ee6	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.289+00	2026-03-07 10:27:53.289+00	\N	LEGACY_PARSE	DETAIL
e77c9269-5872-4624-bb21-f250eea35a9a	b25d3288-89a9-48f4-92b1-99b19cea0838	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.293+00	2026-03-07 10:27:53.293+00	\N	LEGACY_PARSE	CONCOM
aa700970-dc05-4e18-b950-a3a940111743	85b6b070-fab3-4ffc-b6b0-d8493974ac96	b420cb97-1c21-4109-92b5-bff705da52cd	REQUIRED	\N	2026-03-07 10:27:53.296+00	2026-03-07 10:27:53.296+00	\N	LEGACY_PARSE	CONCOM
b964b1d3-1df1-4275-8a71-e606c3d0f543	6677703d-0279-4e0d-9909-4bdf7c7ce14e	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.309+00	2026-03-07 10:27:53.309+00	\N	LEGACY_PARSE	DETAIL
0d980ab9-0164-4ee7-993a-9c9bb9216560	b8ed94c1-e731-4180-8fe3-6750dbebbe8f	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.355+00	2026-03-07 10:27:53.355+00	\N	LEGACY_PARSE	W/ DETAIL
0608d15c-3e44-4385-ac80-7345194bb1a2	d29cae55-c875-49d4-b2ed-8dd3fb55c240	8b10b3eb-d7f3-4588-b691-dec4e435904e	REQUIRED	\N	2026-03-07 10:27:53.359+00	2026-03-07 10:27:53.359+00	\N	LEGACY_PARSE	DETAIL
b5b3ad68-b2fe-48f7-9aba-6039490aa4a1	c7451bdc-1bb0-4c94-8092-91b04008a16f	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:53.363+00	2026-03-07 10:27:53.363+00	\N	LEGACY_PARSE	PERMIT
25b92409-d91d-4c3c-9e37-8ab98f7c3fb6	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	292bb4d9-c24a-499e-9228-d332acf7ce52	REQUIRED	\N	2026-03-07 10:27:53.368+00	2026-03-07 10:27:53.368+00	\N	LEGACY_PARSE	PERMIT
\.


--
-- TOC entry 3855 (class 0 OID 66294)
-- Dependencies: 233
-- Data for Name: resource_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_reservations (id, schedule_segment_id, resource_id, quantity, notes, deleted_at) FROM stdin;
\.


--
-- TOC entry 3854 (class 0 OID 66282)
-- Dependencies: 232
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, resource_type, name, inventory_quantity, is_foreman, active, created_at, updated_at, deleted_at) FROM stdin;
84745f0b-85ce-492d-9460-70551f132780	PERSON	Mike D.	1	t	t	2026-03-06 17:59:50.313+00	2026-03-06 17:59:50.313+00	\N
bb3e098c-d85e-43a7-9014-c1951c019dff	PERSON	Jason W.	1	t	t	2026-03-06 17:59:50.313+00	2026-03-06 17:59:50.313+00	\N
0ffc42d1-d244-48b9-b7c5-0941637329d5	PERSON	Steve M.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
c678c23f-4f46-46ab-a948-1287ad717b0c	PERSON	Luis R.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
4a5d6743-29bf-44c6-b5c0-4a3627959262	PERSON	Mark S.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
ccae4d6d-aced-4baf-a96a-cf6d3031ed73	PERSON	Kevin F.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
76217552-ef4d-4eae-9329-cc724a1ed0aa	PERSON	E2E Crew 1772819991966	1	f	t	2026-03-06 17:59:51.995+00	2026-03-06 17:59:51.995+00	\N
18bc7f63-8666-459e-b180-f977c68197f3	PERSON	E2E Foreman A 1772819991966	1	t	t	2026-03-06 17:59:51.991+00	2026-03-10 23:13:30.71+00	2026-03-10 23:13:30.704+00
e14b6897-1152-40d8-97b2-829c1dc6ea85	PERSON	E2E Foreman B 1772819991966	1	t	t	2026-03-06 17:59:51.993+00	2026-03-10 23:16:27.508+00	2026-03-10 23:16:27.505+00
6fca4882-85f1-4b89-8b24-f7b3757202b6	PERSON	Tom R.	1	t	t	2026-03-06 17:59:50.313+00	2026-03-06 17:59:50.313+00	\N
c38b3ec9-7414-44de-a5c9-234a00b08551	PERSON	Dave K.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
5d8b2708-12b3-4cc0-ab03-b7d4a034f295	PERSON	Brian T.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
5765dcf3-7be4-45c6-9ae1-84cd1e0a7bf1	PERSON	Paul N.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
a09741d8-37ba-4bb8-81c3-e3494753d572	PERSON	Eric H.	1	f	t	2026-03-06 17:59:50.324+00	2026-03-06 17:59:50.324+00	\N
1a004204-5c0b-4b0a-bcbc-452e450da45f	PERSON	Chris B.	1	t	t	2026-03-06 17:59:50.313+00	2026-03-10 23:22:25.043+00	2026-03-10 23:22:25.041+00
\.


--
-- TOC entry 3841 (class 0 OID 66158)
-- Dependencies: 219
-- Data for Name: risk_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.risk_reasons (id, code, label, active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3850 (class 0 OID 66246)
-- Dependencies: 228
-- Data for Name: schedule_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_events (id, job_id, event_type, source, from_at, to_at, actor_user_id, actor_code, raw_snippet, created_at, deleted_at) FROM stdin;
22424bdd-4205-4c39-be4c-594607f87c5b	551df28b-d6cd-4014-b990-a6af6f2a9f6d	TBS_FROM	LEGACY_PARSE	2025-02-03 00:00:00+00	\N	\N	\N	TBRS 2/3	2026-03-07 10:27:50.805+00	\N
f56421e5-7ee2-4805-a4ef-00d0d3871215	551df28b-d6cd-4014-b990-a6af6f2a9f6d	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-03-09 00:00:00+00	\N	\N	RS 3/9	2026-03-07 10:27:50.808+00	\N
a2a6e6cd-c6fd-45bc-a263-0d34f2f0984f	551df28b-d6cd-4014-b990-a6af6f2a9f6d	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-03 00:00:00+00	\N	\N	RS 2/3	2026-03-07 10:27:50.809+00	\N
68e59087-db2b-42e2-8333-3f67ec1871fc	785d866b-e0c0-425b-9d32-f0061d41d3cb	TBS_FROM	LEGACY_PARSE	2025-02-25 00:00:00+00	\N	\N	\N	TBRS FROM 2/25	2026-03-07 10:27:50.827+00	\N
2d7067ce-e885-42b0-b40d-bd4f8f316761	785d866b-e0c0-425b-9d32-f0061d41d3cb	TBS_FROM	LEGACY_PARSE	2025-02-03 00:00:00+00	\N	\N	\N	TBRS 2/3	2026-03-07 10:27:50.828+00	\N
dc24f4f2-859d-412b-8c5d-124c680e8d1a	785d866b-e0c0-425b-9d32-f0061d41d3cb	TBS_FROM	LEGACY_PARSE	2026-11-25 00:00:00+00	\N	\N	AL	TBRS FROM 11/25 PER AL	2026-03-07 10:27:50.83+00	\N
6ed41151-4450-4398-99dc-ef5df9134ef2	785d866b-e0c0-425b-9d32-f0061d41d3cb	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-03-25 00:00:00+00	\N	\N	RS 3/25	2026-03-07 10:27:50.832+00	\N
930f4337-f00e-46e5-9040-ccc7dc8e8c9d	785d866b-e0c0-425b-9d32-f0061d41d3cb	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-25 00:00:00+00	\N	\N	RS 2/25	2026-03-07 10:27:50.833+00	\N
549854d0-2427-476b-a452-6f7f9b5c5a24	785d866b-e0c0-425b-9d32-f0061d41d3cb	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-03 00:00:00+00	\N	\N	RS 2/3	2026-03-07 10:27:50.834+00	\N
2fdbb4d3-005c-4063-a5f3-66bcc499ca0b	2a5c821d-4046-4561-a813-28f14730fda1	TBS_FROM	LEGACY_PARSE	2025-01-28 00:00:00+00	\N	\N	\N	TBRS 1/28	2026-03-07 10:27:50.862+00	\N
a263ff42-dbc8-4ebb-b6fb-a00f1515d85e	2a5c821d-4046-4561-a813-28f14730fda1	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-04-06 00:00:00+00	\N	\N	RS 4/6	2026-03-07 10:27:50.864+00	\N
38e74d10-6cbe-43e1-91d9-7097e906e7c8	2a5c821d-4046-4561-a813-28f14730fda1	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-01-28 00:00:00+00	\N	\N	RS 1/28	2026-03-07 10:27:50.865+00	\N
8598487e-3cba-4dfb-80aa-9e761b54a8bd	18cc9f8a-844f-4eb3-a322-5e747f7859e5	TBS_FROM	LEGACY_PARSE	2025-01-20 00:00:00+00	\N	\N	\N	TBRS FROM 1/20	2026-03-07 10:27:50.909+00	\N
7f7a7c95-0813-4547-8958-f42f065d0ce2	b39f59fc-645a-4e2d-a352-57a901f71009	TBS_FROM	LEGACY_PARSE	2025-01-26 00:00:00+00	\N	\N	\N	TBRS FROM 1/26	2026-03-07 10:27:50.931+00	\N
abe800a8-629f-473a-a1f1-e84fb01a0416	f8168e0a-ed61-43e4-bffa-5329be56a478	TBS_FROM	LEGACY_PARSE	2025-01-26 00:00:00+00	\N	\N	\N	TBRS FROM 1/26	2026-03-07 10:27:50.944+00	\N
0d2be32c-756f-473f-93e9-060539474a53	873ac612-2547-432b-9f84-c44daee1de0d	TBS_FROM	LEGACY_PARSE	2025-01-31 00:00:00+00	\N	\N	\N	TBRS FROM 1/31	2026-03-07 10:27:50.964+00	\N
3c23f9cd-f20b-4a84-8e40-9ae99b1981c9	873ac612-2547-432b-9f84-c44daee1de0d	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-03-28 00:00:00+00	\N	\N	RS 3/28	2026-03-07 10:27:50.965+00	\N
7b15f44e-d506-4a56-b4f6-338b7e51f33b	a5e61c7b-137d-490e-a925-01510083256a	TBS_FROM	LEGACY_PARSE	2025-02-24 00:00:00+00	\N	\N	\N	TBRS FROM 2/24	2026-03-07 10:27:51.041+00	\N
b49fa1cc-38ad-4eed-b5df-f5c68ea61af9	a5e61c7b-137d-490e-a925-01510083256a	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-03-04 00:00:00+00	\N	\N	RS 3/4	2026-03-07 10:27:51.042+00	\N
a63a27df-0f29-4c54-9f06-9728cf7d8880	02ab6366-5948-48d5-b59e-c4dd0f90e52a	TBS_FROM	LEGACY_PARSE	2025-01-27 00:00:00+00	\N	\N	\N	TBRS FROM 1/27	2026-03-07 10:27:51.048+00	\N
6ac839dd-ab6f-40cd-b53b-6a348946a084	02ab6366-5948-48d5-b59e-c4dd0f90e52a	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-03-24 00:00:00+00	\N	\N	RS 3/24	2026-03-07 10:27:51.049+00	\N
8da38129-94aa-4f2d-a1f5-6b107c8dd1bf	902c0b99-3b4a-4eb3-93a9-227288bbf263	TBS_FROM	LEGACY_PARSE	2025-02-24 00:00:00+00	\N	\N	\N	TBRS FROM 2/24	2026-03-07 10:27:51.055+00	\N
065f0195-2eab-4635-9e74-5b0ce719e3ce	902c0b99-3b4a-4eb3-93a9-227288bbf263	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-03-03 00:00:00+00	\N	\N	RS 3/3	2026-03-07 10:27:51.056+00	\N
02282b7c-2eb8-4720-8ff6-c2923b40d912	2630f684-0b1b-4c9c-8ebd-76706fe13eab	DATE_SWAP	LEGACY_PARSE	2025-03-03 00:00:00+00	2025-02-12 00:00:00+00	\N	\N	RS TO 2/12 FROM 3/3	2026-03-07 10:27:51.062+00	\N
0f0bce8e-ffc5-4812-af16-d6ecad810fbb	2630f684-0b1b-4c9c-8ebd-76706fe13eab	TBS_FROM	LEGACY_PARSE	2025-02-24 00:00:00+00	\N	\N	\N	TBRS FROM 2/24	2026-03-07 10:27:51.063+00	\N
e3e7407a-b30e-49b2-ab48-81f22349d3e1	2630f684-0b1b-4c9c-8ebd-76706fe13eab	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-03-03 00:00:00+00	\N	\N	RS 3/3	2026-03-07 10:27:51.064+00	\N
bc213b16-c9a8-4a63-8746-5f52d62f40ca	2630f684-0b1b-4c9c-8ebd-76706fe13eab	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-12 00:00:00+00	\N	\N	RS TO 2/12	2026-03-07 10:27:51.065+00	\N
35918146-f7ca-41d9-bbfe-0e4fcfbbcf72	f9800a61-defe-422e-9758-7aa2e0373f9d	DATE_SWAP	LEGACY_PARSE	\N	2025-02-05 00:00:00+00	\N	\N	PU TO 2/5	2026-03-07 10:27:51.437+00	\N
67a9bac8-5b13-4030-917e-4e62b02f4099	1d9566a0-796e-4a1e-8fa1-75adfea2f498	DATE_SWAP	LEGACY_PARSE	\N	2025-02-03 00:00:00+00	\N	\N	PU TO 2/3	2026-03-07 10:27:51.443+00	\N
f606353f-dffe-4519-823f-13b248fdf868	b76958d7-ed7e-4df9-8651-616b9f7cad03	TBS_FROM	LEGACY_PARSE	2025-01-19 00:00:00+00	\N	\N	\N	TBRS 1/19	2026-03-07 10:27:51.46+00	\N
de30e22d-155d-4fcd-a3db-dd388548690f	b76958d7-ed7e-4df9-8651-616b9f7cad03	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-02 00:00:00+00	\N	\N	RS 2/2	2026-03-07 10:27:51.46+00	\N
506b7a09-cfdc-4f05-a944-cc0af8f62802	b76958d7-ed7e-4df9-8651-616b9f7cad03	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-01-19 00:00:00+00	\N	\N	RS 1/19	2026-03-07 10:27:51.461+00	\N
bc9c092a-08c3-41e5-bd10-ca6fe3dbc596	f841dc58-493e-4200-b832-c594a364cea1	TBS_FROM	LEGACY_PARSE	2025-01-19 00:00:00+00	\N	\N	\N	TBRS FROM 1/19	2026-03-07 10:27:51.467+00	\N
f4b3a498-df89-4fed-ad2e-3a448daae335	f841dc58-493e-4200-b832-c594a364cea1	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-02 00:00:00+00	\N	\N	RS TO 2/2	2026-03-07 10:27:51.467+00	\N
b5f52036-ae11-4da2-adc0-3ef39fb7121b	6b6648fa-119c-49e9-828a-f26e86106b8b	TBS_FROM	LEGACY_PARSE	2025-01-19 00:00:00+00	\N	\N	\N	TBRS 1/19	2026-03-07 10:27:51.472+00	\N
47342208-1450-4d9f-9d32-621527fc31a5	6b6648fa-119c-49e9-828a-f26e86106b8b	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-02 00:00:00+00	\N	\N	RS TO 2/2	2026-03-07 10:27:51.473+00	\N
09026e4c-4fcc-4777-8303-5720732347d9	6b6648fa-119c-49e9-828a-f26e86106b8b	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-01-19 00:00:00+00	\N	\N	RS 1/19	2026-03-07 10:27:51.474+00	\N
6cb460e3-4fdf-453c-ab07-335f0e2bb748	4aae2cc7-941c-46ae-9880-1d42e4a9d576	DATE_SWAP	LEGACY_PARSE	\N	2025-01-06 00:00:00+00	\N	\N	P/U TO 1/6	2026-03-07 10:27:51.528+00	\N
5ab01bfd-c9a8-4ac9-a00a-9c4494574655	11fd9d6c-2834-4b0b-99fc-f6271afb172c	TBS_FROM	LEGACY_PARSE	2025-02-23 00:00:00+00	\N	\N	\N	TBRS FROM 2/23	2026-03-07 10:27:51.554+00	\N
e0d1af38-891b-4ce1-8ac6-efb3ed3f8ba1	11fd9d6c-2834-4b0b-99fc-f6271afb172c	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-25 00:00:00+00	\N	\N	RS 2/25	2026-03-07 10:27:51.554+00	\N
f0984671-5e90-4727-8ecd-80b40cab51ca	41fdfd20-17d3-4b00-8ba0-ebdb85401bd9	DATE_SWAP	LEGACY_PARSE	\N	2025-02-19 00:00:00+00	\N	\N	P/U TO 2/19	2026-03-07 10:27:51.575+00	\N
ec782b8b-00d2-41e3-87db-0ea3d8fb87cb	75eb2662-c671-4db9-8c2c-7ebad042a7d7	TBS_FROM	LEGACY_PARSE	2025-02-11 00:00:00+00	\N	\N	\N	TBRS FROM 2/11	2026-03-07 10:27:51.581+00	\N
7d55dc3e-f83b-4acf-b02c-3848beb94cf3	75eb2662-c671-4db9-8c2c-7ebad042a7d7	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-18 00:00:00+00	\N	\N	RS 2/18	2026-03-07 10:27:51.581+00	\N
a1b49122-af60-4387-a9fc-a0773f78050c	276fe0cd-d3bb-498c-9788-32c85d109625	TBS_FROM	LEGACY_PARSE	2025-02-11 00:00:00+00	\N	\N	\N	TBRS FROM 2/11	2026-03-07 10:27:51.586+00	\N
00353ec9-1777-4ffe-9fca-267f4fcee974	276fe0cd-d3bb-498c-9788-32c85d109625	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-18 00:00:00+00	\N	\N	RS 2/18	2026-03-07 10:27:51.587+00	\N
a4c1b65e-03d1-44a6-b924-fb9fe4c6f5c4	4a3b6e89-4055-4d65-8f6f-ecaf98362afc	TBS_FROM	LEGACY_PARSE	2025-02-09 00:00:00+00	\N	\N	\N	TBRS FROM 2/9	2026-03-07 10:27:51.603+00	\N
601416bd-3a4e-4363-b181-1bb972222d3d	4a3b6e89-4055-4d65-8f6f-ecaf98362afc	TBS_FROM	LEGACY_PARSE	2025-02-13 00:00:00+00	\N	\N	\N	TBRS FROM 2/13	2026-03-07 10:27:51.603+00	\N
4371eb65-d589-4626-8703-6ad6aca8a585	4a3b6e89-4055-4d65-8f6f-ecaf98362afc	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-09 00:00:00+00	\N	\N	RS TO 2/9	2026-03-07 10:27:51.604+00	\N
bc0dd47b-ad24-4dd6-94f8-b16837c49061	c2283226-987b-4e38-991c-ae9ee6111d93	TBS_FROM	LEGACY_PARSE	2026-12-27 00:00:00+00	\N	\N	\N	TBRS FROM 12/27	2026-03-07 10:27:51.609+00	\N
300aaabd-287b-44f7-a701-442e03453239	c2283226-987b-4e38-991c-ae9ee6111d93	TBS_FROM	LEGACY_PARSE	2026-10-18 00:00:00+00	\N	\N	\N	TBRS FROM 10/18	2026-03-07 10:27:51.61+00	\N
74803fe6-dfbd-4b4b-b255-f7a1e972dd6a	883c6416-17bf-4b7c-a872-2bbc3f91e176	TBS_FROM	LEGACY_PARSE	2025-02-16 00:00:00+00	\N	\N	\N	TBRS 2/16	2026-03-07 10:27:51.618+00	\N
7fa2042f-7ff0-48e2-9264-f6df0d77d6e9	883c6416-17bf-4b7c-a872-2bbc3f91e176	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-09 00:00:00+00	\N	\N	RS 2/9	2026-03-07 10:27:51.619+00	\N
2d677f1a-689c-485d-a0c9-a9523d547c47	883c6416-17bf-4b7c-a872-2bbc3f91e176	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-16 00:00:00+00	\N	\N	RS 2/16	2026-03-07 10:27:51.62+00	\N
b0a9871a-ca14-474f-8c2f-ad4caf4452c6	bcc8063c-5d27-40da-a081-2700ededd36f	DATE_SWAP	LEGACY_PARSE	\N	2025-02-05 00:00:00+00	\N	\N	PU TO 2/5	2026-03-07 10:27:51.625+00	\N
e768cab0-67ce-42c5-b649-ced7cc5806f3	5efbaa59-65c3-46ee-89fa-d77c229ac6e2	DATE_SWAP	LEGACY_PARSE	\N	2025-02-04 00:00:00+00	\N	\N	P/U TO 2/4	2026-03-07 10:27:51.633+00	\N
4514df24-5c25-49eb-9fe5-512c2809339b	0ee31f29-c822-4a8a-985c-f2966083e64d	TBS_FROM	LEGACY_PARSE	2025-01-26 00:00:00+00	\N	\N	\N	TBRS FROM 1/26	2026-03-07 10:27:51.638+00	\N
3eaba121-de3b-4216-b10b-95fd678a436b	0ee31f29-c822-4a8a-985c-f2966083e64d	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-04 00:00:00+00	\N	\N	RS 2/4	2026-03-07 10:27:51.639+00	\N
7fda6188-d142-4118-b5ff-c55f4f5a9912	e522a793-74ba-4b0b-baea-a13165e4d2be	DATE_SWAP	LEGACY_PARSE	\N	2025-01-13 00:00:00+00	\N	\N	P/U TO 1/13	2026-03-07 10:27:51.707+00	\N
2d1139bf-09ec-4d6b-a2fd-8df920f3b94a	aa6bc917-9ac3-4754-ba37-253bf8bf15ad	TBS_FROM	LEGACY_PARSE	2026-12-24 00:00:00+00	\N	\N	\N	TBRS FROM 12/24	2026-03-07 10:27:51.712+00	\N
2563a2a4-4d0a-4223-8b18-b4661ba2982d	7fa04c40-ef73-4aa3-b78b-4de9ce0463d1	DATE_SWAP	LEGACY_PARSE	\N	2025-01-08 00:00:00+00	\N	\N	P/U TO 1/8	2026-03-07 10:27:51.748+00	\N
221de459-2e86-4bec-9647-898a9e1523ac	96028009-c8f8-4696-95e2-59c36c38bace	TBS_FROM	LEGACY_PARSE	2026-11-05 00:00:00+00	\N	\N	\N	TBRS FROM 11/5	2026-03-07 10:27:51.76+00	\N
3938dcb8-f897-449e-a837-961116c78eb2	534287f9-e78f-480d-b7f5-907807217281	TBS_FROM	LEGACY_PARSE	2026-12-30 00:00:00+00	\N	\N	\N	TBRS FROM 12/30	2026-03-07 10:27:51.778+00	\N
295e6e21-5e28-4643-b9a2-25d025f125b0	534287f9-e78f-480d-b7f5-907807217281	TBS_FROM	LEGACY_PARSE	2026-12-23 00:00:00+00	\N	\N	\N	TBRS FROM 12/23	2026-03-07 10:27:51.779+00	\N
cccdb004-d974-4800-a555-e39e7881668a	534287f9-e78f-480d-b7f5-907807217281	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-01-07 00:00:00+00	\N	\N	RS TO 1/7	2026-03-07 10:27:51.78+00	\N
7730a8d1-5e3a-4ad4-acb3-0950fc40ce8b	534287f9-e78f-480d-b7f5-907807217281	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-12-30 00:00:00+00	\N	\N	RS TO 12/30	2026-03-07 10:27:51.781+00	\N
a11fe723-2aa6-4c47-bf21-90d4629197e3	f747cd3f-6d6e-46e3-8b8b-184fbe97c36f	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-17 00:00:00+00	\N	\N	RS 2/17	2026-03-07 10:27:51.8+00	\N
b9fb465b-45d3-4caa-be81-7b0ffc697d60	badd399f-4830-451d-8bb4-597d9ef1b5f2	TBS_FROM	LEGACY_PARSE	2026-11-04 00:00:00+00	\N	\N	\N	TBRS FROM 11/4	2026-03-07 10:27:51.857+00	\N
31683e54-2048-416a-9f31-358cf0087269	0333d32a-a443-4d44-90c5-f9ab0b97d8d8	TBS_FROM	LEGACY_PARSE	2026-12-24 00:00:00+00	\N	\N	\N	TBRS FROM 12/24	2026-03-07 10:27:52.756+00	\N
2729975c-3f61-4ec5-a8f5-0cdd5c16b6d2	da2ce28f-6be2-478c-b1d3-7d0e8fe6cb5e	TBS_FROM	LEGACY_PARSE	2025-02-16 00:00:00+00	\N	\N	\N	TBRS 2/16	2026-03-07 10:27:52.767+00	\N
65a83310-c8ec-4c92-a93b-23bed0a3ce6e	da2ce28f-6be2-478c-b1d3-7d0e8fe6cb5e	TBS_FROM	LEGACY_PARSE	2026-12-29 00:00:00+00	\N	\N	\N	TBRS 12/29	2026-03-07 10:27:52.767+00	\N
8c87bbf1-ce47-4d12-ac87-ca278d653f1a	da2ce28f-6be2-478c-b1d3-7d0e8fe6cb5e	RESCHEDULE_TO	LEGACY_PARSE	\N	2025-02-16 00:00:00+00	\N	\N	RS 2/16	2026-03-07 10:27:52.768+00	\N
d2e2c795-4601-4985-b9da-72d0cb32fac9	da2ce28f-6be2-478c-b1d3-7d0e8fe6cb5e	RESCHEDULE_TO	LEGACY_PARSE	\N	2026-12-29 00:00:00+00	\N	\N	RS 12/29	2026-03-07 10:27:52.769+00	\N
53f1c861-2101-40df-89b8-0d6530afe5f5	fc862d1f-e46b-423d-8c8e-6679244520cc	TBS_FROM	LEGACY_PARSE	2026-12-27 00:00:00+00	\N	\N	\N	TBRS FROM 12/27	2026-03-07 10:27:52.782+00	\N
89e5849a-b53d-4f47-9b89-85c474fe5326	fc862d1f-e46b-423d-8c8e-6679244520cc	TBS_FROM	LEGACY_PARSE	2026-10-18 00:00:00+00	\N	\N	\N	TBRS FROM 10/18	2026-03-07 10:27:52.783+00	\N
f1456da6-b1f8-4d6a-b7f7-a0394884ee77	1b6147bd-20de-457b-a2f9-bfda6ef01da9	TBS_FROM	LEGACY_PARSE	2026-11-19 00:00:00+00	\N	\N	\N	TBRS FROM 11/19	2026-03-07 10:27:52.786+00	\N
87a5465e-8774-4249-9e99-86500b02d3ba	5db8cce2-2f79-44f3-9d86-07529d458cd0	TBS_FROM	LEGACY_PARSE	2026-12-18 00:00:00+00	\N	\N	\N	TBRS FROM 12/18	2026-03-07 10:27:52.794+00	\N
286cf75c-0cfb-4512-95f3-f409975f2bc4	3df88d10-b1cc-494a-a28d-f72250fb308e	TBS_FROM	LEGACY_PARSE	2026-09-08 00:00:00+00	\N	\N	\N	TBRS FROM 9/8	2026-03-07 10:27:53.129+00	\N
28c4411c-a6f5-4e7e-95bb-16b6a13f9cf2	669a5238-3e27-4134-ac7b-4198215300c8	TBS_FROM	LEGACY_PARSE	2026-05-06 00:00:00+00	\N	\N	\N	TBRS FROM 5/6	2026-03-07 10:27:53.133+00	\N
971df99f-6692-4e35-b851-fa4d109311d3	8aef876b-a6f9-453b-adbe-7e4079afb186	TBS_FROM	LEGACY_PARSE	2026-11-28 00:00:00+00	\N	\N	\N	TBRS FROM 11/28	2026-03-07 10:27:53.14+00	\N
e76fb429-948d-4e4c-8584-d211de021ce3	92bc48ab-e599-4195-8b7d-239aed729c44	TBS_FROM	LEGACY_PARSE	2025-01-27 00:00:00+00	\N	\N	\N	TBRS FROM 1/27	2026-03-07 10:27:53.145+00	\N
3265606e-ed63-4134-ab32-e89185de9ebe	94c06dfc-086e-410e-81d0-ea4c91903635	TBS_FROM	LEGACY_PARSE	2026-12-21 00:00:00+00	\N	\N	\N	TBRS FROM 12/21	2026-03-07 10:27:53.15+00	\N
2e17d5b3-7a8f-4bb5-a0d3-0cfbe419cdf0	94c06dfc-086e-410e-81d0-ea4c91903635	TBS_FROM	LEGACY_PARSE	2026-11-22 00:00:00+00	\N	\N	\N	TBRS FROM 11/22	2026-03-07 10:27:53.15+00	\N
0c07906c-54ed-414c-af6a-e4407e55a771	ca5ba5a1-230a-48d9-837a-20b3abc08496	TBS_FROM	LEGACY_PARSE	2026-12-21 00:00:00+00	\N	\N	\N	TBRS FROM 12/21	2026-03-07 10:27:53.154+00	\N
eb68459a-7687-40ab-8d2a-6b067effcbaf	c2f54f5f-0628-4f82-a740-ae2cf62bdea9	TBS_FROM	LEGACY_PARSE	2026-06-23 00:00:00+00	\N	\N	\N	TBRS FROM 6/23	2026-03-07 10:27:53.157+00	\N
241bea02-8a23-465d-bf67-9f5cf3d0faf6	76ffa7fe-9ce7-4510-8235-f68b2169b04b	TBS_FROM	LEGACY_PARSE	2025-01-16 00:00:00+00	\N	\N	\N	TBRS FROM 1/16	2026-03-07 10:27:53.161+00	\N
3b460a1f-107c-4437-a072-9d2ec9602bb0	76ffa7fe-9ce7-4510-8235-f68b2169b04b	TBS_FROM	LEGACY_PARSE	2026-12-16 00:00:00+00	\N	\N	\N	TBRS FROM 12/16	2026-03-07 10:27:53.162+00	\N
0c6d0be2-7fb0-4938-8bf9-baab2335312e	7e28f8bb-5b7d-484e-b02c-da1b32b8be80	TBS_FROM	LEGACY_PARSE	2026-12-16 00:00:00+00	\N	\N	\N	TBRS FROM 12/16	2026-03-07 10:27:53.166+00	\N
b76a339f-e9a4-4cc2-9435-b78207bbadd1	466f3364-c3a2-48b3-96ee-02f57e9b5fe1	TBS_FROM	LEGACY_PARSE	2025-01-30 00:00:00+00	\N	\N	\N	TBRS FROM 1/30	2026-03-07 10:27:53.192+00	\N
0d748dae-b04a-496b-8a34-cf2b5a238c7e	b0fc5dda-6c69-46e2-912e-3700f37cfbda	TBS_FROM	LEGACY_PARSE	2026-09-30 00:00:00+00	\N	\N	\N	TBRS FROM 9/30	2026-03-07 10:27:53.211+00	\N
abab075d-5401-40c0-b040-d070ea360844	afd38a83-74a0-481d-b435-528631d4f8c9	TBS_FROM	LEGACY_PARSE	2025-01-23 00:00:00+00	\N	\N	\N	TBRS FROM 1/23	2026-03-07 10:27:53.223+00	\N
fde282b0-3b46-4ab2-a6e3-e3340faea84f	48e6c177-c514-4d16-883c-2c35020d5193	TBS_FROM	LEGACY_PARSE	2025-01-06 00:00:00+00	\N	\N	\N	TBRS FROM 1/6	2026-03-07 10:27:53.231+00	\N
63029ae2-18ff-4c16-8d9e-a7497b1eba90	eeb42dff-e933-46de-ae9d-e13c1a9c15b6	TBS_FROM	LEGACY_PARSE	2025-01-31 00:00:00+00	\N	\N	\N	TBRS FROM 1/31	2026-03-07 10:27:53.245+00	\N
d99efab5-16e2-45a8-b684-fcb1c24bf4a3	150f77db-fc46-4d21-8a94-3218a46e7d13	TBS_FROM	LEGACY_PARSE	2026-04-11 00:00:00+00	\N	\N	\N	TBRS FROM 4/11	2026-03-07 10:27:53.299+00	\N
588ce465-0995-4a3a-bbb1-9e6defd3a0a0	4142cedb-6a9a-42d9-b93b-50e305307342	TBS_FROM	LEGACY_PARSE	2025-01-09 00:00:00+00	\N	\N	\N	TBRS FROM 1/9	2026-03-07 10:27:53.339+00	\N
709a55e1-1c65-4d77-8ee1-2431fec457e1	4142cedb-6a9a-42d9-b93b-50e305307342	TBS_FROM	LEGACY_PARSE	2025-01-03 00:00:00+00	\N	\N	\N	TBRS FROM 1/3	2026-03-07 10:27:53.34+00	\N
c6bdb882-726e-462a-b83b-6c655637b80f	70df7148-3022-437f-bc0e-9a1e2460f3e2	TBS_FROM	LEGACY_PARSE	2025-01-23 00:00:00+00	\N	\N	\N	TBRS FROM 1/23	2026-03-07 10:27:53.344+00	\N
a274765b-e12d-4634-91f8-0de73600c132	c7451bdc-1bb0-4c94-8092-91b04008a16f	TBS_FROM	LEGACY_PARSE	2025-01-18 00:00:00+00	\N	\N	\N	TBRS FROM 1/18	2026-03-07 10:27:53.363+00	\N
94de57a9-db64-45ef-9927-543fc9485252	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	TBS_FROM	LEGACY_PARSE	2025-01-18 00:00:00+00	\N	\N	\N	TBRS FROM 1/18	2026-03-07 10:27:53.367+00	\N
04969c85-4dc9-4e6b-bc8b-884a6266d7df	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"ac9afc01-1f82-4bed-97ee-75173cee158c","rosterId":"486d8298-d149-4396-82db-496d331b61b8"}	2026-03-10 00:58:25.175+00	\N
7ce906a6-8445-48d1-a77d-4b69d333dbcd	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"ac9afc01-1f82-4bed-97ee-75173cee158c","deletedAt":"2026-03-10T00:59:56.287Z"}	2026-03-10 00:59:56.297+00	\N
f01c569e-10ef-4820-b503-6772ac1685ba	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"5b782ff3-888b-4339-944e-cc9fbc010da7","rosterId":"486d8298-d149-4396-82db-496d331b61b8"}	2026-03-10 01:04:26.86+00	\N
4c13fc3d-2fd3-4872-99f4-b1f8a07819ee	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"5b782ff3-888b-4339-944e-cc9fbc010da7","deletedAt":"2026-03-10T01:04:31.235Z"}	2026-03-10 01:04:31.241+00	\N
3febe722-63ba-422c-abd9-b13e21e90249	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-10 14:10:00+00	2026-03-10 20:10:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d","rosterId":"b797b156-1e69-4e56-b2ec-5c4c594c447f"}	2026-03-10 23:38:23.663+00	\N
a418a778-d07d-4a96-912c-6617a6cb38c7	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-10 14:10:00+00	2026-03-10 20:10:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d","deletedAt":"2026-03-10T23:38:30.708Z"}	2026-03-10 23:38:30.716+00	\N
81bca15c-411e-4f13-9c78-61233ea8bf10	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-11 11:00:00+00	2026-03-11 17:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"f325874c-5384-41e8-87e1-510c286617d5","rosterId":"b2791150-9976-4616-bb95-9bab215d6386"}	2026-03-11 19:20:51.906+00	\N
41faabd0-13f8-4041-bab9-57b75eff68cd	4142cedb-6a9a-42d9-b93b-50e305307342	SEGMENT_CREATED	USER_ACTION	2026-03-11 13:00:00+00	2026-03-11 16:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"c70df85d-610e-4e18-acc0-7156597c0f72","rosterId":"ac04c969-2738-4153-a813-2cd3113f8459"}	2026-03-11 19:21:00.057+00	\N
94e0b1f4-1564-4348-ab9a-48d144d99392	5402fe73-681a-4778-9b0d-25d4c2152746	SEGMENT_CREATED	USER_ACTION	2026-03-11 11:30:00+00	2026-03-11 12:30:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"bf335ed6-4c29-4979-9820-a76ead60eabe","rosterId":"e97da361-77b6-4595-ac17-5bd11d52b9db"}	2026-03-11 19:21:06.998+00	\N
37bd011a-77aa-4039-8f3e-dc3b71ecba52	5402fe73-681a-4778-9b0d-25d4c2152746	SEGMENT_DELETED	USER_ACTION	2026-03-11 11:30:00+00	2026-03-11 12:30:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"bf335ed6-4c29-4979-9820-a76ead60eabe","deletedAt":"2026-03-11T19:23:38.826Z"}	2026-03-11 19:23:38.834+00	\N
620e5bdf-4d55-46e9-8999-891fc6f327bb	4142cedb-6a9a-42d9-b93b-50e305307342	SEGMENT_DELETED	USER_ACTION	2026-03-11 13:00:00+00	2026-03-11 16:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"c70df85d-610e-4e18-acc0-7156597c0f72","deletedAt":"2026-03-11T19:23:50.816Z"}	2026-03-11 19:23:50.823+00	\N
d8e7c9c2-17f2-4933-b898-40585842bd80	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-11 11:00:00+00	2026-03-11 17:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"f325874c-5384-41e8-87e1-510c286617d5","deletedAt":"2026-03-11T19:23:57.716Z"}	2026-03-11 19:23:57.721+00	\N
6d72bffc-3c75-4402-aea8-753c968bcdfb	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-11 13:00:00+00	2026-03-11 19:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e","rosterId":"b2791150-9976-4616-bb95-9bab215d6386"}	2026-03-11 19:31:11.656+00	\N
7a55c896-d37d-4b1b-9341-df103b4bc999	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-11 13:00:00+00	2026-03-11 19:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e","deletedAt":"2026-03-11T19:31:32.592Z"}	2026-03-11 19:31:32.602+00	\N
ce3b323d-9f50-4630-adf1-2cb5c7bf4b35	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_CREATED	USER_ACTION	2026-03-11 12:00:00+00	2026-03-11 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"abb433c8-ef20-4c41-b576-e8cbcef665f5","rosterId":"b2791150-9976-4616-bb95-9bab215d6386"}	2026-03-11 20:12:34.495+00	\N
73b0fbb9-d7df-459e-97d9-d9fe29cbbae7	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	SEGMENT_DELETED	USER_ACTION	2026-03-11 12:00:00+00	2026-03-11 18:00:00+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N	{"segmentId":"abb433c8-ef20-4c41-b576-e8cbcef665f5","deletedAt":"2026-03-11T20:12:38.395Z"}	2026-03-11 20:12:38.402+00	\N
4bc8f2e6-b1e9-4425-ba3a-c1468daf4a0f	bbc6a8e4-57c5-4534-b400-fea490abc92f	TBS_FROM	LEGACY_PARSE	2026-08-02 00:00:00+00	\N	\N	\N	TBRS FROM 8/2	2026-03-07 10:27:53.264+00	2026-03-11 20:15:30.313+00
\.


--
-- TOC entry 3869 (class 0 OID 66706)
-- Dependencies: 247
-- Data for Name: schedule_notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_notification_logs (id, job_id, schedule_segment_id, notification_type, sent_by_user_id, channels_sent, channels_suppressed, customer_response, customer_responded_at, sent_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3848 (class 0 OID 66227)
-- Dependencies: 226
-- Data for Name: schedule_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_segments (id, job_id, segment_group_id, segment_type, start_datetime, end_datetime, scheduled_hours_override, deleted_at, notes, created_by_user_id, created_at, updated_at) FROM stdin;
a44d0702-6c72-4d96-9e51-fd8e6acb4463	2d89cdb9-1ffc-41c4-a219-80b8edb3c3a1	\N	PRIMARY	2026-03-03 13:00:00+00	2026-03-03 16:00:00+00	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.412+00	2026-03-06 17:59:50.412+00
9e8a655e-350a-484d-9e94-9a345d08a034	56ae401b-2901-4d4d-b5a7-3a06093ca7f4	\N	PRIMARY	2026-03-03 14:00:00+00	2026-03-03 16:00:00+00	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.415+00	2026-03-06 17:59:50.415+00
dddc91f4-56ff-44e4-b31f-80246a7d9179	9efe2e5d-fc9f-4aa7-844a-de86e81af1e8	\N	PRIMARY	2026-03-03 18:00:00+00	2026-03-03 20:00:00+00	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.418+00	2026-03-06 17:59:50.418+00
29c0d4c1-ef86-48f0-a764-9e3708f5cc6e	dbb2717a-ff7d-4a06-a6eb-a4fcbb2c8ada	\N	PRIMARY	2026-03-03 17:00:00+00	2026-03-03 21:00:00+00	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.425+00	2026-03-06 17:59:50.425+00
0e86be98-386a-4c4f-8214-2684dcbabbb3	ee317421-e00a-400b-afea-889d65c91cc3	\N	PRIMARY	2026-03-03 12:00:00+00	2026-03-03 15:00:00+00	\N	2026-03-06 17:59:51.294+00	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.405+00	2026-03-06 17:59:51.298+00
30848b7a-e02a-4d18-8e4f-448099e865da	09089313-97f2-457f-a53c-24d9f551c4bb	\N	PRIMARY	2026-03-03 16:00:00+00	2026-03-03 18:00:00+00	\N	2026-03-06 17:59:51.294+00	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.422+00	2026-03-06 17:59:51.298+00
6381b6b7-68ca-4579-b948-2b13c5440bbe	9ad9e518-29b6-4f53-b435-dd9502b8ced5	\N	PRIMARY	2026-03-03 14:10:00+00	2026-03-03 20:10:00+00	\N	\N	\N	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:51.388+00	2026-03-06 17:59:51.388+00
30bceb82-25c4-4886-a10f-7fce7e6f4c44	563c08a7-993a-418e-b8c4-ee15cfa8597f	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.784+00	2026-03-07 10:27:50.784+00
9482e2fc-ca90-4eda-97a2-1ff2ce571c3e	81ca1993-64fd-4e6c-b91c-fd1657b3ed28	\N	PRIMARY	2026-04-14 12:00:00+00	2026-04-14 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.795+00	2026-03-07 10:27:50.795+00
0ddf24eb-928a-4b93-871f-718561cd5a5d	551df28b-d6cd-4014-b990-a6af6f2a9f6d	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.803+00	2026-03-07 10:27:50.803+00
831d2ca2-47c3-49d0-b8ec-5cf161745241	c6233803-7768-4fac-892e-febbb131ead2	\N	PRIMARY	2026-03-11 12:00:00+00	2026-03-11 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.819+00	2026-03-07 10:27:50.819+00
c9184652-d630-4836-bed4-5ab10d272c46	785d866b-e0c0-425b-9d32-f0061d41d3cb	\N	PRIMARY	2026-03-25 12:00:00+00	2026-03-25 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.825+00	2026-03-07 10:27:50.825+00
3e6253c7-ccc4-4fb6-94ca-d9299a1b07df	088c24db-e94d-4fdf-8313-6c22b73701be	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.848+00	2026-03-07 10:27:50.848+00
2995107c-ac95-4054-91bf-ff9ee31c0021	d8570710-3e8b-4f7a-a34f-a12bd23655d0	\N	PRIMARY	2026-03-31 12:00:00+00	2026-03-31 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.854+00	2026-03-07 10:27:50.854+00
c6c8440e-301c-438d-8725-cb030e796225	2a5c821d-4046-4561-a813-28f14730fda1	\N	PRIMARY	2026-04-06 12:00:00+00	2026-04-06 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.861+00	2026-03-07 10:27:50.861+00
95493ab3-4a7e-4c3b-b879-30f0cb792d2e	73ecd980-8bc1-44c8-98cf-8c733244e34e	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.872+00	2026-03-07 10:27:50.872+00
a88b352e-5a45-4474-acf0-f99114d1aac4	299224c9-1d86-47df-a3c5-226839358324	\N	PRIMARY	2026-03-19 12:00:00+00	2026-03-19 13:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.883+00	2026-03-07 10:27:50.883+00
2ceb79d6-3cca-483f-89ed-fdbffe128ebf	ce58e9bf-aa4a-49a2-8f09-8e380db33695	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.89+00	2026-03-07 10:27:50.89+00
941c297c-100a-4813-94a4-8a8d41d01088	18cc9f8a-844f-4eb3-a322-5e747f7859e5	\N	PRIMARY	2026-03-02 13:00:00+00	2026-03-02 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.908+00	2026-03-07 10:27:50.908+00
9d530357-05b6-4f6e-a093-c08d47fac213	db1fc577-2305-4058-99eb-6571cc51ab6f	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.913+00	2026-03-07 10:27:50.913+00
331cd144-49af-4585-b819-bd479f4d99a6	818c8b49-2b16-4bc4-b9b2-d9657da51c1c	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.919+00	2026-03-07 10:27:50.919+00
cdb6ab0c-46c9-4f82-8abf-6f22ce00a8dd	ef46498f-dfa9-42e1-b669-7ad8204239ee	\N	PRIMARY	2026-02-27 13:00:00+00	2026-02-27 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.924+00	2026-03-07 10:27:50.924+00
15a3745b-ce52-4348-bb7b-ff72c9556258	b39f59fc-645a-4e2d-a352-57a901f71009	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.93+00	2026-03-07 10:27:50.93+00
5810ae5b-e10b-452f-b7c0-75ce6a8e648f	035053e8-7490-4b3f-a7ad-0202dd3c37cd	\N	PRIMARY	2026-03-18 12:00:00+00	2026-03-18 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.937+00	2026-03-07 10:27:50.937+00
f4fed362-7239-4831-aa25-cdcacea72568	f8168e0a-ed61-43e4-bffa-5329be56a478	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.943+00	2026-03-07 10:27:50.943+00
c8e7d21d-99dc-4b47-973a-ae5d350615f4	704e1330-9bd5-4837-a15d-c3bccfb8144f	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 15:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.949+00	2026-03-07 10:27:50.949+00
61ddd56b-bca1-457e-8936-d4f7c52ddbfc	7b07bd55-de88-48df-816b-e54b92f6610e	\N	PRIMARY	2026-03-17 12:00:00+00	2026-03-17 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.955+00	2026-03-07 10:27:50.955+00
2911bffa-5d19-4e42-aa4a-654e26ad47f3	3d7ae2ad-038c-4e7d-980d-6e142273cb0d	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.959+00	2026-03-07 10:27:50.959+00
f109364a-2c9f-4a4f-bedd-5279f829eb97	873ac612-2547-432b-9f84-c44daee1de0d	\N	PRIMARY	2026-03-28 12:00:00+00	2026-03-28 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.963+00	2026-03-07 10:27:50.963+00
e25909bb-9c2d-4b08-b662-d864828aea0b	c291010f-dad9-4c97-b067-3781494d4a10	\N	PRIMARY	2026-03-26 12:00:00+00	2026-03-26 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.969+00	2026-03-07 10:27:50.969+00
7cfc3b96-dbd0-4293-8052-2094827843d9	de920ee7-159b-4aca-b290-8d36e7f402b0	\N	PRIMARY	2026-03-03 13:00:00+00	2026-03-03 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.973+00	2026-03-07 10:27:50.973+00
284e3649-9dc3-44f7-a08a-4600ebbcbab5	fbca8ea8-12d6-41f6-9390-c1c41d84c64f	\N	PRIMARY	2026-03-19 12:00:00+00	2026-03-19 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.977+00	2026-03-07 10:27:50.977+00
8ac9fde2-7a3d-4e64-bfe9-03715e240301	84b77bec-855b-4f73-88ce-95e112ec1e67	\N	PRIMARY	2026-04-02 12:00:00+00	2026-04-02 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.981+00	2026-03-07 10:27:50.981+00
8c257a03-9588-4d10-8c9f-b9309b85aa82	bfe401f9-affe-4490-b03f-3abcc1ed916b	\N	PRIMARY	2026-03-23 12:00:00+00	2026-03-23 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.986+00	2026-03-07 10:27:50.986+00
a5a4a271-45ff-4a32-b932-924a3e79b775	26cc7895-944f-42bb-bf24-7b3a25fdc42a	\N	PRIMARY	2026-03-11 12:00:00+00	2026-03-11 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.991+00	2026-03-07 10:27:50.991+00
93ece2ad-9c1f-427b-b89f-a1c207d4f341	94d96c54-49f9-4a95-9dd9-57cddef404ad	\N	PRIMARY	2026-03-17 12:00:00+00	2026-03-17 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:50.995+00	2026-03-07 10:27:50.995+00
ad0a2825-df1b-403f-b934-66dbe3e04002	a295e7d4-8d64-4e81-8c6e-3201e6e2bbee	\N	PRIMARY	2026-04-13 12:00:00+00	2026-04-13 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.001+00	2026-03-07 10:27:51.001+00
5eaae4b9-3e66-4bb6-8d08-2f0b557108c7	7fbf066b-f950-4969-99f8-7e59ec3d3d91	\N	PRIMARY	2026-03-30 12:00:00+00	2026-03-30 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.005+00	2026-03-07 10:27:51.005+00
67caeedb-059d-4d7b-b32d-eb09c1512aa6	0f943289-8d26-41bb-bee5-62ed9336e681	\N	PRIMARY	2026-03-16 12:00:00+00	2026-03-17 00:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.01+00	2026-03-07 10:27:51.01+00
0929c627-6303-4135-81ba-66ffb9819fc2	c4ae82fc-8a47-4f38-a36e-1d2894c10417	\N	PRIMARY	2026-04-14 12:00:00+00	2026-04-14 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.021+00	2026-03-07 10:27:51.021+00
af989408-2746-4b46-aff5-e2a56a09fb23	c964a7dd-a5bd-4b72-bae7-e5ebf453cff6	\N	PRIMARY	2026-03-24 12:00:00+00	2026-03-24 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.026+00	2026-03-07 10:27:51.026+00
5f5e5def-e1c1-4d05-8116-633fb2d29fd2	195b2172-ef38-4895-8f5a-244ca9b08e32	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.031+00	2026-03-07 10:27:51.031+00
7f0b7816-20f0-4920-b694-02757897b8f4	a5e61c7b-137d-490e-a925-01510083256a	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.039+00	2026-03-07 10:27:51.039+00
a61f85c2-9872-426d-a4f8-9ba33391f5a7	02ab6366-5948-48d5-b59e-c4dd0f90e52a	\N	PRIMARY	2026-03-24 12:00:00+00	2026-03-24 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.047+00	2026-03-07 10:27:51.047+00
1b6ff5fb-5b22-4f1d-8cbb-e57452596100	902c0b99-3b4a-4eb3-93a9-227288bbf263	\N	PRIMARY	2026-03-03 13:00:00+00	2026-03-03 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.054+00	2026-03-07 10:27:51.054+00
d65a11d8-3027-4251-b5f9-ea288dae7d1e	2630f684-0b1b-4c9c-8ebd-76706fe13eab	\N	PRIMARY	2025-02-12 13:00:00+00	2025-02-13 01:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.061+00	2026-03-07 10:27:51.061+00
09528f3e-f60a-4ec7-a81c-264cb6e17a8e	d0eeb93b-2a8c-4210-a122-fbfb0f843d52	\N	PRIMARY	2026-03-18 12:00:00+00	2026-03-19 00:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.069+00	2026-03-07 10:27:51.069+00
fba37a4b-8b23-471f-a1ba-f2d03786fccc	c6eecbd7-bf51-4527-b227-87e565cb4f87	\N	PRIMARY	2026-03-25 12:00:00+00	2026-03-25 13:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.091+00	2026-03-07 10:27:51.091+00
08d53d5e-3e8a-43c9-8858-4f1edcd8295c	1729cf97-6e48-43d0-bc75-9f02d0e819e5	\N	PRIMARY	2026-03-02 13:00:00+00	2026-03-02 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.096+00	2026-03-07 10:27:51.096+00
03af2731-8584-441e-919b-c0ba663fba23	737594b6-a305-4778-990e-f9557ceee70e	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.101+00	2026-03-07 10:27:51.101+00
1f55da34-e7fe-4f93-bfaf-e79711490872	3682c5f0-2ee4-4a78-ac0c-473eac99a8a1	\N	PRIMARY	2026-04-09 12:00:00+00	2026-04-09 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.104+00	2026-03-07 10:27:51.104+00
2fde878b-3323-45b2-8c0e-b3a77a21ce72	744209f6-c2b4-45d3-9abf-823c94db9ae4	\N	PRIMARY	2026-03-02 13:00:00+00	2026-03-02 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.109+00	2026-03-07 10:27:51.109+00
8bc1a333-0c7b-4f5d-9052-3d026fa0afa1	1b741987-9cd5-48b1-b573-cef1e8aad0d1	\N	PRIMARY	2026-03-25 12:00:00+00	2026-03-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.113+00	2026-03-07 10:27:51.113+00
67130612-bce9-4fc7-941a-188fe72456c9	1d57cbdf-6995-40e3-a474-6ec3738a6283	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.117+00	2026-03-07 10:27:51.117+00
4f1bacf6-2844-4118-961e-59667ab3162a	13b6b5b2-6955-4e31-8583-d15a3c4329dd	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.122+00	2026-03-07 10:27:51.122+00
cd3d2d64-884f-42e4-80e7-e448b088a50d	a9e7b8b6-cc96-463b-a064-960a3cbb75e9	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.127+00	2026-03-07 10:27:51.127+00
571a8060-d239-491e-97d7-2a14b37f96f7	945b6629-28f7-48dc-94e8-4295c9a7318d	\N	PRIMARY	2026-03-23 12:00:00+00	2026-03-23 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.131+00	2026-03-07 10:27:51.131+00
bde04a82-c971-496f-84be-8f62e325cb85	074f9995-2f67-4c7c-baf1-10be416b0465	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.144+00	2026-03-07 10:27:51.144+00
13b25ea5-dd03-4078-aa7a-437418a1238a	15b7d653-6df0-42b3-8231-69a4c0d7ac12	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.148+00	2026-03-07 10:27:51.148+00
23fb7759-3f19-4c74-bedc-997a8a09393e	63190d96-2cd2-468b-a15b-b7aec1124864	\N	PRIMARY	2026-03-24 12:00:00+00	2026-03-24 13:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.153+00	2026-03-07 10:27:51.153+00
868854d8-c706-4190-a6a0-9968f2540323	a9ef6e99-45fe-49cf-887c-9fdd6d640136	\N	PRIMARY	2026-03-03 13:00:00+00	2026-03-03 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.157+00	2026-03-07 10:27:51.157+00
2314759d-f70a-4c5e-a098-757d5be7b018	7dd4bd45-7297-4b85-9288-63356cfaad82	\N	PRIMARY	2026-03-18 12:00:00+00	2026-03-18 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.161+00	2026-03-07 10:27:51.161+00
4ec4d33c-4364-4f43-bc4f-e6e5eb10c865	a0c17e3b-c27b-4c12-a313-784a8f16f4be	\N	PRIMARY	2026-03-02 13:00:00+00	2026-03-02 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.165+00	2026-03-07 10:27:51.165+00
655b6c71-65a0-4938-a2ef-f2e17918a5a0	a46823d8-6c8a-4776-b477-92ad4d5dfdd2	\N	PRIMARY	2026-03-03 13:00:00+00	2026-03-03 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.17+00	2026-03-07 10:27:51.17+00
86e5aada-5dee-44e5-b053-f9741c53f669	8ce6ef98-c9f0-4ffe-8861-61349ba5481d	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.174+00	2026-03-07 10:27:51.174+00
4b86dcbc-dcb0-406d-aee5-6d258fd993ff	ebdc384f-bc7a-4dc5-b5f1-a6929a2a6993	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.178+00	2026-03-07 10:27:51.178+00
ffcfbd35-f244-498d-aaf0-15d6a357006f	a6917eaa-2b51-49db-9b2b-d5084bb2380c	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.182+00	2026-03-07 10:27:51.182+00
693fbf82-3586-47da-97e4-ac903125e125	ea6a988c-2811-438f-b284-bd9dad210128	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.186+00	2026-03-07 10:27:51.186+00
2f0e5846-0dce-43c0-a192-10824e930e4e	548f2602-99a7-4cb0-9db6-3fab2045a277	\N	PRIMARY	2025-02-11 13:00:00+00	2025-02-11 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.19+00	2026-03-07 10:27:51.19+00
5ee01d6e-32f7-4f46-be10-a72f3936e94e	f80ff63e-3878-489c-8480-870bfbdac1ac	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.194+00	2026-03-07 10:27:51.194+00
43639a87-8964-453b-be19-a9d9d46c25c3	433dcc59-43f8-49cf-b449-32486389b249	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.198+00	2026-03-07 10:27:51.198+00
6be93944-086c-47a9-abc4-80dd2ea4825c	1a63c371-7c41-45f6-a3cd-e7a5a4eb9961	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.203+00	2026-03-07 10:27:51.203+00
dcab5aa8-cf28-4e46-abeb-b89fd82f646d	c46dee47-a24f-4f83-8718-b43e564f6d6a	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.209+00	2026-03-07 10:27:51.209+00
cd46058d-7559-4406-8417-ef46fde592be	28eee2b5-bd35-4e86-bcf5-f145cfa42f57	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.215+00	2026-03-07 10:27:51.215+00
a197aaee-3386-4a75-9f26-bdcb7ef3b72a	5a9e79a1-f772-415c-8df1-fbe4f9a52c85	\N	PRIMARY	2026-03-17 12:00:00+00	2026-03-17 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.22+00	2026-03-07 10:27:51.22+00
7c839744-dde6-47a7-85df-503ff573fafa	5476446d-2ab5-483d-b814-513f7b95262d	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.224+00	2026-03-07 10:27:51.224+00
233a46f5-fb96-424b-8ee9-a071d707f970	bc1fce68-861b-4df1-bcb2-6b06b731b7d0	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.228+00	2026-03-07 10:27:51.228+00
a7b7b7e4-07d2-429e-8012-7b76186b7e1b	12dc33dc-c367-4979-b717-9605545ff4ad	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.232+00	2026-03-07 10:27:51.232+00
15af3514-65aa-427b-96b5-8b2bc75404ba	f1a17b4d-8f30-4a5a-b2bf-45378322f239	\N	PRIMARY	2026-03-19 12:00:00+00	2026-03-19 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.236+00	2026-03-07 10:27:51.236+00
2ffaf6bd-ab02-4f60-8d83-a8ad8bc27959	f5eb484e-ec23-47b6-9727-725550e6e1fa	\N	PRIMARY	2026-03-16 12:00:00+00	2026-03-16 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.24+00	2026-03-07 10:27:51.24+00
301cda0a-0559-44e4-90f2-2d1dbe94f137	713132a0-8629-4f93-9239-21afee77be02	\N	PRIMARY	2026-03-26 12:00:00+00	2026-03-26 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.244+00	2026-03-07 10:27:51.244+00
8f8a68ce-231f-4346-9667-28fdd894c35c	9dde3a94-d32a-4fa4-8fd8-a175ccd46304	\N	PRIMARY	2025-01-13 13:00:00+00	2025-01-13 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.248+00	2026-03-07 10:27:51.248+00
0c4bae37-4d28-4750-b658-4a9c94c07591	5383c539-fd56-488e-9a72-6d6dc4afdf94	\N	PRIMARY	2026-03-19 12:00:00+00	2026-03-19 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.251+00	2026-03-07 10:27:51.251+00
ab54f6ea-e8c6-44c9-9cdc-87f0179a38fc	1a0729f9-2f33-495d-97c6-c8196097f841	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.255+00	2026-03-07 10:27:51.255+00
f1d1719d-8816-424e-85d0-05ee70af9d50	09e5dd4d-e98d-4c42-884d-5391a7954cd7	\N	PRIMARY	2026-03-16 12:00:00+00	2026-03-16 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.26+00	2026-03-07 10:27:51.26+00
8bb3e69d-d7e6-4317-8747-d61a9ebc270b	ec61824d-2071-4774-a64d-1280a8161a8f	\N	PRIMARY	2026-04-01 12:00:00+00	2026-04-01 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.266+00	2026-03-07 10:27:51.266+00
ce22ae39-5e2d-4692-a978-58aef0b59016	336f6273-5010-4fa0-bd04-4f4bced8e33e	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.27+00	2026-03-07 10:27:51.27+00
7a748297-77e6-4155-b11b-c3645a501bd8	903e9c6f-9594-4af0-93b8-7acb15b84e96	\N	PRIMARY	2026-03-16 12:00:00+00	2026-03-16 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.274+00	2026-03-07 10:27:51.274+00
ae140bca-2306-43e7-a036-176df5a18f3a	822d3969-4b7c-41d0-bd61-cde984656780	\N	PRIMARY	2026-03-23 12:00:00+00	2026-03-23 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.278+00	2026-03-07 10:27:51.278+00
20ee1d7b-6f87-4211-b515-9b845f85db33	9a2895cf-36de-48f3-b919-ff29bc54ff2e	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.282+00	2026-03-07 10:27:51.282+00
d7af5694-1d81-48cb-8ddd-8cce92a3ad23	c25a4de3-af98-44f5-ba15-3724c78cf99b	\N	PRIMARY	2026-03-11 12:00:00+00	2026-03-11 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.285+00	2026-03-07 10:27:51.285+00
d429cfeb-66a9-42bb-bb13-724611ebceff	f7b15fad-e9eb-4c68-af81-4abc27de03c1	\N	PRIMARY	2026-03-26 12:00:00+00	2026-03-26 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.289+00	2026-03-07 10:27:51.289+00
71d894e3-420a-4127-9e5a-83a8bcf0a5e0	74db6280-2cee-4cb8-9c8e-5e048c149f3e	\N	PRIMARY	2026-03-18 12:00:00+00	2026-03-18 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.293+00	2026-03-07 10:27:51.293+00
55053713-36af-4329-a119-7f9b966e9c65	427a8c69-a8c2-4253-a6ca-27f867eb3f9c	\N	PRIMARY	2026-03-16 12:00:00+00	2026-03-16 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.297+00	2026-03-07 10:27:51.297+00
25e82a9a-c306-4bc1-b04e-04279b7ce8f7	1b92c449-50ee-4989-9fa6-23ce73df5ddc	\N	PRIMARY	2026-03-30 12:00:00+00	2026-03-30 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.301+00	2026-03-07 10:27:51.301+00
a7575523-9878-47cf-abce-a2e198102499	0d45a9d2-d21f-4358-bbca-feacc45b5e3f	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.305+00	2026-03-07 10:27:51.305+00
038436dd-8bf7-456c-8d62-112e4342c36a	f77cc0af-b440-448b-a557-8bb43ef5a7a1	\N	PRIMARY	2026-03-05 13:00:00+00	2026-03-05 23:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.309+00	2026-03-07 10:27:51.309+00
4f4073f7-f6b3-40dc-8726-4d29859ab9c3	ca0d7d9f-aa01-4ba4-839b-316373d4f55a	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-10 00:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.312+00	2026-03-07 10:27:51.312+00
87cfe967-e211-4f05-9c2a-5d906f58f905	d2eba811-8647-44fb-bcae-a4c3c55ce8ac	\N	PRIMARY	2026-03-11 12:00:00+00	2026-03-12 03:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.315+00	2026-03-07 10:27:51.315+00
af4df21b-222e-446c-87f1-dadf84a21f26	9390bb8e-a7fd-4137-8de5-3ef78ef3d081	\N	PRIMARY	2026-03-24 12:00:00+00	2026-03-25 03:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.318+00	2026-03-07 10:27:51.318+00
12c03552-4109-40fb-b7d0-bbc30d976d1c	9bfa3707-c6c4-408f-bb05-6d2e02733802	\N	PRIMARY	2026-03-24 12:00:00+00	2026-03-25 03:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.322+00	2026-03-07 10:27:51.322+00
6c14a2a9-7280-4600-94fc-8c713bb0a9e1	1dcfafda-6133-4215-8e28-ddd46eb286d0	\N	PRIMARY	2026-03-18 12:00:00+00	2026-03-19 03:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.327+00	2026-03-07 10:27:51.327+00
4a8d9789-cb7d-47a6-a6bb-4d5ca2bde1fa	a75bc14a-cb05-4e19-a053-fd98da1f6357	\N	PRIMARY	2025-03-02 13:00:00+00	2025-03-03 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.331+00	2026-03-07 10:27:51.331+00
0453676c-d1a0-43cf-b851-465de41b52ca	a1df8255-d890-4098-b4be-834fba9c52cc	\N	PRIMARY	2026-03-12 12:00:00+00	2026-03-12 13:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.364+00	2026-03-07 10:27:51.364+00
22556d15-d366-42f6-a31b-0789c6ed11fb	d1ec6a60-11f6-4a50-af62-9206e0bbb96b	\N	PRIMARY	2026-03-19 12:00:00+00	2026-03-19 13:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.369+00	2026-03-07 10:27:51.369+00
2c22bf10-49ed-4a33-b0c2-f8adc0e579a3	fee49797-99b3-4737-aa9d-69cbcf19bff7	\N	PRIMARY	2026-04-01 12:00:00+00	2026-04-01 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.372+00	2026-03-07 10:27:51.372+00
83a15586-bf4d-42eb-ade5-7b8d6fd73d6d	c9ee203d-4a3d-4463-b927-626e29753528	\N	PRIMARY	2026-03-10 12:00:00+00	2026-03-10 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.377+00	2026-03-07 10:27:51.377+00
106332b4-3a5d-4743-ba25-f7588d3eda64	d3d03ffa-909c-4017-ba20-1e1fd3ea6bda	\N	PRIMARY	2025-03-03 13:00:00+00	2025-03-03 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.381+00	2026-03-07 10:27:51.381+00
ea795dbe-ab53-440c-aa05-ecc4f6af5a4f	1a873ca7-1dbd-4878-a9df-f899fc210a12	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.398+00	2026-03-07 10:27:51.398+00
4feae3e5-4ef7-46d6-8b60-eb92ca9c506a	3255e838-9203-4bb8-a315-424de0c9b175	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.402+00	2026-03-07 10:27:51.402+00
eea839ab-b8a8-4133-b457-8cd9676ba8d5	0cbfba9a-3e92-4a13-9edb-eb5ec22ec9a6	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.407+00	2026-03-07 10:27:51.407+00
d3a128f8-7fc0-4c41-a01f-4d2828941511	9469eb93-360a-4c6d-8d90-cb76203cf83e	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.411+00	2026-03-07 10:27:51.411+00
079aa92c-adbb-473b-a511-3c0e7f0cb846	77099464-acea-4bfa-86b8-18d1260487da	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.416+00	2026-03-07 10:27:51.416+00
e283d110-582e-4770-8f51-cae326fa7970	848360de-8ab1-4b04-98f8-1d1965d38838	\N	PRIMARY	2026-02-10 13:00:00+00	2026-02-10 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.42+00	2026-03-07 10:27:51.42+00
5bc0a4a4-c318-47cc-93fc-396f008c9daf	43116b4b-4207-415d-8efc-d6d93dee3c83	\N	PRIMARY	2025-01-21 13:00:00+00	2025-01-22 03:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.424+00	2026-03-07 10:27:51.424+00
09f9cb46-797c-4758-824a-f92f9c9d395c	7ec58745-a1b8-465f-b5a2-dbd0bd7bcf35	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.428+00	2026-03-07 10:27:51.428+00
377197f5-c85d-42a2-923c-e0707f9828cb	eef15aa8-898d-4fc3-b153-2bcd66958e5c	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.433+00	2026-03-07 10:27:51.433+00
542d79a0-35ea-44bc-919a-e2020682c43d	f9800a61-defe-422e-9758-7aa2e0373f9d	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.436+00	2026-03-07 10:27:51.436+00
046ed691-72fa-4930-8f9e-e4fe01935162	1d9566a0-796e-4a1e-8fa1-75adfea2f498	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.442+00	2026-03-07 10:27:51.442+00
4007bff7-7d86-45eb-a47b-691c9ffc2cd0	f8a2a7bc-626b-4fb3-8868-80d8403335ba	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.447+00	2026-03-07 10:27:51.447+00
6f2711f2-97f9-4a66-9291-4415f282922a	7cfdb352-51f8-4fb9-bc9c-4b97a2ea6540	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.451+00	2026-03-07 10:27:51.451+00
0df0ac38-0b5d-4504-8164-cef18c0ea289	4dd30d6e-f02a-4773-9b44-6b75d02fe618	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.455+00	2026-03-07 10:27:51.455+00
4948a802-576e-4118-aad3-0a46f059e7c2	b76958d7-ed7e-4df9-8651-616b9f7cad03	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.459+00	2026-03-07 10:27:51.459+00
66c4e536-3726-4541-a156-3673ad70b11c	f841dc58-493e-4200-b832-c594a364cea1	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.466+00	2026-03-07 10:27:51.466+00
0fd75c8c-8d5c-40bc-9729-ec44c3f82bda	6b6648fa-119c-49e9-828a-f26e86106b8b	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.472+00	2026-03-07 10:27:51.472+00
d43f95af-38a4-4b38-87b9-c6dd9be4c0d8	5ca46c58-87a7-4c5c-b71c-381bc9c04415	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.478+00	2026-03-07 10:27:51.478+00
7540c49b-1453-4c80-836b-659285331baf	780ce44c-3f74-4ea0-8da9-2a12e5e6907c	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.483+00	2026-03-07 10:27:51.483+00
a838aa83-3cea-4fcc-ab94-9049f6d4d57a	62252588-c51d-490c-83c7-5e731e8913e4	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.487+00	2026-03-07 10:27:51.487+00
55d1262b-ae64-4140-b6e7-d545970dbd77	77bd9469-2855-4c26-b63e-99c92b6cae3a	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.492+00	2026-03-07 10:27:51.492+00
40a675a4-b417-4f6f-b51c-6b8adb1bce64	dd98d1e6-5ff2-4d54-93ec-8e45d084a6f9	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.496+00	2026-03-07 10:27:51.496+00
86e6b6aa-aafc-421b-90bf-ed1921baa744	5e59d15b-009e-40a3-95f9-e134a67de011	\N	PRIMARY	2025-01-14 13:00:00+00	2025-01-14 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.5+00	2026-03-07 10:27:51.5+00
73f6ad54-880a-41ac-8731-26bb57a26a86	90f789ad-b2ef-4d28-adc2-75a989b8476c	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.503+00	2026-03-07 10:27:51.503+00
2fca3685-8f07-4ccd-8123-94ffbdc302de	9e6f2916-8eca-4a42-bb2a-a1eddc4dfb32	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.508+00	2026-03-07 10:27:51.508+00
62f9dc1b-3ebb-4b84-8730-8889e2e00eb5	aedade0e-40fc-4a56-81e4-1dff2c929d8e	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.512+00	2026-03-07 10:27:51.512+00
ad569750-5a92-4475-bd35-d41695655ea6	41f1976e-a03b-466c-8a3f-746754a9cc16	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.516+00	2026-03-07 10:27:51.516+00
cd1667a1-a590-413d-a469-b102a2f59924	7043761e-0df7-4eac-bd8d-2a5c73a7757d	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.52+00	2026-03-07 10:27:51.52+00
3b425b41-b0f4-488e-9867-2300afaabbaf	c56e0899-81d5-4ad7-8217-8c8aace5c572	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.523+00	2026-03-07 10:27:51.523+00
c6b624ac-4a76-455a-9680-f9a89b0b41f2	4aae2cc7-941c-46ae-9880-1d42e4a9d576	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.527+00	2026-03-07 10:27:51.527+00
3e654624-287c-4683-b4e9-0c31418a5903	879055a2-e3ca-4d46-b55c-f196bb6c2639	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.532+00	2026-03-07 10:27:51.532+00
54c51e4f-cb9b-40a8-bf29-ac65523ff2f1	2dd509e6-82a4-4797-b846-f3c7e7be6b80	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.536+00	2026-03-07 10:27:51.536+00
04c0d933-f999-4e10-aede-3eb8bdb88dcd	f8b4a3b5-a54a-4f63-858c-1b20e0e427c4	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.541+00	2026-03-07 10:27:51.541+00
ddae11c9-13ce-4ddd-b856-55cbc1f56626	1d1ea9f2-40d7-4e80-92e2-789ead8d8727	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.545+00	2026-03-07 10:27:51.545+00
6bc3c1fe-f0f8-45e5-95c3-679c7c40fc21	95827adb-589b-455e-be2c-8210102cc105	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.549+00	2026-03-07 10:27:51.549+00
a08f47c7-250d-4102-adec-b536dd991aa1	11fd9d6c-2834-4b0b-99fc-f6271afb172c	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.553+00	2026-03-07 10:27:51.553+00
60d4d2c8-7e2f-4128-92d5-28d3cee724b7	1fc60b05-06c1-4daf-98dc-8ca7ee87e527	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.559+00	2026-03-07 10:27:51.559+00
61b9ea3d-85ba-42e9-8bf7-50cb03bf303d	f826b861-9c38-4268-92e6-cd425f5912b8	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.563+00	2026-03-07 10:27:51.563+00
2520f2e4-c749-4eb0-be35-4c4e8e736840	2c197911-742b-4786-ae4e-83132ee0fcab	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.566+00	2026-03-07 10:27:51.566+00
adc4c71c-85f3-404b-a3d9-f189b019a322	cb21e28f-2733-4bd8-917a-44de6d857ec0	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.57+00	2026-03-07 10:27:51.57+00
38e6422d-6dc8-4184-b235-61b9505b50d0	41fdfd20-17d3-4b00-8ba0-ebdb85401bd9	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.574+00	2026-03-07 10:27:51.574+00
52e8d9e3-08cc-4d0f-b77e-cb59dd8e47d5	75eb2662-c671-4db9-8c2c-7ebad042a7d7	\N	PRIMARY	2026-02-18 13:00:00+00	2026-02-18 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.58+00	2026-03-07 10:27:51.58+00
6d2b2998-edda-4d28-89a7-7fb24482f817	276fe0cd-d3bb-498c-9788-32c85d109625	\N	PRIMARY	2026-02-18 13:00:00+00	2026-02-18 23:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.585+00	2026-03-07 10:27:51.585+00
9d4d845e-83fa-4622-a89a-81cd66141e95	c84697c2-bbcb-4fd6-8f02-688360b9ceda	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.592+00	2026-03-07 10:27:51.592+00
cca54cf0-036f-4a0a-99e8-b0cda5a9faf8	af8d8fb6-a060-4ed4-9cd7-e598015df806	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.596+00	2026-03-07 10:27:51.596+00
0384d5d4-f534-4b19-9caf-dba035a4b850	4a3b6e89-4055-4d65-8f6f-ecaf98362afc	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.602+00	2026-03-07 10:27:51.602+00
37f9e38a-57cc-40be-b9bb-f304862f0f00	c2283226-987b-4e38-991c-ae9ee6111d93	\N	PRIMARY	2026-02-14 13:00:00+00	2026-02-14 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.609+00	2026-03-07 10:27:51.609+00
631bffeb-b2a2-43ce-a47a-9d3e6101cb8b	45c9c368-00dd-44f6-a347-6703ac3d57de	\N	PRIMARY	2025-02-09 13:00:00+00	2025-02-10 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.614+00	2026-03-07 10:27:51.614+00
02a0f563-e9d7-4be3-95ff-d530438b3b47	883c6416-17bf-4b7c-a872-2bbc3f91e176	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.618+00	2026-03-07 10:27:51.618+00
c16019b1-974f-423a-b8dc-4279df4c85bb	bcc8063c-5d27-40da-a081-2700ededd36f	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.625+00	2026-03-07 10:27:51.625+00
72774938-be26-4d64-b262-0a3b4f612ff7	e843c570-11fd-4b5f-bbac-cd32500c1f06	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.629+00	2026-03-07 10:27:51.629+00
77bceba7-cb2a-4865-8614-84838eb94b97	5efbaa59-65c3-46ee-89fa-d77c229ac6e2	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.633+00	2026-03-07 10:27:51.633+00
a7e4d65e-782a-40bb-923e-8c7d6d8093d5	0ee31f29-c822-4a8a-985c-f2966083e64d	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.637+00	2026-03-07 10:27:51.637+00
fd912f61-28e3-4bd1-bcc4-5075ea7dbea0	f224f77b-ea5d-41ee-9c19-fd92c546c43c	\N	PRIMARY	2026-01-31 13:00:00+00	2026-01-31 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.643+00	2026-03-07 10:27:51.643+00
84187367-ee25-424d-aeb6-f5c3a6f17870	2e0653fa-9875-472e-b0d8-a4b35c3cf253	\N	PRIMARY	2026-01-29 13:00:00+00	2026-01-29 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.647+00	2026-03-07 10:27:51.647+00
c1282704-7f64-464a-a532-7144a4e6ea9f	92bb88c5-5a54-43a4-891c-225f2bdf938e	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.651+00	2026-03-07 10:27:51.651+00
7cbff93d-2950-4ab5-b8dc-84b5d51a40ba	ba591bba-b3c6-4dec-baee-d5f38e9386fd	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.655+00	2026-03-07 10:27:51.655+00
0958a1a6-ae9c-4f6f-bf7c-9fcd7932c3f7	360bcb96-01a5-4d6f-bcd8-ff732ef5d62a	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.659+00	2026-03-07 10:27:51.659+00
5a2d581e-c335-4a48-a707-afc47fc317b0	f4e1bbd4-ff44-454b-9e37-14384732d459	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.663+00	2026-03-07 10:27:51.663+00
1eaada2a-41bf-4f92-9b2a-9fe9f64c96f0	1cc65da3-fe0c-4608-8e33-2d4116a4dc33	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.667+00	2026-03-07 10:27:51.667+00
01f93548-af39-42de-8c31-b8abaa1cb87b	8fec7d74-ab28-4625-9197-0836c4a4768e	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.671+00	2026-03-07 10:27:51.671+00
e088cbf8-c681-4fc6-bb00-7ceb1ae93f71	ec92af9a-5893-40bf-be35-1bf7cbbd6ad3	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.675+00	2026-03-07 10:27:51.675+00
b135ca9e-72d8-4d41-acc4-59fafa634d7a	4f62c38a-c9d6-4ae8-b68e-0d1ab138612c	\N	PRIMARY	2026-01-17 13:00:00+00	2026-01-17 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.678+00	2026-03-07 10:27:51.678+00
0c792f17-4976-45f1-bb8c-b3cfe5231d63	b3486ac9-9ee9-4cde-ace3-3a6532f110ae	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.682+00	2026-03-07 10:27:51.682+00
29502b3a-5846-45e0-b0e8-5b6a1644de0f	f4806f85-96f1-4dd4-b153-583a9adb6ca5	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 16:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.686+00	2026-03-07 10:27:51.686+00
36d99858-e617-4539-b390-ee7ce88d55e1	405b12bf-ac1c-416c-b5cb-0cccd8542598	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.69+00	2026-03-07 10:27:51.69+00
ae3714c3-561e-4233-9907-501117147002	fb0b5323-e400-44ab-94fe-00be5114a0b2	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.695+00	2026-03-07 10:27:51.695+00
dc99c3ad-a5ee-4327-bf4a-6f529e74b7f5	c5bfdf0c-d010-44f1-83bd-8179ce708dfa	\N	PRIMARY	2025-01-15 13:00:00+00	2025-01-15 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.699+00	2026-03-07 10:27:51.699+00
076be9ee-875e-435e-8916-04de80e7d13c	27bce37e-18e4-47d3-a69f-a448c9d53f75	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.703+00	2026-03-07 10:27:51.703+00
0e81b38e-5a59-49af-bab5-5cac73dd1452	e522a793-74ba-4b0b-baea-a13165e4d2be	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.707+00	2026-03-07 10:27:51.707+00
e86b3421-6526-4a31-bdf6-14f647fd0f2b	aa6bc917-9ac3-4754-ba37-253bf8bf15ad	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.711+00	2026-03-07 10:27:51.711+00
4e97df9c-8a15-4785-91f7-3ac72edeba32	9e99d727-da50-4f92-8d1d-02c7e7c48879	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.716+00	2026-03-07 10:27:51.716+00
16d25b67-976f-4e61-ada2-e3a63b688e0b	5a639098-4dca-41f2-a56c-8028e89a610a	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.72+00	2026-03-07 10:27:51.72+00
bbb2234d-a48d-4712-8f77-d83e158be998	9ba43b7a-f14c-4794-a588-4332229737ca	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.724+00	2026-03-07 10:27:51.724+00
7055c0ad-08c3-4801-84b8-3fefe8411753	e32bc75f-d5e8-44df-a6e2-281e079a7e3a	\N	PRIMARY	2026-01-10 13:00:00+00	2026-01-10 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.728+00	2026-03-07 10:27:51.728+00
9ea981ad-059e-4e6e-8839-55dce7c6e49d	688b9814-e983-4612-99b1-7779c224b7f7	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.732+00	2026-03-07 10:27:51.732+00
906741d9-786d-4051-8a2c-397c252a9c3e	2aa43dbc-dcfc-4c5c-bb54-3ff285e02082	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.736+00	2026-03-07 10:27:51.736+00
6db7a74d-a560-46da-913c-0eaf3b2d5d45	c8e6cdc2-d1e5-4a17-a88d-2500466fdb4c	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.739+00	2026-03-07 10:27:51.739+00
b0cc585d-bdd5-496b-9f0b-1ba633622fd6	dd58edd4-2414-45ce-ab97-27f57cad4579	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.742+00	2026-03-07 10:27:51.742+00
8bf64580-8414-4263-99b3-4b267acce23f	7fa04c40-ef73-4aa3-b78b-4de9ce0463d1	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.747+00	2026-03-07 10:27:51.747+00
e0a52293-e511-4c1f-9eeb-d012ad659ebd	9039b4b9-c3ea-454b-8aba-b68a6e1af8d0	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.751+00	2026-03-07 10:27:51.751+00
4c9c27f5-93aa-4290-b708-019ec389b758	1ead75f2-2126-4bd4-b028-ce5b839fcad6	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.755+00	2026-03-07 10:27:51.755+00
ef98f138-aa89-4b20-ad09-beebc330bb19	96028009-c8f8-4696-95e2-59c36c38bace	\N	PRIMARY	2026-01-03 13:00:00+00	2026-01-03 23:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.759+00	2026-03-07 10:27:51.759+00
e485f196-6f8c-4715-9237-04f40359f2e0	2f769c18-ccfa-459d-8068-4496ca3272c1	\N	PRIMARY	2026-01-03 13:00:00+00	2026-01-03 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.765+00	2026-03-07 10:27:51.765+00
034628a6-fc4b-4555-8e84-bdc3d1ed3a55	8b15131f-bdfb-4e23-b09a-fb431b11be8c	\N	PRIMARY	2026-01-03 13:00:00+00	2026-01-03 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.768+00	2026-03-07 10:27:51.768+00
ee1a7917-42b8-491c-a38a-55873a88fe92	1847f771-3626-41f8-8bab-962d32d3b066	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.772+00	2026-03-07 10:27:51.772+00
3f93c1e5-efd0-4da7-8a52-c3b2fd001de3	534287f9-e78f-480d-b7f5-907807217281	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.777+00	2026-03-07 10:27:51.777+00
cdaff2a7-302f-439e-ae35-eff2a795241f	17b3344e-7f6d-4bf6-a8db-1df5eb46d5ed	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.785+00	2026-03-07 10:27:51.785+00
62cf0656-d8b0-4aaa-a3ac-8a8e1ac35715	f59f43ed-db55-48f9-bd9f-8ae6655d7de7	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.789+00	2026-03-07 10:27:51.789+00
e27e23b1-bb98-465e-bc9a-4f16cdc05162	92042a6e-dd30-4371-958d-be886df7b4f3	\N	PRIMARY	2026-02-18 13:00:00+00	2026-02-18 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.794+00	2026-03-07 10:27:51.794+00
b2f97503-491a-4e5a-96aa-a537b569f9fd	f747cd3f-6d6e-46e3-8b8b-184fbe97c36f	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.799+00	2026-03-07 10:27:51.799+00
665a4691-f909-4717-acf9-0aa8f5119e4a	9f53d8f9-e5db-4c57-ba81-0fbe087ec326	\N	PRIMARY	2026-02-12 13:00:00+00	2026-02-12 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.805+00	2026-03-07 10:27:51.805+00
f21b6667-2165-4f50-9719-998d9d890b48	5987b91b-acc7-4e4b-9128-4ef1970825b9	\N	PRIMARY	2025-02-12 13:00:00+00	2025-02-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.808+00	2026-03-07 10:27:51.808+00
49910d13-9415-4f84-9326-fd68155e9e8b	229872de-c816-4d20-9197-b3ee91b43d97	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.812+00	2026-03-07 10:27:51.812+00
769b68af-231e-4436-85d6-c999bb144b48	a31e2463-8b39-4045-9373-3c7df1b788df	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.816+00	2026-03-07 10:27:51.816+00
f28e2cc8-4def-4338-aaaa-7bea5ba48141	6045575d-cef6-4573-974c-c996c19ece6f	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.82+00	2026-03-07 10:27:51.82+00
1b158ee4-e9ec-4624-9165-1fee6389e5ca	2fed6735-81aa-4280-977f-9d3f3ff8862d	\N	PRIMARY	2026-01-29 13:00:00+00	2026-01-29 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.824+00	2026-03-07 10:27:51.824+00
587726d0-5963-422b-bcf1-b5a482bef120	2c32036e-d340-4550-8da8-55c6a063ce19	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.83+00	2026-03-07 10:27:51.83+00
f6852eb8-78b2-442b-8718-e55515e2aacd	07f11d8a-5703-4de7-85d8-d05addb6cb72	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.834+00	2026-03-07 10:27:51.834+00
b3243c55-09fe-43f3-a6d0-859129bde9ef	1c602d57-2fc2-4734-9acd-4e8c2b8c5abf	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.839+00	2026-03-07 10:27:51.839+00
24ad7516-d9f3-4ccf-9360-b2e9e27ea53c	639a1fcf-286f-4999-9e44-2c10da972cd6	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.844+00	2026-03-07 10:27:51.844+00
ee5295e9-6a23-4c83-83eb-4447b1144a4f	71eba330-9ac6-4ac9-89da-4e318ea2d7c7	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.847+00	2026-03-07 10:27:51.847+00
35a4a408-eb1a-4f51-8823-3b6022797d50	a92d0f0b-c650-4b1b-861e-e0dbdea6f92d	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.851+00	2026-03-07 10:27:51.851+00
c2ea26f1-abeb-4734-96dd-6e5765a8ef46	badd399f-4830-451d-8bb4-597d9ef1b5f2	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.857+00	2026-03-07 10:27:51.857+00
6db3a684-a776-4e85-b745-267df17e4331	67232b3f-8ed2-4fcc-9b70-e556483e8d99	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.862+00	2026-03-07 10:27:51.862+00
770be283-4e4e-4f13-89cc-03fe6938c2cc	11a5c757-86c3-4539-9c4a-552c57b90890	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.867+00	2026-03-07 10:27:51.867+00
99db86e4-a9bd-4f64-965e-c5c3e1366692	f284c263-6ce6-4fac-bd1d-06b453a794db	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.872+00	2026-03-07 10:27:51.872+00
958bfa2f-26a9-4522-8f1f-2821b9dc240b	84c7dfab-a56b-4f08-98ca-f400a0b90fa0	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.876+00	2026-03-07 10:27:51.876+00
edfda874-975f-484e-aeb4-008fd578882a	7342e8a2-fe24-4aef-be41-fac9e143f237	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.889+00	2026-03-07 10:27:51.889+00
3e0b735f-415c-4efb-8474-a53ba4e7540e	74d4e00a-7de6-4f05-9fb9-956f82ed6664	\N	PRIMARY	2026-02-24 13:00:00+00	2026-02-24 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.893+00	2026-03-07 10:27:51.893+00
a0648d02-146c-4e60-8e5d-e763983f37b4	f32ef255-7ff6-4ca4-af50-28198e47a6eb	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.897+00	2026-03-07 10:27:51.897+00
5202f920-1bf2-47a6-8014-3cd2507a5a0b	9f86868c-fb1b-4ca7-a4b2-a7f4e76f50b2	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.9+00	2026-03-07 10:27:51.9+00
3c70549d-b386-4162-96cb-d34768fa622f	6d98794e-3da3-4e45-ba0e-845ffc537330	\N	PRIMARY	2025-02-02 13:00:00+00	2025-02-03 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.904+00	2026-03-07 10:27:51.904+00
007b37fb-8ec4-4d46-8cd1-04c3daaed6b1	3641c22f-162c-4e54-b711-91dcc5dcc55b	\N	PRIMARY	2026-02-12 13:00:00+00	2026-02-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.907+00	2026-03-07 10:27:51.907+00
1f0dac4b-c94d-4cc0-94cb-b04be5116aa1	597d56f8-2c60-41b2-b6d8-cd18f95e5821	\N	PRIMARY	2026-12-03 13:00:00+00	2026-12-04 01:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.91+00	2026-03-07 10:27:51.91+00
f196f104-9d64-42d6-a9cd-06539672d3f0	41f6a8d0-5b20-43c9-9b73-cd9a2d007870	\N	PRIMARY	2026-02-11 13:00:00+00	2026-02-11 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.914+00	2026-03-07 10:27:51.914+00
45d0272b-4306-4ea7-8d28-63505e9babca	fe2368a1-1d10-402a-a04e-0a3a23d784c6	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.918+00	2026-03-07 10:27:51.918+00
478613ca-0d47-49ec-9be0-700f3312b670	1bc085be-b70c-42bd-b5b7-31d48c1dfeca	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.922+00	2026-03-07 10:27:51.922+00
ef25b260-7f72-433e-8b42-a495c00011c2	87934dff-b9cc-4020-aa66-1f644f38d6fd	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.925+00	2026-03-07 10:27:51.925+00
b67fda4b-7080-4c46-a50c-f97e75ead817	4c4086e0-4944-4321-a097-07c7981a064a	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.929+00	2026-03-07 10:27:51.929+00
34f93c30-edcc-497c-bd59-da3497803254	c2feb8f2-f79c-4d34-b9fd-77471ee234c0	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.933+00	2026-03-07 10:27:51.933+00
da4a945e-7256-4060-9ac2-30df1e8fc279	aa16e486-e5d6-4af9-a442-76b6d7b078d3	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.937+00	2026-03-07 10:27:51.937+00
463868c4-6e8f-4c7f-8b7a-c582f9f7c3ca	725efcf7-121a-4b32-b076-604da553a955	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-04 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.939+00	2026-03-07 10:27:51.939+00
e4ddc474-7bce-4639-abd0-39d37f2e1616	d5fd44d2-b123-4ac3-9612-57f783e954bd	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.943+00	2026-03-07 10:27:51.943+00
3fce6808-cb7c-47a5-8df8-16d58423ea09	e93d082e-3f48-4dd2-8605-34a09a493ee1	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.946+00	2026-03-07 10:27:51.946+00
a3863949-1703-4d3d-a795-6ca23237e230	a28730d1-c265-447a-9088-d49be9fd6bcb	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.95+00	2026-03-07 10:27:51.95+00
121951bd-4b82-4996-984c-210848b214da	1ef432b2-debe-42c7-acc7-04ad9049213e	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.953+00	2026-03-07 10:27:51.953+00
e4948a77-16e4-419f-9ccc-6cc80695ada6	8c0c6cf7-03ba-43cf-948f-5b2e4b2f157f	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.956+00	2026-03-07 10:27:51.956+00
842a7f8b-efe9-408c-84a2-f65c60f6cea9	0626a40a-afc1-4509-863e-704c038e2196	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.959+00	2026-03-07 10:27:51.959+00
c63e3469-bee3-4f6f-a3a6-ec3647c03bb4	f0969d15-872a-4236-b522-4b515d0c3e05	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.963+00	2026-03-07 10:27:51.963+00
0ab14c5c-3a21-4efc-9980-279411066685	aa085506-d0eb-45ee-b901-a00b8eed9254	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.967+00	2026-03-07 10:27:51.967+00
185dece9-41c2-4fd5-be79-c0ec736953df	820ab12f-8696-455c-a5b7-1d4351f489e0	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.97+00	2026-03-07 10:27:51.97+00
3d56969f-57fb-4253-ab24-3de2a5f640b3	80b543b9-0299-4fb5-bd90-364eb94d9030	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.973+00	2026-03-07 10:27:51.973+00
d3eea834-ecdf-41a7-b22d-0642390f0287	857fd832-109f-4d8d-9e0f-4a700c37fa18	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.976+00	2026-03-07 10:27:51.976+00
d12988f5-07f0-40e4-be04-ad8bff80ce44	3d906fe4-1910-4989-b734-861941ceb79f	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.98+00	2026-03-07 10:27:51.98+00
17cade43-2001-41fb-9374-b320156839dd	44d120ac-0736-483c-aab9-b4cd8437465a	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.982+00	2026-03-07 10:27:51.982+00
9ebe9fad-2339-4a15-aaed-ca4084fc4c6c	2a314ab6-611a-4bc4-a129-5932f8a879fa	\N	PRIMARY	2025-01-13 13:00:00+00	2025-01-13 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.986+00	2026-03-07 10:27:51.986+00
6c95f621-2190-4ca2-8066-35b0b0f120b5	26e632ae-4db6-4484-99a8-005ce36ec164	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.989+00	2026-03-07 10:27:51.989+00
539d2eed-7a29-48f4-80ed-d45a278f54b8	1401503b-4f8e-4bf2-8881-95f1fdfcaa9e	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.993+00	2026-03-07 10:27:51.993+00
2bdd710b-f016-478a-999d-f7784a722778	59580b13-4a0f-46fa-a65d-30785b67f27b	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.996+00	2026-03-07 10:27:51.996+00
74b213fd-d2e0-4b4c-865e-f23ccd5c8f4a	cd9e03ff-05e3-4640-b016-4cd3be7654b4	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:51.999+00	2026-03-07 10:27:51.999+00
8f41bce6-5a1a-47ac-a447-f519376cd036	3e63bd5b-3aef-4a46-a6d1-1fc00a494b72	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.002+00	2026-03-07 10:27:52.002+00
f97fa31d-6305-40fb-8e87-ba68bf9a07fd	7c818df8-16f9-430f-82ed-4d80b351b22b	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.006+00	2026-03-07 10:27:52.006+00
59a23160-a84e-4ad3-8ae8-f109f2e669c2	2b718582-e8ce-499a-b0bd-42cd21f400e0	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.009+00	2026-03-07 10:27:52.009+00
f565a666-7dd8-4fcd-8ed9-9818f7b25663	c293a548-8e7a-474f-963c-3a14e0ccbb88	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.013+00	2026-03-07 10:27:52.013+00
4459f0dc-e650-46eb-94ca-ae4a73cf46a3	01d9bfef-0cf6-469c-99b2-83ce4fec30d7	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.016+00	2026-03-07 10:27:52.016+00
8306f7e4-f249-4a5e-92c2-7627aa385608	192c6a23-577a-4b6e-a335-f6222cefbb25	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.019+00	2026-03-07 10:27:52.019+00
e88ab884-dc40-4943-8c4e-9eb94f739026	78b79ba2-104b-41f0-803c-434a8470b0c6	\N	PRIMARY	2025-01-07 13:00:00+00	2025-01-07 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.022+00	2026-03-07 10:27:52.022+00
ab99cd53-d3fa-4d27-a9b7-b5a0a39c23d1	2fcb93e1-bf50-49dd-adf2-65f73aa8bd04	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.027+00	2026-03-07 10:27:52.027+00
9fc554f7-ea46-4aa1-8602-505208756d43	8279a1ac-22f9-491c-8da4-4af000cdd02c	\N	PRIMARY	2025-01-06 13:00:00+00	2025-01-06 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.03+00	2026-03-07 10:27:52.03+00
7bb74835-390a-4267-b1ea-c495856b291e	38dd0709-37b9-4389-924b-142403ece388	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.034+00	2026-03-07 10:27:52.034+00
42635ebd-0a58-4f20-ad5c-fa099a40993b	5aa3f4db-c11b-436d-8b04-7a033b9efbec	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.037+00	2026-03-07 10:27:52.037+00
1eb1c96c-b43a-4fe1-b48c-729c181b2117	f4825f5c-3c6b-4b2a-9fa2-bc005b30d95a	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.04+00	2026-03-07 10:27:52.04+00
a377f776-7109-4a99-9ae8-a9c1d30c8ee7	854e5a6e-20c9-4afc-817b-fea8cf3f148a	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.044+00	2026-03-07 10:27:52.044+00
b6634fd3-0f3c-4655-bd35-6c831731de6c	f69812a2-b437-4b07-919a-2d9408018c14	\N	PRIMARY	2026-03-04 13:00:00+00	2026-03-04 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.048+00	2026-03-07 10:27:52.048+00
15576e4f-9e82-4bb1-a94a-56f51fcd4cad	7a36f4c0-8258-4160-ad0b-641ad0838510	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.051+00	2026-03-07 10:27:52.051+00
2d3d7202-9642-423e-897a-d2780046294b	d6611819-ed0d-4674-b428-b467f1c5c82f	\N	PRIMARY	2026-02-26 13:00:00+00	2026-02-26 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.054+00	2026-03-07 10:27:52.054+00
4fad9029-3a09-4a0c-8f81-aeb71d586099	ca0e7c9e-bc67-4cb5-8682-5c0b00b1b472	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.058+00	2026-03-07 10:27:52.058+00
3792fb13-1503-4a0f-9f34-4ff3711fa442	0d44635e-a1a6-4802-94b3-e0a92732b056	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.062+00	2026-03-07 10:27:52.062+00
01ea2520-a3e7-420d-9591-1776dac980b5	5998843f-461c-472b-9b60-d8db57d218ab	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.065+00	2026-03-07 10:27:52.065+00
1e3c26b5-75f4-4725-a9fd-bddac1280ff3	19602bbd-33fa-4844-baa9-76a97f3f3e7b	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.069+00	2026-03-07 10:27:52.069+00
ddcc9d6d-0c7d-4e55-98a5-a2da52d5f49f	9c7ab9df-f323-48a3-b849-43447cb20fa9	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.073+00	2026-03-07 10:27:52.073+00
7a511308-4ba3-495d-9ab0-02708e2d58d2	c0cd0e7e-7505-49ad-b7d4-8b42b185baa7	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.077+00	2026-03-07 10:27:52.077+00
7e13d0f2-5aea-4102-bc7e-df63533379d6	16db5066-6227-4b80-b8db-2e7aa4d6adcf	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.08+00	2026-03-07 10:27:52.08+00
47bd658d-5c77-4a1a-a587-4a1aa72a47a7	0f4271c2-a065-4332-bcd1-d659a39654c9	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.083+00	2026-03-07 10:27:52.083+00
ad010921-fc1e-4bd2-9552-9fcb8ac148f6	082bb6de-7370-444f-b285-ba9325c7005f	\N	PRIMARY	2026-02-24 13:00:00+00	2026-02-24 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.087+00	2026-03-07 10:27:52.087+00
b9653891-cf17-4467-956d-487f5acea3f7	2872b836-8b2b-4919-bb11-d4cdc9d780c4	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.091+00	2026-03-07 10:27:52.091+00
a2aaedfa-2452-4960-9b47-39d25f7d6ddb	e5e97c4d-0ddf-4663-94f8-52653a837181	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.094+00	2026-03-07 10:27:52.094+00
0ad6d907-f429-44e0-802d-9d9ed58a0d2c	f2a04f3c-3531-400d-8214-6c44d2e46209	\N	PRIMARY	2025-02-19 13:00:00+00	2025-02-19 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.097+00	2026-03-07 10:27:52.097+00
f5756189-5408-4b96-9fd9-0225c1cf7c2d	2aac27c5-bd20-4513-a7fa-570d226bc4e1	\N	PRIMARY	2026-02-19 13:00:00+00	2026-02-19 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.1+00	2026-03-07 10:27:52.1+00
3aba13e5-13bc-4594-8d3e-aa4ebf1408bd	4798746d-b5d4-4e22-8243-573d80cb15e0	\N	PRIMARY	2025-02-18 13:00:00+00	2025-02-19 01:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.104+00	2026-03-07 10:27:52.104+00
8f4d1826-3b06-446a-9bb2-e52c1ef8c0cc	cef6495d-4374-46c0-929e-2eb051491bf8	\N	PRIMARY	2026-02-18 13:00:00+00	2026-02-18 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.109+00	2026-03-07 10:27:52.109+00
de0df834-5eeb-4c2f-85c2-6cb6ccda7b98	337ba543-9639-492f-afe2-023df8f5f9ac	\N	PRIMARY	2026-02-18 13:00:00+00	2026-02-18 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.113+00	2026-03-07 10:27:52.113+00
77122447-9bbb-444b-978d-eeb5d25e12e0	f9af2abe-1b9b-4de7-9f02-7f5b05f616a3	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.118+00	2026-03-07 10:27:52.118+00
cc6a2d3c-0f34-473f-81a6-dbe2fd10ba50	b0173bc4-acfe-4ee5-9f93-9edb0c7d1f1b	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.121+00	2026-03-07 10:27:52.121+00
407d82b0-33bd-41ca-a7d0-ebad405f74f0	595a72ec-6a86-4e40-9726-126bb29d2639	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.125+00	2026-03-07 10:27:52.125+00
71a65f9e-16a9-4c4a-bd51-e36a73fc8887	754623a6-ac62-4895-9c76-3ccbf1ebaa82	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.128+00	2026-03-07 10:27:52.128+00
37455307-cbc4-4603-87d9-64ce11813731	1dadf426-136d-4370-8cd8-c2eb63ce1b6f	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.132+00	2026-03-07 10:27:52.132+00
65c56787-bfbb-4bd4-830e-0fe24359ceff	c78263a9-04a9-498a-8135-a59b76d231b2	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.136+00	2026-03-07 10:27:52.136+00
a57210cb-417d-4dd8-a4bf-b0d77d630e22	8e5b4590-6e45-44f0-8d4f-c67e9b1fcada	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.139+00	2026-03-07 10:27:52.139+00
f08af1f2-7995-46f7-a156-ca406c77bc7b	46f5eb47-4e7b-4f66-92b0-0ae7668008d6	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.143+00	2026-03-07 10:27:52.143+00
fe4fe192-151f-4308-bc1a-360c9330ba2a	c06be992-3fe9-4d1a-b279-27ea87ea6a60	\N	PRIMARY	2026-02-12 13:00:00+00	2026-02-12 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.146+00	2026-03-07 10:27:52.146+00
e9a49801-3168-4640-bf19-f647051fe0b9	edc8fa99-598c-498e-a408-cd0e01d1cd6c	\N	PRIMARY	2026-02-12 13:00:00+00	2026-02-12 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.15+00	2026-03-07 10:27:52.15+00
903ad51b-fb06-48f8-a9e9-e430224c1b63	914456d5-5b1b-47e0-a5af-2897a8a8353b	\N	PRIMARY	2026-02-10 13:00:00+00	2026-02-10 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.153+00	2026-03-07 10:27:52.153+00
5aacd791-7484-4cb9-90d2-102af61196ed	19e1ec00-e4e4-49ec-9eb7-9fc6e50b1a77	\N	PRIMARY	2026-02-10 13:00:00+00	2026-02-10 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.157+00	2026-03-07 10:27:52.157+00
bd73d93c-df4a-4414-b32d-335f49f4edf2	563eddf4-e323-4f43-abb3-31156609b17d	\N	PRIMARY	2026-02-10 13:00:00+00	2026-02-10 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.16+00	2026-03-07 10:27:52.16+00
5a60a65d-579f-4ce2-931e-cb4cbfe5f931	aebea9e8-6069-40f9-a05b-a12a703c36a3	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.164+00	2026-03-07 10:27:52.164+00
3766985f-0cd2-4fd7-b31d-7d9bcaf89f04	cbd71ac6-f668-454e-b8ce-c22d5067e47c	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.167+00	2026-03-07 10:27:52.167+00
ce436f4e-d4e0-4979-a316-76dda92312b7	f687f701-102f-4082-8cbb-7af5c4e18a70	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.17+00	2026-03-07 10:27:52.17+00
4302ed36-b0cb-4c06-84a9-e5eec1b15fab	1365d323-3e33-4db4-831a-e64eff2ca286	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.174+00	2026-03-07 10:27:52.174+00
d5f44970-e09d-47f8-b595-370f77420b19	3d04ce09-2b8f-4b16-a95d-c057dc73c77d	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 14:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.177+00	2026-03-07 10:27:52.177+00
507e6995-2c76-4077-b108-f043b6eec7c0	6d581fa3-0f4d-43d2-98ef-17e35847d3aa	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.18+00	2026-03-07 10:27:52.18+00
3f54d079-68a8-41fa-b980-f22e09d36f0c	7ff3fe5d-4e87-4b4e-9387-b14ee9f11bd3	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.183+00	2026-03-07 10:27:52.183+00
da1b1bbe-f400-436c-bebb-4c11a67cfa1e	8c6d27f7-561e-48b8-af40-a318d919c2c4	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.187+00	2026-03-07 10:27:52.187+00
d9f2b65a-827f-4c5c-b5f2-7783e6710309	5fbb3532-08e1-4d20-9543-d2ede1ecfe68	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.19+00	2026-03-07 10:27:52.19+00
99407311-e656-464a-b75a-96c119e81060	c7f0ed1f-57f0-41be-8862-ab8bca093cdf	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.194+00	2026-03-07 10:27:52.194+00
c6ffb157-5600-4fb8-8d78-1737a94296f1	53c76dba-b5c1-424c-b9ac-65cd04170cd2	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.199+00	2026-03-07 10:27:52.199+00
eac9e69e-48c4-42a9-9425-bb5fde8f17d3	05dcc169-8e78-4aca-a510-2c2d8d783397	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.203+00	2026-03-07 10:27:52.203+00
eab1f7b2-781a-4aaf-b75a-1ed9cc20be3b	c54f3e77-f7e9-4a9c-b71a-deb8845e3f99	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.207+00	2026-03-07 10:27:52.207+00
14d704ab-a6c1-4d49-aea4-11b44ef706a9	8be93c77-c8c5-4ed1-aa27-4ede31b1fd6a	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.211+00	2026-03-07 10:27:52.211+00
ab4cc0f2-48ce-4245-bec9-378b5b739f9c	006c8ba4-7faf-4577-bbeb-738e7e143ce1	\N	PRIMARY	2025-02-04 13:00:00+00	2025-02-05 01:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.214+00	2026-03-07 10:27:52.214+00
2f38571e-2c75-4067-b2f7-2fdbd835658e	cd79fbe1-24f1-414a-87de-15cd3c9c66a5	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.218+00	2026-03-07 10:27:52.218+00
0bbd2ff4-1d7a-4c03-b637-285d7990af9c	a723d96a-50c2-477e-8750-bd7127aaf71e	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.221+00	2026-03-07 10:27:52.221+00
227d4e54-bc08-4cb1-85d4-1652e6a326db	335bc3c1-86ee-42cf-ba91-0b140b8aa11b	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.224+00	2026-03-07 10:27:52.224+00
6997e601-8053-48b9-9f2d-332810f21e3b	d6f77a26-5ebc-4e7f-83ed-227bc1056655	\N	PRIMARY	2026-02-04 13:00:00+00	2026-02-04 19:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.228+00	2026-03-07 10:27:52.228+00
082f47e5-3cb5-45a8-96ac-76afea31721a	f391d58f-e53d-40ef-92c5-841a9463e563	\N	PRIMARY	2026-02-03 13:00:00+00	2026-02-03 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.231+00	2026-03-07 10:27:52.231+00
663f2115-b706-42bc-b77f-54e0e72f14e9	dd9a4a90-8fc2-4036-9eaf-ea181bdaf033	\N	PRIMARY	2025-02-02 13:00:00+00	2025-02-03 01:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.234+00	2026-03-07 10:27:52.234+00
bbe2a771-3f74-4a53-9d3f-54d00984d2e7	1e2762c8-fb4f-453c-a907-fa819a1e02cc	\N	PRIMARY	2025-01-29 13:00:00+00	2025-01-29 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.238+00	2026-03-07 10:27:52.238+00
5705f43b-8414-402e-8ed0-6dfba9aab33c	8614c8f0-66cb-4494-a6c7-a3aab8b9ce02	\N	PRIMARY	2026-01-29 13:00:00+00	2026-01-29 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.243+00	2026-03-07 10:27:52.243+00
3f6973d5-2a8c-4c96-98fa-6f468e0a0888	65748699-230d-4774-bebf-9a65a748f270	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.248+00	2026-03-07 10:27:52.248+00
be7a0f87-9ed9-4577-b411-b47a958ee17e	383f505b-0be9-46e9-bb2c-b5bd60d48b83	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.251+00	2026-03-07 10:27:52.251+00
7f038679-21ef-479d-88f0-df9b18934569	3665d925-a8fe-4975-a4b6-979b1282bccd	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.255+00	2026-03-07 10:27:52.255+00
79bb2d2f-1fbd-4278-81eb-7f0c354de58b	d391463d-38a4-4f00-84eb-09c3e2026db9	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.259+00	2026-03-07 10:27:52.259+00
9dc486a0-9fb8-4ee6-93e7-ce5142bb6f75	6e54579a-82d7-4551-aae2-772f6f9017bd	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.262+00	2026-03-07 10:27:52.262+00
3d3e4e2d-dba8-4ba6-9be4-cc4ffc7eabfc	2f915f8b-001d-47d0-8aec-92a130e51575	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.266+00	2026-03-07 10:27:52.266+00
c35b2f0b-2159-43c1-b87d-f267e4847e8d	b6c93668-58c2-4b06-b509-157276986a28	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.27+00	2026-03-07 10:27:52.27+00
ab074af0-f638-48a4-bc9a-ff0aced350bf	9f25db70-c806-4864-b94a-8f7015241cf8	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.274+00	2026-03-07 10:27:52.274+00
a1dda1ef-baa8-415d-ab35-f5ebf79a394a	6865295b-1eab-402d-b100-3e53c72ff430	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.278+00	2026-03-07 10:27:52.278+00
268cc08c-45e6-4f2b-991b-26f0b81c39c3	be96ba6d-a6de-4ce5-a941-d545eed9b462	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.281+00	2026-03-07 10:27:52.281+00
3a9f02a0-e6a4-4a02-8ded-16aa1d37a481	9e1487fe-305b-4cae-9afe-a7b42b6f9988	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.285+00	2026-03-07 10:27:52.285+00
976acc91-0e78-4584-b706-f7088511b224	029563ec-ff56-4ef6-a824-f5b533b7ae99	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.289+00	2026-03-07 10:27:52.289+00
0cdfa143-82d0-43b7-a102-97142cc5e5fc	178a0b12-6f3b-40c7-b0c5-c3acdb80b98e	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.293+00	2026-03-07 10:27:52.293+00
678aa6d4-c55e-4ed9-8e89-69bddfac94aa	e163f182-dc2b-4fca-ab24-4b88b50e035a	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.296+00	2026-03-07 10:27:52.296+00
6df1cfd1-19f4-4643-939f-ac308e8492dd	13a599d9-d056-44b9-8287-f099eadc3ab7	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.3+00	2026-03-07 10:27:52.3+00
014e7b40-1d99-43e5-b6bd-9a2405b4b796	8aa24e80-fd6b-45f7-a7cd-f94bb4c5cda6	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.303+00	2026-03-07 10:27:52.303+00
78e9e85e-846a-4161-87b7-f8f4df5f6c71	674b23d6-d9aa-4107-86df-29281671dd98	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.307+00	2026-03-07 10:27:52.307+00
de17370b-4820-41fb-89eb-2426e3fca704	47970bfc-b219-4a12-915d-6d501c4c4020	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.311+00	2026-03-07 10:27:52.311+00
c0f16d60-99af-4373-889e-271ff7887416	f9b1050c-58ad-490f-b65d-58b99c1bd544	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.314+00	2026-03-07 10:27:52.314+00
798115e7-2be7-4458-839a-3ee0eabcce4b	61a97d88-6057-40d8-bf50-02f756a71dad	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.318+00	2026-03-07 10:27:52.318+00
3d815051-0dac-4871-89eb-69d9d9d407ed	618d415f-6b34-403e-9783-7db8aff1d991	\N	PRIMARY	2025-01-21 13:00:00+00	2025-01-21 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.321+00	2026-03-07 10:27:52.321+00
f5ab7453-2c89-457b-b62b-d814734be8c5	7240b024-38ef-406c-9a6b-df92ba475cb1	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.325+00	2026-03-07 10:27:52.325+00
28424bff-6f8d-429c-b00c-58a20efa218e	3ed45345-07d5-423b-8fee-060e06cf7a90	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.328+00	2026-03-07 10:27:52.328+00
cd6309b0-276f-4b0a-9c1f-579ae60257c6	aa6cb667-14dc-4f10-abfd-7a285c9fff18	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.331+00	2026-03-07 10:27:52.331+00
59b31157-ead9-420a-a940-330d23a1d753	ba14933b-1659-4c61-bb75-c9333e4dc659	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.334+00	2026-03-07 10:27:52.334+00
489a8e14-c1fd-44c5-9ea5-502f9bc2ed5b	4cd95b3b-585c-4227-9963-405580adf7a6	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.337+00	2026-03-07 10:27:52.337+00
a5e5e9a2-c1d5-4d24-881d-dcba63c6d729	a67e3310-787f-425f-ba05-dbb5ec1b7aba	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.341+00	2026-03-07 10:27:52.341+00
9b57a374-7a82-4094-a81f-0a2fa17cec29	9ccdc34c-4bba-4e9f-9a19-4049426ad507	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.344+00	2026-03-07 10:27:52.344+00
46949a0e-64be-4655-b025-bfd76b1ab1a4	33c4ca0b-5c82-470f-8d79-a6f9c7bf4dcb	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.348+00	2026-03-07 10:27:52.348+00
f7ef08b4-79f7-44dd-8abe-0ab1353b1a44	10b1ecf4-e2ab-4956-83dc-0c17784053f4	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.351+00	2026-03-07 10:27:52.351+00
38532449-5f67-45eb-91f2-af8840b4259a	17b94ce4-e5ec-47a8-bdc9-9e17a118f16d	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.355+00	2026-03-07 10:27:52.355+00
c0636776-ac39-4638-ada9-be6393218a55	daefde6b-1342-4ce3-987f-342078fe0deb	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.358+00	2026-03-07 10:27:52.358+00
53d708fd-15a2-47a6-9b4f-1a7eac9965c0	a0417779-3255-4fb9-b829-846bddca62dd	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.361+00	2026-03-07 10:27:52.361+00
20f8be62-9da1-4a9c-8de7-3cb29971b9fb	d005d3f0-f364-4ab6-9bac-ec7aa0a5cd9f	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.365+00	2026-03-07 10:27:52.365+00
98c48a47-24f0-4a30-95b4-06aa71df5031	0c194a00-9a7e-499e-b6dc-c6a88542ad29	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.369+00	2026-03-07 10:27:52.369+00
53aaefae-b9f4-449f-a54a-5089ec1b7982	b92d2d25-9645-4af1-9150-05f93f06e44c	\N	PRIMARY	2026-01-16 13:00:00+00	2026-01-16 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.372+00	2026-03-07 10:27:52.372+00
1c608174-fdda-4bcb-92ca-120639117f20	f1d7d301-0c75-4833-98b2-28e81bacc74c	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.375+00	2026-03-07 10:27:52.375+00
b7294fd6-98a1-4d99-b553-0e9d5541dfef	dab9527d-26a1-42dd-8d5f-b6efe126eb1c	\N	PRIMARY	2025-01-14 13:00:00+00	2025-01-15 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.379+00	2026-03-07 10:27:52.379+00
f6312c9a-3712-45fd-9a5a-1f1cbbc3222c	c6364219-f12d-4104-b44a-43c402ddee39	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.382+00	2026-03-07 10:27:52.382+00
a3339a65-372e-4453-b811-e8bb04fe4efe	89e45cd2-2766-4c6c-9f69-0791629ba98b	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.386+00	2026-03-07 10:27:52.386+00
3878fab1-6671-404c-b600-9b4932b12ecb	da1483c2-a70b-42a5-8a4d-10dfe549f629	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.39+00	2026-03-07 10:27:52.39+00
e39adfc6-0b64-4460-a716-c2e27e4b148b	c56b53c2-090a-47da-9e3d-5ad1c1173d27	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.393+00	2026-03-07 10:27:52.393+00
5c99ff00-4285-414c-b626-1f438b55c972	7e6ad1fa-66ea-40d2-a7f3-ccb4e5d2b05d	\N	PRIMARY	2025-01-13 13:00:00+00	2025-01-13 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.397+00	2026-03-07 10:27:52.397+00
f4c7c061-9653-4aa3-a0a3-ec8cc2d9ed99	e88e58ee-c457-4103-892c-bc230f82c866	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.4+00	2026-03-07 10:27:52.4+00
cdf4cacb-51b5-44b7-81ff-33ae3286afde	957bb1cf-cc2b-4891-b696-77e209a81781	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.404+00	2026-03-07 10:27:52.404+00
c3618325-9743-4677-9619-a60a15cbac70	c0338239-c23f-402b-883b-e66671e47be4	\N	PRIMARY	2025-01-13 13:00:00+00	2025-01-13 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.408+00	2026-03-07 10:27:52.408+00
0558cca7-dbc2-476a-8938-c7b7c3ec2a82	76f1e5fe-2eb4-4934-9117-472a559cd398	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.411+00	2026-03-07 10:27:52.411+00
a498d1f1-7d4e-441c-b091-945d12434db5	96816a3f-466f-4118-8065-0948d5ab935d	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.415+00	2026-03-07 10:27:52.415+00
eddc62ee-f7c7-4d8b-b642-91712fdd373d	df10e84f-40d3-437e-a5f1-59edb735c4c3	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.419+00	2026-03-07 10:27:52.419+00
14086158-992e-45ff-a92a-431450df6351	d434f37c-14e6-4cd4-8eb2-b37f34b6bf20	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.422+00	2026-03-07 10:27:52.422+00
9e2a43ef-c54b-4188-b936-e89eabd34f90	fef915d9-ac3a-473c-baae-ed0c9baa134b	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.426+00	2026-03-07 10:27:52.426+00
ba37453e-ce24-472f-bf97-f09bdc25e9ed	b3dd5d9f-c478-4014-a3c0-256356b07435	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.43+00	2026-03-07 10:27:52.43+00
89a42e3f-d352-42a4-8411-d09a3075bf30	7254ffa3-31e5-47b0-ac03-1bff359bfb8f	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.434+00	2026-03-07 10:27:52.434+00
b838aa37-c30b-4211-a66b-5e4e32c37e14	cf551fd2-1e23-433e-8d2c-4eb47b130f53	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.437+00	2026-03-07 10:27:52.437+00
5e82b92d-ac22-4c79-989b-d97d4cf5456c	422b1304-0ff4-4a01-aa33-26c6b36a6ccb	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.44+00	2026-03-07 10:27:52.44+00
1c6d31b8-3ee0-48dd-b99c-5018ccb82de5	250d0be4-c759-41bf-bc41-0e5dc9899f6c	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.444+00	2026-03-07 10:27:52.444+00
5e479f39-4b41-421f-8a38-ac42535622b4	ccf5cabc-b476-4a61-b227-2af7d9757120	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.447+00	2026-03-07 10:27:52.447+00
12eca409-cde6-498b-9236-f30f2cd2afc2	d8cc524e-bbea-4e83-bf0e-d940c7a442e4	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.451+00	2026-03-07 10:27:52.451+00
f11ed687-49dc-44c7-835b-27edd612c401	3a91da24-7112-4a59-b6cf-5dffe57831ec	\N	PRIMARY	2025-01-07 13:00:00+00	2025-01-08 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.454+00	2026-03-07 10:27:52.454+00
6bc7c0a8-ff22-4fde-8ba2-cc81e2621043	af25baf3-1716-4402-b4c0-478d37b3e19c	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.457+00	2026-03-07 10:27:52.457+00
bcf57acf-c980-48e1-8f8f-7a7e310e2c0d	2863b265-b191-40e4-acfa-390576a2a0b6	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.46+00	2026-03-07 10:27:52.46+00
37ef8895-2b41-411d-a860-1486367399c4	522aa8d9-602c-4161-9732-aa2754eb4ce6	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.464+00	2026-03-07 10:27:52.464+00
f2ac34a7-1be5-428a-97df-dbd769f7bfbf	e2f48c25-dd95-456b-abb9-b1136565cc1f	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.467+00	2026-03-07 10:27:52.467+00
79ac9089-e7cf-4b13-884a-48f070f84606	6b716bd0-54f4-4add-8321-ac220f70d868	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.47+00	2026-03-07 10:27:52.47+00
1416d9f2-4f9c-4b19-bd56-d6cf55e793a8	0bb6e009-c408-472c-a9de-c9591f8bb31a	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.473+00	2026-03-07 10:27:52.473+00
178e6302-50c8-4883-8eed-484206bb0a8c	120d8b60-30a4-4b7e-9c45-769a877731b3	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.477+00	2026-03-07 10:27:52.477+00
98e27e19-8396-4814-9c17-bc1203ee784c	403a1ca1-33ad-4adc-89d6-4e90ba4725f8	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.48+00	2026-03-07 10:27:52.48+00
77e4f415-ba1a-4da7-ada0-f40a26992bb1	d75a506d-9454-4b6a-b36c-3168e1b8b3be	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.483+00	2026-03-07 10:27:52.483+00
b8225768-165e-4e3f-b488-332a4f16af26	49ea9612-b5db-45bc-94ee-0a97371d76d9	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.487+00	2026-03-07 10:27:52.487+00
27064257-76fe-40ef-bb47-0abdc4401770	08de227b-12db-4e96-af95-74aec735c36a	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 20:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.49+00	2026-03-07 10:27:52.49+00
98955cd5-ac3c-4ae2-8140-77a0bea8eba4	84129197-81cf-40a7-a923-d64da4859a60	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.494+00	2026-03-07 10:27:52.494+00
c0ef751c-95ff-4f47-afa5-cfc0d1e7c2bc	daccacc5-29ca-4e96-a4b9-aee4ea882a7e	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.497+00	2026-03-07 10:27:52.497+00
70fced57-51d5-4aa6-b998-1f27b58645dd	b1d16879-bf33-4419-b14f-8cdb3918a66d	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.5+00	2026-03-07 10:27:52.5+00
eca30ecf-2ada-4a87-9371-a642b5e7323e	6e312c01-0ff9-43ad-98ae-6d515b2e2673	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.503+00	2026-03-07 10:27:52.503+00
136c06f3-e261-4ce0-a8e2-83b4f3450ae3	4505a435-54ed-4568-8f10-f4bdc18a84ce	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.507+00	2026-03-07 10:27:52.507+00
fd9619c3-5b78-4e74-86f7-fbc579a10f5e	315d6584-25c6-4fca-9897-fa48645695e2	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.51+00	2026-03-07 10:27:52.51+00
7a76e3e9-c31c-4155-85e2-b9ebdc3f55a2	991bfdba-6a78-41b1-a8c1-cb9ca05ac527	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.514+00	2026-03-07 10:27:52.514+00
bd4f647d-bf98-42a6-a1c3-a46c43c79983	6bfedd2c-4e31-4a8e-9bd3-7c70b5c66e96	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.517+00	2026-03-07 10:27:52.517+00
21a19cdb-ad84-4470-8004-66e6987499fb	fc03df9d-075c-4969-9089-2c51d840ca24	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.52+00	2026-03-07 10:27:52.52+00
51f451ba-652b-410c-a10f-c1741eb3256b	323ebcfc-9265-44bd-b0a5-4d3148323a03	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.524+00	2026-03-07 10:27:52.524+00
6fd66e86-81c6-4dfe-a879-12690c902e65	2b5df767-15cd-49b6-b3b2-76a7c39767b8	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.528+00	2026-03-07 10:27:52.528+00
f79018a8-075d-4c9b-899c-60e98ad75de2	73678417-c2e5-4f26-b52c-42436ef11d87	\N	PRIMARY	2025-02-05 13:00:00+00	2025-02-05 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.531+00	2026-03-07 10:27:52.531+00
7abbf042-d4c4-4a27-833b-fc6b00becd41	54bfe4f1-d885-4320-ac48-cf4ce4263bb9	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.535+00	2026-03-07 10:27:52.535+00
acc523b8-c600-4c82-a91e-26e0a5d5c5fe	43e3a1c4-2677-4215-98cb-d0e60a790b09	\N	PRIMARY	2026-01-23 13:00:00+00	2026-01-23 13:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.538+00	2026-03-07 10:27:52.538+00
7f410c01-6b16-4495-b6ca-01b3c2d844de	26b2a1a8-d85f-4e6d-a632-2754893aa4a8	\N	PRIMARY	2026-09-19 12:00:00+00	2026-09-19 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.542+00	2026-03-07 10:27:52.542+00
188fa95e-418b-4bd9-90ff-7bc1d9352f75	9d3559b2-7e83-4f6e-a065-737271a4458e	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 14:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.545+00	2026-03-07 10:27:52.545+00
a87fbd99-89e4-4470-8636-f0e262ae4afb	2c6735a3-2ecc-4306-a3cb-0d0406fbd975	\N	PRIMARY	2025-01-14 13:00:00+00	2025-01-14 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.549+00	2026-03-07 10:27:52.549+00
b178bc44-c0b5-430e-a415-aef6e26b2db5	dec73ca0-098e-4595-9907-c89fc774748c	\N	PRIMARY	2025-01-14 13:00:00+00	2025-01-14 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.552+00	2026-03-07 10:27:52.552+00
3c901f27-ac48-4f43-91b7-92d9c96544ca	de594ad2-98d0-43ff-8860-4282b9afa951	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-10 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.555+00	2026-03-07 10:27:52.555+00
79c4fbd6-fb9d-409a-9d9d-bbde6c85af78	33e559f7-a616-4e70-9af3-87c0bb331e2c	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-10 04:59:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.559+00	2026-03-07 10:27:52.559+00
c220d5a4-c854-4972-8320-2c6b7f7d6d52	2b9ead83-fe5f-435a-91b0-bcc6a49f5819	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 14:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.562+00	2026-03-07 10:27:52.562+00
cecc38e2-f21e-4d6e-bc38-fb75e46760a4	29aca8a4-1713-4928-9a88-83b1ad4c0f8f	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.566+00	2026-03-07 10:27:52.566+00
4a32882b-680f-45b0-af49-bbb0ea93bc56	b1c3866a-cb34-423a-acc3-ff9095ae181c	\N	PRIMARY	2026-01-03 13:00:00+00	2026-01-03 14:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.57+00	2026-03-07 10:27:52.57+00
27ac2b10-59ae-4160-ab90-f8be8b5c6320	941ab667-1008-4080-8443-8b5f82fe593a	\N	PRIMARY	2026-02-25 13:00:00+00	2026-02-25 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.574+00	2026-03-07 10:27:52.574+00
d996a2c7-7a6e-4e63-ada8-a7cb3b1106db	25c25004-1321-4ff1-97da-cba342163cc3	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.577+00	2026-03-07 10:27:52.577+00
b761df1a-0f64-4e8f-9a34-8b4edd169925	10e9c145-a789-43f9-b4d5-c564c3860c0c	\N	PRIMARY	2026-02-17 13:00:00+00	2026-02-17 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.58+00	2026-03-07 10:27:52.58+00
85b6b7a3-6683-4185-84be-b871b1284921	13fb622f-224f-4905-95e3-f9b5b8efcd5d	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.584+00	2026-03-07 10:27:52.584+00
f4c0471d-21c6-4e3b-98ea-79c45678cf34	a402d7d9-3933-43c3-8c8d-b9284d60d7f5	\N	PRIMARY	2026-02-16 13:00:00+00	2026-02-16 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.588+00	2026-03-07 10:27:52.588+00
99cbe60b-171d-4842-962c-db11b212f343	e887949f-0233-4e89-9d20-72093084ce78	\N	PRIMARY	2026-02-12 13:00:00+00	2026-02-12 18:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.591+00	2026-03-07 10:27:52.591+00
8bc8cdfa-caa9-4f45-be02-448c26d91cb1	553c0fad-e066-47e0-8ae4-d510d10818b5	\N	PRIMARY	2026-02-11 13:00:00+00	2026-02-11 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.594+00	2026-03-07 10:27:52.594+00
44720b75-cc17-479d-8db0-c0bb7e2a2e8b	bf117f65-a690-4afc-b93f-9f7cd13bb514	\N	PRIMARY	2026-02-11 13:00:00+00	2026-02-11 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.598+00	2026-03-07 10:27:52.598+00
323266ae-dbc9-47cc-b5bc-7a3e9e0bf598	6ce07b9c-e573-47bd-95a9-6d3ee2de8026	\N	PRIMARY	2026-02-10 13:00:00+00	2026-02-10 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.601+00	2026-03-07 10:27:52.601+00
1baf70a9-e601-4eaf-8c6a-7549ac4bfe86	fcef7146-74bb-477d-af59-993d4a0047af	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.605+00	2026-03-07 10:27:52.605+00
e4890101-2730-437d-b27c-0805a46750e6	96a29eeb-a492-47e5-b8b9-3b3b94a85aea	\N	PRIMARY	2026-02-09 13:00:00+00	2026-02-09 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.608+00	2026-03-07 10:27:52.608+00
03db7751-8ce4-458f-b0fb-ea907cdce075	70fa7155-bbb1-4fa5-bc61-1c29688b3442	\N	PRIMARY	2026-02-05 13:00:00+00	2026-02-05 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.611+00	2026-03-07 10:27:52.611+00
59838e83-dd5e-4768-9c30-c847ff3a6f7b	b11aaab6-56c7-4993-8f30-58414235602e	\N	PRIMARY	2025-02-04 13:00:00+00	2025-02-04 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.615+00	2026-03-07 10:27:52.615+00
ffbf3d39-080b-40a8-ad37-b73d726cb4cc	29343dc6-983b-4674-9816-f25576b98f14	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 14:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.619+00	2026-03-07 10:27:52.619+00
12f14100-8daa-4527-a63e-5b0a0fc47131	92a19db8-11b2-47e0-b80c-44162365bd3f	\N	PRIMARY	2026-02-02 13:00:00+00	2026-02-02 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.623+00	2026-03-07 10:27:52.623+00
876be62c-3daf-4433-b544-f34e43f05a36	77692f70-0b29-44e7-b2e8-421ec338837f	\N	PRIMARY	2026-01-29 13:00:00+00	2026-01-29 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.626+00	2026-03-07 10:27:52.626+00
eca8bc79-64b7-4d41-af6e-e4593f72b015	f4017003-65d0-4970-a5bb-ce27d0ad71b1	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.63+00	2026-03-07 10:27:52.63+00
52abf86f-7954-4f9c-aaa9-0082c90b96b4	f5771656-c573-4ac0-88e6-a8d13cbcba79	\N	PRIMARY	2026-01-28 13:00:00+00	2026-01-28 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.634+00	2026-03-07 10:27:52.634+00
7012d7aa-3e68-4a5f-b0d8-cfb2f30b39c4	3920157d-dfd3-4ce3-baaa-6762edd4a3f0	\N	PRIMARY	2026-01-22 13:00:00+00	2026-01-22 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.637+00	2026-03-07 10:27:52.637+00
e8a2d646-01f5-4b06-ad11-8087e8beb1be	659172c4-9181-42a1-84fd-1f3ceba9661f	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.641+00	2026-03-07 10:27:52.641+00
7502be31-7881-48ea-9bf7-cd2bf0b0c3c5	2ac8650f-0ab1-49ac-a1cb-17e0e8bd97e3	\N	PRIMARY	2026-01-21 13:00:00+00	2026-01-21 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.644+00	2026-03-07 10:27:52.644+00
6baf9f4a-2571-4c40-9e19-620e80095458	05360a89-bc2c-44c0-ac20-de6b9bd264da	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 15:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.648+00	2026-03-07 10:27:52.648+00
5f5ed68f-d7d4-428d-8482-15f513a846dd	af987815-6e40-4f80-9a7a-f3a566e928e8	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.651+00	2026-03-07 10:27:52.651+00
df6d092b-6a8b-4aca-a66f-741f8f20b9b4	7a02bbb9-81ee-4bbe-9d03-732a8e31300b	\N	PRIMARY	2026-01-20 13:00:00+00	2026-01-20 15:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.654+00	2026-03-07 10:27:52.654+00
4a13defa-31c6-4ac1-a83f-beccd840f531	7cd9150e-bc10-41be-bddb-b19b487227bf	\N	PRIMARY	2026-01-15 13:00:00+00	2026-01-15 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.658+00	2026-03-07 10:27:52.658+00
0c8b26b1-e680-4039-badd-ed2cc6ac8988	ccbd8dc1-a8d2-4e89-9613-d6bd7cf51d62	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 16:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.661+00	2026-03-07 10:27:52.661+00
aae220c9-61e5-4f19-a57a-4aa2957070b2	a0a09b5c-474b-432a-8a55-660b3e7769b9	\N	PRIMARY	2026-01-14 13:00:00+00	2026-01-14 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.665+00	2026-03-07 10:27:52.665+00
aaddecdc-2537-49f3-b6bd-41904dc57b98	1f00affe-5163-4701-949c-cfc84ab51f93	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.669+00	2026-03-07 10:27:52.669+00
37f99b85-f151-4495-858f-7a666f94b570	b9ef6986-e8c2-40d5-954d-1dcf0aa64067	\N	PRIMARY	2026-01-13 13:00:00+00	2026-01-13 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.672+00	2026-03-07 10:27:52.672+00
a381eecd-535d-4210-b5a0-812b0a0cf3ea	98e4fc51-d9ae-4b30-aee7-5da8628183ed	\N	PRIMARY	2026-01-09 13:00:00+00	2026-01-09 17:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.676+00	2026-03-07 10:27:52.676+00
38dfda9e-681e-4e33-a352-ed96abd63da5	2ecf880c-291a-4b0d-b4c8-1fb549f3583d	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.68+00	2026-03-07 10:27:52.68+00
90ebcc67-4408-4402-b579-aa4da16f94a3	84d953f6-8788-4c33-b67b-dcfd4cdad6ef	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.683+00	2026-03-07 10:27:52.683+00
19704eeb-2e22-43a8-a0d3-467b604d40b0	d4f31002-2922-440c-8102-ce35868113c2	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 18:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.686+00	2026-03-07 10:27:52.686+00
7343be5a-f257-42df-adf8-ec484ab0137f	82ad91a1-b5f4-40a9-8e69-aa66b87ce282	\N	PRIMARY	2026-01-12 13:00:00+00	2026-01-12 16:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.689+00	2026-03-07 10:27:52.689+00
a137c432-0bc9-4932-be36-bed282f6e1d4	30d00e6e-5dbe-4727-8a0d-419a664d6d68	\N	PRIMARY	2026-01-08 13:00:00+00	2026-01-08 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.693+00	2026-03-07 10:27:52.693+00
15c6ff6a-7f15-4ae6-a7a3-6b00225e4927	fbd3c22f-3dff-4a0d-b9e3-f5108dea50b0	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 19:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.697+00	2026-03-07 10:27:52.697+00
590b10ed-5fcc-4450-9000-24cdb2224a27	e9d0af2a-a05a-409f-90c0-0279bd8f3c64	\N	PRIMARY	2026-01-07 13:00:00+00	2026-01-07 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.701+00	2026-03-07 10:27:52.701+00
6838e1ba-d8d7-4d82-b96b-0357ede1369e	cc2abe94-1c13-43ec-abbe-420d258b0594	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.704+00	2026-03-07 10:27:52.704+00
a8c539ed-4f7e-45b3-854e-6320e29a3f9c	3bf5eac3-2aea-4817-b8cf-af9883e295da	\N	PRIMARY	2026-01-06 13:00:00+00	2026-01-06 15:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.708+00	2026-03-07 10:27:52.708+00
f13b78a3-8b1a-40e3-aecd-e3ce1555881d	8eb5f73e-d445-434d-9f70-8ed21d96fbc1	\N	PRIMARY	2026-01-05 13:00:00+00	2026-01-05 18:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.712+00	2026-03-07 10:27:52.712+00
138db967-c489-4b42-9f27-1566c3d428dd	6b9ce631-68aa-44a3-b5bc-a7f06249c8de	\N	PRIMARY	2025-01-05 13:00:00+00	2025-01-05 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.716+00	2026-03-07 10:27:52.716+00
1d06b0c7-d06b-4f37-aae9-e54a1644194b	ee201fcd-213f-4d08-87f3-4330824084c4	\N	PRIMARY	2026-01-02 13:00:00+00	2026-01-02 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.719+00	2026-03-07 10:27:52.719+00
75f113f8-2722-46d3-ab19-dfce47501760	8417ede7-51ad-49f7-ab7f-15ee9e32de82	\N	PRIMARY	2023-06-19 12:00:00+00	2023-06-19 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:52.988+00	2026-03-07 10:27:52.988+00
d7cb124f-844d-4e1d-8499-a4af78ed7a5f	f259c5e6-af34-4777-916e-04a41082b83e	\N	PRIMARY	2023-05-23 12:00:00+00	2023-05-23 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.04+00	2026-03-07 10:27:53.04+00
39f7345b-7cb9-4cf0-9070-2cd56cc91978	6d06b5ac-7df0-4dba-9d60-cf47f08c8b33	\N	PRIMARY	2023-06-07 12:00:00+00	2023-06-07 16:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.088+00	2026-03-07 10:27:53.088+00
1fb52c06-7a2d-44cf-9048-901d3009f15c	e4556ee1-d44c-47e5-b8d5-20f49190ff05	\N	PRIMARY	2023-06-05 12:00:00+00	2023-06-05 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.093+00	2026-03-07 10:27:53.093+00
d366159d-b17a-4a98-929d-c295f5880147	ca5ba5a1-230a-48d9-837a-20b3abc08496	\N	PRIMARY	2022-11-22 13:00:00+00	2022-11-22 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.153+00	2026-03-07 10:27:53.153+00
25e7ea0a-479d-4092-8f05-c3f6fce268ed	bae23da8-900a-4998-b643-f18e0ab128bc	\N	PRIMARY	2023-01-30 13:00:00+00	2023-01-30 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.179+00	2026-03-07 10:27:53.179+00
366b14d8-8d7f-42af-998d-82d4e01fbfc7	f526b896-54df-4c10-93d5-25cfc3ed4c8b	\N	PRIMARY	2023-01-30 13:00:00+00	2023-01-30 15:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.182+00	2026-03-07 10:27:53.182+00
b64eb900-bdf4-44ec-ae57-a00192af624b	cea6a93e-00e9-4d1e-8cb2-96aa6c404aef	\N	PRIMARY	2023-01-30 13:00:00+00	2023-01-30 14:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.198+00	2026-03-07 10:27:53.198+00
b916b30e-c6f6-4c57-af31-5c739fdc313f	b400a3fd-5dcf-4f2a-a6bf-7d99f386fc30	\N	PRIMARY	2023-01-25 13:00:00+00	2023-01-25 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.227+00	2026-03-07 10:27:53.227+00
94e5abc9-15ca-47b7-80ff-de079317f511	4f4c7160-ddd0-4d3c-ada7-40db5a4e1c5a	\N	PRIMARY	2023-01-25 13:00:00+00	2023-01-25 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.234+00	2026-03-07 10:27:53.234+00
0182a0f7-9280-4e98-bcbe-8594ecaf4f62	6fd0bf8e-26bc-4896-b386-8a519ff31b18	\N	PRIMARY	2023-02-06 13:00:00+00	2023-02-06 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.261+00	2026-03-07 10:27:53.261+00
64aec3ee-78b8-4f5d-8a42-4d7a211e3ec7	d4e3533d-8d7e-4fe0-9197-0db14ea09af1	\N	PRIMARY	2023-02-06 13:00:00+00	2023-02-06 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.275+00	2026-03-07 10:27:53.275+00
6e751874-84b5-4ea9-b993-a823d88e64ec	0ed8d1e4-3656-4f9e-a0f9-d8fc6bb8f52f	\N	PRIMARY	2023-02-01 13:00:00+00	2023-02-01 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.279+00	2026-03-07 10:27:53.279+00
92437acd-5acf-4d83-972e-815368258382	ae21c24c-acf8-42be-8f99-dee2516d2ee6	\N	PRIMARY	2023-01-31 13:00:00+00	2023-01-31 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.288+00	2026-03-07 10:27:53.288+00
c34407ae-0b2f-4836-a053-e82937df04d9	79c9de6b-0136-4baf-a0ca-7cba412e2c7f	\N	PRIMARY	2023-02-08 13:00:00+00	2023-02-08 16:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.303+00	2026-03-07 10:27:53.303+00
ff673e5e-cf27-4207-87fe-74990a053a18	adc5e264-6a07-4742-9657-f06bc7291210	\N	PRIMARY	2023-02-08 13:00:00+00	2023-02-08 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.306+00	2026-03-07 10:27:53.306+00
34066ac4-ec3e-4e29-b07c-d51620b32f4a	5b9dbc7b-3df0-41db-bf3d-7758f3e27f6a	\N	PRIMARY	2023-01-25 13:00:00+00	2023-01-25 15:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.315+00	2026-03-07 10:27:53.315+00
e895b757-f82b-4f86-87ad-376f7ecb6b0d	66e86399-9ddb-4458-9917-988baaee5fd5	\N	PRIMARY	2023-01-26 13:00:00+00	2023-01-26 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.324+00	2026-03-07 10:27:53.324+00
8fd3df6a-7e29-4a7b-944f-5d05a87c3a85	ba66154d-1fdf-4776-b424-995de750a387	\N	PRIMARY	2023-01-31 13:00:00+00	2023-01-31 15:15:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.336+00	2026-03-07 10:27:53.336+00
2e4aef72-2c21-41df-bc98-2fe5f499226d	70df7148-3022-437f-bc0e-9a1e2460f3e2	\N	PRIMARY	2023-01-25 13:00:00+00	2023-01-25 18:30:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.342+00	2026-03-07 10:27:53.342+00
ecce2501-8168-41e1-a4a7-3926fe8d1ed3	4bdc268c-34ed-42b4-ae19-7a77012d94cb	\N	PRIMARY	2023-02-01 13:00:00+00	2023-02-01 21:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.347+00	2026-03-07 10:27:53.347+00
7d400a35-09e8-4269-bb6b-fd6550b721f1	3cf33822-246e-40dc-9419-05d446c3ebfd	\N	PRIMARY	2023-02-14 13:00:00+00	2023-02-14 18:45:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.352+00	2026-03-07 10:27:53.352+00
3871eb98-bc70-400c-9467-b7bb9b58efa4	d29cae55-c875-49d4-b2ed-8dd3fb55c240	\N	PRIMARY	2023-02-14 13:00:00+00	2023-02-14 17:00:00+00	\N	\N	\N	\N	2026-03-07 10:27:53.359+00	2026-03-07 10:27:53.359+00
ac9afc01-1f82-4bed-97ee-75173cee158c	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	\N	2026-03-10 00:59:56.287+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:58:25.168+00	2026-03-10 00:59:56.289+00
5b782ff3-888b-4339-944e-cc9fbc010da7	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	\N	2026-03-10 01:04:31.235+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 01:04:26.856+00	2026-03-10 01:04:31.237+00
5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-10 14:10:00+00	2026-03-10 20:10:00+00	\N	2026-03-10 23:38:30.708+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:23.657+00	2026-03-10 23:38:30.71+00
bf335ed6-4c29-4979-9820-a76ead60eabe	5402fe73-681a-4778-9b0d-25d4c2152746	\N	PRIMARY	2026-03-11 11:30:00+00	2026-03-11 12:30:00+00	\N	2026-03-11 19:23:38.826+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:06.995+00	2026-03-11 19:23:38.827+00
c70df85d-610e-4e18-acc0-7156597c0f72	4142cedb-6a9a-42d9-b93b-50e305307342	\N	PRIMARY	2026-03-11 13:00:00+00	2026-03-11 16:00:00+00	\N	2026-03-11 19:23:50.816+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:00.053+00	2026-03-11 19:23:50.817+00
f325874c-5384-41e8-87e1-510c286617d5	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-11 11:00:00+00	2026-03-11 17:00:00+00	\N	2026-03-11 19:23:57.716+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:51.898+00	2026-03-11 19:23:57.717+00
ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-11 13:00:00+00	2026-03-11 19:00:00+00	\N	2026-03-11 19:31:32.592+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:31:11.652+00	2026-03-11 19:31:32.594+00
abb433c8-ef20-4c41-b576-e8cbcef665f5	039a90f3-10c0-4b52-8e60-bc6b87b9e7df	\N	PRIMARY	2026-03-11 12:00:00+00	2026-03-11 18:00:00+00	\N	2026-03-11 20:12:38.395+00	\N	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:34.492+00	2026-03-11 20:12:38.397+00
\.


--
-- TOC entry 3868 (class 0 OID 66690)
-- Dependencies: 246
-- Data for Name: scheduling_conflict_dismissals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scheduling_conflict_dismissals (id, dismissed_by_user_id, conflict_date, conflict_type, conflict_key, dismissed_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3867 (class 0 OID 66675)
-- Dependencies: 245
-- Data for Name: seasonal_freeze_windows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seasonal_freeze_windows (id, label, start_date, end_date, notes, active, created_by_user_id, created_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3859 (class 0 OID 66329)
-- Dependencies: 237
-- Data for Name: segment_roster_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.segment_roster_links (id, schedule_segment_id, roster_id, created_by_user_id, created_at, deleted_at) FROM stdin;
0dc1aaec-e718-498f-86c8-05b20fd0b63d	a44d0702-6c72-4d96-9e51-fd8e6acb4463	3f8c8731-b3ba-47e2-a846-a6185073245c	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.413+00	\N
db14db5e-8497-4158-a56f-27a9da738654	9e8a655e-350a-484d-9e94-9a345d08a034	b2fa5759-1c74-4980-bbec-98c792bba119	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.416+00	\N
f9a0a6ab-28ec-4df9-964c-020d6d3fdd41	dddc91f4-56ff-44e4-b31f-80246a7d9179	ed335749-23c4-45e0-9223-0779014596ff	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.42+00	\N
076bbcd1-9870-41fe-b3b0-13d23833258d	29c0d4c1-ef86-48f0-a764-9e3708f5cc6e	3f8c8731-b3ba-47e2-a846-a6185073245c	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:50.427+00	\N
aa20d40f-e069-4fd0-93f5-d5fa6c34e26c	6381b6b7-68ca-4579-b948-2b13c5440bbe	8baab01b-113a-4d7e-b866-aebd85217de8	35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	2026-03-06 17:59:51.39+00	\N
6fa86bed-36c8-426a-baa1-c28d1b4c6d37	ac9afc01-1f82-4bed-97ee-75173cee158c	486d8298-d149-4396-82db-496d331b61b8	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 00:58:25.172+00	\N
94617576-7971-4315-8792-e7f50c88d63e	5b782ff3-888b-4339-944e-cc9fbc010da7	486d8298-d149-4396-82db-496d331b61b8	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 01:04:26.859+00	\N
b7ff6a93-4071-4e8f-a784-b51c8ff4b0e3	5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d	b797b156-1e69-4e56-b2ec-5c4c594c447f	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-10 23:38:23.661+00	\N
42dacff2-3f95-44c0-83e7-3112ba0d16fc	f325874c-5384-41e8-87e1-510c286617d5	b2791150-9976-4616-bb95-9bab215d6386	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:20:51.904+00	\N
b8f3e43b-2748-4197-bf54-26abbc37fab6	c70df85d-610e-4e18-acc0-7156597c0f72	ac04c969-2738-4153-a813-2cd3113f8459	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:00.055+00	\N
408e8ef6-26d3-4a5f-909e-429fcfd9deab	bf335ed6-4c29-4979-9820-a76ead60eabe	e97da361-77b6-4595-ac17-5bd11d52b9db	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:21:06.997+00	\N
368008dd-d70c-4fd6-9e02-cd79d9fb4a7d	ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e	b2791150-9976-4616-bb95-9bab215d6386	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 19:31:11.654+00	\N
7230b02d-dc24-4685-a12f-f45edb0d6207	abb433c8-ef20-4c41-b576-e8cbcef665f5	b2791150-9976-4616-bb95-9bab215d6386	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	2026-03-11 20:12:34.494+00	\N
\.


--
-- TOC entry 3849 (class 0 OID 66236)
-- Dependencies: 227
-- Data for Name: travel_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.travel_segments (id, foreman_person_id, related_job_id, service_date, start_datetime, end_datetime, travel_type, source, locked, notes, created_by_user_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 3839 (class 0 OID 66139)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, active, created_at, updated_at, deleted_at, clerk_id) FROM stdin;
35457fa5-3acb-4b65-95e3-d7bd5ab7f3e6	Dispatch Manager	dispatch@irontreeservice.com	MANAGER	t	2026-03-06 17:59:50.298+00	2026-03-06 17:59:50.298+00	\N	\N
8d03801f-3cb8-4b3b-8eb0-78f04b01374b	Cole Wichman	cole@irontreeservice.com	MANAGER	t	2026-03-09 02:46:54.201+00	2026-03-09 02:46:54.201+00	\N	user_3Aj3vFTEgCuwP7rO5bLXLQ9d3aV
cf9b9684-5d14-4a6d-81aa-0b1c63af19db	E2E Actor 1772819991966	e2e-roster-1772819991966@example.com	SCHEDULER	f	2026-03-06 17:59:51.984+00	2026-03-11 18:37:08.991+00	\N	\N
\.


--
-- TOC entry 3851 (class 0 OID 66255)
-- Dependencies: 229
-- Data for Name: vacated_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacated_slots (id, source_segment_id, source_action, start_datetime, end_datetime, slot_hours, equipment_type, status, chosen_job_id, chosen_segment_id, created_at, dismissed_at, dismissed_by_user_id, deleted_at) FROM stdin;
09041628-b973-49ff-b4f6-e10bc117aa05	ac9afc01-1f82-4bed-97ee-75173cee158c	DELETED	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	6.00	CRANE	OPEN	\N	\N	2026-03-10 00:59:56.293+00	\N	\N	\N
b1ed53ac-78c5-4ea1-9479-2bc32c0ed9d2	5b782ff3-888b-4339-944e-cc9fbc010da7	DELETED	2026-03-09 12:00:00+00	2026-03-09 18:00:00+00	6.00	CRANE	OPEN	\N	\N	2026-03-10 01:04:31.238+00	\N	\N	\N
3cf22191-af1f-4302-b066-6b3da60833b7	5f2f94af-72f0-4d08-b8d3-b6cfd471cf3d	DELETED	2026-03-10 14:10:00+00	2026-03-10 20:10:00+00	6.00	CRANE	OPEN	\N	\N	2026-03-10 23:38:30.712+00	\N	\N	\N
9a40fdaa-6786-40b1-bad5-3336d71f09e3	c70df85d-610e-4e18-acc0-7156597c0f72	DELETED	2026-03-11 13:00:00+00	2026-03-11 16:00:00+00	3.00	CRANE	OPEN	\N	\N	2026-03-11 19:23:50.819+00	\N	\N	\N
888f865e-d96f-4d13-a60b-b29e1c63bbf8	f325874c-5384-41e8-87e1-510c286617d5	DELETED	2026-03-11 11:00:00+00	2026-03-11 17:00:00+00	6.00	CRANE	DISMISSED	\N	\N	2026-03-11 19:23:57.719+00	2026-03-11 19:24:02.25+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N
e3fdd5fe-2cff-405d-8003-a46e279aa870	ed10b86e-fa20-45ce-a6c8-2b18f2d46b0e	DELETED	2026-03-11 13:00:00+00	2026-03-11 19:00:00+00	6.00	CRANE	OPEN	\N	\N	2026-03-11 19:31:32.597+00	\N	\N	\N
cab52ff9-e641-4a92-9fa5-d80a169b70f6	bf335ed6-4c29-4979-9820-a76ead60eabe	DELETED	2026-03-11 11:30:00+00	2026-03-11 12:30:00+00	1.00	CRANE	DISMISSED	\N	\N	2026-03-11 19:23:38.83+00	2026-03-11 20:04:24.955+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N
16d6a8b6-ed4e-4ac0-ba27-be0842722e8c	abb433c8-ef20-4c41-b576-e8cbcef665f5	DELETED	2026-03-11 12:00:00+00	2026-03-11 18:00:00+00	6.00	CRANE	DISMISSED	\N	\N	2026-03-11 20:12:38.399+00	2026-03-11 20:12:45.366+00	8d03801f-3cb8-4b3b-8eb0-78f04b01374b	\N
\.


--
-- TOC entry 3870 (class 0 OID 107210)
-- Dependencies: 248
-- Data for Name: weekly_backlog_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_backlog_snapshots (id, snapshot_date, year, week_number, equipment_type, sales_rep_code, scheduled_dollars, tbs_dollars, total_dollars, scheduled_hours, tbs_hours, total_hours, crew_count, crew_count_override, created_at, deleted_at) FROM stdin;
7f867458-a13d-4a85-8533-cef6d99be9d1	2026-01-03	2026	1	CRANE	\N	\N	\N	\N	5.80	1.80	7.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
73ecfbe0-7b29-43d1-a7f1-1ca74d1d612c	2026-01-03	2026	1	BUCKET	\N	\N	\N	\N	2.80	4.00	6.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
cff6a27d-64d8-4b59-9932-82ab5cf95405	2026-01-10	2026	2	CRANE	\N	\N	\N	\N	5.30	1.80	7.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
95b15cc5-846e-4fca-88d8-a4c4bc8abcc8	2026-01-10	2026	2	BUCKET	\N	\N	\N	\N	3.00	3.50	6.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
3d372c0f-2be2-4018-b7e6-21392d9317f3	2026-01-17	2026	3	CRANE	\N	\N	\N	\N	5.20	0.90	6.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ac9493d2-3368-4486-b092-cfc90fa54857	2026-01-17	2026	3	BUCKET	\N	\N	\N	\N	3.30	2.70	6.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
8a402788-9080-40af-86e2-12d184499cb5	2026-01-24	2026	4	CRANE	\N	\N	\N	\N	4.80	0.30	5.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ddbf37f9-687a-4dbf-b4ad-8eb9a1a6ae22	2026-01-24	2026	4	BUCKET	\N	\N	\N	\N	3.70	1.50	5.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
8feb79f9-568a-45ab-9e6a-5da65bdf8d66	2026-01-31	2026	5	CRANE	\N	\N	\N	\N	3.90	0.70	4.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9d695e56-c537-4439-bde3-0a42cd83b7d8	2026-01-31	2026	5	BUCKET	\N	\N	\N	\N	2.70	1.80	4.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
cfd6282f-9ee4-4041-83cb-86d1819887fc	2026-02-07	2026	6	CRANE	\N	\N	\N	\N	4.30	0.20	4.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
53d082cb-aa63-4484-beba-5468473a726d	2026-02-07	2026	6	BUCKET	\N	\N	\N	\N	3.20	1.20	4.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
1792d62a-182a-49c3-b018-954272725d4b	2026-02-14	2026	7	CRANE	\N	\N	\N	\N	3.50	0.40	3.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
eca01601-829a-458b-a46b-2281e25e67e9	2026-02-14	2026	7	BUCKET	\N	\N	\N	\N	2.50	1.20	3.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
40e4320c-e5b7-48d2-b863-c8275376bc48	2026-02-21	2026	8	CRANE	\N	\N	\N	\N	3.30	0.20	3.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
461a30e0-725f-41de-af56-1eec9962bc51	2026-02-21	2026	8	BUCKET	\N	\N	\N	\N	2.30	0.90	3.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f8c0eb6a-9177-4f4d-bb7a-b7722ee1f5e8	2026-02-28	2026	9	CRANE	\N	\N	\N	\N	2.60	0.10	2.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
8b729004-03c1-4f1c-8a21-3889d518eec1	2026-02-28	2026	9	BUCKET	\N	\N	\N	\N	1.60	1.30	2.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
a97d1f82-d108-4f1f-8474-6f459f8b7b8b	2026-03-07	2026	10	CRANE	\N	\N	\N	\N	2.80	0.00	2.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
192b55ea-7146-4191-8d3a-49cb876c7008	2026-03-07	2026	10	BUCKET	\N	\N	\N	\N	1.90	0.80	2.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f4825daa-764f-4435-b4bd-a03b19fc7f05	2025-01-04	2025	1	CRANE	\N	\N	\N	\N	6.20	2.20	8.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
906d154b-1270-457a-b824-986b23e6c685	2025-01-04	2025	1	BUCKET	\N	\N	\N	\N	4.30	2.20	6.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
298b3067-c304-4db5-8f3d-e19048fe5b33	2025-01-11	2025	2	CRANE	\N	\N	\N	\N	6.10	2.30	8.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
dd3be50b-cb30-4036-99d9-45ee4cff8ec2	2025-01-11	2025	2	BUCKET	\N	\N	\N	\N	4.00	2.20	6.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
e118f2dc-274a-4ac1-ac73-a23400b9ee54	2025-01-18	2025	3	CRANE	\N	\N	\N	\N	6.10	2.30	8.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e7479530-7e8f-4185-8ebf-fba5f683e1d0	2025-01-18	2025	3	BUCKET	\N	\N	\N	\N	3.70	2.10	5.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
553ab7b9-653b-4018-9f58-abe20eada743	2025-01-25	2025	4	CRANE	\N	\N	\N	\N	5.80	2.50	8.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b4a503eb-9b28-48b0-b09d-79a9ff5e98af	2025-01-25	2025	4	BUCKET	\N	\N	\N	\N	3.20	2.40	5.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
6c7af76f-9c56-418b-8cb6-42be806c2aaa	2025-02-01	2025	5	CRANE	\N	\N	\N	\N	6.30	1.40	7.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
35929583-5d96-4a73-934d-5d28ef83b282	2025-02-01	2025	5	BUCKET	\N	\N	\N	\N	3.30	1.40	5.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
9377dcec-b4e4-44ec-b68e-45f76416070d	2025-02-08	2025	6	CRANE	\N	\N	\N	\N	6.30	1.20	7.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2bd73304-5b8b-4323-adb2-6ae05c725398	2025-02-08	2025	6	BUCKET	\N	\N	\N	\N	2.80	1.70	4.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
174e0b25-e439-4e0e-bb79-f29b568ca901	2025-02-15	2025	7	CRANE	\N	\N	\N	\N	5.60	0.90	6.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0c955859-5c7c-467b-aca1-29ce08258735	2025-02-15	2025	7	BUCKET	\N	\N	\N	\N	2.50	1.20	3.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
7b15d0f8-01c8-41c7-bf19-f3f1193e772d	2025-02-22	2025	8	CRANE	\N	\N	\N	\N	5.00	1.40	6.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
974bf9c6-d100-40b4-aa22-c727608a7d58	2025-02-22	2025	8	BUCKET	\N	\N	\N	\N	2.40	1.10	3.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
a20b4c6a-bb06-4cf7-813a-4c8b9ae7f756	2025-03-01	2025	9	CRANE	\N	\N	\N	\N	4.90	0.70	5.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2f36173b-960f-4d14-ac26-07df503931b2	2025-03-01	2025	9	BUCKET	\N	\N	\N	\N	2.60	0.80	3.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
afdd62dc-d627-4d5e-b94d-00dc25e330d3	2025-03-08	2025	10	CRANE	\N	\N	\N	\N	4.70	0.70	5.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
286184a8-189e-4ef7-80bc-f383494e7ab4	2025-03-08	2025	10	BUCKET	\N	\N	\N	\N	1.20	2.00	3.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
667bce62-2f31-4da9-927e-62def149ee40	2025-03-15	2025	11	CRANE	\N	\N	\N	\N	4.10	0.80	4.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c51db2ff-0cd3-43c3-b152-677f80f75741	2025-03-15	2025	11	BUCKET	\N	\N	\N	\N	1.90	0.90	2.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f6b038a0-6568-45c1-96a1-8177798c150f	2025-03-22	2025	12	CRANE	\N	\N	\N	\N	3.70	1.50	5.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d464c24a-a2b4-44ca-b7f3-3df2f95fa6cc	2025-03-22	2025	12	BUCKET	\N	\N	\N	\N	1.50	1.40	2.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
efec84b6-5170-4a07-b021-f51c64c2213c	2025-03-29	2025	13	CRANE	\N	\N	\N	\N	3.30	2.70	6.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
43f9c41c-e871-45e1-8001-9576c52a19f4	2025-03-29	2025	13	BUCKET	\N	\N	\N	\N	2.30	1.20	3.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
0e07b844-dc21-477d-938e-2aa5d6f4a06b	2025-04-05	2025	14	CRANE	\N	\N	\N	\N	1.80	4.10	5.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
4ed9a869-743c-46f9-a050-c6c252938063	2025-04-05	2025	14	BUCKET	\N	\N	\N	\N	1.50	2.30	3.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
916f1379-93ef-4881-b6c0-e2732912bbf6	2025-04-12	2025	15	CRANE	\N	\N	\N	\N	1.70	4.30	6.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
aa69507b-49a6-428d-a7cf-e2ca628ce3e5	2025-04-12	2025	15	BUCKET	\N	\N	\N	\N	1.50	2.80	4.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
3707a3d7-9e78-4f64-b43f-063691bef2b9	2025-04-19	2025	16	CRANE	\N	\N	\N	\N	2.00	4.10	6.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
268e6887-40e3-43b6-9a66-bc5877d0ebe3	2025-04-19	2025	16	BUCKET	\N	\N	\N	\N	1.40	2.80	4.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
da1b7311-1131-4882-987f-b0b139b48c97	2025-04-26	2025	17	CRANE	\N	\N	\N	\N	2.10	4.00	6.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
807170b4-632d-48a1-816d-d43e373adbc5	2025-04-26	2025	17	BUCKET	\N	\N	\N	\N	1.50	2.30	3.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
c5596ed4-1c77-4e18-8fda-65da39a6e685	2025-05-03	2025	18	CRANE	\N	\N	\N	\N	3.20	1.50	5.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
519cef8e-099e-4eab-af3e-c98d69857008	2025-05-03	2025	18	BUCKET	\N	\N	\N	\N	2.30	1.10	3.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
a268e4be-376b-4770-9bbe-302ed489f494	2025-05-10	2025	19	CRANE	\N	\N	\N	\N	3.20	2.00	5.20	2.50	\N	2026-03-10 23:53:53.583419+00	\N
64fc0e07-8368-4987-ac63-8c57bb74d732	2025-05-10	2025	19	BUCKET	\N	\N	\N	\N	1.70	2.00	3.70	5.50	\N	2026-03-10 23:53:53.583419+00	\N
758a6676-1ab4-4c00-b5fc-f5f6c14969b5	2025-05-17	2025	20	CRANE	\N	\N	\N	\N	3.40	1.60	5.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
2994f9ce-2147-4636-819c-732f761a6dd1	2025-05-17	2025	20	BUCKET	\N	\N	\N	\N	1.30	2.20	3.50	5.50	\N	2026-03-10 23:53:53.583419+00	\N
121fee93-7ce5-4e45-8839-8ac9bec8c21d	2025-05-24	2025	21	CRANE	\N	\N	\N	\N	3.50	1.40	5.50	2.50	\N	2026-03-10 23:53:53.583419+00	\N
0bd0efad-9059-44ca-9a7c-f87d9e07d6f0	2025-05-24	2025	21	BUCKET	\N	\N	\N	\N	2.00	1.40	3.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
33223d0a-cbf0-427b-9b18-d7115e0593dc	2025-05-31	2025	22	CRANE	\N	\N	\N	\N	3.80	1.20	5.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
07c7e265-163b-4e88-a9b9-9a7714707ec2	2025-05-31	2025	22	BUCKET	\N	\N	\N	\N	2.20	1.30	3.50	5.50	\N	2026-03-10 23:53:53.583419+00	\N
dd50e19e-2edc-42cc-8070-0b331420b349	2025-06-07	2025	23	CRANE	\N	\N	\N	\N	3.40	2.30	5.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
ab08c813-76f9-4d4c-a99a-05c42113c78c	2025-06-07	2025	23	BUCKET	\N	\N	\N	\N	1.90	1.80	3.70	5.50	\N	2026-03-10 23:53:53.583419+00	\N
4ee55b10-0281-42a3-9a46-98f53ef7842e	2025-06-14	2025	24	CRANE	\N	\N	\N	\N	3.80	1.90	5.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
8a30d097-97eb-4def-ae98-5d6266ca31e8	2025-06-14	2025	24	BUCKET	\N	\N	\N	\N	1.90	1.70	3.60	5.50	\N	2026-03-10 23:53:53.583419+00	\N
01751e4e-20b0-431f-969d-7387f7522bd4	2025-06-21	2025	25	CRANE	\N	\N	\N	\N	3.10	2.30	5.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
b80c40a3-6595-4a90-b6af-68fd780f0dc9	2025-06-21	2025	25	BUCKET	\N	\N	\N	\N	1.40	2.00	3.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
ef645c3e-6513-4b45-bff9-7b0c40b7e82f	2025-06-28	2025	26	CRANE	\N	\N	\N	\N	3.50	2.10	5.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
f2ec8fbb-0de6-4ed1-ad4e-d03be5298d73	2025-06-28	2025	26	BUCKET	\N	\N	\N	\N	1.50	2.40	3.90	5.50	\N	2026-03-10 23:53:53.583419+00	\N
0dd6d255-070d-460c-a3d8-a9e561eab7f1	2025-07-05	2025	27	CRANE	\N	\N	\N	\N	3.90	1.70	5.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
191d26e0-b346-4b32-8ff2-11b56afe4b14	2025-07-05	2025	27	BUCKET	\N	\N	\N	\N	2.20	2.10	4.30	5.50	\N	2026-03-10 23:53:53.583419+00	\N
38c4153e-ef49-4236-9dd9-955a8cd2f7da	2025-07-12	2025	28	CRANE	\N	\N	\N	\N	3.80	2.10	5.90	2.50	\N	2026-03-10 23:53:53.583419+00	\N
5c005642-81a3-443f-aefe-eb6bc537711e	2025-07-12	2025	28	BUCKET	\N	\N	\N	\N	2.60	1.70	4.30	5.50	\N	2026-03-10 23:53:53.583419+00	\N
92d872d5-0780-479c-a9ad-b9f21bed4d75	2025-07-19	2025	29	CRANE	\N	\N	\N	\N	3.60	2.50	6.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
95821738-06ef-4be6-a0f7-1c265983fb9c	2025-07-19	2025	29	BUCKET	\N	\N	\N	\N	2.50	2.30	4.80	5.50	\N	2026-03-10 23:53:53.583419+00	\N
98f2a9d9-33ce-4fc3-a773-86554142dbb5	2025-07-26	2025	30	CRANE	\N	\N	\N	\N	7.20	2.10	9.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
79341c7a-a08d-442a-9007-f3734237bb0b	2025-07-26	2025	30	BUCKET	\N	\N	\N	\N	2.80	1.80	4.60	6.00	\N	2026-03-10 23:53:53.583419+00	\N
6b1c01d9-13bb-4a3a-8493-1eab8369d44d	2025-08-02	2025	31	CRANE	\N	\N	\N	\N	6.70	2.40	9.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c7616871-3712-4b68-a9da-630a2db72fdd	2025-08-02	2025	31	BUCKET	\N	\N	\N	\N	2.50	2.00	4.50	6.00	\N	2026-03-10 23:53:53.583419+00	\N
20ca8aee-3138-4fe1-a236-a00417ddc8bd	2025-08-09	2025	32	CRANE	\N	\N	\N	\N	6.50	2.60	9.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
03324885-b9c4-47ff-81ac-ca8d2a7fe7d5	2025-08-09	2025	32	BUCKET	\N	\N	\N	\N	2.50	2.00	4.50	6.00	\N	2026-03-10 23:53:53.583419+00	\N
a21b749b-3997-4192-9c37-6f1b7d445880	2025-08-16	2025	33	CRANE	\N	\N	\N	\N	6.80	2.60	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3b10810e-5571-4b59-9a73-5b2391e00bd4	2025-08-16	2025	33	BUCKET	\N	\N	\N	\N	2.50	2.20	4.70	6.00	\N	2026-03-10 23:53:53.583419+00	\N
8cb4156b-70de-4991-8829-35d4a9e673e2	2025-08-23	2025	34	CRANE	\N	\N	\N	\N	6.70	2.60	9.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6b555ec1-f704-4299-89eb-c4187a4da610	2025-08-23	2025	34	BUCKET	\N	\N	\N	\N	2.20	2.60	4.80	6.00	\N	2026-03-10 23:53:53.583419+00	\N
7390c442-6740-4937-be7e-f37c530effbf	2025-08-30	2025	35	CRANE	\N	\N	\N	\N	6.80	2.60	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bae0928f-7665-45a3-af39-b7eb59b9dce6	2025-08-30	2025	35	BUCKET	\N	\N	\N	\N	2.00	3.00	5.00	6.00	\N	2026-03-10 23:53:53.583419+00	\N
076393de-e23d-488f-a3ce-342a80e0a6d5	2025-09-06	2025	36	CRANE	\N	\N	\N	\N	6.80	2.60	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1a832f91-1e86-462f-acae-96dd88cb3181	2025-09-06	2025	36	BUCKET	\N	\N	\N	\N	1.90	3.20	5.10	6.00	\N	2026-03-10 23:53:53.583419+00	\N
97576630-7d15-43fb-a245-61f86986ac56	2025-09-13	2025	37	CRANE	\N	\N	\N	\N	6.80	2.80	9.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d0be701a-8aac-4ba6-abbb-3efa85cb7612	2025-09-13	2025	37	BUCKET	\N	\N	\N	\N	2.20	3.00	5.20	6.00	\N	2026-03-10 23:53:53.583419+00	\N
a9eb3ec1-e013-4576-8cb2-66199bf94fe0	2025-09-20	2025	38	CRANE	\N	\N	\N	\N	7.80	2.50	10.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
278dd19f-db90-4097-bd3b-e79bb31595c9	2025-09-20	2025	38	BUCKET	\N	\N	\N	\N	3.10	1.90	5.00	6.00	\N	2026-03-10 23:53:53.583419+00	\N
22a02240-3c42-4cfd-af93-2c5577b3bd82	2025-09-27	2025	39	CRANE	\N	\N	\N	\N	7.60	2.50	10.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3199784f-1749-4259-a701-a5812f1576f6	2025-09-27	2025	39	BUCKET	\N	\N	\N	\N	3.20	2.30	5.50	6.00	\N	2026-03-10 23:53:53.583419+00	\N
a8adb517-9e39-4531-b24d-912bdc0f600d	2025-10-04	2025	40	CRANE	\N	\N	\N	\N	7.70	3.10	10.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c69ae679-f491-4f41-8455-bafc322fe8d5	2025-10-04	2025	40	BUCKET	\N	\N	\N	\N	3.40	2.10	5.50	6.00	\N	2026-03-10 23:53:53.583419+00	\N
ccfc502f-f930-4fe0-a1c5-cc488804be94	2025-10-11	2025	41	CRANE	\N	\N	\N	\N	7.50	3.30	10.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
4bab8326-a388-4e6a-ba57-a02349f8c426	2025-10-11	2025	41	BUCKET	\N	\N	\N	\N	3.50	2.50	6.00	6.00	\N	2026-03-10 23:53:53.583419+00	\N
60e44fac-5f8b-490e-a8a3-b4e12fbdd3ed	2025-10-18	2025	42	CRANE	\N	\N	\N	\N	7.20	4.00	11.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
843fad97-e1f9-4680-89f2-784cfb5f1f69	2025-10-18	2025	42	BUCKET	\N	\N	\N	\N	3.40	2.90	6.30	6.00	\N	2026-03-10 23:53:53.583419+00	\N
e73cfdff-6b75-48bf-93b6-03fdec83b937	2025-10-25	2025	43	CRANE	\N	\N	\N	\N	7.30	4.00	11.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bc665af2-dcf4-490e-b2db-0540a6cc4e03	2025-10-25	2025	43	BUCKET	\N	\N	\N	\N	3.60	2.50	6.10	6.00	\N	2026-03-10 23:53:53.583419+00	\N
a5fe749f-39a4-43e0-88a2-7a6908026f5c	2025-11-01	2025	44	CRANE	\N	\N	\N	\N	8.10	3.60	11.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0777c78d-7bcb-486f-b179-3af154895297	2025-11-01	2025	44	BUCKET	\N	\N	\N	\N	4.00	2.20	6.20	6.00	\N	2026-03-10 23:53:53.583419+00	\N
9b5e24d0-0171-43fa-a8ce-a79b7cfb1257	2025-11-08	2025	45	CRANE	\N	\N	\N	\N	8.20	3.10	11.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
44539c43-ef07-4ed3-a049-b82d6267b340	2025-11-08	2025	45	BUCKET	\N	\N	\N	\N	4.00	1.80	5.80	6.00	\N	2026-03-10 23:53:53.583419+00	\N
62640a65-dc8b-4288-bdf7-34947d4e4225	2025-11-15	2025	46	CRANE	\N	\N	\N	\N	7.70	3.50	11.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9851a6c1-800f-4522-ab98-5a50ebb55733	2025-11-15	2025	46	BUCKET	\N	\N	\N	\N	3.60	2.10	5.70	6.00	\N	2026-03-10 23:53:53.583419+00	\N
3ac4d1cd-0aca-4172-8abf-29d250f7df45	2025-11-22	2025	47	CRANE	\N	\N	\N	\N	7.70	2.90	10.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
df15bc24-6145-423e-913b-15984367685c	2025-11-22	2025	47	BUCKET	\N	\N	\N	\N	3.40	2.10	5.50	6.00	\N	2026-03-10 23:53:53.583419+00	\N
eac2f8b2-b92e-43b3-91d4-fe5305a2240b	2025-11-29	2025	48	CRANE	\N	\N	\N	\N	7.10	2.80	9.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
7665765b-bb1d-4a5c-8ac8-a2d0b2b30a37	2025-11-29	2025	48	BUCKET	\N	\N	\N	\N	3.80	2.30	6.10	5.00	\N	2026-03-10 23:53:53.583419+00	\N
3503e1e4-c13c-4fcc-ad8e-d55e8308a521	2025-12-06	2025	49	CRANE	\N	\N	\N	\N	7.00	2.40	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
70eb1f84-c60c-4751-8d59-ba2c7750ce27	2025-12-06	2025	49	BUCKET	\N	\N	\N	\N	3.60	2.20	5.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
e67fbec8-0869-4de4-95c5-fe20e5ebc142	2025-12-20	2025	51	CRANE	\N	\N	\N	\N	6.00	1.80	7.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
09b8c99e-f420-4bf5-b98e-3d0cbd8df93e	2025-12-20	2025	51	BUCKET	\N	\N	\N	\N	2.90	2.00	4.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
6707d16b-11a3-418e-af7f-276412904892	2025-12-27	2025	52	CRANE	\N	\N	\N	\N	6.10	1.70	7.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
81914e65-ca77-42fd-be9e-437cc5e49ce4	2025-12-27	2025	52	BUCKET	\N	\N	\N	\N	3.00	4.00	7.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
cf2f4056-7a25-43a2-9e91-5613b2952a09	2024-01-06	2024	1	CRANE	\N	\N	\N	\N	6.90	5.20	12.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2959f6e4-8a65-4a6b-9d33-6f29cb774b0d	2024-01-06	2024	1	BUCKET	\N	\N	\N	\N	6.00	5.00	11.00	4.00	\N	2026-03-10 23:53:53.583419+00	\N
e5dbb269-50de-45e5-882f-d5fe57ba910c	2024-01-13	2024	2	CRANE	\N	\N	\N	\N	7.00	4.50	11.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6f91d2bc-5339-4fbd-a96e-c29d5f69fce5	2024-01-13	2024	2	BUCKET	\N	\N	\N	\N	4.70	3.70	8.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
8f838ba5-ee3d-48ac-8233-83e086d95289	2024-01-20	2024	3	CRANE	\N	\N	\N	\N	6.70	5.40	12.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b96627cb-1203-42d1-9836-585c66848ce4	2024-01-20	2024	3	BUCKET	\N	\N	\N	\N	4.80	3.60	8.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
9305b608-b3b0-4408-8e22-c263c58f9ce9	2024-01-27	2024	4	CRANE	\N	\N	\N	\N	6.70	5.40	11.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
80ec8466-1e49-4b66-938c-2513da7b8941	2024-01-27	2024	4	BUCKET	\N	\N	\N	\N	5.00	2.80	7.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
16348c01-7502-4896-9982-bbcffb293d89	2024-02-03	2024	5	CRANE	\N	\N	\N	\N	7.10	4.50	11.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
54092a83-b886-464d-ad09-c4df9a1396b8	2024-02-03	2024	5	BUCKET	\N	\N	\N	\N	4.90	2.50	7.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f71c6ea8-6ccf-470b-8d52-1536d0ec2f85	2024-02-10	2024	6	CRANE	\N	\N	\N	\N	6.10	2.50	8.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
64b82f5d-6dee-4f81-b00e-f0d2ce46d630	2024-02-10	2024	6	BUCKET	\N	\N	\N	\N	4.70	2.10	6.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
79d5b802-c6fe-4d5d-aa97-067a30f9a4be	2024-02-17	2024	7	CRANE	\N	\N	\N	\N	6.10	2.50	7.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
9cc9568b-ff28-4f27-be95-bca6d74b99df	2024-02-17	2024	7	BUCKET	\N	\N	\N	\N	4.00	2.20	6.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
af28f752-9a1d-4051-9680-823dd336455a	2024-02-24	2024	8	CRANE	\N	\N	\N	\N	4.90	2.30	7.20	2.50	\N	2026-03-10 23:53:53.583419+00	\N
568bf3e4-5cfd-4f27-8c95-b26bbb8a614d	2024-02-24	2024	8	BUCKET	\N	\N	\N	\N	3.90	1.80	5.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
cdd30d68-b628-4bc8-a487-dfeb0f671508	2024-03-02	2024	9	CRANE	\N	\N	\N	\N	4.80	2.20	7.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
35cd85e5-0ee0-4638-af45-468324f7c313	2024-03-02	2024	9	BUCKET	\N	\N	\N	\N	3.20	1.80	5.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
4c6557fc-47d2-4ebe-88bd-5555a8c3e747	2024-03-09	2024	10	CRANE	\N	\N	\N	\N	4.40	3.00	7.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
005c6e6b-dad8-4abb-aa93-f0d973997046	2024-03-09	2024	10	BUCKET	\N	\N	\N	\N	2.90	1.80	4.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
fe89f90f-59a1-40b4-8c21-69452ee6180a	2024-03-16	2024	11	CRANE	\N	\N	\N	\N	4.80	2.80	7.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
f8d0695e-a6a9-4955-bd23-f7109749ef0a	2024-03-16	2024	11	BUCKET	\N	\N	\N	\N	2.80	1.60	4.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
6ed6c9af-2cd3-4164-af6d-9d13a3fa2349	2024-03-23	2024	12	CRANE	\N	\N	\N	\N	5.10	2.20	7.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
b4fadbf7-8fbd-426d-bfb7-0939115c46fb	2024-03-23	2024	12	BUCKET	\N	\N	\N	\N	2.70	1.80	4.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
1110d2ac-1662-4747-9a67-d9f37e9ae91f	2024-03-30	2024	13	CRANE	\N	\N	\N	\N	5.10	2.00	7.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
0648736a-8e1d-4692-abf2-86ada33fb1b3	2024-03-30	2024	13	BUCKET	\N	\N	\N	\N	2.50	2.00	4.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
2097fac9-b4a9-4eea-82e4-107f1e9338e6	2024-04-06	2024	14	CRANE	\N	\N	\N	\N	4.90	2.20	7.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
8bd43e20-e7c7-43e8-ade2-7316b569908d	2024-04-06	2024	14	BUCKET	\N	\N	\N	\N	3.00	1.60	4.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
4c9aafee-9360-4457-ab01-ea0d728c0ed1	2024-04-13	2024	15	CRANE	\N	\N	\N	\N	4.50	2.80	7.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
c545b366-f462-4284-9f3c-dd4ab8a0bf43	2024-04-13	2024	15	BUCKET	\N	\N	\N	\N	3.10	1.60	4.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
0fb0171f-83b9-42e5-8c57-3ee68f093bc9	2024-04-20	2024	16	CRANE	\N	\N	\N	\N	4.70	3.00	7.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
c6ad8329-c40d-4c53-ae95-dfb4df321096	2024-04-20	2024	16	BUCKET	\N	\N	\N	\N	2.80	2.10	4.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
109f87e8-f7ba-4dcb-8c98-6bc9de0dffdc	2024-04-27	2024	17	CRANE	\N	\N	\N	\N	4.90	3.10	8.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
dba92faf-c6a7-43e0-a523-1eea656090a8	2024-04-27	2024	17	BUCKET	\N	\N	\N	\N	2.70	2.50	5.20	5.00	\N	2026-03-10 23:53:53.583419+00	\N
d48e4304-b7e8-4649-8a5e-0df99b053131	2024-05-18	2024	20	CRANE	\N	\N	\N	\N	5.90	2.90	8.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
a7a439c6-46b8-4ac1-935d-b2ca1da1c0c9	2024-05-18	2024	20	BUCKET	\N	\N	\N	\N	3.40	2.10	5.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
297ea536-851e-4f82-b2c5-b30ac76fdf3c	2024-05-25	2024	21	CRANE	\N	\N	\N	\N	6.00	3.30	9.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
59ec46ae-4995-4607-8b10-e9b7550b7d8d	2024-05-25	2024	21	BUCKET	\N	\N	\N	\N	3.60	2.00	5.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
71f89806-6c8b-4843-aa4a-81d1e610d877	2024-06-01	2024	22	CRANE	\N	\N	\N	\N	6.20	3.80	10.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
41fdba3d-0415-45f4-bd57-844b07f36d90	2024-06-01	2024	22	BUCKET	\N	\N	\N	\N	3.50	2.20	5.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
e55e790d-b6bf-485d-9d3d-742011c3a94e	2024-06-08	2024	23	CRANE	\N	\N	\N	\N	6.50	3.60	10.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
505d2996-5940-456d-ae6e-0f01ae2e2438	2024-06-08	2024	23	BUCKET	\N	\N	\N	\N	3.60	2.30	5.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
4b6e6ec1-fefa-44a0-b6cd-428df8045ac5	2024-06-15	2024	24	CRANE	\N	\N	\N	\N	7.10	3.20	10.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
e7c27f4a-55ec-463c-9f9d-e8421c0232f3	2024-06-15	2024	24	BUCKET	\N	\N	\N	\N	3.80	2.20	6.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f746a3a3-8d33-4fa7-9857-b44bc8a379c1	2024-06-22	2024	25	CRANE	\N	\N	\N	\N	6.90	2.90	9.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
6edf479e-bd38-48c8-b721-bbd6ee6e9d17	2024-06-22	2024	25	BUCKET	\N	\N	\N	\N	4.00	2.50	6.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
b3d59877-49ea-4365-847e-717e0b0dc64e	2024-06-29	2024	26	CRANE	\N	\N	\N	\N	6.60	3.40	10.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
573cd342-5ed8-41d1-811a-86844fae7528	2024-06-29	2024	26	BUCKET	\N	\N	\N	\N	3.80	2.70	6.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
47d8b721-69be-49bb-9d5a-2be350be0095	2024-07-06	2024	27	CRANE	\N	\N	\N	\N	7.00	2.50	9.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
da3c9453-72e5-4d32-b48a-e8bd058352de	2024-07-06	2024	27	BUCKET	\N	\N	\N	\N	4.50	2.30	6.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
80dbaa7b-38ce-4a57-8058-f7b6e87f1cd6	2024-07-13	2024	28	CRANE	\N	\N	\N	\N	7.00	2.80	9.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
2acc0907-b623-4c39-98ed-446ffa532ecc	2024-07-13	2024	28	BUCKET	\N	\N	\N	\N	4.30	3.10	7.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f1820664-0478-4fb7-8901-a510f69dc9b5	2024-07-27	2024	30	CRANE	\N	\N	\N	\N	6.80	3.80	10.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
12b5310c-83a9-484e-9dc0-d88d586b26d5	2024-07-27	2024	30	BUCKET	\N	\N	\N	\N	4.40	3.40	7.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
0b8099c2-5b97-4c3b-820a-e6e40c2501c7	2024-08-03	2024	31	CRANE	\N	\N	\N	\N	7.10	3.00	10.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
057f281b-8e22-4681-bed6-6f0bf2509303	2024-08-03	2024	31	BUCKET	\N	\N	\N	\N	4.90	3.60	8.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
66b73b28-86c1-4920-8e08-6cb33d7a088d	2024-08-10	2024	32	CRANE	\N	\N	\N	\N	7.00	2.80	9.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
214db0da-2db7-4199-bb56-907bd4df98fc	2024-08-10	2024	32	BUCKET	\N	\N	\N	\N	4.90	3.50	8.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
190211b7-5d5e-41e2-9eb8-16ee8873a30a	2024-08-17	2024	33	CRANE	\N	\N	\N	\N	7.30	2.70	10.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
138a63d4-00aa-4511-9f75-e2d41258c4ab	2024-08-17	2024	33	BUCKET	\N	\N	\N	\N	5.10	3.60	8.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
6daa3da4-0a72-4d37-9534-3c0f54e0fbd2	2024-08-24	2024	34	CRANE	\N	\N	\N	\N	7.30	2.80	10.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
5a166629-8266-4a27-bf7e-318283c8f3bb	2024-08-24	2024	34	BUCKET	\N	\N	\N	\N	5.60	3.40	9.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
c4533434-91d3-4ffc-bf0c-78f3aa8ad620	2024-08-31	2024	35	CRANE	\N	\N	\N	\N	6.70	3.00	9.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
7918012a-76f6-4269-aa62-fa1b6d1f0240	2024-08-31	2024	35	BUCKET	\N	\N	\N	\N	5.60	3.70	9.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
a4e9b43d-dfbf-4f47-b248-9f6f75b753b0	2024-09-07	2024	36	CRANE	\N	\N	\N	\N	8.90	2.50	11.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3997065d-bc4f-4d2f-970a-21afb7e3c11a	2024-09-07	2024	36	BUCKET	\N	\N	\N	\N	6.20	3.20	9.40	5.00	\N	2026-03-10 23:53:53.583419+00	\N
2261ced8-640a-49ff-baf0-d98642e5d216	2024-09-14	2024	37	CRANE	\N	\N	\N	\N	8.50	2.70	11.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e20a6ef5-1068-4bea-9fff-5a3f66b98983	2024-09-14	2024	37	BUCKET	\N	\N	\N	\N	6.30	3.30	9.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
eea6cc96-f113-479e-ac57-1c85db375173	2024-09-21	2024	38	CRANE	\N	\N	\N	\N	7.90	3.10	11.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
7371320b-4397-4082-97d2-271d1541c2ba	2024-09-21	2024	38	BUCKET	\N	\N	\N	\N	6.00	3.60	9.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
7c96269d-bb81-4dce-bf47-1e744386afd3	2024-09-28	2024	39	CRANE	\N	\N	\N	\N	7.20	3.60	10.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
003c73cf-be94-4eac-ace5-86abeedcc0a8	2024-09-28	2024	39	BUCKET	\N	\N	\N	\N	6.40	3.60	10.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
b0e3101e-d740-4c00-8385-f3b3971cbcce	2024-10-05	2024	40	CRANE	\N	\N	\N	\N	7.70	3.80	11.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
a3d7229c-0d65-4804-b3ab-9fdb53ec7496	2024-10-05	2024	40	BUCKET	\N	\N	\N	\N	6.20	3.90	11.10	5.00	\N	2026-03-10 23:53:53.583419+00	\N
48d9ef45-1aea-4583-bb3e-902085e5a4cc	2024-10-12	2024	41	CRANE	\N	\N	\N	\N	7.10	4.20	11.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b7d5409c-6428-4315-ac63-1f08520306c9	2024-10-12	2024	41	BUCKET	\N	\N	\N	\N	6.30	3.40	9.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f8410a17-1fdb-466e-bee1-27263d0fb7b4	2024-10-19	2024	42	CRANE	\N	\N	\N	\N	7.50	3.00	10.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
20a80ffc-e7cc-4b5e-a9e6-c093add4acb7	2024-10-19	2024	42	BUCKET	\N	\N	\N	\N	6.70	2.60	9.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
040177eb-03c0-4e59-8fec-e0a4c3c4624c	2024-10-26	2024	43	CRANE	\N	\N	\N	\N	7.00	3.00	10.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b4697ec7-e2c5-4108-80ee-e527ecfacaca	2024-10-26	2024	43	BUCKET	\N	\N	\N	\N	6.40	2.50	8.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
f82dba20-f18c-4e0e-b4c5-1637f1933f36	2024-11-02	2024	44	CRANE	\N	\N	\N	\N	6.70	3.00	9.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
a087a617-634d-4b8a-a1cb-66a3e51c6f9c	2024-11-02	2024	44	BUCKET	\N	\N	\N	\N	6.50	2.20	8.50	5.00	\N	2026-03-10 23:53:53.583419+00	\N
3c837fcf-0b25-47ea-8b76-96dbe1f025ef	2024-11-09	2024	45	CRANE	\N	\N	\N	\N	7.00	2.40	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e3e4b624-2c32-4cdd-9a1f-e1f2852fef25	2024-11-09	2024	45	BUCKET	\N	\N	\N	\N	5.80	2.20	8.00	5.00	\N	2026-03-10 23:53:53.583419+00	\N
a34c7a31-8bac-4265-921e-3b2367eda305	2024-11-16	2024	46	CRANE	\N	\N	\N	\N	7.00	3.30	10.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
5ee2ecf1-c1ef-4321-8697-07f89557fe5f	2024-11-16	2024	46	BUCKET	\N	\N	\N	\N	5.90	3.80	9.70	5.00	\N	2026-03-10 23:53:53.583419+00	\N
1b6dce71-8e1b-4191-8c1a-0c6d0878e733	2024-11-23	2024	47	CRANE	\N	\N	\N	\N	6.70	3.30	10.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9d8efb78-bcf4-49d4-8c7f-683d9eeff5d7	2024-11-23	2024	47	BUCKET	\N	\N	\N	\N	5.80	3.10	8.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
ed23dae6-080b-48b3-ac59-0953123ad89f	2024-11-30	2024	48	CRANE	\N	\N	\N	\N	6.20	3.60	9.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3109a138-dc77-47a8-a04d-c6f308745349	2024-11-30	2024	48	BUCKET	\N	\N	\N	\N	5.40	3.20	8.60	5.00	\N	2026-03-10 23:53:53.583419+00	\N
360db3f8-d4ef-4afe-93b9-202193247c1d	2024-12-07	2024	49	CRANE	\N	\N	\N	\N	6.80	3.30	10.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
43f04118-0575-442c-871a-41658d45840f	2024-12-07	2024	49	BUCKET	\N	\N	\N	\N	5.50	2.80	8.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
40dd9cff-c1fb-4668-af41-178fdb1681cb	2024-12-14	2024	50	CRANE	\N	\N	\N	\N	5.90	4.20	10.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
093ecd85-dfc8-46a0-bcc0-9ad5a4a5e409	2024-12-14	2024	50	BUCKET	\N	\N	\N	\N	5.10	3.20	8.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
ee72fa82-777d-49b4-ba85-1848c6505510	2024-12-21	2024	51	CRANE	\N	\N	\N	\N	6.50	3.20	9.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ca34d61f-2cba-408c-a50b-e73343060c7c	2024-12-21	2024	51	BUCKET	\N	\N	\N	\N	5.10	2.70	7.80	5.00	\N	2026-03-10 23:53:53.583419+00	\N
c560d516-8df1-4482-bce0-1432c2c707e4	2024-12-28	2024	52	CRANE	\N	\N	\N	\N	6.40	2.70	9.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
455aac58-06a1-48f3-841f-d3699312ad77	2024-12-28	2024	52	BUCKET	\N	\N	\N	\N	4.80	2.30	7.10	5.00	\N	2026-03-10 23:53:53.583419+00	\N
bac6c22e-a9e0-4b1a-a468-cc8705eb1899	2023-01-07	2023	1	CRANE	\N	\N	\N	\N	1.70	3.40	5.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
cf5817df-d4e6-46ec-8d3a-a3688d5e2ab0	2023-01-07	2023	1	BUCKET	\N	\N	\N	\N	3.80	2.30	6.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
600afc05-6c43-4254-b8ca-0e77a38d46e5	2023-01-14	2023	2	CRANE	\N	\N	\N	\N	1.10	3.90	5.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c8d59591-1ab2-4b29-93e5-bcf018343940	2023-01-14	2023	2	BUCKET	\N	\N	\N	\N	1.70	4.30	6.00	4.00	\N	2026-03-10 23:53:53.583419+00	\N
9c01e2b0-faf9-4e88-8536-2426c75b51d4	2023-01-21	2023	3	CRANE	\N	\N	\N	\N	1.40	3.40	4.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
36610210-9624-4301-b3cb-598cec566117	2023-01-21	2023	3	BUCKET	\N	\N	\N	\N	2.00	3.40	5.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
44fd8181-a197-437d-83a8-02ab7df8f3ba	2023-01-28	2023	4	CRANE	\N	\N	\N	\N	0.90	3.60	4.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6a342786-b3b7-4ed1-9115-490f664c4484	2023-01-28	2023	4	BUCKET	\N	\N	\N	\N	1.90	3.00	4.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
778b9c2e-c52f-483c-8bcc-e3ed31ba39b6	2023-02-04	2023	5	CRANE	\N	\N	\N	\N	1.40	2.80	4.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
583ecb9b-d234-4271-b9af-3dccd0fd4f81	2023-02-04	2023	5	BUCKET	\N	\N	\N	\N	1.70	3.10	4.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
720a1e1d-90fc-487c-bd9a-8cb247081f61	2023-02-11	2023	6	CRANE	\N	\N	\N	\N	1.30	1.60	2.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
42975ce5-7741-4b2f-9c79-792505d05eec	2023-02-11	2023	6	BUCKET	\N	\N	\N	\N	1.60	2.60	4.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
c2bb2716-049e-451a-b816-ed5c2b18dcba	2023-02-18	2023	7	CRANE	\N	\N	\N	\N	1.50	1.10	2.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
cbae9abc-7439-4c96-bc9a-0098cd99e8bb	2023-02-18	2023	7	BUCKET	\N	\N	\N	\N	1.50	2.60	4.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b40f151b-aec1-4a0e-b48c-97548ccc8126	2023-02-25	2023	8	CRANE	\N	\N	\N	\N	1.00	1.30	2.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ad9caa6f-f2c5-4ad6-8acb-8eb73ebad06e	2023-02-25	2023	8	BUCKET	\N	\N	\N	\N	2.10	2.50	4.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
6111b717-4902-4868-bf28-538792bfbe63	2023-03-04	2023	9	CRANE	\N	\N	\N	\N	0.70	1.50	2.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
4bc70eab-ff64-4a64-b118-a21d37bb5424	2023-03-04	2023	9	BUCKET	\N	\N	\N	\N	2.10	2.40	4.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
947e5931-d900-4da0-8578-98f04cace87c	2023-03-11	2023	10	CRANE	\N	\N	\N	\N	1.00	1.50	2.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
4bed6441-810e-4410-a64b-9623d6c47d7b	2023-03-11	2023	10	BUCKET	\N	\N	\N	\N	2.00	2.10	4.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
d78948a4-983e-4bc8-86ed-ea05d497f704	2023-03-18	2023	11	CRANE	\N	\N	\N	\N	0.80	1.20	2.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
fbb2e538-f6e5-4056-bebe-ef1e92fac25d	2023-03-18	2023	11	BUCKET	\N	\N	\N	\N	1.60	2.30	3.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
708937e3-0399-4531-954d-37137015fc46	2023-03-25	2023	12	CRANE	\N	\N	\N	\N	0.90	1.00	1.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
619ec186-4c33-4033-a519-8ebe1ec954e8	2023-03-25	2023	12	BUCKET	\N	\N	\N	\N	1.70	1.60	3.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
3782ba1a-757e-4414-af27-0708fc8015e9	2023-04-01	2023	13	CRANE	\N	\N	\N	\N	1.30	0.70	2.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b37e8bfd-82be-4e8d-9f70-b36310f3f68f	2023-04-01	2023	13	BUCKET	\N	\N	\N	\N	1.80	1.30	3.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
7a714c42-a6bc-49f1-87e5-2b543d2cc112	2023-04-08	2023	14	CRANE	\N	\N	\N	\N	1.60	0.70	2.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c4d598a4-e6f8-4b6f-ba44-3eab34ce0776	2023-04-08	2023	14	BUCKET	\N	\N	\N	\N	2.00	2.70	2.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
19984f37-9b08-4f35-b946-a1722a052caa	2023-04-15	2023	15	CRANE	\N	\N	\N	\N	1.00	1.60	2.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
da213fae-ad94-46dc-aed8-55db42895786	2023-04-15	2023	15	BUCKET	\N	\N	\N	\N	1.80	1.40	3.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
7902fe91-3acb-49d3-b1b7-f83801656d7a	2023-04-22	2023	16	CRANE	\N	\N	\N	\N	1.40	1.60	3.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
340407af-6e21-49ed-b118-edc8b09ca943	2023-04-22	2023	16	BUCKET	\N	\N	\N	\N	1.90	1.30	3.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
28b89864-eda0-4ca2-84cc-d28c5cbdd4bc	2023-04-29	2023	17	CRANE	\N	\N	\N	\N	1.70	1.70	3.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bddc3396-10b7-4d77-9caa-7be0b322b70c	2023-04-29	2023	17	BUCKET	\N	\N	\N	\N	2.00	1.50	3.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b15e1e7f-5537-4bab-9903-1cd8d458afaa	2023-05-06	2023	18	CRANE	\N	\N	\N	\N	1.50	1.50	3.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
884f1958-048d-42c5-8a53-380765a9b023	2023-05-06	2023	18	BUCKET	\N	\N	\N	\N	1.90	1.40	3.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
62303158-a809-4978-9e0c-8e3165775816	2023-05-13	2023	19	CRANE	\N	\N	\N	\N	1.90	1.40	3.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6df4a282-d3d6-4d61-bc0a-ed2bdb77704d	2023-05-13	2023	19	BUCKET	\N	\N	\N	\N	1.70	1.40	3.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
c3603bdd-e5e7-4353-9782-f974485d064f	2023-05-20	2023	20	CRANE	\N	\N	\N	\N	2.00	1.50	3.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
c3c18987-e1a9-4991-bcf8-0e01fa53df81	2023-05-20	2023	20	BUCKET	\N	\N	\N	\N	2.00	1.90	3.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
3c6ace84-66e7-4058-a6ca-43f1c1f37d91	2023-05-27	2023	21	CRANE	\N	\N	\N	\N	2.10	2.70	4.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bad9c6b8-a81a-47cd-be63-11e9d027c25d	2023-05-27	2023	21	BUCKET	\N	\N	\N	\N	2.00	1.50	3.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
40e73739-f741-4197-bf79-7a6905d3fdf8	2023-06-03	2023	22	CRANE	\N	\N	\N	\N	2.80	1.40	4.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d23d5749-83ab-4743-8b87-72d1e5990ae3	2023-06-03	2023	22	BUCKET	\N	\N	\N	\N	2.00	1.40	3.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b8fef4af-2e75-4f13-b29f-7f145517140a	2023-06-10	2023	23	CRANE	\N	\N	\N	\N	2.60	1.80	4.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
f035e034-884d-4758-981c-f3e68b394eb8	2023-06-10	2023	23	BUCKET	\N	\N	\N	\N	2.10	1.40	3.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
ff36b792-462f-437a-b37d-fe476f9900c8	2023-06-17	2023	24	CRANE	\N	\N	\N	\N	1.60	3.10	4.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
29529496-0bd2-4e63-9e9e-48d4adbfd783	2023-06-17	2023	24	BUCKET	\N	\N	\N	\N	2.00	1.60	3.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
1c76160e-50ef-46e1-8ee9-9f5811b03615	2023-06-24	2023	25	CRANE	\N	\N	\N	\N	2.90	1.30	4.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
8b1bc3b1-0ddc-4ad1-8cd8-2419dc042564	2023-06-24	2023	25	BUCKET	\N	\N	\N	\N	2.10	1.30	3.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
79b78d9f-be2e-4639-99e4-ccde2391b93e	2023-07-01	2023	26	CRANE	\N	\N	\N	\N	2.70	1.50	4.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
182a66a9-6449-4389-8a3c-ea848478dd50	2023-07-01	2023	26	BUCKET	\N	\N	\N	\N	2.00	1.60	3.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
3cc2c5db-54a5-49fa-b413-6a6c97c5e728	2023-07-08	2023	27	CRANE	\N	\N	\N	\N	2.70	1.90	4.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d1e2124c-304f-4198-a606-c61b8e1ab9fa	2023-07-08	2023	27	BUCKET	\N	\N	\N	\N	2.10	1.70	3.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
36463694-fd51-45e1-930b-c78812288fcc	2023-07-15	2023	28	CRANE	\N	\N	\N	\N	2.30	2.00	4.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
29cb18ed-527b-4f6d-8e4f-6f10fb37346f	2023-07-15	2023	28	BUCKET	\N	\N	\N	\N	1.90	2.00	3.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
878e893d-d4d3-42bd-a3ec-d27554049237	2023-07-22	2023	29	CRANE	\N	\N	\N	\N	2.40	2.70	5.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0da670db-092f-4f0e-9c0b-43eb6fed0ae3	2023-07-22	2023	29	BUCKET	\N	\N	\N	\N	2.40	2.30	4.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
dab07fb5-c924-472a-9670-3da5ca31887c	2023-07-29	2023	30	CRANE	\N	\N	\N	\N	2.60	2.50	5.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
77a1de80-d452-4037-b8f8-dc346f9f5f3f	2023-07-29	2023	30	BUCKET	\N	\N	\N	\N	3.30	2.20	5.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
05666d86-e928-4cfb-a2d2-32bd83ff6207	2023-08-05	2023	31	CRANE	\N	\N	\N	\N	3.10	2.50	5.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1556fe60-ae74-4e6c-b613-ae8d1805f59c	2023-08-05	2023	31	BUCKET	\N	\N	\N	\N	3.60	2.20	5.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
672fb61a-b7ea-4292-8c74-3588d01fad60	2023-08-12	2023	32	CRANE	\N	\N	\N	\N	3.00	2.50	5.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ccbf815d-e821-43ac-b639-769306afc992	2023-08-12	2023	32	BUCKET	\N	\N	\N	\N	3.60	2.40	6.00	4.00	\N	2026-03-10 23:53:53.583419+00	\N
9366ae0f-eec6-44e7-bc46-5ac6d517d9ac	2023-08-19	2023	33	CRANE	\N	\N	\N	\N	3.20	2.70	5.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
7d99c384-0ba0-451f-8093-73131a3dafc1	2023-08-19	2023	33	BUCKET	\N	\N	\N	\N	3.40	3.20	6.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
a1dde301-d183-4c20-b43b-3338da28ecdc	2023-08-26	2023	34	CRANE	\N	\N	\N	\N	3.20	2.80	6.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b7a67847-b477-47cd-98d9-116c30f9b16a	2023-08-26	2023	34	BUCKET	\N	\N	\N	\N	3.40	3.80	7.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
fe904c7b-17c4-4aa6-857a-3e60f5c93c10	2023-09-02	2023	35	CRANE	\N	\N	\N	\N	3.90	3.10	7.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d613d1c5-8d93-4e7b-871d-248aa0d072f3	2023-09-02	2023	35	BUCKET	\N	\N	\N	\N	4.80	2.80	7.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
4d38f0af-5dfc-4ee6-8b22-2a8978a3aaae	2023-09-09	2023	36	CRANE	\N	\N	\N	\N	4.20	2.90	7.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
657ea50d-ee31-4492-a7d0-4ec8b7a7eee5	2023-09-09	2023	36	BUCKET	\N	\N	\N	\N	5.10	2.70	7.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
8b1f7067-7006-4279-ad61-650ea5f9ba6b	2023-09-16	2023	37	CRANE	\N	\N	\N	\N	4.80	2.90	7.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
03da2070-0cf1-4de0-bc68-910d085d2c2e	2023-09-16	2023	37	BUCKET	\N	\N	\N	\N	5.50	3.10	8.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
36c16c13-be82-4562-b3fb-9604833263c0	2023-09-23	2023	38	CRANE	\N	\N	\N	\N	4.50	4.40	8.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
7234078d-1c5f-449b-a3db-07c5a2512f57	2023-09-23	2023	38	BUCKET	\N	\N	\N	\N	5.00	3.80	8.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
139897b7-4b2b-4d3a-b119-309a8c7595d6	2023-09-30	2023	39	CRANE	\N	\N	\N	\N	5.60	5.10	10.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
35f98370-7a4c-4f8d-8314-469debe8eb3e	2023-09-30	2023	39	BUCKET	\N	\N	\N	\N	6.10	3.20	9.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
57976117-1eec-4143-a287-c09f9dde43e2	2023-10-07	2023	40	CRANE	\N	\N	\N	\N	6.70	4.80	11.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
011dad72-01d4-4715-8d94-1849f5c63f0a	2023-10-07	2023	40	BUCKET	\N	\N	\N	\N	6.70	3.40	10.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
0245a32c-4ee9-4f42-980a-0a7726436d95	2023-10-14	2023	41	CRANE	\N	\N	\N	\N	7.20	4.50	11.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
fd500941-6b03-404f-9bad-7a4a962cfc15	2023-10-14	2023	41	BUCKET	\N	\N	\N	\N	6.80	3.60	10.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
00206466-311e-4d87-93e5-8b497c595835	2023-10-21	2023	42	CRANE	\N	\N	\N	\N	7.40	5.40	12.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9fbddfa5-1ad3-4210-a3ba-9078d4c531b3	2023-10-21	2023	42	BUCKET	\N	\N	\N	\N	7.50	3.90	11.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
48c1eb33-4464-49f7-a83f-8c6dcf041f4b	2023-10-28	2023	43	CRANE	\N	\N	\N	\N	7.60	5.00	12.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
59e11a7e-fbb0-4a6a-8ff3-1b484211780d	2023-10-28	2023	43	BUCKET	\N	\N	\N	\N	7.60	3.90	11.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
e61f4c99-15bb-4fbd-88b9-046959dec664	2023-11-04	2023	44	CRANE	\N	\N	\N	\N	7.70	4.50	12.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
61683290-314e-489a-9c75-ef6901c2d386	2023-11-04	2023	44	BUCKET	\N	\N	\N	\N	7.60	3.40	11.00	4.00	\N	2026-03-10 23:53:53.583419+00	\N
cd46fcde-1708-4e1a-bcdb-a1fbc3dd383d	2023-11-11	2023	45	CRANE	\N	\N	\N	\N	7.50	4.60	12.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0f310c4e-3598-4018-af38-0c874c9168c6	2023-11-11	2023	45	BUCKET	\N	\N	\N	\N	7.80	3.40	11.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b9f1839d-4a04-4f90-88ab-d20d56d4cdcb	2023-11-18	2023	46	CRANE	\N	\N	\N	\N	8.00	4.30	12.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b6b74fd7-7bb3-4ba2-a7a4-9b9403217730	2023-11-18	2023	46	BUCKET	\N	\N	\N	\N	7.60	3.20	10.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
8039bc18-817c-4c51-9d1f-f86ceb780a5f	2023-11-25	2023	47	CRANE	\N	\N	\N	\N	7.50	4.50	12.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e192bdf5-898d-40a6-9bb0-a59c7e34dd46	2023-11-25	2023	47	BUCKET	\N	\N	\N	\N	7.30	3.00	10.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
15894cbc-b186-4f39-9fb5-5d295c944f6e	2023-12-02	2023	48	CRANE	\N	\N	\N	\N	8.10	3.80	11.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
92f3fcaf-cd39-42e3-b855-8b44ebe34a71	2023-12-02	2023	48	BUCKET	\N	\N	\N	\N	7.70	2.90	10.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
3e36b548-b7fb-4046-81c8-c0dd5cbead36	2023-12-09	2023	49	CRANE	\N	\N	\N	\N	7.50	4.30	11.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1cd147a8-366b-41b6-9320-37d18499482d	2023-12-09	2023	49	BUCKET	\N	\N	\N	\N	7.50	2.80	10.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
78b9f8df-c581-4533-980d-3b46a55c16a5	2023-12-16	2023	50	CRANE	\N	\N	\N	\N	7.30	4.30	11.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
00780b79-bd2e-493e-ad07-251556dd6e24	2023-12-16	2023	50	BUCKET	\N	\N	\N	\N	7.00	3.40	10.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
16ddd837-29f4-404f-8106-3fe9aa984788	2023-12-23	2023	51	CRANE	\N	\N	\N	\N	7.60	3.90	11.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1014940a-304f-44ef-99b4-738f5138626b	2023-12-23	2023	51	BUCKET	\N	\N	\N	\N	6.80	3.20	10.00	4.00	\N	2026-03-10 23:53:53.583419+00	\N
4a9053ed-c9f0-4cef-bc38-d2b2039a7b6f	2022-01-08	2022	1	CRANE	\N	\N	\N	\N	5.90	3.30	9.20	2.75	\N	2026-03-10 23:53:53.583419+00	\N
94db0a7d-0c04-4479-b09a-aef666f275f0	2022-01-08	2022	1	BUCKET	\N	\N	\N	\N	7.40	5.30	12.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
f76e1db2-ddd9-494d-b917-dae28f7e597a	2022-01-15	2022	2	CRANE	\N	\N	\N	\N	6.00	2.80	8.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
653871f5-6db3-4839-be91-8481fffc162d	2022-01-15	2022	2	BUCKET	\N	\N	\N	\N	7.50	4.40	11.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
2852f489-f2a4-451f-9f2a-06d2320b11ad	2022-01-22	2022	3	CRANE	\N	\N	\N	\N	6.50	2.20	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
6b82d121-1467-421c-9c73-6da8fd176fe0	2022-01-22	2022	3	BUCKET	\N	\N	\N	\N	6.80	4.90	11.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
ed5f779e-b3e5-4a63-9891-86728b1f4d6f	2022-01-29	2022	4	CRANE	\N	\N	\N	\N	6.10	2.60	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
4bfe5f7a-77c3-48f0-9c29-f99b2602322e	2022-01-29	2022	4	BUCKET	\N	\N	\N	\N	7.40	3.80	11.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b97639e2-e826-41a7-994e-60fec24c3c4f	2022-02-05	2022	5	CRANE	\N	\N	\N	\N	5.00	2.80	7.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
60ed0867-11f6-4fb5-a1b9-172aeeddf53f	2022-02-05	2022	5	BUCKET	\N	\N	\N	\N	6.60	4.10	10.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
4e4c1076-0b8f-4dae-a203-7cd6ad2695cf	2022-02-12	2022	6	CRANE	\N	\N	\N	\N	4.60	3.10	7.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
dcc60cf6-361a-481d-90eb-0ed4e6204966	2022-02-12	2022	6	BUCKET	\N	\N	\N	\N	5.80	4.40	10.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
c1b1f47d-1471-4127-b953-87a8565fc406	2022-02-19	2022	7	CRANE	\N	\N	\N	\N	4.60	2.50	7.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
b7f42509-ad65-4e55-a693-8a129ba61d2d	2022-02-19	2022	7	BUCKET	\N	\N	\N	\N	5.40	3.80	9.20	4.00	\N	2026-03-10 23:53:53.583419+00	\N
eb2707be-e23c-43fd-8dbd-c993b937adc5	2022-02-26	2022	8	CRANE	\N	\N	\N	\N	4.60	2.00	6.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
e8285e03-2481-4bad-b452-b5ba2515c69e	2022-02-26	2022	8	BUCKET	\N	\N	\N	\N	3.40	5.10	8.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
5a19227f-badd-4afd-b070-3ca15b8e1f75	2022-03-05	2022	9	CRANE	\N	\N	\N	\N	3.90	2.40	6.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
d77c3b43-157a-490b-905d-e9a48c6781a3	2022-03-05	2022	9	BUCKET	\N	\N	\N	\N	4.40	3.20	7.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
ed2d1b40-ab1c-472a-a9b5-d582ee013ca1	2022-03-12	2022	10	CRANE	\N	\N	\N	\N	3.50	2.30	5.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
a0a4594d-8e6b-4c46-8765-ab725917b96a	2022-03-12	2022	10	BUCKET	\N	\N	\N	\N	4.10	3.20	7.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
eb207cd9-3ac8-48b9-8495-e490ad91e96e	2022-03-19	2022	11	CRANE	\N	\N	\N	\N	3.10	2.60	5.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
bd158235-c88f-4bdc-818b-5abda7fe4d06	2022-03-19	2022	11	BUCKET	\N	\N	\N	\N	3.30	3.50	6.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
21d19b2b-3f6d-4c7d-b079-5b7d7358a344	2022-03-26	2022	12	CRANE	\N	\N	\N	\N	2.90	2.90	5.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
05f1361f-93d2-4016-9112-7c67657872d4	2022-03-26	2022	12	BUCKET	\N	\N	\N	\N	2.90	3.70	6.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
52a169e5-7102-49c7-9721-32cd0dfc7e6b	2022-04-02	2022	13	CRANE	\N	\N	\N	\N	3.30	2.10	5.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
e1f20a9e-086c-4196-b036-64ec312bd629	2022-04-02	2022	13	BUCKET	\N	\N	\N	\N	2.90	3.70	6.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
af623af3-29a9-4bcb-bede-234bd2f0db95	2022-04-09	2022	14	CRANE	\N	\N	\N	\N	3.20	2.60	5.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
59d53031-a5f8-44b5-a819-3c4b4ca36469	2022-04-09	2022	14	BUCKET	\N	\N	\N	\N	2.90	3.80	6.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
e95c6df8-760e-4b61-a83a-15f1cfa34563	2022-04-16	2022	15	CRANE	\N	\N	\N	\N	3.10	2.40	5.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
d2d51452-2110-498e-88ae-ff14c0a07919	2022-04-16	2022	15	BUCKET	\N	\N	\N	\N	3.40	3.30	6.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
1e9dbe66-b741-4722-bd44-7c0a570889c7	2022-04-23	2022	16	CRANE	\N	\N	\N	\N	3.00	2.60	5.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
01d9d3f5-22eb-45bf-9a26-cca279266a97	2022-04-23	2022	16	BUCKET	\N	\N	\N	\N	3.10	3.40	6.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
603a5cfd-6a54-422b-b53b-aa453e115430	2022-04-30	2022	17	CRANE	\N	\N	\N	\N	2.50	2.40	4.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
578ec57e-cdb2-4832-95cc-62e856a57cb1	2022-04-30	2022	17	BUCKET	\N	\N	\N	\N	2.70	3.90	6.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
099dfa64-9dd4-466f-a6a1-901ee469785c	2022-05-07	2022	18	CRANE	\N	\N	\N	\N	2.80	2.20	5.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
abe79cfd-6e77-4bec-8e65-d0850cb7c293	2022-05-07	2022	18	BUCKET	\N	\N	\N	\N	2.80	3.90	6.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
95343ef0-3b8e-433c-a7bd-fb700ff86791	2022-05-14	2022	19	CRANE	\N	\N	\N	\N	2.70	2.60	5.20	2.75	\N	2026-03-10 23:53:53.583419+00	\N
a7b202c9-25ec-4048-ba99-2a47719e5010	2022-05-14	2022	19	BUCKET	\N	\N	\N	\N	2.90	4.20	7.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
d950dfd1-6e73-4afb-a344-c508da033045	2022-05-21	2022	20	CRANE	\N	\N	\N	\N	2.70	2.60	5.20	2.75	\N	2026-03-10 23:53:53.583419+00	\N
4b2601fa-6e25-416c-a440-d5dbe1b3145f	2022-05-21	2022	20	BUCKET	\N	\N	\N	\N	2.90	4.20	7.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
a366a3b1-836d-413f-b8d4-37cd69d382f8	2022-05-28	2022	21	CRANE	\N	\N	\N	\N	2.30	2.60	4.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
9760e096-9026-4289-b319-8e015b230f46	2022-05-28	2022	21	BUCKET	\N	\N	\N	\N	3.60	4.00	7.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
2fc97d81-f6bf-4148-866d-2b3dc5c533e1	2022-06-04	2022	22	CRANE	\N	\N	\N	\N	2.40	2.30	4.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
81f6adaf-cf7a-4018-a70c-e553160fe3ef	2022-06-04	2022	22	BUCKET	\N	\N	\N	\N	3.80	3.90	7.70	4.00	\N	2026-03-10 23:53:53.583419+00	\N
d3b33dd7-0607-48d1-a20b-a96dd340d9e5	2022-06-11	2022	23	CRANE	\N	\N	\N	\N	2.20	2.50	4.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
f314b42a-ceb8-4b6b-8573-3f545154305f	2022-06-11	2022	23	BUCKET	\N	\N	\N	\N	3.60	4.30	7.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
904f7967-4416-4d9a-bf80-008cf1e1b349	2022-06-18	2022	24	CRANE	\N	\N	\N	\N	2.00	2.50	4.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
e843d9de-dee6-4b86-8f01-6f77e1b083e8	2022-06-18	2022	24	BUCKET	\N	\N	\N	\N	3.80	4.50	8.30	4.00	\N	2026-03-10 23:53:53.583419+00	\N
a965f6ef-e4fe-4497-a54f-474b7880418e	2022-06-25	2022	25	CRANE	\N	\N	\N	\N	2.00	2.60	4.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
fc1549f7-972a-471b-ba95-b91cd1a5eb87	2022-06-25	2022	25	BUCKET	\N	\N	\N	\N	3.20	4.40	7.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
b2ce7bd6-9e67-46b8-a540-ec35899c7e9d	2022-07-02	2022	26	CRANE	\N	\N	\N	\N	2.00	3.20	5.20	2.50	\N	2026-03-10 23:53:53.583419+00	\N
76a9e3db-6d3d-4c12-abf2-fb4c6416493d	2022-07-02	2022	26	BUCKET	\N	\N	\N	\N	1.90	2.90	4.80	5.50	\N	2026-03-10 23:53:53.583419+00	\N
273d4b32-66f7-4f8e-b38c-0868f9a9930c	2022-07-09	2022	27	CRANE	\N	\N	\N	\N	1.80	3.40	5.20	2.50	\N	2026-03-10 23:53:53.583419+00	\N
ff4703b9-b9f8-49cf-81dc-a7f244bdfaa1	2022-07-09	2022	27	BUCKET	\N	\N	\N	\N	1.80	2.60	4.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
22ed693b-35db-4fd1-96c9-bf580c674536	2022-07-16	2022	28	CRANE	\N	\N	\N	\N	1.90	3.60	5.50	2.50	\N	2026-03-10 23:53:53.583419+00	\N
a636db43-0c33-4501-bd97-9c4433476737	2022-07-16	2022	28	BUCKET	\N	\N	\N	\N	1.70	2.70	4.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
85edd551-3b3f-4108-8004-13c381c9b33b	2022-07-23	2022	29	CRANE	\N	\N	\N	\N	2.30	3.10	5.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
cfe2ae2e-69b3-4376-9282-8f1d06fdacef	2022-07-23	2022	29	BUCKET	\N	\N	\N	\N	1.90	2.70	4.60	5.50	\N	2026-03-10 23:53:53.583419+00	\N
11bbc59c-93e9-46de-a9c6-b49e97aaed9d	2022-07-30	2022	30	CRANE	\N	\N	\N	\N	1.80	3.60	5.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
75cd47ef-3435-4cf1-b4e4-d18d0b428870	2022-07-30	2022	30	BUCKET	\N	\N	\N	\N	1.40	3.20	4.60	5.50	\N	2026-03-10 23:53:53.583419+00	\N
d565a00b-ed5d-46bc-9ff2-87605002e568	2022-08-06	2022	31	CRANE	\N	\N	\N	\N	2.10	2.90	5.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
6f14ab9e-3b68-465c-b3b4-72e29606e721	2022-08-06	2022	31	BUCKET	\N	\N	\N	\N	2.10	2.70	4.80	5.50	\N	2026-03-10 23:53:53.583419+00	\N
fa27d606-21b3-412b-8107-8eb0ac7c1763	2022-08-13	2022	32	CRANE	\N	\N	\N	\N	2.30	3.00	5.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
12a11006-322b-47fd-931f-defe66ab605d	2022-08-13	2022	32	BUCKET	\N	\N	\N	\N	2.10	3.00	5.10	5.50	\N	2026-03-10 23:53:53.583419+00	\N
9e10231b-cc70-4256-9fa4-8c9dca281f08	2022-08-20	2022	33	CRANE	\N	\N	\N	\N	2.40	3.60	6.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
5facb498-575b-488e-ae56-0409954ada25	2022-08-20	2022	33	BUCKET	\N	\N	\N	\N	2.20	3.20	5.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
b0f804a7-27b5-45a9-8c3f-e337a6da06ae	2022-08-27	2022	34	CRANE	\N	\N	\N	\N	3.10	3.20	6.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
ca50b22d-04cc-45cf-999a-697e243e84c7	2022-08-27	2022	34	BUCKET	\N	\N	\N	\N	2.50	2.70	5.20	5.50	\N	2026-03-10 23:53:53.583419+00	\N
4ed69b34-7c84-49cb-9cd9-9ccb61c01106	2022-09-03	2022	35	CRANE	\N	\N	\N	\N	2.60	3.70	6.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
8bcf0123-a47f-4608-8707-dc4a7f2b9547	2022-09-03	2022	35	BUCKET	\N	\N	\N	\N	2.50	2.80	5.30	5.50	\N	2026-03-10 23:53:53.583419+00	\N
69b8da70-b52d-4965-94e8-deb59a0d8102	2022-09-10	2022	36	CRANE	\N	\N	\N	\N	3.10	3.20	6.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
a720a253-1fd4-4f34-972b-b2f2416192d8	2022-09-10	2022	36	BUCKET	\N	\N	\N	\N	2.40	2.80	5.20	5.50	\N	2026-03-10 23:53:53.583419+00	\N
137c83c7-1e6e-4011-b73e-e80b1df19ba8	2022-09-17	2022	37	CRANE	\N	\N	\N	\N	3.10	3.40	6.50	2.50	\N	2026-03-10 23:53:53.583419+00	\N
694765e7-b5e5-432e-b2d9-eb35770ac2cc	2022-09-17	2022	37	BUCKET	\N	\N	\N	\N	2.70	2.60	5.30	5.50	\N	2026-03-10 23:53:53.583419+00	\N
6d7cab25-2f8c-474f-a05b-35e71da305a7	2022-09-24	2022	38	CRANE	\N	\N	\N	\N	3.40	3.30	6.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
70ce89a6-db71-423f-8565-e131cb0d065b	2022-09-24	2022	38	BUCKET	\N	\N	\N	\N	2.80	2.90	5.70	5.50	\N	2026-03-10 23:53:53.583419+00	\N
f6ed31cf-b713-4c39-8af1-97aa4d0f1572	2022-10-01	2022	39	CRANE	\N	\N	\N	\N	3.40	3.20	6.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
698a21bc-d9c4-4461-8853-9a8662364d35	2022-10-01	2022	39	BUCKET	\N	\N	\N	\N	3.10	3.20	6.30	5.50	\N	2026-03-10 23:53:53.583419+00	\N
6bc6b006-d123-42f5-b5cd-b1881c9f019a	2022-10-08	2022	40	CRANE	\N	\N	\N	\N	3.40	3.00	6.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
36394a7b-343d-4521-9b02-78d66a6280f8	2022-10-08	2022	40	BUCKET	\N	\N	\N	\N	3.20	3.00	6.20	5.50	\N	2026-03-10 23:53:53.583419+00	\N
5e1f3dc8-8dc7-4d21-9996-4aaa228c56b5	2022-10-15	2022	41	CRANE	\N	\N	\N	\N	3.50	3.60	7.10	2.50	\N	2026-03-10 23:53:53.583419+00	\N
e023f02e-46be-4ac7-ade9-a0e7f70638ef	2022-10-15	2022	41	BUCKET	\N	\N	\N	\N	3.20	2.90	6.10	5.50	\N	2026-03-10 23:53:53.583419+00	\N
60770dfc-3301-4f1e-a4cc-7a786f4752bc	2022-10-22	2022	42	CRANE	\N	\N	\N	\N	3.60	3.80	7.40	2.50	\N	2026-03-10 23:53:53.583419+00	\N
4e271055-4670-40ce-899d-65b7060a6438	2022-10-22	2022	42	BUCKET	\N	\N	\N	\N	3.70	2.70	6.40	5.50	\N	2026-03-10 23:53:53.583419+00	\N
d09a6ec2-93e4-4a4d-bd2b-2e02b71b360c	2022-10-29	2022	43	CRANE	\N	\N	\N	\N	3.40	3.90	7.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
69d1b625-76b5-4f29-b1c3-2817a325764b	2022-10-29	2022	43	BUCKET	\N	\N	\N	\N	3.50	2.70	6.20	5.50	\N	2026-03-10 23:53:53.583419+00	\N
f894c5ce-4867-405d-b2ca-23a59cbe1dd4	2022-11-05	2022	44	CRANE	\N	\N	\N	\N	3.20	3.20	6.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
37d19454-9471-4f8d-a250-93a8f966606e	2022-11-05	2022	44	BUCKET	\N	\N	\N	\N	3.20	2.70	5.90	5.50	\N	2026-03-10 23:53:53.583419+00	\N
3e91e272-5228-4793-a5cf-25cc331ea12c	2022-11-12	2022	45	CRANE	\N	\N	\N	\N	3.80	3.10	6.90	2.33	\N	2026-03-10 23:53:53.583419+00	\N
b183f743-88a3-4e5a-b96c-e8f0aea537c0	2022-11-12	2022	45	BUCKET	\N	\N	\N	\N	3.10	2.50	5.60	5.67	\N	2026-03-10 23:53:53.583419+00	\N
de27eef6-2ee3-4e63-ba5e-c1d2763b5cf8	2022-11-19	2022	46	CRANE	\N	\N	\N	\N	3.50	3.10	6.60	2.33	\N	2026-03-10 23:53:53.583419+00	\N
bda78970-7226-42f9-822a-aaa80d9da9df	2022-11-19	2022	46	BUCKET	\N	\N	\N	\N	2.80	2.60	5.40	5.67	\N	2026-03-10 23:53:53.583419+00	\N
f21a0073-e94f-4232-a8eb-b0811bd090bd	2022-11-26	2022	47	CRANE	\N	\N	\N	\N	3.00	3.00	6.00	2.33	\N	2026-03-10 23:53:53.583419+00	\N
dc7ee72e-072e-491f-8f09-071b29a772d5	2022-11-26	2022	47	BUCKET	\N	\N	\N	\N	3.30	2.20	5.50	5.67	\N	2026-03-10 23:53:53.583419+00	\N
e4c72a66-00b8-40ad-b823-e7d71678ce2b	2022-12-03	2022	48	CRANE	\N	\N	\N	\N	2.80	2.40	5.20	2.33	\N	2026-03-10 23:53:53.583419+00	\N
266aec71-6dd7-42b1-ab26-f3d16208b54c	2022-12-03	2022	48	BUCKET	\N	\N	\N	\N	3.00	1.90	4.90	5.67	\N	2026-03-10 23:53:53.583419+00	\N
17dc96da-6d92-43ce-b389-52ed988068e4	2022-12-10	2022	49	CRANE	\N	\N	\N	\N	2.30	2.40	4.70	2.33	\N	2026-03-10 23:53:53.583419+00	\N
3e9b4924-bcb0-49a6-a251-e880a4badf20	2022-12-10	2022	49	BUCKET	\N	\N	\N	\N	2.70	1.70	4.40	5.67	\N	2026-03-10 23:53:53.583419+00	\N
a7dce399-9803-4342-810f-a059af13b267	2022-12-17	2022	50	CRANE	\N	\N	\N	\N	2.30	3.10	5.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1a18f317-f11f-4f9f-9714-4a4127568f76	2022-12-17	2022	50	BUCKET	\N	\N	\N	\N	2.90	2.40	5.30	5.00	\N	2026-03-10 23:53:53.583419+00	\N
8f8fcad3-3cc6-4b2c-a6a5-19048f268758	2022-12-24	2022	51	CRANE	\N	\N	\N	\N	1.90	2.90	4.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
53f1a130-da25-42e8-b8b6-675f894a0a96	2022-12-24	2022	51	BUCKET	\N	\N	\N	\N	2.90	2.30	4.90	5.00	\N	2026-03-10 23:53:53.583419+00	\N
1fe662da-2af1-49a3-be64-7b1acf5d2e0f	2021-01-02	2021	53	CRANE	\N	\N	\N	\N	4.90	2.10	7.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
bd03ff74-e7de-45b5-bb76-10fa22c47d0a	2021-01-02	2021	53	BUCKET	\N	\N	\N	\N	5.20	4.90	10.10	3.25	\N	2026-03-10 23:53:53.583419+00	\N
297c9f60-f60c-45a5-bd9c-d7816d2701a9	2021-01-09	2021	1	CRANE	\N	\N	\N	\N	5.30	1.50	6.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
35150eda-2936-42c4-83d8-491b5ee60201	2021-01-09	2021	1	BUCKET	\N	\N	\N	\N	5.60	4.70	10.30	3.25	\N	2026-03-10 23:53:53.583419+00	\N
6e88cc19-2473-4fa2-9e0e-b061898cce88	2021-01-16	2021	2	CRANE	\N	\N	\N	\N	4.80	1.40	6.20	2.75	\N	2026-03-10 23:53:53.583419+00	\N
fc2c8c0e-f258-4d38-b47b-118117389df7	2021-01-16	2021	2	BUCKET	\N	\N	\N	\N	4.90	4.60	9.50	3.25	\N	2026-03-10 23:53:53.583419+00	\N
a3ac37c3-df04-4580-b661-875d59e6f8b9	2021-01-23	2021	3	CRANE	\N	\N	\N	\N	4.40	1.70	6.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
b8fef0d5-c082-4911-a1a6-fbb7eaf4358d	2021-01-23	2021	3	BUCKET	\N	\N	\N	\N	4.70	4.30	9.00	3.25	\N	2026-03-10 23:53:53.583419+00	\N
d34cf8bf-6eb7-46ee-b96c-90d36eb75271	2021-01-30	2021	4	CRANE	\N	\N	\N	\N	4.30	1.50	5.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
ba65283a-c110-4496-8521-eeee5a26c2a7	2021-01-30	2021	4	BUCKET	\N	\N	\N	\N	4.80	3.60	8.40	3.25	\N	2026-03-10 23:53:53.583419+00	\N
c43b64db-4171-4ad2-bf57-6d93e68872ef	2021-02-06	2021	5	CRANE	\N	\N	\N	\N	1.60	3.70	5.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
878cdc53-1be7-4f9d-bcd4-ce3493c703fd	2021-02-06	2021	5	BUCKET	\N	\N	\N	\N	4.40	3.50	7.90	3.25	\N	2026-03-10 23:53:53.583419+00	\N
0ead9c2c-26e3-4419-b305-c5eaff9a871e	2021-02-13	2021	6	CRANE	\N	\N	\N	\N	3.80	1.20	5.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
a7f92d71-a55d-4da0-8385-9d6013762204	2021-02-13	2021	6	BUCKET	\N	\N	\N	\N	4.90	2.60	7.50	3.25	\N	2026-03-10 23:53:53.583419+00	\N
8cedac57-155a-4e93-99b6-f83ad1b73fdd	2021-02-20	2021	7	CRANE	\N	\N	\N	\N	3.40	1.20	4.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
d9e01416-d866-4aae-9ee7-2df1242f9039	2021-02-20	2021	7	BUCKET	\N	\N	\N	\N	4.50	2.50	7.00	3.25	\N	2026-03-10 23:53:53.583419+00	\N
998b57b7-f3df-4712-b82f-dbc4a55ce53a	2021-02-27	2021	8	CRANE	\N	\N	\N	\N	3.10	0.80	3.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
8991d4fb-dc0c-4a3f-9cd5-fc0e027c30e5	2021-02-27	2021	8	BUCKET	\N	\N	\N	\N	3.90	1.70	5.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
fda5ad4e-03d3-4524-9e06-86bba2d665e1	2021-03-06	2021	9	CRANE	\N	\N	\N	\N	2.60	0.90	3.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
840aeef8-6fee-48c9-b0e3-9de9b236bde3	2021-03-06	2021	9	BUCKET	\N	\N	\N	\N	3.40	1.50	4.90	3.75	\N	2026-03-10 23:53:53.583419+00	\N
40e2158c-efa7-4bb7-86cf-0e19c30c0901	2021-03-13	2021	10	CRANE	\N	\N	\N	\N	2.40	1.20	3.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
40c5eadd-bfae-4809-956a-dd6c651cd9e1	2021-03-13	2021	10	BUCKET	\N	\N	\N	\N	3.30	1.50	4.80	3.75	\N	2026-03-10 23:53:53.583419+00	\N
7123a0eb-b4c8-4403-9b5d-23a4e908a5ef	2021-03-20	2021	11	CRANE	\N	\N	\N	\N	2.30	1.10	3.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
49979cb3-51c1-4e20-89f3-78df86bd192e	2021-03-20	2021	11	BUCKET	\N	\N	\N	\N	3.20	1.20	4.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
a87caf2b-b154-4677-814e-9251372ea5fe	2021-03-27	2021	12	CRANE	\N	\N	\N	\N	2.40	1.40	3.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
807b7226-7326-4580-818f-93d8cfa3b71a	2021-03-27	2021	12	BUCKET	\N	\N	\N	\N	3.20	1.50	4.70	3.75	\N	2026-03-10 23:53:53.583419+00	\N
21ec4ed9-9388-4e60-8b30-7179e38d6a8c	2021-04-03	2021	13	CRANE	\N	\N	\N	\N	2.30	2.00	4.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
b019d927-deed-4ada-9088-5d4e52c21a12	2021-04-03	2021	13	BUCKET	\N	\N	\N	\N	3.70	1.70	5.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
f6d61451-c757-406d-a78f-5702a7e48a5a	2021-04-10	2021	14	CRANE	\N	\N	\N	\N	1.50	3.00	4.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
1d34b6aa-5c20-455f-a596-63490e7f83a5	2021-04-10	2021	14	BUCKET	\N	\N	\N	\N	3.80	2.20	6.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
b0914c23-075a-48f9-895a-011136bd1064	2021-04-17	2021	15	CRANE	\N	\N	\N	\N	3.00	2.30	5.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
9bf8b8b0-5d44-4779-a777-4dc74cbeabb2	2021-04-17	2021	15	BUCKET	\N	\N	\N	\N	4.30	2.50	6.80	3.75	\N	2026-03-10 23:53:53.583419+00	\N
cbb3ed33-0a2c-4b84-b550-276c82cf67a1	2021-04-24	2021	16	CRANE	\N	\N	\N	\N	4.10	1.60	5.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
5ad78cb0-fe96-453c-ad16-3af7e6827c37	2021-04-24	2021	16	BUCKET	\N	\N	\N	\N	5.00	2.00	7.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
a89511aa-9920-4e3e-adb8-2379e5a7dac6	2021-05-01	2021	17	CRANE	\N	\N	\N	\N	4.00	2.40	6.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
92dfa01a-edb4-4edc-b20b-dfe5652fa838	2021-05-01	2021	17	BUCKET	\N	\N	\N	\N	4.70	2.30	7.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
2ea1192c-d7f2-4045-8393-0d6a36f555c9	2021-05-08	2021	18	CRANE	\N	\N	\N	\N	4.40	3.00	7.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
7d066208-26bc-4412-b45f-b75e4eda052d	2021-05-08	2021	18	BUCKET	\N	\N	\N	\N	5.10	2.40	7.50	3.75	\N	2026-03-10 23:53:53.583419+00	\N
84c075b8-49a4-425a-9335-eb97a514579a	2021-05-15	2021	19	CRANE	\N	\N	\N	\N	5.20	2.90	8.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
5a337c7c-61d4-4ec1-80a8-e05b0b0c14de	2021-05-15	2021	19	BUCKET	\N	\N	\N	\N	5.20	2.40	7.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
390732ff-5106-4f93-9380-c4e750c8be29	2021-05-22	2021	20	CRANE	\N	\N	\N	\N	5.40	2.50	7.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
3aa93cab-8315-4c3a-892b-d20a6a8f0bee	2021-05-22	2021	20	BUCKET	\N	\N	\N	\N	5.10	2.30	7.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
d0e988f6-b3aa-4423-92cf-0dc53aa54d05	2021-05-29	2021	21	CRANE	\N	\N	\N	\N	5.70	2.60	8.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
65d0733d-4216-43b7-9c65-53bbde6901d0	2021-05-29	2021	21	BUCKET	\N	\N	\N	\N	5.50	2.10	7.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
20ac7501-18b6-414a-9780-319a0856e654	2021-06-05	2021	22	CRANE	\N	\N	\N	\N	6.10	2.40	8.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
faed7d30-b946-443d-9948-1f1bff9c9e5d	2021-06-05	2021	22	BUCKET	\N	\N	\N	\N	5.50	2.10	7.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
8a4eacbe-1f81-40f6-9241-032d99096433	2021-06-12	2021	23	CRANE	\N	\N	\N	\N	5.90	2.10	8.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
4d8e6138-f2d5-42f6-8d35-12be067ac457	2021-06-12	2021	23	BUCKET	\N	\N	\N	\N	5.50	2.40	7.90	3.75	\N	2026-03-10 23:53:53.583419+00	\N
f039d45a-1a3f-4b7a-b739-67b4cedf5c55	2021-06-19	2021	24	CRANE	\N	\N	\N	\N	5.80	2.30	8.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
913b4961-e525-419a-9f5d-fae2093e35a5	2021-06-19	2021	24	BUCKET	\N	\N	\N	\N	5.60	2.40	8.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
5bd3562e-0c62-400f-8ce9-5da12a9a9bbc	2021-06-26	2021	25	CRANE	\N	\N	\N	\N	5.60	1.90	7.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
4df631ec-7b6b-4b82-a8ac-c69a57c0cbfa	2021-06-26	2021	25	BUCKET	\N	\N	\N	\N	5.40	2.70	8.10	3.75	\N	2026-03-10 23:53:53.583419+00	\N
6a1e7ec7-7f88-4b13-84b0-2f9374033bc3	2021-07-03	2021	26	CRANE	\N	\N	\N	\N	4.90	2.00	6.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
40d39878-5bb6-4dab-8af2-1800edf23ab7	2021-07-03	2021	26	BUCKET	\N	\N	\N	\N	5.50	2.60	8.10	3.75	\N	2026-03-10 23:53:53.583419+00	\N
ea05c1ea-34bd-4a3f-8335-cde59a1d73ef	2021-07-10	2021	27	CRANE	\N	\N	\N	\N	4.90	2.00	6.90	2.75	\N	2026-03-10 23:53:53.583419+00	\N
362f51f4-edce-4516-9c1e-dc01c0978b79	2021-07-10	2021	27	BUCKET	\N	\N	\N	\N	5.80	2.40	8.20	3.75	\N	2026-03-10 23:53:53.583419+00	\N
5ce735ed-9781-422e-b4f1-3e9b46b3984c	2021-07-17	2021	28	CRANE	\N	\N	\N	\N	4.70	2.60	7.30	2.75	\N	2026-03-10 23:53:53.583419+00	\N
32a370ff-8066-4ee6-8ffe-c4b92c0a80bf	2021-07-17	2021	28	BUCKET	\N	\N	\N	\N	5.10	3.40	8.50	3.75	\N	2026-03-10 23:53:53.583419+00	\N
1ce34465-9f3b-4296-b5c9-9ecec78679ad	2021-07-24	2021	29	CRANE	\N	\N	\N	\N	6.00	1.60	7.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
6c59dd49-a2cd-42fe-9dcb-0c62e34f4db4	2021-07-24	2021	29	BUCKET	\N	\N	\N	\N	6.30	2.50	8.80	3.75	\N	2026-03-10 23:53:53.583419+00	\N
8ff6b59b-a9dd-4c89-81d4-871195d1195c	2021-07-31	2021	30	CRANE	\N	\N	\N	\N	5.60	2.20	7.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
d920b51a-24be-442b-8676-2830e3b05a5a	2021-07-31	2021	30	BUCKET	\N	\N	\N	\N	6.00	2.60	8.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
459fd693-c8fb-49ac-98ba-8c5ae7df324b	2021-08-07	2021	31	CRANE	\N	\N	\N	\N	5.70	2.40	8.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
86814d45-8f1c-487e-a278-a8b0963d3020	2021-08-07	2021	31	BUCKET	\N	\N	\N	\N	3.30	5.70	9.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
9f6429be-3641-4d02-9bdb-c7ee859773f0	2021-08-14	2021	32	CRANE	\N	\N	\N	\N	5.70	2.90	8.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
6d3b221a-e36e-4205-8f42-8f116c0dc6eb	2021-08-14	2021	32	BUCKET	\N	\N	\N	\N	6.10	3.30	9.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
789bc246-b24f-4d57-bf1b-bd0d485d6cd3	2021-08-21	2021	33	CRANE	\N	\N	\N	\N	6.50	2.20	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
2caa3b15-bcfc-40d9-b0e0-24f5ef699212	2021-08-21	2021	33	BUCKET	\N	\N	\N	\N	6.60	3.00	9.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
6ebdf612-6dcd-43a2-9645-a6fe9239c0fc	2021-08-28	2021	34	CRANE	\N	\N	\N	\N	6.70	1.90	8.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
cae2139a-ebe6-4eb9-93d8-773a80eb7d88	2021-08-28	2021	34	BUCKET	\N	\N	\N	\N	6.60	3.00	9.60	3.75	\N	2026-03-10 23:53:53.583419+00	\N
ea30389d-58a1-4565-ab57-8d9cc97d9cad	2021-09-04	2021	35	CRANE	\N	\N	\N	\N	6.30	2.10	8.40	2.75	\N	2026-03-10 23:53:53.583419+00	\N
50c0d495-dfe1-4cbf-b973-389f9e91dd46	2021-09-04	2021	35	BUCKET	\N	\N	\N	\N	6.70	3.30	10.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
3cbb5663-4097-46cf-9b68-fd9b4c8ed18b	2021-09-11	2021	36	CRANE	\N	\N	\N	\N	6.40	2.30	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
14afc908-48c6-4183-bcb6-b37a63310988	2021-09-11	2021	36	BUCKET	\N	\N	\N	\N	6.60	3.50	10.10	3.75	\N	2026-03-10 23:53:53.583419+00	\N
cdea41f5-b213-4e7f-a0ca-58e18c3e125c	2021-09-18	2021	37	CRANE	\N	\N	\N	\N	6.70	2.00	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
a852b102-84e6-411d-8966-028f4208af79	2021-09-18	2021	37	BUCKET	\N	\N	\N	\N	7.60	3.50	10.90	3.75	\N	2026-03-10 23:53:53.583419+00	\N
53735443-e926-4be9-ada1-963302a19b9f	2021-09-25	2021	38	CRANE	\N	\N	\N	\N	6.50	2.20	8.70	2.75	\N	2026-03-10 23:53:53.583419+00	\N
be7edf8a-ef5e-4ff0-9f34-033c1aed4a50	2021-09-25	2021	38	BUCKET	\N	\N	\N	\N	8.00	3.00	11.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
3390da6f-d835-43cd-9524-db03513e1665	2021-10-02	2021	39	CRANE	\N	\N	\N	\N	6.70	2.40	9.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
5b83e3e6-0c42-4845-a942-6654658c3f6f	2021-10-02	2021	39	BUCKET	\N	\N	\N	\N	8.00	3.00	11.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
d4321a24-c625-4f2b-8329-dcc3a4adab7d	2021-10-09	2021	40	CRANE	\N	\N	\N	\N	7.10	2.00	9.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
5d6411c8-a146-431a-b739-c8848abc893a	2021-10-09	2021	40	BUCKET	\N	\N	\N	\N	7.70	3.00	10.70	3.75	\N	2026-03-10 23:53:53.583419+00	\N
46958c2b-cbd2-490d-a70b-319e961d1499	2021-10-16	2021	41	CRANE	\N	\N	\N	\N	7.20	1.80	9.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
f6deb3ca-7e58-4793-ac98-5b2b0ab08b31	2021-10-16	2021	41	BUCKET	\N	\N	\N	\N	7.80	3.20	11.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
c64b2a5d-b201-4142-b0d5-fa5663f767ee	2021-10-23	2021	42	CRANE	\N	\N	\N	\N	6.40	2.20	8.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
62c5651d-a454-4feb-9aac-ee4cf44b88cb	2021-10-23	2021	42	BUCKET	\N	\N	\N	\N	7.30	3.70	11.00	3.75	\N	2026-03-10 23:53:53.583419+00	\N
3d5b8d83-b590-4153-95c8-bb8f970965ec	2021-10-30	2021	43	CRANE	\N	\N	\N	\N	6.10	2.40	8.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
66a066fc-8576-4fe2-9b45-90d0bd3b19f7	2021-10-30	2021	43	BUCKET	\N	\N	\N	\N	7.60	3.80	11.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
c3a6c09b-ee01-4366-9c55-0fcd699625c7	2021-11-06	2021	44	CRANE	\N	\N	\N	\N	6.50	3.10	9.60	2.75	\N	2026-03-10 23:53:53.583419+00	\N
002dc4d2-6e7b-4b9e-a83a-8e99aa1aba53	2021-11-06	2021	44	BUCKET	\N	\N	\N	\N	7.60	4.80	12.40	3.75	\N	2026-03-10 23:53:53.583419+00	\N
7ac5ad47-a46a-4a3b-99d9-d9a7c896f6cf	2021-11-13	2021	45	CRANE	\N	\N	\N	\N	6.50	2.70	9.20	2.75	\N	2026-03-10 23:53:53.583419+00	\N
9f9d04ce-b4de-421a-8055-fcf22273be14	2021-11-13	2021	45	BUCKET	\N	\N	\N	\N	7.90	4.60	12.50	4.00	\N	2026-03-10 23:53:53.583419+00	\N
fc67c037-f07f-4a81-af8e-d4467fa6e16d	2021-11-20	2021	46	CRANE	\N	\N	\N	\N	6.30	3.70	10.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
20e3af37-fce4-43ae-ad41-aa6e4f801742	2021-11-20	2021	46	BUCKET	\N	\N	\N	\N	7.60	4.50	12.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
c59461e5-8218-4943-aa5e-43dbdf162b04	2021-11-27	2021	47	CRANE	\N	\N	\N	\N	6.20	3.30	9.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
33f51871-f0d7-464e-a25c-91b7f6006278	2021-11-27	2021	47	BUCKET	\N	\N	\N	\N	8.00	3.90	11.90	4.00	\N	2026-03-10 23:53:53.583419+00	\N
a94a4d13-02ba-4e5e-a3f3-04adf8a83466	2021-12-04	2021	48	CRANE	\N	\N	\N	\N	6.30	2.80	9.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
9e102d46-667c-4652-8878-668b8554c5a3	2021-12-04	2021	48	BUCKET	\N	\N	\N	\N	8.20	3.60	11.80	4.00	\N	2026-03-10 23:53:53.583419+00	\N
5e989f03-6d21-4e3c-b9c3-3f64bfe1e9c8	2021-12-11	2021	49	CRANE	\N	\N	\N	\N	6.90	3.10	10.00	2.75	\N	2026-03-10 23:53:53.583419+00	\N
c2a1985d-1783-420f-92d2-ba7c704c7e62	2021-12-11	2021	49	BUCKET	\N	\N	\N	\N	8.70	6.70	15.40	4.00	\N	2026-03-10 23:53:53.583419+00	\N
64c6d035-9898-47ee-a14c-a07d3d44e998	2021-12-18	2021	50	CRANE	\N	\N	\N	\N	6.90	3.20	10.10	2.75	\N	2026-03-10 23:53:53.583419+00	\N
8aaa645f-7f4b-46e9-bdf1-91010d4f773a	2021-12-18	2021	50	BUCKET	\N	\N	\N	\N	8.60	6.00	14.60	4.00	\N	2026-03-10 23:53:53.583419+00	\N
87bd0fbf-ca53-4356-b354-85a2ff438ccf	2021-12-25	2021	51	CRANE	\N	\N	\N	\N	6.60	3.20	9.80	2.75	\N	2026-03-10 23:53:53.583419+00	\N
198a2390-e8d1-4832-8c6b-9f0547b46aca	2021-12-25	2021	51	BUCKET	\N	\N	\N	\N	8.50	5.60	14.10	4.00	\N	2026-03-10 23:53:53.583419+00	\N
657cb07b-fcfa-423a-b50c-fb3cfb03aa4c	2020-01-04	2020	1	CRANE	\N	\N	\N	\N	2.40	2.50	4.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
78514e5d-2bdc-4a8f-af58-929fa9c14b1b	2020-01-04	2020	1	BUCKET	\N	\N	\N	\N	1.60	3.10	4.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
a30c2739-60d6-46a4-81a7-b01b318d002c	2020-01-11	2020	2	CRANE	\N	\N	\N	\N	1.90	2.70	4.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d4f0b7d9-5007-4153-a26c-6f8e8895befb	2020-01-11	2020	2	BUCKET	\N	\N	\N	\N	1.40	3.00	4.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
af8d3206-c744-4c4c-b8ca-617e6450bfeb	2020-01-18	2020	3	CRANE	\N	\N	\N	\N	1.60	2.50	4.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
15a5c6c2-73ce-4942-9cea-cd430d6533a0	2020-01-18	2020	3	BUCKET	\N	\N	\N	\N	1.90	3.40	5.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
82af45f6-65f3-4534-b25b-0ec8a8a71b4e	2020-01-25	2020	4	CRANE	\N	\N	\N	\N	1.30	2.50	3.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
cc100dd2-09ea-4794-9d90-2e1a232ec2d3	2020-01-25	2020	4	BUCKET	\N	\N	\N	\N	2.10	3.10	5.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
8ff93fa3-c48f-4c40-ba8a-b0578134a9e2	2020-02-01	2020	5	CRANE	\N	\N	\N	\N	1.00	1.80	2.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b2524951-ed42-4ab7-87bf-6b0fd0a361e3	2020-02-01	2020	5	BUCKET	\N	\N	\N	\N	1.30	2.80	4.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
4ede93dd-5c7f-4c3b-a1af-c4ab5e3cf6eb	2020-02-08	2020	6	CRANE	\N	\N	\N	\N	1.20	1.90	3.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
132e5853-4e31-46c3-9345-e5d15bf17fdd	2020-02-08	2020	6	BUCKET	\N	\N	\N	\N	1.50	2.70	4.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
1ecce5e7-23d6-4e37-b5a9-144f8729d924	2020-02-15	2020	7	CRANE	\N	\N	\N	\N	1.10	2.10	3.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
a30bfcaf-e8c1-4105-afc3-566fb578d723	2020-02-15	2020	7	BUCKET	\N	\N	\N	\N	1.60	2.70	4.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
ccb82e6d-8498-4e9c-b467-9fb28cee10b1	2020-02-22	2020	8	CRANE	\N	\N	\N	\N	1.20	1.60	2.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
cef96517-845a-45e2-a454-e4a6a81733e1	2020-02-22	2020	8	BUCKET	\N	\N	\N	\N	1.40	2.70	4.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
3941cab3-8d1b-446e-b319-54a109065911	2020-02-29	2020	9	CRANE	\N	\N	\N	\N	0.90	1.40	2.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b2c24fdc-b208-4e32-bb33-4cd994373989	2020-02-29	2020	9	BUCKET	\N	\N	\N	\N	2.00	2.00	4.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
29611a1b-12fe-4e7e-97b3-f09089b0b8ac	2020-03-07	2020	10	CRANE	\N	\N	\N	\N	1.20	1.00	2.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6b0a21a5-f10c-40e1-ae47-74e34813beaf	2020-03-07	2020	10	BUCKET	\N	\N	\N	\N	1.50	1.60	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
81050c4b-d7bb-495c-8c2c-84452c92edda	2020-03-14	2020	11	CRANE	\N	\N	\N	\N	1.30	1.00	2.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
71e35c0a-78f2-4491-841b-3d651191007f	2020-03-14	2020	11	BUCKET	\N	\N	\N	\N	1.90	1.10	3.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
7988c8ed-39df-48b6-a9c4-6abfe4c94dcf	2020-03-21	2020	12	CRANE	\N	\N	\N	\N	0.60	1.80	2.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
cccd83cf-0817-4d4a-8781-9c17da3bda78	2020-03-21	2020	12	BUCKET	\N	\N	\N	\N	0.50	2.60	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
57a6a219-40c7-43e4-b1ed-2e3c4ac4d172	2020-03-28	2020	13	CRANE	\N	\N	\N	\N	0.70	1.70	2.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
fbac194e-5230-4d6f-ad4c-a7a6f80908b8	2020-03-28	2020	13	BUCKET	\N	\N	\N	\N	0.80	2.30	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
4dba67dd-6e1c-4e19-8077-d20222a5fe41	2020-04-04	2020	14	CRANE	\N	\N	\N	\N	0.90	1.50	2.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
15e00d30-c8f5-41d6-aed8-3acef74caced	2020-04-04	2020	14	BUCKET	\N	\N	\N	\N	1.40	1.80	3.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
763c2eb4-69e3-4359-bb6c-75fb3f08dc4b	2020-04-11	2020	15	CRANE	\N	\N	\N	\N	1.50	1.20	2.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
04848419-acc5-416b-852c-cc745aa4cb9e	2020-04-11	2020	15	BUCKET	\N	\N	\N	\N	1.20	2.00	3.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
463c518a-d6d5-443c-a6b1-f036455a3b56	2020-04-18	2020	16	CRANE	\N	\N	\N	\N	2.00	2.10	4.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6d175297-a8d1-4fed-93ba-24e5a359036c	2020-04-18	2020	16	BUCKET	\N	\N	\N	\N	1.40	2.60	4.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
a67b73b2-c995-4f06-ac35-d82f9df34280	2020-04-25	2020	17	CRANE	\N	\N	\N	\N	2.00	2.40	4.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b9494a77-34d8-42ea-937c-a38e00189072	2020-04-25	2020	17	BUCKET	\N	\N	\N	\N	1.30	2.80	4.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
34a8f383-35e8-4edf-b797-7928bfe92393	2020-05-02	2020	18	CRANE	\N	\N	\N	\N	3.20	1.80	5.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2777cd48-fd7b-4b05-ac4d-a5d7629c3d31	2020-05-02	2020	18	BUCKET	\N	\N	\N	\N	2.90	2.30	5.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
73c783f9-3d0a-45ea-817d-110f500edb23	2020-05-09	2020	19	CRANE	\N	\N	\N	\N	3.30	2.00	5.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
606da199-3960-4b1a-81eb-aa24cfbff032	2020-05-09	2020	19	BUCKET	\N	\N	\N	\N	3.10	2.20	5.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
b2af57a9-f53f-444f-90a8-7d1179b79a96	2020-05-16	2020	20	CRANE	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
2d477757-53da-435d-a112-71bafcf4e00b	2020-05-16	2020	20	BUCKET	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
66fb9c47-8bce-4efa-b3c1-fdfa4409108c	2020-05-23	2020	21	CRANE	\N	\N	\N	\N	3.00	2.90	5.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
246c5b5b-8077-4045-a256-b77495a35fc3	2020-05-23	2020	21	BUCKET	\N	\N	\N	\N	2.80	2.80	5.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
5e229c11-3c51-49f2-8230-7c479475e35c	2020-05-30	2020	22	CRANE	\N	\N	\N	\N	3.30	2.60	5.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
83f136c4-ecbb-4dd3-81a1-d15249ddb799	2020-05-30	2020	22	BUCKET	\N	\N	\N	\N	3.00	2.70	5.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
db2bd8ce-ce6a-4d74-8cff-632d7769256e	2020-06-06	2020	23	CRANE	\N	\N	\N	\N	3.50	2.90	6.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
beec31a5-ca70-47c6-a023-ad5fffc05147	2020-06-06	2020	23	BUCKET	\N	\N	\N	\N	3.70	2.70	6.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
5fc21734-b579-4b82-ab86-b67a8ab6c05a	2020-06-13	2020	24	CRANE	\N	\N	\N	\N	3.50	3.10	6.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
f8e63d9b-b6ce-4a98-835f-e4a18a623221	2020-06-13	2020	24	BUCKET	\N	\N	\N	\N	3.60	3.70	7.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
98e1c608-eedb-4b01-9918-80856ef5637b	2020-06-20	2020	25	CRANE	\N	\N	\N	\N	3.00	3.30	6.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
8ad884ab-ff29-46c6-ac43-5560e754d4fa	2020-06-20	2020	25	BUCKET	\N	\N	\N	\N	3.40	4.20	7.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
016386bc-c235-48a8-a759-0ffd295767ac	2020-06-27	2020	26	CRANE	\N	\N	\N	\N	4.00	2.60	6.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
67fc2ce4-48c4-4373-9d21-def3234ae119	2020-06-27	2020	26	BUCKET	\N	\N	\N	\N	4.70	2.90	7.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
1a11ad70-fbda-4686-bc43-652381d6b7ab	2020-07-04	2020	27	CRANE	\N	\N	\N	\N	4.30	2.60	6.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
67448ce0-593b-4192-8ffc-cc1726d9caa8	2020-07-04	2020	27	BUCKET	\N	\N	\N	\N	5.10	2.60	7.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
a05c12cc-0ab4-4622-98ea-fa7ef972dd23	2020-07-11	2020	28	CRANE	\N	\N	\N	\N	4.20	2.60	6.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d7823ed3-af86-4330-8c3d-8d0ccf99f10e	2020-07-11	2020	28	BUCKET	\N	\N	\N	\N	5.00	3.20	8.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
3e61e87f-f93f-47c4-b6ba-5a7c9e7139ba	2020-07-18	2020	29	CRANE	\N	\N	\N	\N	3.60	2.30	5.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2b7f482c-d0dd-4cdc-9f0f-fd28d7153018	2020-07-18	2020	29	BUCKET	\N	\N	\N	\N	4.80	3.40	8.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
0b86f5c7-dd04-4799-aed1-2411034cd799	2020-07-25	2020	30	CRANE	\N	\N	\N	\N	3.60	1.90	5.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ac25ec25-6050-4c63-af57-a016e3551c26	2020-07-25	2020	30	BUCKET	\N	\N	\N	\N	3.40	5.20	8.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
535f2fad-f0f8-4ecf-a03c-e80a20fa49fb	2020-08-01	2020	31	CRANE	\N	\N	\N	\N	3.40	1.80	5.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e0627c3f-2332-4354-9b5c-7b4f5a12f2ce	2020-08-01	2020	31	BUCKET	\N	\N	\N	\N	5.40	2.70	8.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
30cfffd0-563d-4269-9144-92e936e04f18	2020-08-08	2020	32	CRANE	\N	\N	\N	\N	3.50	1.60	5.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
a873b988-48bc-4686-946d-f8c57cd3b257	2020-08-08	2020	32	BUCKET	\N	\N	\N	\N	5.80	2.40	8.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
4efc83b2-ac05-40ab-ad83-df3c8da446a2	2020-08-15	2020	33	CRANE	\N	\N	\N	\N	4.10	1.20	5.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9e007b5f-0d07-42da-918e-416c4f65b58e	2020-08-15	2020	33	BUCKET	\N	\N	\N	\N	6.00	2.60	8.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
04e10994-ae16-46f3-a660-8606b5792ea8	2020-08-22	2020	34	CRANE	\N	\N	\N	\N	3.50	2.10	5.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
a5287c20-e7e7-4685-8352-d6d1aad7eedb	2020-08-22	2020	34	BUCKET	\N	\N	\N	\N	5.50	3.50	9.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
c1c12396-fbe0-426b-ae65-58f58072cef7	2020-08-29	2020	35	CRANE	\N	\N	\N	\N	3.20	2.50	5.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9a52bbc6-e023-4f40-aa87-6b049770eaeb	2020-08-29	2020	35	BUCKET	\N	\N	\N	\N	5.20	3.70	8.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
81bb79f4-5e0a-4bf9-84e6-12f26003f684	2020-09-05	2020	36	CRANE	\N	\N	\N	\N	3.90	2.40	6.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
f4bffc1e-220a-43cf-b299-455d0408f7c6	2020-09-05	2020	36	BUCKET	\N	\N	\N	\N	5.60	3.40	9.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
a91f028c-3fc5-4a66-94ef-1b60cf733cb9	2020-09-12	2020	37	CRANE	\N	\N	\N	\N	4.70	2.60	7.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
858883f3-9807-4582-a0ef-a3bed5150d86	2020-09-12	2020	37	BUCKET	\N	\N	\N	\N	5.70	3.20	8.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
68de65c9-7215-4f3d-b3f3-18c86f204220	2020-09-19	2020	38	CRANE	\N	\N	\N	\N	4.30	3.00	7.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
27687cad-222c-4d29-8329-cff3da6e8de9	2020-09-19	2020	38	BUCKET	\N	\N	\N	\N	6.00	3.30	9.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
330c015b-cd1b-4c12-8cd5-939a52f0c43f	2020-09-26	2020	39	CRANE	\N	\N	\N	\N	4.60	2.90	7.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0c4be797-715a-4172-9def-725026cec859	2020-09-26	2020	39	BUCKET	\N	\N	\N	\N	6.30	4.10	10.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
8b946b5a-1239-4a32-aebf-2ad0b9d7fd2c	2020-10-03	2020	40	CRANE	\N	\N	\N	\N	5.00	2.80	7.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
62880728-8374-4401-962f-4a4ff3d21e7b	2020-10-03	2020	40	BUCKET	\N	\N	\N	\N	6.60	3.30	9.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
0803565a-fb7a-4656-a353-05b1b7fce162	2020-10-10	2020	41	CRANE	\N	\N	\N	\N	5.50	2.80	8.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ddbdca4c-fa06-4c3e-8d74-8b8db11e477c	2020-10-10	2020	41	BUCKET	\N	\N	\N	\N	6.30	3.90	10.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
ea2bfaed-57b3-4d02-b3b9-a5b51527421b	2020-10-17	2020	42	CRANE	\N	\N	\N	\N	5.30	3.50	8.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
1d568787-d3cc-4ecd-beb1-89db5255629b	2020-10-17	2020	42	BUCKET	\N	\N	\N	\N	5.60	3.80	9.40	3.50	\N	2026-03-10 23:53:53.583419+00	\N
5f061ef2-dbc6-4051-9490-b9c64569d5b9	2020-10-24	2020	43	CRANE	\N	\N	\N	\N	4.90	4.30	9.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
d1a063d8-db34-40d9-8e8d-a196b29a9352	2020-10-24	2020	43	BUCKET	\N	\N	\N	\N	5.50	4.10	9.60	3.50	\N	2026-03-10 23:53:53.583419+00	\N
02cc292d-eb9c-4b60-9720-b0a6e30779e7	2020-10-31	2020	44	CRANE	\N	\N	\N	\N	5.30	3.20	8.50	2.00	\N	2026-03-10 23:53:53.583419+00	\N
b94bc270-90a7-44ea-9ea6-459c30964df2	2020-10-31	2020	44	BUCKET	\N	\N	\N	\N	5.40	3.50	8.90	3.50	\N	2026-03-10 23:53:53.583419+00	\N
57ee5bbf-f2d4-4267-b273-d7217c6ad50a	2020-11-07	2020	45	CRANE	\N	\N	\N	\N	6.60	2.80	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
90aff0fb-94cb-47e8-9ffd-1ff2dcfdeedf	2020-11-07	2020	45	BUCKET	\N	\N	\N	\N	5.90	2.80	8.70	3.50	\N	2026-03-10 23:53:53.583419+00	\N
79d177a1-a91f-4dd5-9363-88a308c2200f	2020-11-14	2020	46	CRANE	\N	\N	\N	\N	6.40	3.00	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
5652922e-95f2-49bd-8893-f554376c83cb	2020-11-14	2020	46	BUCKET	\N	\N	\N	\N	6.00	2.50	8.50	3.50	\N	2026-03-10 23:53:53.583419+00	\N
88372c2f-bd14-4347-86bb-8c266323be06	2020-11-21	2020	47	CRANE	\N	\N	\N	\N	6.30	3.50	9.80	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bbaac250-78da-48a4-8580-212b0983a529	2020-11-21	2020	47	BUCKET	\N	\N	\N	\N	5.60	2.70	8.30	3.50	\N	2026-03-10 23:53:53.583419+00	\N
71ee81bb-d228-4585-a3ce-e3208f26f85a	2020-11-28	2020	48	CRANE	\N	\N	\N	\N	6.60	2.80	9.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
bc697852-5851-4d3a-93a1-e20b30e6e058	2020-11-28	2020	48	BUCKET	\N	\N	\N	\N	5.90	2.10	8.00	3.50	\N	2026-03-10 23:53:53.583419+00	\N
4d3eb6a9-ac27-4978-960c-4b03328d5866	2020-12-05	2020	49	CRANE	\N	\N	\N	\N	6.30	3.00	9.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3a9c9a3b-f1e8-49b2-a810-15d05c370d49	2020-12-05	2020	49	BUCKET	\N	\N	\N	\N	5.90	1.80	7.70	3.50	\N	2026-03-10 23:53:53.583419+00	\N
786b73f9-d222-419e-8685-7351101f4f9b	2020-12-12	2020	50	CRANE	\N	\N	\N	\N	6.50	2.40	8.90	2.00	\N	2026-03-10 23:53:53.583419+00	\N
73e13ce7-261b-4761-813b-0a35174fa37c	2020-12-12	2020	50	BUCKET	\N	\N	\N	\N	5.60	1.60	7.20	3.50	\N	2026-03-10 23:53:53.583419+00	\N
094bda0b-f8d2-4e3c-aaab-f8a03002afe4	2020-12-19	2020	51	CRANE	\N	\N	\N	\N	5.00	2.50	7.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
359b7441-6353-4fcf-8b8d-58e14a281689	2020-12-19	2020	51	BUCKET	\N	\N	\N	\N	5.70	5.60	11.30	3.25	\N	2026-03-10 23:53:53.583419+00	\N
4dc1c6b8-7cd6-40cc-ab3d-084cf500f122	2020-12-26	2020	52	CRANE	\N	\N	\N	\N	5.00	2.50	7.50	2.75	\N	2026-03-10 23:53:53.583419+00	\N
5a305e1b-1d2f-4424-9cc6-66c87a785e27	2020-12-26	2020	52	BUCKET	\N	\N	\N	\N	5.40	5.50	10.90	3.25	\N	2026-03-10 23:53:53.583419+00	\N
de637e06-d064-49d1-8347-1be9833ce3b1	2019-01-05	2019	1	CRANE	\N	\N	\N	\N	2.10	1.50	3.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2247c1f3-3844-4671-a1f1-3a30fa2b665c	2019-01-05	2019	1	BUCKET	\N	\N	\N	\N	1.90	0.90	2.80	3.00	\N	2026-03-10 23:53:53.583419+00	\N
521da2a5-bcd1-47ad-bb9b-2d653dbe5764	2019-01-12	2019	2	CRANE	\N	\N	\N	\N	1.60	2.00	3.60	2.00	\N	2026-03-10 23:53:53.583419+00	\N
50a74fab-2c28-49c5-9017-1dd8567d47c7	2019-01-12	2019	2	BUCKET	\N	\N	\N	\N	1.70	1.10	2.80	3.00	\N	2026-03-10 23:53:53.583419+00	\N
6bb4dc38-dc1f-493c-bc3d-5b61cd61e4c2	2019-01-19	2019	3	CRANE	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
6473e055-9fb8-4f9f-a5bd-cea920ab82d3	2019-01-19	2019	3	BUCKET	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
df5d47af-b73b-4fe6-902f-36d311d87a8a	2019-01-26	2019	4	CRANE	\N	\N	\N	\N	1.90	1.40	3.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
9f2c0794-98fc-451b-b8e9-189a55442dc0	2019-01-26	2019	4	BUCKET	\N	\N	\N	\N	1.10	1.40	2.50	3.00	\N	2026-03-10 23:53:53.583419+00	\N
a2760ff5-45ec-4ddf-b168-b27c9682488c	2019-02-02	2019	5	CRANE	\N	\N	\N	\N	1.70	0.60	2.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
0490aa58-6898-4554-9deb-83fc38aa7d08	2019-02-02	2019	5	BUCKET	\N	\N	\N	\N	0.90	0.70	1.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
1dd3d234-f3b1-4d1a-b62a-cddef05693cb	2019-02-09	2019	6	CRANE	\N	\N	\N	\N	1.00	0.70	1.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
ffaaa02e-4b20-4f88-93c4-7aa77eb396f8	2019-02-09	2019	6	BUCKET	\N	\N	\N	\N	0.30	0.80	1.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
47e4562c-ed9d-4572-b8fe-cb8cd43b2487	2019-02-16	2019	7	CRANE	\N	\N	\N	\N	0.80	0.90	1.70	2.00	\N	2026-03-10 23:53:53.583419+00	\N
356ed609-5306-42e1-a10c-7fb58cac1684	2019-02-16	2019	7	BUCKET	\N	\N	\N	\N	0.30	0.60	0.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
49a1f294-b8ba-4efe-a131-679f5436fb31	2019-02-23	2019	8	CRANE	\N	\N	\N	\N	0.60	2.30	2.90	1.00	\N	2026-03-10 23:53:53.583419+00	\N
4d546ae0-1e16-425d-b910-5360ae9f6cbc	2019-02-23	2019	8	BUCKET	\N	\N	\N	\N	0.20	0.90	1.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
c0386ef1-ee96-440e-8650-0110921a1db0	2019-03-02	2019	9	CRANE	\N	\N	\N	\N	1.20	2.40	3.60	1.00	\N	2026-03-10 23:53:53.583419+00	\N
0beb2b80-e6d3-47b3-9625-f9e902bac627	2019-03-02	2019	9	BUCKET	\N	\N	\N	\N	0.60	0.70	1.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
922a8e49-ebc0-4ca0-9873-889c4a0bc19f	2019-03-09	2019	10	CRANE	\N	\N	\N	\N	1.80	2.90	4.70	1.00	\N	2026-03-10 23:53:53.583419+00	\N
6da40c64-76d4-4ea6-8383-e3a0a3d7f203	2019-03-09	2019	10	BUCKET	\N	\N	\N	\N	0.80	0.60	1.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
2c726366-2f9f-4f9d-9e27-5975aa766523	2019-03-16	2019	11	CRANE	\N	\N	\N	\N	2.20	2.00	4.20	1.00	\N	2026-03-10 23:53:53.583419+00	\N
5ce5ac2e-6a9d-433b-8612-915c33f40fb0	2019-03-16	2019	11	BUCKET	\N	\N	\N	\N	0.30	0.40	0.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
f65ee9af-a19e-4065-b6ef-4f4092b8d6dd	2019-03-23	2019	12	CRANE	\N	\N	\N	\N	1.50	2.90	4.40	1.00	\N	2026-03-10 23:53:53.583419+00	\N
93202dbc-421a-46ed-a41a-4562fc55877f	2019-03-23	2019	12	BUCKET	\N	\N	\N	\N	0.30	0.90	1.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
547c618e-fe21-47bb-9320-5c981abe97f7	2019-03-30	2019	13	CRANE	\N	\N	\N	\N	1.50	3.20	4.70	1.00	\N	2026-03-10 23:53:53.583419+00	\N
3888c46e-c97e-4f31-8c17-d494132cf714	2019-03-30	2019	13	BUCKET	\N	\N	\N	\N	0.40	1.00	1.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
8f76262a-ef16-443a-98cb-7b707e8701fe	2019-04-06	2019	14	CRANE	\N	\N	\N	\N	1.70	3.70	5.40	1.00	\N	2026-03-10 23:53:53.583419+00	\N
6ddb6a44-de36-4ba7-92b8-138785be7e6e	2019-04-06	2019	14	BUCKET	\N	\N	\N	\N	0.60	1.30	1.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
7bec39fc-3b10-434a-a381-92d9aced08d7	2019-04-13	2019	15	CRANE	\N	\N	\N	\N	1.30	4.00	5.30	1.00	\N	2026-03-10 23:53:53.583419+00	\N
fa49a646-b2c1-475c-88ee-3233aa37cedc	2019-04-13	2019	15	BUCKET	\N	\N	\N	\N	0.90	1.60	2.50	3.00	\N	2026-03-10 23:53:53.583419+00	\N
ee5facb2-97f7-4a30-9ef8-e67d9c37d316	2019-04-20	2019	16	CRANE	\N	\N	\N	\N	1.80	4.70	6.50	1.00	\N	2026-03-10 23:53:53.583419+00	\N
2a095829-f47a-4947-9233-fdac260d1b66	2019-04-20	2019	16	BUCKET	\N	\N	\N	\N	0.80	2.20	3.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
210241be-decd-46cb-b0bc-302bd8bb5434	2019-04-27	2019	17	CRANE	\N	\N	\N	\N	2.60	4.30	6.90	1.00	\N	2026-03-10 23:53:53.583419+00	\N
a89c0142-9635-4c0d-bfb6-85a5559eb5ff	2019-04-27	2019	17	BUCKET	\N	\N	\N	\N	1.50	1.50	3.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
e5d54f36-2bed-4b20-bbff-da3497aeaef8	2019-05-04	2019	18	CRANE	\N	\N	\N	\N	2.80	5.00	7.80	1.00	\N	2026-03-10 23:53:53.583419+00	\N
c77e42ed-d868-4035-91e9-ab9d193183e9	2019-05-04	2019	18	BUCKET	\N	\N	\N	\N	0.90	2.10	3.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
dd1afbc4-7640-444f-8193-3061a4789b6d	2019-05-11	2019	19	CRANE	\N	\N	\N	\N	2.80	4.80	7.60	1.00	\N	2026-03-10 23:53:53.583419+00	\N
633a347b-17f6-4921-9bf5-f2992b85fca1	2019-05-11	2019	19	BUCKET	\N	\N	\N	\N	1.10	2.00	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
776a2641-d15a-4ddd-9666-62f9dd986b27	2019-05-18	2019	20	CRANE	\N	\N	\N	\N	2.30	5.50	7.80	1.00	\N	2026-03-10 23:53:53.583419+00	\N
2d7ef018-fbad-45e5-a190-c14e64ddb4a3	2019-05-18	2019	20	BUCKET	\N	\N	\N	\N	1.10	1.60	2.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
73fffaa7-8826-4092-b8ee-4bff27758c83	2019-05-25	2019	21	CRANE	\N	\N	\N	\N	2.80	5.00	7.80	1.00	\N	2026-03-10 23:53:53.583419+00	\N
08252ef9-4a89-4843-a3d5-ebf50c6c04ce	2019-05-25	2019	21	BUCKET	\N	\N	\N	\N	1.60	1.20	2.80	3.00	\N	2026-03-10 23:53:53.583419+00	\N
4885828c-3277-4b67-83c9-63aae27cae52	2019-06-01	2019	22	CRANE	\N	\N	\N	\N	3.60	4.20	7.80	1.00	\N	2026-03-10 23:53:53.583419+00	\N
0046eb6f-9b4a-4a6a-967e-c6c1180d87c6	2019-06-01	2019	22	BUCKET	\N	\N	\N	\N	1.20	1.80	3.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
260bcfc8-5db5-470f-967a-ee58b9744549	2019-06-08	2019	23	CRANE	\N	\N	\N	\N	3.20	5.60	8.80	1.00	\N	2026-03-10 23:53:53.583419+00	\N
8dd89331-91b9-4d71-ac49-69e2cbc22561	2019-06-08	2019	23	BUCKET	\N	\N	\N	\N	1.30	1.90	3.20	3.00	\N	2026-03-10 23:53:53.583419+00	\N
1319b482-7532-40a1-8243-247cea9a6b00	2019-06-15	2019	24	CRANE	\N	\N	\N	\N	4.20	5.00	9.20	1.00	\N	2026-03-10 23:53:53.583419+00	\N
0ff3ee4f-b228-4ab6-ab52-8dd45c8c1959	2019-06-15	2019	24	BUCKET	\N	\N	\N	\N	1.70	1.60	3.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
e560fdcc-5457-4673-8798-7a76e28c9af8	2019-06-22	2019	25	CRANE	\N	\N	\N	\N	3.90	5.40	9.30	1.00	\N	2026-03-10 23:53:53.583419+00	\N
54419961-332b-4a5e-933a-c05acde80fe3	2019-06-22	2019	25	BUCKET	\N	\N	\N	\N	1.40	1.70	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
9e0dcc05-55b1-409b-b3e9-4512d6020566	2019-06-29	2019	26	CRANE	\N	\N	\N	\N	3.90	5.40	9.30	1.00	\N	2026-03-10 23:53:53.583419+00	\N
2ed0845c-433e-41dd-a1c0-3f4e2482a225	2019-06-29	2019	26	BUCKET	\N	\N	\N	\N	1.40	1.70	3.10	3.00	\N	2026-03-10 23:53:53.583419+00	\N
7b094fd4-33f3-431d-a9c7-63e5e79ecdc3	2019-07-06	2019	27	CRANE	\N	\N	\N	\N	2.30	3.10	5.40	1.50	\N	2026-03-10 23:53:53.583419+00	\N
738727c2-c8a4-4ffd-acda-80ce50dd92c5	2019-07-06	2019	27	BUCKET	\N	\N	\N	\N	3.10	2.20	5.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
3f233f7b-a3fe-4ebf-b98c-a9987c359750	2019-07-13	2019	28	CRANE	\N	\N	\N	\N	2.30	3.00	5.30	1.50	\N	2026-03-10 23:53:53.583419+00	\N
c0f00b73-c26d-4944-8563-4e7c20d0b7de	2019-07-13	2019	28	BUCKET	\N	\N	\N	\N	2.40	2.80	5.20	2.50	\N	2026-03-10 23:53:53.583419+00	\N
bc36d45d-4d9b-42df-b9c0-2d25a45d6063	2019-07-20	2019	29	CRANE	\N	\N	\N	\N	2.30	2.80	5.10	1.50	\N	2026-03-10 23:53:53.583419+00	\N
5ab965d5-2d7d-48a8-8b74-983760804234	2019-07-20	2019	29	BUCKET	\N	\N	\N	\N	3.30	1.70	5.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
a2cdfd2f-ecdb-42c5-a9fc-cea208d61020	2019-07-27	2019	30	CRANE	\N	\N	\N	\N	2.10	2.90	5.00	1.50	\N	2026-03-10 23:53:53.583419+00	\N
2ddcea28-3716-48fb-ad27-2b090caa86dc	2019-07-27	2019	30	BUCKET	\N	\N	\N	\N	3.10	2.70	5.80	2.50	\N	2026-03-10 23:53:53.583419+00	\N
efc83314-6f60-4748-b0e7-55897ba09ef9	2019-08-03	2019	31	CRANE	\N	\N	\N	\N	1.90	2.50	4.40	1.50	\N	2026-03-10 23:53:53.583419+00	\N
b1008dff-5e4b-42e9-a705-cec015ac38d4	2019-08-03	2019	31	BUCKET	\N	\N	\N	\N	3.70	3.00	6.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
e8961f4b-fa59-494d-8950-096ac878f9ea	2019-08-10	2019	32	CRANE	\N	\N	\N	\N	2.00	2.80	4.80	1.50	\N	2026-03-10 23:53:53.583419+00	\N
65337df2-6b6c-42eb-89f2-996eb0e8d48c	2019-08-10	2019	32	BUCKET	\N	\N	\N	\N	3.90	3.00	6.90	2.50	\N	2026-03-10 23:53:53.583419+00	\N
4e1a807a-cc34-420d-b192-5b799ab84784	2019-08-17	2019	33	CRANE	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
f53dbc22-71be-4036-a780-740245050f8c	2019-08-17	2019	33	BUCKET	\N	\N	\N	\N	0.00	0.00	0.00	0.00	\N	2026-03-10 23:53:53.583419+00	\N
310c36b2-307c-488f-bc61-21b99f521a27	2019-08-24	2019	34	CRANE	\N	\N	\N	\N	1.80	3.30	5.10	1.50	\N	2026-03-10 23:53:53.583419+00	\N
ba55d59c-8716-41cb-922c-a5a2bc5cf2fd	2019-08-24	2019	34	BUCKET	\N	\N	\N	\N	4.80	3.10	7.90	2.50	\N	2026-03-10 23:53:53.583419+00	\N
36605af0-92ad-41a6-8eba-50cd41703667	2019-08-31	2019	35	CRANE	\N	\N	\N	\N	2.00	2.60	4.60	1.50	\N	2026-03-10 23:53:53.583419+00	\N
a1102d29-1a70-412c-95c5-372f4549888b	2019-08-31	2019	35	BUCKET	\N	\N	\N	\N	4.40	3.90	8.30	2.50	\N	2026-03-10 23:53:53.583419+00	\N
d6b8113d-b45c-4cab-baff-d6ceb60d1510	2019-09-07	2019	36	CRANE	\N	\N	\N	\N	2.10	2.90	5.00	1.50	\N	2026-03-10 23:53:53.583419+00	\N
3ee9e26b-23c1-4fa3-984f-82406a0ec727	2019-09-07	2019	36	BUCKET	\N	\N	\N	\N	4.70	3.00	7.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
42113e34-63d3-4ace-80d9-05bec378c8d3	2019-09-14	2019	37	CRANE	\N	\N	\N	\N	2.70	2.60	5.30	1.50	\N	2026-03-10 23:53:53.583419+00	\N
6d6e6486-fbbc-4a5b-8174-aacdee96de09	2019-09-14	2019	37	BUCKET	\N	\N	\N	\N	4.10	3.50	7.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
05ca443b-1ba4-4e11-9242-55b2ca698fd6	2019-09-21	2019	38	CRANE	\N	\N	\N	\N	2.70	2.60	5.30	1.50	\N	2026-03-10 23:53:53.583419+00	\N
b302c5a9-d060-4a27-9c20-11b12b1384a0	2019-09-21	2019	38	BUCKET	\N	\N	\N	\N	4.10	3.50	7.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
0ff9bbe4-aab4-4f82-bd6a-fc245620cbd6	2019-09-28	2019	39	CRANE	\N	\N	\N	\N	2.80	3.60	6.40	1.50	\N	2026-03-10 23:53:53.583419+00	\N
098d6c36-88b9-462a-928c-ff18698c0781	2019-09-28	2019	39	BUCKET	\N	\N	\N	\N	3.50	3.50	7.00	2.50	\N	2026-03-10 23:53:53.583419+00	\N
964242a2-6e72-457c-9c2d-3d1daf247aa5	2019-10-05	2019	40	CRANE	\N	\N	\N	\N	3.20	3.30	6.50	1.50	\N	2026-03-10 23:53:53.583419+00	\N
a9472043-a3ac-49fd-9c15-d4a096b2737c	2019-10-05	2019	40	BUCKET	\N	\N	\N	\N	3.70	3.00	6.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
c7179f30-9886-4ec2-816b-f102b5ec785a	2019-10-12	2019	41	CRANE	\N	\N	\N	\N	3.00	3.10	6.10	1.50	\N	2026-03-10 23:53:53.583419+00	\N
6b20e8ce-c3f7-4296-a713-5835896cdaf1	2019-10-12	2019	41	BUCKET	\N	\N	\N	\N	3.70	3.00	6.70	2.50	\N	2026-03-10 23:53:53.583419+00	\N
a237cfb2-7f8d-49fe-a037-17e624fe4e18	2019-10-19	2019	42	CRANE	\N	\N	\N	\N	2.80	3.00	5.80	1.50	\N	2026-03-10 23:53:53.583419+00	\N
f65522d7-03aa-4dac-983e-5fee490473e2	2019-10-19	2019	42	BUCKET	\N	\N	\N	\N	3.30	3.30	6.60	2.50	\N	2026-03-10 23:53:53.583419+00	\N
6c659c36-5ebe-4abd-aeb0-1cd69c666aec	2019-10-26	2019	43	CRANE	\N	\N	\N	\N	1.60	4.40	6.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
e14e9211-92f4-4eba-985a-ecbd6dc5ac26	2019-10-26	2019	43	BUCKET	\N	\N	\N	\N	2.40	4.00	6.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
feded51f-37d0-45ff-b8bf-2919f835aac4	2019-11-02	2019	44	CRANE	\N	\N	\N	\N	1.60	4.40	6.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
94ec1158-11e4-493f-a9d0-edd0f67aee8d	2019-11-02	2019	44	BUCKET	\N	\N	\N	\N	2.40	4.00	6.40	3.00	\N	2026-03-10 23:53:53.583419+00	\N
c2fc14d7-b277-4b26-a0ff-ac0fab5921b3	2019-11-09	2019	45	CRANE	\N	\N	\N	\N	2.40	4.60	7.00	2.00	\N	2026-03-10 23:53:53.583419+00	\N
25b349d4-7a03-4adb-8b8e-c31fe0809e19	2019-11-09	2019	45	BUCKET	\N	\N	\N	\N	2.30	4.70	7.00	3.00	\N	2026-03-10 23:53:53.583419+00	\N
ffc2ea28-b1cb-4187-b139-ca882ef91f25	2019-11-16	2019	46	CRANE	\N	\N	\N	\N	3.40	4.00	7.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
2cb7c2ab-6c37-4a8a-947e-2535b32049d3	2019-11-16	2019	46	BUCKET	\N	\N	\N	\N	2.60	4.10	6.70	3.00	\N	2026-03-10 23:53:53.583419+00	\N
233c0490-b7cf-4439-8111-15d8b72fca22	2019-11-23	2019	47	CRANE	\N	\N	\N	\N	3.80	3.50	7.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
7cdf7f9a-0267-4ebb-b81c-e4a5135312dd	2019-11-23	2019	47	BUCKET	\N	\N	\N	\N	3.10	3.40	6.50	3.00	\N	2026-03-10 23:53:53.583419+00	\N
7d3d7f4b-cae3-48f8-b367-8c0deea980c5	2019-11-30	2019	48	CRANE	\N	\N	\N	\N	3.80	3.50	7.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
54b2db86-2d63-4399-bdd8-a7c34c850757	2019-11-30	2019	48	BUCKET	\N	\N	\N	\N	3.10	3.40	6.50	3.00	\N	2026-03-10 23:53:53.583419+00	\N
3dd2906a-7d1f-410c-892b-e589c86357b9	2019-12-07	2019	49	CRANE	\N	\N	\N	\N	2.50	4.80	7.30	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3372f543-e580-4e30-a8b9-cee4c59d2f74	2019-12-07	2019	49	BUCKET	\N	\N	\N	\N	2.50	4.30	6.80	3.00	\N	2026-03-10 23:53:53.583419+00	\N
cbd0bcdc-e2e7-47c1-b9b9-37b28df24844	2019-12-14	2019	50	CRANE	\N	\N	\N	\N	3.50	3.60	7.10	2.00	\N	2026-03-10 23:53:53.583419+00	\N
42f55cb9-3f6f-48c8-b5c7-4d1a5768d442	2019-12-14	2019	50	BUCKET	\N	\N	\N	\N	2.50	3.80	6.30	3.00	\N	2026-03-10 23:53:53.583419+00	\N
bbcb9d62-014c-4439-be12-bd44c99d82a5	2019-12-21	2019	51	CRANE	\N	\N	\N	\N	2.90	3.50	6.40	2.00	\N	2026-03-10 23:53:53.583419+00	\N
6a8c64bf-d7a8-494e-997b-44390a803074	2019-12-21	2019	51	BUCKET	\N	\N	\N	\N	2.00	3.90	5.90	3.00	\N	2026-03-10 23:53:53.583419+00	\N
98a4dacc-289b-4cf7-b527-aa134ee63cb2	2019-12-28	2019	52	CRANE	\N	\N	\N	\N	3.10	3.10	6.20	2.00	\N	2026-03-10 23:53:53.583419+00	\N
3705782e-f7b3-4807-91b8-e94646903984	2019-12-28	2019	52	BUCKET	\N	\N	\N	\N	1.70	3.90	5.60	3.00	\N	2026-03-10 23:53:53.583419+00	\N
d1a8c3dd-32e6-49a2-8e49-c0d473b02ba4	2026-03-01	2026	9	CRANE	ANTHONY	163000.00	258850.00	421850.00	202.75	282.00	484.75	0.00	\N	2026-03-11 18:43:11.145669+00	\N
e85dd247-0057-4918-bd3b-0813d3110817	2026-03-01	2026	9	BUCKET	UNASSIGNED	6600.00	35100.00	41700.00	13.00	64.50	77.50	0.00	\N	2026-03-11 18:43:11.145669+00	\N
d4c23b65-b794-4065-ac4a-6130520955eb	2026-03-01	2026	9	BUCKET	ANTHONY	127700.00	78975.00	206675.00	296.75	252.00	548.75	0.00	\N	2026-03-11 18:43:11.145669+00	\N
4b730626-df40-4926-a128-bc557d0e5500	2026-03-01	2026	9	CRANE	DENNIS	102150.00	116350.00	218500.00	86.00	125.00	211.00	0.00	\N	2026-03-11 18:43:11.145669+00	\N
1995e79f-714f-44e0-9758-8078c4e9d261	2026-03-01	2026	9	CRANE	AUSTIN	0.00	9800.00	9800.00	0.00	9.00	9.00	0.00	\N	2026-03-11 18:43:11.145669+00	\N
9c065d3f-ac0a-4e35-9171-6267f1a9e9e1	2026-03-01	2026	9	BUCKET	DENNIS	16300.00	192900.00	209200.00	20.00	598.00	618.00	0.00	\N	2026-03-11 18:43:11.145669+00	\N
4abedad4-369f-4542-bec2-1b8c4e24752d	2026-03-01	2026	9	CRANE	UNASSIGNED	27450.00	68350.00	95800.00	32.00	71.00	103.00	0.00	\N	2026-03-11 18:43:11.145669+00	\N
\.


--
-- TOC entry 3545 (class 2606 OID 65975)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 66345)
-- Name: access_constraints access_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_constraints
    ADD CONSTRAINT access_constraints_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 66368)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 66272)
-- Name: blocker_reasons blocker_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocker_reasons
    ADD CONSTRAINT blocker_reasons_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 66182)
-- Name: customer_risk_reasons customer_risk_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risk_reasons
    ADD CONSTRAINT customer_risk_reasons_pkey PRIMARY KEY (id);


--
-- TOC entry 3556 (class 2606 OID 66176)
-- Name: customer_risks customer_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risks
    ADD CONSTRAINT customer_risks_pkey PRIMARY KEY (id);


--
-- TOC entry 3551 (class 2606 OID 66157)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 66207)
-- Name: estimate_history estimate_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estimate_history
    ADD CONSTRAINT estimate_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 66328)
-- Name: foreman_day_roster_members foreman_day_roster_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_roster_members
    ADD CONSTRAINT foreman_day_roster_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 66321)
-- Name: foreman_day_rosters foreman_day_rosters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_rosters
    ADD CONSTRAINT foreman_day_rosters_pkey PRIMARY KEY (id);


--
-- TOC entry 3606 (class 2606 OID 66312)
-- Name: home_bases home_bases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.home_bases
    ADD CONSTRAINT home_bases_pkey PRIMARY KEY (id);


--
-- TOC entry 3631 (class 2606 OID 66385)
-- Name: import_row_maps import_row_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_row_maps
    ADD CONSTRAINT import_row_maps_pkey PRIMARY KEY (id);


--
-- TOC entry 3629 (class 2606 OID 66376)
-- Name: import_runs import_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_runs
    ADD CONSTRAINT import_runs_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 66351)
-- Name: job_access_constraints job_access_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_access_constraints
    ADD CONSTRAINT job_access_constraints_pkey PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 66281)
-- Name: job_blockers job_blockers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_blockers
    ADD CONSTRAINT job_blockers_pkey PRIMARY KEY (id);


--
-- TOC entry 3623 (class 2606 OID 66359)
-- Name: job_preferred_channels job_preferred_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_preferred_channels
    ADD CONSTRAINT job_preferred_channels_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 66199)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 2606 OID 66395)
-- Name: org_settings org_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_settings
    ADD CONSTRAINT org_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3571 (class 2606 OID 66217)
-- Name: requirement_types requirement_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_types
    ADD CONSTRAINT requirement_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 66226)
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 66302)
-- Name: resource_reservations resource_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 3601 (class 2606 OID 66293)
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- TOC entry 3554 (class 2606 OID 66167)
-- Name: risk_reasons risk_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.risk_reasons
    ADD CONSTRAINT risk_reasons_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 66254)
-- Name: schedule_events schedule_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);


--
-- TOC entry 3641 (class 2606 OID 66715)
-- Name: schedule_notification_logs schedule_notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_notification_logs
    ADD CONSTRAINT schedule_notification_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3582 (class 2606 OID 66235)
-- Name: schedule_segments schedule_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_segments
    ADD CONSTRAINT schedule_segments_pkey PRIMARY KEY (id);


--
-- TOC entry 3637 (class 2606 OID 107209)
-- Name: scheduling_conflict_dismissals scheduling_conflict_dismissals_dismissed_by_user_id_conflic_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduling_conflict_dismissals
    ADD CONSTRAINT scheduling_conflict_dismissals_dismissed_by_user_id_conflic_key UNIQUE (dismissed_by_user_id, conflict_date, conflict_type, conflict_key);


--
-- TOC entry 3639 (class 2606 OID 66698)
-- Name: scheduling_conflict_dismissals scheduling_conflict_dismissals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduling_conflict_dismissals
    ADD CONSTRAINT scheduling_conflict_dismissals_pkey PRIMARY KEY (id);


--
-- TOC entry 3635 (class 2606 OID 66684)
-- Name: seasonal_freeze_windows seasonal_freeze_windows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_freeze_windows
    ADD CONSTRAINT seasonal_freeze_windows_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 66335)
-- Name: segment_roster_links segment_roster_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_roster_links
    ADD CONSTRAINT segment_roster_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 66245)
-- Name: travel_segments travel_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_segments
    ADD CONSTRAINT travel_segments_pkey PRIMARY KEY (id);


--
-- TOC entry 3549 (class 2606 OID 66148)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 66262)
-- Name: vacated_slots vacated_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacated_slots
    ADD CONSTRAINT vacated_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 3645 (class 2606 OID 107217)
-- Name: weekly_backlog_snapshots weekly_backlog_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_backlog_snapshots
    ADD CONSTRAINT weekly_backlog_snapshots_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 1259 OID 66416)
-- Name: access_constraints_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX access_constraints_code_key ON public.access_constraints USING btree (code);


--
-- TOC entry 3595 (class 1259 OID 66411)
-- Name: blocker_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blocker_reasons_code_key ON public.blocker_reasons USING btree (code);


--
-- TOC entry 3627 (class 1259 OID 66419)
-- Name: idx_activity_log_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_log_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- TOC entry 3560 (class 1259 OID 66401)
-- Name: idx_jobs_completed_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_completed_date ON public.jobs USING btree (completed_date);


--
-- TOC entry 3561 (class 1259 OID 66402)
-- Name: idx_jobs_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_customer_id ON public.jobs USING btree (customer_id);


--
-- TOC entry 3562 (class 1259 OID 66399)
-- Name: idx_jobs_equipment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_equipment_type ON public.jobs USING btree (equipment_type);


--
-- TOC entry 3563 (class 1259 OID 106450)
-- Name: idx_jobs_sales_rep_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_sales_rep_code ON public.jobs USING btree (sales_rep_code);


--
-- TOC entry 3564 (class 1259 OID 66400)
-- Name: idx_jobs_town; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_town ON public.jobs USING btree (town);


--
-- TOC entry 3572 (class 1259 OID 66405)
-- Name: idx_requirements_requirement_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requirements_requirement_type_id ON public.requirements USING btree (requirement_type_id);


--
-- TOC entry 3573 (class 1259 OID 66404)
-- Name: idx_requirements_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requirements_status ON public.requirements USING btree (status);


--
-- TOC entry 3590 (class 1259 OID 66674)
-- Name: idx_schedule_events_actor_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedule_events_actor_created_at ON public.schedule_events USING btree (actor_user_id, created_at DESC) WHERE (actor_user_id IS NOT NULL);


--
-- TOC entry 3576 (class 1259 OID 66407)
-- Name: idx_schedule_segments_end_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedule_segments_end_datetime ON public.schedule_segments USING btree (end_datetime);


--
-- TOC entry 3577 (class 1259 OID 66663)
-- Name: idx_schedule_segments_segment_group_id_not_null; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedule_segments_segment_group_id_not_null ON public.schedule_segments USING btree (segment_group_id) WHERE (segment_group_id IS NOT NULL);


--
-- TOC entry 3578 (class 1259 OID 66406)
-- Name: idx_schedule_segments_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedule_segments_start_datetime ON public.schedule_segments USING btree (start_datetime);


--
-- TOC entry 3579 (class 1259 OID 66636)
-- Name: idx_segments_active_by_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_segments_active_by_job ON public.schedule_segments USING btree (job_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 3580 (class 1259 OID 66637)
-- Name: idx_segments_active_by_job_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_segments_active_by_job_datetime ON public.schedule_segments USING btree (job_id, start_datetime) WHERE (deleted_at IS NULL);


--
-- TOC entry 3583 (class 1259 OID 66410)
-- Name: idx_travel_segments_end_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_travel_segments_end_datetime ON public.travel_segments USING btree (end_datetime);


--
-- TOC entry 3584 (class 1259 OID 66408)
-- Name: idx_travel_segments_foreman_service_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_travel_segments_foreman_service_date ON public.travel_segments USING btree (foreman_person_id, service_date);


--
-- TOC entry 3585 (class 1259 OID 66409)
-- Name: idx_travel_segments_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_travel_segments_start_datetime ON public.travel_segments USING btree (start_datetime);


--
-- TOC entry 3569 (class 1259 OID 66403)
-- Name: requirement_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX requirement_types_code_key ON public.requirement_types USING btree (code);


--
-- TOC entry 3552 (class 1259 OID 66397)
-- Name: risk_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX risk_reasons_code_key ON public.risk_reasons USING btree (code);


--
-- TOC entry 3559 (class 1259 OID 66398)
-- Name: uq_customer_risk_reason; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_customer_risk_reason ON public.customer_risk_reasons USING btree (customer_risk_id, risk_reason_id);


--
-- TOC entry 3609 (class 1259 OID 66413)
-- Name: uq_foreman_day_roster_date_foreman; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_foreman_day_roster_date_foreman ON public.foreman_day_rosters USING btree (date, foreman_person_id);


--
-- TOC entry 3612 (class 1259 OID 66414)
-- Name: uq_foreman_day_roster_member_date_person; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_foreman_day_roster_member_date_person ON public.foreman_day_roster_members USING btree (date, person_resource_id);


--
-- TOC entry 3621 (class 1259 OID 66417)
-- Name: uq_job_access_constraint; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_job_access_constraint ON public.job_access_constraints USING btree (job_id, access_constraint_id);


--
-- TOC entry 3624 (class 1259 OID 66657)
-- Name: uq_job_preferred_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_job_preferred_channel ON public.job_preferred_channels USING btree (job_id, channel);


--
-- TOC entry 3604 (class 1259 OID 66412)
-- Name: uq_resource_reservation_segment_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_resource_reservation_segment_resource ON public.resource_reservations USING btree (schedule_segment_id, resource_id);


--
-- TOC entry 3615 (class 1259 OID 66415)
-- Name: uq_segment_roster_link_segment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_segment_roster_link_segment ON public.segment_roster_links USING btree (schedule_segment_id);


--
-- TOC entry 3588 (class 1259 OID 66639)
-- Name: uq_travel_end_of_day_active_per_foreman_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_travel_end_of_day_active_per_foreman_date ON public.travel_segments USING btree (foreman_person_id, service_date) WHERE ((deleted_at IS NULL) AND (travel_type = 'END_OF_DAY'::public."TravelType"));


--
-- TOC entry 3589 (class 1259 OID 66638)
-- Name: uq_travel_start_of_day_active_per_foreman_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_travel_start_of_day_active_per_foreman_date ON public.travel_segments USING btree (foreman_person_id, service_date) WHERE ((deleted_at IS NULL) AND (travel_type = 'START_OF_DAY'::public."TravelType"));


--
-- TOC entry 3642 (class 1259 OID 107218)
-- Name: uq_weekly_snapshot_date_equipment_rep; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_weekly_snapshot_date_equipment_rep ON public.weekly_backlog_snapshots USING btree (snapshot_date, equipment_type, sales_rep_code);


--
-- TOC entry 3546 (class 1259 OID 131073)
-- Name: users_clerk_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_clerk_id_key ON public.users USING btree (clerk_id);


--
-- TOC entry 3547 (class 1259 OID 66396)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3643 (class 1259 OID 107244)
-- Name: weekly_backlog_snapshots_null_rep_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX weekly_backlog_snapshots_null_rep_unique ON public.weekly_backlog_snapshots USING btree (snapshot_date, equipment_type) WHERE (sales_rep_code IS NULL);


--
-- TOC entry 3687 (class 2606 OID 66620)
-- Name: activity_logs activity_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3648 (class 2606 OID 66430)
-- Name: customer_risk_reasons customer_risk_reasons_customer_risk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risk_reasons
    ADD CONSTRAINT customer_risk_reasons_customer_risk_id_fkey FOREIGN KEY (customer_risk_id) REFERENCES public.customer_risks(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3649 (class 2606 OID 66435)
-- Name: customer_risk_reasons customer_risk_reasons_risk_reason_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risk_reasons
    ADD CONSTRAINT customer_risk_reasons_risk_reason_id_fkey FOREIGN KEY (risk_reason_id) REFERENCES public.risk_reasons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3646 (class 2606 OID 66420)
-- Name: customer_risks customer_risks_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risks
    ADD CONSTRAINT customer_risks_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3647 (class 2606 OID 66425)
-- Name: customer_risks customer_risks_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_risks
    ADD CONSTRAINT customer_risks_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3655 (class 2606 OID 66465)
-- Name: estimate_history estimate_history_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estimate_history
    ADD CONSTRAINT estimate_history_changed_by_user_id_fkey FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3656 (class 2606 OID 66460)
-- Name: estimate_history estimate_history_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estimate_history
    ADD CONSTRAINT estimate_history_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3679 (class 2606 OID 66585)
-- Name: foreman_day_roster_members foreman_day_roster_members_person_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_roster_members
    ADD CONSTRAINT foreman_day_roster_members_person_resource_id_fkey FOREIGN KEY (person_resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3680 (class 2606 OID 66580)
-- Name: foreman_day_roster_members foreman_day_roster_members_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_roster_members
    ADD CONSTRAINT foreman_day_roster_members_roster_id_fkey FOREIGN KEY (roster_id) REFERENCES public.foreman_day_rosters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3676 (class 2606 OID 66575)
-- Name: foreman_day_rosters foreman_day_rosters_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_rosters
    ADD CONSTRAINT foreman_day_rosters_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3677 (class 2606 OID 66565)
-- Name: foreman_day_rosters foreman_day_rosters_foreman_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_rosters
    ADD CONSTRAINT foreman_day_rosters_foreman_person_id_fkey FOREIGN KEY (foreman_person_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3678 (class 2606 OID 66570)
-- Name: foreman_day_rosters foreman_day_rosters_home_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foreman_day_rosters
    ADD CONSTRAINT foreman_day_rosters_home_base_id_fkey FOREIGN KEY (home_base_id) REFERENCES public.home_bases(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3689 (class 2606 OID 66630)
-- Name: import_row_maps import_row_maps_import_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_row_maps
    ADD CONSTRAINT import_row_maps_import_run_id_fkey FOREIGN KEY (import_run_id) REFERENCES public.import_runs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3688 (class 2606 OID 66625)
-- Name: import_runs import_runs_run_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_runs
    ADD CONSTRAINT import_runs_run_by_user_id_fkey FOREIGN KEY (run_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3684 (class 2606 OID 66610)
-- Name: job_access_constraints job_access_constraints_access_constraint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_access_constraints
    ADD CONSTRAINT job_access_constraints_access_constraint_id_fkey FOREIGN KEY (access_constraint_id) REFERENCES public.access_constraints(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3685 (class 2606 OID 66605)
-- Name: job_access_constraints job_access_constraints_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_access_constraints
    ADD CONSTRAINT job_access_constraints_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3670 (class 2606 OID 66540)
-- Name: job_blockers job_blockers_blocker_reason_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_blockers
    ADD CONSTRAINT job_blockers_blocker_reason_id_fkey FOREIGN KEY (blocker_reason_id) REFERENCES public.blocker_reasons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3671 (class 2606 OID 66550)
-- Name: job_blockers job_blockers_cleared_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_blockers
    ADD CONSTRAINT job_blockers_cleared_by_user_id_fkey FOREIGN KEY (cleared_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3672 (class 2606 OID 66545)
-- Name: job_blockers job_blockers_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_blockers
    ADD CONSTRAINT job_blockers_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3673 (class 2606 OID 66535)
-- Name: job_blockers job_blockers_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_blockers
    ADD CONSTRAINT job_blockers_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3686 (class 2606 OID 66615)
-- Name: job_preferred_channels job_preferred_channels_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_preferred_channels
    ADD CONSTRAINT job_preferred_channels_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3650 (class 2606 OID 66445)
-- Name: jobs jobs_completed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_completed_by_user_id_fkey FOREIGN KEY (completed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3651 (class 2606 OID 66450)
-- Name: jobs jobs_confirmed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_confirmed_by_user_id_fkey FOREIGN KEY (confirmed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3652 (class 2606 OID 66455)
-- Name: jobs jobs_contact_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_contact_owner_user_id_fkey FOREIGN KEY (contact_owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3653 (class 2606 OID 66440)
-- Name: jobs jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3654 (class 2606 OID 118431)
-- Name: jobs jobs_linked_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_linked_job_id_fkey FOREIGN KEY (linked_job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3657 (class 2606 OID 66470)
-- Name: requirements requirements_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3658 (class 2606 OID 66475)
-- Name: requirements requirements_requirement_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_requirement_type_id_fkey FOREIGN KEY (requirement_type_id) REFERENCES public.requirement_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3674 (class 2606 OID 66560)
-- Name: resource_reservations resource_reservations_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3675 (class 2606 OID 66555)
-- Name: resource_reservations resource_reservations_schedule_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_reservations
    ADD CONSTRAINT resource_reservations_schedule_segment_id_fkey FOREIGN KEY (schedule_segment_id) REFERENCES public.schedule_segments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3664 (class 2606 OID 66510)
-- Name: schedule_events schedule_events_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3665 (class 2606 OID 66505)
-- Name: schedule_events schedule_events_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3692 (class 2606 OID 107229)
-- Name: schedule_notification_logs schedule_notification_logs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_notification_logs
    ADD CONSTRAINT schedule_notification_logs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3693 (class 2606 OID 107234)
-- Name: schedule_notification_logs schedule_notification_logs_schedule_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_notification_logs
    ADD CONSTRAINT schedule_notification_logs_schedule_segment_id_fkey FOREIGN KEY (schedule_segment_id) REFERENCES public.schedule_segments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3694 (class 2606 OID 107239)
-- Name: schedule_notification_logs schedule_notification_logs_sent_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_notification_logs
    ADD CONSTRAINT schedule_notification_logs_sent_by_user_id_fkey FOREIGN KEY (sent_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3659 (class 2606 OID 66485)
-- Name: schedule_segments schedule_segments_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_segments
    ADD CONSTRAINT schedule_segments_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3660 (class 2606 OID 66480)
-- Name: schedule_segments schedule_segments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_segments
    ADD CONSTRAINT schedule_segments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3691 (class 2606 OID 107224)
-- Name: scheduling_conflict_dismissals scheduling_conflict_dismissals_dismissed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduling_conflict_dismissals
    ADD CONSTRAINT scheduling_conflict_dismissals_dismissed_by_user_id_fkey FOREIGN KEY (dismissed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3690 (class 2606 OID 107219)
-- Name: seasonal_freeze_windows seasonal_freeze_windows_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_freeze_windows
    ADD CONSTRAINT seasonal_freeze_windows_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3681 (class 2606 OID 66600)
-- Name: segment_roster_links segment_roster_links_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_roster_links
    ADD CONSTRAINT segment_roster_links_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3682 (class 2606 OID 66595)
-- Name: segment_roster_links segment_roster_links_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_roster_links
    ADD CONSTRAINT segment_roster_links_roster_id_fkey FOREIGN KEY (roster_id) REFERENCES public.foreman_day_rosters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3683 (class 2606 OID 66590)
-- Name: segment_roster_links segment_roster_links_schedule_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_roster_links
    ADD CONSTRAINT segment_roster_links_schedule_segment_id_fkey FOREIGN KEY (schedule_segment_id) REFERENCES public.schedule_segments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3661 (class 2606 OID 66500)
-- Name: travel_segments travel_segments_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_segments
    ADD CONSTRAINT travel_segments_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3662 (class 2606 OID 66490)
-- Name: travel_segments travel_segments_foreman_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_segments
    ADD CONSTRAINT travel_segments_foreman_person_id_fkey FOREIGN KEY (foreman_person_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3663 (class 2606 OID 66495)
-- Name: travel_segments travel_segments_related_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_segments
    ADD CONSTRAINT travel_segments_related_job_id_fkey FOREIGN KEY (related_job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3666 (class 2606 OID 66520)
-- Name: vacated_slots vacated_slots_chosen_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacated_slots
    ADD CONSTRAINT vacated_slots_chosen_job_id_fkey FOREIGN KEY (chosen_job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3667 (class 2606 OID 66525)
-- Name: vacated_slots vacated_slots_chosen_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacated_slots
    ADD CONSTRAINT vacated_slots_chosen_segment_id_fkey FOREIGN KEY (chosen_segment_id) REFERENCES public.schedule_segments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3668 (class 2606 OID 66530)
-- Name: vacated_slots vacated_slots_dismissed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacated_slots
    ADD CONSTRAINT vacated_slots_dismissed_by_user_id_fkey FOREIGN KEY (dismissed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3669 (class 2606 OID 66515)
-- Name: vacated_slots vacated_slots_source_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacated_slots
    ADD CONSTRAINT vacated_slots_source_segment_id_fkey FOREIGN KEY (source_segment_id) REFERENCES public.schedule_segments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-03-12 14:24:49

--
-- PostgreSQL database dump complete
--

\unrestrict R6BGpmkGYZBW2Oqry3hRyktAttRBXfIoxUzhXDgg3z1S2lBMc0eElC8VX1opzOR

