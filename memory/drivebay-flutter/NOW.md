# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** `7b84999` — in-app Paddle WebView promote
checkout + Sanctum sync.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Promote → `PaddleCheckoutScreen` WebView (not external browser).
- Completes via `POST /billing/paddle/complete` after `DriveBayNative` or
  “I've paid”.
- Needs drivebay `3ec3fef` deployed on the API the app points at.

## Exact next action

1. After API deploy, hot-restart / reinstall app on device.
2. QA: My Listings → Promote → pay in WebView → listing featured.

## Verification

- Analyze clean on touched files before push.
