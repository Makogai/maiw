# drivebay — Current handoff

## Goal

Latest (2026-08-06): **KAN-118** — mark-as-sold must not fail when Meilisearch is unreachable.
Local fix uncommitted; also still carrying **KAN-117** notification inbox filter + leftover
mobile web shell Vue. Local branch behind `origin/main` (`d6fc2cf` vs `15d3a22`) — pull blocked
by dirty `Show.vue`.

## Current state

**KAN-118** (local, uncommitted — isolate from Vue shell):

- `ListingService::markAsSold` / `archive` → `SyncListingSearchDocumentJob::dispatch` (no inline
  `unsearchable()`)
- `syncSearchDocument` try/catch + `Log::warning` on Scout failures
- Tests: `tests/Feature/ListingMarkSoldTest.php` (3 cases) — passed

**KAN-117** notification inbox (local, uncommitted):

- `Notification::scopeForAlertsInbox()` excludes `message.received` from API/web alerts
- Rows still created for push; paired Flutter work local on drivebay-flutter

Also dirty (separate slice — do not mix):

- Mobile web app-shell Vue (`MobileBottomNav.vue`, `AppLayout.vue`, sticky Contact on Show,
  FloatingMessenger)

Shipped on `origin/main` at `15d3a22` (local HEAD still `d6fc2cf` until pull):

- Listing cover placeholders (**KAN-116**), card/equipment restyle, promote CTA, Instagram gallery

## Exact next action

1. Stash Vue shell → `git pull` to `15d3a22` → commit **KAN-118** (`ListingService` + test) and
   optionally **KAN-117** PHP separately — ask user before commit/push
2. Deploy so Meilisearch outages no longer 500 mark-sold
3. Still open: mobile web shell; KAN-114 Facebook cleanup on dev

## Verification

- `php artisan test --filter=ListingMarkSoldTest` — 3 passed
- `php artisan test --filter=ApiNotificationsTest` — KAN-117 exclude-chat case passed earlier
