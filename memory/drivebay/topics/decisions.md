# drivebay — Durable decisions

Record only decisions that future work must understand.

| Date | Decision | Why | Consequences | Evidence |
|---|---|---|---|---|
| 2026-07-28 | Marketplace identity is **deploy-time brand packs** (`BRAND=drivebay\|autoklik`), not admin CMS | Montenegro/Balkans rename needs one-flag rebuild; admin white-label overkill | Packs in `config/brands/*`; `brand()`/`brandify()`; Inertia `brand` + CSS vars; lang uses `:app`; mirror Flutter `--dart-define=BRAND` | `docs/development/branding.md`, `config/brand.php` |
| 2026-07-28 | Moderation warnings + selling restrictions email on issue/lift/expire via shared `ModerationNoticeMail` (**Jira: KAN-60**, Done `2fb7f12`) | In-app/push alone miss users offline | Ban/suspend/report emails still out of scope | `UserWarningService`, `UserSellingRestrictionService`, `docs/development/transactional-emails.md` |
| 2026-07-28 | Transactional emails use custom DriveBay HTML shell (accent tile + wordmark, CTA `#e85d04`, quiet footer); digests only get unsubscribe (**Jira: KAN-59**, Done `2fb7f12`) | Approved Phase 0 mock; Markdown theme was too generic | All four mailables use `html:` + `x-mail.drivebay-*`; listing cards share factory; restart queue workers after template edits | `resources/views/components/mail/`, `docs/email-design-mock.html` |
| 2026-07-15 | Kept drivebay's original `AGENTS.md`/`CLAUDE.md` content, appended a MAIW pointer section instead of letting `bin/register.js` overwrite them | `register.js` unconditionally replaces both files with a generic stub, which would have discarded Laravel Boost guidance and the hand-written architecture guide | Re-registering (`maiw ensure`/`register`) will re-overwrite unless `register.js` is fixed to merge — check for a clobber after any future register | `apps/drivebay/AGENTS.md`, `apps/drivebay/CLAUDE.md`, `bin/register.js:69-70` |

