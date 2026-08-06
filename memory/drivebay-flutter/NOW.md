# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-06): **KAN-117** mobile polish — chat images-only, hide message alerts,
listing iPhone safe-area, mark sold on detail. **Uncommitted** on top of `b5011b0`.

## Current state

KAN-117 (local):

- Chat picker: `pickMultiImage` (was `pickMultipleMedia`) — videos no longer selectable
- Notifications inbox filters out `message.received` client-side; skips in-app banner for chat
  (Messages tab unread + push stay). Paired API filter is in drivebay `Notification::forAlertsInbox`
- Listing detail: sticky buyer bar is full-bleed elevated chrome into the home-indicator zone;
  header uses `viewPadding.top` instead of nested SafeArea; list bottom pad = bar + inset
- Owner banner: **Mark as sold** when `meta.capabilities.canMarkSold` (was My Listings only)

Shipped on `origin/main` at `b5011b0` (**KAN-116**):

- `ListingCoverImage` + type-aware HTTPS placeholders from marketplace origin / API
- Prior: Featured badges + seller filter + owner end-date (`9a340d4`)

## Exact next action

1. Hot-restart QA on iPhone: listing top/bottom, chat attach, alerts empty of chat, mark sold
2. Commit + push flutter + drivebay notification API (ask user)
3. Transition **KAN-117** → In Review after push

## Verification

- `dart analyze` clean on touched Dart files (pre-existing unused `_openReportListing` warning)
- Drivebay `ApiNotificationsTest` new case for excluding `message.received` passed
