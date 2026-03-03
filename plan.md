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
  - **Frozen** = must wait for frozen ground to prevent lawn damage.
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

### Explicitly out of scope (Beta)
- Full-feature crew mobile app / crew confirmation workflow automation (Completion remains scheduler/manager marked).
- Automated external permit integration.
- Perfect historical reconstruction of every note nuance (we keep `notes_raw` always).

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
- sales_rep_code (text for now; can map to User later)
- job_site_address (text)
- town (text)

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
- frozen_ground_flag (bool)

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

### 2.4 Requirements (Permits / Police Detail / etc.)
Use one unified entity for regulatory/dependency requirements.

**Requirement**
- id, job_id
- requirement_type_id (FK to admin-managed list)
- status: `REQUIRED | REQUESTED | APPROVED | DENIED | NOT_REQUIRED`
- notes (text)
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
- start_datetime (required)
- end_datetime (required)
- scheduled_hours_override (numeric, nullable; rare; if set, overrides derived hours for reporting/state math)
- deleted_at (nullable; soft delete — required so vacated-slot detection can trigger the push-up recommender)
- notes (text)
- created_by_user_id, created_at, updated_at

**TravelSegment**
- id
- foreman_person_id (FK to Resource type PERSON; must have is_foreman=true)
- related_job_id (nullable)
- start_datetime, end_datetime (required)
- travel_type: `START_OF_DAY | END_OF_DAY | BETWEEN_JOBS` *(beta uses START_OF_DAY and END_OF_DAY only)*
- source: `MANUAL | AUTO` (AUTO is post-beta)
- locked (bool, default false) *(AUTO must not override locked travel blocks)*
- notes (text)
- created_by_user_id, created_at, updated_at
- deleted_at (nullable; soft delete only)


**Segment scope rule:** one ScheduleSegment = one calendar day. Multi-day jobs use multiple segments. This keeps crew assignment unambiguous (one crew per segment) and simplifies the calendar view. Segments may be partial-day (e.g., 9:00–13:00 is valid). Segments must not cross midnight local time — a segment that would run from 8pm to 2am must be split at midnight into two segments on consecutive days.

**Midnight split linkage (beta):** When a segment is split at midnight, create two ScheduleSegments and set both to the same `segment_group_id`. UI must treat them as “linked halves”: on move/resize/delete of one half, prompt “Apply to linked half too?” (default **No**). If the user chooses Yes, apply the same operation to the other half in the same database transaction.

**Linked-half move semantics (authoritative):** If the user chooses “Apply to linked half too?” on a move/resize, preserve the midnight boundary (each half stays within its own local date). Apply the analogous delta within each day; if either half would cross midnight, reject with `CROSSES_MIDNIGHT`.

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
A dedicated record created whenever a time window is freed. Drives the push-up recommender. Create it in the **same database transaction** as the segment mutation, inside the scheduling service, using the segment’s **pre-change** start/end values. Do not derive this from ActivityLog diffs — an explicit table makes the recommender straightforward to build, test, and extend.
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
- is_foreman
  - **PERSON resources are unique individuals** (inventory_quantity must be 1; do not decrement “inventory” when staffing rosters — exclusivity is enforced via roster membership uniqueness).
 (bool, default false) *(only meaningful when resource_type=PERSON)*
- active (bool)

**ResourceReservation**
- id, schedule_segment_id, resource_id
- quantity (int; default 1)
- notes (text)
- Unique constraint on (schedule_segment_id, resource_id) — prevents double-booking the same resource on the same segment.

### 2.8 Home Bases (manager-managed)
Dump sites function as “home base.” Managers can add/remove home bases over time. Home bases include addresses for future routing integrations.

**HomeBase**
- id
- name (e.g., Beverly, Natick)
- address_line1, address_line2, city, state, postal_code
- opening_time (time, nullable) *(soft anchor used when a day has no events; falls back to company operating hours if unset)*
- closing_time (time, nullable) *(UI display preference only; not a hard scheduling boundary)*
- active (bool)
- created_at, updated_at

### 2.9 Foreman Day Rosters (authoritative staffing; day-exclusive members)
Crews are composed per-day under a foreman. A non-foreman crew member may be on **at most one foreman roster per day**.

**ForemanDayRoster**
- id
- date (local company timezone date)
- foreman_person_id (FK to Resource of type PERSON; is_foreman=true)
- home_base_id (FK HomeBase)
- preferred_start_time (time, nullable) *(soft anchor only; not a hard boundary)*
- preferred_end_time (time, nullable) *(soft anchor only; not a hard boundary)*
- notes (text)
- created_by_user_id, created_at, updated_at

**ForemanDayRosterMember**
- id
- roster_id (FK ForemanDayRoster)
- date (denormalized copy from roster.date for uniqueness enforcement)
- person_resource_id (FK Resource type PERSON)
- role: `CLIMBER | GROUND | OPERATOR | OTHER`
- created_at
- Unique (day-exclusive): (date, person_resource_id)

### 2.10 Segment Staffing Link (roster-backed)
Schedule segments reference the roster for that day; staffing defaults from the roster.

**SegmentRosterLink**
- id
- schedule_segment_id (FK; one per segment)
- roster_id (FK ForemanDayRoster)
- created_by_user_id, created_at
- Unique: (schedule_segment_id)


## 3. Notes Extraction (Import + Ongoing)

### 3.1 Principles
- Always store **notes_raw** unchanged.
- Extract structured fields with best-effort parsing + confidence.
- Never silently discard information; if parse fails, keep it in raw notes and surface "unparsed signals" list.

### 3.2 Parsing rules (initial beta)
**Flags**
- push_up_if_possible:
  - triggers: "PUSH UP IF POSSIBLE", "PU", "P/U"
- must_be_first_job:
  - triggers: "MUST BE 1ST JOB", "WANTS TO BE 1ST JOB"
- no_email:
  - triggers: "NO EMAIL"

**Requirements**
- DTL → Requirement(POLICE_DETAIL, status=REQUIRED)
- CBP → Requirement(CRANE_AND_BOOM_PERMIT, status=REQUIRED)
- "TREE PERMIT" / "TREE PERMIT NEEDED" → Requirement(TREE_PERMIT, status=REQUIRED)

**Equipment suggestions**
- DW → suggest Resource "Ditch Witch"
- GRINDER / LIFT / etc. (expandable dictionary)
These become suggested reservations; do not auto-reserve unless user confirms.

**Schedule history (legacy parse)**
- RS {date} → ScheduleEvent(RESCHEDULE_TO, to_at)
- TBRS {date} → ScheduleEvent(TBS_FROM, from_at)
- RS TO {to} FROM {from} → ScheduleEvent(DATE_SWAP, from_at, to_at)
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
- id
- started_at, finished_at
- run_by_user_id (nullable; system run if null)
- source_filename (text)
- status: `IN_PROGRESS | COMPLETED | FAILED`
- summary_json (counts of rows read/created/errored per sheet)

**ImportRowMap**
- id, import_run_id
- sheet_name (text)
- row_number (int)
- entity_type (text; e.g., "Job", "Customer")
- entity_id (int FK to the created/matched entity)
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

**One-click scheduling (beta, foreman-anchored)**
- Scheduler selects: (1) date, (2) foreman, then clicks **“Schedule for mm/dd”** (or a recommended date button).
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
  - link it to the selected foreman’s ForemanDayRoster via SegmentRosterLink
  - optionally (if explicitly requested by the user during the action), create a **START_OF_DAY** TravelSegment (home base → first job) with `source=MANUAL`
  - **do not** auto-create **END_OF_DAY** TravelSegment during scheduling; end-of-day travel is created manually via “Close out day”
- Multi-day splitting remains manual in beta.
- **Close out day (beta, manual):** creates one **END_OF_DAY** TravelSegment (last job → home base) for a foreman+date:
  - default `start_datetime` = latest end_datetime of that foreman’s ScheduleSegments on that date (company timezone)
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

**Recommended error codes (stable for UI + tests)**
- `SNAP_ALIGNMENT_REQUIRED`, `OVERLAP_CONFLICT`, `CROSSES_MIDNIGHT`, `ACTIVE_BLOCKER`, `CUSTOMER_WINDOW_CONFLICT`, `NO_CONTIGUOUS_SLOT_AT_CLICK`

### 5.4 Push-up recommender

**Vacated-slot triggers (V1–V3 for beta):**
- **V1 — Segment deleted:** `deleted_at` set. Freed window = the segment's full start/end.
- **V2 — Segment moved:** `start_datetime` or `end_datetime` changed. Freed window = the *old* start/end. The new window is occupied, not vacated.
- **V3 — Segment shortened:** end moved earlier or start moved later. Freed window = the released portion (old_end → new_end, or old_start → new_start).
- **V4 — Segment split:** treat as one delete + two creates (the delete leg triggers V1). No special detection needed.

The following do *not* trigger a vacated slot: changing crew assignment, changing requirements, editing notes, changing `scheduled_hours_override` alone (no time window change).

**Spam guard:** Only create a `VacatedSlot` record when the edit results in a non-empty freed window. No-op edits (e.g., a move where start/end shift identically, or a re-save with no time change) must not produce a VacatedSlot. For V3, only create a VacatedSlot if the freed portion is > 0 hours.

When a trigger fires and a non-empty window is freed, create a `VacatedSlot` record (see §2.5) and open the push-up modal.

**Vacated-slot modal debounce (required):** To avoid pop-up spam while a scheduler is “fiddling” with a block, only open the push-up modal on **commit** actions (e.g., drag-drop mouse-up / resize commit / explicit delete). The backend may create multiple VacatedSlot records across successive commits; the UI must throttle modal display (e.g., cooldown window) and may offer a “Show push-up suggestions” button to reopen. Optional hardening: if multiple OPEN VacatedSlots are created by the same user within a short window and are adjacent/overlapping, coalesce them into a single OPEN slot.

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
- "Backlog in Dollars" report equivalent to SUMM:
  - bucket sched/tbs/total
  - crane sched/tbs/total
  - grand totals
  - % of totals
  - days-of-backlog using editable "sales per day"

- Weekly comparison:
  - store weekly snapshot totals (by rep and equipment) to populate "previous week backlog $"
  - snapshot schedule: weekly (manager can trigger manually too)

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
- action_type: CREATED/UPDATED/DELETED/STATE_CHANGED/SEGMENT_ADDED/SEGMENT_REMOVED/REQUIREMENT_UPDATED/NOTE_PARSED/etc.
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

---

## 8. Milestones (Execution Plan)

### M1 — Foundations
- Repo + environment setup
- DB schema migrations for core entities
- Basic auth/users/roles
- CRUD for Customers and Jobs
- ActivityLog framework

### M2 — Scheduling Core
- ScheduleSegment CRUD (with datetime)
- State derivation (TBS/Partial/Full) based on estimate vs scheduled allocation
- Completed workflow (manual mark complete, completed_date)
- Schedule event history (user-action events)


### M2.1 — Internal LAN Pilot (Office Host)
- Run Scheduler on an always-on Windows machine inside the company network (LAN-only; not for crews/mobile in this phase).
- Users access the UI from other office PCs via an internal hostname (e.g., `http://schedule-pc:3000`).
- Runtime must not assume `localhost` from the user’s browser:
  - `apps/web` uses same-origin `/api/*` calls and proxies to `apps/api` via Next rewrites.
  - `apps/api` binds to `0.0.0.0` for LAN reachability (and is firewalled to internal subnets).
- Authentication/authorization requirement for multi-user LAN usage:
  - Human usage must not rely on the dev/test header shim (`x-actor-user-id`).
  - Implement real login + roles (MANAGER/SCHEDULER/VIEWER). Target is Google Workspace SSO restricted to `@irontreeservice.com`.
### M3 — Resources & Rosters
- Resource inventory CRUD (count-based)
- Resource reservations per segment
- Foreman day rosters + day-exclusive member assignment UI (foreman + members)
- Availability checks: (beta approximation) sum all reservations by resource **per calendar day across all foremen**, overlap-agnostic, and warn when `total reserved quantity > inventory_quantity`; surface as a non-blocking warning — never a hard block in beta

### M4 — Import (Full Fidelity)
- Import CRANE/BUCKET authoritative
- Import Completed, Unhappy Customer, Unable, Winter, DS
- Notes parsing pipeline (flags/requirements/equipment suggestions/RS-TBRS history)
- "Extracted from Notes" UI review panel

### M5 — Reporting & Weekly Snapshot
- Live backlog report (SUMM equivalent)
- Weekly snapshot job + "previous week backlog $" display
- Sales-per-day editable setting (manager + schedulers)

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
- Manager can:
  - edit sales/day value
  - edit admin-managed lists (blocker reasons, access constraints, requirement types)
  - adjust resource inventory quantities
- Reports match spreadsheet intent:
  - live backlog totals by rep and equipment
  - previous week comparison values populated from snapshots
- Notes extraction:
  - preserves `notes_raw`
  - successfully extracts at least: push-up flag, DTL/CBP/tree permit requirements, RS/TBRS history events, DW equipment suggestion
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

---

## 11. Implementation Notes (for Codex)
- Prefer derived state over duplicated fields (e.g., compute remaining TBS hours from estimate history + segments).
- Store datetimes even if current UI is list-based; future calendar depends on it.
- Legacy parse artifacts must be traceable (`source=LEGACY_PARSE`, `raw_snippet` preserved).
- Never require perfect parsing to proceed; surface "needs review" to users.


**Operating hours (UI + anchor preferences):** Default dispatch board display window is 05:00–19:00 local time. Managers can set company operating hours (start/end) which adjust the calendar display window and the default scheduling/availability anchor when a day has no events. These are preferences only, not hard scheduling boundaries.

**Timezone policy:** Store all timestamps as `timestamptz` (UTC-normalized). The app operates in a single company timezone (America/New_York unless configured otherwise). All display and date input uses that timezone. Document the configured timezone in README. Never store naive local timestamps.

**Date/time handling (novice-safety):** In the web UI and API, do not perform arithmetic with native `Date` objects. Use a single timezone-aware library (Luxon recommended) and always interpret/format “day” boundaries in the configured company timezone.

**Numeric math (novice-safety):** Postgres `numeric` values must not be manipulated as JavaScript `number` in runtime logic (money, hours, and state math). Use `Prisma.Decimal` (or equivalent decimal library) end-to-end for arithmetic and comparisons. For calendar placement/overlap logic, prefer integer minutes derived from the snapped datetimes.

**Derived-state query performance:** Backlog list queries must compute `scheduled_effective_hours` in a single SQL pass (JOIN + GROUP BY or equivalent) to avoid N+1 queries. If performance later forces denormalization, use the state invalidation surface to keep any cached field correct.

**API warnings vs errors (novice-safety):** Scheduling attempt endpoints must return non-blocking reminders as `warnings[]` in a successful ACCEPT response. Only hard rejection conditions return REJECT with error codes; warnings must never be encoded as HTTP 400 errors.

**Warning codes (stable, non-blocking):**
- `REQ_NOT_APPROVED` — at least one Requirement is not APPROVED
- `REQ_DENIED_PRESENT` — at least one Requirement is DENIED
- `REQ_UNMET_PRESENT` — required items exist but are not yet satisfied/confirmed

**OrgSettings (single-row, internal tool):** stores `company_timezone`, `operating_start_time`, and `operating_end_time` used for dispatch-board default display window and default availability anchor when a day has no events. These are preferences only, not hard scheduling boundaries.


**Canonical availability query (authoritative)**
All “foreman availability” logic must be consistent across:
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

**Phase 2 decision — customer availability windows (authoritative):** Until a dedicated availability model exists, customer windows are derived only from `Job.availabilityNotes` using strict pattern parsing (24h and explicit AM/PM range forms). Recognized windows are enforced as hard scheduling constraints; unrecognized/ambiguous text is treated as “window not configured” (non-blocking). UI continues to display AM/PM-friendly labels while runtime stores and compares internal minute values.

**State invalidation surface:** Derived job state changes when exactly these five write events occur:
1. A ScheduleSegment is created (for this job)
2. A ScheduleSegment is soft-deleted (`deleted_at` set)
3. A ScheduleSegment's `start_datetime`, `end_datetime`, or `scheduled_hours_override` is changed
4. `Job.estimate_hours_current` is changed
5. `Job.completed_date` is set or cleared

This list is the authoritative upgrade path if a cached/denormalized `state` column is ever needed. Any caching implementation must invalidate on exactly these events and no others. If an "un-complete" workflow is ever added (clearing `completed_date`), that is already covered by event 5 — no schema change required.

---
