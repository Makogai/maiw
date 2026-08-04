# drivebay — Current handoff

## Goal

Latest (2026-08-05): Instagram carousel + sectioned captions on `origin/main` at `3e600fc` (**KAN-113**).

## Current state

- Captions: sectioned emoji/`➖` layout (`InstagramCaptionBuilder`)
- Publish: all listing photos → Meta carousel (max 10); `image_urls` on `listing_social_posts`
- Token/health polish still included from `bbbf42d`

## Exact next action

1. Deploy **dev**: pull `3e600fc`, migrate, clear caches
2. Spot-check live Meta carousel with ≥2 public CDN photos + SR caption locale

## Verification

- Caption + carousel Pest suites green before push
