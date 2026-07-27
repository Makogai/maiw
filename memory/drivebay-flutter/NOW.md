# drivebay-flutter — Current handoff

## Goal

- Listing card layout polish (space + no overflow).

## Current state

- **KAN-39 Done** — pushed `1a1d51b` (keep previous listing detail on reopen).
- **DEBUG_API logging shipped** — pushed `a5824c3`.
- **Local uncommitted UI:** listing cards drop make/model under title; shorter images
  (grid `childAspectRatio` ~0.72/0.68; list tile `16/9` / `2/1`).
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`
- Backend image optimization: **KAN-40** (WebP + variants at process time)

## Exact next action

1. Commit/push Flutter card layout changes when ready.
2. When prioritized: consume **KAN-40** WebP/variant URLs in Flutter once API exposes them.

## Decisions made this session

- Drop redundant make/model subtitle under listing card titles (title is enough).
- Shorter card photos: raise grid aspect ratios; list images use wider ratios.

## Changed files

- `lib/features/search/listing_card_grid_tile.dart`
- `lib/features/search/listing_card_tile.dart`
- (prior local) search/detail/seller grids aspect-ratio / Expanded image overflow fix

## Verification

- Hot reload / visual check: cards show title → specs → price without make/model line.
