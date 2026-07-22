# MAIW command protocol

Interpret `maiw` or `/maiw` followed by one of these operations:

| Operation | Meaning |
|---|---|
| `clone <url> [name]` | Clone under `apps/`, preserve existing memory, register adapters, then learn only when memory is absent/unlearned. |
| `register [name]` | Register an already-cloned app; infer the current app when safe. Never ask for a URL. |
| `ensure <name> [url]` | Idempotently ensure code, memory, and all provider adapters exist. |
| `learn [name]` | Build or resume compact evidence-backed learning. Do not relearn current areas. |
| `resume [name]` | Read NOW, INDEX, then only notes needed for the next action. |
| `handoff [name]` | Write an exact continuation point and synchronize affected notes. |
| `sync [name]` | Reconcile only memory affected by code changes. |
| `review [name]` | Review current changes against code, decisions, and relevant memory. |
| `status [name]` | Show code/memory/adapters/freshness without changing anything. |
| `doctor [name]` | Validate wrapper structure, memory, adapters, Git exclusions, and stale provenance. |
| `help` | Show operations and examples. |

For deterministic operations (`clone`, `register`, `ensure`, `status`, `doctor`), run
`node <wrapper>/bin/maiw.js <operation> ...`. For agent operations (`learn`, `resume`, `handoff`,
`sync`, `review`), use the CLI result to identify the app, then follow OPERATING.md and the named
workflow. Never discard existing memory during clone/register. If memory exists, check freshness
before deciding whether any learning is needed.

