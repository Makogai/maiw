# drivebay — Current handoff

## Goal
Carry forward shipped KAN-23 saved-search notification routing fixes at backend app HEAD
`8e99c98`, while preserving shipped KAN-35 buyer viewing reschedule behavior.

## Current state
- KAN-10 Done `c0eb9bd`
- KAN-11 Done (TTL + prompt/model cache bust on FuelEconomy AI estimates)
- KAN-12 Done `bbaa5b6` — removed dead `ListingUpdated` event + dispatches from `ListingService` and `ListingModerationService`
- KAN-13 Done `cd53e3e` — regenerated `docs/api/v1/openapi.json` via `composer run api:docs`; filled module-doc gaps (account locale, featured-listings, experiments, notifications unread helpers, messaging typing/report, seller show + request-photo-review); split mute PUT+POST for Scramble
- KAN-14 Done `15ce16c` — `docs/development/docker-setup.md` documents postgres:16 on 5432 (not MySQL/MariaDB)
- KAN-15 Done `e7b9d36` — `CLAUDE.md` + `system-overview.md` Stripe + fake only (no PayPal claimed)
- KAN-17 Done `734ba07` — clarified `EmailCampaign`/`EmailCampaignRecipient`/`NotificationTemplate` are live via `RecommendationDigestService` (not dead stubs); removed empty `ListingPerformanceDaily`/`SellerPerformanceDaily` models + migration `2026_07_28_091500_drop_unused_performance_daily_tables.php`; updated `docs/database/migration_plan.md`; left `PageEvent` empty model (table still in schema / FKs)
- KAN-23 investigation corrected a stale ticket description: mobile saved-search CRUD already exists
  in Flutter (`c74fbe6`), but backend notifications still needed route cleanup.
- KAN-23 Done `8e99c98`:
  - `SellerNotificationPresenter` now gives `saved_search.match` a real mobile route:
    `/account/saved-searches`;
  - `NotificationObserver` now forwards the presented `mobile_route` into queued push payload data,
    so saved-search alerts keep their route even without raw metadata;
  - `AdminPushTestService` now defaults saved-search test pushes to `/account/saved-searches`;
  - focused tests cover both the presented route and the queued push payload route.
- KAN-35 Done `727abc9` — buyer viewing appointments now support committed in-place reschedule via `POST /api/v1/viewing/appointments/{appointment}/reschedule`, handled by `BuyerViewingApiController::reschedule()` behind a buyer-only `ViewingAppointmentPolicy::reschedule()`. `ViewingAppointmentService::reschedule()` re-validates the replacement slot before and inside the transaction, resets reminder history so the day-before reminder can re-fire, returns presenter payloads with `can_reschedule`, and `ViewingNotificationService` emits `viewing.rescheduled` notifications. Backend coverage passed in `tests/Feature/ApiViewingTest.php` and `tests/Feature/ViewingSchedulingTest.php`.
- Prior: KAN-7/8/9/41 Done

App HEAD: `727abc9`

## Exact next action
If saved-search alerts still fail to arrive end-to-end after this route fix, investigate the
hourly `search:send-saved-search-alerts` scheduler semantics and matching logic next.
