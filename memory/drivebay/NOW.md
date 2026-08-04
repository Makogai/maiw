# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** Paddle checkout overlay page —
`a7f05a0` on `main`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Paddle `checkout.url` is `/?_ptxn=` on your **default payment link**. Without
  Paddle.js on that page, users land on the site with no pay UI.
- Fix: `/billing/paddle-checkout` loads Paddle.js + opens overlay; transactions
  pass that URL as checkout base.
- Set Paddle dashboard **Default payment link** to
  `https://dev.drivebay.me/billing/paddle-checkout`.
- Require `PADDLE_CLIENT_TOKEN` on the server.

## Exact next action

1. Deploy `a7f05a0` + frontend assets build; set `PADDLE_CLIENT_TOKEN`.
2. Update sandbox default payment link to `/billing/paddle-checkout`.
3. QA promote → overlay pay screen.

## Verification

- PaddlePaymentGatewayTest → 7 passed including landing-page inertia test.
