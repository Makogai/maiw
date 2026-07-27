---
name: maiw
description: Manage portable, low-token continuity for Makogai in-house apps. Use when the user mentions MAIW, /maiw, cloning or registering an app in the wrapper, learning compact project memory, resuming work on another computer, creating a handoff, synchronizing memory, reviewing with saved context, checking wrapper status, or diagnosing adapters.
---

# MAIW

Locate the nearest ancestor containing `.ai-wrapper`; this is the wrapper. Product apps live under
`apps/`, canonical memory under `memory/`, and deterministic operations in `bin/maiw.js`.

## Route the operation

1. Parse the requested operation and arguments.
2. For `clone`, `register`, `ensure`, `status`, or `doctor`, run:

   ```bash
   node <wrapper>/bin/maiw.js <operation> [arguments]
   ```

3. For `learn`, `resume`, `handoff`, `sync`, or `review`, run the dispatcher first to resolve the
   app, then follow [operations.md](references/operations.md).
4. Preserve existing memory. Never relearn current areas merely because a new machine registered
   the app.
5. Load `NOW.md` and `INDEX.md` first; load topic notes only when the operation needs them.

Ask for approval before network cloning. Never store credentials, personal data, or customer data.
After any `apps/<app>/` code change, updating `memory/<app>/` + validating + pushing the wrapper is
**mandatory** before the task is done (`core/OPERATING.md` §7).
Never set the AI as a contributor (no git author/`Co-authored-by`/CONTRIBUTORS credit); see
`core/OPERATING.md` §9–10 and `core/ATTRIBUTION.md`. Pause before commit/push; prefer the human.

