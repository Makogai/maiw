# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-107** social signup finish-profile (required phone,
first time only) — **uncommitted** on `main` atop `fff8056`.

Prior shipped: **KAN-108** day-before viewing reminders @ `fff8056`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-107

## Current state

### KAN-107 (uncommitted)
- `users.profile_completed_at` (+ backfill existing → `created_at`)
- New social users leave it null; password registration sets `now()`
- `UserResource.profile_completion_required`
- `POST /api/v1/account/complete-profile` (phone required, optional names)
- Web: `/complete-profile` Inertia + `EnsureProfileIsComplete` middleware
- Social callback redirects incomplete users to finish-profile

### KAN-108 (shipped `fff8056`)
- Morning local-hour gate for day-before viewing reminders (`config/viewing.php`)

## Exact next action

1. Ask user to commit/push `apps/drivebay` (+ flutter).
2. `php artisan migrate` on deploy.
3. QA: new social signup → forced phone screen once.

## Verification

- Pest: ApiSocialAuthTest / WebSocialAuthTest / RegistrationTest green.
- Do not commit `docs/og-preview-mock.html` with this work.
