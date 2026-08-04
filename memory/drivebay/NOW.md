# drivebay — Current handoff

## Goal

Latest (2026-08-05): Instagram carousel (all listing photos) + sectioned captions — **uncommitted** on top of `bbbf42d`.

## Current state

- Captions: sectioned emoji/`➖` layout (`InstagramCaptionBuilder`)
- Publish: all listing photos → Meta carousel (2–10), single image if only one; `image_urls` JSON on `listing_social_posts`; custom URL still one-image override
- Cap: `drivebay.instagram.carousel_max_images` (default 10)
- Token/health still at `bbbf42d` on `origin/main`

## Exact next action

1. Commit + push drivebay app changes when ready
2. Migrate on deploy: `add_image_urls_to_listing_social_posts_table`
3. Spot-check live Meta carousel with ≥2 public CDN photos

## Verification

- `php artisan test --compact tests/Feature/InstagramCaptionBuilderTest.php tests/Feature/MetaInstagramPublisherTest.php tests/Feature/InstagramPublishingTest.php tests/Unit/InstagramPublishImageResolverTest.php`
