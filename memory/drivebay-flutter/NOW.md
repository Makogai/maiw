# drivebay-flutter — Current handoff

## Goal

Catch up memory after shipping remaining local WIP on `8299084`.

## Current state

- App HEAD is **`8299084`** on `main` (pushed).
- Recent commits:
  - `770fd91` — **KAN-70** listing compare (Done)
  - `1358d6f` — **KAN-61** edit profile name fields (Done)
  - `ecc0637` — chat composer border + notification badge position
  - `8299084` — branding run docs + default API `dev.drivebay.me`
- Only leftover dirty: `macos/Flutter/GeneratedPluginRegistrant.swift` (line endings).

## Exact next action

1. Pick next ticket from KAN / backlog, or discard macos line-ending noise.
2. Keep using `--flavor … --dart-define=BRAND=…` for runs.

## Decisions made

- Edit profile v1 = name fields only; contact prefs stay separate. `(**Jira: KAN-61**)`
- Compare entry = app-bar icon; strip hidden on `/compare`. `(**Jira: KAN-70**)`

## Verification

- Pushed to `origin/main`
- KAN-61 / KAN-70 → Done
