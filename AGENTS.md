# AGENTS.md — Sylvara Scheduling App (Codex Operational Guidelines)

This document is **authoritative** instructions for Codex (and any other coding agent) while working on the Sylvara Scheduling App repository. If anything here conflicts with other project docs, **pause and surface the conflict** before proceeding.

---

## 0) Locked Tech Stack & Repo Layout (Authoritative)

### 0.1 Stack (locked for beta)
- **Runtime:** Node.js LTS
- **Package manager:** pnpm
- **Monorepo:** Turborepo
- **Web app:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS (no paid UI components; optional: shadcn/ui because it is free/open-source)
- **API server:** Node + TypeScript (Fastify recommended) in `apps/api` with REST endpoints
- **Database:** PostgreSQL
- **Primary keys:** UUID (`@id @default(uuid())`) on all tables — no integer auto-increment. Sylvara CRM uses UUIDs universally; using integers in the scheduler would require a full re-key at merge time. This is locked.
- **ORM & migrations:** Prisma (recommended for novice clarity) *(migrations are required; never edit committed migrations)*
- **Validation:** Zod (shared schemas between web/api)
- **Date/time:** **Luxon is allowed only inside shared time helpers.** Do not import Luxon in `apps/*`. Use shared minute-of-day helpers (`packages/shared/src/time-of-day.ts`) and explicit timezone policy (`org_settings.company_timezone`) with UTC storage/serialization.
- **Auth:** Auth.js (NextAuth v5) with Google OAuth provider, restricted to `@irontreeservice.com`. See plan.md §2.1.1 for the full implementation spec. Do not swap or add an alternative auth library.
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Formatting/lint:** ESLint + Prettier

### 0.2 Repo layout (authoritative)
- `apps/web/` — Next.js web UI (dispatch board, backlog views, admin screens)
- `apps/api/` — API server (REST), auth, scheduling services, importer, background jobs
- `packages/db/` — Prisma schema + migrations + DB helpers
- `packages/shared/` — shared types, Zod schemas, domain constants, utilities
- `tests/e2e/` — Playwright E2E smoke tests (authoritative)
- `docs/` — documentation (must include `docs/testing/SMOKE_TESTS.md`)

Do not invent alternative top-level layouts without explicit permission.


---

## 1) Operating Principles (Non-Negotiable)

### 1.1 Optimize for correctness over cleverness
- Choose the simplest implementation that is **correct, testable, and maintainable**.
- Avoid "magic" abstractions and over-engineering.
- Prefer explicit code and clear naming over compactness.

### 1.2 Be safe for a novice developer workflow
The repository must remain understandable for a novice developer (Cole).
- Use **boring**, conventional project structure.
- Add comments where a novice might get lost (why, not what).
- Prefer fewer technologies, fewer moving parts, and fewer build steps.

### 1.3 Preserve data fidelity at all costs
- The spreadsheet import must be **full fidelity**. Never drop columns or notes.
- Always store `notes_raw` intact.
- Any parsing/extraction must be additive and reversible.

### 1.4 No silent assumptions
- If requirements are ambiguous, write down:
  - what you assumed
  - why it's reasonable
  - what alternative interpretations exist
- Put these into a short "Assumptions" section in PR notes / progress notes.

### 1.5 No destructive refactors without permission
- Do not rewrite entire files for style.
- Do not reorganize folders or rename modules unless:
  - it solves a concrete problem, AND
  - it is done incrementally with clear reasoning.

---

## 2) Workflow for Every Task (Codex Must Follow)

### Step A — Understand the ask
Before editing code:
1. Identify which plan.md milestone the work belongs to (M1–M7).
2. Identify the acceptance criteria touched.
3. Identify what "done" means and how it will be verified.

### Step B — Make a small plan
Write a brief plan (5–15 bullets):
- files to change
- new DB tables/migrations needed
- API changes
- UI changes
- tests to add
- how to verify manually

### Step C — Implement in small commits
- Make changes in small, reviewable increments.
- Prefer: 1 migration + 1 endpoint + 1 UI piece + 1 test at a time.
- Avoid mega-commits that mix unrelated changes.

### Step D — Validate
For each change:
- run tests
- run formatting/lint
- manually verify the feature in the UI if applicable
- document how to verify in plain English

### Step E — Report back clearly
Every response must include:
- What changed
- How to run it
- How to test it
- Any assumptions
- Any follow-ups needed

---

## 3) Code Quality Requirements

### 3.1 Naming conventions
- Use domain names that match plan.md:
  - Job, ScheduleSegment, Requirement, Resource, ActivityLog, AuditLog, EstimateHistory, CustomerRisk
- Avoid abbreviations unless they are domain-standard:
  - CBP, DTL are domain-standard in this project.
- **Sylvara entity mapping:** When naming new entities, consult plan.md §12.2. Use names consistent with the Sylvara merge path (e.g., don't create a `JobSite` table when the target name is `Property`).

- Resource modeling guardrails:
  - `Resource.resource_type=PERSON` represents a unique individual; UI must not expose inventory_quantity editing for PERSON, and backend must enforce `inventory_quantity=1`.

### 3.2 Error handling
- No unhandled exceptions or unhandled async errors in runtime paths.
- For API endpoints:
  - Validate input
  - Return consistent error shape: `{ "error": { "code": "...", "message": "...", "details": {} } }`
- For scheduling attempt endpoints, do **not** use HTTP 400 for non-blocking reminders. Return `200` with `result=ACCEPT` and include `warnings[]` for polite reminders; use `result=REJECT` with stable codes only for hard conflicts.
  - Warning codes (stable, non-blocking):
    - `REQ_NOT_APPROVED`
    - `REQ_DENIED_PRESENT`
    - `REQ_UNMET_PRESENT`

  - Use appropriate HTTP status codes
  - Implement this consistently in the Fastify API server via a single error-handling plugin/middleware so all endpoints return the same shape.

### 3.3 Logging
- Log server errors with enough context to debug.
- Do not log sensitive personal data.
- For import pipeline:
  - log row number / sheet name / job id mapping
  - capture import errors without aborting the whole import if possible

### 3.4 Testing
At minimum:
- Unit tests for:
  - notes parsing (DW/DTL/CBP/RS/TBRS)
  - state derivation (TBS/PARTIAL/FULL)
  - weekly snapshot generation
- Integration tests for:
  - key endpoints (create job, create segment, update requirement)
  - AuditLog entries are written on every entity write (verify old_values/new_values populated correctly)
- Import tests:
  - parse workbook and confirm rows imported, and `notes_raw` preserved

**Test locations (authoritative; do not invent new folders)**
- API/DB smoke tests: `apps/api/tests/smoke/`
- API/unit tests (non-smoke): `apps/api/tests/unit/`
- Playwright E2E smoke tests: `tests/e2e/`
- Shared test fixtures/factories: `apps/api/tests/fixtures/` and `apps/api/tests/factories/`

**Smoke test spec file (must exist)**
- Create and maintain: `docs/testing/SMOKE_TESTS.md`
- Codex must keep the implemented tests in sync with this spec.

### 3.5 Type safety (strongly recommended)
- Use strict typing wherever supported.
- Avoid `any` unless unavoidable; if used, explain why.

---

## 4) Database & Migrations Rules

### 4.1 Migrations are sacred
- Every schema change must be a migration.
- Never change an existing migration after it has been committed.
- Prefer additive migrations:
  - add column
  - add table
  - add index
  - avoid destructive drops unless explicitly requested

### 4.2 Data integrity
- Use foreign keys for relationships.
- Use NOT NULL where truly required.
- **Soft deletes on all tables (required for Sylvara merge compatibility):** Every table must have a `deleted_at timestamptz NULL` column. Use `deleted_at IS NULL` filters in all queries. Never hard-delete rows. Sylvara enforces this universally; the scheduler must match.
- Use indexes on (do not index `job.state` — state is derived at query time, not a stored column; index the underlying fields instead):
  - `jobs.equipment_type`
  - `jobs.town`
  - `jobs.completed_date` (for COMPLETED filter — `completed_date IS NOT NULL` is how COMPLETED is detected)
  - `schedule_segments.start_datetime`, `schedule_segments.end_datetime`
  - `requirements.status`, `requirements.requirement_type_id`
  - `jobs.customer_id`
- Add these partial indexes (high-leverage for derived state queries and calendar views):
  - `CREATE INDEX idx_segments_active_by_job ON schedule_segments(job_id) WHERE deleted_at IS NULL;` — keeps the per-job hours aggregate fast by scanning only live segments; also replaces a standalone `deleted_at` index for the non-deleted filter
  - `CREATE INDEX idx_segments_active_by_job_datetime ON schedule_segments(job_id, start_datetime) WHERE deleted_at IS NULL;` — efficient for calendar/date-range views on active segments


### Foreman-anchored scheduling (authoritative)
- Crews are fluid. All scheduling availability and daily planning anchors to the **FOREMAN**.
- Foreman is a PERSON resource where `is_foreman=true`.
- A ScheduleSegment is associated to a foreman via `SegmentRosterLink -> ForemanDayRoster.foreman_person_id`.
- **Source of truth (authoritative):** “What’s scheduled for a foreman on a date” is the roster-linked join:
  - `ForemanDayRoster (foreman_person_id, date)` → `SegmentRosterLink (roster_id, schedule_segment_id)` → `ScheduleSegment`
- `ScheduleSegment` rows **without** a corresponding `SegmentRosterLink` are **not** considered scheduled for any foreman/day (treat as test artifacts or a write bug).
- All scheduling writes that create segments for a foreman/day must create the `ScheduleSegment` **and** its `SegmentRosterLink` in the **same DB transaction**.
- A TravelSegment is associated directly via `TravelSegment.foreman_person_id`.
- Staffing is day-scoped via `ForemanDayRoster / ForemanDayRosterMember` and MUST enforce day-exclusivity at the DB layer:
- **PERSON resources are unique individuals** (quantity is effectively 1). Assigning a person to a roster does not “decrement inventory”; day-exclusivity is enforced via the roster uniqueness constraint.
  - A PERSON may belong to at most one foreman roster per date (unique on `(date, person_resource_id)` for active records).


- Use unique constraints where appropriate (e.g., requirement type names, `ResourceReservation(schedule_segment_id, resource_id)`, `SegmentRosterLink(schedule_segment_id)` and `ForemanDayRosterMember(date, person_resource_id)`)
- All timestamp columns must be `timestamptz` (UTC-aware). Never store naive local timestamps. See plan.md §11 for timezone policy.

- **Numeric math (authoritative):** Treat Postgres `numeric` values as decimals end-to-end. In TypeScript runtime code, never do money/hours arithmetic with JS `number`; use `Prisma.Decimal` (or a decimal library) for calculations and comparisons.
- ScheduleSegment uses soft delete (`deleted_at`). Never hard-delete segments — vacated-slot detection and the push-up recommender depend on being able to detect deletions.

### 4.3 Derived state policy
- Avoid storing computed fields (like "remaining hours") unless performance forces it.
- State should generally be derived from:
  - estimate_hours_current
  - sum of schedule segments

- **Performance (authoritative):** Compute `scheduled_effective_hours` for backlog views in a single SQL pass (JOIN + GROUP BY or equivalent). Avoid N+1 query patterns.

If a cached/denormalized field is introduced:
- justify it
- keep it in sync with the five write events defined in the **state invalidation surface** (plan.md §11) — that list is the authoritative reference for what triggers a state change
- test it

---

## 5) Domain Rules (Must Implement Exactly)

### 5.1 Workflow states
Jobs must support:
- TBS
- PARTIALLY_SCHEDULED
- FULLY_SCHEDULED
- COMPLETED

State transitions:
- `TBS`, `PARTIALLY_SCHEDULED`, and `FULLY_SCHEDULED` are derived from `scheduled_effective_hours` vs `estimate_hours_current`. They are never stored.
- `COMPLETED` is signalled by `completed_date IS NOT NULL`. There is no separate `state` column. Do not create one.
- Use the exact algorithm defined in plan.md §2.5 "State derivation (authoritative algorithm)". Do not invent a different threshold or interpretation.


### 5.1.1 Travel rules (beta)
- Home bases (dump sites) are manager-managed with addresses.
- For each foreman+date, TravelSegments are constrained to:
  - `START_OF_DAY`: home base → first job
  - `END_OF_DAY`: last job → home base
- Enforce at most one active START_OF_DAY and one active END_OF_DAY per foreman+date (`deleted_at IS NULL`).
- In beta, END_OF_DAY travel is created manually via a “Close out day” action: start defaults to last job end; scheduler enters duration; end auto-computed (override allowed).
- BETWEEN_JOBS travel is post-beta (AUTO insertion) and must respect locked travel segments (`locked=true`).

### 5.1.2 Availability (authoritative)
A foreman’s daily occupancy includes:
- all active TravelSegments where `foreman_person_id` matches
- all active ScheduleSegments whose SegmentRosterLink points to a ForemanDayRoster for that date whose `foreman_person_id` matches

Do not implement hard workday boundaries; `preferred_start_time` / `preferred_end_time` are soft anchors only.
Operating hours and home base opening/closing times are UI display + anchor preferences only; they never reject scheduling.


### 5.2 Money recognition
- Job dollars remain fully in backlog until job is complete and customer satisfied.
- No partial $ recognition.

### 5.3 Requirements UX enforcement
- No hard warnings or blocking.
- When scheduling/editing a segment:
  - show a polite reminder listing requirements and their actual status (REQUIRED / REQUESTED / APPROVED / DENIED / NOT_REQUIRED)
  - visually highlight any requirement not in `APPROVED` or `NOT_REQUIRED`
  - DENIED must display differently from REQUIRED/REQUESTED — a refused permit requires different follow-up action
  - allow proceeding

### 5.4 Notes parsing rules (minimum required)
The parser MUST:
- Preserve `notes_raw` exactly.
- Extract:
  - DW → Ditch Witch equipment suggestion
  - DTL → Police detail requirement
  - CBP → Crane and Boom Permit requirement
  - "TREE PERMIT" → Tree Permit requirement
  - RS {date} → rescheduled TO that date (legacy event)
  - TBRS {date} → to be rescheduled FROM that date (legacy event)
  - "RS TO X FROM Y" → date swap (legacy event)
  - "PUSH UP IF POSSIBLE" → `push_up_if_possible=true`

All extracted items must be traceable:
- store raw snippet
- mark source as LEGACY_PARSE if derived from import

### 5.5 Push-up recommender
When a scheduled slot is vacated:
- show candidates where `push_up_if_possible=true`

- **UI debounce (required):** Only open the push-up modal on commit actions (drop/resize commit/delete). Throttle repeated prompts during rapid successive edits.
- candidates must fit constraints and resources as best as currently modeled
- do not schedule automatically; user selects a candidate and confirms

---

## 6) Import Pipeline Rules (Spreadsheet)

### 6.1 Full fidelity
- Import all relevant sheets listed in plan.md.
- Preserve:
  - all job fields
  - all notes
  - all legacy confirmed text
  - completed records
- Never discard unknown tokens; keep them in notes.

### 6.2 Idempotency
The production import is expected to run once (initial migration only).
- Still store a stable import identity for traceability:
  - sheet name + row number (+ optional approval date/address if needed)
- In development/test environments, it is acceptable to re-run imports by wiping the dev DB.
- Do not build elaborate "sync" behavior unless explicitly requested later.

### 6.3 Reconciliation report
After import:
- output counts by sheet:
  - rows read
  - jobs created / jobs matched-and-updated (updated = an existing entity was matched within this same import run, e.g. a customer appearing on multiple sheets)
  - errors
- store import run logs for debugging

---

## 7) UI Requirements (Novice-friendly and Scheduler-friendly)

### 7.1 Avoid spreadsheet mimicry
- Use modern filtering/grouping.
- Support group-by sales rep.
- Provide totals ($ and hours) like the spreadsheet does.

### 7.2 Editing experience
- Job edit and scheduling must be:
  - predictable
  - undoable where feasible (at least via activity log)
  - resilient to partial data

### 7.3 Activity log visibility
- Every Job page should show an Activity Log panel:
  - who changed what and when
  - schedule segment changes
  - requirement status changes
  - estimate changes

---

## 8) Documentation Requirements (Codex Must Write)

### 8.1 README updates
Any feature that changes how to run, migrate, or import must update README.

### 8.2 "How to verify" notes
For each milestone:
- Write a short checklist:
  - steps to run locally
  - steps to import the workbook
  - steps to verify backlog totals and segment scheduling
  - steps to verify parsing outputs

### 8.3 Inline comments for tricky code
Examples:
- spreadsheet parsing
- parsing RS/TBRS date formats
- state derivation logic
- weekly snapshot job

---

## 9) Security & Privacy Basics

- Do not expose private customer info in logs.
- Validate and sanitize inputs (especially notes).
- Use CSRF protections for Next.js web routes and API calls where applicable.
- Store passwords only using secure auth provider or hashing (never plaintext).

---

## 10) Communication Standards for Codex Responses

Every Codex response must include:
1. **Summary of changes**
2. **Files changed** (list)
3. **How to run**
4. **How to test**
5. **How to verify manually**
6. **Assumptions / open questions**
7. **Next steps**

Keep responses explicit and step-by-step. Assume the repo maintainer is a novice.

---

## 11) "Stop and Ask" Triggers

Codex MUST stop and ask (do not proceed) if:
- It would delete or migrate existing production data destructively.
- It would change the meaning of workflow states or money recognition.
- It would modify import semantics (what gets imported or how it's keyed).
- It would remove or overwrite `notes_raw`.
- It would introduce a new major dependency/framework that increases complexity.
- It would introduce or swap to a more complex auth/permissions system than the current stack requires (novice-safety gate). **Note: the auth system is already decided — Auth.js + Google OAuth. See plan.md §2.1.1. Do not introduce an alternative; do stop and ask if something in that spec seems contradictory or unimplementable.**
- It would make the Sylvara CRM merge significantly harder — specifically: using integer PKs instead of UUIDs, hard-deleting rows instead of soft-deleting, storing derived job state as a column, or renaming entities in ways that conflict with plan.md §12.2 entity mappings.

**After a stop-and-ask is resolved:** Record the decision in plan.md (under the relevant section) or in a new ADR file before proceeding. Do not just continue from the chat answer — the decision must be durable.

---

## 12) Definition of Done (DoD)

A task is not "done" unless:
- tests pass
- lint/format pass
- feature works manually
- documentation is updated
- activity logging is present for user-facing edits
- import changes include reconciliation output (if applicable)

---

## 13) Appendix — Sylvara CRM Context

This scheduler module will eventually merge into **Sylvara**, a full Tree Service CRM. Understanding the broader system helps Codex make correct local decisions.

**Sylvara's design principles (relevant to this module):**
- Properties are the anchor — job history and patterns belong to a location, not just a person.
- Contacts are persistent — they survive across leads, jobs, and years.
- Everything is audited — every write produces an immutable `AuditLog` entry. This module must match this pattern.
- Soft deletes everywhere — `deleted_at` on every table.
- UUID PKs on every table — this module must match.
- Multi-tenant foundation — `tenant_id` on every table (not built into this module yet, but the pattern must not be broken).

**The scheduler is the MORE advanced side of the merge.** Sylvara's `schedule_entries` is a simple date+crew model. The scheduler's foreman-anchored roster, travel segments, and push-up recommender will be adopted by Sylvara — not replaced. Do not simplify the scheduler's scheduling model to match Sylvara's simpler one.

**Full integration spec:** See plan.md §12 for the complete entity mapping, role mapping, auth reconciliation, and known migration decisions.

---

## 14) Appendix — Known Domain Mappings

- DW → Ditch Witch (equipment)
- DTL → Police Detail requirement
- CBP → Crane and Boom Permit requirement
- 1090 / 1060 / Either → Liebherr crane model suitability
- Lift → Spider Lift
- RS → rescheduled TO date
- TBRS → to be rescheduled FROM date
- "Push up if possible" → eligible for earlier scheduling if constraints allow; see plan.md §5.4 for the authoritative recommender spec (triggers, eligibility, fit rule, ranking)

---
