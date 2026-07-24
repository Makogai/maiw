# drivebay-flutter — Current handoff

## Goal

- KAN-32 Phase 3: search `sort=recommendation` UI (depends on drivebay API allow-list).

## Current state

- **KAN-32 Flutter slice done** (pending commit/push):
  - `search_sort_control.dart`: `recommendation` in `searchSortValues` (after freshness);
    label via `sortRecommendation`
  - l10n en: "Recommended"; sr: "Preporučeno" (`app_{en,sr}.arb` + generated locals)
  - `SearchRepository` already sends generic `sort` query param — no repo change
- Prior KAN-31 For you rail still pending same human commit/push.
- Prior deep-learning / bug-hunt findings still valid (KAN-26 etc.).

## Exact next action

1. Human commit/push flutter + verify Attribution off (with sibling drivebay KAN-32).
2. Optional on-device: pick Recommended sort → results reorder; guest/authed both OK
   (sort is global score, not personalized candidates).

## Decisions made this session

- Place Recommended immediately after Newest in the sort menu (not after popularity).
- Match web copy: Recommended / Preporučeno.

## Changed files

- `lib/features/search/search_sort_control.dart`
- `lib/l10n/app_{en,sr}.arb` + `app_localizations*.dart`
- `memory/drivebay-flutter/NOW.md`, `topics/features-discovery.md`

## Verification

- Static implementation only; `dart`/`flutter` not on PATH here.
- Backend `ApiSearchTest` green (9) in sibling app including `sort=recommendation`.

## Blockers and unknowns

- None blocking. Device QA of Recommended sort still open.
