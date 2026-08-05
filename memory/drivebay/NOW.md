# drivebay — Current handoff

## Goal

Latest (2026-08-05): public Instagram gallery at `/instagram` (**KAN-115**) — **uncommitted** on top of `61504e2` (seller featured sections).

## Current state

- `GET /instagram` (+ `/sr/instagram`) lists published Instagram posts for active listings
- One tile per listing (newest publish), cover from `listing_social_posts.image_url`, click → listing
- Captions include scheme-less gallery URL (`marketplace.instagram.caption_gallery`)
- Sitemap + footer link; tests in `InstagramGalleryPageTest`
- Shipped on `origin/main` at `61504e2`: seller "My listings" featured/standard sections (theme tokens only — no amber card backgrounds); listing detail keeps a single promotion badge by the price (image overlay removed). Storefront `ListingShow` still has its image overlay.
- Earlier: `07b31c3` Facebook mock-publish fixes (**KAN-114**), `3e600fc` IG carousel (**KAN-113**)

## Exact next action

1. Pull `apps/drivebay` to `61504e2` if behind, then commit + push the gallery slice (ask user)
2. Deploy / open `https://dap.drivebay.me/instagram` (or local) and confirm tiles + caption line
3. Still open from KAN-114: clean leftover Facebook account / `mock_fb_*` rows on dev; decide `featured_social` Facebook copy

## Verification

- `php artisan test --filter=InstagramGalleryPageTest` — 5 passed
- `php artisan test --filter=Instagram` — 37 passed
- `npm run build` — OK (new `Instagram/Index` chunk)
