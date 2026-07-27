# drivebay — Current handoff

## Goal

- Backend bug queue: **KAN-7** Horizon/Autodiler timeout ordering.

## Current state

- **KAN-41 Done** — `937ee72`.
- **KAN-7 implemented locally (uncommitted)**:
  - Dedicated `redis-imports` connection (`retry_after` 1200s) + `supervisor-imports`
    (timeout 960s), listed in all Horizon environments
  - `ImportAutodilerListingsJob` routes there when `QUEUE_CONNECTION=redis`
  - Ordering: job 900 < supervisor 960 < retry_after 1200

## Exact next action

1. Human: commit + push KAN-7 on `apps/drivebay`.
2. After Coolify deploy: restart Horizon so `supervisor-imports` starts.
3. Next ticket: **KAN-9** (`favorites_count`).

## Verification

- Config/diff review; Autodiler API tests green (per implementer).
- Critical fix vs implementer draft: `supervisor-imports` must appear under
  `environments.*` or Horizon never starts it.
