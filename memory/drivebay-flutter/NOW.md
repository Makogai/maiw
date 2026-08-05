# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-05): listing cover placeholders (**KAN-116**) wired locally on top of
`9a340d4`. Not committed/pushed yet. Needs paired drivebay deploy for the WebP assets.

## Current state

- `ListingCoverImage` + `listing_placeholder.dart` — null URL / `errorBuilder` → type-aware
  HTTPS placeholder from marketplace origin (`Env.webBaseUrl`) or API `placeholderUrl`
- Models: `ListingCard.placeholderUrl`, `ListingVehicleSummary.vehicleTypeCode`,
  `ListingDetail.placeholderUrl`, `ListingVehicleDetail.vehicleTypeCode` (freezed regen)
- Cards/gallery: grid tile, list tile, featured carousel, seller card, detail empty gallery
  use `ListingCoverImage` (replaces muted `directions_car` icon placeholder)
- Paired backend: drivebay **KAN-116** (local WIP on `2191d99`)

Prior ship at `9a340d4`: Featured badges + seller filter + owner end-date.

## Exact next action

1. Commit + push after drivebay placeholders are on a reachable host (ask human first)
2. Hot-restart QA: listing with no cover + deliberately broken CDN URL

## Verification

- `dart analyze` on touched listing/search/seller files — no errors (pre-existing unused
  `_openReportListing` warning unrelated)
