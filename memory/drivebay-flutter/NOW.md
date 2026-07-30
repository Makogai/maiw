# drivebay-flutter — Current handoff

## Goal

**KAN-96** inventory filters on dealer/seller profile.

## Current state

- Local HEAD **`0bc1b3a`** (large WIP uncommitted).
- **KAN-96** (this session):
  - Client-side inventory filters on `/dealers/:slug` + `/sellers/:id`
  - Make chips, sort, expandable more filters (model/fuel/trans/condition/price/year/mileage)
  - Dealer respects `show_inventory_filters`; themed with storefront palette
  - `inventory_filters.dart` + `inventory_filters_bar.dart`; unit test green
- Prior WIP: dealer settings, multi-contact contact sheet, Cupertino swipe-back, chips, PhoneInput

## Exact next action

1. Hot restart; open dealer with 2+ listings; filter by brand / more filters.
2. Ask commit/push when QA ok.

## Decisions made

- Client-side over loaded listings (web parity), not new API query params.
- Filters hidden when &lt;2 listings or no useful facets.

## Verification

- `flutter test test/inventory_filters_test.dart` passed
- `flutter gen-l10n` + analyze clean of errors
