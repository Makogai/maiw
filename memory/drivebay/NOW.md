# drivebay — Current handoff

## Goal

Latest (2026-08-05): Facebook mock-publish fixes (**KAN-114**) — **uncommitted** on top of `3e600fc`.

## Current state

- Facebook publishing gated by `facebook-publish` Pennant (`FACEBOOK_PUBLISH_ENABLED`, default off) — no more duplicate post per promotion
- `publish()` no longer auto-creates a Facebook `platform_social_accounts` row
- Delete/comment are platform-aware; mock `mock_fb_*` posts are cancelled locally, never sent to Graph
- Filament posts table has platform badge + filter; Instagram-only actions hidden elsewhere
- Shipped earlier: `3e600fc` IG carousel + sectioned captions (**KAN-113**)

## Exact next action

1. Commit + push drivebay when ready
2. On dev: delete the auto-created Facebook account row + cancel leftover `mock_fb_*` posts
3. Product call: `featured_social` copy still promises Facebook (seeder keeps `includes_facebook_publish = true`)

## Verification

- `php artisan test --compact tests/Feature/InstagramPublishingTest.php tests/Feature/MetaInstagramPublisherTest.php tests/Unit/InstagramPublishImageResolverTest.php tests/Feature/InstagramCaptionBuilderTest.php tests/Feature/InstagramTokenHealthTest.php` — 31 passed
- `php artisan test --compact --filter=Promotion` — 16 passed
