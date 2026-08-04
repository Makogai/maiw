# drivebay — Current handoff

## Goal

Latest (local): Instagram live token + polish (KAN-112 still on `b697b66`
plus uncommitted IG work).

## Current state

- Runbook: `docs/operations/instagram-publishing.md`
- Token in Filament only; driver options `fake`|`meta`; expiry in `isReady`
- Daily `WarnExpiringInstagramTokenJob`; Filament token health badge
- Seller IG status shows source + fail hint; promote success social note
- `instagram:verify-token` redacts token in logs/console

## Exact next action

1. Paste long-lived Page token in Filament → Marketing → Instagram account
2. Set `INSTAGRAM_PUBLISH_DRIVER=meta`, verify with artisan commands in runbook
3. Commit + push when ready; deploy + Vite if seller Vue changed

## Verification

- `php artisan test --compact tests/Feature/InstagramTokenHealthTest.php tests/Feature/InstagramPublishingTest.php` — 11 passed
