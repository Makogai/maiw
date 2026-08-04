# drivebay — Current handoff

## Goal

Latest (2026-08-05): Instagram caption format redesign (sectioned emoji layout) — **uncommitted** on top of `bbbf42d`.

## Current state

- `InstagramCaptionBuilder` posts use competitor-style blocks separated by `➖` dividers: title, price (+ price type), specs/description, optional financing, equipment, warranty, phone, seller `@mention`, DriveBay footer, link + hashtags
- EN + SR copy under `marketplace.instagram.caption_*`
- Token/health work still at `bbbf42d` on `origin/main` (Filament token paste, `isReady` expiry, warn job)

## Exact next action

1. Commit + push caption builder changes when ready
2. Deploy **dev**: pull latest, clear caches, paste Meta token in Filament if not done
3. Spot-check a test publish caption in SR locale

## Verification

- `php artisan test --compact tests/Feature/InstagramCaptionBuilderTest.php` — 4 passed
