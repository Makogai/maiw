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

1. Hot restart; open listing Contact on multi-phone dealer; open Dealer settings phone picker.
2. Ask commit/push when QA ok.

## Decisions made

- Mobile phone entry matches web Account `PhoneInput` (E.164 + flagcdn flags).
- Contact sheet shows labeled rows, not a single Call button.

## Verification

- `flutter test test/listing_contact_channels_test.dart` passed
