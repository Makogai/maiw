# Jira integration for MAIW apps

Issue tracking for the apps under `apps/` lives in one Jira project. This file is the
durable convention so any session (any machine, any agent) can find, file, and update
tickets consistently and keep them in sync with code + memory.

## Project

- **Site**: `drivebayme.atlassian.net` (Atlassian cloud). Reachable via the Atlassian
  Rovo MCP tools (`createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`,
  `addCommentToJiraIssue`, `searchJiraIssuesUsingJql`, `getTransitionsForJiraIssue`, …).
- **cloudId**: `849b545f-f00b-4213-b8a3-957333864846` (pass the site hostname
  `drivebayme.atlassian.net` as `cloudId` — the tools accept either).
- **Project key**: `KAN` — "Drivebay LLC" (next-gen / team-managed software project).
- Issue types available: Epic, Story, Task, Bug, Subtask, Feature, Request.
- **Do not** use the `SAM1` project — that's the built-in "(Example) Billing System Dev"
  sample, unrelated to our apps.

## Structure

- One **Epic per app**, holding that app's findings/work:
  - `KAN-4` — **Drivebay backend** (`apps/drivebay`)
  - `KAN-5` — **Drivebay Flutter** (`apps/drivebay-flutter`)
  - When a new app is cloned and worth tracking, create a new `… — MAIW findings` Epic
    for it and record its key here.
- Cross-app product epics (not MAIW-findings):
  - `KAN-29` — **Recommendations end-to-end** (For you, search ranking, email digests);
    spans backend + mobile; related children/slices include KAN-25, KAN-17, KAN-24.
- Child issues use `parent: <epic-key>` at creation. Use **Bug** for functional defects,
  **Task** for docs/tech-debt/cleanup, **Story/Feature** for net-new capability.
- **Labels** (always set both, via `additional_fields.labels`):
  - `maiw-found` — issue was discovered by a MAIW learning/review pass (vs. hand-filed).
  - the app slug — `drivebay` or `drivebay-flutter` — so `labels = "drivebay"` filters
    one app across epics.
- **Priority** via `additional_fields.priority` (`{"name":"High"|"Medium"|"Low"}`) when
  it's clearly not default; leave unset otherwise.

## Ticket description standard

Every ticket body (Markdown, `contentFormat: markdown`) carries enough to act without
re-deriving the finding:

- **Problem** — what's wrong, one short paragraph.
- **Impact** — the concrete consequence (who/what breaks, or why it misleads).
- **Suggested fix** — the smallest reasonable remedy; note if a product decision is needed.
- **Evidence** — `path:line` citation(s) relative to the app repo (`apps/<app>/…`).
- **Source** — the memory file the finding came from (`memory/<app>/topics/*.md`).

## Two-way link: memory ↔ Jira

Each finding is tagged in the memory topic note with its key, e.g. `(**Jira: KAN-7**)`
inline next to the gotcha/finding. This is the durable cross-reference — a session
reading memory sees the ticket, and a ticket's Evidence/Source lines point back into
memory + code. When you add a new finding to memory, file its ticket and add the
`(**Jira: KAN-N**)` tag in the same pass.

## Workflow — the loop the user wants

1. **Find** (learning/review/normal work surfaces a bug): confirm it in current code
   (memory is navigation, not proof), then **check Jira first** so you don't duplicate —
   `searchJiraIssuesUsingJql` e.g.
   `project = KAN AND labels = "drivebay" AND statusCategory != Done` and scan summaries.
2. **File**: `createJiraIssue` under the app's epic, following the description standard +
   labels above. Add the `(**Jira: KAN-N**)` tag into the relevant `memory/<app>/topics/*.md`.
3. **Fix** (a `maiw-implementer` run or direct work): when you start, move the ticket to
   In Progress (`getTransitionsForJiraIssue` to find the id, then `transitionJiraIssue`).
4. **Update on fix**: when the change is verified, add a comment on the ticket
   (`addCommentToJiraIssue`) stating what changed (files + a one-line how-verified) and
   transition it to Done. Update `memory/<app>/NOW.md` and, if the finding's memory note
   is now resolved, either delete the stale gotcha or mark it fixed with the commit.
5. **Check**: to review status, `searchJiraIssuesUsingJql` (e.g. everything open in an
   epic: `parent = KAN-4 AND statusCategory != Done`). Report keys + summaries, don't
   re-explore code.

## Gotchas / operational notes

- The coding harness's "auto" permission mode runs each MCP call through a safety
  classifier; if that classifier is briefly unavailable you'll see
  "cannot determine the safety of …" — this is **not** Jira being down. Retry, or
  continue non-MCP work and come back. (Observed: creates + JQL both gated by it.)
- Before a batch of creates, run one `searchJiraIssuesUsingJql` for the epic's children
  first — if a prior partial run half-completed, this avoids duplicate tickets.
- Never put secrets, tokens, or customer data in a ticket body or comment — same rule as
  memory (`core/OPERATING.md` §6).
- Current filed set (2026-07-15 audit pass): backend `KAN-6..KAN-17`, mobile
  `KAN-18..KAN-25`, all labelled `maiw-found`. Keep this line roughly current so a new
  session knows the audit already happened and shouldn't re-file the same 20.
