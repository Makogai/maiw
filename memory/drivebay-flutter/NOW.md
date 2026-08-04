# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** in-app Paddle promote checkout (WebView +
Sanctum sync) — local, awaiting push. Still depends on drivebay API
`POST /billing/paddle/complete`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Redirect/Paddle promote opens `PaddleCheckoutScreen` (WebView), not external browser.
- On `DriveBayNative` `paddle_completed` (or “I've paid”), calls
  `BillingRepository.completePaddleCheckout`.
- Added `webview_flutter`. Fake in-app confirm path unchanged.

## Exact next action

1. Push after drivebay API is on **dev**; rebuild/install app.
2. QA: Promote featured → pay in WebView → listings refresh with promo active.

## Verification

- `flutter analyze` on touched seller/billing files → only pre-existing infos.
