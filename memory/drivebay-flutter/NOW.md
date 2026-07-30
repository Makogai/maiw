# drivebay-flutter — Current handoff

## Goal

Finish **KAN-77** (Flutter read-only viewing-policy badges) and keep Play beta
pipeline green (**KAN-72**).

## Current state

- **KAN-77** in working tree (not committed): `ListingDetail` maps nullable
  `allows_test_drive` / `allows_mechanic_visit`; listing detail shows Yes/No
  chips under seller card; `logo_url` already on `ListingSeller`. EN/SR l10n
  keys added; freezed/l10n regenerated.
- Depends on drivebay API from KAN-74 (uncommitted web slice).
- Play/beta: prior HEAD `d4693dd` / versionCode 3 still the last pushed app
  state for KAN-72 unless this branch advances.

## Exact next action

1. Ask user: commit/push `apps/drivebay-flutter` (KAN-77) after drivebay API ships.
2. Manual QA listing detail with flags set/null and dealer logo vs private initials.
3. Mark **KAN-77** Done after verify; then close epic **KAN-73** if web also Done.
