# Sylvara Scheduler

**A scheduling and operations platform built for tree service companies.**

Sylvara Scheduler is a production SaaS application that replaces manual whiteboards and spreadsheets with a real-time dispatch board, backlog management system, and year-over-year reporting suite. Built as a pnpm/Turborepo monorepo, deployed on Railway, and currently live at [scheduler.sylvara.app](https://scheduler.sylvara.app).

---

## Features

- **Backlog Management** — Live view of all sold, unscheduled jobs organized by equipment type (Crane / Bucket). Filter by status, town, or sales rep.
- **Dispatch Board** — Day-by-day crew scheduling with pixel-precise time positioning, travel segments between job sites, and foreman roster management.
- **Reports** — Backlog-in-dollars pipeline view and a year-over-year comparable chart with data going back to 2019.
- **Role-Based Access** — Manager / Scheduler / Viewer roles enforced server-side. In-app user management for administrators.
- **Weekly Snapshot Cron** — Automatic Saturday snapshots of backlog state feed the comparable report over time.
- **Clerk Authentication** — Google OAuth via Clerk. No passwords stored. Self-healing role metadata sync.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, TypeScript |
| Backend | Fastify, TypeScript |
| Database | PostgreSQL via Prisma 6 |
| Auth | Clerk (production instance, Google OAuth) |
| Monorepo | pnpm + Turborepo |
| Deployment | Railway (two services: web + API) |
| DNS / CDN | Cloudflare |

---

## Repository Structure

```
Sylvara_sched/
├── apps/
│   ├── web/          # Next.js 15 frontend + proxy route
│   └── api/          # Fastify API server
├── packages/
│   ├── db/           # Prisma schema, migrations, seed scripts
│   └── shared/       # Shared types, time helpers, constants
├── scripts/          # One-off data scripts (backfill, seed)
├── tests/
│   └── e2e/          # Playwright smoke tests
├── docs/             # Architecture and design documentation
├── Dockerfile.api
├── Dockerfile.web
└── railway.toml
```

---

## Architecture

The web app and API are deployed as separate Railway services. The Next.js frontend never talks to the API directly from the browser — all requests go through a server-side proxy route (`/api/proxy`) that attaches the verified Clerk JWT before forwarding upstream. This keeps API credentials server-side only.

```
Browser → Next.js proxy (/api/proxy) → Fastify API → PostgreSQL
              ↓
         Clerk JWT verification on every request
```

Clerk webhooks (`user.created`) hit the Fastify API directly to provision user records in the database on first sign-in.

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable`)
- Docker (for integration test database)
- A Clerk development instance

### Setup

```bash
# Install dependencies
corepack pnpm install

# Copy env templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env

# Run database migrations
corepack pnpm --filter @sylvara/db exec prisma migrate dev

# Start dev servers (web on :3000, api on :4000)
corepack pnpm dev
```

### Required Environment Variables

| Variable | Location | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | apps/web | Clerk publishable key |
| `CLERK_SECRET_KEY` | apps/api, apps/web | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | apps/api | Svix webhook signing secret |
| `DATABASE_URL` | packages/db, apps/api | PostgreSQL connection string |
| `CORS_ALLOWED_ORIGINS` | apps/api | Comma-separated allowed origins |

See `.env.example` files for the full list.

---

## Smoke Tests

Smoke tests are the completion gate for every feature. All tests must pass before merging.

```bash
# Run all smoke tests
corepack pnpm test:smoke

# API smoke tests only
corepack pnpm test:api:smoke

# E2E smoke tests only
corepack pnpm test:e2e:smoke
```

---

## Integration Tests

Integration tests run against a real Postgres instance via Docker.

```bash
# Start test database
corepack pnpm test:db:up

# Set test database URL (PowerShell)
$env:TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:55432/sylvara_test"

# Reset schema and run tests
corepack pnpm test:db:reset
corepack pnpm test:integration

# Stop test database
corepack pnpm test:db:down
```

> **Windows note:** If you hit Prisma `EPERM` DLL lock errors, stop all dev/watch processes before running integration tests. Set `INTEGRATION_RUN_PRISMA_GENERATE=true` to force generation if needed.

---

## Deployment

Sylvara Scheduler is deployed on Railway as two separate services (`Sylvara_sched` and `Sylvara_API`) pointed at a shared PostgreSQL instance.

Deployments are automatic on push to `main`.

### Production URLs

| Service | URL |
|---|---|
| Web App | https://scheduler.sylvara.app |
| API | https://sylvaraapi-production.up.railway.app |

### First-Time User Setup

New users sign in with Google via Clerk. The `user.created` webhook automatically provisions their database record. A Manager then assigns their role via the in-app Admin page.

```bash
# Fallback: promote a user via CLI if webhook fails
railway run corepack pnpm --filter @sylvara/db run promote-manager email@example.com
```

---

## Dev Utilities

### Reset a schedule day fixture (dev only)

```bash
# Dry run
corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4 --dryRun

# Apply reset
corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4

# Include travel segments
corepack pnpm reset:schedule-day -- --date=2026-03-03 --foremanPersonId=4 --includeTravel
```

> Destructive. Disabled in `NODE_ENV=production`.

---

## Development Conventions

- `plan.md` and `AGENTS.md` are protected documents. Changes require a two-AI review loop (Claude + GPT-4 sign-off) before applying.
- All schema changes go through Prisma migrations — never manual SQL on production.
- Smoke tests must pass before any feature is considered complete (`corepack pnpm lan:build` is the build gate).
- Timezone and scheduling logic must use shared time helpers from `packages/shared`.
- Soft deletes (`deletedAt`) are used throughout — all queries must filter `deletedAt: null` unless intentionally querying deleted records.

---

## License

Private — all rights reserved. Not open for external contributions at this time.