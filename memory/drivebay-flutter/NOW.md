# drivebay-flutter — Current handoff

## Goal

- Keep MAIW memory accurate for local **KAN-24** listing-detail analytics wiring on top of app
  HEAD `f49e7b0`, while preserving the already-pushed **KAN-35** buyer rescheduling flow.

## Current state

- App HEAD is **`f49e7b0`** with one local, uncommitted Flutter change in
  `lib/features/listings/listing_detail_screen.dart`.
- **KAN-24 in progress (local only)**:
  - buyer listing-detail `Contact` CTA now records a `contact` click with
    `placement=detail_actions` before opening the contact sheet;
  - buyer listing-detail `Share listing` action now records a `share` click with
    `placement=detail_actions` before opening the native share sheet;
  - per-channel contact tracking inside `ContactSellerSheet` still records `phone`, `email`,
    `whatsapp`, and `viber`, now tagged with `placement=detail_contact_sheet`.
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

1. QA `KAN-24` on-device by tapping `Contact` and `Share listing` from an active buyer-visible
   listing, then commit/push `apps/drivebay-flutter` if the seller analytics counters/events now
   appear as expected.

## Decisions made this session

- Treat the missing QA events as top-level detail-screen CTAs, not replacements for the existing
  per-channel contact analytics inside the sheet. `(**Jira: KAN-24**)`
- Treat buyer rescheduling as an in-place update flow that reuses the existing booking sheet instead
  of creating a second UI.
- Keep wrapper memory aligned with the pushed reschedule flow and backend `KAN-35` contract.

## Changed files

- `lib/features/listings/listing_detail_screen.dart`
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

- `dart format lib/features/listings/listing_detail_screen.dart`
- `flutter analyze lib/features/listings/listing_detail_screen.dart` -> only the pre-existing
  `_openReportListing` unused warning in that file; no new blocking diagnostics from the KAN-24 fix
- `flutter gen-l10n`
- `dart format ...`
- `flutter analyze` on touched files: only one pre-existing info in
  `lib/core/push/push_notification_service.dart` (`prefer_initializing_formals`); no blocking
  errors
