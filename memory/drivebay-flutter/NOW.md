# drivebay-flutter — Current handoff

## Goal

Ship listing detail UX redesign (local) and unblock Play Beta uploads (**Jira: KAN-72**).

## Current state

- App remote HEAD still **`6508d5b`** on `main` / `preprd` / `prod`.
- Local uncommitted listing detail redesign matching design refs:
  - **Hero gallery**: title + price + price type overlaid on image (gradient),
    photo `1/N` badge; taller 5:4 crop
  - **Year | mileage** meta row under the hero (first-ref strip)
  - **Favorite** in app bar next to compare (removed from bottom pill)
  - **Vehicle details** 3×2 divider grid (no separate cards)
  - Floating pill bottom bar: Schedule viewing | Contact only
- Play JSON secret is valid; Fastlane authenticated and reached upload.
- Latest CI failure: `Version code 2 has already been used` on Play track `beta`.
- Local (uncommitted) bump: `pubspec.yaml` → `1.0.0+3` (versionName 1.0.0, versionCode 3).

## Exact next action

1. Hot restart and QA listing detail hero + favorite + Contact pill; commit when asked.
2. Commit + push `pubspec.yaml` version bump to `main`, then update `preprd`.
3. Re-run **Play Beta** on `preprd`; mark **KAN-72** Done after first successful upload.

## Decisions made

- Price / title live on the hero image only — not duplicated below or in the sticky bar.
- Favorite sits in the app bar beside compare so Contact gets the bottom pill space.
- Specs = one section with dividers instead of six heavy tiles.
- Prefer raw JSON for `PLAY_STORE_JSON_BASE64`. `(**Jira: KAN-72**)`
- Each Play upload needs a monotonically increasing Android `versionCode` (`+N` in pubspec).

## Changed files (local)

- `lib/features/listings/listing_detail_screen.dart`
- `lib/features/listings/widgets/listing_gallery_carousel.dart`
- `lib/features/listings/widgets/listing_key_specs.dart`
- `pubspec.yaml` (`1.0.0+3` pending)

## Verification

- `dart analyze` on touched listing files (pre-existing unused `_openReportListing` /
  underscore infos only)
- CI log: supply authenticated; failure only on duplicate versionCode 2.
