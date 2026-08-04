# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** Paddle — `501f48a` fixes null
`payments.provider_id` when `payment_providers.paddle` was never seeded.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111 (In Review)

## Current state

- `CheckoutService::paymentProviderId()` `updateOrCreate`s fake/stripe/paddle.
- Still need on **dev**: `PAYMENT_GATEWAY=paddle` + keys, default payment link
  in Paddle dashboard, webhook destination, re-seed prices (€5/€7 — DB may
  still show €2).

## Exact next action

1. Deploy `501f48a`; set Paddle env; set **default payment link** in Paddle
   (otherwise transaction create fails).
2. Webhook → `/webhooks/paddle`; re-seed promotion types; QA promote.

## Verification

- PaddlePaymentGatewayTest + DealerPromotionCheckoutTest → 12 passed.
- Pushed `501f48a` on `origin/main`.
