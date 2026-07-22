# Runbooks

Operational procedures and the traps that come with them. Mechanics live in `apps/drivebay/docs/development/deployment.md`; this page is what you need at 2am.

---

## Deploy

**Where.** Production runs on **Coolify** as **two separate applications** built from the same repo and Dockerfile:

- **Drivebay Web** — build target `web` (nginx + supervisor), port 8080, healthcheck `/up`
- **Drivebay Worker** — build target `worker`, runs `php artisan horizon`

`docker-compose.coolify.yml` is a **reference blueprint**, not what Coolify literally runs — Coolify manages each service separately.

**On deploy**, the container entrypoint (when `RUN_OPTIMIZE=true`) runs `storage:link`, `migrate --force`, and the config/route/view/event caches.

> **⚠️ Migrations run only from the web deploy.** The worker sets `RUN_MIGRATIONS=false`. If you deploy only the worker, no migrations run.

> **⚠️ The production host is arm64.** Coolify runs on an Oracle Ampere box. The PHP base image **must** be built for `linux/arm64` or production dies with `exec format error` — it can't even run `/bin/sh`. This bit us once (fixed in `8f7840f`: QEMU + Buildx + `platforms: linux/arm64`). **If the host architecture ever changes, that platform value must change too — nothing else in the pipeline catches a mismatch.**

**`composer run api:docs` is NOT run automatically** by the entrypoint. If a release changes the API, regenerate the OpenAPI doc manually (and see **KAN-13** — it's currently stale).

### The PHP base image

PHP + extensions are baked into `ghcr.io/makogai/drivebay-php-base:8.4`, built by a **separate** workflow that only triggers on changes to `docker/php-base.Dockerfile` (or manual dispatch). Normal deploys never recompile extensions — that's the point. Rebuilding it takes ~20-30 min because it cross-compiles under QEMU.

---

## Queues (Horizon)

**Config.** Redis-only, a **single** supervisor on a **single** `default` queue. Per-environment worker counts: **production 10**, dev 5, local 3. Failed jobs retained 7 days.

**Dashboard.** `/horizon`, gated to `super_admin`/`admin` (always open in `local`).

> **⚠️ Known bug — duplicate Autodiler imports (KAN-7).**
> `ImportAutodilerListingsJob` sets `$timeout = 900` (15 min), but the redis queue's `retry_after` defaults to **90s** and isn't overridden in any `.env*.example`. Correct ordering is job timeout < supervisor timeout < `retry_after` — this is inverted. If an import runs past 90s (likely), Redis's reservation lapses and **a second worker can pick up the same job**, importing the same listings twice.
> **Fix:** raise `REDIS_QUEUE_RETRY_AFTER` well above 900, or give this job its own queue/supervisor.

Other Horizon traps:

- **Metrics stay empty** until `horizon:snapshot` is scheduled (every 5 min). Running `php artisan horizon` alone doesn't populate the dashboard.
- **`balance: auto` ignores queue order** — if you ever need real priority between queues, use separate named supervisors.
- **Windows dev**: Horizon needs `ext-pcntl`, usually unavailable. Use `php artisan queue:work` locally; Horizon runs in Docker/Linux/production.

---

## Scheduled work

`routes/console.php` schedules only:

- `search:send-saved-search-alerts` — hourly
- Montenegro fuel price sync — daily 07:00, `withoutOverlapping()->onOneServer()`

> **⚠️ Recommendations are NOT scheduled (KAN-6).** `recommendations:rebuild` has no scheduler entry. Similarity/candidate/profile data only refreshes when someone runs it by hand; otherwise the service silently falls back to simple heuristics. If someone reports "recommendations look dumb," this is why.

---

## Autodiler import

**What it does.** Scrapes a seller's Autodiler profile → previews vehicles → queue-imports them (listings + media + equipment mapping) → runs each through the moderation pipeline.

**Entry points.** Web `AutodilerImportController`; API `AutodilerImportApiController`; mobile `autodiler_import_screen.dart`. Status polling has its own generous rate limit (180/min).

**Watch for.** The duplicate-import risk above (KAN-7). Auto-accept behaviour is admin-configurable. The job catches failures and marks the import failed rather than dying silently.

---

## Fuel price sync

Scrapes **`data.gov.me`** — a government open-data **HTML portal**, not a stable API. It's brittle by nature: any markup change breaks parsing. The sync already tolerates partial failure (counts failures, logs warnings, keeps going) and specifically anticipates older XLSX-only dataset pages.

On success it diffs against the previous snapshot and notifies subscribed users of changes.

---

## Media processing

Uploads land at `listings/{id}/incoming/{uuid}.jpg`; the processed output is written to `listings/{id}/{uuid}.jpg`, and **the incoming file is deleted only after successful processing** — so leftovers in `incoming/` indicate failures.

A listing **auto-publishes** once all its media finishes processing (`ListingPublishCoordinator::checkListingReady()`, called from the media job). Auto-publish additionally requires the platform config flag on, zero blocking reasons, and ≥3 eligible photos by default.

---

## Monitoring

| Tool | Where | Notes |
|---|---|---|
| **Horizon** | `/horizon` | Queue health; needs `horizon:snapshot` for metrics |
| **Sentry** | prod | Optional, via `SENTRY_LARAVEL_DSN` |
| **Telescope** | local only | Outside `local` it filters to exceptions/failures; its `viewTelescope` gate is an **empty allowlist** — nobody passes |
| **Mailpit** | local `:8025` | Catches all local mail |

---

## Firebase / push

Credentials reach the container three ways: `FIREBASE_CREDENTIALS_BASE64` (decoded by the entrypoint), `FIREBASE_CREDENTIALS_JSON` (written verbatim), or `FIREBASE_CREDENTIALS` set directly to a path *or* inline JSON (handled natively by the SDK, not the entrypoint — so it looks like a missing case in `entrypoint.sh` but isn't).

Push requires a **running queue worker** — notifications dispatch through the queue. Note `NotificationObserver` fires on **any** `in_app` notification row regardless of which domain created it. **Push is Android-only** on mobile today.

The service account JSON is a **server secret** — it never goes in the mobile repo.
