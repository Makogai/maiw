# drivebay — Current handoff

## Goal

Latest (2026-08-05): Facebook mock-publish fixes on `origin/main` at `07b31c3` (**KAN-114**).

## Current state

- Facebook publishing gated by `facebook-publish` Pennant (`FACEBOOK_PUBLISH_ENABLED`, default off) — no more duplicate post per promotion
- `publish()` no longer auto-creates a Facebook `platform_social_accounts` row
- Delete/comment are platform-aware; mock `mock_fb_*` posts are cancelled locally, never sent to Graph
- Filament posts table has platform badge + filter; Instagram-only actions hidden elsewhere
- Shipped earlier: `3e600fc` IG carousel + sectioned captions (**KAN-113**)

## Exact next action

1. Deploy **dev**: pull `07b31c3`, migrate (`image_urls`), clear caches
2. On dev: delete the auto-created Facebook account row + cancel leftover `mock_fb_*` posts
3. Product call: `featured_social` copy still promises Facebook (seeder keeps `includes_facebook_publish = true`)

## Verification

- Instagram suites 31 passed; `--filter=Promotion` 16 passed before push
