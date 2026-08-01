# drivebay — Current handoff

## Goal

Latest (2026-08-01): **KAN-103** API locale fix — UNCOMMITTED on `main` @ `fd36c97`,
awaiting user approval to commit/push. Prior slice: **KAN-101** moderation backend on
`feature/kan-100-moderation-api` (KAN-100 = `44f2fd9`, KAN-101 = `ef4a464`, QA = `f81243c`).

## Current state

- **KAN-103 (In Review, uncommitted on `main`)**: `api` middleware group had NO locale
  middleware — `SetLocale` is web-only and skips `api/*`, so ALL localized API strings
  (moderation warning titles/severity labels via `UserWarningStatusService`, validation
  messages) always rendered `en` regardless of the Flutter app's `Accept-Language`.
  Fix: new `app/Http/Middleware/SetApiLocale.php` appended via
  `$middleware->api(append: ...)` in `bootstrap/app.php` (normalizes header through
  `LocaleUrl::normalize`, only sets supported locales). New test
  `tests/Feature/Api/V1/ApiLocaleHeaderTest.php` (3 green). Also added missing SR key
  `marketplace.listing.report_user` = `Prijavi korisnika` (only EN/SR parity gap found
  across all `lang/{en,sr}/*.php`).

- Branch `feature/kan-100-moderation-api` @ `f81243c` (pushed).
- **QA follow-up (`f81243c`):** moderator `note` is now REQUIRED
  (`required|string|min:3|max:5000`, mirroring web `ApplyListingModerationRequest`) on
  `POST .../approve`, `POST .../unpublish`, and `PATCH /moderation/listings/{publicId}`;
  reject unchanged (`reason` required, `note` optional). Files: `ModerationApiController`
  (approve/unpublish inline validation), `UpdateModerationListingApiRequest`,
  `ApiModerationTest` (22 tests now), `docs/api/modules/moderation.md`,
  `docs/flutter/mobile-api-changelog.md` (breaking-change section), regenerated
  `docs/api/v1/openapi.json`. Note flows into AdminAction `reason` / audit / moderation
  case exactly as before (tests assert it).
- Three new staff endpoints in `routes/api/v1/moderation.php` (same
  `auth:sanctum, verified, staff` + `authorize('moderate', $listing)` gate):
  - `GET /moderation/listings/{publicId}` — full detail, **any status**; returns the same
    `ListingDetailResource` as public `GET /listings/{publicId}` so mobile reuses its
    ListingDetail model. `ListingDetailResource` changed so staff (canModerate) get the
    owner-view media set (unapproved photos visible) — affects public detail for staff too.
  - `PATCH /moderation/listings/{publicId}` — partial edit, body subset of `price`
    (→ `price_amount`), `title` (max 255), `description` + required `note`; empty body 422.
    New `UpdateModerationListingApiRequest`. Delegates to new
    `ListingModerationService::quickEdit` which reuses `ListingService::update`
    (listing_prices history row, slug regen, price-drop notify, search resync) and then
    records `listing_staff_edit` admin action + audit log + seller notification.
  - `POST /moderation/listings/{publicId}/unpublish` (required `note`) — delegates to the
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

1. Commit/push `apps/drivebay` main (KAN-103 middleware + test + SR key) after user
   approval; then mark KAN-103 Done after mobile QA in Serbian.
2. Open PR `feature/kan-100-moderation-api` → main covering KAN-100+101 once
   on-device QA finishes.
3. Flutter side (drivebay-flutter) consumes the new endpoints — see
   `docs/flutter/mobile-api-changelog.md` 2026-07-31 KAN-101 entry for the contract.
4. Deploy KAN-58 when releasing: `php artisan db:seed --class=RolesAndPermissionsSeeder`
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
- Required `note` mirrors the web panel exactly (`min:3|max:5000`, same as
  `ApplyListingModerationRequest`; Filament `EditListing::save()` also blocks empty
  notes) — no web-side discrepancy found. Reject deliberately left with optional `note`
  since `reason` is the mandatory field there (also matches web).

## Verification

- `ApiModerationTest` 22 passed / 121 assertions (KAN-100 + KAN-101 + 3 new missing-note
  422 tests; approve/unpublish/PATCH now assert the note persists on the AdminAction
  `reason` column).
- Regression green after the note change: ApiListingsTest, StaffRbacTest, StaffAccessTest,
  ListingPolicyTest, ListingModerationPipelineTest (48 passed / 220 assertions total in
  the combined run), ListingMediaPresenterTest (earlier run).
- Pre-existing failure (NOT from this change): `ListingDetailPriceRatingConfigTest` fails
  in `beforeEach` — taxonomy snapshot's first VehicleMake has no VehicleModel rows
  (ModelNotFound at test line 28, before any request). Worth a separate look/ticket.
- Pint clean; OpenAPI regenerated (new paths present). Not verified: manual end-to-end
  against a real device/Meilisearch.
