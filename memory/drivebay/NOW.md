# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-112** `2e4248e` — promotion expiry, block
re-promote, notify/email, post-pay UX.

Ticket: https://drivebayme.atlassian.net/browse/KAN-112

## Current state

- On `origin/main` as `2e4248e`.
- Block re-promote; `can_promote` + `active_promotion` on seller cards.
- Hourly `ExpireListingPromotionsJob`; nullable `ends_at` for admin permanent.
- `listing.promoted` in-app + email; Paddle overlay close + `?mobile=1` copy.
- Taxonomy SVGs for featured_home / featured_social.

## Exact next action

1. Deploy **dev**: migrate `make_listing_promotions_ends_at_nullable` + Vite build.
2. Pair with Flutter `8ca0152`; QA remaining-time + no double-promote + overlay.

## Verification

- Pest `tests/Feature/Promotion/` green before push.
