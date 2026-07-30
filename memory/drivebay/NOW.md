# drivebay — Current handoff

## Goal

Ship **KAN-73** (dealer logo as profile image + required test-drive /
mechanic-visit policies) across web + Flutter.

## Current state

- **KAN-74/75/78/76** in `apps/drivebay` working tree (not committed), on top of
  `cace2cb` (KAN-57).
- **Backfill:** existing listings keep flags NULL; Store/Update require explicit
  Yes/No. Dealer defaults nullable. Profile image = existing `logo_media_id`
  (no new column). Private sellers: listing-level only; default avatar.
- Schema/API/wizard/storefront/public chips + EN/SR + Pest
  (`ViewingPolicyFlagsTest`, 7 green with body-style tests).
- **KAN-77** implemented in `apps/drivebay-flutter` working tree (not committed):
  listing detail chips + nullable JSON fields; logo already on seller card.

## Exact next action

1. Ask user: commit/push `apps/drivebay` and `apps/drivebay-flutter`?
2. Deploy/migrate; QA create listing Yes/No + public chips + Flutter detail.
3. Mark KAN-74..78 + epic KAN-73 Done after verify.
