# drivebay-flutter — Current handoff

## Goal

Ship listing detail UX redesign (local) and unblock Play Beta uploads (**Jira: KAN-72**).

## Current state

- App remote HEAD still **`6508d5b`** on `main` / `preprd` / `prod`.
- Local uncommitted listing detail redesign matching design refs:
  - **Full-bleed hero**: no AppBar; image edge-to-edge under status bar;
    circular back / favorite / compare / share overlays on the image
  - Title + price + price type overlaid on hero; photo `1/N` badge
  - No year/mileage strip between hero and **Vehicle details**
  - **Vehicle details** 3×2 divider grid
  - Floating bottom actions: separate Schedule + Contact buttons (56px, radius 16)
    instead of fused half-pill
  - Hero height ~56% of screen (taller full-bleed)
- Play JSON secret is valid; Fastlane authenticated and reached upload.
- Latest CI failure: `Version code 2 has already been used` on Play track `beta`.
- Local (uncommitted) bump: `pubspec.yaml` → `1.0.0+3` (versionName 1.0.0, versionCode 3).

## Exact next action

1. Hot restart and QA full-bleed listing hero; commit when asked.
2. Commit + push `pubspec.yaml` version bump to `main`, then update `preprd`.
3. Re-run **Play Beta** on `preprd`; mark **KAN-72** Done after first successful upload.

## Decisions made

- No listing AppBar header — immersive full-bleed gallery with floating controls.
- Price / title live on the hero image only.
- Favorite / compare / share are circular overlays (not bottom bar).
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
