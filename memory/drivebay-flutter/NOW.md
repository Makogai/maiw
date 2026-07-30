# drivebay-flutter — Current handoff

## Goal

Polish listing detail UX (key specs + bottom action bar) on app HEAD `6508d5b`.

## Current state

- App HEAD is **`6508d5b`** on `main` / `preprd` / `prod` (pushed).
- Local uncommitted listing detail polish (matching design refs):
  - Key specs: **Vehicle details** heading + 3×2 divider grid (no cards)
  - Floating pill bottom bar: schedule viewing + contact seller (+ heart)
- Play automation still active; prefer raw JSON in `PLAY_STORE_JSON_BASE64`.

## Exact next action

1. Hot restart and QA listing detail specs + bottom bar; commit when asked.
2. Re-run Play Beta on `preprd` after confirming Play JSON secret; mark KAN-72
   Done after first successful upload.

## Decisions made

- Price stays in the body (hero) only — not duplicated in the sticky bar.
- Specs = one card with dividers instead of six heavy tiles.
- Prefer raw JSON for `PLAY_STORE_JSON_BASE64`. `(**Jira: KAN-72**)`

## Changed files (local)

- `lib/features/listings/widgets/listing_key_specs.dart`
- `lib/features/listings/listing_detail_screen.dart`

## Verification

- `dart analyze` on touched listing files (pre-existing detail infos only)
