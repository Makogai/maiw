# No AI contributor attribution

Commits, PRs, and credit lists must name the **human user only**. Never Claude, Cursor,
Codex, or any other AI tool as author, committer, co-author, or contributor.

Agent behavior is in `OPERATING.md` §9. Product toggles below are what actually stop the
tools from injecting trailers.

## Cursor (required)

1. Open **Cursor Settings** (not VS Code settings): `Ctrl+Shift+J` / Command Palette →
   “Cursor Settings”.
2. Go to **Agents → Attribution**.
3. Turn **OFF**:
   - **Commit Attribution** (stops `Co-authored-by` / `Made-with: Cursor` on commits)
   - **PR Attribution** (stops Cursor credit on pull requests)
4. Fully quit and restart Cursor.

CLI / Agent CLI (separate from the IDE toggle) — edit `%USERPROFILE%\.cursor\cli-config.json`
(macOS/Linux: `~/.cursor/cli-config.json`):

```json
{
  "attribution": {
    "attributeCommitsToAgent": false,
    "attributePRsToAgent": false
  }
}
```

(Some Cursor builds use top-level `commitAttribution` / `prAttribution`; set those to
`false` if present.)

This wrapper also has a Cursor project hook (`.cursor/hooks.json`) that **pauses** agent
`git commit` / `git push` and asks you to verify the last commit before approving.

## Claude Code (required)

Global (`%USERPROFILE%\.claude\settings.json` or `~/.claude/settings.json`) and/or this
repo’s `.claude/settings.json`:

```json
{
  "includeCoAuthoredBy": false,
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

Empty `attribution.commit` / `attribution.pr` is the documented disable. Keep
`includeCoAuthoredBy: false` as a belt-and-suspenders legacy flag. Claude’s system prompt
has historically ignored these at times — always verify with `git log -1 --format=full`
before pushing.

## Before any push

1. `git log -1 --format=full`
2. Reject / rewrite if you see `Co-authored-by:`, `Made-with:`, `Cursor`, `Claude`,
   `Codex`, `noreply@anthropic.com`, or `cursoragent` as author.
3. Prefer pushing yourself after a clean check.
