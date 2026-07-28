# drivebay — Durable decisions

Record only decisions that future work must understand.

| Date | Decision | Why | Consequences | Evidence |
|---|---|---|---|---|
| 2026-07-28 | Transactional emails use custom DriveBay HTML shell (accent tile + wordmark, CTA `#e85d04`, quiet footer); digests only get unsubscribe (**Jira: KAN-59**) | Approved Phase 0 mock; Markdown theme was too generic | All four mailables use `html:` + `x-mail.drivebay-*`; restart queue workers after template edits | `resources/views/components/mail/`, `docs/email-design-mock.html` |
| 2026-07-15 | Kept drivebay's original `AGENTS.md`/`CLAUDE.md` content, appended a MAIW pointer section instead of letting `bin/register.js` overwrite them | `register.js` unconditionally replaces both files with a generic stub, which would have discarded Laravel Boost guidance and the hand-written architecture guide | Re-registering (`maiw ensure`/`register`) will re-overwrite unless `register.js` is fixed to merge — check for a clobber after any future register | `apps/drivebay/AGENTS.md`, `apps/drivebay/CLAUDE.md`, `bin/register.js:69-70` |

