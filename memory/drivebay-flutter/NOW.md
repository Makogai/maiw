# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-112** promotion remaining-time UX (local,
uncommitted) on top of KAN-111 `c5ec8dc`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-112

## Current state

- Seller cards use `can_promote` / `active_promotion`; hide Promote when live.
- Paddle checkout URL appends `mobile=1` for close-tab message on web page.
- l10n: remaining days / until / permanent badge.

## Exact next action

1. Commit + push after API is deployed (or together).
2. Hot-restart app; QA: cannot re-promote; see days left; close-tab after pay.

## Verification

- `dart analyze` clean on touched seller listing files; gen-l10n + freezed
  regenerated for `listing_card`.
