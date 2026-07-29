# drivebay-flutter — Current handoff

## Goal

Ship Play internal testing build against the host that serves legal pages.

## Current state

- App HEAD **`f711035`** (pushed): Settings → LEGAL opens Privacy / Terms /
  Cookies / Account deletion via `Env.webBaseUrl` + path.
- Backend legal pages live on drivebay **`a315547`**.

## Exact next action

Build Play testing AAB with production `API_BASE_URL` so legal links resolve;
complete Play Console privacy + account-deletion fields.
