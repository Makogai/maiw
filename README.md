# makogai-ai-wrapper

Portable, low-token project continuity for Makogai in-house applications. Clone app repositories
under `apps/`; commit their compact AI memory here. Claude, Cursor, and Codex all consume the same
canonical memory through thin generated adapters.

## Why

- Resume work on another computer without paying to rediscover the whole codebase.
- Give a colleague the same architecture, decisions, current task, and known gotchas.
- Keep durable knowledge independent of any one AI vendor.
- Load a small router by default and detailed notes only when relevant.

## Start a new app

```bash
git clone <app-url> apps/my-app
node bin/register.js my-app
```

Or use the unified agent command:

```text
/maiw clone <app-url> my-app
```

It skips an existing clone, preserves existing memory, installs all provider adapters, and returns
either `/maiw learn my-app` for new memory or `/maiw resume my-app` for existing memory.

Then use your agent inside `apps/my-app` and say `learn project` (or Cursor `/learn`). The first
learning pass fills `memory/my-app/`. Before changing computers or stopping mid-task, say
`create handoff` (or Cursor `/handoff`) and commit the wrapper memory.

On another computer:

```bash
git clone <wrapper-url>
git clone <app-url> apps/my-app
node bin/register.js my-app
```

Then say `resume from handoff`. Full relearning is unnecessary unless validation reports drift.

## Token strategy

Always-loaded adapters contain only operating rules and point to:

1. `memory/<app>/NOW.md` — current state and next action.
2. `memory/<app>/INDEX.md` — compact routing table.
3. Relevant files under `topics/` — loaded only for the task.

Do not duplicate code listings, dependency inventories, or obvious folder trees. Record durable
decisions, non-obvious behavior, change recipes, commands, and unresolved risks with code evidence.

## Native agent packages

- **Claude:** `.claude/skills/maiw/SKILL.md` for automatic/natural-language activation plus
  `.claude/commands/maiw.md` for explicit `/maiw` invocation and `CLAUDE.md` for project memory.
- **Cursor:** `.cursor/rules/` for persistent routing and `.cursor/commands/maiw.md` for `/maiw`.
- **Codex:** `.agents/skills/maiw/SKILL.md` for native skill discovery plus `AGENTS.md` for durable
  repository routing. When a Codex UI reserves unknown slash commands, use `$maiw`, `maiw ...`, or
  the deterministic CLI.

Registration copies the complete native package for each provider into the app and excludes those
generated adapters from the app's Git repository.

## Commands

```bash
node bin/memory.js status [app]
node bin/memory.js validate [app]
npm run check
```

Claude and Cursor expose focused commands:

```text
/maiw-clone     /maiw-register  /maiw-ensure  /maiw-learn   /maiw-resume
/maiw-handoff   /maiw-sync      /maiw-review  /maiw-status  /maiw-doctor  /maiw-help
```

`/maiw <operation>` remains the compact dispatcher fallback. Codex uses one native `$maiw` skill
with operations (`$maiw clone ...`, `$maiw resume ...`) to avoid advertising ten separate skills
and wasting context tokens. `node bin/maiw.js ...` is the deterministic universal fallback.
