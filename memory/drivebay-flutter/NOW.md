# drivebay-flutter — Current handoff

## Goal

Finish **KAN-77** (Flutter seller card + viewing-policy badges) and keep Play
beta pipeline green (**KAN-72**).

## Current state

- App remote HEAD **`6508d5b`** on `main` / `preprd` / `prod` (pushed).
- Local uncommitted listing detail redesign:
  - **Full-bleed hero**: no AppBar; edge-to-edge under status bar; circular
    back / favorite / compare / share overlays
  - Title + price + price type on image; photo `1/N` badge; taller ~56% height
  - Equipment: two-column orange checklist (not chips)
  - **Seller card** (KAN-77): flat muted (no gradient); name / location /
    active listings; Verified seller only if verified; rating + reviews on
    right; bottom chips for Highly rated + Allows test drive / mechanic
    inspection when API fields present (nullable; depends on KAN-74)
  - Bottom bar: Schedule viewing | Contact (separate 56px radius-16 buttons)
- Play/beta: versionCode 3 / `d4693dd` notes; local pubspec `1.0.0+3` pending
  if not yet on remote tip.

## Exact next action

1. Hot restart and QA seller card + hero; ask to commit/push `apps/drivebay-flutter`.
2. After KAN-74 API ships, verify policy chips with flags set/null.
3. Mark **KAN-77** Done after verify; close epic **KAN-73** if web also Done.
4. Re-run Play Beta on `preprd` when version bump is pushed; mark **KAN-72** Done.

## Decisions made

- No listing AppBar — immersive full-bleed gallery with floating controls.
- Price / title on hero only; favorite beside compare in overlays.
- Specs = divider grid; equipment = check grid; seller = flat card + chips.
- Prefer raw JSON for `PLAY_STORE_JSON_BASE64`. `(**Jira: KAN-72**)`
- Each Play upload needs monotonically increasing Android `versionCode`.

## Changed files (local)

- `lib/features/listings/listing_detail_screen.dart`
- `lib/features/listings/widgets/listing_gallery_carousel.dart`
- `lib/features/listings/widgets/listing_key_specs.dart`
- `lib/features/listings/widgets/listing_seller_card.dart`
- `lib/models/listing_detail.dart` (+ freezed/g)
- `lib/l10n/app_en.arb` / `app_sr.arb`
- `pubspec.yaml` (`1.0.0+3` pending)

## Verification

- `dart analyze` on touched listing files (pre-existing unused `_openReportListing` /
  underscore infos only)
- CI log: supply authenticated; failure only on duplicate versionCode 2.
