---
name: maiw
description: Portable low-token continuity for Makogai in-house apps. Use for /maiw operations, cloning and registering apps, compact learning, cross-computer resume, handoffs, memory synchronization, review, status, and adapter diagnostics.
argument-hint: "<clone|register|ensure|learn|resume|handoff|sync|review|status|doctor|help> [args]"
---

# MAIW

Find the nearest ancestor containing `.ai-wrapper`; treat it as the wrapper root.

For deterministic operations, execute:

```bash
node <wrapper>/bin/maiw.js <operation> [arguments]
```

Operations `clone`, `register`, `ensure`, `status`, and `doctor` are deterministic. Ask before a
network clone. Operations `learn`, `resume`, `handoff`, `sync`, and `review` begin with the dispatcher
and continue using [operations.md](references/operations.md).

Always read `memory/<app>/NOW.md` then `INDEX.md`; load only relevant topics. Preserve valid memory,
avoid broad relearning, cite code evidence, and never store secrets or personal/customer data.
After any `apps/<app>/` code change, updating `memory/<app>/` + `node bin/memory.js validate <app>`
+ **auto-commit/push of the wrapper** is **mandatory** before calling the task done
(`core/OPERATING.md` §7 and §10). Do not wait for the user to ask to push memory.
Never set the AI as a contributor (no git author/`Co-authored-by`/CONTRIBUTORS credit); see
`core/OPERATING.md` §9–10 and `core/ATTRIBUTION.md`.

