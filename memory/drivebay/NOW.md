# drivebay — Current handoff

## Goal

**KAN-101** "Mobile moderation tools v2" backend slice — implemented on top of the
KAN-100 moderation API. KAN-100 is committed/pushed as `44f2fd9` on
`feature/kan-100-moderation-api`; the **KAN-101 changes are UNCOMMITTED** on that same
branch (parent agent to ask user before committing/pushing the app repo).

## Current state

- Branch `feature/kan-100-moderation-api` @ `44f2fd9` + uncommitted KAN-101 working tree.
- Three new staff endpoints in `routes/api/v1/moderation.php` (same
  `auth:sanctum, verified, staff` + `authorize('moderate', $listing)` gate):
  - `GET /moderation/listings/{publicId}` — full detail, **any status**; returns the same
    `ListingDetailResource` as public `GET /listings/{publicId}` so mobile reuses its
    ListingDetail model. `ListingDetailResource` changed so staff (canModerate) get the
    owner-view media set (unapproved photos visible) — affects public detail for staff too.
  - `PATCH /moderation/listings/{publicId}` — partial edit, body subset of `price`
    (→ `price_amount`), `title` (max 255), `description`, optional `note`; empty body 422.
    New `UpdateModerationListingApiRequest`. Delegates to new
    `ListingModerationService::quickEdit` which reuses `ListingService::update`
    (listing_prices history row, slug regen, price-drop notify, search resync) and then
    records `listing_staff_edit` admin action + audit log + seller notification.
  - `POST /moderation/listings/{publicId}/unpublish` (optional `note`) — delegates to the
    **pre-existing** `ListingModerationService::unpublish` (same as web moderation):
    status → `pending_review` (NOT `draft`), moderation_status → `pending`, search doc
    unsearchable, `listing_unpublished` admin action, staff pending-review notification.
  - All three return `{data: ListingCard}` (PATCH/unpublish) or `{data: ListingDetail}` (GET).
- Files touched: `ModerationApiController` (+show/update/unpublish),
  `ListingModerationService` (+quickEdit), `ListingDetailResource` (staff media),
  `UpdateModerationListingApiRequest` (new), `routes/api/v1/moderation.php`,
  `ApiModerationTest` (+9 tests), `docs/api/modules/moderation.md`,
  `docs/flutter/mobile-api-changelog.md`, regenerated `docs/api/v1/openapi.json`.
- Still dirty locally (do not commit): `package-lock.json`, `docs/og-preview-mock.html`.

## Exact next action

1. User to approve commit+push of `apps/drivebay` KAN-101 changes on
   `feature/kan-100-moderation-api`; then open PR → main covering KAN-100+101.
2. Flutter side (drivebay-flutter) consumes the new endpoints — see
   `docs/flutter/mobile-api-changelog.md` 2026-07-31 KAN-101 entry for the contract.
3. Deploy KAN-58 when releasing: `php artisan db:seed --class=RolesAndPermissionsSeeder`
   then `php artisan staff:backfill-roles` (dry-run first).

## Decisions made

- Unpublish maps to the existing service transition `pending_review` (what web/Filament
  moderation uses), not `draft` — mobile queue default shows unpublished listings again.
- PATCH price goes through `ListingService::update` (seller pipeline) via new
  `ListingModerationService::quickEdit`, NOT `applyChanges`, so price history rows are
  written; the older web quick-edit still uses `applyChanges` (no price history) — known
  asymmetry, candidate follow-up ticket.
- PATCH field is `price` (per KAN-101 spec), mapped to `price_amount` server-side.
- Staff now see unapproved photos in `ListingDetailResource` (gallery/media) on any detail
  endpoint — needed so pending listings are reviewable from mobile.

## Verification

- `ApiModerationTest` 19 passed / 108 assertions (10 KAN-100 + 9 new: pending/draft detail,
  public-vs-moderation 404/403 parity, unpublish transition + admin action, PATCH price →
  listing_prices row + SyncListingSearchDocumentJob pushed + listing_staff_edit action,
  title/description persist + slug regen, partial patch isolation, 422s, non-staff 403).
- Regression green: ApiListingsTest, StaffRbacTest, StaffAccessTest, ListingPolicyTest,
  ListingModerationPipelineTest (26 passed / 99 assertions), ListingMediaPresenterTest.
- Pre-existing failure (NOT from this change): `ListingDetailPriceRatingConfigTest` fails
  in `beforeEach` — taxonomy snapshot's first VehicleMake has no VehicleModel rows
  (ModelNotFound at test line 28, before any request). Worth a separate look/ticket.
- Pint clean; OpenAPI regenerated (new paths present). Not verified: manual end-to-end
  against a real device/Meilisearch.
