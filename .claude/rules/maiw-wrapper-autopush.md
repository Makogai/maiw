# Claude Code — MAIW git push policy

Applies to Claude Code sessions in this repo (also mirrored in root `CLAUDE.md` and
`core/OPERATING.md` §10).

## Auto-push the wrapper

After you update `memory/`, `core/`, `.claude/`, `.cursor/rules/`, or other MAIW wrapper
files:

1. `git add` the relevant wrapper paths
2. Commit with a clear human-authored message (no AI trailers)
3. `git push` to `origin` **without asking** the user first
4. Confirm `git log -1 --format=full` has no `Co-authored-by` / `Made-with`

## Ask before app commit/push

Repos under `apps/<name>/` are separate git repos. Never auto-commit or auto-push them.

When you finish app work with changes ready to ship, **ask once** at the end of your
reply, e.g.:

> Want me to commit and push `apps/drivebay`?

Only run commit/push after the user says yes. Same attribution check as above.
