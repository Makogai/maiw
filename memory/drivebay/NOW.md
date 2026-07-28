# drivebay — Current handoff

## Goal

Mailpit-QA **KAN-59** + **KAN-60** branded emails, then commit/push `apps/drivebay`.

## Current state

- App HEAD still **`95a714c`**. Local uncommitted work:
  - **KAN-59**: branded shell for verify/reset/listing-status/digest
  - **KAN-60**: `ModerationNoticeMail` for warning + selling-restriction issue/lift/expire
- Docs: `docs/development/transactional-emails.md`
- Tests: `BrandedMailLayoutTest`, `ModerationNoticeMailTest` passed
- Tickets: [KAN-59](https://drivebayme.atlassian.net/browse/KAN-59) + [KAN-60](https://drivebayme.atlassian.net/browse/KAN-60) In Review

## Exact next action

1. Restart `queue:work`; smoke all mailables in Mailpit (incl. issue/lift warning + restrict selling from admin).
2. On OK: commit + push `apps/drivebay` (ask first); mark KAN-59/60 Done.
