# drivebay — Current handoff

## Goal

**KAN-58** staff RBAC (moderator / admin / super_admin) — implemented locally, not yet
committed/pushed in `apps/drivebay`.

## Current state

- App HEAD still **`b1d3224`** (KAN-99). Local uncommitted KAN-58 work:
  Filament resource/page permission gates, role-grant escalation guard, type↔role sync,
  Horizon/Telescope super_admin-only, `/auth/me` `capabilities`, `staff:backfill-roles`,
  Pest `StaffRbacTest` (9 passed) + related suites green.
- Follow-up filed: **[KAN-100](https://drivebayme.atlassian.net/browse/KAN-100)** mobile
  moderation mode (API queue + Flutter UI) — depends on KAN-58 capabilities contract.
- Left dirty locally (do not commit): `package-lock.json`, `docs/og-preview-mock.html`.

## Exact next action

1. Deploy note when shipping: `php artisan db:seed --class=RolesAndPermissionsSeeder`
   then `php artisan staff:backfill-roles` (dry-run first).
2. Want me to commit and push `apps/drivebay`? (wrapper memory will auto-push.)
3. Then either review Filament as each role, or start **KAN-100**.

## Decisions made

- Spatie role = auth SoT; `users.type` kept in sync for staff.
- Horizon/Telescope + role assignment = super_admin exclusive.
- Mobile: capabilities on `/auth/me` only in this ticket; full Flutter mode = KAN-100.

## Verification

- `php artisan test --compact tests/Feature/StaffRbacTest.php` — 9 passed / 56 assertions.
- Related: StaffAccess, AdminArtisan, AdminUserAccountOps, UserWarning*, UserSellingRestriction,
  AdminReport* — 30 passed.
