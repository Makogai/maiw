# drivebay — SEO subsystem (KAN-62 epic: KAN-63/64/65/66 done, KAN-67/68 open)

Central place: `app/Support/Seo/SeoData.php`. Controllers build an `array`
via `SeoData::forPage(...)` and pass it as the Inertia `seo` prop; `resources/views/app.blade.php`
reads that prop server-side (no JS needed) to render `<title>`, meta description, OG tags, and
`<meta name="robots">`.

## `SeoData::forPage()` / `forPrivatePage()`

- `forPage(string $title, string $description, ?string $canonical = null, ?string $robots = null)`
  — `$robots` defaults to `index,follow`. Also sets `og.image` to the brand default
  (`BrandDefaultOgImage`, KAN-64) when the page doesn't supply its own OG image.
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
  pages), `legalPages()`, `dealerPages()`, `listingPages()`.
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
