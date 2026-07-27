Use the `maiw` skill to synchronize memory for: `$ARGUMENTS`.
Update only durable facts affected by current code changes, preserve decisions, refresh provenance
only when justified, and validate.

Use this whenever `apps/<name>` moved (including teammate commits) without a matching
`memory/<name>` update. After sync, **auto-commit and auto-push the wrapper** so other
machines stay current — do not wait for the user to ask.

