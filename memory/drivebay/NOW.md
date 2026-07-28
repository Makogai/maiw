# drivebay — Current handoff

## Goal
Ship KAN-55 Filament admin Users ops console (In Review, local uncommitted on top of
`b2f450e`), after KAN-51 share-preview Done.

## Current state
- KAN-51 Done (share OG cards; refinements through `1f6bb37`+)
- KAN-55 In Review (**local, not committed yet**) on app HEAD base `b2f450e`:
  - `AdminUserAccountService` — mark/unverify email, resend verification, ban/suspend/reinstate
    (revokes Sanctum tokens + devices + auth sessions), safer admin soft-delete
    (`deleted_by` = admin id, archives live listings), admin restore
  - Filament `ViewUser` page + header actions on View/Edit; richer `UsersTable`
    (verified icon/filter, roles, phone search, active warning/restriction counts)
  - `UserListingsRelationManager` on user View/Edit — seller listings tab with status,
    price, city, views, filters, and links into ListingResource view/edit
  - API login blocks `banned`/`suspended` with `meta.reason=account_blocked`
  - Tests: `tests/Feature/AdminUserAccountOpsTest.php` + `ApiAuthTest` — 9 passed
- Prior shipped: KAN-10/11/12/13/14/15/17/23/35 Done

App HEAD: `b2f450e` (+ uncommitted KAN-55)

## Exact next action
Commit + push `apps/drivebay` KAN-55, redeploy admin, QA `/admin/users` verify/ban/delete flows,
then mark KAN-55 Done.
