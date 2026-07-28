# drivebay — Current handoff

## Goal
QA and close KAN-55 Filament admin Users ops console on app HEAD `62e20c6`.

## Current state
- KAN-51 Done (share OG cards)
- KAN-55 In Review `62e20c6`:
  - `AdminUserAccountService` — mark/unverify email, resend verification, ban/suspend/reinstate
    (revokes Sanctum tokens + devices + auth sessions), safer admin soft-delete
    (`deleted_by` = admin id, archives live listings), admin restore
  - Filament `ViewUser` page + header actions on View/Edit; richer `UsersTable`
    (verified icon/filter, roles, phone search, active warning/restriction counts)
  - `UserListingsRelationManager` on user View/Edit — seller listings tab with status,
    price, city, views, filters, and links into ListingResource view/edit
  - API login blocks `banned`/`suspended` with `meta.reason=account_blocked`
  - Tests: `tests/Feature/AdminUserAccountOpsTest.php` + `ApiAuthTest` — passed
- Prior shipped: KAN-10/11/12/13/14/15/17/23/35 Done

App HEAD: `62e20c6`

## Exact next action
Redeploy admin, QA `/admin/users` verify/ban/delete + listings tab, then mark KAN-55 Done.
