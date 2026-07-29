# drivebay-flutter — Account, safety & messaging features deep reference (auth, profile, settings, onboarding, moderation, notifications, messages)

Supplements `topics/architecture.md` and `topics/domain.md` (read those first for
system shape) rather than repeating them. Cross-checked against backend memory
`memory/drivebay/topics/domains-account.md` (User/Messaging domains) and
`memory/drivebay/topics/domains-growth.md` (Notification domain, the "two notification
systems" gotcha). All paths below are relative to `apps/drivebay-flutter/` unless noted
otherwise (backend paths are relative to `apps/drivebay/`).

## Cross-domain confirmation (read this first)

- **Two-notification-systems risk: ruled out.** Backend memory flags that
  `App\Models\Domains\Notification\Models\Notification` (table `notifications`) and
  Laravel's own `database_notifications` (Filament admin bell only) must not be
  conflated. Confirmed the mobile client's `/notifications` endpoints
  (`lib/repositories/notification_repository.dart:9-56`) are served by
  `NotificationApiController`, which queries the domain `Notification` model exclusively
  (`apps/drivebay/app/Http/Controllers/Api/V1/NotificationApiController.php:7,20,30,44,60`
  — filtered by `channel = 'in_app'`). The mobile app never touches
  `database_notifications`/`EloquentDatabaseNotification`. No confusion on this side.
- **Moderation surfaces the right models.** `AccountPayload.warnings` /
  `.sellingRestrictions` (`lib/models/account.dart:72-73`) are populated from
  `GET /account` and deserialize into `UserWarning`/`AccountSellingRestriction`
  (`lib/models/user_warning.dart:3,44`) — matches domains-account.md's description of
  the Filament `UserWarnings`/`UserSellingRestrictions` relation managers on the same
  underlying tables. The acknowledge endpoint
  (`lib/repositories/account_repository.dart:23-31`, `POST
  /account/warnings/{uuid}/acknowledge`) matches the route already recorded in
  `memory/drivebay/topics/api-and-database.md`.
- **Push is Android-only in this build.** Every gate in `PushNotificationService`
  (`_messagingClient`, `initialize`, `syncDeviceToken`) short-circuits unless
  `defaultTargetPlatform == TargetPlatform.android`
  (`lib/core/push/push_notification_service.dart:48,73,123`) — iOS never initializes
  FCM or registers a device token in this codebase, despite `lib/repositories/
  device_token_repository.dart` supporting an `'ios'` platform string. Treat push as
  Android-only until that gate is intentionally relaxed.

## auth/ (`lib/features/auth/`)

Screens: `LoginScreen`, `RegisterScreen` (multi-step wizard), `VerifyEmailScreen`. No
separate "forgot password" screen exists in this folder.

| Concern | Evidence |
|---|---|
| State | `AuthNotifier` (`Notifier<AuthState>`), global `authNotifierProvider` — `lib/features/auth/auth_notifier.dart:43,199` |
| `AuthState` fields | `status` (`unknown`/`guest`/`authenticated`), `user`, `warningStatus`, `sellingRestriction` — populated straight from the login/verify/bootstrap `SessionUser` response, not from a separate call — `auth_notifier.dart:16-41` |
| Repository | `AuthRepository` — `login`, `register`, `verifyEmail`, `resendVerificationEmail`, `forgotPassword`, `resetPassword`, `restoreSession`, `logout` — `lib/repositories/auth_repository.dart` (**Jira: KAN-56**) |
| Token storage | `TokenStorage` wraps `flutter_secure_storage`, single key `sanctum_token` — `lib/core/auth/token_storage.dart:3-17` |

**Login flow**: `LoginScreen._submit` → `authNotifierProvider.login()` →
`AuthRepository.login()` posts `/auth/login`, stores the Sanctum token, then the
notifier invalidates `accountProvider`, loads favorites, syncs preferred language, and —
only if `firebaseReady` — calls `pushNotificationServiceProvider.syncDeviceToken()`
(`auth_notifier.dart:96-117`). **Device-token registration happens after** every
successful login/verify/bootstrap, never before — there is no anonymous/pre-auth device
token registration path. Login links to `/forgot-password`; forgot/reset screens live
under `lib/features/auth/`; change password is `/account/change-password` via
`AccountRepository.changePassword` → `PUT /account/password` (**Jira: KAN-56**). Deep
links: web `/reset-password` and `drivebay://reset-password`
(`parsePasswordResetRouteFromUri` in `listing_url.dart`).

**Email verification requirement**: `AuthRepository.restoreSession()` clears the stored
token and returns `null` if `emailVerifiedAt` is null/empty
(`auth_repository.dart:107-111`) — an unverified account is treated identically to "no
session" on app relaunch, even though the token itself is still valid server-side.
Login redirects to `/verify-email?email=...` when the server throws
`EmailVerificationRequiredException` (`login_screen.dart:60-66`).

**Gotcha — `restoreSession` swallows all errors as "log out"** (**Jira: KAN-18**). Any exception from
`GET /auth/me` (network failure, 500, timeout — not just 401) clears the token and
returns `null` (`auth_repository.dart:113-117`), so a transient network blip on cold
start silently signs the user out client-side (server-side Sanctum token is untouched
per `config/sanctum.php expiration => null`, so the *next* successful login re-attaches
the same account, but the user is unexpectedly bounced to guest state on that launch).

**Registration**: `RegisterScreen` is a 4-step wizard whose step list depends on
`_accountType` (`'individual'` vs `'dealer'`) — `register_screen.dart:33,58-60`. Payload
sent to `POST /auth/register` includes `account_type`, and conditionally
`first_name`/`last_name` (individual) or `dealer_name` (dealer)
(`register_screen.dart:262-284`) — matches `UserRegistrationService::createDealerAccount()`
gating on `account_type === 'dealer'` per `memory/drivebay/topics/domains-account.md`.
Geography (`country_id`/`city_id`/`region_id`) is loaded via `geographyRepositoryProvider`
before the address step (`register_screen.dart:162-163`). On success, navigates to
`/verify-email?email=...&length=...` (`register_screen.dart:290-292`), never straight to
an authenticated state — registration alone does not log the user in.

**Verify-email**: 6-digit code UI (`VerifyEmailScreen`, `codeLength` param, default 6) —
`verify_email_screen.dart:19`. Submitting calls the same `authNotifierProvider.verifyEmail`
plumbing as login (token storage, favorites, locale sync, device-token sync, experiments/
platform-config reload) — `auth_notifier.dart:123-144`.

**Logout**: unregisters the FCM device token first (if `firebaseReady`), then calls
`POST /auth/logout`, clears favorites and local state, and reloads experiments/platform
config for the now-guest session — `auth_notifier.dart:183-192`.

## profile/ (`lib/features/profile/`)

Screens: `ProfileScreen` (hub), `EditProfileScreen` (name fields — **Jira: KAN-61**),
`ContactSettingsScreen` (phone/WhatsApp/Viber/Instagram), `ChangePasswordScreen`.

- `ProfileScreen` reads `authNotifierProvider` for identity/selling-restriction and
  `accountProvider` (async) for warnings/selling-restrictions to feed
  `AccountModerationSections` — `lib/features/profile/profile_screen.dart:18,71,77-79`.
- Guest state shows a sign-in prompt but still exposes the Settings card
  (`profile_screen.dart:20-65`) — Settings is reachable without auth.
- "Create listing" is blocked client-side when `auth.sellingRestriction?.active`, showing
  a snackbar with the restriction's `reason` (falls back to a generic string) instead of
  navigating — `profile_screen.dart:258-271`. This mirrors — but does not re-fetch — the
  session-level `sellingRestriction` set at login/bootstrap; if a restriction is applied
  *while the app is running*, the gate won't reflect it until `refreshSession()` runs
  (see moderation section).
- `EditProfileScreen` (`/account/edit-profile`) PATCHes `first_name` / `last_name` /
  `display_name`, invalidates `accountProvider`, and `refreshSession()` so hub names
  update without restart — `edit_profile_screen.dart`.
- `ContactSettingsScreen` round-trips phone / Instagram / WhatsApp / Viber via the same
  `updateProfile` (`contact_settings_screen.dart:45,75-83`). Fields: `phone`,
  `instagram_username`, `show_phone_publicly`, `contact_whatsapp_enabled`,
  `contact_viber_enabled` (`contact_settings_screen.dart:76-80`).

## settings/ (`lib/features/settings/`)

Pure local-preference screen — no network calls except an opportunistic server sync for
authenticated users.

| Notifier | Provider | Persistence |
|---|---|---|
| `ThemeModeNotifier` | `themeModeProvider` | `appPreferencesStorageProvider` (local only, never synced to server) — `lib/features/settings/theme_mode_notifier.dart:53,79` |
| `LocaleNotifier` | `localeProvider` | Local storage + `PATCH /account/locale` **only if authenticated** — `lib/features/settings/locale_notifier.dart:76-91` |

`LocaleNotifier.setPreference` silently swallows the server-update failure (`catch (_)
{}` — `locale_notifier.dart:89`), so a locale change can succeed locally while failing
to persist server-side with no user-visible error. `AuthNotifier._syncPreferredLanguage`
(`auth_notifier.dart:161-181`) is the reconciliation path run at every
login/verify/bootstrap: prefers the locally-stored preference, pushes it to the server
via `accountRepositoryProvider.updateLocale` if they differ, else pulls the server value
down via `applyFromServer`.

## onboarding/ (`lib/features/onboarding/`)

Single screen, `OnboardingScreen` — a 6-page swipeable illustrated walkthrough
(`_pageCount = 6`, `onboarding_screen.dart:34`) built entirely from static `_Preview*`
widgets (`_SearchPreview`, `_HubTabsPreview`, `_FavoritesPreview`, `_MessagesPreview`,
`_AlertsPreview`, `_AccountPreview`, `_AddListingPreview` — mock UI, no real data).

- Shown only when `readOnboardingCompleted()` is false, decided in
  `BootstrapScreen._bootstrap` (`lib/features/shell/bootstrap_screen.dart:58-77`), which
  also forwards any pending push/deep-link route as a `?redirect=` query param so
  onboarding doesn't swallow a cold-start notification tap.
- `_finish()` marks onboarding complete (`appPreferencesStorageProvider
  .writeOnboardingCompleted(true)`) then either honors `widget.redirectPath` via
  `navigateFromNotification()` or falls back to `/search` — `onboarding_screen.dart:48-73`.
- No auth is required or performed here; it reads `authNotifierProvider` only for a
  preview widget context, not for gating (`onboarding_screen.dart:140`).

## moderation/ (`lib/features/moderation/` + `widgets/`)

Client side of `UserWarning`/`AccountSellingRestriction` (warnings + selling
restrictions), plus a generic listing/thread report-submission sheet. No dedicated
screen route — surfaces are a host widget + banners + dialogs layered over the rest of
the app.

| File | Role |
|---|---|
| `moderation_host.dart` | `ModerationHost` — wraps the whole app (`app.dart:165`); on auth becoming authenticated with `warningStatus.hasPendingPopup`, fetches `GET /account`, finds the first `isPending` warning, and shows a **blocking, non-dismissible** `UserWarningAcknowledgeDialog` — `lib/features/moderation/moderation_host.dart:28-90,94-107` |
| `moderation_overview.dart` | Pure functions resolving severity/restriction/banner-visibility from either the session (`AuthState`) or a freshly-fetched `AccountPayload`, session taking priority — `moderation_overview.dart:47-86` |
| `moderation_messages.dart` | `sellingRestrictionBannerMessage()` — picks indefinite/ends-today/timed/default copy | `moderation_messages.dart:4-28` |
| `widgets/account_moderation_sections.dart` | `AccountModerationSections` — full warning/restriction list rendered on `ProfileScreen` | `widgets/account_moderation_sections.dart:9-53` |
| `widgets/moderation_banner_stack.dart` | `ModerationBannerStack` — compact banner(s) shown elsewhere (e.g. shell/hub), reads `accountProvider` + session state the same way | `widgets/moderation_banner_stack.dart:12-45` |
| `widgets/user_warning_banner.dart`, `widgets/selling_restriction_banner.dart` | Tappable banners, default `onTap` is `context.go('/account')` | `user_warning_banner.dart:26`, `selling_restriction_banner.dart:32` |
| `widgets/user_warning_acknowledge_dialog.dart` | Forces a 5-second cooldown (`cooldownSeconds` default) before the acknowledge button is enabled — `user_warning_acknowledge_dialog.dart:35,64-67` |
| `report_submission_sheet.dart` + `report_types.dart` | Generic bottom sheet for both listing and thread reports; fixed type list `kReportTypeIds = [wrong_info, fraud, duplicate, stolen_vehicle, spam, abuse]` — `report_types.dart:1-8` |

**Acknowledge flow**: dialog's `onAcknowledge` calls `accountRepositoryProvider
.acknowledgeWarning(uuid)` (`POST /account/warnings/{uuid}/acknowledge`), then
`authNotifierProvider.notifier.refreshSession()` (re-fetches `/auth/me` to refresh
`warningStatus`/`sellingRestriction` in session state) and invalidates `accountProvider`
— `moderation_host.dart:72-78`. If the dialog is dismissed without acknowledging
(`acknowledged != true`), `_shownWarningUuid` is reset so it will be shown again on the
next trigger (auth state change or next `ModerationHost` mount) — `moderation_host.dart:82-84`.

**Report submission repository**: `ReportRepository.reportListing()` (`POST
/listings/{publicId}/report`) and `.reportThread()` (`POST
/messages/threads/{threadId}/report`) — `lib/repositories/report_repository.dart:9-31`.
Both routes are outside the domains-account.md Messaging service list (no
`MessageThread` report-related class documented there) — likely a separate
Moderation-domain endpoint; not verified against backend code in this pass, flag as
inference if precision matters.

## notifications/ (`lib/features/notifications/`)

In-app inbox (bell icon target) + a custom foreground "toast" banner system, separate
from native OS push banners.

| File | Role |
|---|---|
| `notification_inbox_notifier.dart` | `NotificationInboxNotifier` (`AutoDisposeAsyncNotifier`) — loads `GET /notifications` (grouped) via `notificationRepositoryProvider.getInbox()`; `refresh(silent:)` keeps stale data on transient errors when silent — `notification_inbox_notifier.dart:14-46` |
| `notification_unread_count_notifier.dart` | `NotificationUnreadCountNotifier` — polls `GET /notifications/unread-count` every 20s while authenticated, shows an in-app banner via `InAppNotificationPresenter` when the count *increases*, skips the very first post-login refresh (`_skipNextAlert`) so login doesn't immediately toast old unread items — `notification_unread_count_notifier.dart:23-46,65,93-100` |
| `in_app_notification_presenter.dart` | `InAppNotificationPresenter` — dedupes by notification id (or a title/body hash for push-originated banners with no server id) via `_shownIds`; `showFromPush()` builds a synthetic `AppNotification` straight from FCM payload fields for the foreground toast, without waiting for the next poll — `in_app_notification_presenter.dart:16-50` |
| `in_app_notification_host.dart` | `InAppNotificationHost` — renders the actual overlay banner (5s auto-dismiss), wraps whole app (`app.dart:164`); tapping it resolves `mobileRoute` via `navigateFromNotificationRoute`, falling back to `/notifications` if no route — `in_app_notification_host.dart:113-133` |
| `notifications_screen.dart` | `NotificationsScreen` — guest gate, mark-read/mark-all-read, groups list; also opportunistically re-syncs the FCM device token on mount if authenticated (`_syncDeviceToken`, best-effort/no-op on failure) — `notifications_screen.dart:35-52` |
| `notification_type_image.dart` | Maps `type` string → themed asset path (`assets/notifications/{light,dark}/{filename}.webp`), with an explicit alias table for legacy/alternate type strings (`listing.processing` → `listing.processing_failed`, `price_drop` → `saved_search.match`, etc.) — `notification_type_image.dart:4-37` |

**Repository**: `NotificationRepository` — `getInbox`, `getUnreadCount`,
`getLatestUnread`, `markRead(id)`, `markAllRead` — `lib/repositories/
notification_repository.dart:9-79`. All confirmed to hit the domain `Notification`
model per the cross-domain section above.

**Known notification `type` values** (from the asset map, i.e. what the client is
prepared to render distinctly): `fuel_price.updated`, `import.autodiler.completed`,
`listing.auto_publish_blocked`, `listing.auto_publish_success`,
`listing.photo_rejected`, `listing.processing_failed`, `message.received`,
`saved_search.match`, `user.selling_restricted`, `user.warning` — matches the type
surface implied by `SellerNotificationPresenter` on the backend
(`memory/drivebay/topics/domains-growth.md`).

**KAN-23 clarification on shipped app HEAD `586f818`**: mobile saved-search CRUD is already
present (`saved_search_repository.dart`, `save_search_dialog.dart`, `saved_searches_screen.dart`,
profile route, and search-screen save button; originally shipped in `c74fbe6`). The follow-up fix
in this session is push routing: `saved_search.match` now has a Flutter-side fallback route to
`/account/saved-searches` even if an older FCM payload arrives without `mobile_route`.

## Push notification tap → in-feature navigation (cross-cutting)

Full push plumbing lives in `lib/core/push/` (out of scope here per the task, already
covered elsewhere) — this section only traces how a tap reaches a feature screen.

1. **Routing decision**: `lib/core/navigation/notification_navigation.dart` is the
   single place that turns a `mobile_route`/`type` pair into a `go_router` navigation
   call. `isMessageNotificationRoute()` matches `type == 'message.received'` or any
   route starting with `/messages/` and uses `router.go()` (replaces stack, since a
   message reply from a fresh push shouldn't stack under whatever screen was open) —
   `notification_navigation.dart:28-34,79-82`. Fuel-price notifications are special-cased
   to switch the search hub's internal tab (`SearchHubPage.fuel`) rather than push a
   route — `notification_navigation.dart:36-42,73-77`.
2. **Route derivation from the raw FCM payload**: `PushNotificationService
   ._routeFromMessage()` prefers an explicit `data['mobile_route']`, else falls back to
   `/listings/{public_id}` for listing-shaped payloads, `/messages/{thread_uuid}` for
   `type == 'message.received'`, `/account/viewings` for viewing events,
   `/account/saved-searches` for `saved_search.match`,
   `/account` for warning/selling-restriction events, or the fuel-prices route —
   `push_notification_service.dart:232-266`. So a message push works even if the server
   payload omits `mobile_route`, as long as `thread_uuid`/`thread_id` is present.
3. **Foreground tap** (`FirebaseMessaging.onMessageOpenedApp`) → `_handleOpenedMessage`
   → `PushNotificationService.onNavigate` callback (wired in `app.dart:118-125`) →
   `navigateFromNotificationRoute` → `router.go('/messages/{id}')`.
4. **Cold start**: `_handleOpenedMessage(isColdStart: true)` stores the route in
   `PendingLaunchRoute` instead of navigating immediately
   (`push_notification_service.dart:223-227`) — `BootstrapScreen` later calls
   `PendingLaunchRoute.consume()` and `navigateToLaunchRoute()` once auth
   bootstrap/onboarding-check finish (`bootstrap_screen.dart:49-83`).
5. **Data refresh alongside navigation**: `lib/core/push/message_push_sync.dart
   .refreshMessagesFromPush()` (wired via `pushService.onInboxChanged` in
   `app.dart:126-128`) always refreshes the unread-count badge; if the payload is
   message-shaped it also invalidates `messageThreadsProvider` and the specific
   `messageThreadProvider(threadUuid)` so the thread screen shows the new message
   without waiting for its own 2s poll — `message_push_sync.dart:13-31`.

**Gotcha — device-token registration timing**: `AuthNotifier.bootstrap()` calls
`pushNotificationServiceProvider.syncDeviceToken()` (which internally calls
`initialize()` first) *before* `BootstrapScreen` explicitly calls
`queueColdStartNavigationTargets()` → `initialize()` again
(`bootstrap_screen.dart:49,51` vs `auth_notifier.dart:86-90`). The second `initialize()`
call is a no-op due to the `_initialized` guard
(`push_notification_service.dart:69`), so FCM's `getInitialMessage()` (which seeds
`PendingLaunchRoute` for cold-start pushes) is actually consumed during the *first*
`initialize()` call triggered by `syncDeviceToken` when a session exists — the ordering
is correct but non-obvious; don't assume `queueColdStartNavigationTargets` is what
"really" initializes push on a warm relaunch with a stored session.

**Gotcha — dead code / inconsistent platform string**: `lib/repositories/
device_token_repository.dart` (a full `DeviceTokenRepository` with iOS/Android/web
platform detection, `registerToken`/`revokeToken`) is provided via
`deviceTokenRepositoryProvider` (`lib/providers/providers.dart:146-147`) but has **no
callers** anywhere in the app — `PushNotificationService` posts to
`/auth/device-tokens` directly via the raw `ApiClient`, hardcoding `'platform':
'android'` (`push_notification_service.dart:152-159`), consistent with the Android-only
gating noted above, but making `DeviceTokenRepository` fully unused/aspirational code.

## messages/ (`lib/features/messages/` + `widgets/`)

Buyer/seller threads. Screens: `MessagesScreen` (thread list), `MessageThreadScreen`
(1218 lines — single thread view + composer + media picker + typing indicator).

| File | Role |
|---|---|
| `message_threads_notifier.dart` | `MessageThreadsNotifier` (`AsyncNotifier<List<MessageThread>>`) — loads `GET /messages/threads`, merges in **locally-cached mute state** from `appPreferencesStorageProvider.readMutedThreadIds()` as a client-side overlay on top of server data — `message_threads_notifier.dart:52-74` |
| `message_unread_count_notifier.dart` | `MessageUnreadCountNotifier` — polls every 30s while authenticated, sums `thread.unread` excluding muted threads — `message_unread_count_notifier.dart:39-69` |
| `message_thread_screen.dart` | Polls `GET /messages/threads/{id}` every **2 seconds** (`_pollTimer`) for new messages + counterpart typing state, diffing message id/read/body/attachment fields to avoid unnecessary rebuilds — `message_thread_screen.dart:68,127-188` |
| `thread_settings_sheet.dart` | Mute/unmute bottom sheet, calls `MessageThreadsNotifier.setMuted()` | `thread_settings_sheet.dart:131-163` |
| `message_gallery_loader.dart` | Singleton wrapping `photo_manager`/`permission_handler` to prewarm device-gallery thumbnails before opening the attachment picker | `message_gallery_loader.dart:9-32` |
| `widgets/message_gallery_picker_sheet.dart`, `widgets/message_attachment_preview.dart` | Attachment picker UI and inline attachment rendering in the thread | — |

**Repository** (`lib/repositories/message_repository.dart`): `getThreads()` (`GET
/messages/threads`), `getThread(id)` (`GET /messages/threads/{id}`, also returns
`counterpart_is_typing`), `reply()` (`POST /messages/threads/{id}/reply` — multipart
when `mediaPaths` non-empty, else JSON body), `signalTyping()` (`POST
/messages/threads/{id}/typing`, best-effort/errors swallowed), `setThreadMuted()` (`POST
/messages/threads/{id}/mute`). Matches the backend `MessagingService`/
`MessageTypingService`/`MessageThreadSettingsService` split described in
`memory/drivebay/topics/domains-account.md` (typing is cache-backed with no DB writes
server-side, consistent with the client polling it every 2–3s rather than using any
push/websocket channel).

**Mute fallback gotcha** (**Jira: KAN-19**): if the mute endpoint 404/405s, `MessageThreadsNotifier.setMuted`
silently falls back to a **local-only** mute (`_shouldFallbackToLocalMute`,
`message_threads_notifier.dart:42-49,111-113`) — i.e. the client tolerates the server
route not existing yet (or being removed) and still stores mute state
client-side/per-device, which will desync from any other device the same account is
logged into.

**Typing indicator wiring**: composer text changes debounce 300ms then call
`signalTyping()` once, followed by a 3s heartbeat while the field remains non-empty
(`message_thread_screen.dart:75-105`) — client-driven polling model, no push-based typing
events.

**Report user/thread**: `_openReportUser` requires auth (redirects to `/login` if
guest) then opens `showReportSheet` → `ReportRepository.reportThread()` — same generic
sheet used by moderation's listing-report flow (`message_thread_screen.dart:267-283`).

**Navigation in**: thread list uses `context.push('/messages/{thread.id}')`
(`messages_screen.dart:158`) — a normal push (stacks on top of Messages tab), whereas a
message *push notification* tap uses `router.go('/messages/{id}')` (replaces stack) per
the navigation section above — intentional difference between "browsing to a thread"
and "jumping to a thread from a notification."

**Formatting anomaly**: `lib/repositories/message_repository.dart` has pervasive blank
lines between nearly every statement (auto-formatter or merge artifact) — harmless but
inconsistent with the rest of the codebase's `dart format` output; flag if editing this
file so a reformat isn't mistaken for a larger diff.

## Gaps / not verified in this pass

- `ReportRepository`'s two report routes (`/listings/{id}/report`,
  `/messages/threads/{id}/report`) were not cross-checked against
  `apps/drivebay/routes/api/v1/*.php` — do so before relying on exact backend behavior
  (rate limits, dedup rules).
- Did not trace `lib/core/push/` internals beyond `push_notification_service.dart` and
  `message_push_sync.dart` (explicitly out of scope — covered by another pass).
