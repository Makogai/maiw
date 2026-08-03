# drivebay-flutter — Memory index

Read only the notes needed for the current task. This app is the mobile client for
`apps/drivebay` (see `memory/drivebay/`) — business rules live there; this memory covers
only the Flutter-specific layer (state/nav/API-client wiring, mobile UX flows).

| Need | Read | Freshness |
|---|---|---|
| Resume current work | `NOW.md` | current session handoff (2026-08-03, social login uncommitted on feature/social-login @ 7a85f48) |
| Architecture/boundaries | `topics/architecture.md` | partial (breadth only) |
| Business behavior | `topics/domain.md`, then `memory/drivebay/topics/domain.md` | partial |
| Local coding/testing patterns | `topics/conventions.md` | partial |
| API client/auth/push/nav/providers wiring | `topics/core-infra.md` | current (deep dive) |
| Why a choice was made | `topics/decisions.md` | empty |

## Change recipes

- Add/change a screen → `lib/features/{name}/`.
- Add/change an API call → `lib/core/api/` client + matching `lib/repositories/`; verify
  the endpoint against `memory/drivebay/topics/api-and-database.md` (not
  `docs/api/v1/openapi.json`, which is known-stale) before assuming a contract.
- Regenerate models after editing a `freezed`/`json_serializable` class →
  `dart run build_runner build --delete-conflicting-outputs`.

## Detailed subsystem notes

- `topics/features-discovery.md` — deep dive on buyer-facing discovery:
  `lib/features/{listings,search,favorites,sellers,viewings}/`. Screens, Riverpod
  providers, repository/endpoint mapping, pagination, sort-option cross-check against
  backend `SearchService`, and non-obvious gotchas (favorites are not optimistic, no
  favorite button in search results, two parallel favorite-state sources, seller-profile
  dealer redirect happens in place without a route change).
- `topics/repositories-and-models.md` — deep dive on the API-consumption layer: all 23
  `lib/repositories/*.dart` files mapped to backend endpoints (method + `path:line`,
  verified directly against `apps/drivebay/routes/api/v1/*.php`), all ~43 `lib/models/*.dart`
  grouped by purpose/consumer, and a contract-gaps list (backend routes with zero mobile
  callers: saved-searches, model-groups, compare, recent-listings, VIN decode, seller
  analytics, dealer storefront/domain management, most analytics events besides `view`).
- `topics/features-account-and-comms.md` — deep dive on account/safety/comms:
  `lib/features/{auth,profile,settings,onboarding,moderation,notifications,messages}/`.
  Screens, Riverpod providers, repository/endpoint mapping, push-tap-to-screen
  navigation trace, and a confirmed cross-check that the mobile client only ever reads
  the domain `Notification` model (never Filament's `database_notifications`). Gotchas:
  push is Android-only, `restoreSession` treats any `/auth/me` error as logout, unused
  `DeviceTokenRepository`, message mute has a silent local-only fallback.
- `topics/core-infra.md` — deep dive on `lib/core/*`, `lib/config/`, `lib/providers/providers.dart`
  (the full provider dependency graph), `main.dart`/`app.dart` startup sequence, and
  `lib/theme/` (brief). Covers dio interceptor order and request/error flow (confirmed
  against dio 5.9.2 source — `onError` runs in the *same* FIFO order as `onRequest`, not
  reversed), the auth token lifecycle (no refresh flow — 401 just clears the token),
  `--dart-define` precedence in `Env`, and the iOS-push-is-inert gap
  (`firebase_options.dart` has no iOS `FirebaseOptions`).
- `topics/features-seller-growth-and-platform.md` — deep dive on
  `lib/features/{seller,engagement,tools,shell}/`, shared `lib/widgets/`+`lib/utils/`,
  and a brief platform/test-inventory check (android/ios/web/windows/linux/macos, `test/`).
  Confirms the mobile client mirrors the backend's Engagement-popup-hijacked-by-
  moderation-warning behavior exactly, plus finds a *second*, independent
  `ModerationHost` path to the same warning dialog; confirms Autodiler import UI matches
  `seller.php` routes; confirms Firebase iOS is explicitly unsupported (throws, no
  `GoogleService-Info.plist`); notes no seller-analytics screen exists; test suite is 6
  files of pure unit tests only (no feature/widget coverage).

All 21 `lib/` areas now have either a deep-dive note (core infra, repositories/models,
discovery, account/comms, seller/growth/platform) or are covered breadth-only in
`topics/architecture.md`/`domain.md`/`conventions.md`. Read the specific topic file for
your task instead of re-exploring `lib/` from scratch.

