# drivebay-flutter — Current handoff

## Goal

**KAN-98** seller ↔ listing nav loop — shipped.

## Current state

- Local/remote HEAD **`9325bbf`**.
- **KAN-98** Done: `pushOrPopTo` in `lib/utils/go_router_nav.dart`;
  `ListingSellerCard` pops to existing `/dealers/:slug` or `/sellers/:id` by
  match-list index (GoRouter `uri` ignores pushed routes).

## Exact next action

None for KAN-98. Smoke other dealer flows if needed.

## Decisions made

- Pop-by-match-index over hiding seller chevron or using `uri.path`.

## Verification

- User QA: listing → dealer → listing → seller card returns to same dealer.
- `dart analyze` clean on touched files.
