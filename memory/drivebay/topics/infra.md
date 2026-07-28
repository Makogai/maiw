# drivebay — Infra, queues, CI & deployment deep reference

This supplements `apps/drivebay/CLAUDE.md` ("Queues (Horizon)", "Running locally") and
`apps/drivebay/docs/development/{docker-setup.md,deployment.md}` — it does not repeat
them. Read those first; this note adds file-level evidence, exact config values, and a
few discrepancies found while verifying against code (2026-07-15, commit `8f7840f`).

## Docker

Root `Dockerfile` is a multi-stage build (`Dockerfile:1-155`):

| Stage | From | Purpose |
|---|---|---|
| `php-runtime` | `${PHP_BASE_IMAGE}` (default `ghcr.io/makogai/drivebay-php-base:8.4`) | prebuilt PHP + extensions, not compiled here (`Dockerfile:22-27`) |
| `vendor` | `php-runtime` | `composer install --no-dev`, then `composer dump-autoload --optimize --classmap-authoritative` (`Dockerfile:32-48`) |
| `frontend` | `node:22-alpine` | `npm ci` + `npm run build` (Vite/Vue/Filament assets) (`Dockerfile:53-66`) |
| `base` | `php-runtime` | app code + storage dirs, no web server, no built assets — shared by `web`/`worker`/`scheduler` so non-web deploys skip `npm run build` entirely (`Dockerfile:72-108`) |
| `web` (default) | `base` | adds nginx+supervisor, copies `public/build` from `frontend`, `CMD supervisord` (`Dockerfile:113-132`) |
| `worker` | `base` | `CMD php artisan horizon`, `RUN_OPTIMIZE=false` (`Dockerfile:137-141`) |
| `scheduler` | `base` | polling loop `while true; do php artisan schedule:run; sleep 60; done`, `RUN_OPTIMIZE=false` — optional, Coolify cron is preferred instead (`Dockerfile:146-150`) |

Build args: `PHP_BASE_IMAGE` (`Dockerfile:22`) is the only non-obvious one — it points at
the separately-built base image (see below), not a local compile step.

**aarch64 fix (commit `8f7840f`, 2026-06-30):** Coolify's server is an Oracle Ampere
**arm64** host. `.github/workflows/php-base-image.yml` originally built/pushed the base
image without specifying a platform, which defaulted to the amd64 GitHub runner's
architecture; pulling that image on the arm64 Coolify host produced `exec format error`
(couldn't even run `/bin/sh`) — confirmed in production. The fix added `docker/setup-qemu-action@v3`
+ `docker/setup-buildx-action@v3` and `platforms: linux/arm64` to the build-push step
(`.github/workflows/php-base-image.yml:26-30,48`), cross-compiling under QEMU (~20-30 min
vs ~5 min native). **If the Coolify host architecture ever changes, this platform value
must change too** — nothing else in the pipeline would catch a mismatch.

`docker/php-base.Dockerfile:1-59` — separate, rarely-changing image: `php:8.4-fpm-alpine`
+ `bcmath, exif, gd, intl, opcache, pcntl, pdo_pgsql, zip` (compiled via
`docker-php-ext-install`) + `redis` (via `pecl install redis`) + composer binary copied
from `composer:2.8`. This is the ~5-minute compile step the split was designed to avoid
paying on every deploy (per `docs/development/deployment.md`).

`docker/` directory contents: `php-base.Dockerfile`, `nginx/{nginx.conf,default.conf}`,
`scripts/entrypoint.sh`, `supervisor/web.conf`, `php/conf.d/99-production.ini`.

**Entrypoint** (`docker/scripts/entrypoint.sh`) runs on every container start (web,
worker, scheduler all share `base`'s `ENTRYPOINT`):
- Ensures storage subdirs exist, fixes `storage/app/public` perms (`entrypoint.sh:6-27`).
- Firebase credentials: if `FIREBASE_CREDENTIALS_BASE64` is set, base64-decodes it to
  `storage/app/firebase/credentials.json`; else if `FIREBASE_CREDENTIALS_JSON` is set,
  writes it verbatim to the same path; either way exports `FIREBASE_CREDENTIALS` to that
  file path (`entrypoint.sh:44-56`). A third option — setting `FIREBASE_CREDENTIALS`
  itself to inline JSON — is *not* handled by the entrypoint at all; it works anyway
  because `config/firebase.php:53` passes `FIREBASE_CREDENTIALS` straight to the
  kreait/firebase SDK, which accepts a path or raw JSON string natively.
- `RUN_STORAGE_LINK` (default true) → `storage:link`; `RUN_MIGRATIONS` (default true) →
  `migrate --force`; `RUN_OPTIMIZE` (default true) → config/route/view/event cache +
  best-effort `icons:cache`/`filament:cache-components` (`entrypoint.sh:58-73`). Worker
  and scheduler stages set `RUN_OPTIMIZE=false` (`Dockerfile:139,148`) so only the web
  container runs migrations/optimize by default — but note the web `docker-compose.coolify.yml`
  block also sets `RUN_MIGRATIONS: 'true'` explicitly while `horizon` sets it to `'false'`
  (`docker-compose.coolify.yml:41,75`), so migrations only ever run from the web deploy.

`.dockerignore` excludes `.git`, `.github`, IDE dirs, `node_modules`, `vendor`,
`drivebay-flutter`, `tests`, runtime storage contents, `.env*` (but re-includes
`.env.coolify.example`), all `docker-compose*.yml` (re-includes `.coolify.yml`),
`Dockerfile*`, `docs`, `*.md` (re-includes `README.md`).

### docker-compose files

`docker-compose.yml` (local dev infra only, no app container) defines: **postgres**
(`postgres:16-alpine`, port 5432), **meilisearch** (`getmeili/meilisearch:v1.12`, port
7700), **redis** (`redis:7-alpine`, port 6379), **mailpit** (SMTP 1025 / UI 8025),
**adminer** (profile `tools` only, port 8080) — `docker-compose.yml:8-79`.

(**Jira: KAN-14** fixed `15ce16c`): `docs/development/docker-setup.md` "What Docker runs"
table now matches `docker-compose.yml` — **postgres** (PostgreSQL 16) on port **5432**;
no MySQL/MariaDB service in compose.

`docker-compose.coolify.yml` is a **reference/blueprint**, not what Coolify literally
runs (Coolify deploys each service as its own app per `docs/development/deployment.md`):
`app` (target `web`, port 8080, healthcheck `curl /up`), `horizon` (target `worker`,
depends on `app` healthy, `RUN_MIGRATIONS=false`), plus `postgres`, `redis`
(`--appendonly yes`), `meilisearch` (`MEILI_ENV=production`) —
`docker-compose.coolify.yml:12-124`.

## CI

Two workflows, very different triggers/purposes:

| Workflow | Trigger | Steps | Publishes image? |
|---|---|---|---|
| `.github/workflows/tests.yml` | `push` to `main`/`master`, all `pull_request` (`tests.yml:3-6`) | checkout → PHP 8.4 (`shivammathur/setup-php`, extensions `dom,curl,libxml,mbstring,zip,pcntl,pdo,sqlite`) → `composer install` → copy `.env.example` → `key:generate` → `php artisan test --compact` → Node 22 → `npm ci` → `npm run build` (`tests.yml:9-45`) | No |
| `.github/workflows/php-base-image.yml` | `workflow_dispatch`, or `push` to `main` **only when `docker/php-base.Dockerfile` changes** (`php-base-image.yml:9-14`) | checkout → QEMU → Buildx → GHCR login → `docker/build-push-action@v6`, `platforms: linux/arm64`, tags `ghcr.io/makogai/drivebay-php-base:8.4` (`php-base-image.yml:23-50`) | Yes, to GHCR |

Note: `tests.yml` runs the test suite against **SQLite** (`extensions: ...,sqlite`, no
Postgres service defined) even though local dev and production both use Postgres —
CI doesn't exercise Postgres-specific SQL. `php-base-image.yml` needs
`packages: write` permission (`php-base-image.yml:16-18`) and does **not** run on every
push to main — regular app deploys never rebuild/recompile PHP extensions.

## Horizon / Queues

`config/horizon.php` — two supervisors, Redis-backed:

- `defaults.supervisor-1`: `connection: redis`, `queue: ['default']`, `timeout: 60`
  (`config/horizon.php` defaults).
- `defaults.supervisor-imports` (**Jira: KAN-7**): `connection: redis-imports`,
  `queue: ['autodiler-imports']`, `timeout: 960`, `maxProcesses: 2` — also listed under
  each `environments.*` entry (Horizon only starts supervisors named in the active env).
- Per-environment `maxProcesses` for `supervisor-1`: production **10**, dev **5**, local **3**.
- `waits`: `redis:default` → 60s before `LongWaitDetected` fires.
- `trim`: recent/pending/completed 60 min, recent_failed/failed/monitored 10080 min (7 days).
- `memory_limit` (Horizon master process) 64MB.

`config/queue.php` — `default` connection env-driven (`QUEUE_CONNECTION`, defaults to
`database`, but prod/docker set `redis`). Redis default connection: `retry_after` **90s**.
Dedicated `redis-imports` connection: queue `autodiler-imports`, `retry_after` **1200s**
(ordering with Autodiler job: 900 < 960 < 1200).

**KAN-7 fixed**: `ImportAutodilerListingsJob` (`$timeout = 900`) routes to `redis-imports` /
`autodiler-imports` when `QUEUE_CONNECTION=redis`, so a long import cannot outlive its
reservation and get re-picked by a second worker. Short jobs stay on the default queue.

## Console Commands

`app/Console/Commands/*.php` (top-level only; domain-specific commands live under
`app/Domains/{Domain}/Console/` per `topics/architecture.md`'s domain table):

| Command | Signature | Purpose | Path |
|---|---|---|---|
| `ImportVehicleBrandLogosCommand` | `vehicle:import-brand-logos {--source=}` | One-off import of brand logo files from the vehiclespecs dataset into `public/images/brands`, via `VehicleMakeLogoService` | `app/Console/Commands/ImportVehicleBrandLogosCommand.php:10-14` |
| `RegenerateListingWatermarksCommand` | `listings:reprocess-watermarks {--listing=}` | Re-applies crop + watermark to existing completed listing photos (optionally scoped to one listing), via `ListingImageProcessor` | `app/Console/Commands/RegenerateListingWatermarksCommand.php:12-16` |
| `ScrapeAutodilerCapturCommand` | `autodiler:scrape-captur {--url=} {--pages=2} {--output=} {--delay=350}` | One-off scraper: pulls Renault Captur listings from autodiler.me into a JSON file (has a hardcoded default search URL) | `app/Console/Commands/ScrapeAutodilerCapturCommand.php:12-22` |
| `SyncListingEquipmentCommand` | `equipment:sync` | Upserts `vehicle_features` rows from `config/listing_equipment.php`, deactivating features no longer in config | `app/Console/Commands/SyncListingEquipmentCommand.php:10-14` |
| `SyncVehicleBrandLogosCommand` | `vehicle:sync-brand-logos` | Assigns `logo_path` on vehicle makes from existing public brand SVG files, via `VehicleMakeLogoService` | `app/Console/Commands/SyncVehicleBrandLogosCommand.php:10-14` |

(Also referenced elsewhere but not in this dir: `instagram:discover`,
`instagram:verify-token`, `instagram:test-post` mentioned in `.env.example:195-197` —
these live under a domain `Console/` dir, not `app/Console/Commands/`.)

## Observers & Providers

`app/Observers/*.php` — only two, both registered manually in `AppServiceProvider::boot()`
(`app/Providers/AppServiceProvider.php:71-72`), not auto-discovered:

| Observer | Observes | Behavior |
|---|---|---|
| `AdvertisementObserver` | `Advertisement` | `saved`/`deleted` → `AdvertisementDeliveryService::forgetCache()` (busts an ad-serving cache on any change) | `app/Observers/AdvertisementObserver.php:10-18` |
| `NotificationObserver` | `Notification` | `created` → for `channel === 'in_app'` rows only, applies saved-search/fuel-price "notify_push" opt-out checks, then dispatches `SendPushNotificationJob` (FCM) with a presented title/body via `SellerNotificationPresenter`; logs+skips if both title and body end up empty | `app/Observers/NotificationObserver.php:13-70` |

`app/Providers/*.php` (registration order in `bootstrap/providers.php:1-6`):

| Provider | Registers/boots |
|---|---|
| `AppServiceProvider` | Singleton `StorefrontContext`; custom Meilisearch `Client` binding with configurable HTTP timeouts (`registerMeilisearchClient`, `AppServiceProvider.php:106-125`); `PaymentGatewayInterface` → `StripePaymentGateway` if `platform_config('billing.gateway')==='stripe'` and a Stripe secret is configured, else `FakePaymentGateway` (`AppServiceProvider.php:44-52`); forces HTTPS URL scheme when `app.url` is https; disables JSON resource wrapping; `Gate::policy` for `Listing`/`ListingViewingAppointment`; `Event::listen(ListingPublished::class, SendListingPublishedNotification::class)`; registers both Observers above; defines **12** Pennant features (`AppServiceProvider.php:74-85`); 6 named rate limiters (`api-auth` 10/min, `api-search` 60/min, `api-analytics` 120/min, `api-write` 30/min, `api-import-status` 180/min, `fuel-consumption-ai` 10/hr per user or 5/hr per IP) (`AppServiceProvider.php:87-101`); binds route model `{thread}` by `uuid` | `app/Providers/AppServiceProvider.php` |
| `Filament\AdminPanelProvider` | Filament 5 admin panel config (not read in depth this pass) | `app/Providers/Filament/AdminPanelProvider.php` |
| `HorizonServiceProvider` | Extends `HorizonApplicationServiceProvider`; `viewHorizon` gate — always true in `local`, else requires `super_admin`/`admin` role (`HorizonServiceProvider.php:28-37`) | `app/Providers/HorizonServiceProvider.php` |
| `TelescopeServiceProvider` | Filters Telescope entries to exceptions/failed requests/failed jobs/scheduled tasks/monitored-tag only outside `local` (full capture in `local`); hides `_token` param and cookie/CSRF headers outside `local`; `viewTelescope` gate is an **empty allowlist** (`in_array($user->email, [])` — nobody currently passes) outside whatever bypass Filament/local provides (`TelescopeServiceProvider.php:24-63`) | `app/Providers/TelescopeServiceProvider.php` |

Pennant features note: `AppServiceProvider` defines 12 features inline
(`Mobile, StorefrontSubdomain, InstagramPublish, InstagramRequireApproval,
InstagramDevFallback, InstagramUpdateSoldCaption, PriceRating, PriceRatingOnCards,
VehicleRegistrationEstimate, FuelEconomyEstimate, ListingCompare,
ListingCardHoverPreview`) — `CLAUDE.md` says 14 flags exist under `app/Features/`; the
2 not defined here were not investigated this pass (may be defined elsewhere or simply
unused currently).

## Top-level Jobs (`app/Jobs/`)

Non-domain jobs only (most jobs live under `app/Domains/{Domain}/Jobs/` instead):

| Job | Purpose | Notes | Path |
|---|---|---|---|
| `ImportAutodilerListingsJob` | Imports a user's previewed Autodiler listings (from `AutodilerImportService`), notifies on completion, then dispatches `ProcessListingModerationPipelineJob` per created listing | `$timeout = 900` — see Horizon gotcha above; catches `Throwable`, reports it, and marks the import failed rather than letting the job fail silently | `app/Jobs/ImportAutodilerListingsJob.php:17-75` |
| `Domains/SocialPublishing/PublishListingToInstagramJob` | Publishes a `ListingSocialPost` to Instagram via `SocialPublishService`, skipping if already `published`/`cancelled` | `$tries = 3`; namespaced under `App\Jobs\Domains\SocialPublishing` despite being a "top-level" dir (not under `app/Domains/`) | `app/Jobs/Domains/SocialPublishing/PublishListingToInstagramJob.php:10-32` |
| `Domains/SocialPublishing/UpdateInstagramSoldCaptionJob` | Updates a listing's Instagram caption once its status flips to `sold` | `$tries = 3`; no-ops if listing missing or not `sold` | `app/Jobs/Domains/SocialPublishing/UpdateInstagramSoldCaptionJob.php:10-28` |

## Deployment

Confirms `docs/development/deployment.md`: production runs on **Coolify**, as two
separate applications built from the same repo/`Dockerfile` — **Drivebay Web** (target
`web`) and **Drivebay Worker** (target `worker`, runs `php artisan horizon`)
(`docs/development/deployment.md:5-7`). `docker-compose.coolify.yml` is a blueprint
reference for that split, not literally what Coolify runs (Coolify manages each service
separately). A `scheduler` build target exists in the Dockerfile but Coolify's own cron
is preferred over running it (`Dockerfile:143-150`, `docker-compose.coolify.yml:6`).

Env var categories present (names/purpose only — no values copied; see files directly
for exact defaults):

- **`.env.coolify.example`** (44 keys) — minimal production template: app identity
  (`APP_NAME/ENV/DEBUG/URL/KEY/LOCALE`), DB (Postgres connection vars), cache/session/queue
  driver selection, `FILESYSTEM_DISK`/`MEDIA_DISK`, mail (SMTP host/port/creds/encryption),
  `SANCTUM_STATEFUL_DOMAINS`, Firebase (`FIREBASE_PROJECT` + one of three credential
  delivery options, see Docker section above), optional `SENTRY_LARAVEL_DSN`,
  `TELESCOPE_ENABLED=false`, Docker entrypoint toggles (`RUN_MIGRATIONS/RUN_OPTIMIZE/RUN_STORAGE_LINK`),
  storefront subdomain config (`MARKETPLACE_HOSTS`, `STOREFRONT_*`). Ends with a comment
  pointing to `.env.example` for billing/Instagram/etc extras not included here.
- **`.env.example`** (125 keys) — full local/default template, additionally covering:
  storefront billing gate mode, listing-card display toggles, Montenegro fuel
  price/registration-estimate feature config, AWS S3 disk vars, CarQuery (legacy) +
  mobile.de taxonomy import config, NHTSA VIN decoding, mobile app deep-link config
  (Android package/SHA-256 fingerprints, iOS bundle ID/team ID), Sentry trace sample
  rate, Stripe keys, Instagram/Meta publishing config (app ID/secret for OAuth only —
  access tokens live in Filament, not `.env`, per the file's own comment), OpenAI API
  key (fuel-consumption AI feature).
- **`.env.docker.example`** — same shape as `.env.example` but pre-filled for the local
  Docker/Postgres/Redis/Meilisearch stack; notably drops the AWS S3, most
  feature-toggle, mobile deep-link, Sentry, and Stripe keys entirely (diffed against
  `.env.example` — 40+ keys absent), implying those are treated as prod/optional-only
  locally.

Production optimization commands (post-deploy, run by entrypoint when `RUN_OPTIMIZE=true`):
`config:cache`, `route:cache`, `view:cache`, `event:cache`, plus best-effort
`icons:cache`/`filament:cache-components` (`docker/scripts/entrypoint.sh:66-73`) —
`docs/development/deployment.md`'s manual list additionally mentions
`composer run api:docs`, which is **not** run by the entrypoint automatically; it must
be run manually/in CI if the OpenAPI doc needs regenerating for a release.

Monitoring: Telescope (local only), Horizon dashboard at `/horizon` (gated per
`HorizonServiceProvider` above), Sentry via `SENTRY_LARAVEL_DSN` (prod, optional),
`php artisan backup:run` / `config/backup.php` (not inspected this pass).

## Mobile App Links / Universal Links (`public/.well-known/`) — **Jira: KAN-27**

Static association files for Android App Links + iOS Universal Links:

- `public/.well-known/assetlinks.json` — package `me.makogai.drivebay`; fingerprints
  must be real SHA-256 strings only (no placeholders — Google DAL returns
  `ERROR_CODE_MALFORMED_CONTENT` and autoVerify fails). Debug keystores differ per
  machine; list every debug/release cert that should open `https://…/listings|dealers`.
- `public/.well-known/apple-app-site-association` — still needs Apple Team ID
  (placeholder). Serve as `application/json` (dev currently returns
  `application/octet-stream`).
- Ops notes: `public/.well-known/README.md`. Flutter hosts already cover
  `dev|qa|www|drivebay.me` in the Android manifest / iOS entitlements.
- Android works without Play Store: debug SHA in assetlinks + deploy to host +
  `pm verify-app-links --re-verify`.
