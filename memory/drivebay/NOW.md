# drivebay — Current handoff

## Goal

- Finish account deletion/restore story on the backend (**KAN-41**), then continue
  backend bug queue (KAN-7 next).

## Current state

- **Phase 0 closed in Jira**: KAN-16, KAN-36, KAN-37, KAN-43 → Done.
  KAN-40 stays In Review until Coolify migrate + media backfill verified.
- **KAN-41 implemented locally (uncommitted)** — account restore + login detection:
  - `AccountDeletionService::{isRestorable,graceEndsAt,daysUntilPurge}`
  - Login `withTrashed()` → 403 `account_pending_deletion` when restorable
  - `POST /auth/account/restore` → restore + authPayload
  - Tests: `ApiAccountDeletionRestoreTest` (5 passed)
- Branch is **1 commit behind** `origin/main` — pull before push.

## Exact next action

1. Human: pull, commit + push KAN-41 on `apps/drivebay`.
2. Then start **KAN-7** (Horizon timeout vs Autodiler job).
3. Mobile **KAN-42** can consume the new login meta + restore endpoint.

## Decisions made this session

- Backend ticket order: close shipped → KAN-41 → KAN-7 → KAN-9 → KAN-8 → …

## Changed files

- `AccountDeletionService.php`, `AuthApiController.php`, `routes/api/v1/auth.php`
- `lang/{en,sr}/account.php`, `tests/Feature/Api/V1/ApiAccountDeletionRestoreTest.php`

## Verification

- `php artisan test --filter=ApiAccountDeletionRestoreTest` — 5 passed.
