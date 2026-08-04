# drivebay — Current handoff

## Goal

Latest (2026-08-04): **Featured badge clarity** on web listing cards
(**local, uncommitted**). Prior: KAN-112 `2e4248e`.

## Current state

- `PromotionBadges.vue`: short **Featured** / **Istaknuto** label, collapse
  featured_* codes, star icon + stronger pill (ring/shadow)
- `ListingCard.vue` row variant: badges on image overlay (parity with grid)
- Lang: `promotions.featured_badge` EN/SR

## Exact next action

1. Ask user to commit/push `apps/drivebay` with Flutter pair
2. Deploy Vite assets with API/web

## Verification

- Visual QA on web search grid + row + listing detail badges
