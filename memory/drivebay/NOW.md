# drivebay — Current handoff

## Goal
Backend bug/hygiene queue after KAN-11.

## Current state
- KAN-10 Done `c0eb9bd`
- KAN-11 Done (TTL + prompt/model cache bust on FuelEconomy AI estimates)
- KAN-12 Done `bbaa5b6` — removed dead `ListingUpdated` event + dispatches from `ListingService` and `ListingModerationService`
- KAN-13 Done `cd53e3e` — regenerated `docs/api/v1/openapi.json` via `composer run api:docs`; filled module-doc gaps (account locale, featured-listings, experiments, notifications unread helpers, messaging typing/report, seller show + request-photo-review); split mute PUT+POST for Scramble
- KAN-14 Done `15ce16c` — `docs/development/docker-setup.md` documents postgres:16 on 5432 (not MySQL/MariaDB)
- KAN-15 Done `e7b9d36` — `CLAUDE.md` + `system-overview.md` Stripe + fake only (no PayPal claimed)
- KAN-17 Done `734ba07` — clarified `EmailCampaign`/`EmailCampaignRecipient`/`NotificationTemplate` are live via `RecommendationDigestService` (not dead stubs); removed empty `ListingPerformanceDaily`/`SellerPerformanceDaily` models + migration `2026_07_28_091500_drop_unused_performance_daily_tables.php`; updated `docs/database/migration_plan.md`; left `PageEvent` empty model (table still in schema / FKs)
- Prior: KAN-7/8/9/41 Done

App HEAD: `734ba07`

## Exact next action
Pick next hygiene ticket from Jira backlog. Remaining analytics stub: `PageEvent` (empty model, `page_events` table + FKs, no writers) — see `topics/domains-growth.md`.
