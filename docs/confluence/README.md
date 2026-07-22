# Confluence drafts

Draft pages for the **Software Development** (`SD`) space on `drivebayme.atlassian.net`.

They live here because the Claude Atlassian connector currently has Confluence **read-only**
scopes (`read:page`, `read:space`, `search` — no `write:page:confluence`), so pages can't be
created programmatically yet. Either:

- grant the connector Confluence write scope, and these get pushed directly; or
- paste them into Confluence by hand.

## Scope rule (deliberate)

These pages cover **only** what has no code to drift from — onboarding, decisions, runbooks,
known gaps. Architecture / API / DB-schema docs stay in `apps/drivebay/docs/`, next to the code,
where they version and get reviewed with it. Copying code docs into Confluence is how they rot.

## Pages

| File | Confluence title | Parent |
|---|---|---|
| `01-start-here.md` | DriveBay — Start here | (top level) |
| `02-onboarding-local-setup.md` | Onboarding: local setup | Start here |
| `03-architecture-decisions.md` | Architecture decisions (ADRs) | Start here |
| `04-known-gaps-and-drift.md` | Known gaps & drift | Start here |
| `05-design-system.md` | Design system | Start here |
| `06-runbooks.md` | Runbooks | Start here |

Facts are sourced from the MAIW memory (`memory/drivebay/`, `memory/drivebay-flutter/`), which
was built from a full evidence-backed pass over both codebases at commits `8f7840f` (backend)
and `eb6132b` (mobile). Anything asserted here should be re-checked against code before it's
relied on for money- or security-sensitive work.
