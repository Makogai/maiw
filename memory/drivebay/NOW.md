# drivebay — Current handoff

## Goal

- KAN-29 recommendations end-to-end. Phase 1 (**KAN-30**) data plane done.
  Phase 2 For you (**KAN-31**) done. Phase 3 search sort (**KAN-32**) done in code.

## Current state

- **KAN-32 done in code** (pending commit/push):
  - `SearchFilterQueryRules` allows `sort=recommendation`.
  - `SearchService::resolveSortStack()` already maps to `sort_recommendation_score`
    (KAN-30 writer) — no new scoring.
  - Pest: `ApiSearchTest` accepts `sort=recommendation` (200) and rejects unknown sort (422).
  - Docs: `docs/api/modules/search.md`, `recommendations.md`, `openapi.json` sort enums.
  - Web: Search `<select>` + en/sr `sort_recommended` (trivial).
  - Confluence DM/3440642 updated for KAN-32 / KAN-25 closed gap.
- Flutter sibling: Recommended sort chip + l10n (see `memory/drivebay-flutter/NOW.md`).
- Epic **KAN-29** In Progress; next child likely **KAN-33** (email digests) unless
  product picks another slice.

## Exact next action

1. Commit + push drivebay and drivebay-flutter KAN-31+KAN-32 changes (human; attribution off).
2. Transition **KAN-32** (and close/link **KAN-25**) via main session Jira tools.
3. Optional: on-device verify Flutter Recommended sort; confirm Meilisearch has scores.

## Decisions made this session

- Web sort option included because it was one `<option>` + lang keys (trivial).
- No new scorer / no schema change — reuse KAN-30 `sort_recommendation_score`.

## Changed files

- `SearchFilterQueryRules.php`, `ApiSearchTest.php`
- `docs/api/modules/{search,recommendations}.md`, `docs/api/v1/openapi.json`
- `resources/js/Pages/Search/Index.vue`, `lang/{en,sr}/marketplace.php`
- Flutter: `search_sort_control.dart`, l10n arb + generated
- `memory/drivebay/*`, `memory/drivebay-flutter/*`

## Verification

- `php artisan test --compact tests/Feature/Api/V1/ApiSearchTest.php` → 9 passed
- `vendor/bin/pint --dirty` → pass
- Flutter: static only (`dart` not on PATH)

## Blockers and unknowns

- None for KAN-32 code. Ranking quality depends on nightly/rebuild scores being present
  in Meilisearch (KAN-30 data plane).
