# MAIW wrapper guidance

When the user writes `/maiw ...` or `maiw ...`, read `core/MAIW.md` and execute that operation.
Use the repository skill at `.agents/skills/maiw/SKILL.md` whenever the request matches its
description, including natural-language MAIW requests.
Use `node bin/maiw.js` for deterministic clone/register/ensure/status/doctor behavior. For agent
operations, follow `core/OPERATING.md` and `core/MEMORY_STANDARD.md`. Keep memory provider-neutral,
compact, evidence-backed, and resumable. Never overwrite valid existing memory.

**Mandatory after any `apps/<name>/` code change:** update `memory/<name>/` (NOW + stale topics +
`meta.json`), validate with `node bin/memory.js validate <name>`, then **auto-commit and
auto-push the MAIW wrapper** (do not wait to be asked). For nested `apps/` repos, **ask**
“Want me to commit and push?” and only proceed after yes. See `core/OPERATING.md` §7 and §10.

**Mandatory before substantive work in this workspace:** refresh the MAIW wrapper repo first, then
refresh the relevant nested `apps/<name>` repo(s), before relying on memory or changing code. If a
repo is dirty and pull would be risky, stop and ask instead of auto-merging, stashing, or
overwriting local changes. If app code moved, sync memory before treating `memory/<name>/` as
current.

**Never set yourself (Codex / any AI) as a contributor** — no git author/committer, no
`Co-authored-by` / `Made-with`, no CONTRIBUTORS credit. Human user only; never change `git config`
identity. Keep Attribution off and verify `git log -1 --format=full` is clean. See
`core/OPERATING.md` §9–10 and `core/ATTRIBUTION.md`.
