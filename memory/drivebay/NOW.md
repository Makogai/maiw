# drivebay — Current handoff

## Goal
Carry forward local KAN-35 backend work for buyer viewing reschedule without falsely claiming it is committed.

## Current state
- KAN-10 Done `c0eb9bd`
- KAN-11 Done (TTL + prompt/model cache bust on FuelEconomy AI estimates)
- KAN-12 Done `bbaa5b6` — removed dead `ListingUpdated` event + dispatches from `ListingService` and `ListingModerationService`
- KAN-13 Done `cd53e3e` — regenerated `docs/api/v1/openapi.json` via `composer run api:docs`; filled module-doc gaps (account locale, featured-listings, experiments, notifications unread helpers, messaging typing/report, seller show + request-photo-review); split mute PUT+POST for Scramble
- KAN-14 Done `15ce16c` — `docs/development/docker-setup.md` documents postgres:16 on 5432 (not MySQL/MariaDB)
- KAN-15 Done `e7b9d36` — `CLAUDE.md` + `system-overview.md` Stripe + fake only (no PayPal claimed)
- KAN-17 Done `734ba07` — clarified `EmailCampaign`/`EmailCampaignRecipient`/`NotificationTemplate` are live via `RecommendationDigestService` (not dead stubs); removed empty `ListingPerformanceDaily`/`SellerPerformanceDaily` models + migration `2026_07_28_091500_drop_unused_performance_daily_tables.php`; updated `docs/database/migration_plan.md`; left `PageEvent` empty model (table still in schema / FKs)
- KAN-35 Local only, uncommitted in `apps/drivebay` — buyer reschedule for viewing appointments is implemented in the working tree: `POST /api/v1/viewing/appointments/{appointment}/reschedule`, `BuyerViewingApiController::reschedule()`, buyer-only `ViewingAppointmentPolicy::reschedule()`, in-place `ViewingAppointmentService::reschedule()` with slot revalidation + reminder reset + presenter `can_reschedule`, `ViewingNotificationService` `viewing.rescheduled` notifications, EN/SR translations, and backend coverage in `tests/Feature/ApiViewingTest.php` + `tests/Feature/ViewingSchedulingTest.php`. Verified locally with `php artisan test tests/Feature/ApiViewingTest.php tests/Feature/ViewingSchedulingTest.php` passing.
- Prior: KAN-7/8/9/41 Done

App HEAD: `734ba07`

## Exact next action
Commit the KAN-35 working-tree changes in `apps/drivebay` when ready, then refresh wrapper memory `sourceCommit` from the new app HEAD. Until then, treat KAN-35 reschedule behavior as local-only and not present at committed HEAD `734ba07`.
