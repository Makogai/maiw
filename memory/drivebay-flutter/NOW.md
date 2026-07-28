# drivebay-flutter — Current handoff

## Goal

Brand packs + prior KAN-44 snappiness work are local; commit/push when ready.

## Current state

- App HEAD was **`ba9f5fa`**; **uncommitted**:
  - **Brand packs:** `lib/brand/brand.dart` (`BRAND` dart-define), assets under
    `assets/brands/{drivebay,autoklik}/`, Android flavors `drivebay`/`autoklik`,
    palette + logo + `MaterialApp.title` from `Brand.current`
  - Docs: `docs/development/branding.md`; helper `tool/run_brand.ps1`
  - Run: `flutter run --flavor autoklik --dart-define=BRAND=autoklik`
  - **Also still uncommitted:** KAN-44 snappiness WIP (images/SWR/search isolation)
- iOS display name / launcher icon PNG not auto-switched yet (documented)

## Exact next action

Want me to commit and push `apps/drivebay-flutter` (brand packs alone, or with KAN-44)?
Device-check AutoKlik flavor build.
