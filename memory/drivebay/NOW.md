# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-111** `188a3f6` — promote 1/3/7 day durations +
success dialog (web).

Ticket: https://drivebayme.atlassian.net/browse/KAN-111

## Current state

- Catalog home €3/€5/€7, social €4/€6/€8; nested Paddle price IDs.
- `duration_days` on invoice items; activate uses it.
- On `origin/main` as `188a3f6`.

## Exact next action

1. Deploy + migrate + re-seed `PromotionTypesSeeder` on **dev**.
2. Rebuild Vite assets; QA promote durations + success popup.
3. Pair with Flutter `c5ec8dc`.

## Verification

- Pest promote/billing suites passed before push.
