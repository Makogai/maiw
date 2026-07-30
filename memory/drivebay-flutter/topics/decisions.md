# drivebay-flutter — Durable decisions

Record only decisions that future work must understand.

| Date | Decision | Why | Consequences | Evidence |
|---|---|---|---|---|
| 2026-07-28 | Brand identity is build-time: `--flavor` + `--dart-define=BRAND=` (DriveBay / AutoKlik packs) | Same app, Balkans rename without admin CMS; OS label needs flavor | Always pass both flags (or `tool/run_brand.ps1`); iOS display name / launcher PNG still manual | `lib/brand/brand.dart`, `docs/development/branding.md` |
| 2026-07-29 | Play AABs signed with local upload keystore via `android/key.properties` (Flutter pattern) | Play Console rejects debug-signed bundles | Secrets stay gitignored; machines need keystore+props to ship; update `assetlinks.json` with upload/Play cert SHA-256 | `android/app/build.gradle.kts`, `android/.gitignore` |
| 2026-07-30 | Chat media attach uses OS photo picker only (`ImagePicker.pickMultipleMedia`); no `READ_MEDIA_*` | Play photo/video permissions policy for API 33+ | Custom in-app gallery (`photo_manager`) removed; listing photos already used system picker | `message_gallery_picker_sheet.dart`, `AndroidManifest.xml`, **Jira: KAN-71** |
| 2026-07-30 | Android Play automation uses Fastlane + GitHub Actions `workflow_dispatch` for `beta` uploads | Need repeatable open-beta releases without local manual Play Console uploads | Release path is DriveBay-only for now; CI reconstructs keystore + Play JSON from repo secrets, builds the AAB, then runs `fastlane beta` | `.github/workflows/play-beta.yml`, `android/fastlane/Fastfile`, `docs/development/play-release.md`, **Jira: KAN-72** |
