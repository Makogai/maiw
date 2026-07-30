# drivebay-flutter — Current handoff

## Goal

Automate DriveBay Android open-beta Play releases with Fastlane + GitHub Actions (**Jira: KAN-72**).

## Current state

- App HEAD is **`6508d5b`** on `main` / `preprd` / `prod` (pushed).
- Branch flow: `preprd` → Play `beta`, `prod` → Play `production` draft.
- Latest CI failure: Fastlane reported `play-store.json` is not valid JSON — GitHub secret `PLAY_STORE_JSON_BASE64` was almost certainly truncated/mangled when pasted as base64.
- Workflows now validate decoded Play JSON before Fastlane and accept **raw JSON** paste into `PLAY_STORE_JSON_BASE64`.

## Exact next action

1. Update GitHub secret `PLAY_STORE_JSON_BASE64` with the **raw contents** of `D:\code\secrets\drivebay-d54b67d205b5.json` (starts with `{`).
2. Re-run `Play Beta` on `preprd`.
3. Mark **KAN-72** Done after first successful open-beta upload.

## Decisions made

- Prefer raw JSON for `PLAY_STORE_JSON_BASE64` over base64 when pasting into GitHub Secrets — avoids truncation/padding issues. `(**Jira: KAN-72**)`

## Verification

- Local service-account JSON roundtrips cleanly (2350 chars, valid JSON).
- App commits include `6508d5b` Play JSON validation + docs preference for raw JSON paste.
