# drivebay — Current handoff

## Goal

- Backend bug queue: **KAN-10** centralize staff authorization.

## Current state

- **KAN-8 Done** — `5f5449c` (ad impressions; needs frontend build on deploy).
- **KAN-9 Done** — `1197f74` (run `favorites:backfill-counts` once).
- **KAN-7 Done** — `18b1d4f` (restart Horizon after deploy).
- **KAN-10 implemented locally (uncommitted)**:
  - `User::canAccessPanel()` → `StaffAccessService::isStaff()`
  - `AdminUserSeeder` already sets type+role (ticket text was stale)
  - `StaffAccessTest` 6/6 passed

## Exact next action

1. Human: commit + push KAN-10.
2. Next: **KAN-11** (FuelEconomy AI cache TTL).

## Verification

- StaffAccessTest 6 passed.
