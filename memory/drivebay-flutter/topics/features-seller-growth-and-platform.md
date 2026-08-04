# drivebay-flutter — Seller/growth features, shared UI, platform & test deep reference

Supplements `topics/architecture.md`/`domain.md`/`conventions.md` (breadth-only) — does not
repeat their content. All bare paths (e.g. `lib/...`, `test/...`) are relative to
`apps/drivebay-flutter/`; paths prefixed `apps/drivebay/` are the Laravel backend, cross-referenced
from `memory/drivebay/topics/domains-core.md` (Listing/Media/Moderation) and
`domains-growth.md` (Engagement/Analytics/Promotion/FuelPricing/FuelEconomy). Verified against
the working tree as of 2026-07-15.

## Part A — Seller & growth features

### Seller dashboard — `lib/features/seller/`

| File | Purpose |
|---|---|
| `autodiler_import_screen.dart` (1403 lines) | Paste an Autodiler profile URL → preview scraped listings → per-listing inline editor (make/model/year/mileage/city/fuel/transmission) → select + import with a polling progress overlay |
| `create_listing_screen.dart` (1370 lines) | 7-step wizard (vehicle → specs → equipment → details → photos → location → review), shared for create and edit (`editPublicId`) |
| `my_listings_screen.dart` (549) | Seller's listing list with `all/live/pending/rejected` filter tabs, price update, publish, mark-sold, promote actions |
| `seller_listing_card.dart` (402) | The list-row widget for `my_listings_screen.dart` (status/moderation badges, per-card action menu) |
| `promote_listing_sheet.dart` (330) | Bottom sheet to pick a `PromotionType` and start checkout for a listing |
| `promotion_checkout_screen.dart` (277) | Fake/mock in-app confirm after `PromotionRepository.startCheckout()` when `checkout_mode=in_app` |
| `paddle_checkout_screen.dart` | In-app browser (Custom Tabs) for Paddle `redirect_url`; resume / “I've paid” → `POST /billing/paddle/complete` (**Jira: KAN-111**) |
| `update_price_dialog.dart` (112) | Simple price-change dialog used from `my_listings_screen.dart` |
| `dealer_listing_card.dart` (4) | Just a `typedef DealerListingCard = SellerListingCard` re-export — no separate dealer card widget exists |
| `widgets/listing_photo_uploader.dart` (683) | Multi-photo picker/reorder/delete grid for the create/edit wizard — uses `image_picker` **gallery only** (`ImageSource.gallery`, `listing_photo_uploader.dart:61`), no camera capture path |
| `widgets/listing_photo_crop_sheet.dart` (218) | Crop UI shown after picking a photo |
| `widgets/listing_map_location_picker.dart` (213) | `flutter_map` tap-to-drop-a-pin picker — no "use my current location" button, no `geolocator` call found (grepped, zero hits); confirms no location permission is needed for this screen |

**Seller listing endpoints** (`lib/repositories/seller_listing_repository.dart`) all hit
`/seller/listings...` and match `apps/drivebay/routes/api/v1/seller.php:19-33` 1:1: `getFormOptions`
→ `/listing-form-options`, `getMyListings` → `GET /seller/listings`, `createListing`/`updateListing`
→ `POST`/`PATCH /seller/listings[/{publicId}]`, `updatePrice` → `PATCH .../price`, `publish` → `POST
.../publish`, `markSold` → `POST .../sold`, `requestPhotoReview` → `POST
.../request-photo-review`, photo CRUD → `.../media[/{id}][/reorder]`.

**Autodiler import — mobile/backend consistency (confirmed).** `lib/repositories/
autodiler_import_repository.dart` calls `POST /seller/import/autodiler/preview`, `POST
/seller/import/autodiler` (store), `GET /seller/import/autodiler/status` — these match
`apps/drivebay/routes/api/v1/seller.php:9-16` exactly (`AutodilerImportApiController::preview/
store/status`), including the separate un-prefixed `throttle:api-import-status` middleware group
for the status-poll route. The mobile screen (`autodiler_import_screen.dart`) polls status every
1s for up to 180 attempts (`:365-382`) and independently detects "year/mileage swapped" input
errors client-side (`AutodilerImportListing.normalizeSwappedYearMileage()`,
`hasSwappedYearMileage`, in `lib/models/autodiler_import.dart`) *before* submitting — this is a
client-side guard layered on top of, not a replacement for, whatever server-side validation
`StoreAutodilerImportRequest` does; the backend's own moderation/media auto-approval pipeline for
Autodiler placeholder photos (`ListingModerationPipelineService`,
`memory/drivebay/topics/domains-core.md`) runs after import, not something this screen shows.

**Gotcha — no seller analytics UI in this app.** The backend exposes `GET /seller/analytics` and
`GET /seller/listings/{publicId}/analytics` (`apps/drivebay/routes/api/v1/seller.php:16-17`,
backed by `SellerAnalyticsService` per `memory/drivebay/topics/domains-growth.md`), but grepping
`lib/` for `analytics`/`SellerAnalytics` turns up only one hit: `listing_repository.dart:61`
posts `/listings/$publicId/analytics/view` (records a buyer-side view event). There is no seller
analytics dashboard screen, repository, or provider anywhere in this app — the seller-facing
analytics dashboard is web/Filament-only today. Don't assume a mobile analytics screen exists.

### Engagement — `lib/features/engagement/`

- `engagement_host.dart` (`EngagementHost`, mounted app-wide in `lib/app.dart:163-166`) is a
  route-change-driven poller: on every go_router route change (`_handleRouteChange`,
  `engagement_host.dart:113`) it calls **one endpoint**,
  `GET /engagement-campaigns/active?screen=<path>`
  (`lib/repositories/engagement_campaign_repository.dart:10-13`), skipping a fixed ignore-list of
  routes (`/`, `/onboarding`, `/login`, `/register`, `/verify-email`, `:66-72`).
- `engagement_content.dart` has small pure helpers: `resolveEngagementImageUrl`,
  `navigateEngagementUrl` (external `http(s)` → `launchUrl`; internal path → `router.go`), and
  `**` bold-markdown-lite text-span formatting for campaign body text.
- Response shape is `EngagementCampaign` (`lib/models/engagement_campaign.dart`) with
  `displayMode` (`modal`/`banner`), `type` (`info`/`nps`/`survey`/`moderation_warning`), optional
  `form` fields for surveys, NPS 0–10 buttons, or a plain CTA/secondary-CTA dialog.

**Cross-check vs backend "Moderation hijacks the Engagement popup slot" (confirmed, same
mechanism on mobile).** Backend: `EngagementDeliveryService::activeForRequest()` checks
`UserWarningService::pendingForUser()` first and returns it as the same payload shape as a
marketing campaign (`memory/drivebay/topics/domains-growth.md` cross-domain map, row 17). Mobile
mirrors this exactly: the single `/engagement-campaigns/active` response can come back with
`type: 'moderation_warning'`, and `EngagementCampaign.isModerationWarning` (`engagement_campaign.
dart` getter) makes `_EngagementHostState._loadAndPresent` branch to
`_presentModerationWarning()` (`engagement_host.dart:188-193`) instead of the marketing-campaign
dialog — which renders the **same** `UserWarningAcknowledgeDialog` used elsewhere
(`lib/features/moderation/widgets/user_warning_acknowledge_dialog.dart`), built from a synthetic
`UserWarning` via `_warningFromCampaign()` (`:204-215`). So yes: on mobile too, a pending
moderation warning is delivered through, and occupies, the same UI slot as marketing popups —
consistent with the backend finding.

**New finding not in the backend note: a second, independent path to the same dialog** (**Jira: KAN-20**).
`lib/features/moderation/moderation_host.dart` (`ModerationHost`, also mounted app-wide,
*nested inside* `EngagementHost` in `lib/app.dart:163-166`) runs its own check — on `initState`
and whenever `authNotifierProvider`'s `warningStatus.hasPendingPopup` flips true
(`moderation_host.dart:94-102`) — that calls `GET` the account endpoint via
`accountRepositoryProvider.getAccount()`, finds the first `warning.isPending`, and shows the
*exact same* `UserWarningAcknowledgeDialog` directly, independent of route changes or the
Engagement endpoint. Both hosts are mounted simultaneously (`EngagementHost` wraps
`InAppNotificationHost` wraps `ModerationHost` wraps `child`, `lib/app.dart:163-166`), each with
its own dedupe guard (`_pendingCampaignUuid` in `EngagementHost` vs `_shownWarningUuid` in
`ModerationHost`) but no cross-awareness of each other. In practice `ModerationHost` fires first
(on auth-state change, e.g. right after login) and `EngagementHost` fires on the next route
change; if a task ever touches either path, check both — they are two separate client-side
mechanisms converging on one dialog, not one shared implementation.

### Tools — `lib/features/tools/`

Client-side models exactly mirror backend request/response shapes; endpoints confirmed against
`apps/drivebay/routes/api/v1/tools.php` and `fuel-prices.php`:

| Mobile call (`lib/repositories/tools_repository.dart` / `fuel_price_repository.dart`) | Backend route |
|---|---|
| `GET /tools/registration/options` | `RegistrationCalculatorApiController::options` |
| `POST /tools/registration/calculate` | `RegistrationCalculatorApiController::calculate` |
| `GET /tools/fuel-consumption/options` | `FuelConsumptionCalculatorApiController::options` |
| `POST /tools/fuel-consumption/calculate` | `FuelConsumptionCalculatorApiController::calculate` |
| `POST /tools/fuel-consumption/ai-estimate` | `FuelConsumptionCalculatorApiController::aiEstimate` |
| `GET /fuel-prices`, `GET /fuel-prices/latest` | `FuelPriceApiController::index/latest` (public) |
| `GET`/`PUT /fuel-prices/alerts` | `FuelPriceAlertApiController::show/update` (auth) |

- `lib/models/registration_calculator.dart` / `fuel_consumption_calculator.dart` — plain (non-
  freezed) hand-written model classes with `fromJson`/`toJson`, matching the FuelEconomy/
  FuelPricing domain shapes described in `memory/drivebay/topics/domains-growth.md`
  (`FuelConsumptionPriceResolver` fallback prices, `FuelPriceAlertPreference` per-fuel-code
  opt-ins). `FuelConsumptionCalculatorOptions.visibleConsumptionSources()` hides the `'ai'` source
  option client-side unless `aiEnabled` is true — a second gate on top of whatever the backend's
  `ai_enabled` config flag already does.
- `registration_calculator_screen.dart` (523) / `fuel_consumption_calculator_screen.dart` (1331,
  the largest tools file — includes an AI-estimate panel, `_AiEstimatePanel`) are the two
  calculator screens reachable only via the bottom-nav "Tools" popup menu (see Shell below), not
  via a dedicated tab.
- `fuel_prices_screen.dart` (783) + `fuel_price_history_chart.dart` (267) + `fuel_price_alerts_
  panel.dart` (437) together form the fuel-prices hub: `fuel_price_history_chart.dart` draws its
  own line chart with a raw `CustomPainter` (`_FuelLineChartPainter`) — no charting package
  dependency. `fuel_price_alerts_panel.dart` has a `_GuestCard` state for unauthenticated users
  (alerts require login, matching the `auth:sanctum` middleware on the alerts routes).
- Reached from search, not tools-menu: `main_shell.dart:87-96` routes the tools-menu's "Fuel
  prices" item to `SearchHubPage.fuel` inside the search tab, while `/search/fuel` as a direct
  route just redirects to `/search` (`lib/features/shell/app_router.dart:43-45`) — the fuel-prices
  UI lives inside `SearchHubScreen`'s paged view, not as its own route.

### Shell — `lib/features/shell/`

- `app_router.dart` — one `go_router` `GoRouter` with a `rootAppNavigatorKey` for full-screen
  pushed routes (login, listing detail, seller screens, tools calculators, etc., all declared
  with `parentNavigatorKey: rootAppNavigatorKey`) plus a `StatefulShellRoute.indexedStack` with
  exactly **3 branches**: `/search` (index 0), `/messages` (index 1), `/account` (index 2).
  `initialLocation: '/'` → `BootstrapScreen`.
- `main_shell.dart` (`MainShell`) renders the actual bottom nav. Visually there are **4** nav
  slots plus a center FAB, but the router only has 3 real tab branches — `AppBottomNav`
  (`lib/widgets/app_bottom_nav.dart`) shows `[search, tools, messages, profile]` where "tools"
  (`navIndex 1`) is **not** a shell branch: tapping it calls `onTools` → `_openToolsMenu()`
  (`main_shell.dart:68-99`), which pops up `NavToolsMenu` (an anchored popup, not a route) with
  3 items: Registration calculator (`push /tools/registration`), Fuel consumption (`push
  /tools/fuel-consumption`), Fuel prices (switches the search tab to `SearchHubPage.fuel` and
  calls `_onTap(0)` rather than pushing a route). The center `+`/add-listing button
  (`_onAddListing`, `:50-66`) checks `auth.sellingRestriction?.active` and shows a snackbar
  instead of navigating if the seller is currently restricted from selling
  (cross-references the Moderation domain's selling-restriction flag, same source
  `auth.sellingRestriction` also read by `ModerationBannerStack` mounted at
  `main_shell.dart:146`).
- **Badge counts** — two independent `Notifier<int>` pollers, both gated on
  `authNotifierProvider` status and stopped/reset to 0 on logout:
  - `lib/features/messages/message_unread_count_notifier.dart` — polls
    `messageRepositoryProvider.getThreads()` every **30s** (`:40`), sums `thread.unread` for
    non-muted threads (`syncFromThreads`, `:64-69`); feeds the messages-tab badge in
    `AppBottomNav`.
  - `lib/features/notifications/notification_unread_count_notifier.dart` — polls independently
    every **20s** (`:65`); feeds the bell-icon badge in `main_shell.dart`'s `AppBar` (only shown
    when `index == 0`, i.e. on the search tab, `main_shell.dart:132-140`), not the bottom nav.
  - Neither notifier shares a timer or a single "any unread" endpoint — two separate polling
    loops at two different cadences.
- `bootstrap_screen.dart` (`BootstrapScreen`, the `/` route) — startup sequence: `GET /health` →
  `authNotifierProvider.bootstrap()` (restores session from secure storage) → `appConfigProvider`
  → `queueColdStartNavigationTargets` (deep-link/notification cold-start routing) → checks
  `appPreferencesStorageProvider.readOnboardingCompleted()` → routes to `/onboarding` (carrying
  any pending deep-link as a `redirect` query param) or to the resolved launch route. Any
  exception before that point renders `AppErrorScreen`-based `ConnectionErrorScreen` with retry.

## Part B — Shared UI/utils

### `lib/widgets/` (~17 files)

| File | One-line purpose |
|---|---|
| `account_type_card.dart` | Selectable card (icon/title/description) used on account-type picker screens |
| `app_bottom_nav.dart` | The 4-slot + center-FAB bottom navigation bar (see Shell above) |
| `app_error_screen.dart` | Generic full-screen error state with retry/secondary action, incl. `ConnectionErrorScreen` used by bootstrap |
| `app_searchable_select_field.dart` | `AppSelectField` variant with an inline search box for long option lists |
| `app_select_field.dart` | Themed dropdown/select form field, generic over `T`, with `AppSelectItem<T>` |
| `app_text_field.dart` | Themed `TextFormField` wrapper (label/hint/error/formatters) used across all forms |
| `auth_card.dart` | Centered max-width card shell used by login/register/verify-email screens |
| `brand_icon.dart` | WhatsApp/Viber SVG brand icon (`assets/brand/*.svg`) |
| `drivebay_logo.dart` | App logo/wordmark widget, 3 sizes (`LogoSize.sm/md/lg`) |
| `listing_card_meta_footer.dart` | Footer row (location/date/etc.) for listing cards |
| `listing_card_price_rating.dart` | Price-rating bar/label chip (`good/fair/high` style segment bar) shown on listing cards |
| `listing_card_specs_row.dart` | Year/mileage/fuel/transmission chip row for listing cards |
| `listing_price_tag.dart` | Price display with optional strikethrough original price / discount, 3 sizes |
| `nav_icon_badge.dart` | Small red count badge overlay (caps display at "99+") wrapped around any icon |
| `nav_tools_menu.dart` | Anchored popup menu widget backing the bottom nav's "Tools" slot |
| `promotion_badges.dart` | Renders a listing's promotion badges (e.g. "featured", "boosted") from a `List<String>` |
| `step_indicator.dart` | Horizontal dot/dash step progress indicator (used by the 7-step create-listing wizard) |
| `vehicle_make_badge.dart` | Make logo image with initials fallback, mirrors web `VehicleMakeLogo` (`vehicle_make_badge.dart:6` comment) |

### `lib/utils/` (~8 files)

| File | One-line purpose |
|---|---|
| `equipment_labels.dart` | Maps equipment/feature category codes to localized labels |
| `external_links.dart` | Thin `url_launcher` wrapper (`ExternalLinks.open`/`openString`) with `canLaunchUrl` guard |
| `format.dart` | Price/number/date formatting helpers (thousand-separator price formatting, etc.) |
| `listing_price.dart` | `ListingPriceComparison` — original-vs-current price/discount computation, no widget code |
| `listing_url.dart` | Builds the public web URL for a listing (`listingWebUrl`) and parses a public ID back out of a deep-link URI |
| `media_url.dart` | Resolves API-relative media URLs to absolute device-reachable URLs (`MediaUrl.resolve`, handles dev-host rewriting per its test) |
| `messenger_link_builder.dart` | Normalizes phone numbers / builds WhatsApp-Viber messenger deep links |
| `taxonomy_labels.dart` | Maps vehicle-taxonomy codes (type/fuel/transmission/etc.) to localized labels |
| `vehicle_type_model_selection.dart` | Decides whether a vehicle type uses the catalog make/model picker vs free-text (only `car` uses the catalog, `catalogModelVehicleTypeCodes`) |

## Part C — Platform & test inventory

### Permissions

| Platform | Declared | Evidence |
|---|---|---|
| Android | `POST_NOTIFICATIONS`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED` (+ one more `uses-permission` continued past the grep) | `android/app/src/main/AndroidManifest.xml:2-6` |
| iOS | `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription` only | `ios/Runner/Info.plist:68-71` |

- **No camera permission on either platform** (`NSCameraUsageDescription` absent from
  `Info.plist`; no `CAMERA` in the Android manifest) — consistent with `image_picker` only being
  called with `ImageSource.gallery` (`lib/features/seller/widgets/listing_photo_uploader.dart:
  61`, confirmed the only `ImageSource.*` call in the app via grep).
- **No location permission on either platform** (no `NSLocationWhenInUseUsageDescription`/etc. in
  `Info.plist`, no `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION` in the manifest) despite the
  `flutter_map` dependency (`pubspec.yaml:35`) — there's no `geolocator` dependency at all, and
  `listing_map_location_picker.dart` is tap-to-drop-a-pin only, never reads device location.
- `photo_manager`/`photo_manager_image_provider` (`pubspec.yaml:25-26`) are dependencies but not
  used by anything under `lib/features/seller/` — grep them separately before assuming they back
  the seller photo uploader; they don't (that screen uses plain `image_picker`).

### Firebase per platform

- Android: `android/app/google-services.json` is committed (confirmed present) and
  `lib/firebase_options.dart` has a real `android` `FirebaseOptions` block (`:27-33`).
- **iOS: not configured, not a gap to "fix" without asking — it's explicit.**
  `lib/firebase_options.dart`'s `case TargetPlatform.iOS` and the `default` branch both `throw
  UnsupportedError('Firebase is only configured for Android in this project.')`
  (`lib/firebase_options.dart:16-24`); no `GoogleService-Info.plist` exists anywhere under `ios/`
  (confirmed via `find`, zero hits). This means FCM push notifications do not work on an iOS
  build of this app today — this is a stronger, more precise statement than
  `topics/architecture.md`'s generic "firebase_messaging for push" line; update that note if iOS
  push is ever added.
- Web platform is also explicitly unsupported for Firebase (`'DriveBay mobile does not support
  web Firebase yet.'`, `lib/firebase_options.dart:10`) — but `web/` still exists as a buildable
  Flutter web target (`web/index.html`, `manifest.json`, `icons/`) for whatever doesn't need push.

### Desktop runners (windows/, linux/, macos/)

- `windows/runner/main.cpp` (43 lines), `windows/flutter/generated_plugin_registrant.cc` (32),
  `linux/runner/main.cc` (6), `linux/runner/my_application.cc` (148),
  `linux/flutter/generated_plugin_registrant.cc` (27) — all stock `flutter create` boilerplate
  sizes; nothing suggesting hand-written customization was found. Windows is the documented dev
  target (`topics/conventions.md`'s `flutter run -d windows ...` command), consistent with no
  custom runner code needed.

### `test/` (6 files, 7 tests total — thin, unit-level only)

| File | What it actually tests |
|---|---|
| `listing_card_test.dart` | `ListingCard.fromJson` parsing with null optional fields (2 tests: buyer-facing card, seller card with pending status) |
| `listing_contact_channels_test.dart` | Parsing contact channels (phone/WhatsApp/Viber) from an API payload |
| `listing_detail_test.dart` | `ListingDetail.fromJson` parsing from a full API payload |
| `media_url_test.dart` | `MediaUrl.resolve` — dev-host rewriting and relative-path prefixing (2 tests) |
| `user_profile_test.dart` | Dealer-register response parsing with null personal names |
| `widget_test.dart` | Misleadingly named — it's a plain `test()`, not `testWidgets()`; only asserts the API base URL string contains a `/v1` path |

No test in this suite exercises `lib/features/seller/`, `engagement/`, `tools/`, or `shell/` —
coverage is limited to a handful of model-parsing/URL-utility unit tests. Treat any of those four
feature areas as **untested by CI**; manual verification is required for changes there.

### Shared utils gotcha — money formatting (**Jira: KAN-26**)

`lib/utils/format.dart`'s `formatMoney` / `formatEuro` (`:172-193`) do `toStringAsFixed(2)` then
regex-insert `.` as the thousands separator — so the decimal point and the group separator become
the **same** char for amounts ≥ 1000 with decimals: `formatMoney(1200.50,'EUR')` → `"1.200.50 EUR"`,
`formatEuro(15000.00)` → `"15.000.00 €"`. Ambiguous/wrong on real money surfaces: promotion
checkout (`promotion_checkout_screen.dart:175,200`) and the registration-tax panel
(`listing_insight_panels.dart:116,173`). `formatEuroRounded` (integers) and sub-1000 amounts are
fine. Fix with `intl` `NumberFormat` (decimal mark is a product decision — likely `,`).
