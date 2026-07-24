# drivebay — Current handoff

## Goal

- KAN-29 recommendations end-to-end. Phase 1 (**KAN-30**) data plane done.
  Phase 2 For you (**KAN-31**) implemented in drivebay + drivebay-flutter.

## Current state

- **KAN-31 done in code** (pending commit/push):
  - API: `GET /recommendations` uses `sanctum.optional`; guests → trending;
    authed → candidates ordered by rank, empty → legacy fallback (no 500).
  - Pest: `tests/Feature/Recommendation/RecommendationApiTest.php` (3 cases).
  - Docs: `docs/api/modules/recommendations.md` updated.
  - Flutter: `getRecommendations`, `recommendationsProvider` (watches auth),
    For you rail on `SearchScreen` via parameterized `FeaturedListingsCarousel`,
    l10n en/sr, pull-to-refresh invalidate.
- Epic **KAN-29** In Progress; next child **KAN-32** (`sort=recommendation`).
- Investigation / score map:
  https://drivebayme.atlassian.net/wiki/spaces/DM/pages/3440642/Search+sorting+ranking+scores

## Exact next action

1. Commit + push drivebay and drivebay-flutter KAN-31 changes (human; attribution off).
2. Start **KAN-32** (expose `sort=recommendation` on API + Flutter search sort) when ready.
3. Optional: verify For you rail on device with rebuilt candidates.

## Decisions made this session

- No response `meta.mode` on recommendations — keep `{data}` envelope only.
- Skipped optional web homepage rail (non-trivial / out of Phase 2 mobile focus).
- Parameterized featured carousel with title/subtitle rather than duplicating card UI.

## Changed files

- `apps/drivebay`: route middleware, RecommendationApiTest, recommendations.md
- `apps/drivebay-flutter`: listing_repository, providers, search_screen,
  featured_listings_carousel, l10n arb + generated
- `memory/drivebay/*`, `memory/drivebay-flutter/*`

## Verification

- `php artisan test --compact tests/Feature/Recommendation` → 9 passed
- `vendor/bin/pint --dirty` on RecommendationApiTest
- `dart analyze` not available on this PATH (skipped)

## Blockers and unknowns

- None for KAN-31 code. Runtime device check of For you rail not done.
