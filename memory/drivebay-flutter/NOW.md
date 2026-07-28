# drivebay-flutter — Current handoff

## Goal

Ship **KAN-44** mobile snappiness (images + detail keepAlive + hub SWR), then
ask to commit/push.

## Current state

- App HEAD was **`ba9f5fa`**; **uncommitted KAN-44** work in the tree:
  - `DrivebayNetworkImage` + `cached_network_image`; migrated all
    `Image.network` hot paths
  - `keepAliveWithTtl` on listing detail/similar (~8 min)
  - `SwrCache` SWR for featured + recommendations (~2 min fresh / 8 min keep)
  - Search: tile `ValueKey`s, `cacheExtent: 600`, pull-to-refresh clears SWR
  - Docs: `docs/development/performance.md`; tests: `test/swr_cache_test.dart`
- Live search still uses `_ts` (not HTTP-cached).

## Exact next action

Want me to commit and push `apps/drivebay-flutter`? Device-check scroll +
listing reopen after install.
