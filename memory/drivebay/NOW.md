# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-108** day-before viewing reminders at morning
seller-local time (**local, uncommitted**). Prior: `6351ad1` my_appointment.

## Current state

- `config/viewing.php` — `reminder_local_hour` default 9 (`VIEWING_REMINDER_LOCAL_HOUR`)
- `ViewingAppointmentLifecycleService::shouldSendDayBeforeReminder` — day-before
  **and** local hour >= config (no overnight 02:00 sends)
- Pest: morning send + 02:00 no-send; docs note in `docs/api/modules/viewing.md`
- (**Jira: KAN-108**)

## Exact next action

1. Ask user to commit/push `apps/drivebay`
2. After push: set memory `sourceCommit` to new SHA; transition KAN-108

## Verification

- `php artisan test --filter="day-before reminders"` (3 passed)
- reschedule reminder test passed
