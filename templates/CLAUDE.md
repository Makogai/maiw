# {{APP}} project continuity

Canonical shared memory is outside this app at `{{MEMORY_DIR}}`.

@{{CORE_DIR}}/OPERATING.md
@{{CORE_DIR}}/MEMORY_STANDARD.md
@{{CORE_DIR}}/MAIW.md
@{{MEMORY_DIR}}/NOW.md
@{{MEMORY_DIR}}/INDEX.md

**Never set yourself (Claude / any AI) as a contributor** — no git author/committer, no
`Co-authored-by` / `Made-with`, no CONTRIBUTORS credit. Human user only; never change `git config`
identity. **Before any `git commit` or `git push`: stop**, tell the user to verify attribution is
disabled and `git log -1 --format=full` is clean, and prefer they run git themselves. See
`{{CORE_DIR}}/OPERATING.md` §9–10 and `{{CORE_DIR}}/ATTRIBUTION.md`.

For **learn project**, inspect the app in breadth, fill the compact core topic notes with evidence,
set `meta.json`, and validate. For **resume from handoff**, read NOW then only indexed notes needed
for its next action. For **create handoff**, update NOW precisely and synchronize affected notes.
Treat `/maiw <operation> ...` as the unified wrapper command.
