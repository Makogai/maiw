# drivebay-flutter — Core infrastructure deep reference (lib/core, lib/config, lib/providers, main/app entry)

Supplements `topics/architecture.md` (breadth-only) — this note is the depth pass over the
cross-cutting layer everything else (`lib/features/*`, `lib/repositories/*`) depends on.
All paths are relative to `apps/drivebay-flutter/`.

## lib/core/api/ — HTTP client, response envelope, errors

- `ApiClient` (`lib/core/api/api_client.dart:17-57`) wraps a single `Dio` instance.
  Constructed once via `apiClientProvider` (`lib/providers/providers.dart:48-57`).
  - Base URL: `Env.resolvedApiBaseUrl` (`api_client.dart:26`, see Config section).
  - Fixed timeouts: connect 15s, receive 30s (`api_client.dart:27-28`); multipart uploads
    override `sendTimeout`/`receiveTimeout` to 2 minutes by default (`api_client.dart:197-199`,
    `210-211`, `244-245`).
  - `followRedirects: true, maxRedirects: 5` (`api_client.dart:29-30`) — see gotcha below on
    307/308 handling despite this.
  - Dev cert bypass: if `Env.allowBadCertificates`, overrides `IOHttpClientAdapter.createHttpClient`
    to accept any certificate (`api_client.dart:37-46`) — dev/LAN only, never for release.
  - Interceptors are attached in one `addAll` call, **order matters** (see below):
    `LocaleInterceptor, AbSubjectInterceptor(...), AuthInterceptor(...), ErrorInterceptor()`
    (`api_client.dart:48-56`).
  - Generic verbs: `getData`/`getList`/`postData`/`putData`/`patchResource`/`postResource`
    (typed, wrap `ApiResponse<T>`), plus untyped `postMessage`/`deleteMessage`/`deletePath`
    for endpoints with no body worth decoding. `uploadMultipart`/`uploadMultipartFiles`
    build `FormData` (bool fields normalized to `'1'`/`'0'`, `api_client.dart:166-172`).
  - `mapDioError` (`api_client.dart:303-325`) is called by repositories in `catch` blocks to
    convert a raw `DioException`/other error into a typed `Exception`: if the interceptor
    chain already produced one of the `ApiException` subclasses it's unwrapped and rethrown
    as-is (`error.error is ApiException`, `api_client.dart:305-307`); a 307/308 gets a
    friendly HTTPS-hint message; anything else becomes a generic `ApiException`.
- `ApiResponse<T>` (`lib/core/api/api_response.dart`) — thin `{data, meta}` envelope matching
  the Laravel API's JSON shape; `meta` is left as a raw `Map` (not typed) except where a
  caller decodes it into `SearchMeta` (`lib/core/api/search_meta.dart`, freezed
  `{total, page, per_page}`) for paginated search endpoints.
- `lib/core/api/api_exception.dart` defines the exception hierarchy repositories/UI catch:
  `ApiException` (base, `message` + `statusCode`), `ValidationException` (422, carries
  `Map<String, List<String>> errors` + `firstError(field)`), `RateLimitException` (429),
  `UnauthorizedException` (401), `EmailVerificationRequiredException` (403 with `email`).
  `userFacingError()`/`validationError()` in `lib/features/auth/auth_notifier.dart:203-233`
  are the canonical place these get turned into UI strings.

### Interceptor order and request/response/error flow (non-obvious)

Interceptors are added in this order: **Locale → AbSubject → Auth → Error**
(`api_client.dart:48-56`). Checked against dio 5.9.2 source
(`dio_mixin.dart:464-508`, pub cache): dio runs **all three phases — `onRequest`,
`onResponse`, and `onError` — in the same FIFO order the interceptors were added**, not
reversed (`onError` handlers are chained via sequential `.catchError`, so the first-added
interceptor's `onError` runs first). Concretely, for any failed request:

1. `LocaleInterceptor.onRequest` sets `Accept-Language` from `ApiLocale.languageCode`
   (`interceptors/locale_interceptor.dart:7-9`). Backend honors it via `SetApiLocale`
   on the `api` middleware group (**Jira: KAN-103**) — before that, API payloads always
   localized as `en`.
2. `AbSubjectInterceptor.onRequest` sets `X-AB-Subject` and `X-Visitor-Id` to the same
   per-device UUID (`interceptors/ab_subject_interceptor.dart:12-20`).
3. `AuthInterceptor.onRequest` reads the bearer token and sets `Authorization: Bearer …`
   if present (`interceptors/auth_interceptor.dart:17-27`).
4. On error, **`AuthInterceptor.onError` runs before `ErrorInterceptor.onError`**: it looks
   at the *raw* HTTP status (`err.response?.statusCode == 401`), and if so calls
   `onUnauthorized()` then clears the stored token, **before** the error has been
   translated into a typed exception (`auth_interceptor.dart:30-40`).
5. `ErrorInterceptor.onError` runs last and is what actually rewrites the `DioException`'s
   `.error` into `ValidationException`/`RateLimitException`/`UnauthorizedException`/
   `EmailVerificationRequiredException`/plain `ApiException` (`interceptors/error_interceptor.dart`).

Practical implication: a 401 always triggers session teardown (see Auth section) even if
the caller never inspects the resulting `UnauthorizedException` — the side effect happens
in the interceptor chain, not in application code.

## lib/core/auth/ — token storage and session-teardown plumbing

- `TokenStorage` (`lib/core/auth/token_storage.dart`) — thin wrapper over
  `FlutterSecureStorage`, single key `sanctum_token` (`token_storage.dart:7`). No refresh
  token, no expiry tracking — it's a static Sanctum PAT that's valid until the server
  revokes it or `/auth/logout` is called. **There is no token-refresh flow anywhere in this
  app** — a 401 just clears the token and drops the user to guest state; the only way back
  is re-login.
- `AuthSessionEvents` (`lib/core/auth/auth_session_events.dart`) is a tiny mutable
  event bus (`Future<void> Function()? onUnauthorized`) — exists purely to break the
  circular dependency between `apiClientProvider` (needs to call back into auth on 401)
  and `authNotifierProvider` (needs `apiClientProvider` transitively via repositories).
  `authSessionEventsProvider` is defined in `lib/features/auth/auth_notifier.dart:195-197`
  (not in `lib/core/auth/`), and `AuthNotifier.build()` wires
  `events.onUnauthorized = handleUnauthorized` (`auth_notifier.dart:48-50`), clearing it on
  dispose (`auth_notifier.dart:50`).
  - `AuthNotifier.handleUnauthorized()` (`auth_notifier.dart:55-72`) is guarded by a
    `_handlingUnauthorized` re-entrancy flag, unregisters the FCM device token (if
    `firebaseReady`), clears favorited-listing local state, and sets `AuthState.guest()`.
- Token lifecycle write points: `AuthRepository.login`/`verifyEmail` write the token after
  a successful response (`lib/repositories/auth_repository.dart:36`, `:75`);
  `AuthRepository.restoreSession` (`auth_repository.dart:93-118`) reads the token, calls
  `GET /auth/me`, and additionally treats an unverified email
  (`user.emailVerifiedAt` null/empty) as **not logged in** — it clears the token and
  returns `null` even though the token itself was valid (`auth_repository.dart:106-111`).
  `logout()` always clears the token locally even if the `/auth/logout` call fails
  (`auth_repository.dart:120-128`).

## lib/core/deep_link/ — universal/custom-scheme links → go_router

- `DeepLinkService` (`lib/core/deep_link/deep_link_service.dart`) wraps the `app_links`
  package. `initialize()` checks `getInitialLink()` for a cold-start URI, then subscribes
  to `uriLinkStream` for links received while running (`deep_link_service.dart:18-32`).
  - Cold start: resolved target is stashed in `PendingLaunchRoute` rather than navigated
    immediately (`:44-48`) — the shell reads it later (see Navigation section).
  - Warm start: navigates immediately via `_router.go(target)` (`:50`).
  - `_resolveTarget` (`:53-70`) tries, in order: a notification-shaped route
    (`parseNotificationRouteFromUri`, from `core/navigation/notification_navigation.dart`),
    then a listing public ID (`parseListingPublicIdFromUri`), then a dealer slug
    (`parseDealerSlugFromUri`) — both from `lib/utils/listing_url.dart`. First match wins;
    unmatched URIs are silently dropped (`:69`).
  - Both custom-scheme (`Env.deepLinkScheme`, default `drivebay://`) and universal
    (`https://…/listings/{id}`, `/dealers/{slug}`) forms are supported — the parsers check
    `uri.scheme == Env.deepLinkScheme` first, else fall back to path-segment matching
    (`lib/utils/listing_url.dart:16-27`, `:31-40`).
  - Listing public IDs are extracted by taking everything before the first `-` in the
    last path segment (`listing_url.dart:55-63`), so `AB123-toyota-corolla` → `AB123`.
  - **KAN-27 (Android App Links)**: hosts `dev|qa|www|drivebay.me` are in
    `AndroidManifest.xml` (`autoVerify`) + custom scheme `drivebay://`. Server
    `public/.well-known/assetlinks.json` must list the **installed APK’s** SHA-256
    (debug keystore differs per machine; Play builds use the upload/App Signing cert —
    not debug). Without a matching fingerprint + deploy, taps fall to the
    browser/chooser even though in-app routing works via `adb` forced intents /
    `drivebay://`.

## lib/core/cache/ — keepAlive TTL + SWR (**Jira: KAN-44**)

- `keep_alive_ttl.dart` — `keepAliveWithTtl(ref, duration)` closes the keepAlive link
  after the last listener leaves for `duration`.
- `swr_cache.dart` — in-memory stale-while-revalidate for hub rails only (not live
  search). Docs: `apps/drivebay-flutter/docs/development/performance.md`.
- Images: `DrivebayNetworkImage` / `DrivebayNetworkImageFill` wrap
  `cached_network_image` + `imageCacheWidth` decode downsampling.

## lib/core/experiments/ — client side of server-driven A/B variants

- `AbSubjectService` (`lib/core/experiments/ab_subject_service.dart`) generates and caches
  (in-memory + `AppPreferencesStorage`) a random UUIDv4 "subject id" per install
  (`:11-27`, hand-rolled UUID v4 via `Random.secure()`, not a package). This is the same
  ID sent as both `X-AB-Subject` and `X-Visitor-Id` headers by `AbSubjectInterceptor`.
- `ExperimentKeys`/`ExperimentVariants` (`lib/core/experiments/experiment_keys.dart`) are
  hardcoded known experiment keys (`search_featured_display`, `search_browse_layout`) with
  an extension `variantFor`/`showsFeaturedCarousel`/`usesMarketplaceBrowseLayout` over the
  `Map<String, String>` variant map fetched from the server. Actual variants come from
  `GET /experiments` via `ExperimentRepository` → `experimentsProvider`
  (`lib/providers/providers.dart:162-164`, `:190-208`) — loaded on `AuthNotifier.bootstrap`/
  `login`/`logout` (`auth_notifier.dart:92`, `:115`, `:190`), i.e. refetched on every auth
  transition, not just once at startup. Per `topics/domain.md`, confirm server-side whether
  `/experiments` reads Pennant or the separate `Experiment` model before assuming which
  system a given key maps to.

## lib/core/firebase/ — Firebase app bootstrap (Android-only in practice)

- `FirebaseBootstrap.initialize()` (`lib/core/firebase/firebase_bootstrap.dart:18-43`) is
  called once from `main()` before `runApp` (`lib/main.dart:11`). `isSupported`
  (`firebase_bootstrap.dart:9-16`) returns true for **both** Android and iOS (and false on
  web), but `DefaultFirebaseOptions.currentPlatform`
  (`lib/firebase_options.dart:8-23`) **throws `UnsupportedError` for iOS** — only
  `android` options are defined; iOS/web branches explicitly throw with a TODO comment to
  run `flutterfire configure` and upload an APNs key. The thrown error is caught in
  `initialize()`'s try/catch (`firebase_bootstrap.dart:33-40`) and just logged, leaving
  `firebaseReady = false` — so on iOS the app boots fine but push is silently inert.
  `firebase_options.dart:26-32` holds public client config (API key restricted by Android
  package name/SHA fingerprint), matching `docs/firebase-setup.md`'s "safe to commit"
  guidance already recorded in `topics/architecture.md` — values themselves intentionally
  not repeated here.
- `firebaseReady` (`lib/core/firebase/firebase_ready.dart`) is a bare global `bool`, not a
  Riverpod provider — read directly by `app.dart`, `push_notification_service.dart`,
  `auth_notifier.dart`, and `notification_navigation.dart` to gate all push-related work.
- `PushNotificationService` (`lib/core/push/push_notification_service.dart`) adds a
  **second, independent Android-only gate** on top of `firebaseReady`: nearly every method
  (`initialize`, `syncDeviceToken`, `_messagingClient`) also checks
  `defaultTargetPlatform == TargetPlatform.android` (`push_notification_service.dart:47-48`,
  `73-75`, `121-123`) — belt-and-suspenders given the `firebase_options.dart` iOS gap above.

## lib/core/json/ — lenient JSON field coercion

- `lib/core/json/json_converters.dart` — free functions (`flexString`, `nullableString`,
  `flexInt`/`nullableInt`, `flexDouble`/`nullableDouble`, `flexBool`/`nullableBool`,
  `flexIntDefault0`) used as `@JsonKey(fromJson: ...)` converters across `lib/models/*` to
  tolerate the API sending numbers-as-strings, nulls, or locale-formatted decimals
  (`flexDouble` replaces `,` with `.` before parsing, `:63`). No file-specific gotchas
  beyond: these are the first thing to check when a model fails to decode a field that
  looks like the right type but comes back wrapped oddly (e.g. `"12"` vs `12`).

## lib/core/locale/ — mutable API language switch

- `ApiLocale.languageCode` (`lib/core/locale/api_locale.dart`) is a **mutable static
  field**, default `'en'`, read fresh on every request by `LocaleInterceptor`
  (`interceptors/locale_interceptor.dart:8`). It is written exclusively by
  `lib/features/settings/locale_notifier.dart` (4 call sites: init, apply-from-server,
  and two explicit-set paths) — there is no Riverpod indirection for the header value
  itself, just a plain static mutated from the locale feature and read by the interceptor.
  This means `Accept-Language` reflects the **app's UI locale preference**, not the OS
  locale, unless `locale_notifier.dart` seeds from the OS locale on first run (check that
  file if this matters for a task).

## lib/core/navigation/ — notification/deep-link route resolution + cold-start queue

- `lib/core/navigation/notification_navigation.dart` centralizes "what route does this
  notification/link mean" logic, shared by both `DeepLinkService` and
  `PushNotificationService`:
  - Special-cased routes: fuel-price alerts don't get a normal route push — they set
    `searchHubPageProvider` to `SearchHubPage.fuel` and navigate to `/search`
    (`openFuelPricesHub`, `:36-42`; `navigateFromNotification`/`navigateFromNotificationRoute`,
    `:44-85`), matched by either an explicit `type == 'fuel_price.updated'` or route-shape
    heuristics (`isFuelPricesNotificationRoute`, `:14-26`).
  - Message routes (`/messages/…`) use `router.go` (replace) instead of `router.push`
    (`isMessageNotificationRoute`, `:28-34`, used at `:59-61`/`:79-81`) — every other route
    uses `push` so back navigation returns to the prior screen.
  - `queueColdStartNavigationTargets(WidgetRef ref)` (`:127-144`) is called once at
    app startup (see `app.dart`/router wiring) to capture any cold-start deep link into
    `PendingLaunchRoute` *before* `PushNotificationService.initialize()` runs, then
    triggers push init if `firebaseReady`.
  - `navigateToLaunchRoute` (`:146-163`) is the consumer side: called with whatever
    `PendingLaunchRoute.consume()` returns once the router/shell is ready; defaults to
    `/search` if there's no pending route.
- `PendingLaunchRoute` (`lib/core/navigation/pending_launch_route.dart`) — bare static
  string holder (`set`/`consume`/`route`), the hand-off point between "a route was
  determined during cold start" (deep link or push tap) and "the router is now mounted
  and can navigate". `consume()` is destructive (clears after read, `:11-16`), so it must
  only be read once per app launch.

## lib/core/preferences/ — local key/value storage (secure storage, not SharedPreferences)

- `AppPreferencesStorage` (`lib/core/preferences/app_preferences_storage.dart`) — despite
  the name, this is **`flutter_secure_storage`**, the same backing store as
  `TokenStorage`, just a different provider instance (`:6-7`). Keys: theme preference,
  locale preference, search-results layout, AB subject ID, muted message-thread IDs (JSON
  array), onboarding-completed flag, and the per-user moderation key
  (`moderation_mode_enabled_<userId>`, KAN-100; the old `moderation_prompt_seen_`
  key was removed in the KAN-101 QA pass — the prompt now fires on every login).
  Muted thread IDs are the one structured value —
  encoded as a JSON array string via `jsonEncode`/`jsonDecode`
  (`app_preferences_storage.dart:40-67`); everything else is a plain string.
- No dependency on `core/auth/` — a separate `AppPreferencesStorage()` instance is
  constructed by `appPreferencesStorageProvider`
  (`lib/providers/providers.dart:39-40`), independent of `tokenStorageProvider`, even
  though both wrap the same underlying `FlutterSecureStorage` default instance.

## lib/core/push/ — FCM registration, foreground/background handling, inbox refresh

- `PushNotificationService` (`lib/core/push/push_notification_service.dart`) is the FCM
  wrapper; see the Firebase section above for its Android-only gating. Key behaviors:
  - `initialize()` (`:68-113`) registers the background handler exactly once
    (`_backgroundHandlerRegistered` module-level flag, `:17`, `:83-86`), requests
    notification permission, and subscribes to `onTokenRefresh` (forces a re-sync,
    `:96-98`), `onMessage` (foreground), and `onMessageOpenedApp` (tap-to-open).
  - `syncDeviceToken({userId, force})` (`:120-167`) is idempotent by default: skips the
    `POST /auth/device-tokens` call if the FCM token and `userId` are unchanged from the
    last successful registration (`:145-150`), unless `force: true`. Registration is
    skipped entirely if there's no stored auth token yet (`:127-130`) — push registration
    always follows login, never precedes it.
  - `unregisterDeviceToken()` (`:169-206`) best-effort `DELETE /auth/device-tokens` (swallows
    failure — "Token may already be invalid during logout", `:190-193`) then always clears
    the local FCM token and the in-memory registration cache in a `finally` (`:203-205`).
  - `_handleOpenedMessage` (`:215-230`) — if this is a cold-start open (`isColdStart: true`,
    i.e. `getInitialMessage()` returned non-null at `:103-106`), the route is stashed in
    `PendingLaunchRoute` instead of navigated immediately, same pattern as `DeepLinkService`.
  - `onNavigate`/`onInboxChanged` are plain callback fields (not streams/providers) wired
    up by `app.dart` (`_initializePushNotifications`, `app.dart:109-143`) after the
    provider is constructed — `onNavigate` calls
    `navigateFromNotificationRoute`, `onInboxChanged` calls
    `refreshMessagesFromPush` (`lib/core/push/message_push_sync.dart`).
- `message_push_sync.dart` — `refreshMessagesFromPush` (`:13-31`) invalidates/refreshes the
  message-thread list, unread counts, and a specific thread's provider when a message
  notification arrives; other notification types just surface an in-app banner via
  `inAppNotificationPresenterProvider.showFromPush` (`:33-44`).
  - **KAN-35 shipped behavior (app HEAD `f49e7b0`)**:
    `_routeFromMessage` also maps `type == 'viewing.rescheduled'` to `/account/viewings`, matching
    the existing `viewing.booked` / `viewing.cancelled` / `viewing.reminder` behavior.

## lib/config/ — environment and seed data

- `Env` (`lib/config/env.dart`) — all `--dart-define` compile-time constants, no runtime
  override path exists (confirms `topics/domain.md` FL-1):
  - `apiBaseUrl` / `API_BASE_URL`, default `http://192.168.1.226:8000/api/v1` (LAN php -S;
    was historically `dev.drivebay.me` / `drivebay.test` in older notes).
  - `resolvedApiBaseUrl` force-upgrades `http://` to `https://` **unless** the host is
    `localhost`/`127.0.0.1`, ends in `.test`/`.local`, or is a private LAN IP
    (`_isPrivateLanHost`). This is what `ApiClient`'s `baseUrl` uses.
  - `isLocalDevApi` — true for those local/LAN hosts.
  - `debugApi` / `DEBUG_API` + `debugApiDefineSet` — when define unset, `ApiClient.debugApiEnabled`
    auto-enables in `kDebugMode` for local/LAN; when set, the define wins.
  - `DebugApiInterceptor` (`lib/core/api/interceptors/debug_api_interceptor.dart`) logs
    `[DriveBayAPI]` method/path/status/ms/errors; no tokens/bodies. Startup banner in `main.dart`.
  - `webBaseUrl` strips a trailing `/api/v1` suffix from `resolvedApiBaseUrl`.
  - `acceptLanguage` / `ACCEPT_LANGUAGE` (default `'en'`) — **appears unused as a header
    value**; the actual `Accept-Language` header comes from `ApiLocale.languageCode`.
  - `allowBadCertificates` / `ALLOW_BAD_CERTIFICATES` (default `false`) — dev-only TLS
    bypass, see API client section.
  - `deepLinkScheme` / `DEEP_LINK_SCHEME`, default `'drivebay'` — used by
    `notification_navigation.dart` and `listing_url.dart` to recognize custom-scheme URIs.
  - `googleServerClientId` / `GOOGLE_SERVER_CLIENT_ID` (default `''`) — Web OAuth
    client ID so `google_sign_in` can return an `id_token` for
    `POST /auth/social/google`. See `docs/social-login.md`.
- `lib/config/seed_geography.dart` — hardcoded placeholder country/city list (Croatia;
  Zagreb/Split) tied to a specific `composer run docker:fresh` seed, explicitly marked
  `TODO: replace when geography API ships` (`:1-3`). Treat any ID from here as
  seed-environment-only, not a stable production value.

## lib/providers/providers.dart — central Riverpod registry and dependency graph

All app-wide singletons and repositories are wired here (249 lines); feature-local state
(notifiers like `AuthNotifier`, `LocaleNotifier`) lives in `lib/features/*` instead and is
cross-referenced into this graph (e.g. `authSessionEventsProvider`,
`authNotifierProvider` from `lib/features/auth/auth_notifier.dart`).

Dependency order (leaves → roots), all plain `Provider`s unless noted:

```
tokenStorageProvider            (providers.dart:37, no deps)
appPreferencesStorageProvider   (:39-40, no deps)
  └─ abSubjectServiceProvider   (:42-46)
authSessionEventsProvider        (features/auth/auth_notifier.dart:195-197, no deps)
tokenStorageProvider + authSessionEventsProvider + abSubjectServiceProvider
  └─ apiClientProvider          (providers.dart:48-57)
       ├─ authRepositoryProvider          (:59-64, + tokenStorageProvider)
       ├─ pushNotificationServiceProvider (:66-71, + tokenStorageProvider)
       └─ ~20 other *RepositoryProvider   (:73-164, 218-220) — each just
            `Repository(apiClient: ref.watch(apiClientProvider))`
```

- Every repository provider follows the identical one-line pattern
  `Provider<XRepository>((ref) => XRepository(apiClient: ref.watch(apiClientProvider)))` —
  when adding a new repository, copy this pattern; there is no factory/registration helper.
- `appPlatformConfigProvider` (`:185-188`) is a `NotifierProvider` (mutable, `load()` called
  from `main.dart:15`, `app.dart:70`, and every auth transition in `auth_notifier.dart`) —
  distinct from `appConfigProvider` (`:94-98`), a `keepAlive` `FutureProvider` fetched via
  the **same** `PlatformConfigRepository` but a different endpoint/model
  (`AppConfig` vs `AppPlatformConfig` — check `lib/repositories/platform_config_repository.dart`
  before assuming these two overlap in content).
- `experimentsProvider` (`:205-208`) is a `NotifierProvider<Map<String,String>>`; the two
  derived booleans `showFeaturedCarouselProvider`/`useMarketplaceBrowseLayoutProvider`
  (`:210-216`) are plain `Provider`s that just call the `ExperimentVariantMap` extension —
  cheap to add more derived flags the same way instead of re-parsing variants ad hoc.
  `experimentsProvider.notifier.load()` is invoked from `AuthNotifier.bootstrap/login/
  verifyEmail/logout` (see Experiments section) — **not** from `main.dart`, so on cold
  start with no session, experiment variants stay `{}` until the first auth event.
  `appConfigProvider`/`appPlatformConfigProvider` are the exception — they *do* load at
  `main.dart:15` regardless of auth state.
- A handful of screen-specific `FutureProvider`s live at the bottom of this file
  (`featuredListingsProvider`, `listingDetailProvider`, `similarListingsProvider`,
  `buyerViewingsProvider`, `sellerViewingsProvider`, `accountProvider`, `:222-249`) rather
  than in a feature file — no strong convention for where these belong; check both places.

## lib/main.dart / lib/app.dart — startup sequence

1. `WidgetsFlutterBinding.ensureInitialized()` → `FirebaseBootstrap.initialize()` →
   construct a bare `ProviderContainer()` → `await
   container.read(appPlatformConfigProvider.notifier).load()` **before** `runApp`
   (`lib/main.dart:8-23`) — platform config is available synchronously to the first frame,
   unlike `experimentsProvider` (loaded later, only on auth events).
2. `DriveBayApp` (`lib/app.dart`) is a `ConsumerStatefulWidget`. In `initState`
   (`:34-74`): sets up a manual listener on `authNotifierProvider` that syncs/clears the
   FCM device token on auth transitions (`:39-66` — this is a **second** device-token sync
   path independent of the one inside `AuthNotifier.login`/`bootstrap` itself; both exist
   because `AuthNotifier`'s own calls only cover explicit login/register/verify flows,
   while this listener also catches any other path that flips `AuthStatus`), then in a
   post-frame callback loads platform config again, initializes push, and initializes deep
   links (`:69-73`).
3. `_initializeDeepLinks` (`:76-80`) constructs `DeepLinkService` from
   `ref.read(appRouterProvider)` — i.e. deep links are wired **after** the router exists,
   confirming `app_router.dart` (in `lib/features/shell/`) must be read for the full
   route table if a task needs it (out of scope for this note). Pushed routes use
   `CupertinoPage` so edge swipe-from-left goes back (iOS-style) on all platforms.
4. `didChangeAppLifecycleState` (`:90-107`) forces a device-token re-sync on app resume if
   already authenticated — belt-and-suspenders against a stale FCM token after backgrounding.
5. `build()` wraps `MaterialApp.router` with `EngagementHost` →
   `InAppNotificationHost` → `ModerationHost` → `ModerationModePromptHost` (KAN-100) →
   `CompareStripHost` — any new app-wide overlay/host widget should slot into this
   chain in the same place.

## lib/theme/ (brief)

- `DriveBayPalette` (`lib/theme/drivebay_palette.dart`) — plain data class with `light`/
  `dark` const instances (colors, borders, ink/accent tones).
- `DriveBayThemeExtension` (`lib/theme/drivebay_theme_extension.dart`) wraps a palette as a
  `ThemeExtension` for `Theme.of(context).extension<...>()` lookup.
- `AppColors` (`lib/theme/app_colors.dart`) — static-getter facade over the current
  palette; prefer `AppColors.of(context)` (theme-aware) over the legacy static getters
  (`page`, `ink`, `accent`, etc.), which rely on `AppColors.sync(brightness)` being called
  every build (`app.dart:161`) and can be stale outside a widget tree.
- `AppTheme` (`lib/theme/app_theme.dart`, 150 lines) builds `ThemeData` for `light()`/`dark()`,
  attaching the corresponding `DriveBayThemeExtension`. Not inventoried further — low
  priority per task scope.
