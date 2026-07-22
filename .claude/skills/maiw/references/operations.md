# MAIW operations for Claude

- **learn:** Inspect project breadth, write only reusable non-obvious facts with `path:line`
  evidence, update metadata and handoff, then validate. Leave status partial when gaps remain.
- **resume:** Read NOW and INDEX, compare Git state, load only relevant topics, and perform the exact
  next action without relearning the application.
- **handoff:** Capture goal, exact state, decisions, changed files, verification, blockers, and next
  action. Synchronize only affected notes.
- **sync:** Reconcile current Git changes with only the memory they invalidate. Preserve decisions.
- **review:** Review the diff against current code, relevant memory, and decisions; report findings
  with evidence and do not edit unless asked.

After memory changes run `node <wrapper>/bin/memory.js validate <app>`.

