# drivebay — Current handoff

## Goal

Latest (2026-08-05): type-aware listing cover placeholders (**KAN-116**) shipped on
`origin/main` at `15d3a22`, rebased on top of `d6fc2cf` (card/equipment restyle).

## Current state

Listing placeholders (**KAN-116**, `99b4f1b` + cleanup `15d3a22`):

- Real WebP art now committed at `public/images/placeholders/listings/{car,motorcycle,van,truck,bus,trailer,specialty,default}.webp`
  (~31–37 KB each; `default.webp` currently duplicates the car art)
- Helper: `App\Support\Media\ListingPlaceholder` + `config/drivebay.php` `listing_placeholders`
- Payloads: Web/API `ListingCardResource` / `ListingDetailResource` + Instagram gallery listing
  blob expose `placeholder_url` and `vehicle.vehicle_type_code`
- Web: `useListingPlaceholder` + `@error` on `ListingCardImageArea`, `InstagramPostTile`,
  `ListingGallery`; empty galleries on listing/storefront show render the placeholder `<img>`
- `listing-accent-*` gradient + car-icon fallback removed from both show pages; the unused
  `accentClass` computed went with it (`15d3a22`)
- Docs: `docs/frontend/listing-placeholders.md`
- Paired Flutter: drivebay-flutter `b5011b0`

Also on `origin/main`: `d6fc2cf` card/equipment restyle, `3890a7f` promote CTA,
`2191d99` public `/instagram` gallery (**KAN-115**).

## Exact next action

1. Deploy **dev**: pull `15d3a22`, clear caches, rebuild assets
2. Verify a listing with no photos and a card with a deliberately broken CDN URL both show the
   matching vehicle placeholder (never a broken icon)
3. Optional: replace `default.webp` with distinct generic art (it duplicates `car.webp` today)
4. Still open: mobile web app-shell parity; KAN-114 Facebook cleanup on dev

## Verification

- `php artisan test tests/Feature/ListingPlaceholderTest.php tests/Feature/InstagramGalleryPageTest.php`
  — 22 passed (104 assertions), run after the rebase
- `npm run build` **not** run in this session (no node on PATH in the agent shell) — build on deploy

## Gotcha

- Node/npm are not on PATH in the agent shell even though `node bin/*.js` worked earlier in the
  session; do not assume `npm run build` is runnable here.
- Two agent sessions pushed to `drivebay` and the wrapper at once on 2026-08-05; check
  `HEAD..origin/main` and rebase before declaring another session's work lost.
- `apps/drivebay/.nvmrc` (node 26) is still untracked and unrelated to this slice.
