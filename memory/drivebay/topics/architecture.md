# drivebay — Architecture

Canonical detail lives in the app's own docs, not here — read those first:
`apps/drivebay/CLAUDE.md` (full architecture/domain/API guide) and
`apps/drivebay/docs/architecture/system-overview.md`,
`apps/drivebay/docs/architecture/domain-architecture.md`. This note only adds what's
verified against code and not obvious from those.

## System shape

- Laravel 12 (PHP ^8.2) + Inertia v3/Vue 3 web app, Filament 5 admin, PostgreSQL/MySQL,
  Scout+Meilisearch search, Redis+Horizon queues. Domain-based modular structure:
  business logic in `apps/drivebay/app/Domains/{Domain}/Services/`, thin controllers in
  `apps/drivebay/app/Http/Controllers/{Web,Api/V1,Admin}/`.
- Companion Flutter mobile client lives in a **separate repo**
  (`drivebay-flutter/`, own git history), consuming this app's `/api/v1` JSON API only.
- Verified 2026-07-15 at commit `8f7840f`: exactly 21 domains under `app/Domains/`
  (Advertising, Analytics, Billing, Dealer, Engagement, Experiment, FuelEconomy,
  FuelPricing, Geography, Listing, Media, Messaging, Moderation, Notification,
  Promotion, Recommendation, Search, SocialPublishing, User, Vehicle, Viewing) —
  matches the list in `CLAUDE.md` exactly, no drift.

## Boundaries and directed dependencies

- Web vs API are **separate contract spaces**: `app/Http/Requests/Web/*` and Inertia
  responses must never be treated as API contracts for the Flutter client — API
  contracts live only in `docs/api/v1/openapi.json` (see `CLAUDE.md` "API" section).
- Search must go through Scout/Meilisearch (`docs/search/search_architecture.md`);
  recommendations logic must live in `RecommendationService`
  (`app/Domains/Recommendation/`), never in controllers.

## Entry points and data flow

- `routes/web.php` (marketplace + seller dashboard, Inertia), `routes/api.php` →
  `routes/api/v1/*.php`, `routes/storefront.php` (dealer custom-domain storefronts,
  resolved by `ResolveDealerStorefrontHost` middleware).

## External systems and persistence

- Firebase Cloud Messaging (push), Stripe + fake gateway (billing), Sentry (prod error
  tracking), Telescope (local). Schema is authoritative in
  `docs/database/database_schema.dbml`; migration order fixed by
  `docs/database/migration_plan.md` — never invent tables/columns.

## High-risk change areas

- Horizon timeout ordering (job `timeout` < supervisor `timeout` < `retry_after`) —
  see `CLAUDE.md` "Queues (Horizon)" and `.cursor/skills/configuring-horizon`.
- Vehicle taxonomy is seeded from a committed snapshot
  (`database/data/mobile-de/taxonomy-snapshot.json`), not live API calls.

