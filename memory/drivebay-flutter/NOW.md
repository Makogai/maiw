# drivebay-flutter — Current handoff

## Goal

Fix **KAN-98** seller ↔ listing infinite navigation loop.

## Current state

- Local HEAD was **`d371589`**; uncommitted fix for KAN-98.
- **KAN-98** (In Progress): `pushOrPopTo` pops by match-list index (not `uri.path` —
  GoRouter `uri` ignores pushed routes and was draining back to search).
  - `lib/utils/go_router_nav.dart`
  - `lib/features/listings/widgets/listing_seller_card.dart`

## Exact next action

1. Hot restart; dealer profile → listing → seller card should return to the same profile (not stack another).
2. Ask commit/push when QA ok; mark KAN-98 Done.

## Decisions made

- Pop-to-existing over hiding the seller card chevron — still discoverable, correct back stack.

## Verification

- `dart analyze` clean on touched files.
