# drivebay — Current handoff

## Goal

Latest (2026-08-05): two **uncommitted** slices sit on top of `61504e2` in the same working tree —
public Instagram gallery at `/instagram` (**KAN-115**) and the seller promote CTA move.

## Current state

Instagram gallery (KAN-115, uncommitted):

- `GET /instagram` (+ `/sr/instagram`) lists published Instagram posts for active listings
- One tile per listing (newest publish), cover from `listing_social_posts.image_url`, click → listing
- Captions include scheme-less gallery URL (`marketplace.instagram.caption_gallery`)
- Sitemap + footer link; tests in `InstagramGalleryPageTest`

Promote CTA move (uncommitted):

- `ListingOwnerSidebarPanel.vue`: "Promote listing" is now the single hero CTA at the top of the
  sidebar action stack (full width, accent, star icon, soft accent shadow, `promotions.promote_sidebar_hint`
  under it). Quick price drops to `outline` while the CTA shows. The duplicate promote button in
  the owner banner at the top of `Pages/Listings/Show.vue` was removed

Shipped on `origin/main` at `61504e2`:

- Seller "My listings" featured/standard sections — accent star + uppercase label + count +
  hairline rule, theme tokens only. An amber tinted card was rejected as off-theme; do not
  reintroduce colored section backgrounds here
- Listing detail keeps a single promotion badge beside the price (image overlay removed);
  Storefront `ListingShow` still has its image overlay, which is its only badge
- Earlier: `07b31c3` Facebook mock-publish fixes (**KAN-114**), `3e600fc` IG carousel (**KAN-113**)

## Exact next action

1. Two independent slices are dirty in `apps/drivebay` — commit them **separately** (ask user first):
   gallery files vs. `ListingOwnerSidebarPanel.vue` / `Pages/Listings/Show.vue` / promote lang keys
2. Deploy / open `https://dap.drivebay.me/instagram` and confirm tiles + caption line
3. Still open from KAN-114: clean leftover Facebook account / `mock_fb_*` rows on dev; decide `featured_social` Facebook copy

## Verification

- `php artisan test --filter=InstagramGalleryPageTest` — 5 passed
- `php artisan test --filter=Instagram` — 37 passed
- `npm run build` — OK (new `Instagram/Index` chunk; also OK after the promote CTA move)
