# drivebay — Current handoff

## Goal

Latest (2026-08-05): web featured-listing UX cleanup — one badge on listing detail, featured
section split in seller "My listings". Local, uncommitted on top of `07b31c3`.

## Current state

- `Pages/Listings/Show.vue`: removed the promotion badge overlay on the gallery / placeholder
  image; the badge row next to the price (`PromotionBadges size="sm"`) is now the only one
- `Pages/Seller/Listings/Index.vue`: listings split into `sections` (featured first, then the
  rest) via `isFeatured()` on `active_promotion.code` / `promotion_badges`
  (`featured`, `featured_home`, `featured_social`). Featured block is an amber card with star
  header + count pill; headers only render when both groups exist
- New lang keys `seller.featured_section_title|featured_section_subtitle|standard_section_title|standard_section_subtitle|section_count` (EN + SR)
- Storefront `Pages/Storefront/ListingShow.vue` keeps its image overlay badge — it is the only
  badge on that page
- Shipped earlier: `07b31c3` Facebook mock-publish fixes (**KAN-114**), `3e600fc` IG carousel (**KAN-113**)

## Exact next action

1. Commit + push the four modified web files (awaiting user go-ahead)
2. Deploy **dev**: pull, migrate (`image_urls`), clear caches
3. Product call: `featured_social` copy still promises Facebook (seeder keeps `includes_facebook_publish = true`)

## Verification

- `npm run build` (vite) passed after the Vue changes — templates compile
- Instagram suites 31 passed; `--filter=Promotion` 16 passed before `07b31c3`
