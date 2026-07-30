# drivebay-flutter — Current handoff

## Goal

Automate DriveBay Android open-beta Play releases with Fastlane + GitHub Actions (**Jira: KAN-72**).

## Current state

- App HEAD is **`d4693dd`** on `main` and `preprd` (pushed): `pubspec.yaml` → `1.0.0+3`.
- Play JSON secret is valid; previous failure was duplicate versionCode 2.
- Push to `preprd` should trigger **Play Beta** with versionCode 3.

## Exact next action

1. Confirm GitHub Actions **Play Beta** succeeds on `preprd`.
2. Mark **KAN-72** Done after first successful open-beta upload.
3. Optionally fast-forward `prod` to `d4693dd` before production draft uploads.

## Decisions made

- Prefer raw JSON for `PLAY_STORE_JSON_BASE64`. `(**Jira: KAN-72**)`
- Each Play upload needs a monotonically increasing Android `versionCode` (`+N` in pubspec).

## Verification

- Commit `d4693dd` on `main` + `preprd`; clean attribution on commit.
