# Product Recommendation System

基于用户使用记录的商品推荐系统，包含用户前台、管理后台、NestJS API、PostgreSQL 数据库、Prisma ORM、行为采集、可解释推荐引擎和推荐分析能力。

## Architecture

```text
apps/
  api/      NestJS REST API
  web/      Next.js customer storefront
  admin/    Next.js admin console
packages/
  db/              Prisma schema and seed
  shared/          API contracts and tracking types
  recommendation/  Explainable recommendation engine
  ui/              Shared React UI primitives
  config/          Environment config
docs/
  implementation-plan.md
  architecture.md
  recommendation-system.md
  database.md
  api.md
```

## Tech Stack

- Monorepo: pnpm workspace
- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style reusable UI
- Backend: NestJS, TypeScript, REST API
- Database: PostgreSQL, Prisma
- Cache-ready: Redis in Docker Compose; service boundary reserved for later caching
- Auth: bcrypt password hashing and JWT bearer tokens
- Tests: Vitest for recommendation engine

## Requirements

- Node.js 24+
- pnpm 11+
- Docker Desktop or compatible Docker runtime

## Setup

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REDIS_URL`: optional Redis connection string reserved for cache integration.
- `JWT_SECRET`: long random secret for signing JWTs. Do not commit real secrets.
- `JWT_EXPIRES_IN`: JWT lifetime, default `7d`.
- `NEXT_PUBLIC_API_URL`: browser-visible API URL, default `http://localhost:4000`.
- `PORT`: API port, default `4000`.

## Database Runbook

If Docker is not running, `docker compose up -d` will fail before migration. Start Docker Desktop, then rerun:

```bash
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

To reset local data during development:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/product_recommendation?schema=public" pnpm --filter @prs/db exec prisma migrate reset --schema prisma/schema.prisma
```

The seed creates 72 products, 6 categories, 8 brands, two accounts, sample behavior, carts, favorites, one order, recommendation impressions/clicks, and editable recommendation config.

## Run

```bash
pnpm dev
```

Default local URLs:

- Customer storefront: http://localhost:3000
- Admin console: http://localhost:3001
- API: http://localhost:4000

## Default Accounts

- Admin: `admin@example.com` / `Admin123456!`
- User: `user@example.com` / `User123456!`

## Test and Quality Gates

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The current verification record is in [docs/verification.md](docs/verification.md).

## Recommendation Algorithm

The first version intentionally avoids premature machine learning. It uses an explainable hybrid ranker:

- User profile generated from behavior events
- Configurable behavior weights
- Time decay with a 30-day default half-life
- Modular scorers for category, brand, tags, price, popularity, freshness, collaborative placeholder, and repeat-exposure penalty
- Cold-start fallback to popular/fresh products
- Recommendation impression persistence for de-duplication and CTR analytics
- Development/admin responses include score breakdown and human-friendly explanation

See [docs/recommendation-system.md](docs/recommendation-system.md) for details and future upgrade paths.
