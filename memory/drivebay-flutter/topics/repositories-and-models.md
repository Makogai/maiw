# drivebay-flutter — Repositories & models deep reference (API-consumption layer)

Supplements `topics/architecture.md`/`topics/domain.md` (breadth-only) and cross-references
`memory/drivebay/topics/api-and-database.md` (backend route/table reference) — does not repeat
either. All paths below are relative to `apps/drivebay-flutter/`. HTTP methods were derived from
`lib/core/api/api_client.dart` (`getData`/`getList`→GET, `postData`/`postResource`/`postMessage`/
`uploadMultipart(Files)`→POST, `putData`→PUT, `patchResource`→PATCH, `deletePath`/`deleteMessage`→
DELETE; a few repos call `_apiClient.dio.<verb>` directly). Endpoint matches were verified directly
against `apps/drivebay/routes/api/v1/*.php` (not just the backend memory doc), so this file is a
primary source, not a second-hand summary.

## Repositories → Backend Endpoints

| Repository | Endpoint(s) called | Method | Matches backend? | Evidence |
|---|---|---|---|---|
| `account_repository.dart` | `/account`; `/account/warnings/{uuid}/acknowledge`; `/account/profile`; `/account/locale` | GET; POST; PATCH; GET+PUT | Yes — all 5 in `auth.php` | `lib/repositories/account_repository.dart:12,26,36,51,69` |
| `auth_repository.dart` | `/auth/login`; `/auth/register`; `/auth/verify-email`; `/auth/verification/resend`; `/auth/me`; `/auth/logout` | POST×4; GET; POST | Yes — full `auth.php` register/login flow | `lib/repositories/auth_repository.dart:26,46,65,85,101,122` |
| `autodiler_import_repository.dart` | `/seller/import/autodiler/preview`; `/seller/import/autodiler`; `/seller/import/autodiler/status` | POST; POST; GET | Yes — all 3 `AutodilerImportApiController` routes in `seller.php` | `lib/repositories/autodiler_import_repository.dart:17,40,63` |
| `billing_repository.dart` | `/payments/{id}/checkout`; `/payments/{id}/confirm` | GET; POST | Yes — `engagement.php` `PaymentApiController` | `lib/repositories/billing_repository.dart:13,27` |
| `device_token_repository.dart` | `/auth/device-tokens` | POST; DELETE | Yes — `auth.php` | `lib/repositories/device_token_repository.dart:13,27` |
| `engagement_campaign_repository.dart` | `/engagement-campaigns/active`; `/engagement-campaigns/{uuid}/interactions` | GET; POST | Yes — `campaigns.php` | `lib/repositories/engagement_campaign_repository.dart:13,41` |
| `experiment_repository.dart` | `/experiments` | GET | Yes — `catalog.php:21` (`sanctum.optional`) | `lib/repositories/experiment_repository.dart:11` |
| `favorite_repository.dart` | `/favorites`; `/favorites/{id}` | GET; POST; DELETE | Yes — full `FavoriteApiController` CRUD in `engagement.php` | `lib/repositories/favorite_repository.dart:12,24,32` |
| `fuel_price_repository.dart` | `/fuel-prices`; `/fuel-prices/latest`; `/fuel-prices/alerts` | GET; GET; GET+PUT | Yes — full `fuel-prices.php` (4/4) | `lib/repositories/fuel_price_repository.dart:13,28,49,65` |
| `geography_repository.dart` | `/countries`; `/regions`; `/cities`; `/city-districts` | GET×4 | Yes — full `GeographyApiController` in `catalog.php` | `lib/repositories/geography_repository.dart:15,28,47,64` |
| `listing_repository.dart` | `/listings/{id}`; `/listings/{id}/contact`; `/listings/{id}/analytics/view|click|engagement`; `/analytics/listing-impressions`; `/listings/{id}/similar`; `/recommendations` | GET; POST; POST×3; POST; GET; GET | Yes — show (`sanctum.optional`), contact, analytics, similar, recommendations (`sanctum.optional`, **Jira: KAN-31**, **Jira: KAN-24**) | `lib/repositories/listing_repository.dart` |
| `message_repository.dart` | `/messages/threads`; `/messages/threads/{id}`; `/messages/threads/{id}/reply`; `/messages/threads/{id}/typing`; `/messages/threads/{id}/mute` | GET; GET; POST; POST; POST | Yes — mute route is `Route::match(['put','post'], ...)`, mobile uses the POST variant | `lib/repositories/message_repository.dart:27,55,137,153,195,223` |
| `notification_repository.dart` | `/notifications`; `/notifications/unread-count`; `/notifications/latest-unread`; `/notifications/{id}/read`; `/notifications/read-all` | GET×3; POST×2 | Yes — full `NotificationApiController` (5/5) | `lib/repositories/notification_repository.dart:12,26,42,61,74` |
| `platform_config_repository.dart` | `/config/app` (called twice, decoded into two different model shapes) | GET | Yes — `campaigns.php:7`, single-action controller | `lib/repositories/platform_config_repository.dart:13,26` |
| `promotion_repository.dart` | `/promotion-types`; `/featured-listings`; `/listings/{id}/promote` | GET; GET; POST | Yes | `lib/repositories/promotion_repository.dart:15,29,47` |
| `report_repository.dart` | `/listings/{id}/report`; `/messages/threads/{id}/report` | POST (via shared `_submitReport`) | Yes | `lib/repositories/report_repository.dart:15,27,39` |
| `search_filter_options_repository.dart` | `/search/filters`; `/cities` | GET; GET | Yes | `lib/repositories/search_filter_options_repository.dart:192,206` |
| `search_repository.dart` | `/search` | GET | Yes — `catalog.php:41`, `throttle:api-search` | `lib/repositories/search_repository.dart:306` |
| `seller_listing_repository.dart` | `/listing-form-options`; `/seller/listings`; `/seller/listings/{id}`; `/seller/listings/{id}/media[/{id}\|/reorder]`; `/seller/listings/{id}/price`; `/seller/listings/{id}/sold`; `/seller/listings/{id}/publish`; `/seller/listings/{id}/request-photo-review` | GET; GET+POST; GET+PATCH; POST/DELETE/POST; PATCH; POST; POST; POST | Yes — full `SellerListingApiController`+`SellerMediaApiController` (11/11) | `lib/repositories/seller_listing_repository.dart:132,146,159,173,191,213,272,284,316,335,349,363` |
| `seller_profile_repository.dart` | `/dealers/{slug}`; `/sellers/{id}` | GET; GET | Yes — `PublicDealerApiController`/`PublicSellerApiController` in `catalog.php` (buyer-facing, distinct from the seller-dashboard `/dealer/*` routes — see gaps) | `lib/repositories/seller_profile_repository.dart:98,112` |
| `taxonomy_repository.dart` | `/vehicle-types`; `/makes`; `/makes/{id}/models` | GET×3 | Partial — `GET /model-groups` (`catalog.php:32`) is never called | `lib/repositories/taxonomy_repository.dart:14,28,47` |
| `tools_repository.dart` | `/tools/registration/options`; `/tools/registration/calculate`; `/tools/fuel-consumption/options`; `/tools/fuel-consumption/calculate`; `/tools/fuel-consumption/ai-estimate` | GET; POST; GET; POST; POST | Yes — full `tools.php` (5/5) | `lib/repositories/tools_repository.dart:14,31,58,75,104` |
| `viewing_repository.dart` | `/listings/{id}/viewing/dates`; `/listings/{id}/viewing/slots`; `/listings/{id}/viewing/appointments`; `/viewings`; `/seller/viewings`; `/seller/viewing`; `/viewing/appointments/{id}/cancel`; `/viewing/appointments/{id}/reschedule` | GET; GET; POST; GET; GET; GET+PUT; POST; POST | Yes — full `viewing.php` (9/9) at synced HEAD, including buyer reschedule in KAN-35 | `lib/repositories/viewing_repository.dart:12,36,58,78,92,106,123,144` |

One-line purpose per repository:

- **account** — read/update the logged-in user's account profile, locale, acknowledge warnings.
- **auth** — register/login/verify-email/logout, writes the bearer token via `TokenStorage`.
- **autodiler_import** — seller bulk-import of listings scraped from an Autodiler profile URL.
- **billing** — payment checkout/confirm steps behind a promotion purchase.
- **device_token** — register/revoke this device's FCM push token.
- **engagement_campaign** — fetch/act on marketing popups shown per app screen.
- **experiment** — fetch active A/B experiment variant assignments (client-side of Laravel `Experiment`).
- **favorite** — buyer favorites/wishlist CRUD.
- **fuel_price** — Montenegro fuel price history/latest snapshot + push alert preferences.
- **geography** — countries/regions/cities/city-districts pickers.
- **listing** — listing detail, contact-seller, view-tracking, similar-listings recommendations.
- **message** — buyer/seller messaging threads: list, show, reply (text/media), typing, mute.
- **notification** — notification inbox, unread count, latest-unread banner, mark read/read-all.
- **platform_config** — app-wide feature flags/UI config bootstrap (`GET /config/app`).
- **promotion** — promotion type catalog, featured-listings carousel, promotion checkout.
- **report** — report a listing or a message thread for moderation.
- **search_filter_options** — filter-picker option lists (body styles, fuel types, feature groups, cities).
- **search** — main listing search/browse with the full filter set + pagination.
- **seller_listing** — seller's own listing CRUD, photo upload/delete/reorder, price/publish/sold/photo-review lifecycle.
- **seller_profile** — buyer-facing public dealer storefront + private-seller profile pages.
- **taxonomy** — vehicle-types/makes/models for listing forms and search filters.
- **tools** — registration-fee and fuel-consumption calculators (incl. AI estimate).
- **viewing** — viewing-appointment booking/rescheduling (buyer) + settings/inbox (seller), via
  the shared viewing endpoints including `/viewing/appointments/{uuid}/reschedule`.

## Models

Compact grouping (file → main class(es) → purpose → consumer). Excludes generated
`*.freezed.dart`/`*.g.dart` siblings.

| Model file | Main class(es) | Purpose | Used by |
|---|---|---|---|
| `account.dart` | `AccountProfile`, `AccountPayload`, `SessionUser` | logged-in user's profile + wrapper returned by `/account`, `/auth/*` | `account_repository`, `auth_repository` |
| `app_config.dart` | `AppConfig`, `AppUiConfig`, `AppFeatureFlags`, `GeographyBootstrap`, `MapCenter`, `PhoneCountry` | `/config/app` UI/feature-flag/geography bootstrap payload | `platform_config_repository` |
| `app_message.dart` | `AppMessage` | one chat message (body, read state, attachments) | `message_repository`, `message_thread.dart` |
| `app_notification.dart` | `NotificationInbox`, `NotificationGroup`, `AppNotification` | notification list envelope + single notification | `notification_repository` |
| `app_platform_config.dart` | `AppPlatformConfig` | derived UI toggles (price rating, reg-estimate visibility) from `/config/app` | `platform_config_repository` |
| `auth_response.dart` | `AuthResponse` | `{token, user}` envelope from login/verify-email | `auth_repository` |
| `autodiler_import.dart` | `AutodilerImportPreview`, `AutodilerImportListing`, `AutodilerImportStatus` | Autodiler scrape preview + import job status | `autodiler_import_repository` |
| `city.dart` | `City` | geography pick-list item | `geography_repository`, `search_filter_options_repository` |
| `city_district.dart` | `CityDistrict` | sub-city geography item | `geography_repository` |
| `country.dart` | `Country` | geography pick-list item | `geography_repository` |
| `engagement_campaign.dart` | `EngagementCampaign`, `EngagementFormField`, `EngagementActiveResult` | active marketing-campaign popup + its form schema | `engagement_campaign_repository` |
| `feature_group.dart` (+freezed/g) | `FeatureGroup` | vehicle equipment feature grouped by category, for listing form | `seller_listing_repository` (via `listing_form_options`) |
| `fuel_consumption_calculator.dart` | `FuelConsumptionCalculatorOptions`, `FuelConsumptionEstimate`, `FuelConsumptionAiEstimate`, `FuelConsumptionCalculateInput`, `FuelConsumptionAiEstimateInput`, `VehicleMakeOption`/`VehicleModelOption`/`FuelPriceMeta`/`FuelConsumptionReference`/`FuelConsumptionComparison` | fuel-consumption calculator options/estimate (incl. AI-estimate) | `tools_repository` |
| `fuel_price_alerts.dart` | `FuelPriceAlertPreferences` | push-alert subscription prefs per fuel type | `fuel_price_repository` |
| `fuel_prices.dart` | `FuelPricesResponse`, `FuelPriceFuel` | fuel price history/latest snapshot | `fuel_price_repository` |
| `listing_card.dart` (+freezed/g) | `ListingCard` | denormalized listing summary for grids/carousels | `search_repository`, `favorite_repository`, `promotion_repository`, `listing_repository` (similar), `seller_listing_repository` (my listings), `seller_profile_repository` (dealer/seller listings list) |
| `listing_contact_channels.dart` | `ListingContactChannels` | seller contact methods (phone/whatsapp/viber/email) shown on listing detail | `listing_detail.dart` |
| `listing_detail.dart` (+freezed/g) | `ListingDetail` | full listing detail payload | `listing_repository`, `seller_listing_repository` |
| `listing_detail_meta.dart` | `ListingDetailMeta`, `ListingViewingInfo`, `ListingCapabilities`, `ListingDetailBundle` | side-channel meta accompanying listing detail (viewing availability, permission flags) | `listing_repository` |
| `listing_form_options.dart` (+freezed/g) | `ListingFormOptions`, `PriceTypeOption`, `ConditionTypeOption` | dropdown options for the create/edit-listing form | `seller_listing_repository` |
| `listing_gallery_item.dart` (+freezed/g) | `ListingGalleryItem` | read-only gallery photo (buyer-facing detail view) | `listing_detail.dart` |
| `listing_media_item.dart` (+freezed) | `ListingMediaItem` | seller-editable photo (id, cover flag, sort order) | `seller_listing_repository` |
| `listing_seller.dart` (+freezed/g) | `ListingSeller` | seller/dealer summary embedded in listing detail | `listing_detail.dart` |
| `listing_staff.dart` | `ListingStaffNote` | moderation/admin action note on a listing | `listing_detail_meta.dart` |
| `listing_vehicle_detail.dart` (+freezed/g) | `ListingVehicleDetail` | full vehicle spec block on listing detail | `listing_detail.dart` |
| `listing_vehicle_summary.dart` (+freezed/g) | `ListingVehicleSummary` | condensed make/model/year/mileage for `ListingCard` | `listing_card.dart` |
| `message_attachment.dart` | `MessageAttachment` | media attached to a chat message | `app_message.dart` |
| `message_thread.dart` (+freezed/g) | `MessageThread` | thread summary (participants, last message, mute state) | `message_repository` |
| `message_thread_detail.dart` | `MessageThreadDetail` | thread + counterpart-typing flag | `message_repository` |
| `payment_checkout.dart` | `PaymentCheckoutSession`, `PaymentCheckoutItem` | checkout session line items shown before payment | `billing_repository` |
| `promotion_type.dart` | `PromotionType` | purchasable promotion tier (price, duration, social-publish flags) | `promotion_repository` |
| `region.dart` | `Region` | geography pick-list item | `geography_repository` |
| `registration_calculator.dart` | `RegistrationCalculatorOptions`, `RegistrationEstimate`, `RegistrationCalculateInput`, `SelectOption`, `RegistrationDefaults`, `RegistrationSource`, `RegistrationLineItem` | vehicle registration-fee calculator options/estimate | `tools_repository` |
| `registration_response.dart` | `RegistrationResponse` | post-register `{email, requires_verification, code_length}` | `auth_repository` |
| `seller_listing_edit.dart` | `SellerListingEdit`, `SellerListingEditVehicle` | pre-filled edit form for a seller's own listing | `seller_listing_repository` |
| `taxonomy_option.dart` (+freezed/g) | `TaxonomyOption` | generic id/name/code/hex/icon taxonomy option (colors, body styles) | `search_filter_options_repository`, `listing_form_options.dart` |
| `user.dart` (+freezed/g) | `User` | core user record (id, uuid, email, type, status) | `account.dart` (`SessionUser`), `user_extensions.dart` |
| `user_account_status.dart` | `UserWarningStatus`, `SellingRestrictionStatus` | badge/pending-popup flags for warnings + active selling restriction | `account_repository` consumers (moderation UI) |
| `user_extensions.dart` | `UserAccountX` (extension) | `isDealerAccount` getter on `User` | anywhere `User` is read |
| `user_profile.dart` | `UserProfile` | display/first/last name, nested under `User` | `user.dart` |
| `user_warning.dart` | `UserWarning` | single moderation warning (severity, note, listing ref, ack state) | `account_repository` (`acknowledgeWarning`) |
| `vehicle_feature.dart` (+freezed/g) | `VehicleFeature` | single equipment feature (id/code/name/category) | `feature_group.dart` |
| `vehicle_make.dart` (+freezed/g) | `VehicleMake` | make pick-list item | `taxonomy_repository` |
| `vehicle_model.dart` (+freezed/g) | `VehicleModel` | model pick-list item (carries unused `vehicleModelGroupId`) | `taxonomy_repository` |
| `vehicle_type.dart` (+freezed/g) | `VehicleType` | vehicle-type pick-list item (car/motorcycle/van/etc.) | `taxonomy_repository` |
| `viewing.dart` | `ViewingSlot`, `ViewingDateOption`, `ViewingAppointment`, `ViewingInbox`, `SellerViewingSettings` | viewing date/slot options, booked appointment, buyer/seller inboxes; `ViewingAppointment` parses both `canCancel` and `canReschedule` | `viewing_repository` |

### Backend model/shape correspondences worth knowing

- `ListingCard` (`lib/models/listing_card.dart`) is populated from `/search` and other list
  endpoints — its flattened, pre-joined shape (title/price/vehicle-summary in one object) lines up
  with the backend's denormalized `listing_search_documents` read-model table (see
  `memory/drivebay/topics/api-and-database.md` migration phase 6 / `relational_phase3`), not the
  raw `listings` table. `ListingDetail` (`lib/models/listing_detail.dart`), by contrast, backs
  `GET /listings/{id}` and is closer to the full `Listing` Eloquent resource plus its relations
  (`listing_vehicle_detail.dart`, `listing_seller.dart`, `listing_contact_channels.dart`,
  `listing_gallery_item.dart`).
- `UserWarning`/`UserWarningStatus`/`SellingRestrictionStatus` (`lib/models/user_warning.dart`,
  `lib/models/user_account_status.dart`) map directly to the backend's moderation-domain
  `user_warnings`/`user_selling_restrictions` tables (migration phase 13).
- `SessionUser`/`User`/`UserProfile` split (`account.dart`, `user.dart`, `user_profile.dart`)
  mirrors the backend's `users`+`user_profiles` table split (migration phase 2).
- `FuelPriceAlertPreferences`/`FuelPricesResponse` mirror `fuel_price_alert_preferences`/
  `montenegro_fuel_price_snapshots` (migration phase 17).
- `EngagementCampaign` mirrors `engagement_campaigns`(+events) (migration phase 16).
- `AutodilerImportPreview`/`AutodilerImportStatus` likely back an `import_jobs` row (migration
  phase 15 "Integrations") — not confirmed against a specific backend resource class, inferred
  from the phase table only.
- `PromotionType`/`PaymentCheckoutSession` mirror `promotion_types` (phase 12) and
  `payments`/`invoices` (phase 11).
- **KAN-24 local wiring on top of app HEAD `f49e7b0`**: `ListingDetailScreen` now uses
  `ListingAnalytics.recordClick()` for buyer CTA actions as well as search-card interactions:
  tapping the bottom-bar `Contact` button sends `click_type=contact` with
  `placement=detail_actions`, and choosing `Share listing` sends `click_type=share` with the same
  placement before invoking the native share sheet. Existing channel taps from
  `ContactSellerSheet` (`phone` / `email` / `whatsapp` / `viber`) still flow through the same
  click endpoint, now tagged with `placement=detail_contact_sheet`.
- **KAN-35 shipped contract (app HEAD `f49e7b0`)**: `ViewingAppointment` reads a server-computed
  `can_reschedule` flag alongside `can_cancel`, and `ViewingRepository.reschedule()` posts
  `{starts_at, buyer_note?}` to `/viewing/appointments/{uuid}/reschedule`, expecting the same
  `{appointment: ...}` envelope as booking/cancellation.

## Contract gaps found

All endpoints the mobile app calls were verified directly against
`apps/drivebay/routes/api/v1/*.php` and matched an existing route with the correct HTTP method —
**no repository calls an undocumented or phantom endpoint.** The gaps all run the other direction:
backend routes with zero mobile callers.

Backend endpoints no repository calls (feature not yet built in mobile, or intentionally
web/dashboard-only):

| Endpoint | Controller | Route file | Notes |
|---|---|---|---|
| `GET /listings` | `ListingApiController::index` | `catalog.php:34` | Plain browse/index feed — mobile always uses `GET /search` instead, even with empty filters (`search_repository.dart:306`). Likely intentional, not a gap in practice. |
| `GET /model-groups` | `TaxonomyApiController::modelGroups` | `catalog.php:32` | `taxonomy_repository.dart` never calls it; `VehicleModel.vehicleModelGroupId` (`lib/models/vehicle_model.dart:14`) is parsed but nothing fetches the group list itself. |
| `GET /recommendations` | `RecommendationApiController::index` | `catalog.php:43` | Consumed (**Jira: KAN-31**) via `ListingRepository.getRecommendations` / For you rail. |
| `GET /compare` | `CompareApiController::index` | `catalog.php:46` | No listing-comparison feature in mobile. |
| `GET /recent-listings` | `RecentlyViewedApiController::index` | `catalog.php:51` | No "recently viewed" screen in mobile. |
| `POST /vehicles/decode-vin` | `VehicleApiController::decodeVin` | `catalog.php:52` | No VIN-scan/decode entry point in the create-listing flow. |
| `GET/POST /saved-searches`, `PATCH/DELETE /saved-searches/{id}` | `SavedSearchApiController` | `engagement.php:19-22` | **(Jira: KAN-23)** No `saved_search_repository.dart` exists at all — the entire saved-search feature (create/list/edit/delete) is unimplemented in mobile, even though `lib/features/notifications/notification_type_image.dart:12,21` already has an icon mapping for `saved_search.match` notifications — i.e. mobile can *receive* a saved-search-match push but the user can never *create* a saved search from the app. |
| `GET /seller/analytics`, `GET /seller/listings/{id}/analytics` | `SellerAnalyticsApiController` | `seller.php:17-18` | No seller analytics dashboard/repository in mobile. |
| `GET /dealer/storefront`, `GET /dealer/domain`, `POST /dealer/domain/verify` | `DealerApiController` | `dealer.php` | No seller-side storefront/custom-domain management screen. Distinct from the buyer-facing `GET /dealers/{slug}` public profile page that `seller_profile_repository.dart:98` *does* call — easy to conflate the two "dealer" surfaces. |
| `POST /analytics/listing-impressions`, `POST /listings/{id}/analytics/engagement`, `POST /listings/{id}/analytics/click` | `ListingAnalyticsApiController` | `analytics.php:7,9,10` | Partial gap closed: mobile already sends search/detail impressions, detail-view engagement, search-card clicks, and now detail CTA clicks (`contact`, `share`) via `ListingAnalytics`; remaining gap is broader seller-analytics/dashboard consumption rather than raw event emission. `(**Jira: KAN-24**)` |

Repository/model note: the 23 repositories map to exactly the endpoints listed in the table above;
no repository was found calling a path absent from the actual route files (the backend memory
doc's own findings about `docs/api/v1/openapi.json` being stale — see
`memory/drivebay/topics/api-and-database.md` — do **not** apply to any mobile-called endpoint,
since routes were checked directly rather than through that generated spec).
