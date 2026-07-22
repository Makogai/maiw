# Onboarding: local setup

Getting DriveBay running locally. Corrections to the in-repo docs are called out where they exist — trust this page over `docs/development/docker-setup.md` where they disagree, and see **KAN-14**.

## Prerequisites

- **Docker Desktop** — runs the infrastructure (DB, search, cache, mail)
- **PHP 8.2+** and **Composer** — the app itself runs on the host, not in Docker, for local dev
- **Node 20+**
- Optional: **Laravel Herd** to serve the app at `https://drivebay.test`

## The backend (`apps/drivebay`)

```bash
cp .env.docker.example .env      # Windows: copy .env.docker.example .env
composer run setup               # install, migrate, seed, build assets
composer run dev                 # app + queue worker + Vite, all at once
```

Infrastructure lifecycle:

```bash
composer run docker:up      # Postgres, Meilisearch, Redis, Mailpit
composer run docker:down
composer run docker:fresh   # wipe DB, reseed, reindex search
```

| URL | Service |
|---|---|
| http://127.0.0.1:8000 | App (or `https://drivebay.test` via Herd) |
| http://127.0.0.1:8000/admin | Filament admin |
| http://127.0.0.1:8025 | Mailpit (catches all outbound mail) |
| http://127.0.0.1:7700 | Meilisearch |

**Test login:** `admin@drivebay.test` / `password`

> **⚠️ The DB is Postgres, not MySQL**
>
> `docs/development/docker-setup.md` documents the Docker DB service as MySQL/MariaDB 11 on port **3306**. That is wrong. `docker-compose.yml` only ever defines **`postgres:16-alpine` on 5432** — there is no MySQL service in any compose file. If you're hunting for a MySQL container, stop; it doesn't exist. Tracked as **KAN-14**.

### First-run notes

- Seeding runs 12 seeders in order. Vehicle taxonomy comes from a **committed snapshot** (`database/data/mobile-de/taxonomy-snapshot.json`, ~920 KB), *not* live API calls — so seeding works offline. Regenerate it with `php artisan vehicles:export-mobile-de-taxonomy`.
- Only **3 factories** exist (Listing, User, Vehicle) despite 21 domains. Demo data comes from `DemoMarketplaceSeeder`. If you need factory-backed test data for another domain, you'll be writing the factory first.
- Search won't return anything until the search documents are indexed — `composer run docker:fresh` handles that.

### Laravel Herd

Use Docker for infrastructure and Herd for the site at `https://drivebay.test`. Dealer storefront subdomains are **not** wildcard-routed locally — you must add explicit Herd site aliases per dealer. See `docs/architecture/dealer-storefront-domains.md`.

## The mobile app (`drivebay-flutter`)

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # generates freezed/json models
flutter run -d <device>
```

The API base URL is a **compile-time** constant, not a runtime setting:

```bash
# Desktop / Chrome against Herd
flutter run -d windows --dart-define=API_BASE_URL=https://drivebay.test/api/v1

# Physical device / emulator — use your machine's LAN IP
flutter run --dart-define=API_BASE_URL=https://192.168.1.10/api/v1 --dart-define=ALLOW_BAD_CERTIFICATES=true
```

Gotchas:

- Anything under `*.freezed.dart` / `*.g.dart` is **generated** — never hand-edit; change the source and re-run `build_runner`.
- **Push notifications are Android-only.** `firebase_options.dart` throws `UnsupportedError` for iOS and there's no `GoogleService-Info.plist`. iOS builds run fine, they just never register for push.
- The backend must have Firebase configured **and a queue worker running** for push to arrive.
- The repo's README links docs as `../docs/...`, which assumes it's nested inside the Laravel repo. Under our layout they're siblings — the real docs are at `apps/drivebay/docs/`.

## Testing

```bash
# backend
php artisan test --compact
php artisan test --compact --filter=SomeTest

# mobile
flutter test
```

- Backend tests are **Pest 4**, in `tests/Feature` and `tests/Unit`. Note `CLAUDE.md` mentions a `tests/Browser` directory — it doesn't exist yet.
- CI runs the backend suite against **SQLite**, not Postgres — so Postgres-specific SQL is never exercised in CI. Keep that in mind when a query passes CI but fails locally.
- The mobile test suite is thin by design: 6 files of pure JSON-parsing/URL unit tests. There's no widget or integration coverage.

## Before your first PR

- `vendor/bin/pint --dirty` — required for any touched PHP.
- Update `database_schema.dbml` **before** writing a migration, not after.
- If you find docs that lag the code, fix them rather than working around them — that's how we got the drift in *Known gaps & drift*.
