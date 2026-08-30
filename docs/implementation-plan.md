# Implementation Plan

## Architecture

This project is a pnpm monorepo with three applications and shared packages:

- `apps/api`: NestJS REST API, authentication, product catalog, event ingestion, recommendation endpoints, admin analytics.
- `apps/web`: customer storefront built with Next.js, TypeScript, Tailwind CSS, shared product/recommendation UI, and a centralized tracking helper.
- `apps/admin`: admin dashboard built with Next.js, TypeScript, Tailwind CSS.
- `packages/db`: Prisma schema, generated client, and seed script.
- `packages/shared`: shared DTOs, API response conventions, constants, and frontend tracking types.
- `packages/recommendation`: configurable explainable recommendation engine.
- `packages/ui`: reusable React UI primitives.
- `packages/config`: shared environment parsing.

## Phase 1: Project Foundation

- Create pnpm workspace.
- Add strict TypeScript base config.
- Add ESLint and Prettier.
- Add `.env.example`.
- Add Docker Compose for PostgreSQL and Redis.

Exit gate:

- Workspace package discovery works.
- Config files are present and valid JSON/YAML.

## Phase 2: Database and Authentication

- Create Prisma schema with users, roles, product catalog, events, profiles, cart, orders, recommendations, and configuration tables.
- Add seed data for categories, brands, products, users, behavior events, recommendation impressions, clicks, and config.
- Implement API auth with hashed passwords and JWT.
- Merge anonymous visitor behavior into a logged-in user on login/register.

Exit gate:

- `pnpm db:generate` succeeds.
- Seed script can populate realistic sample data.

## Phase 3: Product System

- Implement product listing, detail, filtering, search, sorting, and pagination endpoints.
- Add admin product CRUD and status management.
- Keep image fields as URLs with storage abstraction documented for future S3/OSS integration.

Exit gate:

- Product endpoints return normalized API responses.
- Filtering and pagination are covered by DTO validation.

## Phase 4: User Event Collection

- Implement unified `UserEvent` model and ingestion endpoint.
- Add centralized frontend tracking SDK.
- Record impressions, views, clicks, searches, favorites, cart, purchases, and recommendation interactions.

Exit gate:

- Events can be recorded by `userId` or anonymous `visitorId/sessionId`.

## Phase 5: Recommendation Engine

- Implement behavior weighting and time decay in config.
- Implement user profile builder.
- Implement scorer classes: category, brand, tag, price, popularity, freshness, collaborative placeholder, and repeat-exposure penalty.
- Implement strategies: personalized, similar products, popular, recent-related, and home/you-may-like.
- Return explainable score breakdowns in development and admin flows.

Exit gate:

- Unit tests pass for weighting, time decay, cold start, de-duplication, exposure penalty, and similar-product exclusion.

## Phase 6: Customer Storefront

- Build customer routes: home, products, product detail, search, favorites, cart, profile, history, login, register.
- Add reusable `ProductCard` and `RecommendationSection`.
- Add responsive ecommerce UI with loading, empty, and error states.
- Track impressions and clicks through a helper instead of scattered inline logic.

Exit gate:

- Next.js typecheck and build succeed.

## Phase 7: Admin Console

- Build dashboard, users, products, categories, brands, orders, user events, recommendations, config, and analytics pages.
- Include recommendation debugger on user detail surface.
- Include configurable recommendation weights UI backed by API.

Exit gate:

- Admin pages render with API data and graceful fallback states.

## Phase 8: Analytics

- Implement dashboard metrics: users, products, orders, events, impressions, clicks, CTR.
- Implement trend endpoints for the latest 7 days.
- Implement strategy CTR, top recommended products, and top clicked recommendations.

Exit gate:

- Admin analytics reads recommendation impression/click tables.

## Phase 9: Verification and Documentation

- Add README with setup, runbook, default admin account, URLs, and recommendation explanation.
- Add architecture, database, API, and recommendation-system docs.
- Run install, Prisma generate, TypeScript checks, lint, unit tests, and builds.

Exit gate:

- Final delivery reports completed features, commands run, failures fixed or remaining blockers, and next recommended work.
