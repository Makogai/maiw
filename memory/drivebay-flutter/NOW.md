# drivebay-flutter — Current handoff

## Goal

- KAN-31 Phase 2 For you feed on browse/search (depends on drivebay
  `GET /recommendations` + `sanctum.optional`).

## Current state

- **KAN-31 Flutter slice done** (pending commit/push):
  - `ListingRepository.getRecommendations` → `GET /recommendations`
  - `recommendationsProvider` autoDispose, watches `authNotifierProvider`
  - For you horizontal rail on `SearchScreen` (above featured when both show);
    reuses `FeaturedListingsCarousel` with title/subtitle/`mutedBackground`
  - l10n: `forYouListingsTitle` / `forYouListingsSubtitle` (en + sr)
  - Pull-to-refresh invalidates recommendations (errors swallowed so search isn’t blocked)
- Prior deep-learning / bug-hunt findings still valid (KAN-26 etc.).

## Exact next action

1. Human commit/push flutter + verify Attribution off.
2. Optional on-device: login with candidates → For you ordered; guest → trending;
   empty candidates → legacy list or empty section without crash.
3. Later: KAN-32 search `sort=recommendation` UI.

## Decisions made this session

- Shared carousel widget parameterized vs new duplicate rail widget.
- Hide For you on empty/error; do not gate featured experiment flag for For you.

## Changed files

- `lib/repositories/listing_repository.dart`, `lib/providers/providers.dart`,
  `lib/features/search/search_screen.dart`,
  `lib/features/search/featured_listings_carousel.dart`,
  `lib/l10n/app_{en,sr}.arb` + generated localizations
- `memory/drivebay-flutter/NOW.md`, topics discovery/repos

## Verification

- Static implementation only on Flutter side; `dart` not on PATH here.
- Backend Recommendation feature tests green (9) in sibling app.

## Blockers and unknowns

- None blocking. Device QA of rail still open.
