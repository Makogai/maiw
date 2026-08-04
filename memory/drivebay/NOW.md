# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** Paddle Billing for featured promotions —
pushed to `main` as `8c244cd` (gateway option enum; core at `94257f3`).

Ticket: https://drivebayme.atlassian.net/browse/KAN-111 (In Review)

## Current state

- Third gateway `PaddlePaymentGateway` alongside Fake + Stripe.
- Filament `billing.gateway` options include `paddle` (`8c244cd`).
- Sandbox prices: `featured_home` → `pri_01kz6qz9he61s3ab6b6yhewhja` (€5),
  `featured_social` → `pri_01kz6qzabzer3zcy7np3rhctd2` (€7). `urgent` → 422
  under paddle.
- Promote “test mode” banner = gateway still `fake` on that host.

## Exact next action

1. On **dev**: set `PAYMENT_GATEWAY=paddle` + Paddle keys; clear config cache /
   redeploy. Optionally set Filament platform billing gateway to Paddle.
2. Notification destination → `https://dev.drivebay.me/webhooks/paddle`.
3. Re-seed/update promotion prices (€5/€7); QA promote → Paddle checkout.

## Verification

- Feature tests green before `94257f3`; enum-only follow-up `8c244cd` on
  `origin/main`.
