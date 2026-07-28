# drivebay — Current handoff

## Goal

Pick next KAN backlog item after **KAN-27** Done (Android deep links on
`dev.drivebay.me`).

## Current state

- App HEAD is still **`2fb7f12`** on `origin/main`.
- **KAN-27 Done**: Android App Links work on device for `dev.drivebay.me`
  (cold https → MainActivity). Flutter hosts + `DeepLinkService` already shipped.
- **Uncommitted local follow-up** (recommended before next install/re-verify):
  `public/.well-known/assetlinks.json` + README — remove placeholder, add debug
  SHA `09:52:E8:…`. Live `dev` still has malformed placeholder until pushed.
- iOS AASA Team ID still placeholder (out of Android scope).
- Left untracked intentionally: `docs/og-preview-mock.html`.

## Exact next action

Pick next To Do from the KAN board. Optionally commit/push `.well-known` so
Coolify autoVerify works without shell approve.
