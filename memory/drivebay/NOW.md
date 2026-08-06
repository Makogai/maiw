# drivebay — Current handoff

## Goal

Shipped **KAN-118** (mark-sold Meilisearch soft-fail) + **KAN-117** alerts inbox filter +
mobile web shell on `origin/main` at `ffc7d56`.

## Current state

Shipped in `ffc7d56` (after pull to `15d3a22`):

- **KAN-118:** `ListingService::markAsSold`/`archive` dispatch `SyncListingSearchDocumentJob`;
  `syncSearchDocument` try/catches Scout failures. Tests in `ListingMarkSoldTest`
- **KAN-117:** `Notification::scopeForAlertsInbox()` excludes `message.received` from API/web
  alerts (push still created)
- Mobile web shell: `MobileBottomNav.vue`, AppLayout wiring, sticky Contact on Show,
  FloatingMessenger hidden on mobile

Prior on main: listing placeholders (**KAN-116**) `15d3a22` / `99b4f1b`

## Exact next action

1. Deploy **dev** so mark-sold no longer 500s when Meilisearch is down; verify alerts have no
   chat rows; smoke mobile bottom nav
2. Transition **KAN-118** / **KAN-117** → In Review after deploy QA
3. Still open: Meilisearch host reachability on Coolify; KAN-114 Facebook cleanup

## Verification

- `php artisan test --filter=ListingMarkSoldTest` — 3 passed before push
- `php artisan test --filter=ApiNotificationsTest` — exclude-chat case passed earlier
