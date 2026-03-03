# Sylvara Scheduling App

## How To Run Locally

1. Install dependencies:
   - `corepack pnpm install`
2. Copy env templates as needed:
   - root `.env.example`
   - `apps/api/.env.example`
   - `apps/web/.env.example`
   - `packages/db/.env.example`
3. Start dev servers:
   - `corepack pnpm dev`
4. Validate Prisma schema and migration state:
   - `corepack pnpm --filter @sylvara/db exec prisma validate`
   - `corepack pnpm --filter @sylvara/db exec prisma migrate status`
5. Run smoke tests:
   - `corepack pnpm test:api:smoke`
   - `corepack pnpm test:e2e:smoke`
   - `corepack pnpm test:smoke`

## Fixture Reset Command (Dev Only)

Use this to reset a foreman/day schedule fixture without manual DB cleanup.

- Dry run:
  - `corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4 --dryRun`
- Apply reset (links deleted first, segments soft-deleted):
  - `corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4`
- Restrict to one job:
  - `corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4 --jobId=4`
- Also clear same-day travel segments:
  - `corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4 --includeTravel`

Warning: this command is destructive and intended for local dev/test use only. It is disabled when `NODE_ENV=production`.

## Verify Scheduling Core (Phase 2)

1. Call `POST /api/schedule/one-click-attempt` with a valid job/foreman/date.
2. Confirm anchor selection precedence in code order:
   - roster preferred start
   - earliest event start
   - home base opening
   - org operating start
3. Confirm `CUSTOMER_WINDOW_CONFLICT` is returned when parsed availability window is violated.
4. Confirm `POST /api/travel/close-out-day` creates one END_OF_DAY travel and rejects a second active one.

## Notes

- Stack is locked to Next.js + TypeScript monorepo with pnpm + Turborepo.
- Database is PostgreSQL via Prisma.
- Timezone and scheduling logic must use Luxon.
