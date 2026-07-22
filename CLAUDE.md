# MAIW wrapper guidance

@core/MAIW.md
@core/OPERATING.md
@core/MEMORY_STANDARD.md
@core/JIRA.md

Use `/maiw <operation> ...` as the unified wrapper workflow. Deterministic operations run through
`node bin/maiw.js`; agent operations update compact canonical memory.
Use the project skill in `.claude/skills/maiw/` for MAIW requests, including natural language.

Issue tracking for the apps lives in Jira project `KAN` ("Drivebay LLC"). When you find a bug,
file it (checking for duplicates first) and tag the finding in memory with its key; when you fix
one, update the ticket. Full convention: `core/JIRA.md`.
