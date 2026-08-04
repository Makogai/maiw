# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-107** social signup finish-profile (required phone)
pushed @ `6a5c809`.

Prior: **KAN-108** morning viewing reminders @ `fff8056`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-107

## Current state

- `users.profile_completed_at` (+ backfill existing → `created_at`)
- New social users leave it null; password registration sets `now()`
- `UserResource.profile_completion_required`
- `POST /api/v1/account/complete-profile`
- Web `/complete-profile` + `EnsureProfileIsComplete`
- Flutter counterpart @ `fd6e518` (after push)

## Exact next action

1. Deploy `6a5c809` + `php artisan migrate` on `dev.drivebay.me`.
2. Rebuild Flutter against that API; QA new Google signup → finish-profile once.
3. Move KAN-107 to Done after QA.

## Verification

- Pest social/web/registration suites green before push.
- Attribution clean on `6a5c809`.
