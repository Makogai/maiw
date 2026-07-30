# drivebay — Current handoff

## Goal

Seller card mock parity + storefront-consistent policies; finish **KAN-87**.

## Current state

- Local HEAD **`cace2cb`** (behind origin).
- Seller card fix (this session):
  - API `ListingDetailResource` now returns **full** seller presenter
    (`member_since_year`, `responds_fast`, storefront `allows_*`, ads count)
  - Web `ListingSellerCard` prefers **seller/storefront** policies (not
    per-listing), shows ads count, stacked column chips
  - Pest: seller payload keeps dealer policies even when listing flags differ
- Still dirty: KAN-87 multi-contact, KAN-73, KAN-79 Filament
- Skip `docs/og-preview-mock.html` on commit

## Exact next action

1. Hot reload / browser QA seller card (ads count + same chips on every ad).
2. Ask commit/push when QA ok.

## Decisions made

- Seller card chips = dealer storefront settings (same for every ad).
- Viewing options section = listing flags, fallback to storefront when null.
- Feature chips stacked in a column (full-width soft rows).

## Verification

- `php artisan test --filter="exposes dealer storefront policies"` passed
