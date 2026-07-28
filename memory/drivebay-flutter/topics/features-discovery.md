# drivebay-flutter — Discovery features deep reference (listings, search, favorites, sellers, viewings)

Supplements `topics/architecture.md` and `topics/domain.md` (read those first for app-wide
shape/terms) — this note is a per-feature deep dive on the buyer-facing discovery surface only:
`lib/features/{listings,search,favorites,sellers,viewings}/`. Backend cross-references point at
`memory/drivebay/topics/domains-core.md` (Listing/Search/Recommendation) — not duplicated here.

## lib/features/listings/ — listing detail

One screen: `listing_detail_screen.dart` (`ListingDetailScreen`, keyed by `publicId`). Widgets in
`widgets/` are detail-only (not reused by search cards, which live in `features/search/`).

| Concern | Evidence |
|---|---|
| Data provider | `listingDetailProvider` (`FutureProvider.family`) watches `authNotifierProvider` only (not platform config — avoids reopen flash **KAN-39**). Screen watches `appPlatformConfigProvider` for feature flags. |
| Repository | `ListingRepository.getDetail` → `GET /listings/{publicId}` returns one JSON body parsed twice into `ListingDetail` and `ListingDetailMeta` (`lib/repositories/listing_repository.dart:22-39`) |
| Similar listings | `similarListingsProvider` family → `ListingRepository.getSimilar` → `GET /listings/{publicId}/similar?limit=6`, rendered as a 2-col grid at the bottom of the body (`lib/features/listings/listing_detail_screen.dart:526,696-737`). Backend-side this is `RecommendationService.similarListings()` (`ListingSimilarity` table, falls back to same-make/model query when empty — see `memory/drivebay/topics/domains-core.md` Recommendation section) |
| Contact | `ListingRepository.contactSeller` → `POST /listings/{publicId}/contact` (only offered when authenticated; otherwise the sheet only shows phone/email/WhatsApp/Viber deep links) — `listing_detail_screen.dart:157-209`, `widgets/contact_seller_sheet.dart` |
| View tracking | `ListingRepository.recordView` → `POST /listings/{publicId}/analytics/view`, wrapped in its own try/catch that **swallows all errors** (`lib/repositories/listing_repository.dart:59-64`) — fire-and-forget, never surfaces failure to the UI. Only sent once per screen instance, only if `status == 'active'`, not the owner, and authenticated (`listing_detail_screen.dart:61-73`) |
| Book viewing | Opens `widgets/book_viewing_sheet.dart` (see Viewings section below) — this widget lives under `listings/widgets/`, not under `features/viewings/` |
| Report | `showReportSheet` → `ReportRepository.reportListing` (moderation feature, cross-referenced not duplicated) |

**Favorite toggle is not optimistic.** `_toggleFavorite` (`listing_detail_screen.dart:91-127`)
`await`s `FavoriteRepository.addFavorite`/`removeFavorite` **before** flipping local
`_isFavorited` state or updating `favoritedListingIdsProvider`; the heart button shows a spinner
(`_favoriteBusy`) the whole time. A caller assuming optimistic-then-rollback UI would be wrong —
there is nothing to roll back, the button is simply pessimistic/blocking.

**Owner vs buyer branching**: `ListingDetailMeta.capabilities.isOwner` drives three different UI
states in one screen — owner sees `OwnerListingBanner` + `ListingStaffActivityPanel` instead of
the gallery-first buyer layout, no favorite/contact/book actions, and an edit icon that pushes
`/account/listings/{id}/edit` (`listing_detail_screen.dart:234-236,535-547`). A second orthogonal
branch (`meta.staff != null`) adds a 2-tab `DefaultTabController` with an admin-only "notes" tab
(`_StaffNotesTab`) for moderators (`listing_detail_screen.dart:298,326-353`).

**Feature-flag-gated sections**: `ListingRegistrationEstimatePanel`/`ListingPriceRatingPanel` only
render when `appPlatformConfigProvider`'s `showRegistrationEstimate`/`showPriceRatingDetail` are
true (`listing_detail_screen.dart:600-609`) — config comes from `GET` via
`PlatformConfigRepository`, loaded once per screen in `initState` (`listing_detail_screen.dart:56-58`).
No TODO/FIXME comments found anywhere under `lib/features/listings/`.

**Gotcha — reopen flash reload** (**Jira: KAN-39**, Done — `1a1d51b`). Was caused by
`listingDetailProvider` watching `appPlatformConfigProvider` while the screen’s `initState`
calls `load()` — config update re-ran the future and `when(loading:)` wiped the UI. Fix:
stop watching config on the detail provider (screen still watches flags); use
`skipLoadingOnReload` / `skipLoadingOnRefresh` on detail + similar `when`s.

## lib/features/search/ — search hub, filters, sort

`SearchHubScreen` is a 2-page `PageView` (browse + fuel prices from `features/tools/`), synced
with `searchHubPageProvider` (`StateProvider<SearchHubPage>`, `search_hub_controller.dart:1-6`).
`SearchScreen` is the actual listings browser (kept alive via `AutomaticKeepAliveClientMixin`,
`search_screen.dart:28-38`).

| State | Type | Notes |
|---|---|---|
| `searchNotifierProvider` | `NotifierProvider<SearchNotifier, SearchPageState>` | Owns `filters`, `listings`, `isLoading`/`isLoadingMore`, `hasMore`, `total` (`search_notifier.dart:48-118`) |
| `searchLayoutProvider` | `NotifierProvider` persisted via `AppPreferencesStorage` | list vs grid, restored async in `build()` (`search_layout_notifier.dart:25-49`) |
| `showFeaturedCarouselProvider` / `useMarketplaceBrowseLayoutProvider` | derived `Provider<bool>` | read `experimentsProvider` variant map (`lib/providers/providers.dart:210-216`) — see Feature flags below |
| `searchFilterOptionsProvider`, `vehicleTypesProvider`, `vehicleMakesProvider`, `vehicleModelsProvider` | `FutureProvider`/`.family`, all `ref.keepAlive()` | prefetched eagerly via `prefetchSearchFilters()` on hub open and on filter-sheet open so the sheet feels instant (`search_filter_providers.dart:12-68`, called from `search_hub_screen.dart:28-29` and `search_screen.dart:50-54,134`) |

**Repository / query mapping**: `SearchRepository.search()` → `GET /search` with
`SearchFilters.toQueryParameters()` (`lib/repositories/search_repository.dart:245-324`). Every
request includes a cache-busting `_ts` millis timestamp (`search_repository.dart:247`) — dio/HTTP
caching of `/search` responses is therefore effectively disabled by design, not an oversight.
~28 individual filter fields map 1:1 to snake_case query params (make/model/price/year/mileage/
displacement/power/doors/seats/vehicle type/body style/city/colors/fuel/transmission/drivetrain/
condition/price type/exchange direction/service history/accident-free/exchange-offered/feature
ids/published-since/price-reduced/promotion type) — same shape as the backend's ~25-column
`SavedSearch` model (`memory/drivebay/topics/domains-core.md` Search section), so a new filter
needs a matching column added server-side to be persisted as a saved search even if `/search`
itself accepts it ad hoc.

**Pagination**: page-based infinite scroll, not cursor-based. `perPage = 24` (`search_repository.dart:47`).
`_onScrollPosition` triggers `loadMore()` once the scroll position is within 200px of
`maxScrollExtent` (`search_screen.dart:126-131`); `loadMore()` no-ops while already loading/no more
pages (`search_notifier.dart:88-91`); `hasMore` is derived client-side as
`combined.length < result.meta.total` (`search_notifier.dart:100-106`), so an inconsistent/stale
`total` from the API would desync pagination — nothing guards against `total` decreasing between
pages.

**Sort options** (**Jira: KAN-32**, subsumes **KAN-25**): client sends one of
`freshness | recommendation | popularity | price_asc | price_desc | year_desc | year_asc`
(`search_sort_control.dart`; default `'freshness'`, `search_repository.dart`). Matches
backend `SearchFilterQueryRules` + `SearchService::resolveSortStack()` (`recommendation` →
`sort_recommendation_score`). Promoted listings (`sort_boost_score`) are always layered on
top of browse-style sorts server-side (`SearchService.php`) — the app has no UI acknowledging
boosted/promoted ordering beyond the `PromotionBadges` widget on cards.

**No favorite affordance in search results** (**Jira: KAN-22**): neither `ListingCardTile` nor `ListingCardGridTile`
receive `showFavoriteButton`/`isFavorited` when used from `search_screen.dart:296,307` (only
`marketplaceStyle` is passed) — favoriting is only reachable from the listing detail screen or the
Favorites tab itself, not from search/browse cards. Consistent with `ListingCard` (the search
result model) having no `isFavorited` field at all — only `ListingDetail` does
(`lib/models/listing_detail.dart:36`).

**Featured carousel** (`featured_listings_carousel.dart`) is a *different* data source than search
results: `featuredListingsProvider` → `PromotionRepository.getFeaturedListings()`
(`lib/providers/providers.dart`), shown only when `showFeaturedCarouselProvider` is true,
independent of the active search query/filters. Widget accepts optional `title`/`subtitle`/
`mutedBackground` so the same rail UI is reused for **For you** (**Jira: KAN-31**).

**For you rail** (**Jira: KAN-31**): `recommendationsProvider` →
`ListingRepository.getRecommendations()` → `GET /recommendations` (auth-aware via
`sanctum.optional` on backend). Watches `authNotifierProvider`; shown above featured when
non-empty; hidden on empty/error; invalidated on pull-to-refresh. Not gated by the featured
experiment flag.

No TODO/FIXME comments found under `lib/features/search/`.

## lib/features/favorites/

Single screen `FavoritesScreen`/`FavoritesRoute` (`favorites_screen.dart`). Guest users see a
sign-in gate (`_GuestGate`); empty list shows `_ComingSoon` copy.

**Two parallel favorite-state sources — not obviously connected** (**Jira: KAN-21**):
1. `favoritedListingIdsProvider` (`FavoritedListingIdsNotifier`, `Set<String>` of public IDs) —
   the cache the rest of the app (listing detail heart icon) reads/mutates. Loaded explicitly, not
   automatically: on login/session-restore/logout via `auth_notifier.dart:82,108,135,67,188`, and
   again in `favorites_screen.dart:46,104` on screen open/pull-to-refresh.
2. A **private, screen-local** `_favoritesProvider` (`FutureProvider.autoDispose`,
   `favorites_screen.dart:12-14`) that independently calls `FavoriteRepository.getFavorites()` to
   get the full `ListingCard` list to render. It is invalidated (not incrementally updated) after
   every remove (`favorites_screen.dart:60`).

   Net effect: removing a favorite on this screen updates the id-set notifier *and* separately
   invalidates+refetches the full list — two round trips' worth of state to keep in sync if this
   screen is extended.

Repository: `FavoriteRepository` → `GET /favorites`, `POST /favorites/{publicId}`,
`DELETE /favorites/{publicId}` (`lib/repositories/favorite_repository.dart`). Per
`memory/drivebay/topics/domains-core.md` Search section, adding a favorite server-side also calls
`RecommendationService::recordInteraction(..., 'favorite', ...)` — feeds the recommendation
interaction log, not visible client-side. Also per that note, `Listing.favorites_count` is a
column nothing increments — don't expect a favorites counter on `ListingCard`/`ListingDetail` to
be live.

No TODO/FIXME comments found under `lib/features/favorites/`.

## lib/features/sellers/ — public seller profile

**Not** `lib/features/seller/` (singular — that's the seller's own dashboard, a different feature
area). One file, `seller_profile_screen.dart`, with two named constructors selecting which body
renders:

| Constructor | Body | Repository call |
|---|---|---|
| `SellerProfileScreen.dealer(slug)` | `_DealerProfileBody` | `SellerProfileRepository.getDealer` → `GET /dealers/{slug}` (`seller_profile_repository.dart:95-107`) |
| `SellerProfileScreen.private(sellerId)` | `_PrivateSellerProfileBody` | `SellerProfileRepository.getPrivateSeller` → `GET /sellers/{sellerId}` (`seller_profile_repository.dart:109-131`) |

Both render the same `_ProfileListings` (seller card + 2-col grid of that seller's active
listings via `ListingCardGridTile`, `seller_profile_screen.dart:136-183`).

**Non-obvious redirect**: `GET /sellers/{sellerId}` can respond with `redirect: 'dealer'` +
embedded dealer payload when a "private seller" turns out to actually be a dealer account
(`seller_profile_repository.dart:116-119`, throws `DealerRedirectException`). The screen catches
this **inside the `AsyncValue.error` branch**, not as routing — it sets a local `_redirectSlug`
via `setState` in a post-frame callback and then rebuilds itself as the `.dealer()` variant in
place (`seller_profile_screen.dart:103-112`); the URL/route itself never changes. A caller adding
deep-linking or analytics keyed off the route would miss this transition.

No TODO/FIXME comments found under `lib/features/sellers/`.

## lib/features/viewings/ — viewing appointments (buyer + seller sides both live here)

The **booking UI itself is not in this folder** — it's
`lib/features/listings/widgets/book_viewing_sheet.dart`, opened from the listing detail screen's
buyer action bar. `lib/features/viewings/` holds the *inbox/management* screens:

| Screen | Audience | Provider | Endpoint |
|---|---|---|---|
| `MyViewingsScreen` | buyer (tab 1) + seller (tab 2, same user) | `buyerViewingsProvider` / `sellerViewingsProvider` (`FutureProvider.autoDispose`, `providers.dart:239-245`) | `GET /viewings`, `GET /seller/viewings` |
| `SellerViewingsScreen` | seller-only entry point (same data as tab 2 above) | `sellerViewingsProvider` | `GET /seller/viewings` |
| `SellerViewingSettingsScreen` | seller availability config | none (local `_loadSettings`) | `GET`/`PUT /seller/viewing` |

`MyViewingsScreen` always renders both tabs regardless of whether the signed-in user has ever
listed anything — there is no capability check gating the "As seller" tab
(`my_viewings_screen.dart:67-72`).

**Booking flow** (`BookViewingSheet`, `lib/features/listings/widgets/book_viewing_sheet.dart`) is a
3-step local state machine (`_BookViewingStep.pick → confirm → success`, not a provider):
1. `ViewingRepository.getDates(publicId)` → `GET /listings/{id}/viewing/dates`, filtered to dates
   with slots, deduped to one **representative date per weekday** for the chip row
   (`_dedupeWeekdayOptions`, `book_viewing_sheet.dart:25-48`) — picking a weekday chip does not
   mean "any day"; it re-fetches slots for that one representative date only.
2. `ViewingRepository.getSlots(publicId, date)` → `GET /listings/{id}/viewing/slots?date=`.
3. `ViewingRepository.book(...)` → `POST /listings/{id}/viewing/appointments`, returns the created
   `ViewingAppointment`, then shows a success screen inside the same sheet (no navigation).

**Local KAN-35 delta (working tree only, not in app HEAD `5187eea`)**: the same
`BookViewingSheet` now also supports **reschedule mode** when opened with an `appointmentUuid`.
`MyViewingsScreen` uses that path from buyer appointment cards, pre-fills the existing buyer note,
submits through `ViewingRepository.reschedule(...)`, invalidates `buyerViewingsProvider`, and shows
`viewingRescheduled` in a snackbar on success. Future agents should treat this as implemented in the
local working tree even though `sourceCommit` cannot encode it yet.

Cancellation: `ViewingRepository.cancel` → `POST /viewing/appointments/{uuid}/cancel`, only offered
when `appointment.canCancel` is true (server-computed flag, `my_viewings_screen.dart:305`,
`_AppointmentCard`).

**Local KAN-35 delta (working tree only, not in app HEAD `5187eea`)**: buyer cards also expose a
`Reschedule` action when `appointment.canReschedule` is true and `appointment.listing` is present.
The buyer flow still uses `GET /listings/{publicId}/viewing/dates` and `.../slots` from the listing
being viewed; there is no separate reschedule-specific availability endpoint in the Flutter client.

No TODO/FIXME comments found under `lib/features/viewings/`.

## Feature flags touching these screens (`lib/core/experiments/`)

Only two experiment keys exist in the whole app, and both only affect `features/search/`
(`experiment_keys.dart:1-8`):

| Key | Variants | Default when missing | Effect |
|---|---|---|---|
| `search_featured_display` | `featured_carousel` / `ranking_only` | `ranking_only` (i.e. carousel **off** by default) | `showFeaturedCarouselProvider` — gates `FeaturedListingsCarousel` |
| `search_browse_layout` | `marketplace` / `classic` | `marketplace` | `useMarketplaceBrowseLayoutProvider` — swaps `_SearchHeader`+list/grid tiles for the `Marketplace*` header/tile variants and changes grid spacing/aspect ratio (`search_screen.dart:175-177`) |

Both variants come from one map: `ExperimentsNotifier.load()` → `ExperimentRepository.getActiveVariants()`
→ `GET /experiments` (`lib/providers/providers.dart:190-208`, `lib/repositories/experiment_repository.dart:8-25`).
Per `topics/domain.md`, it's unconfirmed whether this endpoint reads Laravel's Pennant or
`Experiment` system server-side — re-verify before trusting either default if it starts to matter.
`experimentsProvider.load()` is only ever triggered from `SearchScreen`'s pull-to-refresh
(`search_screen.dart:188`), not on app start — a cold app launch keeps the built-in defaults above
until the user refreshes search at least once.
