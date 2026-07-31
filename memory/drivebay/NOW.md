# drivebay — Current handoff

## Goal

**KAN-100** mobile moderation mode. Backend API slice **committed and pushed** as
`44f2fd9` on branch `feature/kan-100-moderation-api` (based on `fd36c97`). Flutter slice
is done in parallel (drivebay-flutter `feature/kan-100-moderation-mode`, `2b981ba`).

## Current state

- Branch `feature/kan-100-moderation-api` @ `44f2fd9`, pushed to origin (PR to main
  still to open). New staff-only API module under `/api/v1/moderation`:
  - `GET /moderation/listings` — paginated queue, default `status=pending_review`,
    oldest-first; optional `status` filter (six-value allowlist) + `per_page` (1–50, default 20).
    Items are `ListingCardResource` (same card as catalog/search); envelope
    `{data, meta:{current_page,per_page,total,last_page}}` via `ApiResponse::collection`.
  - `POST /moderation/listings/{publicId}/approve` (optional `note`) and
    `.../reject` (`reason` required, max 1000; optional `note`) — both delegate to
    `ListingModerationService::approve/reject` (zero duplicated status logic) and return
    the updated card. `GET /moderation/stats` → `{data:{pending_count}}`.
  - Gate: route middleware `auth:sanctum, verified, staff` (`EnsureStaff` →
    `StaffAccessService::canModerateListings`) + `authorize('moderate', $listing)` on
    actions, mirroring the web `ListingModerationController`.
  - Files: `app/Http/Controllers/Api/V1/ModerationApiController.php`,
    `app/Http/Requests/Api/V1/Moderation/RejectListingApiRequest.php`,
    `routes/api/v1/moderation.php` (mounted in `routes/api.php`),
    `tests/Feature/Api/V1/ApiModerationTest.php`, `docs/api/modules/moderation.md`,
    rows in `docs/api/INDEX.md` + `docs/flutter/mobile-api-changelog.md`.
  - `composer run api:docs` regenerated `docs/api/v1/openapi.json` — also catches up
    endpoints shipped since KAN-13 (password reset, viewing reschedule, dealer
    reviews/storefront, messaging typing/report, compare); expected drift, not a bug.
- KAN-58 RBAC (`fd36c97` on main) is the foundation; deploy steps in "next action" below
  still pending on the server.
- Left dirty locally (do not commit): `package-lock.json`, `docs/og-preview-mock.html`.

## Exact next action

1. Open PR `feature/kan-100-moderation-api` → main; QA end-to-end with the Flutter
   branch, then move KAN-100 to In Review/Done.
2. Deploy KAN-58 when releasing: `php artisan db:seed --class=RolesAndPermissionsSeeder`
   then `php artisan staff:backfill-roles` (dry-run first).

## Decisions made

- Moderation API reuses the `staff` middleware + `ListingPolicy@moderate` — no parallel gate.
- Queue "pending" = `listings.status = 'pending_review'` (same as Filament attention
  widget/stats); queue ordered oldest-created first (FIFO).
- Approve/reject responses return the updated `ListingCardResource` (not `{message}`)
  so mobile can update its list in place.
- No extra throttle on moderation endpoints (matches web moderation actions).

## Verification

- `ApiModerationTest` 10 passed / 53 assertions (queue, status filter, invalid filter 422,
  approve, reject + reason required, admin access, non-staff 403, guest 401, stats).
- Related suites re-run green: StaffRbacTest, StaffAccessTest, ListingPolicyTest,
  ListingModerationPipelineTest, ApiListingsTest — 26 passed / 99 assertions.
- Pint clean. Not verified: manual end-to-end against a real device/Meilisearch.
