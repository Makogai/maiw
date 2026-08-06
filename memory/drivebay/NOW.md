# drivebay — Current handoff

## Goal

Local (uncommitted): remove the solid background / top border from the mobile listing
sticky Contact + Schedule bar — buttons stay fixed, no elevated bar panel.

Shipped on `origin/main` at `ffc7d56`: KAN-118, KAN-117 alerts filter, mobile web shell.

## Current state

Local change in `resources/js/Pages/Listings/Show.vue`: sticky buyer bar classes dropped
`border-t border-border bg-elevated` (kept fixed position + padding).

Shipped in `ffc7d56`:

- **KAN-118:** mark-sold Meilisearch soft-fail
- **KAN-117:** alerts inbox excludes `message.received`
- Mobile web shell: `MobileBottomNav.vue`, AppLayout, sticky Contact on Show

## Exact next action

1. Commit + push Show.vue background removal (ask user)
2. Deploy **dev**; verify mark-sold + alerts + transparent sticky buttons
3. Still open: Meilisearch host reachability; KAN-114 Facebook cleanup

## Verification

- Visual: mobile listing detail — Contact / Schedule sit above bottom nav with no bar fill
- Prior: `ListingMarkSoldTest` / `ApiNotificationsTest` passed before `ffc7d56`
