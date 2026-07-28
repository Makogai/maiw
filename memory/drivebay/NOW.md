# drivebay — Current handoff

## Goal
Carry forward shipped KAN-51 listing share-preview work on backend app HEAD `ab783c7`, while
preserving shipped KAN-23 saved-search notification routing and KAN-35 buyer viewing reschedule
behavior.

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
- KAN-51 Done `ab783c7` —
  listing pages now point `og:image` / `twitter:image` to a generated `1200x630` share card at
  `/og/listings/{publicId}.jpg?v={fingerprint}`. `ListingOgImageService` composes the "second
  variant" layout: cover image on top, solid light footer, bold title/price/location, and caches
  the rendered JPG under `storage/app/public/og/listings/`. `ListingOgImageController` serves the
  cached file, `SeoHead.vue` now emits the corrected `og:image:width=1200`,
  `og:image:height=630`, `og:image:alt`, `twitter:title`, and `twitter:description`. Follow-up
  commit `7f8c7ed` bundled Roboto TTFs under `resources/fonts/` so OG rendering no longer depends
  on container OS fonts, and mirrored the listing `seo` payload into the initial Blade response
  for marketplace + storefront listing pages so crawlers can read real OG/Twitter tags even when
  Inertia SSR is unavailable. Follow-up commits `09ed5bc`, `51e75a0`, and `ab783c7` refine the
  live card layout against real dealer photos by switching `EUR` to `€`, moving the title to
  manual line breaks, adding year + mileage footer stats, re-centering the crop, compressing the
  footer, and then adding subtle separators plus a derived engine label in the metadata row.
  Focused coverage passed in `tests/Feature/ListingOgImageTest.php`.
  `docs/og-preview-mock.html` remains as the visual mock source file in the app repo.
- Prior: KAN-7/8/9/41 Done

App HEAD: `ab783c7`

## Exact next action
Re-check a real dev listing URL over raw HTTP (or in a social-card debugger) after Coolify
redeploys to confirm the first HTML response contains `og:*` / `twitter:*` tags and
`/og/listings/{publicId}.jpg` returns `200 image/jpeg`.
