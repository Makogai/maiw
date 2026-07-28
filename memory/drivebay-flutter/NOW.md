# drivebay-flutter — Current handoff

## Goal

- Keep MAIW memory accurate for local **KAN-35** Flutter reschedule work without pretending the
  feature exists at app HEAD.

## Current state

- App HEAD is **`5187eea`**.
- **KAN-35 local only, not committed in `apps/drivebay-flutter`**:
  - `ViewingAppointment` now parses `canReschedule` in addition to `canCancel`.
  - `ViewingRepository` adds `reschedule()` for `POST /viewing/appointments/{uuid}/reschedule`.
  - `BookViewingSheet` now supports both booking and rescheduling modes, pre-fills the existing
    buyer note, and reuses the same date/slot picker.
  - `MyViewingsScreen` adds a buyer-side reschedule action and success snackbar.
  - push routing now treats `viewing.rescheduled` the same as other viewing notifications and opens
    `/account/viewings`.
  - `app_en.arb` / `app_sr.arb` plus generated localization Dart files were updated for the new
    reschedule copy.
- This behavior is **in the working tree on top of `5187eea` only**. `meta.json` tracks the last
  synchronized committed app revision, so read the topics below for the local-only delta.
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`.
- Backend **KAN-40** variants API is live (`e3385fe`); Flutter still uses primary image URLs.

## Exact next action

1. If the KAN-35 Flutter work is ready to ship, ask to commit/push `apps/drivebay-flutter`, then
   update `memory/drivebay-flutter/meta.json` again so `sourceCommit` matches the committed
   reschedule behavior exactly.

## Decisions made this session

- Treat buyer rescheduling as an in-place update flow that reuses the existing booking sheet instead
  of creating a second UI.
- Keep wrapper memory explicit that KAN-35 is local/uncommitted, while still recording the working
  tree behavior for future agents.

## Changed files

- `lib/models/viewing.dart`
- `lib/repositories/viewing_repository.dart`
- `lib/features/listings/widgets/book_viewing_sheet.dart`
- `lib/features/viewings/my_viewings_screen.dart`
- `lib/core/push/push_notification_service.dart`
- `lib/l10n/app_en.arb`
- `lib/l10n/app_sr.arb`
- `lib/l10n/app_localizations.dart`
- `lib/l10n/app_localizations_en.dart`
- `lib/l10n/app_localizations_sr.dart`

## Verification

- `flutter gen-l10n`
- `dart format ...`
- `flutter analyze` on touched files: only one pre-existing info in
  `lib/core/push/push_notification_service.dart` (`prefer_initializing_formals`); no blocking
  errors
