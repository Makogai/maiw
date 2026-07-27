# drivebay — Current handoff

## Goal

- Backend bug queue: **KAN-9** favorites_count maintenance.

## Current state

- **KAN-7 Done** — pushed `18b1d4f` (dedicated Autodiler imports Horizon queue). Restart Horizon on Coolify.
- **KAN-9 implemented locally (uncommitted)**:
  - `FavoriteService` atomically maintains `listings.favorites_count`
  - `favorites:backfill-counts` command (+ admin Artisan allowlist)
  - 9 Pest tests passing
- Note: brand SVGs under `public/images/brands/` keep appearing dirty during agent runs —
  always `git checkout -- public/images/brands/` before commit; do not ship those diffs.

## Exact next action

1. Human: commit + push KAN-9 (PHP/tests only — never brand SVGs).
2. After deploy: run `php artisan favorites:backfill-counts` (or admin Artisan runner).
3. Next: **KAN-8** (ad impressions).

## Verification

- FavoriteServiceTest 6/6, BackfillFavoriteCountsCommandTest 3/3.
