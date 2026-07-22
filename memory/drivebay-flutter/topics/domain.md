# drivebay-flutter — Domain

Mobile client for the same DriveBay marketplace described in
`memory/drivebay/topics/domain.md` — buyers/sellers on a phone instead of web. Read that
file for the underlying business rules (listing lifecycle, dealer storefronts, etc.);
this note only covers what's mobile-specific.

## Purpose and users

- Buyers: search/filter listings, favorite, message sellers, book viewings, get push
  notifications. Sellers: manage their own listings, respond to messages, viewing
  requests (`lib/features/seller/`, `lib/features/viewings/`).
- `README.md` "Phase 1 scope": health check + auth, taxonomy filters, search UI with
  pagination — i.e. the app was bootstrapped incrementally; later `lib/features/*`
  folders (moderation, engagement, tools) came after that initial phase-1 scope note was
  written and the doc wasn't updated — treat the README's scope list as historical, not
  current feature coverage.

## Terms and entities

- `lib/core/experiments/` + `ab_subject_interceptor.dart` — client-side plumbing for the
  Laravel `Experiment`/Pennant A-B system (`memory/drivebay/topics/domains-account.md`
  flags Pennant and `Experiment` as two unrelated systems server-side; this app only
  talks to the `GET /experiments` API, confirm which system it's actually reading before
  assuming).
- `lib/features/moderation/` — client side of user warnings/selling restrictions
  surfaced via `/account/warnings/{warning}/acknowledge` (matches
  `memory/drivebay/topics/api-and-database.md` auth.php table).

## Stable business rules

| ID | Rule | Evidence |
|---|---|---|
| FL-1 | API base URL is compile-time, not runtime-configurable in a release build | `lib/config/env.dart`, `README.md` |
| FL-2 | Auth token stored via `flutter_secure_storage`, attached by `auth_interceptor.dart` | `lib/core/api/interceptors/auth_interceptor.dart`, `lib/core/auth/` |

## Important flows

- Login → `auth_interceptor` stores/attaches bearer token → app registers FCM device
  token via `POST /api/v1/auth/device-tokens` (`docs/firebase-setup.md`).

