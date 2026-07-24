# AI operating contract

1. Read `NOW.md` first. Read `INDEX.md` second. Load only topic notes relevant to the request.
2. Memory is navigation, not proof. Confirm important or stale facts in current code.
3. Never invent behavior. Mark inference and unknowns explicitly.
4. Preserve unrelated work and match local patterns.
5. Ask before dependencies, schema changes, public API breaks, or architectural changes.
6. Never place secrets, credentials, personal data, or customer payloads in memory.
7. After meaningful work, update NOW and only the topic notes made stale by the change.
8. Before ending a session, leave a concrete handoff: state, decisions, files changed, verification,
   blockers, and the exact next action.
9. **Never set the AI agent as a contributor.** Claude, Cursor, Codex, and any other AI tool must
   not appear as git author/committer, in `Co-authored-by` / `Made-with` trailers, in CONTRIBUTORS
   files, package contributor metadata, PR co-author fields, or any other credit list. Commits and
   contributions belong to the human user only. Never change `git config` `user.name` /
   `user.email`. Product toggles: see `ATTRIBUTION.md`.
10. **Pause before git commit/push.** Do not silently commit or push. Stop, tell the user to
    confirm attribution is disabled (Cursor Agents → Attribution OFF; Claude
    `attribution.commit`/`pr` empty + `includeCoAuthoredBy: false`), and to run
    `git log -1 --format=full` and ensure there is **no** AI `Co-authored-by` / `Made-with`
    trailer. Prefer that the user runs commit/push themselves. Only continue after they
    explicitly approve.

