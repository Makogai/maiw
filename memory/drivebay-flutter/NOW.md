# drivebay-flutter — Current handoff

## Goal

Automate DriveBay Android open-beta Play releases with Fastlane + GitHub Actions (**Jira: KAN-72**).

## Current state

- App HEAD is **`d5b68f3`** on `main` (pushed).
- KAN-71 is already landed: release signing via `android/key.properties`, chat attach uses system picker only, and Play media permissions are stripped from the release manifest.
- New Play automation is committed on app `main`:
  - `android/fastlane/Appfile`
  - `android/fastlane/Fastfile`
  - `android/Gemfile`
  - `.github/workflows/play-beta.yml`
  - `docs/development/play-release.md`
- Workflow target is DriveBay Android open testing (`beta`) only, using `--flavor drivebay --dart-define=BRAND=drivebay`.
- GitHub Actions still needs repository secrets for the keystore + Play service-account JSON before the first automated upload can run.

## Exact next action

1. Add GitHub repo secrets:
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - `PLAY_STORE_JSON_BASE64`
2. Run GitHub Actions workflow `Play Beta` manually and upload to Play `beta`.
3. Mark **KAN-72** Done after the first workflow-driven open-beta upload succeeds.

## Decisions made

- Play AABs use local upload keystore via `key.properties`.
- Chat media attach = system picker only (no broad gallery permissions). `(**Jira: KAN-71**)`
- Android Play automation lives in Fastlane + GitHub Actions, with manual `workflow_dispatch` for `beta`. `(**Jira: KAN-72**)`

## Verification

- Changed-file diagnostics clean for Fastlane/workflow/docs edits
- `flutter analyze` still reports only the existing repo-wide 35 info/warning items outside this slice
- App commits pushed:
  - `45c503c` — Play signing + media picker policy fix
  - `d5b68f3` — Fastlane + GitHub Actions for Play beta releases
