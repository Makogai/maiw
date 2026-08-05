# drivebay — SEO subsystem (KAN-62 epic done; KAN-69 dynamic OG images added)

Central place: `app/Support/Seo/SeoData.php`. Controllers build an `array`
via `SeoData::forPage(...)` and pass it as the Inertia `seo` prop; `resources/views/app.blade.php`
reads that prop server-side (no JS needed) to render `<title>`, meta description, OG tags, and
`<meta name="robots">`.

## `SeoData::forPage()` / `forPrivatePage()`

- `forPage(string $title, string $description, ?string $canonical = null, ?string $robots = null, ?string $ogImageUrl = null, ?string $ogImageAlt = null)`
  — `$robots` defaults to `index,follow`. `og.image` defaults to the brand default
  (`BrandDefaultOgImage`, KAN-64) unless `$ogImageUrl` is passed (absolute URL, e.g. a
  dynamic OG card — **KAN-69**); `og.image_alt` defaults to `brand('name')` unless
  `$ogImageAlt` is passed.
- `forPrivatePage(string $title, string $description, ?string $canonical = null)` — thin wrapper
  that calls `forPage(..., robots: 'noindex,nofollow')`. Added for KAN-65.
- Controllers pick one of the two by intent: public marketing/browsing pages use `forPage`,
  anything behind auth or account-scoped uses `forPrivatePage`.

## `noindex,nofollow` (private pages) — controllers switched to `forPrivatePage()`

Auth: `Auth/LoginController`, `Auth/RegisterController`, `Auth/PasswordResetController` (both
`create`/`edit`), `Auth/EmailVerificationController`.
Account/buyer: `AccountController`, `MessageController`, `InternalMessageController`,
`NotificationController`, `BuyerViewingAppointmentController`, `FavoriteController::index`.
Seller: `Seller/SellerListingController` (index/create/edit), `Seller/SellerAnalyticsController`
(index/show), `Seller/SellerViewingAppointmentController`, `Seller/SellerViewingSettingsController`,
`Seller/DealerDomainSettingsController`, `Seller/DealerStorefrontSettingsController`,
`Seller/AutodilerImportController`.
Billing: `Billing/CheckoutController`.

## `noindex,follow` (parameterized public pages, conditional)

- `SearchController` — `robots: 'noindex,follow'` only when `$request->query() !== []` (i.e. any
  filter/query param present). The bare `/search` landing page stays `index,follow`.
- `CompareController` — `robots: 'noindex,follow'` only when `$publicIds->isNotEmpty()` (i.e.
  `?ids=...` present). The bare `/compare` landing page stays `index,follow`.
- Rationale: infinite filter/ID combinations shouldn't be indexed individually, but the canonical
  landing pages should stay crawlable.

## Dynamic sitemap (`app/Support/Seo/SitemapGenerator.php` + `Http/Controllers/Web/SitemapController.php`)

- Route: `GET /sitemap.xml` → `SitemapController` (see `routes/web.php`), returns
  `application/xml; charset=UTF-8`. Deliberately **outside** any locale prefix group — one sitemap
  per brand/domain deployment (brand is resolved via `config/brand.php`/`APP_URL`, not a route param).
- `public/robots.txt` now has `Sitemap: https://drivebay.me/sitemap.xml` appended (static file —
  hardcodes the drivebay domain; **if `autoklik` brand ever ships as a separate deployment with its
  own domain, its `public/robots.txt` needs its own sitemap line** — this wasn't parameterized
  because `robots.txt` is a static asset, not a route).
- `SitemapGenerator::entries()` composes, in order: `staticPages()` (home, search, key tool
  pages, advertise, **instagram gallery** — KAN-115), `legalPages()`, `dealerPages()`, `listingPages()`.
- URLs built via `LocaleUrl::route(...)` (absolute, `en` default) with
  `LocaleUrl::hreflangAlternates(...)` for `sr` alternates where the route pattern supports it.
- `dealerPages()`: dealers with `status = 'active'` only. **Gotcha avoided:** does NOT call
  `DealerStorefrontService::resolvedSettings()` (that method can `firstOrCreate` a settings row —
  side effect + N+1 in a loop). Instead eager-loads `storefrontDomainSettings` and reads
  `$dealer->storefrontDomainSettings?->standalone_enabled` / `->entitlement_active` directly to
  decide whether the dealer has a public storefront page worth listing.
- `listingPages()`: `Listing::where('status', 'active')`, ordered by `published_at` desc, capped at
  `SitemapGenerator::MAX_LISTINGS` (check the constant in-file if sitemap size becomes a concern —
  Google's practical limit is 50k URLs/file, this app is nowhere near that yet so no sitemap index
  was built).

Visual card design reference for OG layouts: `docs/og-preview-mock.html` (not served to
users; design/QA aid for KAN-67).

## Tests

- `tests/Feature/Web/SitemapTest.php` — 200 + XML content-type, static/legal pages present with
  alternates, active listings included / drafts excluded, active-with-public-page dealers included /
  inactive or standalone-without-entitlement dealers excluded.
- `tests/Feature/Web/PrivatePageSeoTest.php` — login/register/account/seller-listings/messages assert
  `noindex,nofollow`; home + bare `/search` + bare `/compare` assert NOT noindex; `/search?q=...` and
  `/compare?ids=...` assert `noindex,follow`.
  - **Gotcha:** don't use `make_id`/`model_id` (or other FK-referencing) query params in these tests
    unless you've seeded that specific `VehicleMake`/`VehicleModel` row — `SearchController` logs the
    query to `search_logs`, which has a real FK constraint, so an arbitrary `make_id=1` throws
    `PDOException` (FK violation) rather than a search-related failure. Use a free-text `q=...` param
    instead to trigger the "has filters" branch without touching FK columns.
- `tests/Feature/SeoBladeMetaTest.php` (KAN-63/64, pre-existing) still green after these changes.
- `tests/Feature/Web/SharePreviewMetaHarnessTest.php` + `Tests\Support\AssertsSeoHtml` (**KAN-67**) —
  home / search / privacy / dealer / listing each assert title + description + og:title/description/
  image + twitter:card + canonical in the **initial HTML**.

## Verification (2026-07-29)

`php artisan test --compact tests/Feature/Web/SitemapTest.php tests/Feature/Web/PrivatePageSeoTest.php
tests/Feature/SeoBladeMetaTest.php` — all pass. Full suite run separately; 43 pre-existing failures
unrelated to this work (see `NOW.md`). `vendor/bin/pint --test` clean on all files touched for KAN-65
(two new test files needed a Pint line-ending autofix, already applied).

## Canonical URLs (KAN-66) — dynamic search titles + storefront-aware canonicals

- **`SearchController`** builds title/description from active filters instead of a fixed
  English string. New `protected function buildSeo()` / `filterSubject()`: resolves
  `make_id`/`model_id`/`city_id` to names (DB lookups, gracefully ignored if the id
  doesn't resolve) and falls back to the free-text `q` param, producing a subject like
  `"BMW 3 Series in Podgorica"`. Bare `/search` (no query params) still gets the plain
  `marketplace.seo.search_title` (generic, indexable — unchanged from KAN-65). Other
  filters (price/year/fuel/mileage/etc.) still drive `noindex,follow` per KAN-65 but
  aren't spelled out in the title — intentional scoping to keep titles short.
- **New i18n keys** (`lang/{en,sr}/marketplace.php`, `seo` key): `search_title`,
  `search_description`, `search_title_for` (`:subject`), `search_description_for`
  (`:subject`, `:app`), `search_subject_in_city` (`:subject`, `:city`). Also
  `lang/{en,sr}/dealer.php` `seo.description_fallback` (`:app`) — replaces a hardcoded
  `'...on DriveBay.'` string in `DealerStorefrontController` that was a latent bug for
  the `autoklik` brand (always said "DriveBay" regardless of active brand).
- **`DealerStorefrontController::show()`** now passes a canonical (3rd arg to
  `SeoData::forPage()`) built via `LocaleUrl::route('dealers.show', ['dealer' =>
  $dealer->slug])` — note **string slug, not the model**; passing the `DealerAccount`
  model directly to `route()`/`LocaleUrl::route()` would NOT reliably resolve to the
  slug-keyed URL despite the route being `{dealer:slug}` (Laravel's URL generation uses
  `getRouteKey()`, i.e. `id` by default, not the route's explicit binding column) — this
  matches the existing pattern already used in `SitemapGenerator::dealerPages()`.
  `og:url` comes for free since `SeoData::forPage()` mirrors `canonical` into `og.url`.
  (This code path is only reached for non-standalone dealers — standalone-enabled
  dealers 301-redirect away earlier in the same method.)
- **`SeoData::forListing()`** canonical/og:url now storefront-aware: delegates to
  `App\Support\Storefront\StorefrontUrl::listing($listing)` instead of always building
  `LocaleUrl::route('listings.show', ...)`. `StorefrontUrl::listing()` already existed
  (previously only consumed by the Vue frontend for links) and internally checks
  `app(StorefrontContext::class)->isStandalone()`: true → builds
  `https://{storefront-host}/vehicles/{publicId}-{slug}` via `DealerDomainService::
  urlForHost()`; false (marketplace host) → same `listings.show` URL as before. Only two
  callers of `forListing()`: `ListingController::show` (marketplace, always
  non-standalone context) and `StorefrontListingController::show` (storefront route,
  reached only via `storefront.host` middleware, i.e. always standalone context) — so
  this is a safe drop-in with no new branching needed in `SeoData` itself.
- **Known gotcha, not fixed (out of scope):** `hreflang` alternates for a
  storefront-canonical listing still resolve against the marketplace domain
  (`LocaleUrl::hreflangAlternates()` always uses `url()` = `APP_URL`), since standalone
  storefronts don't do locale-prefixed routing. Pre-existing behavior, just more visible
  now that canonical/og:url correctly point at the storefront domain. Revisit if it
  becomes a real SEO problem.
- **`STOREFRONT_URL_SCHEME`** env var (via `config('drivebay.storefront_url_scheme')`,
  default `https`) drives the scheme `DealerDomainService::urlForHost()` uses — local
  `.env` sets it to `http` for dev. Tests that assert an exact storefront URL should
  `config(['drivebay.storefront_url_scheme' => 'https'])` explicitly rather than relying
  on the ambient env value (see `DealerStorefrontDomainTest`'s KAN-66 case).
- **Tests:** `tests/Feature/Web/SearchSeoTitleTest.php` (bare page generic title, make
  filter → descriptive title, make+city combo, free-text `q` fallback, filter present
  but no derivable subject → falls back to generic title while staying
  `noindex,follow`), `tests/Feature/Web/DealerCanonicalSeoTest.php` (canonical + og:url
  match `dealers.show`, i18n fallback description), and one case added to
  `tests/Feature/DealerStorefrontDomainTest.php` (storefront listing canonical is the
  `https://{subdomain}/vehicles/...` URL, asserted to NOT equal/contain the marketplace
  `listings.show` URL).

## Dynamic OG images (KAN-69) — fuel prices hero card + generic page-type cards

Two new 1200×630 Intervention Image services, both brand-colored (`brand('colors')`,
never hardcoded orange) and both following `ListingOgImageService`'s pattern: `urlFor()`
builds a versioned `/og/...jpg?v={hash}` URL, `ensureGenerated()` caches the JPEG under
`Storage::disk('public')` and returns the storage-relative path, and each has its own
`protected function fontPath(bool $bold)` duplicated verbatim from `ListingOgImageService`
(same fallback chain: `resource_path('fonts/Roboto-*.ttf')` → Windows/Linux system fonts)
— this duplication mirrors the existing `BrandDefaultOgImage`/`ListingOgImageService`
convention, no shared trait was introduced.

- **`App\Domains\FuelPricing\Services\FuelPricesOgImageService`** — renders national ME
  max retail prices (petrol 95/98, diesel, heating oil) + effective date + brand name.
  `urlFor(?MontenegroFuelPriceSnapshot $snapshot = null)`: defaults to
  `MontenegroFuelPriceSnapshot::latestSnapshot()`; **if there's no snapshot, returns the
  brand default OG URL** (`brand('assets.og_default_url')`) instead of generating an
  empty card. `ensureGenerated()` returns `?string` (null when no snapshot) — caller
  (`FuelPricesOgImageController`) must `abort_if($path === null, 404)`. Cache path:
  `og/fuel-prices/{brandId}-{locale}-{version}.jpg`; version = `sha1(4 prices +
  effective_date + brand id + locale)` truncated to 12 chars.
  Route: `GET /og/fuel-prices.jpg` → `fuel-prices.og`, registered **outside** the locale
  group next to `listings.og` in `routes/web.php` (same reasoning as `listings.og`/
  `sitemap`: one canonical asset URL, not per-locale).
- **`App\Support\Seo\PageTypeOgImageService`** — generic "large title + short subtitle +
  accent bar + brand name" card for tool/utility pages that have no hero imagery of
  their own. `SLUGS = ['registration', 'fuel-consumption', 'compare']`.
  **`templateFor(string $slug): array{title, subtitle}`** is the key design point: it
  resolves the canonical, locale-aware title/subtitle for a slug via `__()` (registration/
  fuel-consumption reuse the existing `tools.*.hero_title`/`hero_subtitle` keys already
  used on those pages; compare reuses `marketplace.compare.title`/`subtitle`). **Both**
  the page controller (building the OG URL via `urlFor()`) **and** `PageTypeOgImageController`
  (regenerating the JPEG when the image route is hit) call `templateFor($slug)` — this is
  required because the `/og/pages/{slug}.jpg` route only carries the slug + a `?v=` cache-
  buster, not the title/subtitle text itself, so both ends must derive identical text
  independently to get a matching version hash / cache hit. Cache path:
  `og/pages/{slug}-{version}.jpg`; version = `sha1(brand id + locale + slug + title +
  subtitle)`.
  Route: `GET /og/pages/{slug}.jpg` → `pages.og`, `whereIn('slug', SLUGS)`, also outside
  the locale group.
  **Known gotcha (not fixed, low-impact):** `SetLocale` middleware only recognizes a
  locale from the URL's first path segment (`sr`); `/og/pages/...` and
  `/og/fuel-prices.jpg` don't have that prefix, so image *requests* always resolve to the
  default locale (`en`) regardless of which locale the linking page was rendered in. This
  only affects the *text baked into the JPEG* for `sr` pages (marketplace HTML meta tags
  are unaffected, they're built directly from the request's own locale) — pre-existing
  same-shape gotcha as `listings.og`/canonicals not being locale-aware; revisit only if it
  becomes a real complaint.
- **`SeoData::forPage()`** — see the KAN-64 section above for the new `$ogImageUrl`/
  `$ogImageAlt` params this feature added.
- **`FuelPriceController`** — now builds a dynamic title/description from the latest
  `MontenegroFuelPriceSnapshot` (`fuel_prices.seo_title_with_prices` /
  `seo_description_with_prices`, new keys in `lang/{en,sr}/fuel_prices.php`, `:diesel`/
  `:petrol_95`/`:petrol_98`/`:heating_oil`/`:date` placeholders, 2-decimal formatted
  prices) and falls back to the static `page_title`/`page_description` keys when there's
  no snapshot yet. Passes `FuelPricesOgImageService::urlFor($latest)` as the OG image.
- **`RegistrationCalculatorController`**, **`FuelConsumptionCalculatorController`** —
  unchanged page title/description, added `PageTypeOgImageService::urlFor(slug, ...)` as
  the OG image via `templateFor()`.
- **`CompareController`** — added canonical (`LocaleUrl::route('compare.index')`, was
  previously missing) and the page-type OG image; kept `noindex,follow` gating on
  `$publicIds->isNotEmpty()` unchanged (KAN-65 behavior, still covered by
  `PrivatePageSeoTest`). **Also fixed a latent i18n bug while touching this line**: the
  `marketplace.compare.subtitle` key has a `:max` placeholder
  (`"Side-by-side comparison of up to :max saved vehicles."`) that was never being
  substituted (`__('marketplace.compare.subtitle')` with no params) — now passed
  `['max' => CompareService::MAX_ITEMS]` both for the page description and the OG
  subtitle text, so the literal string `:max` no longer leaks into meta/OG copy.
- **Tests:** `tests/Feature/Web/FuelPricesOgImageTest.php` (og:image present + points at
  `/og/fuel-prices.jpg?v=`, dynamic title contains a live price, brand-default fallback
  when no snapshot, `/og/fuel-prices.jpg` serves a real jpeg and caches under
  `og/fuel-prices/`, 404 when no snapshot exists), `tests/Feature/Web/PageTypeOgImageTest.php`
  (all three tool pages have `/og/pages/{slug}.jpg?v=` og:image, compare canonical
  present, compare-with-ids stays `noindex,follow` while still using the page-type card,
  all three slugs serve real jpegs via a `->with([...])` dataset, unknown slug 404s via
  route `whereIn`).
- **Gotcha hit while verifying (not a KAN-69 regression):** running the Pest suite
  (likely `tests/Feature/VehicleMakeLogoTest.php`) mutates `public/images/brands/*.svg`
  in place (looks like an in-place minify/optimize pass on first read/write). Unrelated
  to any ticket — revert with `git checkout -- public/images/brands/` before committing
  if you run the full suite.
