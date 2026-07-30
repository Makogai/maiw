# drivebay-flutter — Current handoff

## Goal

**KAN-90** listing Contact lists all dealer phones/emails; flag dial phone picker on dealer settings.

## Current state

- Local HEAD **`0bc1b3a`** (WIP uncommitted).
- **KAN-90** (this session):
  - `ListingContactChannels` parses `phones[]` / `emails[]`; contact sheet lists all
  - Viewing + seller pills: column + lighter
  - `PhoneInputField` (flag + dial) on Dealer settings phone rows
- Prior: dealer settings screen, seller card, storefront header still local

## Exact next action

1. Hot restart; confirm seller chips are 2-col grid; swipe from left edge to go back.
2. Ask commit/push when QA ok.

## Decisions made

- Mobile phone entry matches web Account `PhoneInput` (E.164 + flagcdn flags).
- Contact sheet shows labeled rows, not a single Call button.
- Seller feature pills = **2-column** grid; viewing options stay **stacked rows**.
- Pushed routes use `CupertinoPage` (+ Material/page color wrap) for edge swipe-back;
  shell tabs (`/search`, `/messages`, `/account`) stay Material so backgrounds stay correct.
- Seller chip labels: 11px, single line + ellipsis (no wrap).

## Verification

- `flutter test test/listing_contact_channels_test.dart` passed
