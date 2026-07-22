# drivebay-flutter — Architecture

## System shape

- Flutter/Dart mobile client for the DriveBay Laravel API. Riverpod (`flutter_riverpod`)
  for state, `dio` for HTTP, `go_router` for navigation, `freezed`+`json_serializable`
  for models, `flutter_secure_storage` for the auth token, `firebase_messaging` for push.
  Own repo/git history (`README.md`), consumes `/api/v1` JSON only — never treat this as
  sharing code/contracts with the Laravel web/Inertia layer (`apps/drivebay/CLAUDE.md`).
- `lib/` splits into `core/` (cross-cutting infra: `api`, `auth`, `deep_link`,
  `experiments`, `firebase`, `json`, `locale`, `navigation`, `preferences`, `push`) and
  `features/` (one folder per screen area: `auth`, `engagement`, `favorites`, `listings`,
  `messages`, `moderation`, `notifications`, `onboarding`, `profile`, `search`, `seller`,
  `sellers`, `settings`, `shell`, `tools`, `viewings`) — feature folders map loosely
  1:1 to the Laravel `docs/api/modules/*.md` split, not to `app/Domains/*` names exactly
  (e.g. `sellers` here = public seller profile API, `seller` = the seller dashboard API).
- API client lives in `lib/core/api/` (`api_client.dart`, `api_response.dart`,
  `api_exception.dart`) with dio interceptors in `lib/core/api/interceptors/`:
  `auth_interceptor.dart` (attaches bearer token), `locale_interceptor.dart`
  (`Accept-Language`), `error_interceptor.dart`, `ab_subject_interceptor.dart` (likely the
  `X-Visitor-Id`/experiment-subject header drivebay's memory notes on the API side).

## Boundaries and directed dependencies

- Base API URL is a compile-time `--dart-define=API_BASE_URL`, default
  `https://drivebay.test/api/v1` (`lib/config/env.dart`, `README.md`). Never hardcode a
  different default without checking `env.dart`.
- Firebase: `android/app/google-services.json` and `lib/firebase_options.dart` are
  committed (public client config, restricted by package name) — the service account
  secret stays server-side only, in the Laravel repo (`docs/firebase-setup.md`). FCM
  token registration hits `POST /api/v1/auth/device-tokens` — confirmed to match the
  route drivebay's own memory records (`memory/drivebay/topics/api-and-database.md`,
  "auth.php" table).

## Entry points and data flow

- `lib/main.dart` → `lib/app.dart` (root widget/router wiring). Localization via
  `lib/l10n/app_en.arb` → generated `app_localizations.dart` (`l10n.yaml`).

## External systems and persistence

- Only external system is the DriveBay Laravel API (`apps/drivebay`) — no local DB;
  `flutter_secure_storage` for the token, Riverpod providers for in-memory state.
- Firebase Cloud Messaging for push (receiving side of what drivebay's `Notification`
  domain sends — see `memory/drivebay/topics/domains-growth.md`).

## High-risk change areas

- **Doc-path mismatch under this wrapper's layout**: `README.md`'s links
  (`../docs/api/INDEX.md`, `../docs/flutter/dart-models.md`) assume drivebay-flutter is
  cloned *nested inside* the Laravel repo (its own README says "gitignored by the parent
  Laravel repository"). Under MAIW's `apps/` layout the two are **siblings**
  (`apps/drivebay/`, `apps/drivebay-flutter/`), so those relative links 404 — the real
  docs are at `apps/drivebay/docs/api/INDEX.md` etc. Don't "fix" the relative links in
  this repo without checking whether the original deployment nests it differently;
  just remember to resolve them against `apps/drivebay/docs/` when working here.
- Any API contract change must be cross-checked against `apps/drivebay/docs/api/` and,
  per drivebay's own memory, against actual route files — `docs/api/v1/openapi.json` is
  known-stale there (see `memory/drivebay/topics/api-and-database.md`).

