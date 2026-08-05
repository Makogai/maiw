# drivebay — Current handoff

## Goal

Latest (2026-08-05): type-aware listing cover placeholders (**KAN-116**) implemented
locally (uncommitted) on top of `2191d99`. Local `main` is **behind** `origin/main`
(`d6fc2cf` card/equipment restyle atop `3890a7f` promote CTA). Rebase placeholders onto
origin before push.

## Current state

Listing placeholders (**KAN-116**, local WIP — rebase onto `origin/main` first):

- Assets: `public/images/placeholders/listings/{car,motorcycle,van,truck,bus,trailer,specialty,default}.webp`
  (temporary solid colors — replace with real 4:3 art using the same names)
- Helper: `App\Support\Media\ListingPlaceholder` + `config/drivebay.php` `listing_placeholders`
- Payloads: Web/API `ListingCardResource` / `ListingDetailResource` + Instagram gallery listing
  blob expose `placeholder_url` and `vehicle.vehicle_type_code`
- Web: `useListingPlaceholder` + `@error` on `ListingCardImageArea`, `InstagramPostTile`,
  `ListingGallery`, empty galleries on listing/storefront show
- Docs: `docs/frontend/listing-placeholders.md`
- Tests: `ListingPlaceholderTest` (17), Instagram gallery asserts `placeholder_url`

Shipped on `origin/main`:

- `d6fc2cf` — web listing card + equipment list restyled toward Flutter app
- `3890a7f` — promote as lead CTA in owner listing sidebar
- `2191d99` — public `/instagram` gallery (**KAN-115**)

## Exact next action

1. `git pull --rebase origin main` for placeholder WIP, then commit + push (ask human first)
2. Drop real WebP art into `public/images/placeholders/listings/` (same filenames)
3. Pair Flutter `ListingCoverImage` commit once backend assets are reachable
4. Still open: mobile web app-shell parity; KAN-114 Facebook cleanup on dev

## Verification

- `php artisan test --filter=ListingPlaceholderTest` — 17 passed
- `php artisan test --filter=InstagramGalleryPageTest` — 5 passed

## Gotcha

Two agent sessions pushed to `drivebay` and the wrapper at once on 2026-08-05; every `git push`
was rejected and needed `git pull --rebase origin main`. Always check `HEAD..origin/main`
before declaring another session's work lost.
