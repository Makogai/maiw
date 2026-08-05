# drivebay — Current handoff

## Goal

Latest (2026-08-05): web is being re-skinned toward the Flutter app's look. Listing card + equipment
section are done but **uncommitted** on top of `3890a7f`; mobile app-shell parity is unscoped.

## Current state

Mobile-app parity pass (uncommitted):

- `ListingCard.vue` grid variant now mirrors the app tile: flat (`shadow-none`, hover too), 14px
  radius, hairline border, no make/model eyebrow, title 14/bold, city moved onto the image
  bottom-left as white text with a shadow, price + relative date share the footer row with no
  divider, padding 12 (compact 10)
- `ListingCardSpecs.vue` default flipped from `chips` to `spread` (`year · mileage · fuel`) — the
  chips branch stays available via `ui.listingCardSpecsStyle` / the `specs-style` prop
- `PriceTag.vue`: `cardStyle` renders the current price in `text-accent` (app parity). Only
  `ListingCard` passes `card-style`, so detail/sidebar prices are unchanged
- Equipment on `Pages/Listings/Show.vue` + `Pages/Storefront/ListingShow.vue`: chips replaced by
  the app's 2-column accent check-circle list (`Icon name="checkCircle"`, new in `Icon.vue`)
- The `row` variant (search list view only) was deliberately left alone — the app's list tile is a
  stacked full-width card, which would wreck the desktop search layout
- Not done: mobile web app-shell (app has a 5-slot bottom nav Search/Tools/+/Messages/Profile,
  flat logo+title app bar, filters in a 92%-height sheet, sticky Contact bar on detail; web has a
  hamburger drawer and no bottom nav)

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

1. Scope + build the mobile web app-shell (waiting on the user: bottom nav vs. lighter polish),
   then commit the card/equipment pass
2. Deploy **dev**: pull `3890a7f`, migrate (`image_urls`), clear caches, rebuild assets
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
