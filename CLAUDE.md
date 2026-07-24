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

Issue tracking for the apps lives in Jira project `KAN` ("Drivebay LLC"). When you find a bug,
file it (checking for duplicates first) and tag the finding in memory with its key; when you fix
one, update the ticket. Full convention: `core/JIRA.md`.
