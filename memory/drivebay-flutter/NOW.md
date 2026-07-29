# drivebay-flutter — Current handoff

## Goal

Point Settings at public legal URLs for Play readiness; commit app.

## Current state

- **Local (uncommitted):** Settings → LEGAL section opens web Privacy / Terms /
  Cookies / Account deletion via `Env.webBaseUrl` + path (`url_launcher`).
  New l10n keys in `app_en.arb` / `app_sr.arb` (gen-l10n run).
- Depends on Laravel hosting those paths (see drivebay
  `docs/operations/legal-and-play-console.md`).
- Last pushed HEAD **`ca4572a`** (AutoKlik trust blue).

## Exact next action

Commit+push when ready; build Play internal testing AAB with production
`API_BASE_URL` / web origin so legal links resolve on the public site.
