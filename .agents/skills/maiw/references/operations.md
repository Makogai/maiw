# MAIW agent operations

## Learn

Inspect manifests, Git state, entry points, architecture boundaries, business behavior, tests, and
recurring change paths. Fill compact topic notes with `path:line` evidence. Update INDEX, NOW, and
`meta.json`; use `partial` until useful breadth is covered. Validate before finishing.

## Resume

Read NOW, then INDEX, then only notes required by NOW's exact next action. Compare current Git state
with the handoff. Continue the task without a broad rediscovery pass.

## Handoff

Write the goal, exact state, decisions, changed files, verification, blockers, and one executable
next action to NOW. Synchronize only notes made stale during the session and validate.

## Sync

Use Git diff/log plus relevant notes. Change only durable facts affected by code. Keep decision
history and refresh `sourceCommit` only after comprehensive synchronization.

## Review

Read relevant decisions and memory, inspect the current diff, and report correctness, security,
regression, test, and memory-drift findings with code evidence. Do not edit unless asked.

## Finish every memory mutation

Run `node <wrapper>/bin/memory.js validate <app>` and report status plus the next MAIW action.

