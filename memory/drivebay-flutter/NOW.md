# drivebay-flutter — Current handoff

## Goal

- Listing card layout polish shipped.

## Current state

- **KAN-39 Done** — `1a1d51b`.
- **DEBUG_API logging shipped** — `a5824c3`.
- **Card polish pushed** — `de1f215`:
  - no make/model under title (`listing_card_grid_tile`, `listing_card_tile`)
  - shorter images (search grid `0.72`/`0.68`; list `16/9` / `2/1`)
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`
- Backend **KAN-40** variants API is live (`e3385fe`); Flutter still uses primary image URLs

## Exact next action

1. When prioritized: consume **KAN-40** WebP/variant URLs in Flutter once ready to adopt.

## Decisions made this session

- Drop redundant make/model subtitle under listing card titles.
- Shorter card photos via higher grid aspect ratios / wider list ratios.

## Changed files

- `lib/features/search/listing_card_grid_tile.dart`
- `lib/features/search/listing_card_tile.dart`
- `lib/features/search/search_screen.dart`

## Verification

- Visual: cards show title → specs → price; images less tall.
