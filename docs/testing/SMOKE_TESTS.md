# SMOKE TESTS — Sylvara Scheduling (Beta)

This file defines the **authoritative smoke test checklist** for the Sylvara Scheduling app.

**Purpose**
- Catch regressions in the highest-risk workflows:
  - foreman-anchored dispatch scheduling
  - day-exclusive roster membership
  - no-overlap scheduling with 10-minute snap
  - blockers / customer windows hard rejection
  - end-of-day travel “close out day”
  - vacated-slot + push-up recommender triggers

**Test locations (authoritative)**
- API/DB smoke tests: `apps/api/tests/smoke/`
- Playwright E2E smoke tests: `tests/e2e/`

---

## A) API/DB Smoke Tests (deterministic, fast)

### A1 — Day-exclusive roster membership (DB enforced)
**Goal:** A person may belong to at most one foreman roster per local date.

**Arrange**
- Create PERSON resources: ForemanA (is_foreman=true), ForemanB (is_foreman=true), Crewman1 (is_foreman=false)
- Create `ForemanDayRoster` for ForemanA on date D
- Create `ForemanDayRoster` for ForemanB on date D

**Act**
- Add Crewman1 to ForemanA roster
- Attempt to add Crewman1 to ForemanB roster

**Assert**
- Second insert fails with a deterministic unique violation (day-exclusive)
- Crewman1 remains assigned only to ForemanA roster

**File:** `apps/api/tests/smoke/roster_day_exclusive.test.*`

---

### A2 — One-click schedule success (onsite-only)
**Goal:** One-click scheduling creates an onsite `ScheduleSegment` linked to the foreman roster; travel is not auto-created (except optional START travel if requested).

**Arrange**
- ForemanA + roster on date D
- JobX with:
  - estimate_hours_current=4
  - travel_hours_estimate=1 (used for availability math)
  - no active blockers
  - customer windows allow

**Act**
- Call one-click schedule: (job_id=JobX, foreman_id=ForemanA, date=D)

**Assert**
- Exactly one new `ScheduleSegment` exists for JobX
- Exactly one `SegmentRosterLink` exists for that segment pointing to ForemanA’s roster
- Segment does not cross local midnight
- **No END_OF_DAY TravelSegment** exists for (ForemanA, D)
- START_OF_DAY travel exists **only if** the request explicitly asked for it

**File:** `apps/api/tests/smoke/one_click_schedule_success.test.*`

---

### A3 — Click-to-create placement uses 10-minute snap and never overlaps
**Goal:** Dispatch-board click-to-create floors to 10-minute boundaries and fits within the clicked gap without overlap.

**Arrange**
- ForemanA + roster on date D
- Existing occupancy intervals (for ForemanA on D):
  - Segment1: 09:00–10:00
  - Segment2: 11:00–12:00

**Act**
- One-click attempt with requested start minute equivalent to 09:19 local and duration 60 min

**Assert**
- Created segment starts at 09:10 (floored)
- Placement does not overlap existing occupancy

**File:** `apps/api/tests/smoke/click_create_snap_no_overlap.test.*`

---

### A4 — One-click rejects when no contiguous slot exists
**Arrange**
- ForemanA + roster on date D
- Occupancy from anchor to end of day so no fit remains
- Job estimate requires a non-zero block

**Act**
- Call one-click schedule

**Assert**
- Reject with `NO_CONTIGUOUS_SLOT_AT_CLICK`

**File:** `apps/api/tests/smoke/click_create_reject_gap_too_small.test.*`

---

### A5 — Hard reject: active blocker
**Arrange**
- JobX has an ACTIVE `JobBlocker`

**Act**
- Attempt schedule (one-click OR attempt-create)

**Assert**
- Reject with `ACTIVE_BLOCKER`
- No segments created

**File:** `apps/api/tests/smoke/reject_active_blocker.test.*`

---

### A6 — Customer availability parser + conflict enforcement
**Arrange/Act/Assert**
- One-click attempt rejects `CUSTOMER_WINDOW_CONFLICT` when parseable `availabilityNotes` window excludes the proposed segment
- One-click attempt ACCEPTs with warning `CUSTOMER_WINDOW_NOT_CONFIGURED` when `availabilityNotes` is missing or unparseable

**File:** `apps/api/tests/smoke/reject_customer_window.test.*`

---

### A7 — Close out day creates END_OF_DAY travel (Option 1)
**Goal:** END travel is created manually and defaults start to last job end.

**Arrange**
- ForemanA date D has:
  - Segment1 ends 12:00
  - Segment2 ends 15:30 (latest)
- No END_OF_DAY travel exists

**Act**
- Call close-out-day with duration_minutes=45

**Assert**
- One END_OF_DAY TravelSegment exists:
  - start_datetime == 15:30 (latest segment end)
  - end_datetime == 16:15
  - travel_type == END_OF_DAY
  - source == MANUAL
- Enforce at most one active END_OF_DAY per foreman+date (second create must reject or update; pick one behavior and test it)

**File:** `apps/api/tests/smoke/close_out_day_end_travel.test.*`

---

### A8 — VacatedSlot created on segment delete
**Arrange**
- Create a segment 09:00–13:00

**Act**
- Soft-delete it (`deleted_at` set)

**Assert**
- `VacatedSlot` created:
  - source_action=DELETED
  - start/end match the freed window
  - status=OPEN

**File:** `apps/api/tests/smoke/vacated_slot_on_delete.test.*`

---

### A9 — VacatedSlot created on move and shorten
**Move**
- Segment old: 09:00–13:00 → new: 12:00–16:00
- Assert VacatedSlot for 09:00–13:00, source_action=MOVED

**Shorten**
- Segment old: 09:00–13:00 → new: 09:00–12:00
- Assert VacatedSlot for 12:00–13:00, source_action=SHORTENED

**File:** `apps/api/tests/smoke/vacated_slot_on_move_and_shorten.test.*`

---

### A10 — ScheduleSegment CRUD + derived state impact
**Goal:** Segment CRUD validates scheduling constraints and updates derived job state from active roster-linked segments.

**Arrange**
- Existing Job and ForemanDayRoster for date D in company timezone

**Act/Assert**
- Create segment with valid start/end:
  - segment is created
  - state reflects scheduled allocation (`FULLY_SCHEDULED` / `PARTIALLY_SCHEDULED` depending on estimate)
- Move/resize segment:
  - rejects invalid increments/cross-midnight
  - accepts valid snapped updates
- Delete segment:
  - soft-delete path returns success
  - derived state updates (e.g., from `FULLY_SCHEDULED` to `TBS` when no active segments remain)

**File:** `apps/api/tests/smoke/schedule_segment_crud.test.*`

---

### A11 — ScheduleSegment read/list endpoints use roster-linked truth
**Goal:** Read endpoints return only active roster-linked segments.

**Arrange**
- Create a segment through `POST /api/schedule-segments` (linked to a roster)
- Insert an orphan `schedule_segment` fixture without `segment_roster_links`

**Act/Assert**
- `GET /api/foremen/:foremanPersonId/schedule?date=YYYY-MM-DD` returns the linked segment and excludes orphan rows
- Soft-delete the segment and verify foreman schedule list becomes empty
- `GET /api/jobs/:jobId/schedule-segments` returns only linked active segments and includes derived job state

**File:** `apps/api/tests/smoke/schedule_segment_read_endpoints.test.*`

---

### A12 — Org settings timezone read/update
**Goal:** Company timezone is readable and writable through API with validation and auth on writes.

**Arrange/Act/Assert**
- `GET /api/org-settings` returns `companyTimezone`
- `PATCH /api/org-settings` without actor header returns `401 UNAUTHENTICATED`
- `PATCH /api/org-settings` with invalid timezone returns `400 VALIDATION_ERROR`
- `PATCH /api/org-settings` with valid IANA timezone persists the update

**File:** `apps/api/tests/smoke/org_settings.test.*`

---

### A13 — LAN API guard behavior
**Goal:** In LAN mode, API requires bearer auth for `/api/*` except health.

**Arrange/Act/Assert**
- With LAN guard enabled, `GET /api/health` returns 200 without auth
- With LAN guard enabled, non-health read route returns `401 UNAUTHENTICATED` when bearer is missing
- With LAN guard enabled, non-health write route returns `401 UNAUTHENTICATED` when `X-LAN-USER` is missing
- With LAN guard enabled, non-health write route rejects `x-actor-user-id` in favor of LAN user attribution
- With valid bearer + `X-LAN-USER`, write behavior proceeds and `activity_logs.actor_display` stores the LAN user value

**File:** `apps/api/tests/smoke/lan_guard.test.*`

---

## B) Playwright E2E Smoke Tests (UI workflow)

### B1 — Roster exclusivity in UI
**Steps**
1. Login as scheduler
2. Open day D roster for ForemanA; add Crewman1
3. Open day D roster for ForemanB
4. Verify Crewman1 is not available / cannot be added

**Expected**
- UI blocks or errors with clear message
- Crewman1 remains only on ForemanA roster

**File:** `tests/e2e/roster-day-exclusive.spec.ts`

---

### B2 — Dispatch board click-to-create uses 10-minute snap and no overlap
**Steps**
1. Ensure ForemanA has blocks 09:00–10:00 and 11:00–12:00
2. Select a Job with 1 hour onsite
3. Click at 10:07 in ForemanA column

**Expected**
- New block appears at 10:00–11:00
- No overlap; if it would overlap, UI shows rejection reason and no new block appears

**File:** `tests/e2e/dispatch-click-create-snap-no-overlap.spec.ts`

---

### B3 — One-click schedule accept/reject
**Steps**
1. Select Job with estimate_hours_current + travel_hours_estimate
2. Click “Schedule for mm/dd” for ForemanA

**Expected**
- Success: onsite segment created and visible
- Reject: message shows `ACTIVE_BLOCKER` or `CUSTOMER_WINDOW_CONFLICT` or `NO_CONTIGUOUS_SLOT...`

**File:** `tests/e2e/one-click-schedule-accept-reject.spec.ts`

---

### B4 — Close out day creates END_OF_DAY travel
**Steps**
1. Ensure at least one onsite segment exists for ForemanA on day D
2. Click “Close out day”
3. Verify start time defaults to last job end
4. Enter duration and save

**Expected**
- END_OF_DAY travel block appears
- Second close-out behaves per chosen rule (reject or update) consistently

**File:** `tests/e2e/close-out-day-end-travel.spec.ts`

---

## C) How to run (Codex should wire these)
- API/DB smoke: `pnpm test:api:smoke` (or equivalent)
- E2E smoke: `pnpm test:e2e:smoke`
- Combined: `pnpm test:smoke`

(Exact script names depend on the stack choice; keep them consistent across README + CI.)
