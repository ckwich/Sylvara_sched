# Sylvara Scheduler

A production scheduling and operations platform for tree service companies — built as a pnpm/Turborepo monorepo, deployed on Railway, and live at [scheduler.sylvara.app](https://scheduler.sylvara.app).

I work as a data analyst at a tree service company. I taught myself to code and built this to replace the manual whiteboards and spreadsheets the operations team was using. It's been in production since March 2026 with real company data.

---

## What It Does

- **Backlog Management** — Live view of all sold, unscheduled jobs organized by equipment type (Crane / Bucket), filterable by status, town, and sales rep
- **Dispatch Board** — Day-by-day crew scheduling with pixel-precise time positioning, travel segment management between job sites, and foreman roster control
- **Reports** — Backlog-in-dollars pipeline view and a year-over-year comparable chart backed by weekly snapshot data going back to 2019
- **Role-Based Access** — Manager / Scheduler / Viewer roles enforced server-side, with in-app user and role management for administrators
- **Weekly Snapshot Cron** — Automatic Saturday snapshots of backlog state feed the comparable report over time, with deduplication and graceful shutdown handling
- **Clerk Authentication** — Google OAuth via Clerk with self-healing role metadata sync on the API fallback resolver

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, TypeScript |
| Backend | Fastify, TypeScript |
| Database | PostgreSQL via Prisma 6 |
| Auth | Clerk (Google OAuth, production instance) |
| Monorepo | pnpm + Turborepo |
| Deployment | Railway (two services: web + API) |
| DNS / CDN | Cloudflare |

---

## Architecture

The frontend and API are deployed as separate Railway services. All browser requests go through a server-side Next.js proxy route that attaches the verified Clerk JWT before forwarding to the API — keeping secrets server-side only and giving a single consistent auth surface.

```
Browser → Next.js (/api/proxy) → Fastify API → PostgreSQL
                ↓
         Clerk JWT verified on every API request
```

Clerk webhooks (`user.created`) hit the Fastify API directly to provision user records on first sign-in. A fallback resolver in the JWT prehandler handles stale Clerk `publicMetadata` by fire-and-forgetting a metadata sync when a DB lookup succeeds but metadata is out of date.

### Notable Design Decisions

**Monorepo structure with shared packages**
Split across `apps/web`, `apps/api`, `packages/db` (Prisma schema + migrations), and `packages/shared` (types, time helpers, constants). Turborepo handles build orchestration and caching.

**Proxy pattern for API calls**
Rather than exposing the API URL to the browser, all client requests go through `/api/proxy` in the Next.js app. This simplifies CORS, keeps API credentials off the client, and gives a single place to attach auth headers.

**Soft delete consistency**
All models use `deletedAt` rather than hard deletes. Enforced by convention — a security audit surfaced 9 instances of missing `deletedAt: null` filters across scheduling routes, all fixed.

**Zod validation on all mutations**
Every POST/PATCH endpoint validates input against a Zod schema before any database work. Extra fields are silently rejected. No mass assignment surface.

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
└── docs/             # Architecture and design documentation
```

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable`)
- Docker (for integration test database)
- A Clerk development instance

### Setup

```bash
corepack pnpm install

cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env

corepack pnpm --filter @sylvara/db exec prisma migrate dev
corepack pnpm dev
```

### Key Environment Variables

| Variable | Service | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | apps/web | Clerk publishable key (baked into client bundle at build) |
| `CLERK_SECRET_KEY` | apps/api, apps/web | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | apps/api | Svix webhook signing secret |
| `DATABASE_URL` | packages/db, apps/api | PostgreSQL connection string |
| `CORS_ALLOWED_ORIGINS` | apps/api | Comma-separated allowed origins (must include `https://`) |

---

## Testing

Smoke tests are the completion gate for every feature. All 103 tests must pass before a feature is considered done.

```bash
# Full smoke suite
corepack pnpm test:smoke

# API smoke tests
corepack pnpm test:api:smoke

# E2E smoke tests (Playwright)
corepack pnpm test:e2e:smoke
```

Integration tests run against a real Postgres instance via Docker:

```bash
corepack pnpm test:db:up
corepack pnpm test:db:reset
corepack pnpm test:integration
corepack pnpm test:db:down
```

---

## Deployment

Two Railway services pointed at a shared PostgreSQL instance. Deploys automatically on push to `main`.

| Service | URL |
|---|---|
| Web | https://scheduler.sylvara.app |
| API | https://sylvaraapi-production.up.railway.app |

New users sign in with Google via Clerk. The `user.created` webhook provisions their database record automatically. A Manager assigns their role via the in-app Admin page.

```bash
# Fallback: promote via CLI if webhook fails
railway run corepack pnpm --filter @sylvara/db run promote-manager email@example.com
```

---

## Development Conventions

- `plan.md` and `AGENTS.md` are protected documents requiring dual-AI review before changes are applied
- All schema changes go through Prisma migrations — no manual SQL on production
- Smoke tests must pass before any feature is considered complete
- Timezone and scheduling logic uses shared helpers from `packages/shared` exclusively
- Soft deletes (`deletedAt`) are used throughout — all queries must filter `deletedAt: null`

---

## License

Private — all rights reserved.