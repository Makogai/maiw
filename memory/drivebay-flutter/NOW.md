# drivebay-flutter — Current handoff

## Goal

- Keep MAIW memory accurate for committed **KAN-35** Flutter buyer rescheduling at app HEAD
  `f49e7b0`.

## Current state

- App HEAD is **`f49e7b0`**.
- **KAN-35 done `f49e7b0` in `apps/drivebay-flutter`**:
  - `ViewingAppointment` now parses `canReschedule` in addition to `canCancel`.
  - `ViewingRepository` adds `reschedule()` for `POST /viewing/appointments/{uuid}/reschedule`.
  - `BookViewingSheet` now supports both booking and rescheduling modes, pre-fills the existing
    buyer note, and reuses the same date/slot picker.
  - `MyViewingsScreen` adds a buyer-side reschedule action and success snackbar.
  - push routing now treats `viewing.rescheduled` the same as other viewing notifications and opens
    `/account/viewings`.
  - `app_en.arb` / `app_sr.arb` plus generated localization Dart files were updated for the new
    reschedule copy.
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`.
- Backend **KAN-40** variants API is live (`e3385fe`); Flutter still uses primary image URLs.

## Exact next action

1. If the buyer viewing contract changes again, refresh the reschedule notes in
   `topics/repositories-and-models.md`, `topics/features-discovery.md`, and `topics/core-infra.md`
   so the pushed client behavior stays aligned with backend `KAN-35`.

## Decisions made this session

- Treat buyer rescheduling as an in-place update flow that reuses the existing booking sheet instead
  of creating a second UI.
- Keep wrapper memory aligned with the pushed reschedule flow and backend `KAN-35` contract.

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
