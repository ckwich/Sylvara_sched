# Scheduler — plan.md

> This repository is currently the scheduling module. It will later be merged into the broader **Sylvara** CRM suite. Initial deployment target is LAN-only (internal) under an office hostname (e.g., `schedule-pc:3000`) and/or the internal subdomain `scheduler.irontreeservice.com` when appropriate.

## 0. North Star
Replace the existing backlog tracking workbook with a multi-user app that:
- Maintains a **live current backlog** for Crane and Bucket work.
- Supports **partial scheduling** ("piece by piece") with multi-day and time-based segments.
- Tracks **schedule history**, **estimate edits**, and a full **activity log**.
- Extracts high-value operational data out of legacy **Notes** into structured fields while preserving the raw text.
- Provides a "**Push up if possible**" recommender when a scheduled slot is vacated.
- Replicates all spreadsheet reports (not spreadsheet UI) using modern filtering/grouping.

**Key definitions locked from conversation**
- Crane model assignment: **1090** (larger Liebherr), **1060** (smaller), **Either**.
- Bucket "Lift" means **Spider Lift**.
- Seasonal/ground flags:
  - **Winter** = should be done in winter for tree health.
  - **Frozen** = must wait for frozen ground to prevent lawn damage. Triggers a non-blocking `FROZEN_GROUND_REQUIRED` reminder on scheduling attempt. No weather API; scheduler decides.
- Pipeline states: **TBS → PARTIALLY_SCHEDULED → FULLY_SCHEDULED → COMPLETED**
  - Winter/Frozen/Unable/requirements are constraints inside **TBS**.
- Notes abbreviations:
  - **DW** = Ditch Witch (equipment)
  - **DTL** = Police detail required
  - **CBP** = Crane and Boom Permit
  - **RS** = Rescheduled **to** {date}
  - **TBRS** = To be rescheduled **from** {date}
  - "RS TO X FROM Y" = date swap (pushed up)
- Job revenue stays in backlog until job is complete and customer satisfied (no partial $ recognition).
- Requirements enforcement UX: **polite reminder pop-up** (no hard warnings/blocks). Requirements that are not Approved or Not Required are clearly indicated with their actual status.

## 0.9 UX Priority (Now)

UX is a first-class priority for this scheduler module. The goal is **low-friction dispatch work** (fast, obvious, hard to misuse) and **low-ops burden** (easy to start/stop, diagnose, and recover).

**UX principles (apply to every UI change):**
- **Make the "happy path" obvious**: schedule view loads with minimal inputs; clear primary CTA; sensible defaults.
- **Progressive disclosure**: keep advanced controls (filters, diagnostics, admin settings) out of the primary flow.
- **Guardrails over cleverness**: validate early, explain *why* a write is blocked (conflict windows, overlap, midnight, missing roster) and how to fix it.
- **Fast feedback**: optimistic UI only when safe; otherwise show immediate status, errors, and next action.
- **Keyboard-first and accessibility-minded**: tab order, visible focus, ARIA where appropriate; avoid UI patterns that require precision mouse work.
- **Operational clarity**: surface "system state" minimally (API reachable, timezone in use, roster-linked semantics) without leaking sensitive internals.

**Definition of Done for any user-facing change:**
- Adds/updates smoke coverage where feasible (API) and/or integration coverage when correctness is at risk.
- Includes clear error strings and user-facing affordances (retry, reset, copy details) where a failure is likely.
- Does not introduce hydration mismatches or environment-specific assumptions.

---

## 1. Scope Boundaries (Beta)
### In scope (Beta)
- Full-fidelity **import** of all relevant workbook data (backlog + completed + exception lists).
- Core CRUD for Customers, Jobs, Schedule Segments.
- Equipment inventory and crew resources (count-based, editable quantities).
- Activity log for all changes (who/what/when).
- Schedule history (structured going forward; legacy RS/TBRS parsed from Notes with source tags).
- Reports equivalent to current "SUMM" plus weekly comparison value ("previous week backlog $").
- Notes extraction with suggested structured fields + manual overrides.
- Customer scheduling notifications (SMS + email; scheduler-triggered, not automatic).
- Dispatch board multi-foreman conflict visibility (equipment double-booking, person conflicts, capacity warnings, job overlap detection).
- Seasonal freeze window calendar overlay (admin-managed historical bands; display only).

### Explicitly out of scope (Beta)
- Full-feature crew mobile app / crew confirmation workflow automation — **post-v1, native app**. See §5.8.
- Automated external permit integration.
- Perfect historical reconstruction of every note nuance (we keep `notes_raw` always).
- Notes parsing expansion beyond tree service vocabulary — post-v1. See §3.2.
- BETWEEN_JOBS travel automation (AUTO source) — post-v1.

---

## 2. Data Model (Authoritative)

### 2.1 Users & Roles
**User**
- id, name, email, role: `MANAGER | SCHEDULER | VIEWER` (beta default; can expand later)
- active flag

**Permission baseline**
- Manager: full access
- Scheduler: edit most job/schedule fields; manager can refine later
- Viewer: read-only

### 2.2 Customers
**Customer**
- id
- name (primary)
- optional: phone/email fields (beta optional)
- unhappy/risk flags live here (customer-level)
- deleted_at (nullable; soft delete — required for Sylvara merge compatibility)

**CustomerRisk (Unhappy Customer)**
- id, customer_id
- severity (1–10)
- reasons (join table: **CustomerRiskReason** — customer_risk_id, risk_reason_id FK to admin-managed RiskReason list)
- narrative (text)
- status: `OPEN | MONITORING | RESOLVED`
- owner_user_id (optional)
- created_at, updated_at

### 2.3 Jobs
**Job**
- id, customer_id
- equipment_type: `CRANE | BUCKET`
- sales_rep_code (text; normalized to uppercase-trimmed at import and on entry — see §11)
- job_site_address (text)
- town (text)
- estimate_id (nullable UUID FK → estimates) *(NULL for all legacy/import/standalone-era jobs; populated in the integrated era when a job is created from an approved Sylvara estimate — see §12.2)*

**Workflow state**
- `state` is a **derived property, not a stored column.** Do not add a `state` column to the jobs table. Derive it at query time using the algorithm in §2.5.
- The one exception is `COMPLETED`: a job is COMPLETED when `completed_date IS NOT NULL`. Setting `completed_date` is the act of completing a job. There is no separate boolean or enum column.
- completed_date (date; set explicitly by scheduler; defaults to last segment's end date as a convenience — but user must confirm; required if no segments exist)
- completed_by_user_id (nullable FK; who marked it complete)
- completion_notes (optional)

**Financials & estimates**
- amount_dollars (numeric)
- estimate_hours_current (numeric) *(authoritative ONSITE labor hours required; can be set while TBS before any schedule exists)*
- travel_hours_estimate (numeric, default 0) *(scheduler-entered travel-time estimate for planning/reporting and future auto-travel; not used to size ONSITE calendar blocks in beta)*
  - Derived (not stored): total_hours_estimate = estimate_hours_current + travel_hours_estimate
  - Note: Hours can be decided before a job is scheduled. Actual calendar time blocks exist only on ScheduleSegments/TravelSegments.

**EstimateHistory**
- id, job_id
- changed_by_user_id
- changed_at
- previous_amount_dollars, new_amount_dollars (optional)
- previous_estimate_hours, new_estimate_hours
- note (text; optional)

### 2.3.1 WeeklyBacklogSnapshot

Stores a point-in-time capture of backlog metrics, taken once per week. Used to power the SUMM prior-week comparison and the year-over-year Comparable Report.

**WeeklyBacklogSnapshot**
- id (UUID)
- snapshot_date (date — normalized to the Saturday that opens the captured week; ISO week anchor is Saturday)
- year (integer — derived from snapshot_date for query convenience)
- week_number (integer — ISO week number 1–53, derived from snapshot_date)
- equipment_type: `CRANE | BUCKET`
- sales_rep_code (text, nullable — NULL for equipment-level total rows; populated for per-rep rows)
- scheduled_dollars (numeric, nullable — total $ of jobs with at least one active ScheduleSegment; NULL for historical pre-app rows)
- tbs_dollars (numeric, nullable — total $ of TBS jobs with no active segments; NULL for historical pre-app rows)
- total_dollars (numeric, nullable — scheduled_dollars + tbs_dollars; NULL for historical pre-app rows)
- scheduled_hours (numeric — total estimate_hours_current of scheduled jobs)
- tbs_hours (numeric — total estimate_hours_current of TBS jobs)
- total_hours (numeric — scheduled_hours + tbs_hours)
- crew_count (numeric — derived at snapshot time from active foreman Resources for this equipment type; supports fractional values e.g. 2.5)
- crew_count_override (numeric, nullable — if set by a MANAGER, this value is used in place of crew_count for display and calculations; crew_count retains the derived value for audit purposes)
- created_at
- deleted_at (soft delete — Sylvara standard)

**Unique constraint:** (snapshot_date, equipment_type, sales_rep_code) — NULL sales_rep_code is treated as a distinct value (use a partial unique index or NULLIF as appropriate in Prisma).

**Dollar fields are nullable by design.** Historical snapshots seeded from the comparable spreadsheet populate only hour fields. Dollar accumulation begins from the app go-live date onward. The UI must handle NULL dollar fields gracefully — display "—" rather than $0.

**Crew count derivation:** At snapshot time, count active (non-deleted, active=true) foreman Resources. For CRANE snapshots, count foremen whose primary equipment is CRANE (or who are unassigned to a specific type — use all active foremen if no equipment type is tracked on Resource). For BUCKET, same logic. If Resource does not track equipment type, use total active foreman count for both. A MANAGER may override the displayed crew_count for any snapshot via crew_count_override without losing the derived value.

**Legacy scheduling fields**
- approval_date (date)
- approval_call (text)
- confirmed_text (legacy string from sheet; preserved)
- confirmed_by_user_id (nullable; going forward defaults to current user)
- confirmed_at (nullable)

**Constraints / flags extracted from sheet columns**
- crane_model_suitability: `1090 | 1060 | EITHER | NULL` (for crane jobs; can be per segment later)
- requires_spider_lift (bool) (for bucket jobs)
- winter_flag (bool)
- frozen_ground_flag (bool) *(triggers non-blocking `FROZEN_GROUND_REQUIRED` warning on scheduling attempt; no weather API; scheduler decides)*

**Notes**
- notes_raw (long text; preserved forever)
- notes_last_parsed_at
- notes_parse_confidence (JSON object; per-field confidence scores 0–100, e.g. `{"push_up_if_possible": 95, "dtl": 80}`)

**Structured fields extracted from notes (beta set)**
- push_up_if_possible (bool)
- must_be_first_job (bool)
- preferred_start_time (time, nullable)
- preferred_end_time (time, nullable)
- availability_notes (text) (for blackouts/ranges that don't parse cleanly)
- no_email (bool)
- preferred_channels (join table: **JobPreferredChannel** — job_id, channel: `CALL | TEXT | EMAIL`)
- contact_allowed (bool, default true)
- contact_owner_user_id (nullable)
- contact_instructions (text)
- access_constraints (join table: **JobAccessConstraint** — job_id, access_constraint_id FK to AccessConstraint admin list)
- access_notes (text)

**Soft delete**
- deleted_at (nullable timestamptz) *(required for Sylvara merge compatibility; use `deleted_at IS NULL` in all queries; never hard-delete job rows)*

### 2.4 Requirements (Permits / Police Detail / etc.)
Use one unified entity for regulatory/dependency requirements.

**Requirement**
- id, job_id
- requirement_type_id (FK to admin-managed list)
- status: `REQUIRED | REQUESTED | APPROVED | DENIED | NOT_REQUIRED`
- notes (text)
- source: `LEGACY_PARSE | USER_ACTION` *(how this requirement was created — parsed from notes_raw vs. manually entered)*
- raw_snippet (text, nullable) *(original notes text that triggered this requirement; preserved for traceability when source=LEGACY_PARSE)*
- deleted_at (nullable timestamptz; soft delete)
- created_at, updated_at

**RequirementType (admin-managed)**
Seed at minimum:
- POLICE_DETAIL (DTL)
- CRANE_AND_BOOM_PERMIT (CBP)
- TREE_PERMIT
- (extendable via UI by manager/admin)

### 2.5 Scheduling
Because jobs can be scheduled in pieces, scheduling is segment-based.

**ScheduleSegment**
- id, job_id
- segment_group_id (uuid, nullable; links split-across-midnight segments so paired operations are possible)
- segment_type: `PRIMARY | RETURN_VISIT`
- start_datetime (required; timestamptz, UTC-stored)
- end_datetime (required; timestamptz, UTC-stored; must be same local calendar day as start_datetime)
- scheduled_hours_override (numeric, nullable; rare; if set, overrides derived hours for reporting/state math)
- deleted_at (nullable; soft delete — required so vacated-slot detection can trigger the push-up recommender)
- notes (text)
- created_by_user_id, created_at, updated_at

**TravelSegment**
- id
- foreman_person_id (FK to Resource type PERSON; must have is_foreman=true)
- related_job_id (nullable)
- start_datetime, end_datetime (required; timestamptz, UTC-stored)
- travel_type: `START_OF_DAY | END_OF_DAY | BETWEEN_JOBS` *(beta uses START_OF_DAY and END_OF_DAY only; BETWEEN_JOBS / AUTO source is post-v1)*
- source: `MANUAL | AUTO` (AUTO is post-v1)
- locked (bool, default false) *(AUTO must not override locked travel blocks)*
- notes (text)
- created_by_user_id, created_at, updated_at
- deleted_at (nullable; soft delete only — never hard-delete)

**Segment scope rule:** one ScheduleSegment = one calendar day. Multi-day jobs use multiple segments. This keeps crew assignment unambiguous (one crew per segment) and simplifies the calendar view. Segments may be partial-day (e.g., 9:00–13:00 is valid). Segments must not cross midnight local time — a segment that would run from 8pm to 2am must be split at midnight into two segments on consecutive days.

**Midnight split linkage (beta):** When a segment is split at midnight, create two ScheduleSegments and set both to the same `segment_group_id`. UI must treat them as "linked halves": on move/resize/delete of one half, prompt "Apply to linked half too?" (default **No**). If the user chooses Yes, apply the same operation to the other half in the same database transaction.

**Linked-half move semantics (authoritative):** If the user chooses "Apply to linked half too?" on a move/resize, preserve the midnight boundary (each half stays within its own local date). Apply the analogous delta within each day; if either half would cross midnight, reject with `CROSSES_MIDNIGHT`.

**State derivation (authoritative algorithm)**
Compute `scheduled_effective_hours` = sum over all non-deleted segments:
- if `scheduled_hours_override` is set → use that value
- else → compute `(end_datetime - start_datetime)` in hours using wall-clock time in the company timezone

Then derive state:
1. If `completed_date IS NOT NULL` → `COMPLETED` (never auto-derived; set only by explicit scheduler action)
2. Else if `scheduled_effective_hours <= 0` → `TBS`
3. Else if `estimate_hours_current` is NULL → `PARTIALLY_SCHEDULED` (surface "Missing estimate hours" warning)
4. Else if `scheduled_effective_hours < estimate_hours_current - 0.01` → `PARTIALLY_SCHEDULED`
5. Else → `FULLY_SCHEDULED`

(The 0.01 tolerance handles floating-point imprecision. Hours are stored as decimals.)

**ScheduleEvent (history)**
- id, job_id
- event_type: `RESCHEDULE_TO | TBS_FROM | DATE_SWAP | NOTE_PARSE_EVENT | MANUAL_EDIT`
- source: `LEGACY_PARSE | USER_ACTION`
- from_at (timestamp, nullable; legacy date-only: set 00:00 in company timezone, then store as timestamptz/UTC-normalized)
- to_at (timestamp, nullable; legacy date-only: set 00:00 in company timezone, then store as timestamptz/UTC-normalized)
- actor_user_id (nullable)
- actor_code (text; for legacy initials)
- raw_snippet (text; for legacy parse traceability)
- created_at

**VacatedSlot**
A dedicated record created whenever a time window is freed. Drives the push-up recommender. Create it in the **same database transaction** as the segment mutation, inside the scheduling service, using the segment's **pre-change** start/end values. Do not derive this from ActivityLog diffs — an explicit table makes the recommender straightforward to build, test, and extend.
- id
- source_segment_id (FK to ScheduleSegment; the segment that was deleted/moved/shortened)
- source_action: `DELETED | MOVED | SHORTENED`
- start_datetime, end_datetime (the freed window)
- slot_hours (numeric; wall-clock hours of the freed window, computed at creation time)
- equipment_type (copied from the source segment's job at creation time; used for candidate filtering)
- status: `OPEN | USED | DISMISSED`
- chosen_job_id (nullable FK; set when scheduler applies a push-up candidate)
- chosen_segment_id (nullable FK; set when a new segment is created from this slot)
- created_at
- dismissed_at (nullable), dismissed_by_user_id (nullable)

**SchedulingConflictDismissal**
Tracks dismissed conflict notices per date per user — prevents re-surfacing dismissed items on the dispatch board conflict summary panel.
- id
- user_id (FK → users)
- conflict_date (date)
- conflict_type: `EQUIPMENT_OVERCOMMIT | PERSON_CONFLICT | CAPACITY_WARNING | JOB_OVERLAP`
- conflict_key (varchar; identifies the specific conflict, e.g. resource_id for equipment conflicts)
- dismissed_at (timestamptz)

### 2.6 Job Blockers (TBS constraints)
Some jobs are "TBS" specifically because something blocks scheduling. Track blockers explicitly (not buried in notes).

**Overlap rule with Requirements:** A permit-related blocker (e.g., PERMIT_PENDING) and a Requirement (e.g., CBP status=REQUESTED) can coexist for the same job — they serve different purposes. The Requirement tracks the permit's approval lifecycle. The JobBlocker tracks whether that pending permit is actively preventing scheduling. When a permit is APPROVED, the scheduler clears the corresponding JobBlocker manually. Do not auto-clear blockers from requirement status changes.

**JobBlocker**
- id, job_id
- blocker_reason_id (FK to admin-managed list)
- status: `ACTIVE | CLEARED`
- notes (text)
- created_by_user_id (nullable for legacy import)
- created_at, cleared_at (nullable), cleared_by_user_id (nullable)
- deleted_at (nullable timestamptz; soft delete)

**BlockerReason (admin-managed)**
- id
- code (unique, e.g., PERMIT_PENDING, CUSTOMER_UNRESPONSIVE)
- label
- active (bool)

### 2.7 Resources (Equipment + People)
Start count-based; keep path to named units later.

**Resource**
- id
- resource_type: `EQUIPMENT | PERSON`
- name
- inventory_quantity (int; editable for EQUIPMENT; for PERSON must be 1 — UI must hide/disable editing when resource_type=PERSON, and backend must enforce = 1)
- is_foreman (bool, default false) *(only meaningful when resource_type=PERSON)*
  - **PERSON resources are unique individuals** (inventory_quantity must be 1; do not decrement "inventory" when staffing rosters — exclusivity is enforced via roster membership uniqueness).
- active (bool)
- deleted_at (nullable timestamptz; soft delete)

**ResourceReservation**
- id, schedule_segment_id, resource_id
- quantity (int; default 1)
- notes (text)
- deleted_at (nullable timestamptz; soft delete)
- Unique constraint on (schedule_segment_id, resource_id) WHERE deleted_at IS NULL — prevents double-booking the same resource on the same segment.

### 2.8 Home Bases (manager-managed)
Dump sites function as "home base." Managers can add/remove home bases over time. Home bases include addresses for future routing integrations.

**HomeBase**
- id
- name (e.g., Beverly, Natick)
- address_line1, address_line2, city, state, postal_code
- opening_time (time, nullable) *(soft anchor used when a day has no events; falls back to company operating hours if unset)*
- closing_time (time, nullable) *(UI display preference only; not a hard scheduling boundary)*
- active (bool)
- deleted_at (nullable timestamptz; soft delete)
- created_at, updated_at

### 2.9 Foreman Day Rosters (authoritative staffing; day-exclusive members)
Crews are composed per-day under a foreman. A non-foreman crew member may be on **at most one foreman roster per day**.

**ForemanDayRoster**
- id
- date (local company timezone date)
- foreman_person_id (FK to Resource of type PERSON; is_foreman=true)
- home_base_id (FK HomeBase) *(required at roster creation; used as travel anchor and scheduling availability anchor)*
- preferred_start_time (time, nullable) *(soft anchor only; not a hard boundary)*
- preferred_end_time (time, nullable) *(soft anchor only; not a hard boundary)*
- notes (text)
- created_by_user_id, created_at, updated_at
- deleted_at (nullable timestamptz; soft delete)

**ForemanDayRosterMember**
- id
- roster_id (FK ForemanDayRoster)
- date (denormalized copy from roster.date for uniqueness enforcement)
- person_resource_id (FK Resource type PERSON)
- role: `CLIMBER | GROUND | OPERATOR | OTHER`
- created_at
- Unique (day-exclusive): (tenant_id, date, person_resource_id) WHERE deleted_at IS NULL — a crew member cannot appear on two rosters on the same day.

### 2.10 Segment Staffing Link (roster-backed)
Schedule segments reference the roster for that day; staffing defaults from the roster.

**SegmentRosterLink**
- id
- schedule_segment_id (FK; one per segment; UNIQUE)
- roster_id (FK ForemanDayRoster)
- created_by_user_id, created_at
- Unique: (schedule_segment_id)

A ScheduleSegment **without** a corresponding SegmentRosterLink is **not** considered scheduled for any foreman or day. All scheduling writes that create segments for a foreman/day must create the ScheduleSegment **and** its SegmentRosterLink in the **same DB transaction**.

### 2.11 Customer Scheduling Notifications
Notifications are intentional scheduler-triggered acts, not automatic side effects. The system tracks all schedule changes internally (VacatedSlot, ScheduleEvent, ActivityLog) but sending a customer notification requires explicit scheduler confirmation.

**ScheduleNotificationLog**
- id, job_id
- schedule_segment_id (nullable FK; null for cancellation notifications where no segment remains)
- notification_type: `JOB_SCHEDULED | JOB_RESCHEDULED | JOB_CANCELLED | CONFIRMATION_REQUEST`
- sent_by_user_id (FK → users)
- channels_sent (jsonb; array of channels actually used, e.g. `["SMS", "EMAIL"]`)
- channels_suppressed (jsonb, nullable; channels suppressed due to opt-in rules, e.g. `[{channel: "EMAIL", reason: "no_email_flag"}]`)
- customer_response (enum, nullable): `CONFIRMED | RESCHEDULE_REQUESTED | NO_RESPONSE`
- customer_responded_at (timestamptz, nullable)
- sent_at (timestamptz)

**Opt-in enforcement (all three must pass before any channel is used):**
- `jobs.contact_allowed = true` — if false, block all outbound notifications
- `jobs.no_email = false` — if true, suppress email channel
- `jobs.preferred_channels` — only send via channels in this list

### 2.12 Seasonal Freeze Windows (admin-managed)
Historical freeze window data for the dispatch board calendar overlay. Display only — no bearing on scheduling logic, attempt endpoints, or state derivation.

**SeasonalFreezeWindow**
- id
- label (varchar; e.g. "2023–2024 Freeze Window", "Typical Jan–Feb Freeze Period")
- start_date (date)
- end_date (date)
- notes (text, nullable)
- active (bool; whether to display this band on the current dispatch board)
- created_by_user_id (FK → users)
- created_at


## 3. Notes Extraction (Import + Ongoing)

### 3.1 Principles
- Always store **notes_raw** unchanged.
- Extract structured fields with best-effort parsing + confidence.
- Never silently discard information; if parse fails, keep it in raw notes and surface "unparsed signals" list.

### 3.2 Parsing rules (v1 — tree service vocabulary only)
**Scope:** Tree service abbreviation vocabulary only for beta. Expansion to landscaping/snow removal parsing vocabulary is post-v1. See §11 for the post-v1 extensibility architecture.

**Flags**
- push_up_if_possible:
  - triggers: "PUSH UP IF POSSIBLE", "PU", "P/U"
- must_be_first_job:
  - triggers: "MUST BE 1ST JOB", "WANTS TO BE 1ST JOB"
- no_email:
  - triggers: "NO EMAIL"

**Requirements**
- DTL → Requirement(POLICE_DETAIL, status=REQUIRED, source=LEGACY_PARSE, raw_snippet preserved)
- CBP → Requirement(CRANE_AND_BOOM_PERMIT, status=REQUIRED, source=LEGACY_PARSE, raw_snippet preserved)
- "TREE PERMIT" / "TREE PERMIT NEEDED" → Requirement(TREE_PERMIT, status=REQUIRED, source=LEGACY_PARSE, raw_snippet preserved)

**Equipment suggestions**
- DW → suggest Resource "Ditch Witch"
- GRINDER / LIFT / etc. (expandable dictionary)
These become suggested reservations; do not auto-reserve unless user confirms.

**Schedule history (legacy parse)**
- RS {date} → ScheduleEvent(RESCHEDULE_TO, to_at, source=LEGACY_PARSE, raw_snippet preserved)
- TBRS {date} → ScheduleEvent(TBS_FROM, from_at, source=LEGACY_PARSE, raw_snippet preserved)
- RS TO {to} FROM {from} → ScheduleEvent(DATE_SWAP, from_at, to_at, source=LEGACY_PARSE, raw_snippet preserved)
All legacy-derived events use source=LEGACY_PARSE and keep raw_snippet.

### 3.3 UI for extracted data
On Job detail:
- "Extracted from Notes" panel shows:
  - detected flags, requirements, suggested equipment, schedule events
  - confidence
  - quick "accept/edit" actions

---

## 4. Import Plan (Full Fidelity)

### 4.1 Authoritative input
- Treat CRANE and BUCKET sheets as authoritative because they're edited directly and contain scheduling hour breakdowns.
- Import other sheets for historical/reference parity:
  - Completed (2026 Crane Completed, 2026 Bucket Completed)
  - Unhappy Customer (customer-level risk)
  - Unable to be scheduled (maps to TBS + blocker/requirement/access constraints)
  - Winter sheets (map to winter_flag)
  - DS sheets (become saved views; data imported but not treated as separate sources)

### 4.2 Import mechanics
- Build an importer that:
  - reads rows from each relevant sheet
  - normalizes into Job/Customer records
  - records traceability via `ImportRun` and `ImportRowMap` (see below; do not add import fields to Job)
  - attaches legacy `notes_raw`, `confirmed_text`, etc.
  - attempts notes parsing as above
  - marks Completed items by setting completed_date (and completed_by_user_id if present/derivable)
  - Completed-without-segments fallback: if a row indicates completion but no schedule segments are created/parseable, set completed_date from any explicit completion date field if present; otherwise leave completed_date NULL and write an ActivityLog entry tagged IMPORT_NEEDS_REVIEW_COMPLETION_DATE for manual follow-up.

**ImportRun**
- id (UUID)
- started_at, finished_at
- run_by_user_id (nullable; system run if null)
- source_filename (text)
- status: `IN_PROGRESS | COMPLETED | FAILED`
- summary_json (counts of rows read/created/errored per sheet)

**ImportRowMap**
- id (UUID), import_run_id (UUID)
- sheet_name (text)
- row_number (int)
- entity_type (text; e.g., "Job", "Customer")
- entity_id (UUID FK to the created/matched entity) *(must be UUID — not int; all PKs in this system are UUIDs)*
- raw_row_json (full original row preserved for debugging)
- created_at

This keeps Job clean while providing full row → entity traceability.

### 4.3 Data cleaning rules
- Address/town parsing stays as raw text if inconsistent.
- Scheduled Date cells that were freeform in spreadsheet become:
  - best-effort segments if parseable
  - otherwise remain in `availability_notes` and/or `notes_raw` with "needs review"

---

## 5. Core UI (Beta Screens)

### 5.1 Backlog lists
- Backlog > Crane
- Backlog > Bucket
Each supports:
- group by sales rep
- filters: state, town, winter/frozen, requirements unmet, push-up flag, unhappy customer, equipment (1090/1060/either, spider lift)
- totals: $ backlog, estimate hours, scheduled hours, remaining TBS hours

### 5.2 Job detail
- Customer + site info
- State + quick transitions (TBS ↔ partial/full based on segments; Completed explicit action)
- **Blockers panel** — shows all ACTIVE JobBlockers prominently near the top; clearly separate from Requirements panel
- Requirements list with statuses (with "polite reminder" behavior when scheduling)
  - When a Requirement is set to APPROVED, prompt: "Clear related blocker?" — non-mandatory suggestion only, not auto-cleared
- Schedule segments editor (one segment per calendar day; multi-day jobs use multiple segments)
- Foreman day roster editor (foreman + day-exclusive members) with per-segment roster linking (defaults to the roster for that foreman/date; editable)
- Equipment reservations per segment
- Notes raw + extracted panel
- Activity log + estimate history + schedule event history
- **Notification panel** — shows ScheduleNotificationLog entries for this job; "Notify Customer" action button

**One-click scheduling (beta, foreman-anchored)**
- Scheduler selects: (1) date, (2) foreman, then clicks **"Schedule for mm/dd"** (or a recommended date button).
- Duration inputs (pre-scheduling):
  - onsite_hours = Job.estimate_hours_current *(authoritative onsite labor hours required; can be set while TBS before any schedule exists)*
  - travel_hours_estimate = Job.travel_hours_estimate *(informational in beta; used for reporting/planning and future automation, not for hard fit/rejection)*
  - calendar_block_minutes = onsite_hours * 60 (rounded up to nearest 10 minutes for placement)
- Hard rejections (must reject scheduling attempt):
  - any ACTIVE JobBlocker exists
  - customer availability windows would be violated
  - no contiguous free window fits the onsite_hours calendar block for that foreman on that date
- On success (beta):
  - create the onsite ScheduleSegment (one calendar day; must not cross midnight local time)
  - link it to the selected foreman's ForemanDayRoster via SegmentRosterLink
  - optionally (if explicitly requested by the user during the action), create a **START_OF_DAY** TravelSegment (home base → first job) with `source=MANUAL`
  - **do not** auto-create **END_OF_DAY** TravelSegment during scheduling; end-of-day travel is created manually via "Close out day"
- Multi-day splitting remains manual in beta.
- **Close out day (beta, manual):** creates one **END_OF_DAY** TravelSegment (last job → home base) for a foreman+date:
  - default `start_datetime` = latest end_datetime of that foreman's ScheduleSegments on that date (company timezone)
  - scheduler enters duration; end time auto-computed; start/end override allowed
  - enforce at most one active END_OF_DAY per foreman+date

### 5.3 Dispatch Board Calendar (beta target UI)
Beta calendar UI is a **dispatch board**: one day, many foremen (columns), with time as the vertical axis.

**Core interaction rules (authoritative)**
- **Snap:** all calendar placement snaps to **10-minute** increments.
  - Snap click positions by **flooring** to the nearest lower 10-minute boundary (e.g., 09:19 → 09:10).
  - All durations must be multiples of 10 minutes; round **up** when converting hours → minutes for placement.
- **Click-to-create:** creating a new block is click-based (not click-drag).
  - If the click occurs **inside** an existing block, open block details instead of creating a new block.
  - When creating a new block between other blocks, placement must **not** overlap any existing occupancy.
- **No hard workday boundaries:** foreman work windows vary by day; `preferred_start_time` / `preferred_end_time` are soft anchors only.
- **Default display window:** show 05:00–19:00 local time by default; allow scrolling beyond. Managers can set operating hours to adjust this display range (preference only).
- **Authority:** UI may show optimistic previews, but **backend attempt endpoints** must authoritatively accept/reject all creates/moves/resizes.
- **Seasonal overlay:** historical freeze window bands (SeasonalFreezeWindow records) are displayed as color bands across the date header. Display only — no effect on scheduling logic.

**Create placement algorithm (no overlap)**
Given snapped `clicked_time` and requested `duration_minutes`, compute the free window:
- `prev_end` = end of the latest occupied interval ending at/before clicked_time
- `next_start` = start of the earliest occupied interval starting at/after clicked_time (or local midnight if none)
- `start = max(clicked_time, prev_end)`
- `end = start + duration_minutes`
Accept only if `end <= next_start` and the block stays within the local date (no midnight crossing). Otherwise reject.

**Backend attempt endpoints (recommended contract)**
- `POST /api/schedule/attempt-create` (onsite segments)
- `POST /api/schedule/attempt-move` (move/resize onsite segments)
- `POST /api/travel/attempt-create` (START/END travel; manual only in beta)
- `POST /api/travel/close-out-day` (creates END_OF_DAY per §5.2)

**Attempt endpoint response contract (authoritative):**
- `result`: `ACCEPT | REJECT`
- `segment`/`travel_segment`: returned on ACCEPT
- `warnings`: array of `{ code, message, details? }` (non-blocking; UI displays polite reminders here)
- `rejections`: array of `{ code, message, details? }` (present only when result=REJECT)

**Error and warning codes (stable for UI + tests)**

Hard rejections (result=REJECT):
- `SNAP_ALIGNMENT_REQUIRED` — proposed time not on a 10-minute boundary
- `OVERLAP_CONFLICT` — block overlaps an existing occupied interval for this foreman on this date
- `CROSSES_MIDNIGHT` — block would cross midnight local time
- `ACTIVE_BLOCKER` — at least one ACTIVE JobBlocker exists on this job
- `CUSTOMER_WINDOW_CONFLICT` — block falls outside a parsed customer availability window
- `NO_CONTIGUOUS_SLOT_AT_CLICK` — no contiguous free window fits the requested duration from the clicked time

Non-blocking warnings (result=ACCEPT, surface in UI as polite reminders):
- `REQ_NOT_APPROVED` — at least one Requirement is not APPROVED or NOT_REQUIRED
- `REQ_DENIED_PRESENT` — at least one Requirement has status DENIED
- `REQ_UNMET_PRESENT` — required items exist but are not yet satisfied/confirmed
- `FROZEN_GROUND_REQUIRED` — job has frozen_ground_flag=true; reminder that job requires frozen soil conditions
- `WINTER_PREFERRED` — job has winter_flag=true; reminder that job is preferred to run in winter

### 5.4 Push-up recommender

**Vacated-slot triggers (V1–V3 for beta):**
- **V1 — Segment deleted:** `deleted_at` set. Freed window = the segment's full start/end.
- **V2 — Segment moved:** `start_datetime` or `end_datetime` changed. Freed window = the *old* start/end. The new window is occupied, not vacated.
- **V3 — Segment shortened:** end moved earlier or start moved later. Freed window = the released portion (old_end → new_end, or old_start → new_start).
- **V4 — Segment split:** treat as one delete + two creates (the delete leg triggers V1). No special detection needed.

The following do *not* trigger a vacated slot: changing crew assignment, changing requirements, editing notes, changing `scheduled_hours_override` alone (no time window change).

**Spam guard:** Only create a `VacatedSlot` record when the edit results in a non-empty freed window. No-op edits (e.g., a move where start/end shift identically, or a re-save with no time change) must not produce a VacatedSlot. For V3, only create a VacatedSlot if the freed portion is > 0 hours.

When a trigger fires and a non-empty window is freed, create a `VacatedSlot` record (see §2.5) and open the push-up modal.

**Vacated-slot modal debounce (required):** To avoid pop-up spam while a scheduler is "fiddling" with a block, only open the push-up modal on **commit** actions (e.g., drag-drop mouse-up / resize commit / explicit delete). The backend may create multiple VacatedSlot records across successive commits; the UI must throttle modal display (e.g., cooldown window) and may offer a "Show push-up suggestions" button to reopen. Optional hardening: if multiple OPEN VacatedSlots are created by the same user within a short window and are adjacent/overlapping, coalesce them into a single OPEN slot.

**Candidate eligibility (hard filters — must all pass):**
- `push_up_if_possible = true`
- Job is not COMPLETED
- `remaining_hours > 0` where `remaining_hours = estimate_hours_current - scheduled_effective_hours` (clamped to ≥ 0)
- Equipment type matches the VacatedSlot's `equipment_type` (crane jobs not shown for bucket slots and vice versa)
- If job has `preferred_start_time`: slot start must be ≥ that time (check independently; only applied if field is set)
- If job has `preferred_end_time`: slot end must be ≤ that time (check independently; only applied if field is set)

**Seasonal constraints (not hard filters — badge display only):**
- `winter_flag` and `frozen_ground_flag` are shown as badges on candidate cards and available as filter knobs in the modal. They do not automatically exclude candidates because the app has no frost/weather signal in beta. Scheduler decides.

**Fit rule (partial fill, A2):**
- Candidates with `remaining_hours > 0` are eligible regardless of whether they fit perfectly.
- Default allocation = `min(remaining_hours, slot_hours)`. No prompt — scheduler can adjust after applying.
- This supports your "piece by piece" scheduling naturally.
- Candidates where `remaining_hours <= slot_hours` are shown first (they can be fully scheduled in this slot); candidates where `remaining_hours > slot_hours` are shown after (partial fill only).

**Ranking (within each eligibility tier):**
1. Closest `min(remaining_hours, slot_hours)` to `slot_hours` — best capacity fit first
2. Oldest `approval_date` — fairness to waiting jobs
3. Lowest friction — fewest ACTIVE blockers + fewest requirements not in `APPROVED`/`NOT_REQUIRED`

Requirements are never hard filters but their statuses are shown inline on each candidate card.
Resource availability warnings (inventory count) are shown inline if already modeled; not a hard filter in beta.

### 5.5 Reports

#### SUMM — Backlog in Dollars (live, current week)

Computed live from current job data at query time. Not stored — fully derived.

**Table structure:**
- One row per active sales rep (reps with at least one non-deleted, non-completed job)
- Columns per rep:
  - Bucket: Scheduled $, TBS $, Total $
  - Crane: Scheduled $, TBS $, Total $
  - Combined: Scheduled $, TBS $, Total $
  - % of total (row's total as % of grand total)
  - Prior week $ (from most recent WeeklyBacklogSnapshot for this rep, total_dollars combined across equipment types; display "—" if no snapshot exists or dollar field is NULL)
- Footer: grand totals across all reps for each column

**Below the table:**
- Estimate of Sales Per Day: editable by MANAGER and SCHEDULER. Stored in OrgSettings.sales_per_day (numeric, nullable; no default). If not set, the Days Sales in Backlog metric displays "Set sales/day to enable" rather than a number.
- Days Sales in Backlog (current week): total_dollars / sales_per_day
- Days Sales in Backlog (prior week): prior week total_dollars / sales_per_day
- Increase / (Decrease): current days - prior days

**Snapshot trigger:**
- Automatic weekly snapshot job runs every Saturday at a configured time (default: 6:00 AM company timezone).
- MANAGER can trigger manual snapshot from admin UI.
- Snapshots are append-only. Re-running does not overwrite an existing week. Use the unique constraint to prevent duplicates; manual trigger should surface a warning if that week already exists.

#### Comparable Report — Year-over-Year Weekly Hours

A time-series view showing weekly backlog hours across multiple years, separately for Crane and Bucket. Sourced entirely from WeeklyBacklogSnapshot.

**Display:**
- Two sections: Crane and Bucket
- Each section shows a line chart with one line per year (2019–current)
- X-axis: week number (1–52/53)
- Y-axis: total_hours (scheduled + TBS combined) for that equipment type, aggregated across all reps
- Each data point also shows: scheduled_hours, tbs_hours, crew_count for tooltip/hover detail
- Current year line is visually distinct (bold or different color)
- Missing weeks (gaps in data) render as line breaks, not zero

**Table view (collapsible, below each chart):**
- Rows: On Board (scheduled_hours), TBS (tbs_hours), Total (total_hours), Crews (crew_count), Crew-Days (total_hours × crew_count)
- Columns: week dates for the selected year range
- Matches the exact layout of the Back_Log_Report_Comparable spreadsheet

**Year range selector:** defaults to current year + all available prior years. User can toggle individual years on/off.

**Data availability note (display in UI):** "Dollar figures available from [app go-live date] onward. Hour figures available from 2019 onward."

### 5.6 Customer Scheduling Notifications
Notifications are intentional scheduler-triggered communication acts — not automatic side effects of schedule changes. Schedule changes (move, resize, delete) update VacatedSlot, ScheduleEvent, and ActivityLog internally. A customer notification is sent only when the scheduler explicitly triggers it via a "Notify Customer" action.

**Notification events:**
- **Job Scheduled** — scheduler sends after creating the initial ScheduleSegment. Customer receives SMS + email with date, address, and scope summary. Rep receives internal alert.
- **Job Rescheduled** — scheduler sends after changing a segment date. System tracks the change internally but does NOT auto-send. Customer receives SMS + email with new date, old date referenced. Rep receives internal alert.
- **Job Cancelled** — scheduler sends after deleting all segments. Customer receives SMS + email. Rep receives internal alert.
- **Confirmation Request** — optional step. Scheduler sends a confirm/reschedule reply link before the job date. Customer can confirm or request reschedule via the link. Customer response creates a pipeline activity entry and triggers rep notification.

**Opt-in enforcement (all checks must pass before any channel is used):**
- `jobs.contact_allowed = true` — if false, block all outbound notifications with warning "Contact not allowed for this customer"
- `jobs.no_email = false` — if true, suppress email channel
- `jobs.preferred_channels` — only send via channels confirmed in this list
- Valid contact info on file — if channel lacks contact data, surface error rather than silently dropping

**Rescheduling and cancellation:** Schedule changes are NEVER auto-notified. Notifications are sent when the scheduler explicitly triggers them, which requires confirming the schedule state is final before communicating to the customer.

### 5.7 Multi-Foreman Conflict Visibility
The dispatch board renders all foremen as simultaneous columns. Conflict visibility surfaces cross-column resource tensions not visible within a single column.

**Conflict types detected and surfaced:**

- **Equipment double-booking** — two or more segments on the same date where ResourceReservations reference the same resource_id and total reserved quantity exceeds resource.inventory_quantity. Affected blocks on both foreman columns show a red border and badge. Non-blocking.

- **Person conflict** — a crew member appears on more than one ForemanDayRoster for the same date. The DB unique constraint prevents writes; visual surfacing catches legacy data or constraint bypasses. Both roster cards show a warning badge. Flagged as data integrity issue in conflict summary panel.

- **Capacity warning** — total scheduled_effective_hours across all foremen for a given date exceeds (total active crew members × operating_hours_per_person). Date header shows orange capacity indicator.

- **Job overlap** — two segments on the same date reference the same job_id via different rosters. Both blocks show a "Duplicate job" badge. Non-blocking — some jobs legitimately need two crews simultaneously.

**Conflict summary panel** — a collapsed panel accessible from the dispatch board date header. Shows all active conflicts for the selected date in a scannable list without navigating to individual blocks. Each entry includes: conflict type badge (color-coded), affected entity name, foremen involved, and a jump-to link that scrolls the board to the relevant block. Dismissal is per-date per-user and stored in SchedulingConflictDismissal. The panel is computed at render time from a single SQL pass — not a stored table, not a notification system.

### 5.8 Foreman Mobile App (post-v1)
All foreman-facing mobile features are **explicitly out of scope for beta**. Target format is a **native app** (iOS and Android). The following is the planned feature set when development begins:

- Read-only daily schedule — foreman sees their assigned jobs for today in arrival order
- Push notifications when schedule changes (job added, removed, or time changed)
- Mark segment started / completed from mobile — feeds ActivityLog and job completion workflow
- View site photos and markup annotations (photo_flattened_renders, rep annotation layer)
- Add on-site notes and completion notes
- View crew documents from the Crew Documents module
- Foreman annotation layer — separate from rep markups

The schema (photo_annotations.author_role, photo_flattened_renders, segment start/complete timestamps) is already designed to support all foreman mobile features without migration when the native app is built.

---

## 6. Requirements Enforcement UX (Locked)
- When scheduler attempts to schedule or edit a schedule segment:
  - show a **polite pop-up** listing job requirements and each requirement's status
  - display each requirement's actual status label (REQUIRED / REQUESTED / APPROVED / DENIED / NOT_REQUIRED)
  - highlight (visually distinct) any requirement whose status is not `APPROVED` or `NOT_REQUIRED`
  - allow proceeding without hard blocks
- In list views and job detail:
  - show badges for unmet requirements (e.g., "CBP — REQUESTED", "DTL — DENIED")
  - DENIED is shown differently from REQUIRED/REQUESTED — a refused permit needs different action than an unapplied one

---

## 7. Activity Log (Auditability)
**ActivityLog**
- id, entity_type, entity_id
- action_type: CREATED/UPDATED/DELETED/STATE_CHANGED/SEGMENT_ADDED/SEGMENT_REMOVED/REQUIREMENT_UPDATED/NOTE_PARSED/NOTIFICATION_SENT/etc.
- diff (JSON)
- actor_user_id
- created_at

Log all edits to:
- Job fields (including notes edits)
- Schedule segments
- Requirements
- Estimates
- Crew assignments
- Resource inventory adjustments
- Customer notifications sent (notification_type, channels, customer response)

---

## 8. Milestones (Execution Plan)

### M1 — Foundations
- Repo + environment setup
- DB schema migrations for core entities
- Basic auth/users/roles
- CRUD for Customers and Jobs
- ActivityLog framework
- AuditLog (append-only compliance layer; see §12.1)

### M2 — Scheduling Core
- ScheduleSegment CRUD (with datetime)
- State derivation (TBS/Partial/Full) based on estimate vs scheduled allocation
- Completed workflow (manual mark complete, completed_date)
- Schedule event history (user-action events)

### M2.1 — Internal LAN Pilot (Office Host)
- Run Scheduler on an always-on Windows machine inside the company network (LAN-only; not for crews/mobile in this phase).
- Users access the UI from other office PCs via an internal hostname (e.g., `http://schedule-pc:3000`).
- Runtime must not assume `localhost` from the user's browser:
  - `apps/web` uses same-origin `/api/*` calls and proxies to `apps/api` via Next rewrites.
  - `apps/api` binds to `0.0.0.0` for LAN reachability (and is firewalled to internal subnets).
- Authentication/authorization requirement for multi-user LAN usage:
  - Human usage must not rely on the dev/test header shim (`x-actor-user-id`).
  - Implement real login + roles (MANAGER/SCHEDULER/VIEWER). Target is Google Workspace SSO restricted to `@irontreeservice.com`.

#### §2.1.1 Auth Implementation (Decision Record)

**Decision:** Use [Clerk](https://clerk.com/) (`@clerk/nextjs` + `@clerk/backend`) with Google OAuth, domain-restricted in the Clerk dashboard to `@irontreeservice.com`.

**Rationale:** Clerk provides a managed auth service with built-in UI components (sign-in, user management), webhook-based user provisioning, and a clean token verification flow. It removes the need for custom JWT signing/verification and provides a clear multi-tenancy path via Clerk Organizations for future SaaS expansion.

**Implementation spec:**

- **Library:** `@clerk/nextjs` in `apps/web`, `@clerk/backend` in `apps/api`.
- **Provider:** Google OAuth, configured in the Clerk dashboard. Domain restriction (`@irontreeservice.com`) is enforced in the Clerk dashboard — not hardcoded in application code.
- **Middleware:** `apps/web/middleware.ts` uses `clerkMiddleware()` from `@clerk/nextjs/server`. All routes except `/sign-in(.*)` and `/api/webhooks/clerk(.*)` require authentication via `auth.protect()`.
- **User provisioning:** Clerk webhook `user.created` → Svix signature verification → `upsertUserOnSignIn(email, name, clerkId)` → creates/links User record → sets `publicMetadata: { userId, role }` on the Clerk user via `clerkClient.users.updateUserMetadata`. New users get role `VIEWER`. A Manager must elevate role via the admin UI.
- **Token flow:**
  - `apps/web` uses `auth()` from `@clerk/nextjs/server` to read `sessionClaims.publicMetadata` (userId, role) for server-side rendering.
  - The web proxy (`apps/web/app/api/proxy/route.ts`) calls `auth().getToken()` to get the raw Clerk session token and forwards it as `Authorization: Bearer <token>` to `apps/api`.
  - `apps/api` verifies the token using `verifyToken()` from `@clerk/backend` with `CLERK_SECRET_KEY`. On success, reads `publicMetadata.userId` and `publicMetadata.role` from the verified payload and sets `request.actor`.
  - No custom JWT minting. No shared signing secret between web and API.
- **API authentication:**
  - `apps/api/src/http/jwt-auth.ts` exports `createAuthPreHandler(verifyToken?)`. The `TokenVerifier` is injectable for testability — production uses Clerk's `verifyToken`, tests inject a jose-based verifier. The middleware always runs the same code path; only the cryptographic verification is swappable.
  - Defense-in-depth: `requireActor()` in `route-helpers.ts` still does a DB lookup via `prisma.user.findUnique` to confirm the user exists and is active, even after token verification.
- **Environment variables required:**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (apps/web)
  - `CLERK_SECRET_KEY` — Clerk secret key (apps/web + apps/api)
  - `CLERK_WEBHOOK_SECRET` — Svix webhook signing secret (apps/web)
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` — sign-in route
- **No LAN shim.** No `x-actor-user-id` header bypass. No `NODE_ENV` guards for auth. The `TokenVerifier` injection is the only test seam and it runs the same middleware code path.
- **Role enforcement:**
  - `apps/api` Fastify routes check `request.actor.role` against a permission map defined in `packages/shared/src/roles.ts`.
  - VIEWER requests to any mutating endpoint (`POST`/`PATCH`/`DELETE`) return `403`.
  - SCHEDULER requests to manager-only endpoints (admin list edits, role changes, sales-per-day) return `403`.
- **Session expiry:** Managed by Clerk (default: long-lived sessions with short-lived tokens). Expired sessions redirect to `/sign-in`.
- **Multi-tenancy path:** Clerk Organizations is the future path for multi-tenant SaaS. When selling to other companies, each company gets a Clerk Organization. No schema changes required — the Clerk user → local User mapping already supports it.

### M3 — Resources & Rosters
- Resource inventory CRUD (count-based)
- Resource reservations per segment
- Foreman day rosters + day-exclusive member assignment UI (foreman + members)
- Availability checks: (beta approximation) sum all reservations by resource **per calendar day across all foremen**, overlap-agnostic, and warn when `total reserved quantity > inventory_quantity`; surface as a non-blocking warning — never a hard block in beta
- Dispatch board conflict summary panel (equipment double-booking, person conflicts, capacity warnings, job overlap detection — see §5.7)
- SchedulingConflictDismissal support (per-date per-user dismissal of conflict notices)

### M4 — Import (Full Fidelity)
- Import CRANE/BUCKET authoritative
- Import Completed, Unhappy Customer, Unable, Winter, DS
- Notes parsing pipeline (flags/requirements/equipment suggestions/RS-TBRS history)
- All parsed Requirements and ScheduleEvents tagged with source=LEGACY_PARSE and raw_snippet preserved
- "Extracted from Notes" UI review panel

### M5 — Reporting & Weekly Snapshot
- Live backlog report (SUMM equivalent)
- Weekly snapshot job + "previous week backlog $" display
- Sales-per-day editable setting (manager + schedulers)
- Seasonal freeze window admin UI + dispatch board calendar overlay (SeasonalFreezeWindow CRUD + display bands)

### M6 — Push-up Recommender
- Vacated-slot detection: V1 (delete), V2 (move), V3 (shorten) — creates VacatedSlot records (see §2.5 and §5.4)
- Candidate generation using hard filters + partial fill default (see §5.4)
- Ranking by capacity fit, approval date, friction score
- Push-up modal with inline requirement/blocker/seasonal badges
- Apply-to-slot action: creates new ScheduleSegment, marks VacatedSlot as USED
- Dismiss action: marks VacatedSlot as DISMISSED
- Audit log entries for all recommender actions

### M7 — Polish & Hardening
- Permission refinement (manager feedback)
- Import validation tools + reconciliation report (rows imported vs workbook)
- Customer scheduling notifications: SMS + email via ScheduleNotificationLog (see §5.6)
  - Job Scheduled, Job Rescheduled, Job Cancelled, Confirmation Request events
  - Opt-in enforcement (contact_allowed, no_email, preferred_channels)
  - Rep internal alerts on customer response
- Error handling, performance, and UX cleanup

---

## 9. Acceptance Criteria (Beta)
- All workbook "active" data imports successfully with traceability (row → job id).
- Schedulers can:
  - find any job via filters/search
  - schedule multi-day time-based segments
  - partially schedule jobs and see remaining hours
  - mark jobs completed
  - maintain requirements with statuses
  - see clear reminders about unmet requirements
  - see FROZEN_GROUND_REQUIRED and WINTER_PREFERRED warnings on scheduling attempts for flagged jobs
  - view the conflict summary panel on the dispatch board date header and dismiss individual conflicts
  - send customer scheduling notifications (SMS + email) explicitly via "Notify Customer" action
- Manager can:
  - edit sales/day value
  - edit admin-managed lists (blocker reasons, access constraints, requirement types, seasonal freeze windows)
  - adjust resource inventory quantities
- Reports match spreadsheet intent:
  - live backlog totals by rep and equipment
  - previous week comparison values populated from snapshots
- Notes extraction:
  - preserves `notes_raw`
  - successfully extracts at least: push-up flag, DTL/CBP/tree permit requirements, RS/TBRS history events, DW equipment suggestion
  - all extracted requirements and schedule events have source=LEGACY_PARSE and raw_snippet populated
  - provides a review/edit mechanism

---

## 10. Admin-Managed Lists (Initial)
- Requirement Types: POLICE_DETAIL, CRANE_AND_BOOM_PERMIT, TREE_PERMIT
- Blocker Reasons (seed list; editable):
  - Permit Pending
  - Customer Unresponsive
  - Access Blocked
  - Neighbor Consent Needed
  - Frozen Ground Required
  - Winter Timing
  - Utility Coordination
  - Weather Delay
  - Other
- Access Constraints (seed list; editable):
  - Driveway blocked
  - Neighbor driveway access
  - Gate/code needed
  - Vehicles must be moved
  - Street/parking constraints
  - Other
- Seasonal Freeze Windows (manager-managed; no seed data — manager adds historical records):
  - label, start_date, end_date, notes, active flag
  - displayed as color bands on dispatch board calendar overlay

---

## 11. Implementation Notes (for Codex)
- Prefer derived state over duplicated fields (e.g., compute remaining TBS hours from estimate history + segments).
- Store datetimes even if current UI is list-based; future calendar depends on it.
- Legacy parse artifacts must be traceable (`source=LEGACY_PARSE`, `raw_snippet` preserved).
- Never require perfect parsing to proceed; surface "needs review" to users.


**Operating hours (UI + anchor preferences):** Default dispatch board display window is 05:00–19:00 local time. Managers can set company operating hours (start/end) which adjust the calendar display window and the default scheduling/availability anchor when a day has no events. These are preferences only, not hard scheduling boundaries.

**Timezone policy:** Store all timestamps as `timestamptz` (UTC-normalized). The app operates in a single company timezone (America/New_York unless configured otherwise). All display and date input uses that timezone. Document the configured timezone in README. Never store naive local timestamps.

**Date/time handling (novice-safety):** In the web UI and API, do not perform arithmetic with native `Date` objects. All scheduling math must use **(company-local date + snapped minute-of-day integers)**; UTC timestamps are for storage/serialization only. For timezone conversions (UTC ⇄ company-local) and day-boundary computations, use a single timezone-aware library **inside shared helpers only** (Luxon is permitted *only* within `packages/shared` time helpers). Feature code must not import Luxon directly; it must call the shared helpers.

**Primary key type (authoritative):** All tables must use UUID primary keys (`@id @default(uuid())` in Prisma). Do not use integer auto-increment PKs. Sylvara CRM (the parent system this module will eventually merge into) uses UUIDs universally, and re-keying from integers to UUIDs after beta is one of the most destructive migrations possible. Use UUIDs from the first migration. This applies to every entity: Job, Customer, Resource, ScheduleSegment, ForemanDayRoster, ImportRowMap.entity_id, etc.

**Numeric math (novice-safety):** Postgres `numeric` values must not be manipulated as JavaScript `number` in runtime logic (money, hours, and state math). Use `Prisma.Decimal` (or equivalent decimal library) end-to-end for arithmetic and comparisons. For calendar placement/overlap logic, prefer integer minutes derived from the snapped datetimes.

**Derived-state query performance:** Backlog list queries must compute `scheduled_effective_hours` in a single SQL pass (JOIN + GROUP BY or equivalent) to avoid N+1 queries. If performance later forces denormalization, use the state invalidation surface to keep any cached field correct.

**API warnings vs errors (novice-safety):** Scheduling attempt endpoints must return non-blocking reminders as `warnings[]` in a successful ACCEPT response. Only hard rejection conditions return REJECT with error codes; warnings must never be encoded as HTTP 400 errors.

**Warning codes (stable, non-blocking):**
- `REQ_NOT_APPROVED` — at least one Requirement is not APPROVED
- `REQ_DENIED_PRESENT` — at least one Requirement is DENIED
- `REQ_UNMET_PRESENT` — required items exist but are not yet satisfied/confirmed
- `FROZEN_GROUND_REQUIRED` — job has frozen_ground_flag=true; scheduler reminder only
- `WINTER_PREFERRED` — job has winter_flag=true; scheduler reminder only

**Customer notification constraints:** Before any outbound notification channel is used, the scheduling service must check all three opt-in fields: `jobs.contact_allowed`, `jobs.no_email`, and `jobs.preferred_channels`. If contact_allowed=false, block the entire notification and surface a warning. If no_email=true, suppress email but allow SMS if phone is available. Never silently drop a channel — surface the suppression reason in the UI and log it in ScheduleNotificationLog.channels_suppressed. Reschedule and cancellation notifications are never automatic; they require explicit scheduler action.

**Conflict visibility is read-only:** The dispatch board conflict summary panel (§5.7) is computed at render time from a single SQL pass. It does not block scheduling, does not generate any notifications, and does not write records except for SchedulingConflictDismissal rows when a user dismisses a conflict notice. Never make conflicts into hard blocks.

**Notes parsing expansion (post-v1):** Beta parser covers tree service vocabulary only (DW, DTL, CBP, RS, TBRS, PUSH UP IF POSSIBLE, etc.). Post-v1 extensibility path: add a `notes_parsing_vocabulary` key to OrgSettings/tenant_settings storing a JSON dictionary of `{token: action}` pairs. Parser loads tenant vocabulary at runtime and merges with the system tree service dictionary. This enables landscaping (mowers, aerators, skid steers) and snow removal (route codes, salt/sand, priority tiers) parsing per tenant without modifying the core parser. Do not build this in beta — just don't hard-code the parser in a way that makes extension impossible.

**OrgSettings (single-row, internal tool):** stores `company_timezone`, `operating_start_time`, and `operating_end_time` used for dispatch-board default display window and default availability anchor when a day has no events. These are preferences only, not hard scheduling boundaries.


**Canonical availability query (authoritative)**
All "foreman availability" logic must be consistent across:
- calendar/day views
- recommended dates
- one-click scheduling
- conflict detection

**Inputs**
- foreman_person_id
- target local date (company timezone)
- duration_hours (onsite hours calendar block for scheduling attempts)

**Occupied intervals (active only)**
1) TravelSegments where:
   - travel_segments.foreman_person_id = :foreman_person_id
   - deleted_at IS NULL
   - start/end fall on the target local date (split at midnight local time if needed; segments must not cross midnight)

2) ScheduleSegments where:
   - schedule_segments.deleted_at IS NULL
   - EXISTS SegmentRosterLink -> ForemanDayRoster for that date where foreman_person_id matches
   - start/end fall on the target local date (segments must not cross midnight)

**Algorithm (pseudocode)**
- Fetch all occupied intervals for the foreman/date, sorted by start_datetime.
- Coalesce overlaps (if any) into a normalized occupied list.
- Compute free intervals as the gaps between occupied intervals.
- Choose the first free interval that can fit duration_hours starting from an anchor time:
  - If ForemanDayRoster.preferred_start_time exists → use that as the first search anchor.
  - Else if the day already has any events → anchor at the earliest event start.
  - Else anchor at the selected HomeBase opening time (manager-managed; falls back to company operating hours if HomeBase open time is unset).
  - HomeBase selection rule: if no ForemanDayRoster exists yet for the foreman+date, the scheduling attempt must first create the roster and set ForemanDayRoster.home_base_id (UI must require/choose a HomeBase); subsequent availability uses that roster home_base_id.
- A scheduling attempt succeeds only if a contiguous free interval can fit duration_hours.

**Performance note**
- Use partial indexes on active segments (deleted_at IS NULL) as defined in AGENTS.md §4.2.



**`sales_rep_code` normalization:** During import and on all data entry, normalize `sales_rep_code` to uppercase-trimmed (e.g., "jd", "J.D.", " JD " all become "JD"). This is required for correct group-by-sales-rep behavior in reports.

**Phase 2 decision — customer availability windows (authoritative):** Until a dedicated availability model exists, customer windows are derived only from `Job.availabilityNotes` using strict pattern parsing (24h and explicit AM/PM range forms). Recognized windows are enforced as hard scheduling constraints; unrecognized/ambiguous text is treated as "window not configured" (non-blocking). UI continues to display AM/PM-friendly labels while runtime stores and compares internal minute values.

---

## 12. Sylvara CRM Integration Notes

This scheduler is being built standalone first (replacing the spreadsheet backlog for Iron Tree Service). It will later be merged into the **Sylvara CRM** platform as the scheduling module. This section documents the known gaps, entity mappings, and migration decisions so that standalone development doesn't inadvertently bake in patterns that make the merge expensive.

**Standalone-first principle:** Do not build Sylvara CRM features into this module. Build the scheduler cleanly as a standalone product. The merge path below tells you what shape to keep things in — not what to build now.

### 12.1 Decisions locked now for merge readiness

**UUID primary keys (non-negotiable):** Sylvara uses UUIDs on every table. This module must also use UUIDs (see §11 Implementation Notes). Do not use integer auto-increment PKs anywhere.

**No `tenant_id` in standalone (acceptable; document the boundary):** Sylvara enforces `tenant_id` on every table with PostgreSQL row-level security. This scheduler is single-tenant (Iron Tree Service only) and has no `tenant_id`. This is intentional for standalone beta. `OrgSettings` serves as the proto-tenant anchor (company timezone, operating hours, etc.). When the modules merge, `tenant_id` will be added to all tables and `OrgSettings` will be replaced by the Sylvara `tenants` row. Do not build any multi-tenant logic now, but do not build patterns that make adding `tenant_id` a full rewrite either — specifically: all queries must be written to filter from a single top-level anchor, not from global scans.

**Soft deletes (match Sylvara):** Sylvara uses `deleted_at` soft deletes on every table. This scheduler uses `deleted_at` on all entities (Customer, Job, Resource, ForemanDayRoster, JobBlocker, Requirement, HomeBase, etc.). Apply this pattern to every new table added. Never hard-delete rows.

**Append-only audit log (add to scheduler):** Sylvara has an immutable `audit_log` that records every INSERT/UPDATE/DELETE across all tables — separate from the user-facing `ActivityLog`. The scheduler must also implement this compliance-grade layer. Add an `AuditLog` table mirroring Sylvara's schema (`table_name`, `record_id`, `action`, `changed_by`, `changed_at`, `old_values`, `new_values` as JSONB). This is in addition to — not a replacement for — the existing domain-semantic `ActivityLog`. Populate it via a Prisma middleware or DB trigger on every write. This is a M1 task.

### 12.2 Entity mapping (scheduler → Sylvara)

| Scheduler entity | Sylvara entity | Migration notes |
|---|---|---|
| `Customer` | `Contact` + `Property` + `property_contacts` | The scheduler's flat Customer must be split at merge time. Keep `Customer.name` and contact fields on `Contact`; move `job_site_address`/`town` to `Property`. Do not over-build Customer — avoid adding sub-entities that assume it stays flat. |
| `Job` | `jobs` | **Decision (locked): The scheduler's Job entity and Sylvara's jobs table are the same table in the merged system. The scheduler's richer model wins — no re-keying required.** Legacy/import-era rows have `estimate_id = NULL`. Integrated-era rows (post-merge) have `estimate_id` populated when a job is created from an approved estimate. `approval_date` / `approval_call` are the lightweight substitute until then. |
| `Resource (PERSON)` | `crew_members` | Scheduler `Resource.name`, `is_foreman`, `active` → Sylvara `crew_members.first_name/last_name`, `role=foreman`, `active`. |
| `Resource (EQUIPMENT)` | `equipment_types` + inventory | Sylvara's `equipment_types` is a catalog with no inventory count. The scheduler adds `inventory_quantity`. Merge path: add inventory to Sylvara's equipment_types. |
| `ResourceReservation` | `schedule_equipment` (junction) | Sylvara's junction is simpler (no quantity). Merge path: extend with quantity. |
| `ForemanDayRoster` + `SegmentRosterLink` | *(not in Sylvara v1.2)* | The scheduler's foreman-anchored model is more advanced than Sylvara's `schedule_entries`. At merge, Sylvara adopts the scheduler's model. The scheduler's tables are the authoritative design. |
| `TravelSegment`, `VacatedSlot` | *(not in Sylvara v1.2)* | Scheduler-specific. Will be carried into Sylvara as-is. |
| `ScheduleEvent` | *(not in Sylvara v1.2)* | Scheduler-specific history. Will be carried as-is. |
| `CustomerRisk` | `complaints` (partial overlap) | Sylvara's `complaints` table is broader (service quality, driver behavior, property damage, billing). The scheduler's `CustomerRisk` (severity 1–10, OPEN/MONITORING/RESOLVED) is a customer satisfaction flag, not an incident log. At merge: `CustomerRisk` maps to a severity/status filter on `complaints` where `complaint_type = service_quality`. |
| `sales_rep_code` (text) | `reps.id` (UUID FK) | Scheduler uses normalized text code (e.g., "JD"). Sylvara has a proper `reps` table. At merge: create a `reps` record per unique code and replace `sales_rep_code` with `rep_id FK`. Keep the text code as a transitional field until the FK is fully populated. |
| `ImportRun` + `ImportRowMap` | `import_quarantine` (partial overlap) | Both can coexist. `ImportRowMap` provides row→entity traceability (scheduler-specific). Sylvara's `import_quarantine` handles unmapped/failed rows. At merge: keep both; they serve different purposes. |
| `ActivityLog` | `audit_log` (different purpose) | See §12.1. Both should exist in the merged system. |
| `OrgSettings` | `tenants` + `tenant_settings` | `OrgSettings.company_timezone` → `tenants.timezone`. `OrgSettings.operating_start_time/end_time` → `tenant_settings` key-value. Replace at merge. |
| `Requirement`, `RequirementType` | *(not in Sylvara v1.2)* | Scheduler-specific. Will be carried into Sylvara as-is. |
| `JobBlocker`, `BlockerReason` | *(not in Sylvara v1.2)* | Scheduler-specific. Will be carried into Sylvara as-is. |
| `HomeBase` | *(not in Sylvara v1.2)* | Scheduler-specific. Will be carried as-is; may eventually link to `properties`. |
| `EstimateHistory` | `estimate_revisions` (partial overlap) | Sylvara tracks estimate dollar revisions. The scheduler tracks both dollar and hour changes. At merge: extend `estimate_revisions` to include hours. |
| `ScheduleNotificationLog` | *(not in Sylvara v1.2)* | Scheduler-specific. Will be carried as-is. Integrates with Sylvara's Notifications module at merge. |
| `SeasonalFreezeWindow` | *(not in Sylvara v1.2)* | Scheduler-specific admin-managed display data. Will be carried as-is. |
| `SchedulingConflictDismissal` | *(not in Sylvara v1.2)* | Scheduler-specific UI state. Will be carried as-is. |

### 12.3 Role and permission mapping

| Scheduler role | Sylvara role | Notes |
|---|---|---|
| `MANAGER` | `admin` | Full access |
| `SCHEDULER` | `scheduling` | Schedule create/edit; read-only leads/estimates |
| `VIEWER` | `read_only` | Read-only across all |
| *(missing)* | `sales` | Not needed in standalone scheduler; will exist at merge |
| *(missing)* | `accounting` | Not needed in standalone scheduler |
| *(missing)* | `foreman` | Not needed in standalone scheduler (foremen are Resources, not users) |

The Auth.js implementation in §2.1.1 uses `MANAGER | SCHEDULER | VIEWER`. When merging into Sylvara, these role names will be migrated to Sylvara's enum. Do not add the Sylvara roles to the standalone scheduler — but do implement the role-permission check in `packages/shared/src/roles.ts` so the mapping point is clean and isolated.

### 12.4 Auth reconciliation path

The standalone scheduler uses **Clerk** for authentication (Google OAuth via Clerk-managed flow). Sylvara's `users` table has a `password_hash` column (Argon2/bcrypt) designed for username/password login. These need reconciliation at merge time.

Recommended path: Sylvara's full auth system should adopt Clerk as the primary authentication mechanism (Google Workspace SSO for internal users; Clerk Organizations for multi-tenant SaaS). The `password_hash` column in Sylvara can be made nullable to support OAuth-only accounts. Clerk Organizations is the multi-tenancy path when selling to other companies — each company gets a Clerk Organization, and the existing `clerkId` column on `users` already supports the mapping.

### 12.5 `jobs.status` — resolution (stored enum replaced by derived model)

**Decision (locked):** The scheduler's derived-state model wins. Sylvara's stored `jobs.status` enum column is dropped at merge and replaced by a database view (`jobs_derived_state`) that computes state using the authoritative five-event algorithm in §2.5. This is a Stop-and-Ask migration — do not execute without a formal merge plan.

**Replacement map for the eight stored status values:**

| v1.2 stored value | v2.x replacement |
|---|---|
| `to_be_scheduled` | Derived: `scheduled_effective_hours <= 0` and not completed |
| `scheduled` (partial) | Derived: `0 < scheduled_effective_hours < estimate_hours_current - 0.01` |
| `scheduled` (full) | Derived: `scheduled_effective_hours >= estimate_hours_current - 0.01` |
| `completed` | Derived: `completed_date IS NOT NULL` |
| `in_progress` | Post-v1 derived: today's date has an active ScheduleSegment for this job; or lightweight manual flag if needed |
| `invoiced` | Derived from invoicing module: invoice exists in paid/sent status for this job |
| `unable` | Replaced by `JobBlocker` with ACTIVE status — not a pipeline state |
| `winter_hold` | Replaced by `jobs.winter_flag` boolean — not a pipeline stage |
| `unhappy_customer` | Replaced by `CustomerRisk.status = OPEN` linked to the customer |

### 12.6 What the scheduler contributes to Sylvara

To be clear about merge direction: the scheduler's scheduling model is the more advanced design. Sylvara will adopt the scheduler's approach, not the other way around:

- `ForemanDayRoster` + `SegmentRosterLink` + `ForemanDayRosterMember` replaces Sylvara's simple `crews` + `schedule_entries` model.
- `TravelSegment`, `VacatedSlot`, `ScheduleEvent` are net-new capabilities Sylvara doesn't have.
- The notes parsing pipeline, push-up recommender, and foreman-anchored availability model are all scheduler-originated features.
- The `ResourceReservation` inventory model extends Sylvara's `schedule_equipment` with quantity tracking.
- `ScheduleNotificationLog`, `SeasonalFreezeWindow`, and `SchedulingConflictDismissal` are net-new.

---

**State invalidation surface:** Derived job state changes when exactly these five write events occur:
1. A ScheduleSegment is created (for this job)
2. A ScheduleSegment is soft-deleted (`deleted_at` set)
3. A ScheduleSegment's `start_datetime`, `end_datetime`, or `scheduled_hours_override` is changed
4. `Job.estimate_hours_current` is changed
5. `Job.completed_date` is set or cleared

This list is the authoritative upgrade path if a cached/denormalized `state` column is ever needed. Any caching implementation must invalidate on exactly these events and no others. If an "un-complete" workflow is ever added (clearing `completed_date`), that is already covered by event 5 — no schema change required.

### 12.7 Known scale and merge risks (not yet mitigated)

The following issues are not emergencies for the Iron Tree beta but must be resolved before the Sylvara merge or SaaS launch. They are documented here so future work is not surprised.

**1. No tenant_id on any table (highest risk)**
Every table in the scheduler assumes single-tenant. There is no `org_id` or `tenant_id` column anywhere. At SaaS scale, adding tenant isolation to every table is one of the most dangerous migrations possible. Mitigation path: when Sylvara merge begins, add `tenant_id FK → tenants` to every table in a single coordinated migration. All queries must then filter by `tenant_id` at the top-level anchor. Do not add partial tenant columns in the scheduler — do it all at once at merge time.

**2. WeeklyBacklogSnapshot has no tenant isolation**
The snapshot table has no org/tenant anchor. At SaaS scale every company needs isolated snapshots. The Saturday cron job also hardcodes `America/New_York` — multi-tenant deployments need per-tenant timezone-aware scheduling. Mitigation path: add `tenant_id` at merge; move cron schedule to a per-tenant job queue (e.g., BullMQ with per-tenant cron entries derived from `tenants.timezone`).

**3. OrgSettings is a single-row table**
The single-row assumption is baked into how OrgSettings is queried throughout the codebase (`findFirst()` with no filter). At merge this becomes `tenants` + `tenant_settings` per §12.2. Before merge, do not add new columns to OrgSettings that assume it will stay single-row — use key-value entries in a settings map instead.

**4. Derived state query performance**
The backlog list computes `scheduled_effective_hours` via JOIN + GROUP BY on every load. This is fine for Iron Tree's job volume. At SaaS scale with thousands of jobs per tenant this will degrade. Mitigation path (if needed): add a materialized view or a denormalized `scheduled_effective_hours` cache column, invalidating on exactly the five write events in §11 (State invalidation surface).

**Stop-and-Ask gate:** None of the above should be partially addressed in the standalone scheduler. All four items are Sylvara merge decisions. If a code change in the scheduler would require touching any of these (e.g., adding a partial tenant_id to one table), stop and escalate to a full merge plan first.

---
