# MAIW wrapper guidance

When the user writes `/maiw ...` or `maiw ...`, read `core/MAIW.md` and execute that operation.
Use the repository skill at `.agents/skills/maiw/SKILL.md` whenever the request matches its
description, including natural-language MAIW requests.
Use `node bin/maiw.js` for deterministic clone/register/ensure/status/doctor behavior. For agent
operations, follow `core/OPERATING.md` and `core/MEMORY_STANDARD.md`. Keep memory provider-neutral,
compact, evidence-backed, and resumable. Never overwrite valid existing memory.
