# drivebay — Current handoff

## Goal

Pick next KAN backlog item after **KAN-27** Done.

## Current state

- App HEAD is **`1729d6d`** (pushed): `assetlinks.json` fingerprints fixed for
  Android App Links (debug SHAs, no malformed placeholder) + README.
- **KAN-27 Done**: Android deep links on `dev.drivebay.me` verified on device;
  Coolify should pick up `1729d6d` so live DAL stops returning
  `ERROR_CODE_MALFORMED_CONTENT`.
- iOS AASA Team ID still placeholder (deferred).
- Left untracked intentionally: `docs/og-preview-mock.html`.

## Exact next action

Pick next To Do from the KAN board. After Coolify deploy, optional:
`adb shell pm verify-app-links --re-verify me.makogai.drivebay`.
