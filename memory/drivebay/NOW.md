# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** post-pay fulfill fix — pay succeeded but listing
stayed unfeatured because activation was webhook-only.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Pay overlay works; redirect alone does **not** activate promotions.
- Local fix (uncommitted until push): on Paddle.js `checkout.completed`, POST
  `/billing/paddle-checkout/complete` → API sync → `fulfillPaidPayment()`.
- Webhooks also handle `transaction.paid` (+ 300s signature skew).
- `PaddlePaymentGatewayTest` → 9 passed.

## Exact next action

1. Commit + push `apps/drivebay` main; deploy + rebuild frontend assets on dev.
2. Re-QA: promote → pay → listing shows featured (even without webhook).
3. Still set Paddle notification destination
   `https://dev.drivebay.me/webhooks/paddle` for `transaction.completed`
   (+ ideally `transaction.paid`).

## Verification

- Feature tests green locally; production verify with sandbox card after deploy.
