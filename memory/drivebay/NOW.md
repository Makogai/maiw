# drivebay — Current handoff

## Goal

Mailpit-QA the full branded email pack with the new preview command, then commit/push `apps/drivebay`.

## Current state

- App HEAD still **`95a714c`**. Local uncommitted work now includes:
  - **KAN-59**: branded shell for verify/reset/listing-status/digest, plus password-reset CTA stacking fix
  - **KAN-60**: `ModerationNoticeMail` for warning + selling-restriction issue/lift/expire
  - Admin users create flow: `send_verification_email` toggle sends the verification email immediately for new unverified users
  - QA helper: `php artisan mail:test-all <email> [--locale=sr] [--only=...]`
- Docs: `docs/development/transactional-emails.md`
- Verified: `MailTestAllCommandTest`, `AdminUserAccountOpsTest`, `BrandedMailLayoutTest`, `ModerationNoticeMailTest`
- Tickets: [KAN-59](https://drivebayme.atlassian.net/browse/KAN-59) + [KAN-60](https://drivebayme.atlassian.net/browse/KAN-60) In Review

## Exact next action

1. Run `php artisan mail:test-all seller@drivebay.test` (or `--only=password-reset`) and check Mailpit renders.
2. Restart `queue:work`, then smoke real admin-triggered warning/restriction + create-user verification flows.
3. On OK: commit + push `apps/drivebay` (ask first); mark KAN-59/60 Done.
