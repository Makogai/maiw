# drivebay-flutter — Current handoff

## Goal

Automate DriveBay Android open-beta Play releases with Fastlane + GitHub Actions (**Jira: KAN-72**).

## Current state

- App HEAD is **`c41e163`** on `main` (pushed).
- KAN-71 is already landed: release signing via `android/key.properties`, chat attach uses system picker only, and Play media permissions are stripped from the release manifest.
- New Play automation is committed on app `main`:
  - `android/fastlane/Appfile`
  - `android/fastlane/Fastfile`
  - `android/Gemfile`
  - `.github/workflows/play-beta.yml`
  - `.github/workflows/play-prod.yml`
  - `docs/development/play-release.md`
- Branch-based release flow is now active:
  - `preprd` branch -> Play `beta`
  - `prod` branch -> Play `production` with `draft` release status by default
- Workflows still build DriveBay only with `--flavor drivebay --dart-define=BRAND=drivebay`.
- GitHub repo secrets are now configured.
- Secret decoding is now whitespace-tolerant in CI for both the keystore and Play JSON, Play JSON also accepts raw JSON secret text, and both workflows auto-pad missing trailing `=` in base64 secrets.

## Exact next action

1. Push a test commit to `preprd` or manually rerun workflow `Play Beta`.
2. Confirm Play open beta upload succeeds from the new branch-based flow.
3. Later, push to `prod` when you want a production draft created in Play Console.
4. Mark **KAN-72** Done after the first successful branch-driven release run.

## Decisions made

- Play AABs use local upload keystore via `key.properties`.
- Chat media attach = system picker only (no broad gallery permissions). `(**Jira: KAN-71**)`
- Android Play automation lives in Fastlane + GitHub Actions, with branch flow `preprd -> beta` and `prod -> production draft`, plus manual `workflow_dispatch` fallback. `(**Jira: KAN-72**)`
- CI secret decoding should be whitespace-tolerant (Python decode), not raw `base64 --decode`, because pasted GitHub secrets may include formatting noise. `(**Jira: KAN-72**)`

## Verification

- Changed-file diagnostics clean for Fastlane/workflow/docs edits
- `flutter analyze` still reports only the existing repo-wide 35 info/warning items outside this slice
- App commits pushed:
  - `45c503c` — Play signing + media picker policy fix
  - `d5b68f3` — Fastlane + GitHub Actions for Play beta releases
  - `09b1f3f` — branch-driven beta and production release flows
  - `c41e163` — base64 padding fix for workflow secret decode
