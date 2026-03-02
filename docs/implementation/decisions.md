# Implementation Decisions

## Phase 0 + Phase 1

- Package manager: `pnpm@10.6.3` via Corepack (required for this repo).
- Monorepo orchestration: Turborepo with workspaces: `apps/*`, `packages/*`, `tests/*`.
- Default local ports:
  - Web: `3000`
  - API: `4000`
- Company timezone default env: `America/New_York`.
- Added `TravelSegment.service_date` (`date`) to enforce per-foreman-per-day active START/END uniqueness with partial unique indexes.
- Used Prisma enum values `MODEL_1090` and `MODEL_1060` for `crane_model_suitability` because enum members cannot start with a number.
- Added DB check constraint `chk_resources_person_inventory_quantity` to enforce `resource_type=PERSON -> inventory_quantity=1`.
- Added matching runtime guard in `packages/db/src/index.ts` (`validateResourceInventoryQuantity`) for backend-side validation.
- Smoke tests are currently scaffolded as `test.todo(...)` stubs in authoritative folders while scheduling endpoints/UI are intentionally out of scope.
