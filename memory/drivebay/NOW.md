# drivebay — Current handoff

## Goal

**KAN-58** staff RBAC — **shipped** (`fd36c97` on main). Now starting **KAN-100**
mobile moderation mode (backend API slice + Flutter UI) on feature branches.

## Current state

- App HEAD **`fd36c97`**: Filament resource/page permission gates, role-grant
  escalation guard (super_admin only), type↔role sync + `staff:backfill-roles`,
  Horizon/Telescope super_admin-only, `/auth/me` `capabilities`, `StaffRbacTest` (9 passed).
- **[KAN-100](https://drivebayme.atlassian.net/browse/KAN-100)** next: moderation API
  (`GET /moderation/listings`, approve/reject) + Flutter moderation mode with login popup.
- Left dirty locally (do not commit): `package-lock.json`, `docs/og-preview-mock.html`.

## Exact next action

1. Deploy KAN-58: `php artisan db:seed --class=RolesAndPermissionsSeeder` then
   `php artisan staff:backfill-roles` (dry-run first).
2. Implement KAN-100 on `feature/kan-100-moderation-api` (drivebay) and a Flutter
   feature branch (drivebay-flutter).

## Decisions made

- Spatie role = auth SoT; `users.type` kept in sync for staff.
- Horizon/Telescope + role assignment = super_admin exclusive.
- Mobile: `/auth/me` `capabilities` is the client contract for moderation mode.

## Verification

- `StaffRbacTest` 9 passed / 56 assertions; related staff/admin suites 30 passed.
