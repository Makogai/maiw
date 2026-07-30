# drivebay — Current handoff

## Goal

**KAN-99** phone dial picker worldwide countries.

## Current state

- Local uncommitted: `GeographyService::phoneCountries()` no longer filters
  `is_active` — returns all rows with `phone_code` (~248). Marketplace
  `activeCountries()` still ME-only via `is_active`.
- Tests: `GeographySeederTest` + `ApiGeographyTest` green; local count 248 after cache clear.

## Exact next action

1. Hot restart Flutter (reload `/config/app`) to pick up new `phone_countries`.
2. Ask commit/push `apps/drivebay`; mark KAN-99 Done.

## Decisions made

- Dial codes ≠ marketplace geography. Keep `is_active` for listing locations.

## Verification

- `php artisan test --filter=GeographySeederTest` / `ApiGeographyTest` passed.
- `phoneCountries()` count = 248 after `cache:clear`.
