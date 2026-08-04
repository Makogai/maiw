# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** Paddle Billing for featured promotions —
pushed to `main` as `94257f3`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111 (In Review)

## Current state

- Third gateway `PaddlePaymentGateway` alongside Fake + Stripe.
- Sandbox prices: `featured_home` → `pri_01kz6qz9he61s3ab6b6yhewhja` (€5),
  `featured_social` → `pri_01kz6qzabzer3zcy7np3rhctd2` (€7). `urgent` → 422
  under paddle.
- `POST /webhooks/paddle` verifies signature; `transaction.completed` →
  `fulfillPaidPayment` (idempotent).
- Web/Flutter already redirect for non-fake gateways.

## Exact next action

1. Deploy `94257f3` to **dev**; `composer install`; set env:
   `PAYMENT_GATEWAY=paddle`, `PADDLE_ENV=sandbox`, `PADDLE_API_KEY` (or
   `PADDLE_SANDBOX_API_KEY`), `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`.
2. Paddle notification destination → `https://dev.drivebay.me/webhooks/paddle`
   (`transaction.completed`).
3. Re-seed or update promotion prices (€5/€7) on that DB.
4. QA promote featured packages → sandbox checkout → webhook activates.

## Verification

- Feature tests: PaddlePaymentGatewayTest + DealerPromotionCheckoutTest → 11
  passed before push.
- Commit `94257f3` on `origin/main`.
