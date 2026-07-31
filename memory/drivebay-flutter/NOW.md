# drivebay-flutter — Current handoff

## Goal

**KAN-101** Mobile moderation tools v2 — **uncommitted** on branch
`feature/kan-100-moderation-mode` (HEAD `2b981ba` = KAN-100; working tree has KAN-101
+ host dialog context fix). Do not switch branches.

## Current state

- KAN-100 (pushed as `2b981ba`) is intact: capabilities, mode prompt, queue, review bar,
  stats badge, settings toggle.
- KAN-101 mobile slice (uncommitted) extends that so staff can moderate **any** listing
  while moderation mode is on:
  - Shield icon on listing detail scroll header → action sheet (Approve / Reject /
    Unpublish / Edit price|title|description).
  - `ModerationRepository` gains `getDetail`, `unpublish`, `updateListing` (PATCH partial).
  - `listingDetailProvider` retries via `GET /moderation/listings/{id}` on public 404 when
    mode is on (pending/draft open from queue review).
  - After actions: invalidate detail + pending-count, reload queue; success snackbar.
  - EN+SR strings regenerated.
- Also uncommitted (keep): `moderation_mode_prompt_host.dart` + `moderation_host.dart`
  use `rootAppNavigatorKey.currentContext` for dialogs (hosts sit above the router
  Navigator).

## Exact next action

1. QA against Laravel `feature/kan-100-moderation-mode` (or same-named branch) once
   backend KAN-101 endpoints exist: detail / unpublish / PATCH.
2. Ask user before committing/pushing `apps/drivebay-flutter`; parent auto-pushes
   wrapper memory only after approval workflow for app.
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

- `flutter analyze` on touched files: only 2 pre-existing infos/warnings in
  `listing_detail_screen.dart` (`_openReportListing` unused, unnecessary underscores).
  No new issues from KAN-101.
- `flutter test`: `user_capabilities_test`, `listing_detail_test`, `listing_card_test`,
  `listing_contact_channels_test`, `user_profile_test` — all green (11).
  Pre-existing `media_url_test` failures (LAN `API_BASE_URL` dart-define) unchanged.
- NOT verified: runtime against real backend KAN-101 endpoints.
