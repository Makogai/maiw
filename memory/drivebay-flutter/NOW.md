# drivebay-flutter — Current handoff

## Goal

Ship **KAN-81** (storefront-aware dealer profile + listing viewing policies on
phone). Leave `ListingSellerCard` alone (friend rework / already on main).

## Current state

- App remote HEAD **`0bc1b3a`** (friend’s listing hero + seller card redesign).
- Local uncommitted **KAN-81** implementation:
  - **KAN-82**: dedicated Viewing options section on listing detail (Allowed /
    Not allowed); independent of seller block
  - **KAN-84**: `nullableMediaUrl` on `ListingSeller.logoUrl`; dealer
    logo/cover/page_background resolved in `DealerProfile.fromJson`
  - **KAN-83/85/86**: `dealer_storefront.dart` models; `/dealers/:slug` uses
    `DealerStorefrontHeader` (cover/theme/welcome/policies/contact/social/
    highlights/about) + inventory grid — no seller-card edits
- Stash still has older KAN-77 WIP + env (`stash@{0}`) — discard after QA if
  unused
- Backend viewing-policy flags still need drivebay migrate/ship (**KAN-73**)

## Exact next action

1. Hot restart; QA listing Viewing options + dealer profile storefront on device
2. Ask to commit/push `apps/drivebay-flutter`
3. Mark KAN-82…86 In Review / Done after QA; close epic **KAN-81** when verified
4. Ensure drivebay API flags + logo URLs available (migrate KAN-74)

## Decisions made

- Do **not** edit `listing_seller_card.dart` (positive-only chips may remain
  there from friend’s redesign; listing has its own Allowed/Not allowed section)
- Resolve media hosts at parse layer so all consumers get LAN-safe URLs
- Dealer profile replaces bare `ListingSellerCard` header with storefront shell

## Verification

- `dart analyze` on touched storefront/seller files: clean (info only)
- `flutter gen-l10n` + `build_runner` regenerated
