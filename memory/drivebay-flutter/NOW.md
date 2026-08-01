# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-01): **EN/SR translation audit** — UNCOMMITTED on `main` @ `9325bbf`,
awaiting user approval to commit/push. Prior: **KAN-101** mobile moderation tools v2 on
`feature/kan-100-moderation-mode` (`319ee90` + `98ed65e`), on-device QA in progress.

## Translation audit (2026-08-01, uncommitted on main)

- Root cause of "warning dialog titles in English": server-side — API ignored
  `Accept-Language`; fixed in drivebay **KAN-103** (`SetApiLocale` middleware). Client
  already sends the header (`LocaleInterceptor`/`ApiLocale`, synced by `LocaleNotifier`).
- Completed **KAN-53** (was Done in Jira but the screen fix never landed on main):
  `registration_calculator_screen.dart` fully wired to l10n — new `regCalc*` keys
  (EN+SR ijekavica) + reused `vehicleDetails`/`registration*` keys; line-item labels now
  key-based via `_lineItemLabel()` (model labels in `RegistrationEstimate.lineItems()`
  stay as English fallbacks only).
- Other hardcoded strings localized: `phone_input_field.dart` search hint
  (`phoneCountrySearchHint`), `seller_listing_card.dart` moderation badges
  (`sellerPhotosPendingBadge`/`sellerPhotoRejectedBadge`), onboarding preview chips
  (`fuelDiesel` + `onboardingChipAutomatic`).
- SR arb fixes: `equipmentFeatureChildLock` -> `Brava za djecu`,
  `equipmentFeatureCdChanger` -> `CD mjenjač`. Arb key parity EN/SR: 0 issues.
- Verified: `flutter gen-l10n`, `flutter analyze` (no new issues), `flutter test`
  (only pre-existing `media_url_test` fails, LAN dart-define).

KAN-101 QA fixes in `98ed65e`:

1. `ModerationRepository.getQueue` must NOT parse queue meta with `SearchMeta.fromJson` —
   the moderation queue returns Laravel paginator meta (`current_page`/`last_page`), not
   the search envelope's `page`; missing key threw and surfaced as "ApiException: null".
   Keys now mapped manually with fallbacks.
2. **Moderator note** (audit trail) added to every non-reject moderation
   action — and made **REQUIRED** (backend returns 422 without it, matching the
   admin panel): shared `showModerationConfirmNoteDialog`
   (`widgets/moderation_confirm_note_dialog.dart`) replaces the plain confirm
   dialogs for approve (detail sheet, queue swipe, review screen) and unpublish;
   edit-field sheets gained a second required multiline note field (inline
   "A note is required." on empty submit; 422 `note` field errors map onto it).
   `ModerationNoteConfirmation.note` is non-null. Wire-through:
   `ModerationRepository.approve`/`updateListing` take `note` (sent when
   non-empty; `unpublish` already had it), `ModerationQueueNotifier.approve` passes
   it, queue screen stashes it in `_pendingApproveNotes` (confirmDismiss ->
   onDismissed, same pattern as reject reasons). Reject keeps its required reason,
   unchanged. L10n keys `moderationNoteLabel`/`moderationNoteHint`/
   `moderationNoteRequired` (EN+SR).
3. **Moderation prompt now fires on EVERY staff login/session restore** —
   `prompt_seen` persistence removed entirely (storage methods deleted from
   `AppPreferencesStorage`; only ever consumed by the prompt host). Two variants in
   `ModerationModePromptHost`, chosen by the *stored* per-user mode flag (read
   directly — the provider restores async): mode OFF -> existing "Enable moderation
   mode?" (Enable / Not now); mode ON -> awareness dialog "Moderation mode is
   active." (Keep on = default/dismiss, Turn off -> `setEnabled(false)`).
   Double-show guard: `_promptedUserId` set before showing (initState post-frame +
   auth listener can both fire on cold start), reset on any transition to
   unauthenticated so the next login prompts again. Root-navigator context kept.
   New l10n `moderationActiveTitle/Body/KeepOn/TurnOff` (EN+SR).

## Current state

- KAN-100 (`2b981ba`): capabilities, mode prompt, queue, review bar, stats badge,
  settings toggle. Gotcha fixed in `319ee90`: hosts in `MaterialApp.builder` sit above
  the router's Navigator — dialogs there MUST use `rootAppNavigatorKey.currentContext`
  (prompt host + `ModerationHost` both fixed; was silently swallowing the error).
- KAN-101 (`319ee90`) extends that so staff can moderate **any** listing
  while moderation mode is on:
  - Shield icon on listing detail scroll header -> action sheet (Approve / Reject /
    Unpublish / Edit price|title|description).
  - `ModerationRepository` gains `getDetail`, `unpublish`, `updateListing` (PATCH partial).
  - `listingDetailProvider` retries via `GET /moderation/listings/{id}` on public 404 when
    mode is on (pending/draft open from queue review).
  - After actions: invalidate detail + pending-count, reload queue; success snackbar.
  - EN+SR strings regenerated.
- Gotcha (fixed in `98ed65e`): `moderation_mode_prompt_host.dart` + `moderation_host.dart`
  must use `rootAppNavigatorKey.currentContext` for dialogs (hosts sit above the router
  Navigator).

## Exact next action

1. Commit/push `apps/drivebay-flutter` main (translation audit) after user approval.
2. QA against Laravel `feature/kan-100-moderation-mode` (or same-named branch) once
   backend KAN-101 endpoints exist: detail / unpublish / PATCH.
3. PR covering KAN-100 + KAN-101 when both sides ready; move tickets to In Review.

## Decisions made

- Detail-screen Approve/Reject reuse `moderationQueueProvider` (optimistic queue sync);
  Unpublish/PATCH call the repository directly then refresh.
- Edit sheets submit **only** the changed field; 422 `ValidationException` field errors
  show inline in the sheet.
- Public detail is tried first; staff endpoint is a 404 fallback when mode is on (not
  preferred always) — matches the KAN-101 contract wording.
- Host-level dialogs keep the root-navigator pattern; sheets from screens use local
  context.

## Verification

- `flutter analyze` on touched files (re-run after the required-note + prompt pass):
  only 2 pre-existing infos/warnings in `listing_detail_screen.dart`
  (`_openReportListing` unused, unnecessary underscores). No new issues.
- `flutter test`: `user_capabilities_test`, `listing_detail_test`, `listing_card_test`,
  `listing_contact_channels_test`, `user_profile_test` — all green (11).
  Pre-existing `media_url_test` failures (LAN `API_BASE_URL` dart-define) unchanged.
- NOT verified: runtime against real backend KAN-101 endpoints.
