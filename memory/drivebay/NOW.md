# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-112** promotion UX (local, uncommitted) on top of
KAN-111 `188a3f6`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-112

## Current state

- Block re-promote while active; seller cards expose `can_promote` +
  `active_promotion` (remaining days / ends_at).
- Hourly `ExpireListingPromotionsJob`; nullable `ends_at` = admin permanent.
- In-app + email `listing.promoted` on activate.
- Paddle overlay closed before redirect; `?mobile=1` close-tab copy.
- Taxonomy SVGs for `featured_home` / `featured_social`.

## Exact next action

1. Commit + push drivebay when ready; migrate
   `make_listing_promotions_ends_at_nullable` on **dev**.
2. Rebuild Vite; QA seller list remaining-time + no double-promote + overlay.
3. Pair with Flutter KAN-112 changes.

## Verification

- `php artisan test --compact tests/Feature/Promotion/` — lifecycle + dealer
  suites green locally.
