# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-104** multi make/model search filters pushed to `main`
@ `d0c6571`. Migration `2026_08_01_160000_add_multi_make_model_to_saved_searches`
runs on deploy. Prior on `main`: moderation API merge `c34cc41`, **KAN-103** locale
@ `4c4d8df`.

## Current state

- **KAN-104 (shipped `d0c6571`)**: search accepts multiple makes and models.
  - API: `SearchQueryDTO::$makeIds`/`$modelIds`; `make_ids[]`/`model_ids[]` + legacy
    singular; `SearchService` DB `whereIn` + Meilisearch `IN […]`
  - Saved searches: migration `filter_make_ids`/`filter_model_ids` JSON + backfill;
    `SearchFilterColumns` read/write arrays
  - Web: `useVehicleSearchForm` arrays; `BrandSelect multiple`; model checkboxes
  - Docs: `docs/api/modules/search.md` + mobile changelog; Pest ApiSearchTest 11 green
  - Flutter counterpart: drivebay-flutter `d8fdae0`

- **KAN-100/101** moderation API on `main` via `c34cc41`.
- **KAN-103** `SetApiLocale` on `main` @ `4c4d8df`.

## Exact next action

1. Confirm deploy of `d0c6571` (auto-migrate) on the API the app hits
   (`dev.drivebay.me` / prod).
2. Phone QA: multi make/model apply on default API URL (no LAN dart-define).
3. Move KAN-104 to In Review / Done after QA.

## Decisions made

- Prefer `make_ids[]` / `model_ids[]`; keep singular params for older clients.
- OR within make list and within model list; other filters unchanged.

## Verification

- `php artisan test --filter=ApiSearchTest`: 11 passed (includes multi make/model +
  saved-search persistence).
