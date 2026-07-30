# drivebay-flutter — Current handoff

## Goal

Automate DriveBay Android open-beta Play releases with Fastlane + GitHub Actions (**Jira: KAN-72**).

## Current state

- Play JSON secret is valid; Fastlane authenticated and reached upload.
- Latest CI failure: `Version code 2 has already been used` on Play track `beta`.
- Local (uncommitted) bump: `pubspec.yaml` → `1.0.0+3` (versionName 1.0.0, versionCode 3).
- App remote HEAD still **`6508d5b`** on `main` / `preprd` / `prod` until bump is committed and pushed.

## Exact next action

1. Commit + push `pubspec.yaml` version bump to `main`, then update `preprd` (and `prod` if desired).
2. Re-run **Play Beta** on `preprd`.
3. Mark **KAN-72** Done after first successful open-beta upload.

## Decisions made

- Prefer raw JSON for `PLAY_STORE_JSON_BASE64`. `(**Jira: KAN-72**)`
- Each Play upload needs a monotonically increasing Android `versionCode` (`+N` in pubspec).

## Verification

- CI log: supply authenticated; failure only on duplicate versionCode 2.
