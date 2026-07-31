# drivebay — Frontend (Inertia/Vue) & Admin (Filament) deep reference

Supplements `apps/drivebay/CLAUDE.md` (which already covers the high-level Inertia v3/Vue
and Tailwind v4 conventions and lists "32 admin resources") — this note goes deeper into
what actually exists per-folder, with `path:line` evidence. Verified 2026-07-15 at commit
`8f7840f`.

## Frontend

### Pages/ inventory (folder → files → controller that renders it)

All confirmed via `grep Inertia::render app/Http/Controllers/Web` — one page per render
call except where noted.

| Pages/ folder | Files | Rendered by |
|---|---|---|
| `Account/` | `Index.vue` | `AccountController.php:36` |
| `Advertise/` | `Index.vue` | `AdvertiseController.php:19` |
| `Auth/` | `Login.vue`, `Register.vue`, `VerifyEmail.vue`, `ForgotPassword.vue`, `ResetPassword.vue` | `Auth/LoginController.php`, `Auth/RegisterController.php`, `Auth/EmailVerificationController.php`, `Auth/PasswordResetController.php` (**Jira: KAN-56**) |
| `Billing/` | `FakeCheckout.vue` | `Billing/CheckoutController.php:62` (name implies a stubbed/test checkout, not a live gateway page) |
| `Compare/` | `Index.vue` | `CompareController.php:32` |
| `Dealers/` | `Show.vue` | `DealerStorefrontController.php:51` **and** `Storefront/StorefrontHomeController.php:37` — same Vue page serves both the marketplace's dealer-profile route and a storefront's home route |
| `Favorites/` | `Index.vue` | `FavoriteController.php:26` |
| `FuelPrices/` | `Index.vue` | `FuelPriceController.php:22` |
| `Home/` | `Index.vue` | `HomeController.php:90` |
| `Legal/` | `Show.vue` | `LegalController.php` — `/privacy`, `/terms`, `/cookies`, `/account-deletion` (Play + web); copy in `lang/{en,sr}/legal.php` |

### SEO / share previews (**Jira: KAN-62**)

- **KAN-63 Done (`a5e3ece`):** `app.blade.php` falls back to
  `$page['props']['seo']` so crawlers see title/OG/Twitter/hreflang/JSON-LD in
  initial HTML for every page that passes a `seo` Inertia prop. Brand `<title>`
  when seo missing. Tests: `tests/Feature/SeoBladeMetaTest.php`.
- **KAN-64 Done (local pending commit):** `public/branding/{id}/og-default.jpg`
  + `SeoData::forPage()` `og.image`; regenerate `seo:generate-default-og`.
- Still open: KAN-65 (sitemap/noindex), KAN-66 (search/dealer canonicals),
  KAN-67 (QA harness), KAN-68 (JSON-LD).

| `Listings/` | `Show.vue` | `ListingController.php:113` |
| `Messages/` | `Compose.vue`, `Index.vue`, `Show.vue` | `InternalMessageController.php:33`, `MessageController.php:159`/`173` |
| `Notifications/` | `Index.vue` | `NotificationController.php:28` |
| `Search/` | `Index.vue` | `SearchController.php:34` |
| `Seller/` (nested) | `Analytics/Index.vue`, `Analytics/Show.vue`, `Dealer/Domain.vue`, `Dealer/Storefront.vue`, `Import/Autodiler.vue`, `Listings/{Create,Edit,Index}.vue`, `Viewing/Settings.vue`, `Viewings/Index.vue` | `Seller/SellerAnalyticsController.php:23,41`, `Seller/DealerDomainSettingsController.php:41`, `Seller/DealerStorefrontSettingsController.php:50`, `Seller/AutodilerImportController.php:181`, `Seller/SellerListingController.php:57,71,179`, `Seller/SellerViewingSettingsController.php:23`, `Seller/SellerViewingAppointmentController.php:21` |

**Dealer QR card (**Jira: KAN-91**):** `Components/Dealer/DealerQrCard.vue` (`qrcode`
npm) encodes `{marketplaceUrl|appUrl}/dealers/{slug}?src=qr`. Mounted on
`Account/Index` (dealer sidebar), `Seller/Dealer/Storefront`, and
`Seller/Dealer/Domain`. Actions: copy / download PNG / print. Strings:
`dealer.storefront.qr_*`.
| `Sellers/` | `Show.vue` | `SellerListingsController.php:57` (public seller profile page — distinct from `Seller/` dashboard pages) |
| `Storefront/` | `About.vue`, `Contact.vue`, `ListingShow.vue` | `Storefront/StorefrontPageController.php:36`/`62`, `Storefront/StorefrontListingController.php:88` |
| `Tools/` | `FuelConsumption.vue`, `Registration.vue` | `FuelConsumptionCalculatorController.php:47`, `RegistrationCalculatorController.php:47` |
| `Viewings/` | `Index.vue` | `BuyerViewingAppointmentController.php:24` |
| `Error.vue` (root) | — | generic error page (rendered via Inertia's error handling, not a per-domain controller) |

Note: `Sellers/Show.vue` (public seller listing page) and `Seller/*` (the seller's own
dashboard) are separate folders — easy to confuse by name; don't conflate them.

### Components/ subfolders

Grouped, non-exhaustive (many top-level `Components/*.vue` exist outside subfolders —
listing cards, form inputs, modals, taxonomy pickers; see
`resources/js/Components/` directly for the full flat list, ~90 files):

| Subfolder | Contents |
|---|---|
| `Ads/` | `AdSlot.vue` — reads `page.props.ads[placement]` per `CLAUDE.md` "Advertising" section |
| `Analytics/` | `AnalyticsSourceList.vue`, `AnalyticsStatCard.vue`, `AnalyticsTrendChart.vue` — seller analytics dashboard |
| `Dealer/` | `DealerSellerTabs.vue` |
| `Engagement/` | `EngagementHost.vue` — mounted globally in `Layouts/AppLayout.vue:8` for popup campaigns |
| `Errors/` | `AnimatedErrorCar.vue` — used by `Pages/Error.vue`/`Layouts/ErrorLayout.vue` |
| `FuelPrices/` | `FuelPriceHistoryChart.vue` |
| `Home/` | `BrowseFiltersBarContent.vue`, `FeaturedListingsCarousel.vue`, `HomeBrowseFeed.vue`, `HomeBrowseFilters.vue` |
| `Messaging/` | `ChatListingBanner.vue`, `ChatMediaPicker.vue`, `ChatMessageAttachments.vue`, `ChatMessageBubble.vue`, `ChatMessageStatus.vue`, `ChatThreadPanel.vue`, `FloatingMessenger.vue` — mounted in `AppLayout.vue:11` for the persistent chat widget |
| `Search/` | `SearchFeaturePicker.vue`, `SearchRangeRow.vue`, `VehicleModelFilter.vue` |
| `Seller/` | `SellerHubTabs.vue` |
| `Viewing/` | `ScheduleViewingModal.vue`, `ViewingAppointmentCard.vue` |
| `storefront/` (lowercase) | `LayoutOptionSketch.vue`, `StorefrontNav.vue` — dealer storefront theming |

### Layouts/

- `AppLayout.vue` — main marketplace shell; mounts `SeoHead`, `FlashToast`,
  `EngagementHost`, `SellingRestrictionBanner`, `FloatingMessenger`, `NotificationBell`,
  `NavToolsMenu`, `AccountMenu`, `ThemeToggle`, `LanguageSwitcher`
  (`resources/js/Layouts/AppLayout.vue:1-33`). Toggles a `staff-mode` class off
  `page.props.auth.staff` (`AppLayout.vue:33`).
- `GuestLayout.vue` — auth pages (login/register), accepts `:seo` prop
  (confirmed pattern in `Pages/Auth/Login.vue:20`).
- `DealerStorefrontLayout.vue` — dealer custom-domain storefront shell.
- `ErrorLayout.vue` — wraps `Pages/Error.vue`.

All layouts take a `seo` prop rendered via `SeoHead` — consistent per-page SEO pattern
(`Layouts/AppLayout.vue:19`, `Layouts/GuestLayout.vue` usage in `Pages/Auth/Login.vue:20`).

### SEO / social-card notes

- `resources/js/Components/SeoHead.vue` is the single emission point for page-level SEO tags.
  Listing-share work (KAN-51) expanded it beyond the prior minimal set so it now also emits
  `og:image:alt`, `twitter:title`, and `twitter:description`, and corrected the hardcoded OG image
  dimensions from `1600x1200` to the new generated social-card size `1200x630`.
- Listing pages still pass SEO through the same `seo` prop contract, but `app/Support/Seo/SeoData.php`
  now points listing `og:image` / `twitter:image` at a generated card URL
  (`/og/listings/{publicId}.jpg?v={fingerprint}`) instead of the raw uploaded cover photo.
  That URL is intentionally host-relative via `url(...)`, so dealer storefront hosts emit their
  own absolute OG image URL without a separate SEO code path.
- Important deployment nuance from dev validation: `@inertiaHead` alone was not enough for crawlers
  when Inertia SSR was unavailable on the server. Listing controllers now also pass `seo` into the
  Blade root view via `withViewData(...)`, and `resources/views/app.blade.php` mirrors the key
  OG/Twitter/canonical/JSON-LD tags directly into the initial HTML response. This is the fallback
  that makes social bots work even if the SSR worker is down.

### composables/ (resources/js/composables/*.js) — reusable logic, one line each

| Composable | Purpose |
|---|---|
| `useAppToast.js:7` | Global flash/error toast trigger (`showError`), wired into `app.js` router error events |
| `useBodyScrollLock.js:14` | Locks body scroll (used by modals/drawers) |
| `useBrandIcon.js:9` | Resolves a vehicle-make's brand icon URL |
| `useCompare.js:32` | Vehicle comparison list state (add/remove/persist) backing `Pages/Compare/Index.vue` |
| `useDealerInventoryFilters.js:65` | Client-side filtering of a dealer's listing inventory |
| `useDealerStorefrontPreview.js:21` | Builds a live-preview payload for the storefront theme editor from form state |
| `useEngagementContent.js` | Formats/sanitizes engagement-campaign popup body/image/href content |
| `useFormat.js` | Price/mileage/power/displacement number formatting (`formatPrice`, `formatMileage`, `formatPower`, `formatDisplacement`) |
| `useListingAnalytics.js:107` | Impression/click tracking for listing cards (`queueListingImpression`, `recordListingClick`, `useListingEngagement`) — used in `Pages/Listings/Show.vue:4` |
| `useListingPrice.js:7` | Derives display price/price-type badge logic for a listing |
| `useListingSpecs.js` | Builds spec-row and highlight lists for a vehicle (`vehicleSpecRows`, `vehicleHighlights`) |
| `useListingWizard.js` | Multi-step create/edit listing wizard; `LISTING_WIZARD_FIELDS_BY_STEP` + `focusFirstValidationError` (step jump → `nextTick` → `[data-field]` / `aria-invalid` scroll+focus). Shared by `Create.vue` / `Edit.vue`. (**Jira: KAN-57**) |
| `useLocalizedUrl.js:3` | Prefixes URLs with the active locale (`localized()`) — used in nearly every page for `<Link>`/form-post targets |
| `useMessengerApi.js:22` | Thread/message fetch+send API glue for the floating messenger |
| `useNotificationTypeImage.js:42` | Maps a notification type to a themed image asset |
| `usePhoneCountries.js:63` | Phone number country list + E.164 parsing/formatting for `PhoneInput.vue` |

**Listing contact multi-row (**Jira: KAN-90**)**: `ListingContactButtons.vue` +
`ListingSellerCard.vue` render `contact_channels.phones[]` / `emails[]` (fallback to
legacy singular). API built by `ListingContactPresenter` / `ContactChannelBuilder`.
| `useTaxonomySvg.js:5` | Resolves taxonomy (body style/color/etc.) SVG icon paths by category/code/version |
| `useTheme.js:15` | Light/dark theme toggle + `initThemeBeforePaint()` (called pre-mount to avoid flash) |
| `useTranslations.js:3` | `t()` translation helper reading from Inertia shared props |
| `useVehicleSearchForm.js:20` | Search-form state/query building shared by `Pages/Search/Index.vue` and home browse filters |
| `useVehicleTypeModelSelection.js:3` | Determines whether a vehicle type uses the make/model catalog vs free text |
| `useWarningSeverity.js:28` | Maps user-warning severity to display styling |

Most reusable/important for future frontend work: `useLocalizedUrl` (used everywhere),
`useTranslations`, `useFormat`, `useListingWizard` (the create/edit listing flow is the
most complex page in the app), `useListingAnalytics`.

### Seller listing wizard (**Jira: KAN-57**)

- Wizard nav stays the in-card Previous/Continue footer (sticky/floating bar tried and
  removed — felt like a second footer / poor UX).
- Field errors wired on create/edit specs+details; pickers accept `error` + `field`
  (`TaxonomyIconPicker`, `ColorSwatchPicker`). `Input` forwards `min`/`max`/`step` (+ attrs).
- Body styles filtered client-side by `vehicle_type_id` (null = universal). Create clears
  incompatible body on `vehicle_type_code` change; Edit filters by
  `listing.vehicle.vehicle_type_id` (edit payload includes type id/code). Motorcycle
  Mobile.de categories must be typed (backfill migration
  `2026_07_30_084500_backfill_motorcycle_body_style_vehicle_types`) or they leak into car.
- `TaxonomyIcon`: truthy `svgUrl` used; explicit `null` = server-missing → placeholder
  (no path invent); omitted/`undefined` still invents for legacy; load `@error` → placeholder.

### Conventions confirmed against real code

- `<script setup>` — used in every sampled page (`Pages/Auth/Login.vue:1`,
  `Pages/Listings/Show.vue:1`, `Pages/Seller/Listings/Create.vue:1`). No Options-API pages found.
- `<Link>` — used for navigation (`Pages/Auth/Login.vue:31`); `router.visit()` is used
  sparingly, only 3 files repo-wide (grep `router.visit(` across `Pages/`+`Components/`).
  No raw `<a href="...">` internal-navigation violations found in a grep sweep (only
  `mailto:`/`tel:`/external `http` hrefs would be expected, and none of those turned up
  as internal-nav anti-patterns either).
- **`useForm()` is the actual pattern in use, not the `<Form>` component** —
  `Pages/Auth/Login.vue:12` (`useForm({...})`, `form.post(...)`),
  `Pages/Listings/Show.vue:2` imports `useForm` from `@inertiajs/vue3`. A grep for the
  Inertia `<Form>` component import found zero matches — `CLAUDE.md`'s "prefer the Form
  component or useForm()" phrasing is accurate but in practice **only `useForm()` is
  used**, never the `<Form>` component; worth knowing so new code follows the existing
  pattern rather than introducing the untested one.
- Layout `seo` prop pattern confirmed: every sampled page passes `:seo="seo"` into its
  layout, and `defineProps({ seo: Object })` is declared per-page
  (`Pages/Auth/Login.vue:8`, `Pages/Listings/Show.vue` props block).

### Tailwind v4 CSS-first config

Confirmed exactly as `CLAUDE.md` claims: no `tailwind.config.js` in the repo; config
lives entirely in `resources/css/app.css`:
- `@import 'tailwindcss';` (`resources/css/app.css:1`) + `@source` directives pointing at
  Blade/JS/vendor pagination views for class scanning (`app.css:5-8`).
- Design-system custom properties (`--db-*`) defined on `:root` and dark-mode overrides
  via `@custom-variant dark (&:where(.dark, .dark *))` (`app.css:3,21-60`).
- `@theme { ... }` block (`app.css:88-107`) maps Tailwind theme tokens
  (`--color-page`, `--color-accent`, `--color-brand-500/600/700`, `--font-sans`, etc.)
  to the `--db-*` custom properties — this is the CSS-first Tailwind v4 config the docs
  describe, not a separate JS config file.
- A second theme entry exists for the admin panel: `resources/css/filament/admin/theme.css`
  (its own Vite input, see below).

### vite.config.js

`vite.config.js:1-27` plugins: `laravel-vite-plugin` (inputs: `resources/css/app.css`,
`resources/css/filament/admin/theme.css`, `resources/js/app.js`; `refresh: true`),
`@vitejs/plugin-vue` (with `transformAssetUrls` tuned for `base: null`/
`includeAbsolute: false`), `@tailwindcss/vite`. Non-default settings:
- **SSR entry configured**: `ssr: 'resources/js/ssr.js'` (`vite.config.js:12`), and
  `resources/js/ssr.js` exists and wires `@inertiajs/vue3/server` +
  `renderToString` — SSR is set up, not just client-rendered, though whether SSR is
  actually run in production wasn't verified here (no `docker`/deploy script grep done —
  check `docs/development/deployment.md` before assuming it's live).
  `resources/js/app.js` is the client entry (`createInertiaApp` + `createApp`), separate
  from `ssr.js`.
- `server.watch.ignored` excludes `storage/framework/views/**` from Vite's file watcher
  (`vite.config.js:23-26`), avoiding restart storms from compiled Blade view cache writes.

## Admin (Filament)

### Resources (32 confirmed — matches `CLAUDE.md`'s count exactly)

Model, purpose (from name/navigation label), and notable relation managers or custom
pages beyond the default List/Create/Edit trio. Navigation groups are Filament enum
`NavigationGroup::{System,Marketing,Moderation,Billing,Dealers,VehicleTaxonomy,...}`
(`app/Filament/Admin/Support/` likely defines the enum — not opened in detail).

| Resource | Model | Nav group | Notable extras |
|---|---|---|---|
| AdminActions | `AdminAction` | System | List-only (no create/edit — an audit-style read view of admin actions taken) |
| Advertisements | `Advertisement` | Marketing | Full CRUD |
| AuditLogs | `AuditLog` | System | List-only (OwenIt Laravel Auditing viewer) |
| BodyStyles | `BodyStyle` | (taxonomy) | Full CRUD |
| Cities | `City` | (taxonomy) | `RelationManagers/DistrictsRelationManager.php` |
| CityDistricts | `CityDistrict` | (taxonomy) | Full CRUD |
| Countries | `Country` | (taxonomy) | `RelationManagers/CitiesRelationManager.php` |
| DealerAccounts | `DealerAccount` | Dealers | `RelationManagers/DealerMemberRelationManager.php` |
| Drivetrains | `Drivetrain` | (taxonomy) | Full CRUD |
| EngagementCampaigns | `EngagementCampaign` | Marketing (label "Engagement") | `RelationManagers/EventsRelationManager.php` — popup campaign definitions + their interaction events |
| Experiments | `Experiment` | Marketing (label "A/B tests") | `RelationManagers/{Assignments,Variants}RelationManager.php` — Pennant-backed A/B test admin |
| ExteriorColors | `ExteriorColor` | (taxonomy) | Full CRUD |
| FuelTypes | `FuelType` | (taxonomy) | Full CRUD |
| InteriorColors | `InteriorColor` | (taxonomy) | Full CRUD |
| ListingPromotions | `ListingPromotion` | Billing | List-only |
| ListingSocialPosts | `ListingSocialPost` | Marketing (label "Instagram posts") | List-only; pairs with `Actions/PublishListingToInstagramAction.php` |
| Listings | `Listing` | — | Full CRUD + `ViewListing.php` page; `RelationManagers/{ListingMedia,ListingPromotions,ListingSocialPosts}RelationManager.php` — the largest/most central resource |
| PendingAutodilerPhotos | `ListingMedia` | Moderation (label "Photo reviews") | List-only; admin queue for reviewing Autodiler-imported photos before publish |
| PlatformSocialAccounts | `PlatformSocialAccount` | Marketing (label "Instagram account") | Full CRUD — connected Instagram account(s) for `SocialPublishing` domain |
| PromotionTypes | `PromotionType` | Billing | Edit+List only (no Create — likely a fixed/seeded set) |
| Regions | `Region` | (taxonomy) | Full CRUD |
| Reports | `Report` | Moderation | Full CRUD — user-submitted listing/user reports |
| TaxonomyImportRuns | `TaxonomyImportRun` | System (label "Import history") | List-only; audit trail for `ImportVehicleTaxonomy`/`ImportMobileDeTaxonomy` admin pages |
| Transmissions | `Transmission` | (taxonomy) | Full CRUD |
| UserWarnings | `UserWarning` | Moderation | Create+List+`ViewUserWarning.php` (no Edit — warnings are issued/lifted, not edited); pairs with `Support/{Issue,Lift}UserWarningAction.php` |
| Users | `User` | — | Full CRUD; `RelationManagers/{UserSellingRestrictions,UserWarnings}RelationManager.php` |
| VehicleFeatures | `VehicleFeature` | (taxonomy) | Full CRUD |
| VehicleMakes | `VehicleMake` | VehicleTaxonomy | `RelationManagers/ModelsRelationManager.php`; pairs with `Support/ToggleVehicleMakeFeaturedAction.php` |
| VehicleModelGroups | `VehicleModelGroup` | VehicleTaxonomy (label "Model groups") | List-only |
| VehicleModels | `VehicleModel` | VehicleTaxonomy | Full CRUD |
| VehicleTypes | `VehicleType` | VehicleTaxonomy | `RelationManagers/MakesRelationManager.php` |
| Vehicles | `Vehicle` | — | Full CRUD |

Evidence: model bindings from `grep -n "protected static ?string \$model" app/Filament/Admin/Resources/*/*.php`;
nav groups/labels from each resource's `navigationGroup`/`navigationLabel` properties;
relation managers and pages from directory listing of
`app/Filament/Admin/Resources/*/{RelationManagers,Pages}/`.

### Custom Livewire components

- `app/Filament/Admin/Livewire/DatabaseNotifications.php` — confirmed exists. Matches
  `CLAUDE.md`'s "Notifications" section claim of a custom `DatabaseNotifications`
  Livewire component (`apps/drivebay/CLAUDE.md:211`).
- `PushNotificationTester` is **not** Livewire — it's a Filament **Page**:
  `app/Filament/Admin/Pages/PushNotificationTester.php`. `CLAUDE.md` calls it an "admin
  page for manual testing" (correctly, not "Livewire component") — no discrepancy, just
  worth being precise about since it sits next to the Livewire component in the same doc
  sentence.

### Admin Pages (non-resource, top-level)

`app/Filament/Admin/Pages/`: `Dashboard.php` (default panel dashboard — hosts the
widgets below), `ImportVehicleTaxonomy.php` + `ImportMobileDeTaxonomy.php` (taxonomy
import triggers, feeding `TaxonomyImportRuns`), `SyncFuelPrices.php` (manual
`FuelPricing` sync trigger), `WatermarkSettings.php`, `GeographySettings.php`,
`PlatformSettings.php`, `DeveloperTools.php`, `PushNotificationTester.php`,
`ArtisanCommands.php` (**KAN-43** — allowlisted `Artisan::call` runner, `super_admin`
only; catalog in `app/Support/Admin/ArtisanCommandAllowlist.php`).

### Widgets (dashboard)

- `MarketplaceStatsWidget.php:14` — extends Filament's `StatsOverviewWidget` (the
  standard stat-card row).
- `AdminAttentionWidget.php:13` / `ImportModerationWidget.php:10` — both extend the
  plain `Widget` base and pull data from app services directly
  (`app(AdminAttentionService::class)` at `AdminAttentionWidget.php:26`;
  `app(ListingMediaModerationService::class)->countPendingAutodilerPhotos(...)` and
  `app(AutodilerImportService::class)->recentImports(8)` at `ImportModerationWidget.php:20,28`)
  — dashboard call-outs for items needing admin attention and recent Autodiler import
  activity, respectively.

### Other Admin/Filament support code

- `app/Filament/Admin/Actions/`: `InstagramPostRecordActions.php`,
  `PublishListingToInstagramAction.php` — table/record actions for the
  `SocialPublishing` domain, used from `ListingSocialPosts`/`Listings` resources.
- `app/Filament/Admin/Support/`: reusable action classes
  (`{Issue,Lift}UserWarningAction.php`, `{Issue,Lift}SellingRestrictionAction.php`,
  `ToggleVehicleMakeFeaturedAction.php`, `VehicleTaxonomyDeleteActions.php`,
  `AdminUserAccountActions.php`), plus `StatusBadge.php`, `AdminNavigationBadge.php`,
  `TaxonomyAdmin.php`, `RecordActions.php`, `UserWarningListingOptions.php`.
  **KAN-58 RBAC**: `HasStaffPermissions` (resource trait — view vs manage permission)
  and `RequiresStaffPermission` (page trait). Every Resource declares
  `$staffViewPermission` / `$staffManagePermission`; `ArtisanCommands` /
  `DeveloperTools` are `super_admin`-only; settings/import pages use
  `system.settings` or `taxonomy.import`.
- `app/Filament/Admin/Concerns/SavesTaxonomySvgUpload.php` — shared trait for
  taxonomy resources that accept an SVG icon upload (body styles, colors, etc.).
