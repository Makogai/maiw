# {{APP}} agent guidance

Shared memory: `{{MEMORY_DIR}}`.

When the user writes `/maiw ...` or `maiw ...`, read `{{CORE_DIR}}/MAIW.md` and execute it. Use
`node {{WRAPPER_DIR}}/bin/maiw.js` for deterministic operations.

Before work, read `{{CORE_DIR}}/OPERATING.md`, then `{{MEMORY_DIR}}/NOW.md` and
`{{MEMORY_DIR}}/INDEX.md`. Load only relevant indexed topics. Confirm important facts in code.

**Never set yourself (Codex / any AI) as a contributor** — no git author/committer, no
`Co-authored-by` / `Made-with`, no CONTRIBUTORS credit. Human user only; never change `git config`
identity. **Before any `git commit` or `git push`: stop**, tell the user to verify attribution is
off and `git log -1 --format=full` is clean, and prefer they run git themselves. See
`{{CORE_DIR}}/OPERATING.md` §9–10 and `{{CORE_DIR}}/ATTRIBUTION.md`.

Workflow phrases:

- **learn project** — build compact evidence-backed memory and update `meta.json`.
- **resume from handoff** — continue from NOW's exact next action without relearning everything.
- **create handoff** — update NOW and affected topic notes before stopping.
- **sync memory** — reconcile only notes affected by current code changes.

Run `node {{WRAPPER_DIR}}/bin/memory.js validate {{APP}}` after memory changes.
