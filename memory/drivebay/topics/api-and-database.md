# drivebay — API layer & database schema (deep reference)

This supplements `apps/drivebay/CLAUDE.md` ("API"/"Database" sections),
`apps/drivebay/docs/api/` (INDEX.md, conventions.md, v1/openapi.json, modules/*.md) and
`apps/drivebay/docs/database/database_schema.dbml` — it does not repeat them. All paths
below are relative to `apps/drivebay/`. Verified 2026-07-15 by reading every file in
`routes/api/v1/*.php`, `routes/api.php`, `routes/storefront.php`, spot-checking
`app/Http/Controllers/Api/V1/*`, `app/Http/Requests/**`, `docs/api/v1/openapi.json`,
`docs/api/modules/*.md`, `docs/database/database_schema.dbml`, `docs/database/migration_plan.md`,
and ~15 migrations across phases.

## API

### Versioning

- Single version today: `routes/api.php:5` wraps everything in `Route::prefix('v1')`,
  requiring the files under `routes/api/v1/` (`routes/api.php:6-16`; 11 files as of
  KAN-100 — `moderation.php` is the newest, `analytics.php` was a 10th not named in the
  original module list).
  No `v2` exists anywhere (no `routes/api/v2/`, no version negotiation middleware). A
  new version would presumably be added as a sibling `Route::prefix('v2')` block plus a
  new `routes/api/v2/` dir and `App\Http\Controllers\Api\V2\*` — inferred from the v1
  pattern, not documented anywhere.
- Health check `GET /v1/health` (`catalog.php:19`) returns `{"version": "v1"}` inline,
  not from config.

### Route modules

Envelope is `{data, meta}` per `docs/api/conventions.md` — confirmed matching in every
controller spot-checked; no deviations found beyond the two documented exceptions
(action-only `{message}`, promotion checkout `{redirect_url, payment_id}`).

**auth.php** (`routes/api/v1/auth.php`) — `AuthApiController`, `SocialAuthApiController`, `AccountApiController`:

| Method | Path | Controller@action | Auth/Middleware |
|---|---|---|---|
| POST | `/auth/register` | Auth@register | `throttle:api-auth` |
| POST | `/auth/login` | Auth@login | `throttle:api-auth` |
| POST | `/auth/social/{provider}` | SocialAuth@store | `throttle:api-auth`; `provider` ∈ google\|facebook\|apple |
| POST | `/auth/verify-email` | Auth@verifyEmail | `throttle:api-auth` |
| POST | `/auth/verification/resend` | Auth@resendVerification | `throttle:api-auth` |
| POST | `/auth/forgot-password` | Auth@forgotPassword | `throttle:api-auth` (**Jira: KAN-56**) |
| POST | `/auth/reset-password` | Auth@resetPassword | `throttle:api-auth` (**Jira: KAN-56**) |
| GET/PUT | `/account/locale` | Account@show\|updateLocale | `auth:sanctum` only (no `verified`) |
| GET | `/auth/me` | Auth@me | `auth:sanctum, verified`; staff users get additive `capabilities.{staff_role,permissions[]}` (**Jira: KAN-58**) |
| POST | `/auth/logout` | Auth@logout | `auth:sanctum, verified` |
| POST/DELETE | `/auth/device-tokens` | Auth@storeDeviceToken\|destroyDeviceToken | `auth:sanctum, verified` |
| GET | `/account` | Account@show | `auth:sanctum, verified` |
| PATCH | `/account/profile` | Account@updateProfile | `auth:sanctum, verified`; `UpdateAccountProfileRequest` (**Web** namespace, reused — see finding below) |
| PUT | `/account/password` | Account@updatePassword | `auth:sanctum, verified`; current password required (**Jira: KAN-56**) |
| POST | `/account/warnings/{warning}/acknowledge` | Account@acknowledgeWarning | `auth:sanctum, verified` |

Form requests: `Requests/Api/V1/Auth/{RegisterApiRequest,ResendVerificationApiRequest,VerifyEmailApiRequest,SocialLoginApiRequest}`,
`Requests/Api/V1/Account/UpdateAccountLocaleRequest`.

**Social login**: body `access_token` and/or `id_token`, optional `device_name` /
`full_name`. Response same as login `{token,user}`. See `docs/api/modules/auth.md`
and `docs/auth/social-login-setup.md`. Tests: `ApiSocialAuthTest`, `WebSocialAuthTest`.

**API locale (KAN-103)**: `app/Http/Middleware/SetApiLocale.php` is appended to the `api`
middleware group (`bootstrap/app.php`) and sets the app locale from `Accept-Language`
(via `LocaleUrl::normalize`, supported locales only). Before this, API responses always
localized as `en` — web `SetLocale` skips `api/*`. Test:
`tests/Feature/Api/V1/ApiLocaleHeaderTest.php`.

**catalog.php** (`routes/api/v1/catalog.php`, mostly public GET) —
`TaxonomyApiController`, `GeographyApiController`, `ListingApiController`,
`SearchApiController`, `SearchFiltersApiController`, `RecommendationApiController`,
`CompareApiController`, `PublicDealerApiController`, `PublicSellerApiController`,
`ExperimentApiController`, `VehicleApiController`, `ListingReportApiController`,
`DealerReviewApiController`, `RecentlyViewedApiController`,
`ListingFormOptionsApiController`. Public/no-auth: health,
experiments, countries/regions/cities/city-districts, vehicle-types/makes/models/model-groups,
listings/featured-listings, dealers/{dealer:slug}, sellers/{seller}, search/filters,
compare, listing-form-options, `/recommendations` (guest trending). `sanctum.optional` on
`/experiments`, `GET /listings/{publicId}`, and `GET /recommendations` (**Jira: KAN-31** —
Bearer token personalizes via `recommendation_candidates`; empty → legacy fallback).
`throttle:api-search` on `GET /search`. `auth:sanctum, verified`
group: `/recent-listings`, `POST /vehicles/decode-vin`, `POST /listings/{publicId}/report`
(`ListingReportApiController` reuses **Web** `StoreListingReportRequest`),
`POST /dealers/{dealer:slug}/reviews` + `throttle:api-write` (**Jira: KAN-80** —
`StoreDealerReviewApiRequest`; body `rating` 1–5, optional `title`/`comment`,
`source` must be `qr`; one review per user/dealer → 422; QR reviews auto-approved;
`SellerReviewService` recomputes dealer `rating_average`/`rating_count` from
`moderation_status=approved`). Matching **web** route (session auth+verified):
`POST /dealers/{dealer:slug}/reviews` → `DealerReviewController@store`
(`dealers.reviews.store`); Inertia dealer page shows rate panel when `?src=qr`
(`fromQr` prop). Tests: `DealerQrReviewApiTest`, `DealerQrReviewWebTest`.

**analytics.php** (4 endpoints, `ListingAnalyticsApiController`) — all under
`sanctum.optional` + `throttle:api-analytics`: `POST /analytics/listing-impressions`,
`POST /listings/{publicId}/analytics/{view,engagement,click}`. Dedicated Form Requests
under `Requests/Api/V1/Analytics/*`.

**campaigns.php** (3 endpoints) — `GET /config/app` (no auth, `PlatformConfigApiController`
invoked directly as single-action controller); `sanctum.optional` group: `GET
/engagement-campaigns/active`, `POST /engagement-campaigns/{campaign}/interactions`
(`EngagementCampaignApiController`, `EngagementCampaignInteractRequest`).

**engagement.php** (23 endpoints despite the filename — favorites, saved searches,
notifications, messaging, promotion checkout, payments) —
`FavoriteApiController`, `SavedSearchApiController`, `NotificationApiController`,
`MessageApiController`, `PromotionApiController`, `PaymentApiController`. Public:
`GET /promotion-types`, `GET /billing/config`. Everything else `auth:sanctum, verified`:
favorites CRUD, saved-searches CRUD (`Requests/Api/V1/Search/{Store,Update}SavedSearchApiRequest`),
notifications (index/unread-count/latest-unread/read/read-all), messaging (threads
index/show, `POST /listings/{publicId}/contact`, reply, mute [`PUT`+`POST` both routed to
same action — `Route::match`], typing, report — `ReplyMessageRequest`,
`UpdateMessageThreadMuteRequest`; report reuses **Web** `StoreListingReportRequest`),
`POST /listings/{publicId}/promote` (checkout, no envelope), `payments/{payment}/checkout`+`confirm`.

**seller.php** (16 endpoints) — `AutodilerImportApiController`, `SellerAnalyticsApiController`,
`SellerListingApiController`, `SellerMediaApiController`, all `auth:sanctum, verified`.
Import status uses `throttle:api-import-status` (180/min); everything else in this file
`throttle:api-write` (30/min). `can.create.listings` middleware
(`EnsureCanCreateListings`) additionally gates: autodiler preview/store, `POST
/seller/listings`. Listing CRUD reuses **Web** Form Requests: `StoreListingRequest`,
`UpdateListingRequest`, `UpdateListingPriceRequest` (`app/Http/Controllers/Api/V1/SellerListingApiController.php:11-13`)
— same finding as auth/messaging above. `publish`/`markSold`/`requestPhotoReview` take
plain `Request`, no dedicated Form Request.

**dealer.php** (3 endpoints, `DealerApiController`, `auth:sanctum, verified`, prefix
`/dealer`): `storefront`, `domain`, `domain/verify`. Matches `docs/api/modules/dealer.md`
"Routes only" phase-5 status — thin, likely minimal validation.

**viewing.php** (9 committed endpoints) —
`ListingViewingApiController`, `BuyerViewingApiController`, `SellerViewingApiController`.
Public: `dates`, `slots` per listing. `auth:sanctum, verified, throttle:api-write`: book
appointment (`CancelListingViewingRequest` is **Web** namespace, used for `cancel`), buyer's
`/viewings` list, seller's `/seller/viewing` show/update (`UpdateSellerViewingSettingsRequest`,
**Web** namespace) + `/seller/viewings`, plus `POST
/viewing/appointments/{appointment}/reschedule` → `BuyerViewingApiController::reschedule`
for buyer-side in-place rescheduling with inline validation for `starts_at` + optional
`buyer_note`. This shipped in **KAN-35** at app HEAD `727abc9`.

**fuel-prices.php** (4 endpoints, `FuelPriceApiController`, `FuelPriceAlertApiController`)
— public `fuel-prices`, `fuel-prices/latest`; `auth:sanctum, verified` for
`fuel-prices/alerts` get/put.

**tools.php** (5 endpoints, prefix `/tools`, no auth) —
`Tools\{RegistrationCalculatorApiController,FuelConsumptionCalculatorApiController}`.
`aiEstimate` action gated by `config('fuel_consumption_calculator.enabled')`, uses **Web**
namespace `FuelConsumptionAiEstimateRequest` alongside its own
`Requests/Api/V1/Tools/CalculateFuelConsumptionRequest`. Separate `RateLimiter::for('fuel-consumption-ai', ...)`
defined at `app/Providers/AppServiceProvider.php:93` (not yet cross-checked against route
middleware — route file itself has no explicit throttle on `ai-estimate`; worth
confirming if this route is expected to be throttled).

**moderation.php** (7 endpoints, `ModerationApiController`, **Jira: KAN-100** committed
`44f2fd9`, **KAN-101** committed `ef4a464`; required-note QA follow-up uncommitted on
`feature/kan-100-moderation-api` as of 2026-07-31 PM) — all under
`auth:sanctum, verified, staff` + `prefix('moderation')`; actions additionally
`authorize('moderate', $listing)` (same chain as web `ListingModerationController`):
`GET /moderation/listings` (paginated queue, default `status=pending_review` oldest-first,
optional `status` allowlist filter + `per_page` ≤50, `ListingCardResource` items,
`ApiResponse::collection` meta), `POST /moderation/listings/{publicId}/approve` (`note`
**required** min:3 max:5000 — mirrors web `ApplyListingModerationRequest`),
`POST .../reject` (`RejectListingApiRequest`: `reason` required max:1000, optional
`note`) — both delegate to `ListingModerationService` and return the updated card —
and `GET /moderation/stats` (`{data:{pending_count}}`, counts `status=pending_review`).
KAN-101: `GET /moderation/listings/{publicId}` (any-status detail, same
`ListingDetailResource` as public detail; staff see owner-view media),
`PATCH /moderation/listings/{publicId}` (`UpdateModerationListingApiRequest`: subset of
`price`/`title`/`description` + **required** `note` min:3 max:5000, empty body 422;
delegates to new `ListingModerationService::quickEdit` → `ListingService::update` for
price history/search resync + `recordStaffChange`), and `POST .../unpublish` (**required**
`note`, delegates to existing `ListingModerationService::unpublish` → status
`pending_review`, not `draft`).
Tests: `tests/Feature/Api/V1/ApiModerationTest.php`; doc `docs/api/modules/moderation.md`.

**storefront.php** (dealer custom-domain web pages, not `/api/v1`) — `storefront.host`
middleware (`EnsureStorefrontHost`); `StorefrontPageController@{about,contact}`,
`StorefrontListingController@show`. Web/Inertia contract space, not part of the JSON API.

### Middleware aliases (`bootstrap/app.php:93-99`)

`staff`→`EnsureStaff`, `verified`→`EnsureEmailIsVerified` (custom, not Laravel's default
`EnsureEmailIsVerified`), `can.create.listings`→`EnsureCanCreateListings`,
`storefront.host`→`EnsureStorefrontHost`, `marketplace.host`→`EnsureMarketplaceHost`,
`sanctum.optional`→`OptionalSanctumAuth`. Rate limiters defined in
`app/Providers/AppServiceProvider.php:87-93+`: `api-auth` (10/min/IP), `api-search`
(60/min/user-or-IP), `api-analytics` (120/min/user-or-visitor-or-IP), `api-write`
(30/min/user-or-IP), `api-import-status` (180/min/user-or-IP), `fuel-consumption-ai`
(custom limiter, not yet inspected in depth).

### Finding: Web Form Requests reused directly in API controllers

`apps/drivebay/CLAUDE.md` states "Web and API are separate contract spaces" and to never
treat `app/Http/Requests/Web/*` as API contracts. In practice, **8 API controllers import
and type-hint `App\Http\Requests\Web\*` classes directly** as their validation layer,
rather than having dedicated `Api/V1` request classes:

- `AutodilerImportApiController` → `Web\Seller\{PreviewAutodilerImportRequest,StoreAutodilerImportRequest}`
- `BuyerViewingApiController::cancel` → `Web\CancelListingViewingRequest`
- `AccountApiController::updateProfile` → `Web\UpdateAccountProfileRequest`
- `ListingReportApiController::store` and `MessageApiController::report` → `Web\StoreListingReportRequest`
- `SellerViewingApiController::update` → `Web\Seller\UpdateSellerViewingSettingsRequest`
- `SellerListingApiController::{store,update,updatePrice}` → `Web\Seller\{StoreListingRequest,UpdateListingRequest,UpdateListingPriceRequest}`
- `Tools\FuelConsumptionCalculatorApiController::aiEstimate` → `Web\FuelConsumptionAiEstimateRequest`

`docs/api/modules/seller-listings.md:5` even states this explicitly ("Uses
`StoreListingRequest`/`UpdateListingRequest` validation (shared rules with web seller
forms)") — so it's a known, intentional pattern for validation-rule reuse, not an
oversight, but it does mean the "separate contract spaces" rule in CLAUDE.md is aspirational
for authorization boundaries, not literally true for validation rule classes. Worth
knowing before assuming any `Api/V1` controller has a matching `Requests/Api/V1` sibling.

### OpenAPI + module docs (**Jira: KAN-13** fixed `cd53e3e`)

Regenerated `docs/api/v1/openapi.json` via `composer run api:docs` (`composer.json:93`).
Prior gap (16 missing operations + phantom `PUT /seller/listings/{publicId}/viewing`) is
closed. Regenerated again on `feature/kan-100-moderation-api` (2026-07-31, uncommitted) —
picked up moderation endpoints plus post-KAN-13 drift (password reset, viewing reschedule,
dealer reviews/storefront, messaging typing/report, compare). Module docs filled for endpoints that were code-only: account locale, featured
listings, experiments, notification unread helpers, messaging typing/report, seller show +
request-photo-review.

**Scramble nuance**: thread mute uses separate `PUT` and `POST` routes (same action) instead
of `Route::match` so Scramble can document both methods — see `routes/api/v1/engagement.php`.

After route changes, re-run `composer run api:docs` before release; entrypoint does not run it
automatically (see `topics/infra.md` deployment note). Primary contract chain:
`routes/api/v1/*.php` → `docs/api/modules/*.md` → `docs/api/v1/openapi.json`.

**KAN-35 follow-up status**: the buyer reschedule endpoint is now committed at app HEAD
`727abc9`. Refresh the API docs chain above when the route needs new request/response contract
docs or a future release regenerates `docs/api/v1/openapi.json`.

## Database

Canonical schema: `docs/database/database_schema.dbml` (2813 lines); migration order:
`docs/database/migration_plan.md` (17 phases, table below). 136 migration files in
`database/migrations/`. Spot-checked ~15 across phases plus the 5 named tables
(`listings`, `listing_search_documents`, `dealer_storefront_domains`,
`recommendation_candidates`, `user_listing_interactions`) — **dbml matches migrations
exactly** for every table checked; no drift found (see "relational_phase" note below for
why this is non-trivial — the schema went through a large JSON-to-relational rewrite and
the dbml was kept in sync with it).

### Migration phases (from `migration_plan.md`, all dated 2026-03-10 except where noted)

| Phase | Tables (representative) |
|---|---|
| 1 Geography | countries, regions, cities, city_districts, languages, currencies, exchange_rates |
| 2 Users | users, user_profiles, user_devices, auth_sessions, password_resets (+ Spatie Permission) |
| 3 Dealer orgs | dealer_accounts, dealer_members, dealer_branches, dealer_storefront_domains |
| 4 Vehicle taxonomy | vehicle_types/makes/models/generations/trims/engines, body_styles (+ nullable `vehicle_type_id`, **Jira: KAN-57**), fuel_types, transmissions, drivetrains, vehicle_features |
| 5 Vehicles | vehicles, vehicle_feature_vehicle |
| 6 Listings | listings, listing_versions, listing_status_history, listing_prices, listing_features, listing_attributes, listing_search_documents |
| 7 Media | media_assets, listing_media |
| 8/8b Messaging + Viewing | message_threads, messages, leads; user/listing viewing settings + appointments |
| 9 Search/discovery | saved_searches, search_logs, favorites, comparison_lists(+items) |
| 10 Notifications | notification_templates, notifications, email_campaigns(+recipients) |
| 11 Billing | payment_providers/methods, invoices(+items), payments, refunds, subscription_plans, subscriptions |
| 12 Promotions | promotion_types, listing_promotions |
| 13 Moderation | seller_reviews, reports, user_warnings, user_selling_restrictions, fraud_signals, moderation_cases, admin_actions, audit_logs |
| 14 Analytics | listing_impressions/views/click_events, page_events, user_listing_interactions, listing_similarity, recommendation_profiles/candidates |
| 15 Integrations | api_clients, import_jobs, platform_social_accounts, listing_social_posts |
| 16 Platform/engagement | platform_settings, engagement_campaigns(+events), experiments(+variants,assignments) |
| 17 Fuel pricing | montenegro_fuel_price_snapshots, fuel_price_alert_preferences |

Phases 1-15's *initial create* migrations all share the `2026_03_10_*` date (build-out
day); everything from `2026_06_04` onward is evolution on top of that baseline —
`platform_settings`, `advertisements`, `dealer_storefront_domains`, taxonomy mobile.de
fields, engagement tables, viewing tables, experiments, fuel pricing, and all the patch
migrations below post-date the original 15-phase build by ~3 months.

### Schema evolution: the "relational_phase" JSON-elimination rewrite

The single biggest schema-evolution event: **7 migrations landed on one day
(2026-06-10)**, all named `relational_phaseN_eliminate_*_json.php`
(`database/migrations/2026_06_10_20{0,1,2,3,4,5,6}000_*`, 200-500 lines each), that
systematically replaced `json`/`*_json` columns with proper relational tables + pivot
tables, each with inline backfill logic (`DB::table(...)->each(...)` + `json_decode`) run
before the old column is dropped, and a full `down()` that recreates the JSON column and
re-populates it:

1. `phase1_eliminate_listing_json` — listings/vehicles/media_assets/listing_attributes;
   adds `listing_exchange_preferences`, `listing_search_document_features` tables; drops
   `exchange_preferred_make_ids`/`exchange_preferred_vehicles` JSON columns from `listings`.
2. `phase2_eliminate_dealer_storefront_json` — adds `dealer_storefront_{themes,content,
   highlights,social_links,domain_settings,pages}` tables, replacing `dealer_accounts.storefront_settings` JSON.
3. `phase3_eliminate_search_reco_json` — adds `filter_*` columns directly to
   `saved_searches`/`search_logs` (replacing `filters_json`) and 8 new
   `recommendation_profile_*` pivot/child tables (replacing 8 `preferred_*_json`/
   `affinity_*_json` columns on `recommendation_profiles`).
4. `phase4_eliminate_billing_notify_json` — billing/notification JSON columns.
5. `phase5_eliminate_audit_json` — audit-log JSON columns.
6. `phase6_eliminate_remaining_json` — largest file (505 lines), catch-all for whatever
   JSON columns remained.
7. `phase7_eliminate_analytics_interaction_json` — adds `session_id`/`position` columns
   to `user_listing_interactions` (replacing `metadata_json`), `filter_*` columns to
   `listing_impressions`, and `{listing_click_event,page_event}_context` tables.

Net effect: almost no `json` columns remain in the schema outside a handful of genuinely
free-form fields (e.g. `dealer_accounts` still has narrowly-scoped JSON in places — not
exhaustively re-audited here). If you need to know "is X still JSON or was it
relationalized," check whether a `relational_phaseN` migration touched that table before
trusting an older migration's column list — the dbml is the fast path (confirmed
accurate against these migrations for the 5 tables this task targeted).

### Other patch-migration patterns worth knowing

- `add_X_to_Y_table` migrations are common and mostly additive (nullable columns,
  `after(...)` placement) — e.g. `add_map_location_enabled_to_listings_table`,
  `add_exchange_fields_to_listings_table` (+ a same-day follow-up
  `add_exchange_preferred_vehicles_to_listings_table` that also backfills data from the
  sibling `exchange_preferred_make_ids` JSON column — both later dropped by
  `relational_phase1`), `add_sort_boost_score_to_listing_search_documents_table`,
  `add_storefront_fields_to_dealer_accounts_table`,
  `add_page_background_media_id_to_dealer_accounts_table`.
- `create_dealer_storefront_domains_table` (2026-06-05) postdates the original phase-3
  dealer-org build by 3 months — storefront/subdomain support was a later addition, not
  part of the initial dealer design (consistent with
  `docs/architecture/dealer-storefront-domains.md` being a newer subsystem).
- Taxonomy churn: `add_taxonomy_display_fields_to_vehicle_taxonomy_tables`,
  `add_mobile_de_fields_to_vehicle_taxonomy_tables`,
  `scope_mobile_de_make_uniqueness_by_vehicle_type`,
  `add_logo_path_to_vehicle_makes_table`, `add_is_featured_to_vehicle_makes_table` — the
  mobile.de import model was refined incrementally after the initial taxonomy tables landed.
  **KAN-57** (2026-07-29): additive nullable `body_styles.vehicle_type_id` FK
  (`nullOnDelete`); null = all types. Car seeder codes backfilled; MobileDe category
  upsert stamps snapshot vehicle type. `ListingFormOptionsService` bodyStyles include
  `vehicle_type_id` (search + create; additive, non-breaking).
- `backfill_message_thread_unread_counts` (2026-06-04) is a data-only migration (no
  schema change), confirming unread counts are a denormalized/cached column somewhere on
  `message_threads`, not computed live.
- `drop_unused_performance_daily_tables` (2026-07-28, **Jira: KAN-17** `734ba07`) drops
  `listing_performance_daily` and `seller_performance_daily` — empty stub tables that never
  had producing jobs; `docs/database/migration_plan.md` Phase 14 note updated.

### Seeders and factories

- `database/seeders/DatabaseSeeder.php` runs 12 seeders in order: RolesAndPermissions →
  AdminUser → Geography → VehicleTypes → **MobileDeTaxonomy** → VehicleCatalog →
  VehicleMakeLogo → DemoMarketplace → ListingDemoImages → PromotionTypes →
  EngagementCampaign → HomepageExperiment.
- Confirmed: `MobileDeTaxonomySeeder` reads from the committed
  `database/data/mobile-de/taxonomy-snapshot.json` (920KB) and instructs re-running
  `php artisan vehicles:export-mobile-de-taxonomy` to regenerate it
  (`database/seeders/MobileDeTaxonomySeeder.php:22`) — matches the CLAUDE.md/architecture
  note exactly. Sibling scrape artifacts also present but not in the default seeder path:
  `bmw.json`, `skoda.json`, `makes.html`, `html/`, and `snapshots/` (11 per-vehicle-type
  JSON files: car, motorcycle, van_up_to_7500, truck_over_7500, bus, trailer,
  semi_trailer(_truck), construction_machine, agricultural_vehicle, forklift_truck) — not
  yet traced to a specific console command; likely inputs/outputs of the taxonomy import
  tooling in `app/Domains/Vehicle/Console/`.
- Extra seeders not in `DatabaseSeeder`'s default chain (presumably manual/other-seeder
  callers): `AutodilerCapturSeeder`, `BalkanGeographySeeder`, `CountriesSeeder`,
  `MontenegroGeographySeeder`, `TestVehicleTaxonomySeeder`, `TouaregMarketSeeder`,
  `VehicleTaxonomySeeder` (superseded by `MobileDeTaxonomySeeder`?).
- Only **3 factories** exist (`ListingFactory`, `UserFactory`, `VehicleFactory`) despite
  21 domains/~136 migrations — demo data mostly comes from `DemoMarketplaceSeeder`
  instead. A task needing factory-backed test data outside Listing/User/Vehicle will
  need to write one first.
