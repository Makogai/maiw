# drivebay — Current handoff

## Goal

Brand packs shipped locally (DriveBay + AutoKlik); next is QA + commit/push when ready.

## Current state

- App HEAD still **`1729d6d`** on remote; **uncommitted** deploy-time branding:
  - `BRAND=drivebay|autoklik` via `config/brand.php` + `config/brands/*`
  - Helpers `brand()` / `brandify()`; Inertia shared `brand`; CSS accent override in
    `app.blade.php`; SEO `og:site_name`; mail/Filament/Logo wired
  - Lang strings use `:app` placeholder
  - Docs: `docs/development/branding.md`
  - Test: `tests/Unit/BrandConfigTest.php` (pass)
- Switch: set `BRAND=autoklik` in `.env`, `php artisan config:clear`
- Atlassian MCP unavailable this session — no Jira ticket filed yet

## Exact next action

Want me to commit and push `apps/drivebay`? Optionally file a KAN ticket for brand packs.
Smoke-check web with `BRAND=autoklik` (logo/teal accents/titles).
