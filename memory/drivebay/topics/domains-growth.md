# drivebay — Growth & engagement domains (Notification, Engagement, Analytics, Promotion, SocialPublishing, Advertising, FuelPricing, FuelEconomy)

Supplements `topics/architecture.md`, `topics/domain.md`, and `apps/drivebay/CLAUDE.md` — does
not repeat their domain-list/tech-stack content. Verified against code at commit `734ba07`
(2026-07-28). All paths below are relative to `apps/drivebay/`.

## Cross-domain map (read this first — the most valuable part)

| From → To | Mechanism | Evidence |
|---|---|---|
| Listing → Notification | `Event::listen(ListingPublished::class, SendListingPublishedNotification::class)` | `app/Providers/AppServiceProvider.php:69` |
| Moderation/Listing → Notification | Direct calls to `ListingNotificationService` from moderation pipeline, media rejection, autodiler import (no event, just DI) | `app/Domains/Moderation/Services/ListingModerationService.php`, `app/Domains/Media/Services/ListingMediaModerationService.php`, `app/Jobs/ImportAutodilerListingsJob.php` |
| Listing price update → Notification | `ListingService` calls `PriceDropNotificationService` directly (not event-driven) to notify everyone who favorited the listing | `app/Domains/Listing/Services/ListingService.php:169` area |
| FuelPricing → Notification | `FuelPriceAlertService` writes `Notification` rows directly (bypasses `ListingNotificationService`) after `SyncMontenegroFuelPricesJob` runs | `app/Domains/FuelPricing/Services/FuelPriceAlertService.php:95-141`, `app/Domains/FuelPricing/Jobs/SyncMontenegroFuelPricesJob.php:27-29` |
| Notification (any `in_app` row) → Push | `NotificationObserver::created()` fires on **every** `Notification` insert regardless of domain, presents via `SellerNotificationPresenter`, dispatches `SendPushNotificationJob` | `app/Observers/NotificationObserver.php:11-45` |
| Notification → FuelPricing | `SellerNotificationPresenter` depends on `FuelPriceNotificationCopyBuilder` to render `fuel_price.updated` copy — a reverse dependency (Notification domain reaches into FuelPricing for copy, while FuelPricing reaches into Notification's model to create rows) | `app/Domains/Notification/Services/SellerNotificationPresenter.php:12` |
| Moderation → Engagement | `EngagementDeliveryService::activeForRequest()` checks `UserWarningService::pendingForUser()` **first**, before any marketing campaign; a pending warning hijacks the popup slot and reuses the same payload shape (`display_mode: modal`, etc.) | `app/Domains/Engagement/Services/EngagementDeliveryService.php:29-37`, `app/Domains/Moderation/Services/UserWarningService.php:141-170` |
| Engagement → every Inertia page | `EngagementDeliveryService::activeForRequest()` is called unconditionally from `HandleInertiaRequests` as a shared prop, so popup/warning logic runs on every web request, not just specific routes | `app/Http/Middleware/HandleInertiaRequests.php:115,198` |
| Listing/Search → Analytics | `ListingController@show` calls `ListingAnalyticsService::recordView()` and `RecommendationService` together in the same request | `app/Http/Controllers/Web/ListingController.php:79` (uses `ListingAnalyticsService`, `RecommendationService` both injected) |
| Analytics ↔ Advertising | Two separate impression/click systems: `Advertisement::increment('clicks_count'/'impressions_count')` (ad banners) vs `ListingImpression`/`ListingClickEvent` (listing cards) — not unified, don't conflate | `app/Domains/Advertising/Services/AdvertisementDeliveryService.php:114-124`, `app/Domains/Analytics/Services/ListingAnalyticsService.php:72-140` |
| Promotion → Search | `PromotionService::syncBoostScore()` writes `listing.boost_score` then dispatches `SyncListingSearchDocumentJob` to reindex Meilisearch | `app/Domains/Promotion/Services/PromotionService.php:63-72` |
| Promotion → SocialPublishing | `PromotionService::activate()` calls `SocialPublishService::scheduleFromPromotion()` when the purchased `PromotionType` has `includes_instagram_publish`/`includes_facebook_publish` | `app/Domains/Promotion/Services/PromotionService.php:34-53`, `app/Domains/SocialPublishing/Services/SocialPublishService.php:42-60` |
| Promotion → Billing | `ListingPromotion.payment_id` links to `Billing`'s `Payment` model | `app/Models/Domains/Promotion/Models/ListingPromotion.php:8,44` |
| Promotion → Dealer | `PromotionEligibilityService` gates on `DealerAccessService::primaryDealerFor()` | `app/Domains/Promotion/Services/PromotionEligibilityService.php:5,17-21` |
| SocialPublishing → Dealer | Instagram "domain publish" quota, entitlement, and username resolution all go through Dealer services (`DealerListingLinker`, `DealerStandaloneEntitlementService`, `DealerStorefrontService`) | `app/Domains/SocialPublishing/Services/SocialPublishService.php:22-28`, `InstagramQuotaService.php:5,12`, `InstagramSellerResolver.php:5,11` |
| FuelEconomy → Vehicle | `LocalVehicleConsumptionProvider` queries `Vehicle` rows (same make/model/year/fuel) for WLTP averages before falling back to a heuristic formula | `app/Domains/FuelEconomy/Providers/LocalVehicleConsumptionProvider.php:16-45` |
| FuelEconomy → FuelPricing | `FuelConsumptionPriceResolver` reads `MontenegroFuelPriceSnapshot::latestSnapshot()` to price out estimated running cost, falling back to `config('fuel_consumption_calculator.fallback_prices_eur')` | `app/Domains/FuelEconomy/Services/FuelConsumptionPriceResolver.php:19-58` |

## Notification

**Purpose**: dual-channel notification fan-out (in-app DB rows + Firebase push) for sellers/buyers, decoupled from every domain that triggers a notification — callers just create a `Notification` row or call `ListingNotificationService`.

Key classes:
- `PushNotificationService` — FCM wrapper; `isConfigured()`/`configurationStatus()` inspect `config('firebase.projects.app.credentials')` (path, inline JSON, or array) without ever logging the credential value; `sendToTokenWithResult()` auto-revokes stale tokens via `isStaleTokenError()` (`NotFound`, "NotRegistered", "invalid registration" string matching) — `app/Domains/Notification/Services/PushNotificationService.php:199-224`.
- `DeviceTokenService` — CRUD over `UserDeviceToken`, keyed by raw token string (`updateOrCreate(['token' => $token], ...)`) — `app/Domains/Notification/Services/DeviceTokenService.php:10-21`.
- `ListingNotificationService` — the seller-facing notification API (`notifyPublished`, `notifyProcessingFailed`, `notifyAutoPublishBlocked`, `notifyPhotoRejected`, `notifyAutodilerImportCompleted`); optionally queues `ListingStatusMail` when `sendEmail=true` — `app/Domains/Notification/Services/ListingNotificationService.php:17-59`.
- `PriceDropNotificationService` — notifies every `Favorite` of a listing on price decrease, deduped by a "sent in last 24h" check — `app/Domains/Notification/Services/PriceDropNotificationService.php:12-62`.
- `SellerNotificationPresenter` (387 lines) — single hub that renders **every** notification type (listing status, warnings, fuel price, viewings, messages) into a `{title, body, url, mobile_route, visual, ...}` shape reused by both the in-app bell and the push payload — `app/Domains/Notification/Services/SellerNotificationPresenter.php:18-50`.
- `AdminPushTestService` — thin wrapper for the Filament `PushNotificationTester` admin page — `app/Domains/Notification/Services/AdminPushTestService.php`.
- `SendPushNotificationJob` — queued job, resolves `User` then calls `PushNotificationService::sendToUser()` — `app/Domains/Notification/Jobs/SendPushNotificationJob.php`.

Models: `Notification` (table `notifications`) — the domain model, `belongsTo(User, Listing, SavedSearch)`, `payload()` flattens `provider_response_json` into a normalized key set consumed by the frontend/mobile client — `app/Models/Domains/Notification/Models/Notification.php:41-84`. Also: `EmailCampaign` / `EmailCampaignRecipient` / `NotificationTemplate` used by recommendation digests (KAN-33).

**Gotcha — two unrelated "notification" systems.** `App\Models\Domains\Notification\Models\Notification` (table `notifications`) is the domain's own seller/buyer notification record. Separately, `App\Support\Notifications\EloquentDatabaseNotification` (table `database_notifications`, with a `DatabaseNotificationAction` relation for action buttons) is Laravel's built-in `DatabaseNotification` used for the **Filament admin** notification bell. They are not related and must not be conflated — `app/Models/Domains/Notification/Models/DatabaseNotificationAction.php:9`, `app/Support/Notifications/EloquentDatabaseNotification.php:9-13`.

**Email campaign models are live (not stubs)** (**Jira: KAN-33** wired, **Jira: KAN-17**
clarified). `EmailCampaign`, `EmailCampaignRecipient`, and `NotificationTemplate` have
`$fillable`/casts/relations. Weekly recommendation digests use them via
`RecommendationDigestService` (`campaign_type=digest`), `RecommendationDigestMail`,
`SendRecommendationDigestsJob`, and `recommendations:send-digests` — gated by
`config('recommendations.digest.enabled')` and `users.marketing_email_opt_in` —
`app/Domains/Recommendation/Services/RecommendationDigestService.php`.

**Branded transactional HTML (**Jira: KAN-59** Done, app `2fb7f12`)**: shared Blade
components `resources/views/components/mail/drivebay-{layout,button,code,listing}.blade.php`;
mailables (`EmailVerificationCodeMail`, `PasswordResetMail`, `ListingStatusMail`,
`RecommendationDigestMail`) use `html:` views. Listing/digest cards via
`MailListingCardFactory` (cover thumb when available, title, meta, € price).
`mail:test-all` + Filament Artisan “Send all test emails”. Matrix:
`docs/development/transactional-emails.md`. Restart `queue:work` after template edits.

**Moderation emails (**Jira: KAN-60** Done, same commit)**: `ModerationNoticeMail` from
`UserWarningService` (issue / lift / lift-all) and `UserSellingRestrictionService`
(issue / lift / natural expiry). CTA → account `#warnings` / `#selling-restrictions`.

**Connections**: see cross-domain map above (Listing/Moderation/Media/Autodiler-import → Notification; FuelPricing → Notification; Notification → push via `NotificationObserver` for **any** `in_app` row, including a `saved_search_id`/`notify_push` opt-out check and a `fuel_price.updated`-specific `notify_push` meta check — `app/Observers/NotificationObserver.php:17-31`).

**KAN-23 shipped at app HEAD `8e99c98`**: the original mobile ticket text is stale
because Flutter already shipped saved-search CRUD in `c74fbe6`; the remaining bug was notification
routing. `SellerNotificationPresenter::mobileRoute()` now maps `saved_search.match` to
`/account/saved-searches`, `NotificationObserver::pushData()` copies the presented
`mobile_route` into queued FCM data when the raw notification payload has none, and
`AdminPushTestService` now uses the same route for saved-search test pushes. Focused coverage was
added in `tests/Feature/SellerNotificationPresenterTest.php` and
`tests/Feature/NotificationPushDispatchTest.php`.

**KAN-35 shipped behavior (app HEAD `727abc9`)**: `apps/drivebay` now extends viewing
notifications with `viewing.rescheduled` for both seller and buyer.
Metadata carries `appointment_uuid`, the new `starts_at`, `previous_starts_at_label`, and
`meeting_note`; reminder dedupe is reset by deleting prior `viewing.reminder` rows for that
appointment UUID before creating the reschedule notifications. Because these are ordinary
`Notification` inserts, existing `NotificationObserver` push fan-out also covers reschedules.

**External integration**: Firebase Cloud Messaging. Config: `config('firebase.projects.app.credentials')` (path/inline-JSON/array), `config('firebase.default')` env `FIREBASE_PROJECT` — `config/firebase.php:12,20`. No secret values captured here.

## Engagement

**Purpose**: server-driven marketing popups/campaigns (announcement, promo, lead-capture forms) targeted by locale/route/auth/dealer/new-user-age, with frequency capping — delivered as a single shared Inertia prop on every page.

Key classes:
- `EngagementDeliveryService::activeForRequest()` — the single entry point; checks pending `UserWarning` first (see cross-domain map), else picks the highest-priority `EngagementCampaign` matching targeting + frequency rules, records an `impression` interaction, returns the payload — `app/Domains/Engagement/Services/EngagementDeliveryService.php:22-76`.
- `EngagementInteractionService` — records/queries `EngagementCampaignEvent` rows (`impression`, `dismiss`, and presumably form-submit actions) keyed by `user_id` or anonymous `visitor_id` — `app/Domains/Engagement/Services/EngagementInteractionService.php:11-30`.
- `EngagementVisitorService` — resolves/persists an anonymous visitor UUID via `X-Visitor-Id` header or `drivebay_vid` cookie (1-year, httpOnly, `lax`) — `app/Domains/Engagement/Services/EngagementVisitorService.php:11-33`.
- `EngagementCampaignPersistenceService` — converts the Filament admin form's nested JSON (`content_json`, `form_json`, `targeting_json`, `frequency_json`) into/from the relational `EngagementCampaign*` child tables — `app/Domains/Engagement/Services/EngagementCampaignPersistenceService.php:17-80`.

Models: `EngagementCampaign` (soft-deletes, auto-generates `uuid`) has many `EngagementCampaignContent` (per-locale copy), `EngagementCampaignFormField`, `EngagementCampaignTargetLocale`, `EngagementCampaignTargetRoute`, and `EngagementCampaignEvent` (interaction log) — `app/Models/Domains/Engagement/Models/EngagementCampaign.php:18-56`.

**Business rules**: targeting order is locale → route pattern (supports `Str::is()` glob and prefix match, with a hardcoded mobile-route alias table for `/search`, `/account`, `/messages`) → auth mode (`any`/`guest`/`user`/`dealer`) → dealer-only flag → new-user age window; frequency gate checks permanent-dismiss, then max-impressions, then cooldown-hours, in that order — `app/Domains/Engagement/Services/EngagementDeliveryService.php:117-236`.

**Connections**: Moderation (`UserWarningService`) takes priority over marketing campaigns in the same delivery slot; delivered on every Inertia response via `HandleInertiaRequests` (see cross-domain map).

## Analytics

**Purpose**: first-party event capture for listing performance (views, impressions, clicks) and seller-facing analytics dashboards — no third-party analytics vendor involved.

Key classes:
- `ListingAnalyticsService` — `recordView()` (creates `ListingView`, increments `listing.views_count`/`unique_views_count` via an existence check on `user_id` or `session_id`), `recordImpressions()` (bulk-insert `ListingImpression` in a transaction), `recordClick()` (creates `ListingClickEvent` + variable `ListingClickEventContext` rows; increments `phone_click_count` for `phone`/`whatsapp`/`viber`/`email` click types) — `app/Domains/Analytics/Services/ListingAnalyticsService.php:16-140`.
  - `resolveViewSource()` infers a source (`homepage`/`search`/`listing_detail`/`storefront`/`referral`/`api`/`direct`) from the `Referer` header path or `X-Analytics-Source`/`source` param when not one of a fixed allow-list — `:176-215`.
- `SellerAnalyticsService` — seller dashboard aggregation (`overview()`, `forListing()`), clamps requested date range to 7–90 days, computes daily series/top-listings/impression-and-view-source breakdowns — `app/Domains/Analytics/Services/SellerAnalyticsService.php:25-99`.

Models: `ListingView`, `ListingImpression`, `ListingClickEvent` (+ `ListingClickEventContext` child for arbitrary key/value context per click), all `$timestamps = false` (use an explicit `created_at` only, no `updated_at`) — `app/Models/Domains/Analytics/Models/ListingView.php:9-20`, `ListingClickEvent.php:9-22`.

**Removed unused daily rollup stubs** (**Jira: KAN-17** `734ba07`). Empty
`ListingPerformanceDaily`/`SellerPerformanceDaily` models and their tables were dropped —
migration `database/migrations/2026_07_28_091500_drop_unused_performance_daily_tables.php`;
`docs/database/migration_plan.md` Phase 14 updated. They never had writers.

**Gotcha — `PageEvent` still an empty stub**. `page_events` table remains in schema (Phase 14;
FK from `user_listing_interactions.page_event_id`) but `PageEvent` is an empty model with
no writers — `app/Models/Domains/Analytics/Models/PageEvent.php`.

**Connections**: `recordView`/`recordImpressions`/`recordClick` are called from `Web/ListingController`, `Web/ListingAnalyticsController`, `Api/V1/ListingAnalyticsApiController`, `Web/Storefront/StorefrontListingController`, and — separately — `Web/AdClickController` calls `AdvertisementDeliveryService::recordClick()` (Advertising's own counter, not `ListingAnalyticsService`). `ListingController@show` calls `ListingAnalyticsService` and `RecommendationService` in the same method, i.e. every listing view is both an analytics event and recommendation-training signal.

## Promotion

**Purpose**: paid listing boosts/featured placement — sells a `PromotionType` (boost multiplier + optional Instagram/Facebook auto-publish), raises the listing's search `boost_score`, and surfaces a "featured" rail.

Key classes:
- `PromotionService::activate()` — creates an active `ListingPromotion` with `ends_at` from duration days (invoice/catalog), idempotent per `payment_id`, notifies seller (`listing.promoted` in-app + email), syncs boost, schedules social — `app/Domains/Promotion/Services/PromotionService.php`.
- `ExpireListingPromotionsJob` (hourly) — marks due rows `status=expired` when `ends_at` passed; null `ends_at` = admin permanent (**Jira: KAN-112**).
- `PromotionService::featuredListings()` — active window promotions for `featured_home`/`featured_social`/`featured`, falls back to `boost_score`.
- `PromotionEligibilityService` — `canPromoteListing()` requires active listing, ownership, and **no** current active promotion; assert returns 409 when already featured (**Jira: KAN-112**).

Models: `ListingPromotion` (`ends_at` nullable for permanent admin), `PromotionType`.

**Gotcha**: boost multipliers are hardcoded in `PromotionService` (`$defaultMultipliers`), not read from `PromotionType` columns.

**Web badge UX (2026-08-05)**: `Components/PromotionBadges.vue` collapses `featured`/`featured_home`/`featured_social` into a single amber "Featured" chip (`promotions.featured_badge`). Show exactly **one** badge per surface: `Pages/Listings/Show.vue` keeps only the row beside the price (image overlay removed), `Pages/Storefront/ListingShow.vue` keeps only the image overlay. Seller "My listings" (`Pages/Seller/Listings/Index.vue`) groups into featured-first sections using the same three codes off `active_promotion.code` / `promotion_badges`; section headers are a minimal star + uppercase label + count + hairline rule using theme tokens only (`accent`/`ink`/`ink-faint`/`border`) — a tinted amber card was rejected as off-theme.

**Connections**: → Search (`SyncListingSearchDocumentJob`), → SocialPublishing, → Billing (`Payment`), → Notifications.

## SocialPublishing

**Purpose**: Instagram (and a stubbed Facebook path) auto-posting for listings — triggered by a paid promotion, a seller's manual "domain publish" quota, or an admin manually queuing a post from Filament.

Key classes:
- `SocialPublishService` — facade; `schedule()` / `publish()`; driver `fake` vs `meta`/`live`/`graph` → Meta publisher — `app/Domains/SocialPublishing/Services/SocialPublishService.php`.
- `PlatformSocialAccount::isReady()` — requires active + account_id + token; **rejects expired** `token_expires_at` when driver is live. Token lives in Filament DB (encrypted), not `.env`.
- `WarnExpiringInstagramTokenJob` (daily 09:00) — Filament staff notify ~7 days before expiry.
- Ops runbook: `docs/operations/instagram-publishing.md`.

**Gotcha**: platform_config Instagram driver must be `meta` (not `graph`); legacy `graph` still maps to Meta publisher for BC.

**Caption format (2026-08-05)**: `InstagramCaptionBuilder` builds sectioned captions (emoji blocks + `➖` dividers) — headline, price/`price_type`, specs+description, optional financing (`monthly_payment_amount`), equipment/features, warranty, `contact_phone`, seller `@mention`, brand footer, listing URL + **gallery URL** (`caption_gallery`) + hashtags. Caps at 2200 chars. Lang keys `marketplace.instagram.caption_*` (en/sr). Tests: `tests/Feature/InstagramCaptionBuilderTest.php`.

**Facebook is mock-only and gated (2026-08-05, KAN-114)**: no live Facebook publisher exists — `FakeFacebookPublisher` fabricates `mock_fb_*` IDs and dead permalinks. Scheduling is gated by the `facebook-publish` Pennant (`config('drivebay.facebook.enabled')`, default **false**), so `featured_social` (which still has `includes_facebook_publish = true` in the seeder) creates an Instagram post only. `publish()` no longer `firstOrCreate`s a Facebook `platform_social_accounts` row — a missing account fails the post. `deleteFromInstagram()` / `postInstagramComment()` check `$post->platform`: non-Instagram posts are cancelled locally and never sent to the Graph API (previously a `mock_fb_*` ID was sent to the IG account, yielding "Unsupported delete request").

**Carousel (2026-08-05)**: publish uses all listing photos (cover first, then `sort_order`), capped at Meta’s 10 (`config('drivebay.instagram.carousel_max_images')`). `MetaInstagramPublisher` creates child `is_carousel_item` containers + parent `media_type=CAROUSEL`; one photo keeps the single-image path. Persists `listing_social_posts.image_urls` JSON. Admin custom image URL remains a single-image override. Dev fallback collapses many local URLs to one placeholder.

**Public gallery (2026-08-05, KAN-115, `2191d99`)**: `GET /instagram` (`InstagramGalleryController` → `Instagram/Index.vue`) lists published Instagram posts for **active** listings, one tile per listing (newest `id` wins), cover from `listing_social_posts.image_url`. Tile → listing URL; optional IG permalink badge. Captions add scheme-less gallery line via `InstagramCaptionBuilder::galleryLine()` / `marketplace.instagram.caption_gallery`. Also in sitemap + footer. Tests: `InstagramGalleryPageTest`.

## Advertising

**Purpose**: manual (staff-managed) banner ad delivery by placement/slot — matches `docs/advertising/advertising.md`'s "manual campaigns today" framing, with two real doc discrepancies noted below.

Key classes:
- `AdvertisementDeliveryService::activeBySlot()` — caches the whole slot→ad map for `advertising.cache_ttl_seconds` (300s = 5 min, matches doc) under one cache key `advertisements.active_by_slot`, invalidated via `AdvertisementObserver` (`saved`/`deleted`) — `app/Domains/Advertising/Services/AdvertisementDeliveryService.php:14-31`, `app/Observers/AdvertisementObserver.php:9-16`.
- `resolveSlot()` filters to `provider === 'manual'` only (the `html`/`adsense`/`other_network` providers are inert, matching docs), then `pickWeighted()` does a weighted-random pick among active ads for that slot — `:36-83`.
- `Advertisement::scopeActive()` — the eligibility scope: `is_active`, within `starts_at`/`ends_at` window, and `impressions_count < impressions_limit` when a limit is set — `app/Models/Domains/Advertising/Models/Advertisement.php:53-67`.

**Doc discrepancy #1**: `docs/advertising/advertising.md` says `GET /go/ad/{advertisement}` "increments `clicks_count` and redirects to `target_url`." In code, `/go/ad/{advertisement}` is just a redirect shim to `route('promo.click', ...)`; the actual click-tracking + redirect logic (`AdvertisementDeliveryService::recordClick()` then `redirect()->away($target_url)`) lives at `/go/promo/{advertisement}` via `AdClickController` — `routes/web.php:61-63`, `app/Http/Controllers/Web/AdClickController.php:12-23`.

- `AdvertisementDeliveryService` — serves ads for placements; `recordClick()` and
  `recordImpression()` (**Jira: KAN-8** — impressions wired via `POST /go/promo/{ad}/impression`
  + `AdSlot.vue` IntersectionObserver / `useAdImpressions.js`).


**Connections**: `AdvertisementDeliveryService` reads `config('advertising.placements')`/`config('advertising.sizes')`; frontend gets ads via Inertia shared prop `page.props.ads[placement]` (same mechanism family as Engagement's shared prop, but a separate service).

## FuelPricing

**Purpose**: scrapes Montenegro retail fuel prices from a public government open-data portal (not a JSON API) on a daily schedule, stores snapshots, and alerts subscribed users to changes.

Key classes:
- `MontenegroFuelPriceScraper` — HTML scraper (uses `DOMDocument`/`DOMXPath`, not a REST client) against `data.gov.me`'s dataset search + detail pages; paginates search results, rate-limits itself via `request_delay_ms` — `app/Domains/FuelPricing/Services/MontenegroFuelPriceScraper.php:16-24`.
- `MontenegroFuelPriceSyncService::sync()` — de-dupes by `source_slug`; skips existing datasets unless `force`; on parse failure (`RuntimeException`, e.g. older XLSX-only pages with no inline HTML prices) increments a `failed` counter and logs a warning rather than aborting the whole run — `app/Domains/FuelPricing/Services/MontenegroFuelPriceSyncService.php:27-94`.
- `FuelPriceAlertService::notifyForNewSnapshot()` — diffs the new snapshot against the previous one per fuel code, then for every active `FuelPriceAlertPreference` subscribed to a changed fuel, creates a `Notification` row directly (bypassing `ListingNotificationService`) with `type: 'fuel_price.updated'` and a `mobile_route: '/search/fuel'` in metadata — `app/Domains/FuelPricing/Services/FuelPriceAlertService.php:69-141`.
- `SyncMontenegroFuelPricesJob`/`SyncMontenegroFuelPricesCommand` — both call sync then alert in sequence; scheduled daily at 07:00, `withoutOverlapping()->onOneServer()`, `maxPages` from `config('fuel_prices.sync.daily_pages', 1)` — `routes/console.php:24-29`.

Models: `MontenegroFuelPriceSnapshot` (one row per source dataset/date, 4 fuel codes × price + day-over-day change columns), `FuelPriceAlertPreference` (`user_id` unique, per-fuel-code boolean opt-ins, `subscribe_all` convenience flag that forces all four true, auto-deactivates (`is_active=false`) if a user unchecks every fuel) — `app/Models/Domains/FuelPricing/Models/FuelPriceAlertPreference.php:9-27`, `app/Domains/FuelPricing/Services/FuelPriceAlertService.php:56-64`.

**Gotcha**: this is screen-scraping a government open-data HTML portal, not a stable versioned API — brittle to any markup change on `data.gov.me`; the sync command already anticipates partial failure (`$stats['failed']`) and surfaces a specific warning about older XLSX-only datasets — `app/Domains/FuelPricing/Console/SyncMontenegroFuelPricesCommand.php:39-42`.

**External integration**: `https://data.gov.me` (public Montenegro open-data portal, no auth/API key). Config: `config('fuel_prices.enabled')` (env `FUEL_PRICES_ENABLED`), `fuel_prices.source.{base_url,search_path,search_query,user_agent,request_delay_ms,timeout_seconds}`, `fuel_prices.sync.{default_pages,max_pages,daily_pages}` — `config/fuel_prices.php`. No secrets involved (public dataset).

**Connections**: → Notification (direct `Notification::create`, see cross-domain map); ← FuelEconomy reads `MontenegroFuelPriceSnapshot::latestSnapshot()` for running-cost pricing.

## FuelEconomy

**Purpose**: estimates real-world fuel consumption (L/100km) for a vehicle, either from local taxonomy data/heuristics or an AI (OpenAI) fallback, then prices out running cost using FuelPricing data.

Key classes:
- `ConsumptionProvider` contract with two implementations: `LocalVehicleConsumptionProvider` (queries `Vehicle` rows for matching make/model/year/fuel; prefers an averaged `wltp_consumption_combined_l100` ("manufacturer" source), else a heuristic formula from displacement/power/transmission via `config('fuel_economy.estimation.*')` coefficients, penalizing automatic/DCT/CVT/DSG gearboxes) and `ManualConsumptionProvider` — `app/Domains/FuelEconomy/Providers/LocalVehicleConsumptionProvider.php:16-95`.
- `FuelConsumptionCalculatorService` — applies real-world correction factors on top of official/WLTP figures: `config('fuel_consumption_calculator.correction_factors')` (petrol 1.25×, diesel 1.20×, LPG 1.20×) plus a driving-type adjustment (city +0.10, highway −0.05) — `config/fuel_consumption_calculator.php:14-28`.
- `FuelConsumptionAiEstimateService` — cache-first by a `normalized_key` (built by `FuelConsumptionEstimateKeyBuilder` from make/model/year/engine/displacement/power/fuel/gearbox) against `FuelConsumptionEstimate`; on cache miss calls `OpenAiFuelConsumptionClient`, validates the response, and **persists it permanently** (no TTL/expiry) as `source: 'ai_estimate'` — `app/Domains/FuelEconomy/Services/FuelConsumptionAiEstimateService.php:22-69`.
- `OpenAiFuelConsumptionClient` — calls `https://api.openai.com/v1/chat/completions` directly via `Http::withToken()` (not the official OpenAI SDK), model default `gpt-4o-mini`, forces `response_format: json_object`, temperature 0.2 — `app/Domains/FuelEconomy/Services/OpenAiFuelConsumptionClient.php:18-42`.
- `FuelConsumptionAiResponseValidator` — rejects the AI response if: fuel type is electric/EV (returns null — no consumption for EVs), any of the three numeric fields is missing, `confidence` isn't `low`/`medium`/`high`, any value is outside `[2, 30]` L/100km, or `city < open_road` (city consumption must be ≥ highway) — `app/Domains/FuelEconomy/Services/FuelConsumptionAiResponseValidator.php:15-40`.
- `FuelConsumptionPriceResolver` — resolves a per-liter price: manual override > latest Montenegro snapshot (diesel/petrol_95 only — no petrol_98/heating_oil mapping here) > `config('fuel_consumption_calculator.fallback_prices_eur')` — `app/Domains/FuelEconomy/Services/FuelConsumptionPriceResolver.php:19-58`.

Models: `FuelConsumptionEstimate` — one row per `normalized_key`, stores both the validated numbers and the raw AI `raw_response` JSON for audit — `app/Models/Domains/FuelEconomy/Models/FuelConsumptionEstimate.php`.

**Gotcha** (**Jira: KAN-11**): AI estimates are cached indefinitely (`updateOrCreate` keyed only by vehicle spec, no expiry/versioning) — a prompt or model change won't invalidate previously cached estimates unless `forceRefresh` is explicitly passed.

**External integration**: OpenAI Chat Completions API. Config: `config('services.openai.api_key')`, `services.openai.fuel_consumption_model` (default `gpt-4o-mini`), `services.openai.timeout_seconds` (default 30) — `app/Domains/FuelEconomy/Services/OpenAiFuelConsumptionClient.php:18,24,27`. Gated by the `FuelEconomyEstimate` Pennant flag (`app/Providers/AppServiceProvider.php` feature-define list) and `config('fuel_consumption_calculator.ai.enabled')`. No secret values captured here.

**Connections**: ← Vehicle (taxonomy lookups for the local provider), ← FuelPricing (live pricing for cost-per-100km estimates); exposed via `Http/Controllers/Web/FuelConsumptionCalculatorController` and `Http/Controllers/Api/V1/Tools/FuelConsumptionCalculatorApiController`.
