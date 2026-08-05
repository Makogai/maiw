# drivebay — Current handoff

## Goal

Latest (2026-08-05): seller promote CTA moved into the owner sidebar — shipped on `origin/main`
at `3890a7f`, on top of the `/instagram` gallery (**KAN-115**, `2191d99`).

## Current state

Promote CTA (`3890a7f`):

- `ListingOwnerSidebarPanel.vue`: "Promote listing" is the single hero CTA at the top of the
  sidebar action stack (full width, accent, star icon, soft accent shadow,
  `promotions.promote_sidebar_hint` under it). Quick price drops to `outline` while the CTA
  shows and returns to `primary` once the listing is already promoted
- Edit / Mark sold stay a paired outline row; either spans both columns when alone
- The duplicate promote button in the owner banner at the top of `Pages/Listings/Show.vue` was removed

Instagram gallery (**KAN-115**, `2191d99`):

- `GET /instagram` (+ `/sr/instagram`) lists published Instagram posts for active listings
- One tile per listing (newest publish), cover from `listing_social_posts.image_url`, click → listing
- Captions include scheme-less gallery URL (`marketplace.instagram.caption_gallery`)
- Sitemap + footer link; tests in `InstagramGalleryPageTest`

Featured badge/section work (`61504e2`, `8e8b587`):

- Seller "My listings" featured/standard sections — accent star + uppercase label + count +
  hairline rule, theme tokens only. An amber tinted card was rejected as off-theme; do not
  reintroduce colored section backgrounds here
- Listing detail keeps a single promotion badge beside the price (image overlay removed);
  Storefront `ListingShow` still has its image overlay, which is its only badge
- Earlier: `07b31c3` Facebook mock-publish fixes (**KAN-114**), `3e600fc` IG carousel (**KAN-113**)

## Exact next action

1. Deploy **dev**: pull `3890a7f`, migrate (`image_urls`), clear caches, rebuild assets
2. Open `/instagram` (tiles + caption line) and an owned listing (promote CTA)
3. Confirm the production host really is `dap.drivebay.me` — the caption uses
   `LocaleUrl::route('instagram')`, i.e. `APP_URL`
4. Still open from KAN-114: clean leftover Facebook account / `mock_fb_*` rows on dev; decide
   `featured_social` Facebook copy

## Verification

- `npm run build` — OK after rebasing the promote CTA onto the gallery commit
- `php artisan test --filter=InstagramGalleryPageTest` — 5 passed; `--filter=Instagram` — 37 passed

## Gotcha

Two agent sessions pushed to `drivebay` and the wrapper at once on 2026-08-05; every `git push`
was rejected and needed `git pull --rebase origin main`. A parallel session also concluded this
promote-CTA slice was "missing from the tree" while it was mid-flight in another session — check
`HEAD..origin/main` and ask before declaring another session's work lost.
