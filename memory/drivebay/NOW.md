# drivebay — Current handoff

## Goal

Latest (2026-08-05): public Instagram gallery at `/instagram` (**KAN-115**) shipped on `origin/main`
at `2191d99`. A parallel session's seller promote-CTA slice was recorded as uncommitted but is
**not present in the working tree** at `2191d99` — re-check before trusting it.

## Current state

Instagram gallery (KAN-115, `2191d99`):

- `GET /instagram` (+ `/sr/instagram`) lists published Instagram posts for active listings
- One tile per listing (newest publish), cover from `listing_social_posts.image_url`, click → listing
- Captions include scheme-less gallery URL (`marketplace.instagram.caption_gallery`)
- Sitemap + footer link; tests in `InstagramGalleryPageTest`

Promote CTA move (claimed uncommitted, **not found in tree** — no `promote_sidebar_hint` key, no
stash, clean `git status`):

- Intended: `ListingOwnerSidebarPanel.vue` gets "Promote listing" as the single hero CTA at the top
  of the sidebar action stack (full width, accent, star icon, `promotions.promote_sidebar_hint`
  under it); quick price drops to `outline`; the duplicate promote button in the owner banner of
  `Pages/Listings/Show.vue` is removed

Shipped on `origin/main` at `61504e2`:

- Seller "My listings" featured/standard sections — accent star + uppercase label + count +
  hairline rule, theme tokens only. An amber tinted card was rejected as off-theme; do not
  reintroduce colored section backgrounds here
- Listing detail keeps a single promotion badge beside the price (image overlay removed);
  Storefront `ListingShow` still has its image overlay, which is its only badge
- Earlier: `07b31c3` Facebook mock-publish fixes (**KAN-114**), `3e600fc` IG carousel (**KAN-113**)

## Exact next action

1. Deploy **dev**: pull `2191d99`, clear caches, rebuild assets; open `/instagram` and confirm tiles + caption line
2. Confirm the production host really is `dap.drivebay.me` (caption uses `LocaleUrl::route('instagram')`, i.e. `APP_URL`)
3. Re-do or recover the promote-CTA slice if it is still wanted — it is not in the tree
4. Still open from KAN-114: clean leftover Facebook account / `mock_fb_*` rows on dev; decide `featured_social` Facebook copy

## Verification

- `php artisan test --filter=InstagramGalleryPageTest` — 5 passed
- `php artisan test --filter=Instagram` — 37 passed
- `npm run build` — OK (new `Instagram/Index` chunk)
