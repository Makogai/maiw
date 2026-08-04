# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-109** admin soft-delete / force-delete + Google
oauth trap — **uncommitted** on `main` atop `6a5c809` (KAN-107).

Ticket: https://drivebayme.atlassian.net/browse/KAN-109

## Current state

- Filament Users: `getEloquentQuery` without SoftDeletingScope + TrashedFilter;
  `deleted_at` column; Restore / ForceDelete via `AdminUserAccountService`
- `adminForceDelete` deletes `oauth_identities` then force-deletes user
- Social: orphan identity cleaned; admin soft-delete → `account_deactivated`
  (not generic credentials)
- Pest: `AdminForceDeleteOauthTest` 4/4 green

## Exact next action

1. Ask user to commit/push `apps/drivebay`.
2. Deploy; in admin: Users → filter **Trashed** → Restore or **Force delete**.
3. After force-delete, Google can create a fresh account.

## Verification

- `php artisan test --filter=AdminForceDeleteOauthTest` passed.
