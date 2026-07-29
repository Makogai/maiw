# drivebay — Current handoff

## Goal

Ship legal pages + Play Console privacy URL for internal/closed testing; commit app.

## Current state

- **Local (uncommitted)** legal publishing stack:
  - Routes: `/privacy`, `/terms`, `/cookies`, `/account-deletion` (+ `/sr/…`)
    via `LegalController` + `Legal/Show.vue`
  - Copy: `lang/{en,sr}/legal.php` — DriveBay LLC, `:app` brandify, Montenegro law,
    7-day account deletion grace; contacts privacy@ / support@drivebay.me
  - Footer legal links in `AppLayout.vue`; shared Inertia `translations.legal`
  - Doc checklist: `docs/operations/legal-and-play-console.md`
  - Tests: `LegalPagesTest` — 5 passed
- Last pushed app HEAD still **`2ecd0e5`** (brand CSS lock). Jira MCP unavailable
  this session — ticket for legal/Play pages not created automatically.

## Exact next action

1. Deploy / expose production (or staging) URL so Play Console can fetch
   `https://<host>/privacy` (and `/account-deletion`).
2. Want commit+push of `apps/drivebay`? Then paste privacy URL into Play Console
   and start internal/real testing track.
3. Manually create KAN ticket for legal/Play when Atlassian MCP is back.
