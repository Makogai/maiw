# drivebay — Current handoff

## Goal

QA and close **KAN-56** password reset + change password (web + API). Local implementation
ready; app commit not yet made (HEAD still `62e20c6`).

## Current state

- App HEAD is **`62e20c6`** with **uncommitted KAN-56** work.
- **KAN-56 In Review** (local):
  - `PasswordResetService` — `password_resets` with SHA-256 token, expiry, single-use;
    silent unknown email + cooldown (no enumeration)
  - `PasswordResetMail` + web `/forgot-password` + `/reset-password`; Login “Forgot password?”
  - Account web `PUT /account/password`; API `POST /auth/forgot-password`,
    `POST /auth/reset-password`, `PUT /account/password`
  - Reset revokes all tokens/devices/sessions; change keeps current API token / web session
  - Tests: `tests/Feature/PasswordResetTest.php` — 6 passed
- Prior: KAN-51/55 Done at `62e20c6`

## Exact next action

1. Commit + push `apps/drivebay` when approved.
2. QA forgot/reset web + account change password + API paths; then mark KAN-56 Done.
