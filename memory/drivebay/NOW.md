# drivebay — Current handoff

## Goal

Ship **KAN-73** (dealer logo + viewing policies) + **KAN-80** QR dealer rating
(API + web UI). Flutter client is in `apps/drivebay-flutter` WIP.

## Current state

- Working tree on top of **`cace2cb`** (not committed) includes:
  - **KAN-80 API:** `POST /api/v1/dealers/{slug}/reviews` — `SellerReview`,
    `SellerReviewService`, `DealerReviewApiController`,
    `DealerQrReviewApiTest` (5 green).
  - **KAN-80 web:** `?src=qr` → Inertia `fromQr` + `DealerQrReviewPanel`;
    session `POST /dealers/{slug}/reviews` (`dealers.reviews.store`);
    `DealerQrReviewWebTest` (3 green). Combined filter: 8 green.
  - **KAN-74..78** viewing-policy flags / wizard / storefront chips (also WIP).
- Flutter QR client (profile QR + deep link rate) implemented locally; needs
  commit with backend.

## Exact next action

1. Ask user: commit/push `apps/drivebay` (KAN-80 + policy WIP) and
   `apps/drivebay-flutter`?
2. Deploy/migrate; QA web `?src=qr` rate + Flutter QR flow.
3. Mark **KAN-80** Done after verify; close epic **KAN-73** when Flutter+web
   policy slices also Done.

## Decisions made

- QR URL: `/dealers/{slug}?src=qr`. Reviews require `source: qr`.
- One review per user/dealer; QR reviews auto-approved; aggregates update
  `rating_average` / `rating_count`.
- Web uses session auth; API uses Sanctum+verified.

## Verification

- `php artisan test --filter=DealerQrReview` → 8 passed
