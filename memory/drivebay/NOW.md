# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** promote duration 1/3/7 + success dialog —
local (uncommitted) atop `03f3bbc`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Catalog: home €3/€5/€7, social €4/€6/€8; nested Paddle price IDs.
- `duration_days` on `invoice_items`; activate uses it.
- Promote API requires `duration_days`; types expose `durations[]`.
- Web: duration chips + `PromotionSuccessDialog` from flash.
- Pest: Paddle + DealerPromotionCheckout → 17 passed.

## Exact next action

1. Commit/push drivebay + flutter; deploy + migrate + re-seed promotion types.
2. QA web + phone: pick 1/3/7 → pay → success popup with days.

## Verification

- Feature tests green locally.
