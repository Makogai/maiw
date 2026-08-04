# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** `557517f` — Paddle promote via in-app
browser + resume / “I've paid” Sanctum sync (WebView removed).

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Promote opens Custom Tabs / SFSafariViewController to checkout URL.
- Completes via `POST /billing/paddle/complete` on resume or “I've paid”.
- QA confirmed working on phone.

## Exact next action

1. Optional: mark KAN-111 Done after web + mobile acceptance checklist.
2. Keep webhook destination configured on Paddle.

## Verification

- Device QA: promote → pay → listing featured.
