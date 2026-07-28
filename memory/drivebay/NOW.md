# drivebay — Current handoff

## Goal

Finish **KAN-27** Android App Links on `dev.drivebay.me` (no Play Store), then
pick next KAN backlog item.

## Current state

- App HEAD is still **`2fb7f12`** on `origin/main`; **uncommitted** local fix for
  KAN-27: `public/.well-known/assetlinks.json` + README.
- Live `dev` still serves the broken file (placeholder
  `REPLACE_WITH_RELEASE_SHA256_FINGERPRINT` → Google DAL
  `ERROR_CODE_MALFORMED_CONTENT`; missing this machine’s debug SHA
  `09:52:E8:…:56:00` that signs the phone APK).
- Local fix: removed placeholder; fingerprints =
  `09:52:E8:…` (current debug) + `50:37:FB:…` (older debug).
- On connected Android device: domains shell-`approved` + user selection
  Enabled; cold `https://dev.drivebay.me/listings/…` opens
  `me.makogai.drivebay/.MainActivity` (verified via dumpsys).
- iOS AASA Team ID still `REPLACE_WITH_APPLE_TEAM_ID` (deferred; Android-only).
- Left untracked intentionally: `docs/og-preview-mock.html`.

## Exact next action

1. Commit + push `apps/drivebay` `.well-known` fix so Coolify updates `dev`.
2. `adb shell pm verify-app-links --re-verify me.makogai.drivebay` → expect
   `dev.drivebay.me: verified` (not just approved).
3. Confirm Google DAL list API has no `ERROR_CODE_MALFORMED_CONTENT`.
