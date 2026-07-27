# AI operating contract

1. Read `NOW.md` first. Read `INDEX.md` second. Load only topic notes relevant to the request.
2. Memory is navigation, not proof. Confirm important or stale facts in current code.
3. Never invent behavior. Mark inference and unknowns explicitly.
4. Preserve unrelated work and match local patterns.
5. Ask before dependencies, schema changes, public API breaks, or architectural changes.
6. Never place secrets, credentials, personal data, or customer payloads in memory.
7. **After any meaningful app code change, memory update is mandatory** (not optional, not
   `/maiw`-only). Update `memory/<app>/NOW.md` and only the topic notes made stale by the change;
   set `meta.json.sourceCommit` to the synchronized app HEAD; run `node bin/memory.js validate
   <app>`. Then commit/push the **wrapper** so memory is shared (see `.cursor/rules/maiw-memory-after-code.mdc`
   and `maiw-push-memory`). Leaving `apps/<app>` ahead of `memory/<app>` is incomplete work.
8. Before ending a session, leave a concrete handoff: state, decisions, files changed, verification,
   blockers, and the exact next action. If a teammate committed only in an app repo, sync memory
   (`/maiw sync <app>` or equivalent) before relying on NOW/topics.
9. **Never set the AI agent as a contributor.** Claude, Cursor, Codex, and any other AI tool must
   not appear as git author/committer, in `Co-authored-by` / `Made-with` trailers, in CONTRIBUTORS
   files, package contributor metadata, PR co-author fields, or any other credit list. Commits and
   contributions belong to the human user only. Never change `git config` `user.name` /
   `user.email`. Product toggles: see `ATTRIBUTION.md`.
10. **Git commit/push policy.**
    - **MAIW wrapper (this repo root):** After memory, rules, `core/`, or other wrapper
      docs change, **auto-commit and auto-push in the same session** (Cursor, Claude Code,
      Codex). Do not wait for the user to ask. Still obey §9: no AI author/`Co-authored-by`;
      verify `git log -1 --format=full` is clean. See `.cursor/rules/maiw-push-memory.mdc`.
    - **App repos under `apps/`:** Never auto-commit/push. When work finishes with app
      changes ready to ship, **ask the user** once: “Want me to commit and push
      `apps/<name>`?” Proceed only if they say yes. Then confirm attribution is disabled and
      `git log -1 --format=full` has no AI trailers before pushing.
11. **Jira is the source of truth for tickets** (`KAN`). Before starting work: search/read the
    issue and linked Confluence. While working: keep the ticket current. On finish: comment,
    transition, update Confluence when docs drift. See `JIRA.md` and
    `.cursor/rules/jira-confluence-source-of-truth.mdc`.

