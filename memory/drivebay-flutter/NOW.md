# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-05): listing cover placeholders (**KAN-116**) shipped on `origin/main` at
`b5011b0`, paired with drivebay `15d3a22` which serves the WebP art.

## Current state

- `ListingCoverImage` (`lib/widgets/listing_cover_image.dart`) + `lib/utils/listing_placeholder.dart`
  — null URL or `errorBuilder` → type-aware HTTPS placeholder from the marketplace origin
  (`Env.webBaseUrl`) or the API's `placeholderUrl`
- Models: `ListingCard.placeholderUrl`, `ListingVehicleSummary.vehicleTypeCode`,
  `ListingDetail.placeholderUrl`, `ListingVehicleDetail.vehicleTypeCode` (freezed regenerated)
- Cards/gallery: grid tile, list tile, featured carousel, seller card, detail empty gallery all
  use `ListingCoverImage` — the duplicated muted `directions_car` placeholders are gone
- No placeholder art in the app binary; it is fetched from the web origin

Prior ship at `9a340d4`: Featured badges + seller filter + owner end-date.

## Exact next action

1. Hot-restart QA once drivebay `15d3a22` is deployed: listing with no cover + deliberately
   broken CDN URL should both show the matching vehicle art
2. If placeholders 404 in the app, check `Env.webBaseUrl` resolves to the deployed marketplace
   host (it derives the origin from the API base URL)

## Verification

- `dart analyze` on the touched listing/search/seller files — no errors (pre-existing unused
  `_openReportListing` warning is unrelated)
- `flutter test` not run in this session
