# drivebay — Current handoff

## Goal

Latest (2026-08-05): Instagram live token polish `bbbf42d` on `origin/main`.

## Current state

- Filament Instagram account: platform fixed to Instagram (no blank dropdown)
- Token expiry in `isReady`; daily warn job; Filament token health badge
- Runbook: `docs/operations/instagram-publishing.md`
- Driver options `fake`|`meta`

## Exact next action

1. Deploy **dev**: pull `bbbf42d`, clear caches, paste Meta token in Filament
2. `php artisan instagram:verify-token` / `test-post` per runbook

## Verification

- `InstagramTokenHealthTest` + publishing suite green before push
