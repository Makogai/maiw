# drivebay-flutter — Current handoff

## Goal

**KAN-100** Mobile moderation mode — **committed and pushed** as `2b981ba` on branch
`feature/kan-100-moderation-mode` (base `9325bbf`).

## Current state

- Full KAN-100 mobile slice on the pushed feature branch. Backend counterpart is
  pushed too (drivebay `feature/kan-100-moderation-api`, `44f2fd9`); contract:
  `/auth/me` user JSON gains optional `capabilities: {staff_role, permissions[]}`
  (absent for non-staff), `GET /moderation/listings?page=N` (ListingCard envelope),
  `POST /moderation/listings/{public_id}/approve|reject` (reject body `{reason}`),
  `GET /moderation/stats` → `{data: {pending_count}}`, all 403 for non-staff.
- New: `lib/models/user_capabilities.dart` (+ `User.capabilities`, regenerated),
  `lib/repositories/moderation_repository.dart`, feature files under
  `lib/features/moderation/` (`moderation_mode_notifier.dart`,
  `moderation_mode_prompt_host.dart`, `moderation_queue_notifier.dart`,
  `moderation_queue_screen.dart`, `moderation_review_screen.dart`,
  `widgets/moderation_reject_sheet.dart`), `test/user_capabilities_test.dart`.
- Modified: `app.dart` (host chain + `ModerationModePromptHost`), `app_router.dart`
  (`/account/moderation` + `/account/moderation/review/:publicId`),
  `profile_screen.dart` (staff Moderation entry + pending badge),
  `settings_screen.dart` (staff-only mode toggle), `listing_card_tile.dart`
  (optional `onTap` override), `app_preferences_storage.dart` (per-user keys
  `moderation_mode_enabled_<id>` / `moderation_prompt_seen_<id>`), providers,
  EN+SR ARBs + regenerated l10n.

## Exact next action

1. QA against the real backend branch endpoints, then PR to main and move KAN-100
   to In Review/Done.
2. Login-response question is RESOLVED: backend login uses the same `UserResource`
   as `/auth/me`, so `capabilities` is present at login — prompt fires immediately.

## Decisions made

- Moderation mode is per-user local state (`flutter_secure_storage` via
  `AppPreferencesStorage`), only readable/settable when session user has
  `listings.moderate`; `moderationModeProvider` hard-returns false otherwise.
- One-time prompt host mirrors `ModerationHost` (auth-transition listener +
  initState post-frame check); answered-or-dismissed writes `prompt_seen` so it
  never nags again; choice flippable in Settings.
- Prompt on *login* assumes the login response's `user` object also carries
  `capabilities` (both paths parse through `User.fromJson`). If backend only puts
  it on `/auth/me`, the prompt appears on next session restore instead — flagged
  to backend.
- Queue swipes: Dismissible confirmDismiss gathers confirm/reason, onDismissed
  calls queue notifier which removes optimistically *synchronously* (required by
  Dismissible) and restores the item at its index on API failure.
- 403 from moderation endpoints → `accessDenied` state + friendly screen (401 is
  already global teardown via AuthInterceptor).

## Verification

- `flutter analyze`: no issues in any touched/new file (35 pre-existing
  infos/warnings elsewhere, unchanged).
- `flutter test`: new `user_capabilities_test.dart` (4 tests) passes; full suite
  green except 2 pre-existing env-dependent failures in `media_url_test.dart`
  (expect a LAN `API_BASE_URL` dart-define; unrelated).
- NOT verified: runtime against real backend (endpoints don't exist yet).
