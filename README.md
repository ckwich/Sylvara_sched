# Sylvara Scheduling App

## Run Modes

### Local dev (single machine)

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

### LAN mode (internal office pilot)

Use this when running the Scheduler from an always-on office host so coworkers can access it over LAN.

1. Set env vars (example):
   - `LAN_MODE=true`
   - `LAN_SHARED_SECRET=<shared-internal-secret>`
   - `HOST_BIND=0.0.0.0`
   - `WEB_PORT=3000`
   - `API_PORT=4000`
   - `PUBLIC_WEB_ORIGIN=http://schedule-pc:3000`
2. Start services:
   - `corepack pnpm lan`
3. API access in LAN mode:
   - Browser still calls same-origin `/api/*` from the web app.
   - API requires `Authorization: Bearer <LAN_SHARED_SECRET>` on `/api/*`, except `GET /api/health`.
   - The web server proxy adds this header server-side in LAN mode.
4. Windows Firewall:
   - Allow inbound TCP `3000` on the host machine
   - Allow inbound TCP `4000` only if clients need direct API access (normally web uses same-origin `/api` proxy)
5. From another office PC:
   - Open `http://<host-machine-name>:3000/dispatch`
   - Example: `http://SCHED-HOST:3000/dispatch`
6. Keep the shared secret internal. This is LAN-only guardrail, not SSO.

## Integration Tests (Real Postgres)

Test DB uses `docker-compose.test.yml` and `TEST_DATABASE_URL`.

1. Start/stop test DB:
   - `corepack pnpm test:db:up`
   - `corepack pnpm test:db:down`
2. Set `TEST_DATABASE_URL`:
   - macOS/Linux:
     - `export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:55432/sylvara_test"`
   - Windows PowerShell:
     - `$env:TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:55432/sylvara_test"`
3. Reset test DB schema/data:
   - `corepack pnpm test:db:reset`
4. Run integration tests:
   - `corepack pnpm test:integration`

If you hit Prisma Windows file-lock errors (`EPERM ... query_engine-windows.dll.node`), stop dev/watch processes and rerun the command.

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
