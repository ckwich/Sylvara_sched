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

1. Set required env vars (example):
   - `LAN_MODE=true`
   - `LAN_SHARED_SECRET=<long-random-secret-min-24-chars>`
   - `HOST_BIND=0.0.0.0`
   - `WEB_PORT=3000`
   - `API_PORT=4000`
   - `PUBLIC_WEB_ORIGIN=http://schedule-pc:3000`
2. LAN dev mode (watchers):
   - `corepack pnpm lan`
3. LAN prod-ish mode (build + start):
   - `corepack pnpm lan:build`
   - `corepack pnpm lan:start`
   - `corepack pnpm lan:check`
   - `corepack pnpm lan:stop`
4. API access in LAN mode:
   - Browser still calls same-origin `/api/*` from the web app.
   - API requires `Authorization: Bearer <LAN_SHARED_SECRET>` on `/api/*`, except `GET /api/health`.
   - API writes also require `X-LAN-USER` (set from the web UI "LAN User" field).
   - The web server proxy adds this header server-side in LAN mode.
5. Windows Firewall:
   - Allow inbound TCP `WEB_PORT` only (default `3000`) on the host machine.
   - Keep `API_PORT` inbound blocked; API is reached through web same-origin proxy.
6. From another office PC:
   - Open `http://<host-machine-name>:3000/dispatch`
   - Example: `http://SCHED-HOST:3000/dispatch`
7. Keep the shared secret internal. This is LAN-only guardrail, not SSO.
8. LAN User attribution:
   - Each coworker enters their own `LAN User` value on `/dispatch` or `/company`.
   - The value is saved in browser localStorage and sent as `X-LAN-USER` on writes.
   - It is recorded in `activity_logs.actor_display` for audit context only (not authorization).
9. Security caveat:
   - This is not real authentication/authorization and must remain internal-only.

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
