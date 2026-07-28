# drivebay-flutter — Current handoff

## Goal

QA **KAN-56** Flutter password reset + change password (with backend API from same ticket).

## Current state

- App HEAD is **`dfe2a5c`** with **uncommitted KAN-56** Flutter work.
- Forgot/reset screens + login link; Profile → Change password.
- API: `AuthRepository.forgotPassword/resetPassword`, `AccountRepository.changePassword`.
- Deep links for web + `drivebay://reset-password`.
- Test: `test/password_reset_deep_link_test.dart` passed.
- Prior: KAN-52 Done at `dfe2a5c`.

## Exact next action

Commit/push when approved; QA mobile forgot → token/deep link → reset → login, and change password from profile.
