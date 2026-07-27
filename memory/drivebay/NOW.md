# drivebay — Current handoff

## Goal

- Admin Artisan command runner so ops (migrate, media backfill) can run from Filament
  instead of Coolify terminal (**KAN-43**).

## Current state

- **KAN-16 + KAN-40 pushed** — `e3385fe` on `main` (custom WebP variants, Spatie removed).
- **KAN-43 implemented locally (uncommitted)**:
  - `/admin/artisan-commands` — allowlisted `Artisan::call` runner, `super_admin` only
  - Linked from Developer tools
  - Audit via `AdminAction` (`artisan_run`) + Log
  - Tests: `AdminArtisanCommandRunnerTest` (4 passing)

## Exact next action

1. Human: commit + push `apps/drivebay` KAN-43 work.
2. After deploy: use Artisan commands page for `migrate` + `media:backfill-listing-variants`
   (or Coolify once more), then close **KAN-16** / **KAN-40** / **KAN-43** as appropriate.

## Decisions made this session

- Allowlist only — no freeform shell; no `queue:work` / `migrate:fresh`.
- Gate page with `super_admin` (stricter than general admin panel access).

## Changed files

- `app/Filament/Admin/Pages/ArtisanCommands.php` + blade
- `app/Support/Admin/ArtisanCommandAllowlist.php`, `ArtisanCommandRunner.php`
- `DeveloperTools` link + blade danger color
- `tests/Feature/AdminArtisanCommandRunnerTest.php`

## Verification

- `php artisan test --filter=AdminArtisanCommandRunnerTest` — 4 passed.
