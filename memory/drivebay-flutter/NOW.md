# drivebay-flutter — Current handoff

## Goal

Polish listing detail UX (key specs + bottom action bar) on app HEAD `6508d5b`.

## Current state

- App HEAD is **`6508d5b`** on `main` / `preprd` / `prod` (pushed).
- Local uncommitted listing detail polish:
  - Key specs: single bordered panel, 2-col cells with icon + label/value
  - Bottom buyer bar: price removed; compact favorite + contact (+ viewing)
- Play automation still active (`preprd` → beta, `prod` → production draft).
  Prefer raw JSON in `PLAY_STORE_JSON_BASE64` (KAN-72).

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
