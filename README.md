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
   - Required auth env vars: `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
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

LAN pilot now uses Auth.js Google OAuth for user auth. No browser-side shared secret is used.

1. Set env vars:
   - `HOST_BIND=0.0.0.0`
   - `WEB_PORT=3000`
   - `API_PORT=4000`
   - `PUBLIC_WEB_ORIGIN=http://schedule-pc:3000`
   - `API_URL=http://localhost:4000` (server-side web proxy upstream)
2. Start LAN services:
   - `corepack pnpm lan`
   - or `corepack pnpm lan:build && corepack pnpm lan:start`
3. API auth flow:
   - Browser -> `apps/web/lib/api.ts` -> `/api/proxy`
   - Proxy forwards Auth.js JWT bearer token to `apps/api`
   - API verifies JWT with `AUTH_SECRET`
4. From another office PC:
   - Open `http://<host-machine-name>:3000/dispatch`
   - Example: `http://SCHED-HOST:3000/dispatch`

### LAN Pilot: first-time setup (quick demo)

1. Build and start LAN services:
   - `corepack pnpm lan:build`
   - `corepack pnpm lan:start`
   - `corepack pnpm lan:check`
2. Open `http://<host-machine-name>:3000/dispatch`.
3. In non-production runs (`NODE_ENV != production`), use **Dev Tools** on `/dispatch`:
   - **Seed Demo Fixtures** (creates one actor/home base/foreman/roster/job fixture set)
   - **Reset Schedule Day** (runs the existing reset flow for a foreman/date)
4. Reload the day in Dispatch after seed/reset to verify roster-linked results.

## Authentication Setup

1. Generate `AUTH_SECRET`:
   - `openssl rand -base64 32`
2. Create a Google OAuth app in Google Cloud Console:
   - APIs & Services -> Credentials -> Create Credentials -> OAuth client ID
   - App type: Web application
3. Add authorized redirect URIs:
   - `http://schedule-pc:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
4. Set env vars:
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `API_URL` (web proxy upstream for `apps/web/app/api/proxy`)
   - `CORS_ALLOWED_ORIGINS`
   - `TEST_DATABASE_URL` (test-only)
5. Promote first user to `MANAGER`:
   - Example SQL:
   - `UPDATE users SET role = 'MANAGER' WHERE email = 'you@irontreeservice.com';`
6. Local vs LAN:
   - Local dev: run on localhost with localhost OAuth redirect URI.
   - LAN mode: run on office host URL (`schedule-pc`) with LAN redirect URI configured.

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

### Windows EPERM mitigation (integration harness)

- `corepack pnpm test:integration` skips `prisma generate` by default on Windows to avoid DLL lock failures.
- To force generation, set `INTEGRATION_RUN_PRISMA_GENERATE=true`.
- When generation is forced, the harness retries up to 3 times for retryable `EPERM`/`EBUSY` lock errors.
- Keep Next/API watch processes closed while running integration tests to reduce DLL lock contention.

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
- Timezone and scheduling logic must use shared time helpers in `packages/shared`.
- Schedule segment restore API: `PATCH /api/schedule-segments/:segmentId/restore` returns `409 SEGMENT_NOT_DELETED` when the target segment is already active.
