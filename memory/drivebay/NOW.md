# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** Paddle Billing for featured promotions —
**uncommitted** on `main` atop `b47a674` (KAN-110).

Ticket: https://drivebayme.atlassian.net/browse/KAN-111 (In Review)

## Current state

- Third gateway `PaddlePaymentGateway` alongside Fake + Stripe via
  `PaymentGatewayInterface`; `PAYMENT_GATEWAY=paddle` + API key binds it.
- Sandbox price map: `featured_home` → `pri_01kz6qz9he61s3ab6b6yhewhja` (€5),
  `featured_social` → `pri_01kz6qzabzer3zcy7np3rhctd2` (€7). `urgent` has no
  price — promote returns 422 under paddle.
- `POST /webhooks/paddle` (CSRF exempt) verifies `Paddle-Signature`, handles
  `transaction.completed` with `custom_data.payment_uuid` → confirm +
  `CheckoutService::fulfillPaidPayment` (idempotent if already paid).
- Seeder: paddle `payment_providers` row; featured prices €5/€7.
- Web/Flutter promote UIs already redirect for non-fake — no new screens.
- Docs: `docs/api/modules/billing.md`, architecture + CLAUDE payments rows.

## Exact next action

1. Ask user whether to commit/push `apps/drivebay` (KAN-111 uncommitted).
2. On target env: set `PAYMENT_GATEWAY=paddle`, `PADDLE_ENV=sandbox`,
   `PADDLE_API_KEY` (or `PADDLE_SANDBOX_API_KEY`), `PADDLE_CLIENT_TOKEN`,
   `PADDLE_WEBHOOK_SECRET`; notification destination → `/webhooks/paddle`
   for `transaction.completed`; re-seed or update promotion prices.
3. QA promote featured_home/social → Paddle sandbox checkout → webhook activates.
4. Before Live: recreate products/prices; new `pri_…` IDs + live keys.

## Verification

- `php artisan test --compact tests/Feature/Billing/PaddlePaymentGatewayTest.php
  tests/Feature/Promotion/DealerPromotionCheckoutTest.php` → 11 passed.
- Pint on dirty files → clean.
