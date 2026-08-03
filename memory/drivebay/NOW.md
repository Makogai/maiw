# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-108** day-before viewing reminders at morning
seller-local time shipped (`fff8056`).

## Current state

- `config/viewing.php` — `reminder_local_hour` default 9 (`VIEWING_REMINDER_LOCAL_HOUR`)
- `ViewingAppointmentLifecycleService::shouldSendDayBeforeReminder` — day-before
  **and** local hour >= config (no overnight 02:00 sends)
- Pest + docs updated
- (**Jira: KAN-108**)

## Exact next action

- Deploy API; no open coding slice

## Verification

- `php artisan test --filter="day-before reminders"` (passed before ship)
- Pushed `fff8056`
