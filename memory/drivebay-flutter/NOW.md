# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-112** `8ca0152` — remaining-time UX + block
re-promote.

Ticket: https://drivebayme.atlassian.net/browse/KAN-112

## Current state

- On `origin/main` as `8ca0152`.
- Seller cards use `can_promote` / `active_promotion`.
- Paddle checkout URL appends `mobile=1` for close-tab message.
- Needs drivebay `2e4248e` on API (migrate).

## Exact next action

1. After API deploy, hot-restart app; QA days left + cannot re-promote + close tab.

## Verification

- Analyze clean on touched seller files before push.
