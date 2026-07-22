# drivebay — Current handoff

## Goal

- Full learning cycle after `/maiw clone`, requested explicitly so future sessions work
  from memory instead of re-reading code. Done. No feature work requested yet.

## Current state

- Cloned to `apps/drivebay` at commit `8f7840f` (2026-06-30, "fix package for aarch64").
- The repo carries thorough human+Boost-authored guidance in its own
  `apps/drivebay/CLAUDE.md`/`AGENTS.md` plus a maintained `docs/` tree — MAIW memory
  supplements that rather than duplicating it (see `INDEX.md`).
- Deep-learning pass complete (2026-07-15, 6 parallel agents, all evidence-checked
  against commit `8f7840f`): all 21 domains, the full API route surface, DB schema
  evolution, frontend (Inertia/Vue) + Filament admin, and infra/CI/queues are now
  covered in `topics/domains-core.md`, `domains-growth.md`, `domains-account.md`,
  `api-and-database.md`, `frontend-and-admin.md`, `infra.md` — see `INDEX.md` for what's
  in each. Read the specific file for your task rather than re-exploring code first.
- **Highest-value gotchas surfaced** (full evidence in the topic files above — do not
  rediscover these by grepping):
  - `ListingUpdated` event has zero listeners; Media domain doesn't actually use Spatie
    Media Library despite being installed; recommendation rebuild jobs are never
    scheduled (`domains-core.md`).
  - `NotificationObserver` pushes on *any* `in_app` row regardless of domain; ad
    impressions are never recorded despite a full implementation; PayPal is documented
    but not implemented, only Stripe exists (`domains-growth.md`, `domains-account.md`).
  - `docs/api/v1/openapi.json` is stale (16 endpoints missing, 1 phantom path) —
    re-run `composer run api:docs` before trusting it (`api-and-database.md`).
  - Horizon timeout-ordering violation in `ImportAutodilerListingsJob` (900s job timeout
    > 90s redis `retry_after`) — risk of duplicate concurrent imports (`infra.md`).
  - `docs/development/docker-setup.md` says MySQL/MariaDB; `docker-compose.yml` actually
    only defines Postgres (`infra.md`).
- Prior discrepancy still open: `CLAUDE.md` says tests live in
  `tests/{Feature,Unit,Browser}`; no `Browser/` dir exists yet.
- Repo has a few oddly-named top-level tracked files (`ensureExists()`, `first()))`) —
  pre-existing upstream noise from the original "Alpha v1" commit, not a MAIW artifact.
  Left untouched.

## Exact next action

1. No pending task. Next session: read this file + `INDEX.md`, pick the topic file(s)
   matching the work, and only open real source files to confirm specifics or fill a
   gap the notes don't cover.

## Decisions made this session

- Kept the pre-existing `apps/drivebay/AGENTS.md`/`CLAUDE.md` content intact and
  appended a short MAIW continuity section, rather than letting `bin/register.js`
  overwrite them outright (its default behavior) — see `topics/decisions.md`. Re-check
  for a clobber after any future `maiw ensure`/`register` on this app.

## Changed files

- `apps/drivebay/AGENTS.md`, `apps/drivebay/CLAUDE.md` — restored original content,
  appended MAIW pointer section.
- `memory/drivebay/topics/domains-core.md`, `domains-growth.md`, `domains-account.md`,
  `api-and-database.md`, `frontend-and-admin.md`, `infra.md` — new, this session.
- `memory/drivebay/INDEX.md`, `NOW.md`, `meta.json` — updated to reflect full learning.

## Verification

- `node bin/maiw.js doctor drivebay` and `node bin/memory.js validate drivebay` both
  passed after this pass.
- Every non-trivial claim in the six new topic files carries a `path:line` citation
  verified against commit `8f7840f`; no secrets/credentials were captured (scanned for
  key/token patterns post-write). Did not run the test suite or boot the app.

## Blockers and unknowns

- None blocking. Status is `current` for breadth (all domains/API/DB/frontend/infra
  covered); no single subsystem has had a full runtime/behavioral test pass — verify
  in-code claims before relying on them for anything security- or money-sensitive
  (billing, auth).
