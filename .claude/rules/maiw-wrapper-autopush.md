# Claude Code — MAIW wrapper auto-push

Applies to Claude Code sessions in this repo (also mirrored in root `CLAUDE.md` and
`core/OPERATING.md` §10).

## Auto-push the wrapper

After you update `memory/`, `core/`, `.claude/`, `.cursor/rules/`, or other MAIW wrapper
files:

1. `git add` the relevant wrapper paths
2. Commit with a clear human-authored message (no AI trailers)
3. `git push` to `origin` **without asking** the user first
4. Confirm `git log -1 --format=full` has no `Co-authored-by` / `Made-with`

## Do not auto-push apps

Repos under `apps/<name>/` are separate git repos. Commit/push those only when the user
explicitly asks.
