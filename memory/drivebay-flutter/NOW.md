# drivebay-flutter — Current handoff

## Goal

Ship **KAN-80** dealer QR (profile + rate-from-scan) alongside **KAN-81**
storefront-aware dealer profile. Leave friend `ListingSellerCard` redesign alone
where KAN-81 already replaces the dealer header.

## Current state

- App remote HEAD **`0bc1b3a`** (listing hero + seller card redesign).
- Local uncommitted **KAN-80 QR** (this machine):
  - Profile: `DealerQrCard` → `…/dealers/{slug}?src=qr` (copy / share / print PNG)
  - Deep link preserves `src=qr`; dealer page rate CTA + sheet →
    `POST /dealers/{slug}/reviews` with `source: qr`
  - Login honors `?redirect=` for post-login return to QR dealer page
  - Deps: `qr_flutter`, `path_provider`
- **KAN-81** storefront slice documented in memory (KAN-82…86); may land on
  another working tree — when merging, keep QR `fromQr` rate CTA on the dealer
  storefront body (not only on old `_ProfileListings`).
- Backend: KAN-80 API+web Pest 8 green in `apps/drivebay` WIP; KAN-73 flags need
  migrate/ship for viewing-policy UI.

## Exact next action

1. Ask user: commit/push `apps/drivebay` + `apps/drivebay-flutter` (QR + backend).
2. Hot restart QA: Profile QR → scan/open → Rate → submit; also storefront if present.
3. If KAN-81 storefront replaces dealer header, re-attach rate CTA under it.
4. Mark KAN-80 Done after deploy/QA; close KAN-81 / KAN-73 when verified.

## Decisions made

- QR encodes **web** dealer URL with `src=qr` (App Links open app).
- Rating only when arrival was via QR (`fromQr` / `src=qr`).
- Prefer storefront slug from `account.profile.dealerStorefrontUrl`; fallback
  `GET /dealer/storefront`.
- KAN-81: do not edit `listing_seller_card.dart` for storefront; listing Viewing
  options is a separate section (KAN-82).

## Changed files (local QR, uncommitted)

- `lib/features/profile/widgets/dealer_qr_card.dart` (new)
- `lib/features/sellers/widgets/dealer_rate_sheet.dart` (new)
- `lib/features/profile/profile_screen.dart`
- `lib/features/sellers/seller_profile_screen.dart`
- `lib/features/auth/login_screen.dart` + `app_router.dart`
- `lib/core/deep_link/deep_link_service.dart`
- `lib/repositories/seller_profile_repository.dart`
- `lib/utils/listing_url.dart`
- `lib/l10n/*`, `pubspec.yaml` / `pubspec.lock`

## Verification

- `flutter gen-l10n`; QR-related `dart analyze` clean
- Backend `DealerQrReview` filter: 8 passed (API+web)
