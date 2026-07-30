# drivebay — Current handoff

## Goal

Finish **KAN-73** viewing-policy / dealer logo slices. **KAN-80** QR dealer
rating API + web UI is on `main`.

## Current state

- App remote HEAD **`0a9ed54`** — `KAN-80: add QR-gated dealer review API and
  web rate panel.`
  - API: `POST /api/v1/dealers/{slug}/reviews` (Sanctum + verified, `source: qr`)
  - Web: `?src=qr` → `DealerQrReviewPanel`; session `POST /dealers/{slug}/reviews`
  - Pest `DealerQrReview*` — 8 green at ship time
- Flutter QR client shipped as `d962551` in `apps/drivebay-flutter`.
- **KAN-74..78** viewing-policy flags may still be WIP or on another tree —
  confirm before closing epic **KAN-73**.

## Exact next action

1. Deploy/migrate; QA web `?src=qr` + Flutter QR rate flow on device.
2. Mark **KAN-80** Done after verify.
3. Land remaining KAN-73 policy/logo work; close epic when Flutter+web Done.

## Decisions made

- QR URL: `/dealers/{slug}?src=qr`. Reviews require `source: qr`.
- One review per user/dealer; QR reviews auto-approved; aggregates update
  `rating_average` / `rating_count`.
- Web uses session auth; API uses Sanctum+verified.

## Verification

- `php artisan test --filter=DealerQrReview` → 8 passed (pre-commit)
- Pushed `0a9ed54` to `origin/main`
