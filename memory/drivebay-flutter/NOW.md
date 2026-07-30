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
- GitHub repo secrets are now configured.
- One local follow-up fix is prepared but **not yet committed/pushed**: `.github/workflows/play-beta.yml` now decodes `PLAY_STORE_JSON_BASE64` via Python, stripping whitespace safely and also accepting raw JSON secrets. This fixes `base64: invalid input` seen on the first run.

## Exact next action

1. Commit/push the workflow decode hotfix in `apps/drivebay-flutter`.
2. Re-run GitHub Actions workflow `Play Beta` and upload to Play `beta`.
3. Mark **KAN-72** Done after the first workflow-driven open-beta upload succeeds.

## Decisions made

- Play AABs use local upload keystore via `key.properties`.
- Chat media attach = system picker only (no broad gallery permissions). `(**Jira: KAN-71**)`
- Android Play automation lives in Fastlane + GitHub Actions, with manual `workflow_dispatch` for `beta`. `(**Jira: KAN-72**)`
- Play JSON secret decode in CI should be whitespace-tolerant (Python decode), not raw `base64 --decode`, because pasted GitHub secrets may include formatting noise. `(**Jira: KAN-72**)`

## Verification

- Changed-file diagnostics clean for Fastlane/workflow/docs edits
- `flutter analyze` still reports only the existing repo-wide 35 info/warning items outside this slice
- App commits pushed:
  - `45c503c` — Play signing + media picker policy fix
  - `d5b68f3` — Fastlane + GitHub Actions for Play beta releases
- Local uncommitted follow-up: `play-beta.yml` Play JSON decode hotfix for `base64: invalid input`
