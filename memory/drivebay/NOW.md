# drivebay — Current handoff

## Goal
Carry forward committed KAN-35 backend behavior for buyer viewing reschedule at app HEAD `727abc9`.

## Current state
- KAN-10 Done `c0eb9bd`
- KAN-11 Done (TTL + prompt/model cache bust on FuelEconomy AI estimates)
- KAN-12 Done `bbaa5b6` — removed dead `ListingUpdated` event + dispatches from `ListingService` and `ListingModerationService`
- KAN-13 Done `cd53e3e` — regenerated `docs/api/v1/openapi.json` via `composer run api:docs`; filled module-doc gaps (account locale, featured-listings, experiments, notifications unread helpers, messaging typing/report, seller show + request-photo-review); split mute PUT+POST for Scramble
- KAN-14 Done `15ce16c` — `docs/development/docker-setup.md` documents postgres:16 on 5432 (not MySQL/MariaDB)
- KAN-15 Done `e7b9d36` — `CLAUDE.md` + `system-overview.md` Stripe + fake only (no PayPal claimed)
- KAN-17 Done `734ba07` — clarified `EmailCampaign`/`EmailCampaignRecipient`/`NotificationTemplate` are live via `RecommendationDigestService` (not dead stubs); removed empty `ListingPerformanceDaily`/`SellerPerformanceDaily` models + migration `2026_07_28_091500_drop_unused_performance_daily_tables.php`; updated `docs/database/migration_plan.md`; left `PageEvent` empty model (table still in schema / FKs)
- KAN-35 Done `727abc9` — buyer viewing appointments now support committed in-place reschedule via `POST /api/v1/viewing/appointments/{appointment}/reschedule`, handled by `BuyerViewingApiController::reschedule()` behind a buyer-only `ViewingAppointmentPolicy::reschedule()`. `ViewingAppointmentService::reschedule()` re-validates the replacement slot before and inside the transaction, resets reminder history so the day-before reminder can re-fire, returns presenter payloads with `can_reschedule`, and `ViewingNotificationService` emits `viewing.rescheduled` notifications. Backend coverage passed in `tests/Feature/ApiViewingTest.php` and `tests/Feature/ViewingSchedulingTest.php`.
- Prior: KAN-7/8/9/41 Done

App HEAD: `727abc9`

## Exact next action
If the buyer viewing contract changes again, refresh `memory/drivebay/topics/api-and-database.md` and rerun the focused backend viewing tests so `sourceCommit` can move forward with the shipped reschedule behavior.
