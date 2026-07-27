# MAIW wrapper guidance

@core/MAIW.md
@core/OPERATING.md
@core/MEMORY_STANDARD.md
@core/ATTRIBUTION.md
@core/JIRA.md

**Never set yourself (Claude / any AI) as a contributor** — no git author/committer, no
`Co-authored-by` / `Made-with`, no CONTRIBUTORS credit. Human user only; never change `git config`
identity. **Before any `git commit` or `git push`: stop**, tell the user to verify Claude
attribution is disabled and `git log -1 --format=full` is clean, and prefer they run git
themselves. See `core/OPERATING.md` §9–10 and `core/ATTRIBUTION.md`.

Use `/maiw <operation> ...` as the unified wrapper workflow. Deterministic operations run through
`node bin/maiw.js`; agent operations update compact canonical memory.
Use the project skill in `.claude/skills/maiw/` for MAIW requests, including natural language.

**Mandatory after any `apps/<name>/` code change:** update `memory/<name>/` (NOW + stale topics +
`meta.json`), run `node bin/memory.js validate <name>`, and commit/push the wrapper so the next
session (Cursor, Claude, or another machine) stays in sync. See `core/OPERATING.md` §7 and
`.cursor/rules/maiw-memory-after-code.mdc`. App-only commits do not update memory.

Issue tracking for the apps lives in Jira project `KAN` ("Drivebay LLC"). When you find a bug,
file it (checking for duplicates first) and tag the finding in memory with its key; when you fix
one, update the ticket. Full convention: `core/JIRA.md`.
