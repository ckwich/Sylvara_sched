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
