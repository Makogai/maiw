# drivebay-flutter — Current handoff

## Goal

Seller card matches mock + consistent storefront policies across ads.

## Current state

- Local HEAD **`0bc1b3a`**.
- Seller card fix (this session):
  - Shows **active listings count** under member since
  - Feature pills from **seller.allows_*** (storefront), not listing flags —
    same dealer → same chips on every ad
  - Pills stacked in a **column** (full-width soft rows)
  - Model parses `allows_test_drive` / `allows_mechanic_visit` on seller
  - Viewing options: listing flags, else seller storefront; also column layout
- Also local: KAN-81 storefront widgets, multi-contact parse

## Exact next action

1. Hot **restart**; open two ads from the same dealer — chips + ads count
   should match.
2. Ask commit/push when QA ok.

## Decisions made

- Seller card = storefront identity (offers test drive as dealer capability)
- Viewing options = this vehicle (listing override, storefront fallback)
- Soft column chips, not Wrap/row

## Verification

- `build_runner` regenerated `listing_seller` with policy fields
