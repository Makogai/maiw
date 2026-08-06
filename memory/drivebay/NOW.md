# drivebay — Current handoff

## Goal

Latest (2026-08-06): **KAN-117** — exclude `message.received` from alerts inbox (API + web).
Uncommitted PHP (+ leftover mobile app-shell Vue) on top of `origin/main` at `15d3a22`.

## Current state

KAN-117 notification inbox (local, uncommitted):

- `Notification::ALERTS_EXCLUDED_TYPES` + `scopeForAlertsInbox()` — drops `message.received`
  from channel=`in_app` queries used by API index/unread/latest and web `NotificationController`
- Rows are still **created** so `NotificationObserver` can queue push; Messages tab unread is separate
- `ListingNotificationService::{recentUnreadFor,unreadCountFor}` use the same scope (web bell)
- Test: `ApiNotificationsTest` asserts chat rows are excluded
- Paired Flutter work is local on drivebay-flutter atop `b5011b0`

Also still dirty locally (separate 08-05 slice, do not mix into KAN-117 commit):

- Mobile web app-shell Vue (`MobileBottomNav.vue`, `AppLayout.vue`, sticky Contact on Show,
  FloatingMessenger hidden on mobile)

Shipped on `origin/main` at `15d3a22`:

- Listing cover placeholders (**KAN-116**) — WebP art under `public/images/placeholders/listings/`
- Card/equipment restyle `d6fc2cf`, promote CTA `3890a7f`, `/instagram` gallery **KAN-115**

## Exact next action

1. Stash/isolate Vue shell files, pull to `15d3a22`, commit KAN-117 PHP only (ask user)
2. Deploy **dev** after push; verify alerts inbox has no chat rows while push still fires
3. Still open: mobile web app-shell parity; KAN-114 Facebook cleanup on dev

## Verification

- `php artisan test --filter=ApiNotificationsTest` — new exclude-chat case passed (pre-existing
  push assertion about `listing_public_id` still flaky/unrelated)
