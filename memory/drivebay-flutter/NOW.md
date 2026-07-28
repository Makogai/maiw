# drivebay-flutter — Current handoff

## Goal

Finish **KAN-27** Android App Links testing against `dev.drivebay.me` (client already
has hosts + `DeepLinkService`; blocked on backend `assetlinks.json` deploy).

## Current state

- App HEAD is **`ba9f5fa`**.
- **KAN-56 Done**: forgot/reset/change-password + deep links.
- **KAN-27**: Flutter hosts/`DeepLinkService` already in place. Device testing
  (2026-07-28): phone APK signed `09:52:E8:…:56:00`; cold
  `https://dev.drivebay.me/listings/…` opens MainActivity after shell domain
  approve + user selection. AutoVerify still needs fixed `assetlinks.json`
  deployed on drivebay (see `memory/drivebay/NOW.md`).

## Exact next action

After drivebay `.well-known` is pushed to `dev`: re-verify App Links on device
(`pm verify-app-links --re-verify me.makogai.drivebay`) and confirm
`dev.drivebay.me: verified`.
