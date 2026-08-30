# Architecture

## System Overview

The system is split into apps and packages so product surfaces, operations tooling, database access, and recommendation logic can evolve independently.

- `apps/web` owns customer journeys: browse, search, product detail, favorites, cart, profile, and history.
- `apps/admin` owns operational views: dashboard, catalog management surfaces, recommendation config, events, and analytics.
- `apps/api` owns REST endpoints, authentication, authorization, validation, error handling, and persistence.
- `packages/recommendation` owns scoring and ranking. Controllers never contain recommendation math.
- `packages/db` owns Prisma schema and seed data.
- `packages/shared` owns cross-app DTO conventions and tracking event types.

## Request Flow

1. A visitor opens the storefront.
2. The frontend creates stable `visitor_id` and `session_id` in local storage.
3. UI components call `trackEvent`.
4. API writes a normalized `UserEvent`.
5. Recommendation endpoints load active products, recent user/visitor behavior, config, and exposure history.
6. The recommendation engine builds a profile and ranks candidates.
7. API stores recommendation impressions and returns product, score, reason, strategy, and explanation.
8. Clicks are tracked as both `UserEvent` and `RecommendationClick`.
9. Admin analytics reads impressions and clicks to calculate CTR.

## Authentication

Passwords are stored using bcrypt hashes. Clients receive JWT bearer tokens after login/register. Anonymous behavior is merged into the user account when the frontend sends `visitorId` during login/register.

## Authorization

Admin routes require `ADMIN` or `SUPER_ADMIN`. `SUPER_ADMIN` passes all admin role checks.

## Cache Boundary

Redis is available in Docker Compose. The first implementation keeps ranking synchronous and deterministic; future work can cache product candidate pools, popular-product lists, profile snapshots, and admin analytics aggregates.
