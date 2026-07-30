# drivebay — Core marketplace domains (Listing, Vehicle, Moderation, Media, Search, Recommendation)

Supplements `topics/architecture.md`, `topics/domain.md`, and `apps/drivebay/CLAUDE.md` — does
not repeat the domain list, tech stack, or high-level purpose already there. Evidence verified
2026-07-15 at commit `8f7840f`. All paths are relative to `apps/drivebay/`.

## Listing

Purpose: the sellable unit's full lifecycle (draft → moderate/media-process → publish →
sold/expired/rejected) plus the fan-out that keeps search, notifications, and dealer linkage
in sync with that lifecycle.

**Key services**
| Class | Role |
|---|---|
| `ListingService` | Core CRUD + lifecycle: `createDraft`, `update`, `publish`, `approve`, `markAsSold`, `reject`, `syncSearchDocument` (`app/Domains/Listing/Services/ListingService.php:17`). **KAN-73:** wires `allows_test_drive` / `allows_mechanic_visit` from CreateListingDTO/update; DB columns nullable for legacy backfill, Store/Update `required\|boolean`. |
| `ListingPublishCoordinator` | Auto-publishes a listing once all its queued media finishes processing (`app/Domains/Listing/Services/ListingPublishCoordinator.php:16-38`) |
| `ListingModerationPipelineService` | Runs the auto-publish decision + auto-approves eligible Autodiler photos, notifies seller (`app/Domains/Listing/Services/ListingModerationPipelineService.php:19-51`) |
| `ListingAutoPublishEvaluator` | Pure rule evaluator producing `AutoPublishDecision` (blocking reasons, min-photo count, flagged check) (`app/Domains/Listing/Services/ListingAutoPublishEvaluator.php:12-52`) |
| `ListingSearchDocumentBuilder` | Builds/updates `ListingSearchDocument` row + syncs `features()` pivot (`app/Domains/Listing/Services/ListingSearchDocumentBuilder.php:10-95`) |
| `ListingHistoryService`, `ListingExchangePreferenceService`, presenters (`*Presenter.php`) | Supporting/read-model helpers, no cross-domain effects |

**Models** (`app/Models/Domains/Listing/Models/`)
- `Listing` — `belongsTo` vehicle/seller/dealerAccount/city/country/region; `hasMany` media,
  statusHistory, versions, prices, features, exchangePreferences, messageThreads, leads,
  listingPromotions, viewingAppointments; `hasOne` searchDocument, viewingSetting,
  latestInstagramPost. Uses `SoftDeletes` + `OwenIt\Auditing` (`Listing.php:27-266`).
- `ListingSearchDocument` — separate Scout-`Searchable` model (`searchableAs()` →
  `listing_search_documents`), **not** the `Listing` model itself (`ListingSearchDocument.php:11-129`).

**Cross-domain connections (most important part)**
- `ListingService::publish/approve` dispatches `ListingPublished` event + `SyncListingSearchDocumentJob`.
  Only one listener is registered: `SendListingPublishedNotification` → Notification domain, wired in
  `app/Providers/AppServiceProvider.php:69` (no dedicated EventServiceProvider in this app).
- (**Jira: KAN-12** fixed `bbaa5b6`): removed dead `ListingUpdated` event class and all dispatches
  from `ListingService::update` and `ListingModerationService::applyChanges/completeAdminPanelEdit`.
  Listing updates still fan out via direct `SyncListingSearchDocumentJob` dispatch and
  `PriceDropNotificationService` where applicable — no domain event on update.
- Media → Listing: `ProcessListingMediaJob::handle` calls
  `ListingPublishCoordinator::checkListingReady()` after each asset finishes, which auto-publishes the
  listing once no media is left `queued`/`processing` (`app/Domains/Media/Jobs/ProcessListingMediaJob.php:87`).
- Media → Listing (moderation): `ListingModerationPipelineService` depends directly on
  `Media\Services\ListingMediaModerationService` to bulk-approve pending Autodiler placeholder
  photos before evaluating auto-publish (`ListingModerationPipelineService.php:31`).
- Moderation → Listing: `ListingModerationService::applyChanges/approve/reject/unpublish` is the
  admin-side mutator; every path re-dispatches `SyncListingSearchDocumentJob` or unsearches the
  document, and calls `AdminDatabaseNotificationService`/`AdminStaffNotificationService`/
  `ListingNotificationService` (Notification domain) (`ListingModerationService.php:197-243`).
- Listing → Dealer: `publish()` auto-links an unlinked listing to the seller's dealer account via
  `DealerListingLinker` before changing status (`ListingService.php:180-187`).
- Listing → SocialPublishing: `markAsSold()` dispatches
  `UpdateInstagramSoldCaptionJob` (`ListingService.php:241`).
- Listing → Notification: price drops on `update()` trigger
  `PriceDropNotificationService::notifyFavoriters` (`ListingService.php:166`) — a Search-domain
  entity (favorites) reacting to a Listing-domain mutation.

**Non-obvious rules**
- Auto-publish requires **both** `platform_config('moderation.auto_publish_imports')` true AND zero
  blocking reasons; minimum eligible photo count defaults to 3
  (`platform_config('moderation.auto_publish_min_photos')`) and required-field list is configurable
  via `config('drivebay.moderation.auto_publish_required_fields')` (`ListingAutoPublishEvaluator.php:17-99`).
- `exchange_mode = cash_only` always nulls `exchange_direction`/`exchange_notes`/preferred-vehicle
  rows, enforced in two places (`ListingService.php:30-41,46-62`) — don't set exchange fields
  without going through these normalizers.
- Public API/route identity uses `public_id` (8-char uppercase random, collision-checked) never the
  numeric `id` (`ListingService.php:290-297`), consistent with `apps/drivebay/CLAUDE.md`.

---

## Vehicle

Purpose: vehicle specs/taxonomy (make/model/generation/trim/engine) attached to a `Listing`, plus
the mobile.de-sourced taxonomy import pipeline and VIN decoding.

**Key services**
| Class | Role |
|---|---|
| `VehicleService` | Thin facade, only wraps `VinDecoderService::decodeVin` (`app/Domains/Vehicle/Services/VehicleService.php:5-18`) |
| `VinDecoderService` | Calls NHTSA `vpic.nhtsa.dot.gov` VIN-decode API, 3 retries, returns null-safe array on failure (`VinDecoderService.php:15-49`) |
| `VehicleEngineResolverService` | Finds-or-creates a `VehicleEngine` row matching specs (trim/generation/fuel/transmission/drivetrain/power/displacement), used by Autodiler import and seller forms (`VehicleEngineResolverService.php:13-74`) |
| `VehicleTaxonomyDeletionGuard` | Blocks deleting a make/model/group in Filament if models/generations/vehicles/`ListingSearchDocument` rows still reference it (`VehicleTaxonomyDeletionGuard.php:13-78`) |
| `VehicleTaxonomyImporter`, `MobileDe/MobileDeTaxonomyImporter`, `MotorcycleTaxonomyImporter`, `MobileDe/MobileDeTaxonomySnapshotService` | Taxonomy import/snapshot pipeline (largest files in the domain, 370/404/281 lines) — seeded from the committed snapshot per `apps/drivebay/CLAUDE.md`/`docs/database/vehicle-taxonomy-import.md`, not live calls in the default seeder |

**Models** (`app/Models/Domains/Vehicle/Models/`)
- `Vehicle` — `belongsTo` type/make/modelDef/generation/trim/engine/bodyStyle/exteriorColor/
  interiorColor; `hasMany` listings; `belongsToMany` features (pivot `vehicle_feature_vehicle`
  w/ `source`,`confidence_score`). Helper accessors `fuelTypeCode()`/`transmissionCode()`/
  `drivetrainCode()`/`powerHp()`/`powerKw()`/`displacementCc()` all **prefer the linked `engine`'s
  value, fall back to the vehicle's own column** (`Vehicle.php:156-190`) — read these accessors,
  not the raw columns, when you need the effective spec.
- Taxonomy tree: `VehicleMake` → `VehicleModelGroup`/`VehicleModel` → `VehicleGeneration` →
  `VehicleTrim` → `VehicleEngine`; plus flat lookup tables `BodyStyle`, `Drivetrain`, `FuelType`,
  `Transmission`, `ExteriorColor`, `InteriorColor`, `VehicleType`.
- `TaxonomyImportRun`/`TaxonomyImportLog`/`TaxonomyImportLogContext` — audit trail for import jobs.

**Cross-domain connections**
- Vehicle → Listing/Search: `ListingSearchDocumentBuilder` and `SearchService` read
  `vehicle.engine` first for fuel/transmission/drivetrain codes before the vehicle's own columns
  (mirrors the model accessor fallback) (`ListingSearchDocumentBuilder.php:59-61`,
  `SearchService.php:186-206`).
- Vehicle → Moderation: `photo_approval_requested` lives on the **`Vehicle`** row (not `Listing`),
  toggled by `Media\Services\ListingMediaModerationService::requestPhotoReview/clearListingApprovalFlagIfComplete`
  (`ListingMediaModerationService.php:165-197`) — a Media-domain service writing a Vehicle-domain
  column.
- `VehicleEngineResolverService` is called during Autodiler import to attach/create an engine record
  per seller-submitted spec set (creates synthetic `engine_code = 'seller-<uuid8>'` when no match
  found) (`VehicleEngineResolverService.php:54-68`).

**Non-obvious rules**
- Deleting taxonomy nodes in Filament is blocked, not cascaded — `VehicleTaxonomyDeletionGuard`
  must return `null` for all three check methods before a make/model/group can be removed.
- Taxonomy import order and snapshot format are documented in
  `docs/database/vehicle-taxonomy-import.md`; CarQuery import is legacy per
  `apps/drivebay/CLAUDE.md` — confirmed still present as `ImportCarQueryDataCommand`/
  `ImportCarQueryChunkJob` but not part of the default seeder.

---

## Moderation

Purpose: everything staff-facing that isn't listing CRUD itself — admin edits/approvals of
listings, user reports, warnings, selling restrictions, audit logging, and staff notification
routing.

**Key services** (`app/Domains/Moderation/Services/`, 17 files, ~2,336 lines total)
| Class | Role |
|---|---|
| `ListingModerationService` (359 lines) | Admin-side listing mutation: `applyChanges`, `approve`, `reject`, `unpublish`, `completeAdminPanelEdit`, plus seller-visible activity feed (`sellerActivityFor`/`notesForListing`) (`ListingModerationService.php:15-359`) |
| `ListingReportService` | Buyer-facing "report this listing" — blocks self-reports and duplicate open reports, increments `Listing.report_count` (`ListingReportService.php:27-62`) |
| `ReportResolutionService` | Staff resolves/rejects a `Report`; notifies reporter always, notifies seller only when `resolved` (`ReportResolutionService.php:20-97`) |
| `UserWarningService` (332 lines) | Issue/lift/acknowledge warnings; builds an "engagement payload" for a modal warning display (`engagementPayload`) (`UserWarningService.php:32-200`) |
| `UserSellingRestrictionService` (249 lines) | Issue/lift time-boxed or indefinite selling bans; `activeForUser()` lazily auto-expires past-due restrictions on read (`UserSellingRestrictionService.php:40-59`) |
| `AdminActionService`, `AuditLogService`, `FieldChangeRecorder` | Generic before/after change recording (`AdminAction`, `AuditLog` rows) shared by every mutator above |
| `AdminStaffNotificationService`, `AdminDatabaseNotificationService`, `AdminAttentionService` | Staff-facing notification/attention-queue plumbing (new report, pending review, photo review requested, etc.) |
| `StaffAccessService` | Central `canModerateListings()` gate used by `ListingPolicy` and others |

**Models** (`app/Models/Domains/Moderation/Models/`)
- `Report` — `belongsTo` reporter/reportedUser/reportedDealer/listing/resolver.
- `UserWarning`, `UserSellingRestriction` — both use UUID route keys (`getRouteKeyName()` →
  `uuid`), `scopeActive()` (warning: `whereNull('lifted_at')`; restriction: also requires
  `ends_at` null-or-future), `isActive()`/`hasExpired()`/`isIndefinite()` helpers
  (`UserWarning.php:44-96`, `UserSellingRestriction.php:40-111`).
- `ModerationCase` — freeform per-entity case/notes log, appended to (not replaced) by
  `ListingModerationService::appendModerationCaseNote` (`ListingModerationService.php:316-344`).
- `AdminAction`/`AdminActionChange`, `AuditLog`/`AuditLogChange`, `FraudSignal`/`FraudSignalDetail`,
  `SellerReview` — present but not deep-dived here; `FraudSignal` in particular has no producing
  service found under `Domains/Moderation/Services/` in this pass (check before assuming it's wired up).

**Cross-domain connections**
- Moderation → Listing → Search: every `ListingModerationService` mutator re-syncs
  `ListingSearchDocument` (dispatches `SyncListingSearchDocumentJob` if now `active`, otherwise
  `unsearchable()`) — same rule as `ListingService` itself (`ListingModerationService.php:186-190,272-276`).
- Moderation → Media: `ListingModerationPipelineService` (Listing domain) directly injects
  `Media\Services\ListingMediaModerationService` to bulk-approve Autodiler placeholders
  (see Listing section above).
- Moderation → Notification: nearly every action here ends in a `Notification::query()->create()`
  or a `ListingNotificationService`/`AdminStaffNotificationService`/`AdminDatabaseNotificationService`
  call — Moderation is the biggest producer of in-app notifications in the codebase.
- Reports increment `Listing.report_count` directly (no event) — `ListingAutoPublishEvaluator`
  reads that same counter combined with `moderation_status === 'flagged'` to block auto-publish
  (`ListingAutoPublishEvaluator.php:39`).
- Filament `EditListing` page calls `ListingModerationService::completeAdminPanelEdit` directly
  (`app/Filament/Admin/Resources/Listings/Pages/EditListing.php:95`) — the admin UI's "save" action
  is not a thin CRUD save, it's this domain's audited-change path.

**Non-obvious rules**
- `ListingReportService::report()` throws a `ValidationException` (not a policy denial) both for
  self-reports and for a second open report from the same user on the same listing
  (`ListingReportService.php:29-45`).
- `UserSellingRestrictionService::issue()` throws `RuntimeException` if a restriction is already
  active for that user — restrictions do not stack (`UserSellingRestrictionService.php:68-70`).
- `sellerVisibleActionTypes()` is a hard-coded allowlist gating what admin actions ever surface to
  the seller ("moderation_note", "listing_admin_edit", "listing_staff_edit", "listing_approved",
  "listing_rejected", "listing_unpublished") — new action types are invisible to sellers unless
  added here (`ListingModerationService.php:97-107`).

---

## Media

Purpose: listing photo upload, async processing (resize/watermark + variant generation), and
admin photo moderation — entirely custom; Spatie Media Library was removed (**Jira: KAN-16**).

**Key services**
| Class | Role |
|---|---|
| `ListingMediaService` | Upload intake (`queueFromUpload`), synchronous seeder/admin attach (`attachFromPath`), Autodiler placeholder ingestion (`attachAutodilerPlaceholder`), delete/reorder/requeue (`ListingMediaService.php:15-330`) |
| `ProcessListingMediaJob` | Queued: processes the incoming file via `ListingImageProcessor`, persists `variants_json`, flips asset to `processing_status=completed`, then calls `ListingPublishCoordinator::checkListingReady` (`ProcessListingMediaJob.php:17-176`) |
| `ListingImageProcessor` | Uses **Intervention Image** to emit original JPEG + original WebP + thumb JPEG + thumb WebP, with watermarking applied during first-pass processing (`ListingImageProcessor.php:8-178`) (**Jira: KAN-40**) |
| `BackfillListingMediaVariantsCommand` | One-off/idempotent regeneration of missing WebP/thumb variants for already processed public listing images (`app/Domains/Media/Console/BackfillListingMediaVariantsCommand.php`) |
| `WatermarkGenerator`, `WatermarkPreviewService` | Generate/cache the watermark image and admin preview render |
| `ListingMediaModerationService` | Admin approve/disallow/remove of individual photos; bulk-approve Autodiler placeholders; `photo_approval_requested` flag lifecycle on `Vehicle` (`ListingMediaModerationService.php:14-225`) |

**Models** (`app/Models/Domains/Media/Models/`)
- `MediaAsset` — the physical file record: disk/path/dimensions/checksum, `variants_json`,
  `is_import_placeholder` + `requires_reupload` + `approval_requested` flags drive the whole
  Autodiler-photo-approval flow; computed `url` accessor only resolves for `disk === 'public'`
  and helper methods expose variant URLs (`MediaAsset.php:100-190`).
- `ListingMedia` — the join between a `Listing` and a `MediaAsset` (role/sort_order/is_primary/
  moderation_status); `getIsCoverAttribute()` is just an alias for `is_primary` (`ListingMedia.php:41-44`).

**Cross-domain connections**
- Media → Listing: `ProcessListingMediaJob` (success or `failed()`) always calls back into Listing
  domain — either `ListingPublishCoordinator::checkListingReady()` (auto-publish once all media
  done) or `ListingNotificationService::notifyProcessingFailed` when every asset for a `processing`
  listing has failed (`ProcessListingMediaJob.php:87,130-175`).
- Media → Moderation: `ListingMediaModerationService` calls
  `AdminDatabaseNotificationService::resolvePhotoReviewForListing` after every approve/disallow/
  delete, and `AdminStaffNotificationService::notifyPhotoReviewRequested` when a seller/import flow
  requests review (`ListingMediaModerationService.php:37,72,91,100,195-196`).
- Media → Vehicle: photo-approval state (`photo_approval_requested`) is stored on `Vehicle`, not
  `Listing` or `MediaAsset` (see Vehicle section).
- Media → Listing (auto-publish gate): `ListingAutoPublishEvaluator::countEligiblePhotos` has
  different eligibility rules for import-placeholder vs. regular photos (placeholder needs
  `moderation_status=approved` **and** `is_public`; regular needs `approved` + `is_public` +
  `processing_status=completed`) (`ListingAutoPublishEvaluator.php:109-132`).

**Non-obvious rules / stale docs**
- **KAN-16 fixed**: stale Spatie docs/rules/config were removed; the supported architecture is the
  custom `MediaAsset` / `ListingMedia` + `Intervention\Image` pipeline only.
- Uploaded originals land at `listings/{id}/incoming/{uuid}.jpg`, processed output at
  `listings/{id}/{uuid}.jpg` on `config('drivebay.media.disk', 'public')`
  (`ListingMediaService.php:30-31`) — the incoming file is deleted only after successful processing
  (`ProcessListingMediaJob.php:65`).
- **KAN-40**: variants live in `media_assets.variants_json` and are generated inline with the
  canonical processed image so `ListingPublishCoordinator` / `ListingAutoPublishEvaluator` still
  treat one `processing_status=completed` as the publish-ready boundary.
- `ListingMediaService::delete()` reassigns `is_primary`/`media_role=cover` to the next photo by
  `sort_order` when the deleted photo was primary (`ListingMediaService.php:214-230`) — order
  matters for what becomes the new cover.

---

## Search

Purpose: buyer-facing listing search/filter/sort (Scout+Meilisearch primary, raw-SQL fallback),
plus favorites, saved searches, compare lists, and recently-viewed.

**Key services**
| Class | Role |
|---|---|
| `SearchService` | `search()` picks Meilisearch (`ListingSearchDocument::search()`) unless `requiresDatabaseSearch()` forces the raw-SQL path; catches any Scout/Meilisearch exception and falls back silently (`SearchService.php:15-55,392-398`) |
| `FavoriteService` | `firstOrCreate`/delete/exists on `Favorite`; atomically maintains `listings.favorites_count` on add/remove (**Jira: KAN-9**) (`FavoriteService.php`) |
| `SavedSearchService` | CRUD for `SavedSearch` + its `features` pivot, column mapping via `SearchFilterColumns` |
| `CompareService` | Up to `MAX_ITEMS = 4` listings, either from a comma-joined `public_id` query string or the user's persisted `ComparisonList` (`CompareService.php:13-81`) |
| `RecentlyViewedService` | **Session-only** (Laravel session, 12-item cap), not a DB table — separate from `UserListingInteraction`, which is the Recommendation domain's own view-tracking table (`RecentlyViewedService.php:11-27`) |

**Models** (`app/Models/Domains/Search/Models/`)
- `SavedSearch` — one row per saved filter set with ~25 individual `filter_*` columns (not a JSON
  blob) plus `belongsToMany` `features` (pivot `saved_search_features`) (`SavedSearch.php:15-98`).
- `Favorite`, `SearchLog`, `ComparisonList`/`ComparisonListItem` — thin join/log tables.

**Cross-domain connections**
- Search → Listing: `SearchService::searchDatabase()` and `ListingSearchDocumentBuilder` both read
  `vehicle.engine` before `vehicle`'s own fuel/transmission/drivetrain/power/displacement columns
  (same fallback pattern as the `Vehicle` model accessors) (`SearchService.php:186-227`).
- Search → Recommendation: sort keys `sort_recommendation_score`/`sort_boost_score` on
  `ListingSearchDocument` are populated from `Listing.recommendation_score`/`boost_score`
  (written elsewhere, presumably Recommendation/Promotion domains — not written by Search itself)
  (`ListingSearchDocumentBuilder.php:79-81`).
- `Console/SendSavedSearchAlertsCommand` (scheduled hourly, `routes/console.php:18`) queries
  `Listing` directly with a **small hand-rolled filter subset** (make, price min/max, text LIKE)
  — it does not reuse `SearchService`/Meilisearch and does not support most `SavedSearch` filter
  columns (body style, mileage, power, etc. are ignored) (`SendSavedSearchAlertsCommand.php:32-51`).
- `FavoriteApiController`/`FavoriteController` call `RecommendationService::recordInteraction(...,
  'favorite', ...)` after adding a favorite — Search-domain action feeding the Recommendation
  domain's interaction log.

**Non-obvious rules / stale docs**
- **Doc nuance**: `apps/drivebay/CLAUDE.md`/`docs/search/search_architecture.md` say search "must
  go through Scout/Meilisearch" / "never build raw SQL search." In practice `SearchService` has a
  deliberate, permanent raw-SQL `searchDatabase()` path used whenever `publishedSince`,
  `priceReduced`, `promotionTypeCode`, or `modelName` filters are present (Meilisearch can't express
  them with the current filter builder), **and** as an automatic fallback on any Scout exception
  (`SearchService.php:392-398`). This isn't a doc bug so much as an unwritten exception — worth
  knowing before assuming every search request hits Meilisearch.
- (**Jira: KAN-9** fixed): `FavoriteService` now maintains `listings.favorites_count`; use
  `favorites:backfill-counts` once after deploy for historical rows. `SellerAnalyticsService`
  still reads the column.

---

## Recommendation

Purpose: per-listing "similar" results and per-user "recommended for you" candidates, built from
heuristic content-based/collaborative/trending scoring — no ML models (matches `DOM-3` in
`topics/domain.md`).

**Key services / jobs**
| Class | Role |
|---|---|
| `RecommendationService` | Read API: `recordInteraction()` (writes `UserListingInteraction`), `similarListings()` (reads `ListingSimilarity`, falls back to same-make/model query), `recommendedForUser()` (reads `RecommendationCandidate`, falls back to `legacyRecommendedForUser` make-based query), `trendingListings()` (`RecommendationService.php:15-160`) |
| `RecommendationProfileBuilder` | Rebuilds one user's `RecommendationProfile` (preferred price/year range, engagement/buyer-intent scores) from their last 90 days of `view`/`favorite`/`contact` interactions (`RecommendationProfileBuilder.php:13-49`) |
| `ComputeListingSimilarityJob` | Content-based pairwise scoring (same make/model, year proximity, price ratio) → `ListingSimilarity` rows, min score 0.3 (`ComputeListingSimilarityJob.php:27-98`) |
| `BuildRecommendationCandidatesJob` | Blends content-based (profile prefs) + collaborative (co-viewed by other users) + trending sources, dedupes by max score, keeps top 40 per user, `expires_at = +24h` (`BuildRecommendationCandidatesJob.php:31-77`) |
| `ComputeListingRecommendationScoresJob` | Writes `listings.recommendation_score` via `ListingRecommendationScoreService`; syncs search docs (**Jira: KAN-30**) |
| `RefreshRecommendationProfileJob` | Batch-rebuilds profiles for users with any interaction row |
| `RebuildRecommendationsCommand` (`recommendations:rebuild {--user=}`) | Runs similarity → scores → profiles → candidates **synchronously** |

**Models** (`app/Models/Domains/Recommendation/Models/`)
- `UserListingInteraction` — event log (`user_id` nullable for anonymous, `interaction_type`,
  `source`), no `updated_at` semantics beyond creation.
- `RecommendationCandidate` — `$timestamps = false`; scored/ranked per user with `expires_at`.
- `ListingSimilarity`, `RecommendationProfile` (+ `RecommendationProfileMake`/`Model`/
  `VehicleType`/`Location` child pivots, replaced wholesale on each rebuild via `delete()`+`create()`
  loops, not `sync()`) (`RecommendationProfileBuilder.php:64-89`).

**Cross-domain connections**
- Recommendation ← Listing/Search/Analytics: `recordInteraction()` is called from
  `ListingController`, `FavoriteController`/`FavoriteApiController`, `StorefrontListingController`,
  and `ListingAnalyticsApiController` — i.e. views, favorites, and analytics-tracked events across
  Web/API/Storefront all feed this domain's `UserListingInteraction` log.
- Recommendation → Search: `ListingRecommendationScoreService` writes
  `listings.recommendation_score` (config weights in `config/recommendations.php`); search-doc sync
  copies to `sort_recommendation_score`. `SearchService` + API `SearchFilterQueryRules` accept
  `sort=recommendation` (**Jira: KAN-32**, closes **KAN-25**). Collaborative candidates fixed in
  **KAN-30** (also-viewed of *other* listings). Profile builder uses `view`/`favorite`/`message`.

**Non-obvious rules / gotchas**
- (**Jira: KAN-6** closed invalid; **KAN-30** hardened) Nightly schedule in `routes/console.php`:
  similarity 03:00 → listing scores 03:15 → profiles 03:30 → candidates 04:00, all with
  `withoutOverlapping()->onOneServer()`. Manual: `php artisan recommendations:rebuild`.
  `recommendedForUser`/`similarListings` still fall back to heuristics if tables empty — now logged.
- (**Jira: KAN-31**) `GET /api/v1/recommendations` uses `sanctum.optional` (`catalog.php`);
  feature tests in `tests/Feature/Recommendation/RecommendationApiTest.php`. Envelope remains
  `{data}` only (no mode meta).
- (**Jira: KAN-32**) `GET /api/v1/search?sort=recommendation` allowed; Flutter + web sort UIs
  expose Recommended. Pest: `tests/Feature/Api/V1/ApiSearchTest.php`. Confluence:
  DM/3440642.
- `recommendedForUser()`/`similarListings()` both guard with `Schema::hasTable(...)` before querying
  — a defensive pattern suggesting these tables may not exist in all environments/migration states
  (`RecommendationService.php:37,61`).
