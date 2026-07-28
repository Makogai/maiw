# drivebay — Conventions

Full convention list: `apps/drivebay/CLAUDE.md` "Conventions" section and
`apps/drivebay/AGENTS.md` (Laravel Boost guidelines, PHP/Inertia/Tailwind/Pest rules).
Only verified/non-obvious additions below.

## Verified commands

| Action | Command | Evidence |
|---|---|---|
| First-time setup | `cp .env.docker.example .env && composer run setup` | `apps/drivebay/README.md` |
| Run dev (app+queue+Vite) | `composer run dev` | `apps/drivebay/README.md`, `apps/drivebay/package.json` |
| Docker infra up/down/fresh | `composer run docker:up`/`docker:down`/`docker:fresh` | `apps/drivebay/README.md` |
| Run tests | `php artisan test --compact` | `apps/drivebay/README.md` |
| Preview all mailables | `php artisan mail:test-all seller@drivebay.test [--locale=sr] [--only=password-reset]` | `app/Console/Commands/SendTestEmailsCommand.php`, `docs/development/transactional-emails.md` |
| Format PHP after edits | `vendor/bin/pint --dirty --format agent` | `apps/drivebay/AGENTS.md` |

## Structure and naming

- Domain-per-folder under `app/Domains/{Domain}/`; models mirror at
  `app/Models/Domains/{Domain}/Models/` (parallel tree, not colocated).
- Admin panel: 32 Filament resources under `app/Filament/Admin/Resources/`.
- Feature flags: 14 Pennant classes under `app/Features/` — check there before adding a
  new on/off switch (`CLAUDE.md` "Conventions").

## Testing and error handling

- **Discrepancy (verified 2026-07-15):** `apps/drivebay/CLAUDE.md` documents
  `tests/{Feature,Unit,Browser}`, but the actual `tests/` tree has `Feature/`, `Unit/`,
  `Support/`, `fixtures/` — no `Browser/` directory exists yet. Treat Browser tests as
  aspirational/stale until a `tests/Browser` dir actually appears.
- Pest 4; create with `php artisan make:test --pest {Name}`; prefer semantic assertions
  over `assertStatus(n)`; don't delete tests without asking (`AGENTS.md`).

## Gotchas

- Repo has a few oddly-named tracked top-level files (`ensureExists()`, `first()))`) —
  captured shell/tinker error output committed by accident in the original "Alpha v1"
  commit (`ffd813b`). Pre-existing upstream noise, not a MAIW artifact; leave alone
  unless the user asks for repo cleanup.
- Herd serves the app at `https://drivebay.test`; Docker still provides infra
  (Postgres/Meilisearch/Redis/Mailpit). Dealer storefront subdomains need explicit Herd
  site aliases locally — not wildcard-routed.

