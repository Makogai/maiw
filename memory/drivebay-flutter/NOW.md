# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-03): **KAN-104** multi make/model search filters pushed to `main`
@ `d8fdae0`. Uses default `API_BASE_URL` (`https://dev.drivebay.me/api/v1`) — needs
matching drivebay API `d0c6571` deployed. Prior: moderation mode merge `8d655f2`.

## Current state

- **KAN-104 (shipped `d8fdae0`)**:
  - `SearchFilters.makeIds` / `modelIds`; query `make_ids` / `model_ids`
  - `AppSearchableMultiSelectField` (Save confirms; selection commits on dismiss)
  - Dio `ListFormat.multiCompatible` → `make_ids[]=…` for Laravel
  - Models = union across selected makes; orphan model ids pruned
- **KAN-100/101** moderation mode on `main` via `8d655f2`.
- Translation audit @ `7a85f48` (needs API KAN-103 for warning title locale).

## Exact next action

1. After API deploy of drivebay `d0c6571`, hot-restart / rebuild phone on normal URL
   and QA multi make → Apply filters.
2. Move KAN-104 to In Review / Done after QA.

## Decisions made

- Default API URL unchanged; no LAN override required once API is deployed.
- Picker button is Save (not Apply filters) to avoid confusing with the outer sheet.

## Verification

- `flutter analyze` on touched search/api files: only pre-existing `http_parser` info.
