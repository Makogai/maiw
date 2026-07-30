# drivebay-flutter — Conventions

## Verified commands

| Action | Command | Evidence |
|---|---|---|
| Install deps | `flutter pub get` | `README.md` |
| Generate freezed/json_serializable code | `dart run build_runner build --delete-conflicting-outputs` | `README.md` |
| Run (Windows desktop dev) | `flutter run -d windows --dart-define=API_BASE_URL=https://drivebay.test/api/v1` | `README.md` |
| Run brand (Android) | `flutter run --flavor drivebay --dart-define=BRAND=drivebay` (or `.\tool\run_brand.ps1 drivebay`) | `docs/development/branding.md` |
| Play release AAB (DriveBay) | `flutter build appbundle --release --flavor drivebay --dart-define=BRAND=drivebay` → `build/app/outputs/bundle/drivebayRelease/app-drivebay-release.aab` | `android/app/build.gradle.kts` |
| Play beta upload (local) | `cd android && bundle install && bundle exec fastlane beta` | `docs/development/play-release.md` |
| Play production draft (local) | `cd android && bundle install && bundle exec fastlane production` | `docs/development/play-release.md` |
| Run on device/emulator against LAN backend | `flutter run --dart-define=API_BASE_URL=https://<lan-ip>/api/v1 --dart-define=ALLOW_BAD_CERTIFICATES=true` | `README.md` |
| Lint | `flutter analyze` (config: `analysis_options.yaml`, `package:flutter_lints/flutter.yaml`) | `analysis_options.yaml` |

## Structure and naming

- `lib/core/` = cross-cutting infra, `lib/features/{name}/` = one screen area each;
  `lib/models/`, `lib/repositories/`, `lib/providers/`, `lib/widgets/`, `lib/theme/`,
  `lib/utils/` are shared/top-level (not per-feature).
- Models generated with `freezed`/`json_serializable` — look for `*.freezed.dart`/
  `*.g.dart` siblings; never hand-edit those, edit the source `*.dart` and regenerate.
- Dev test login (per `README.md`, matches drivebay's seeded admin account): `admin@drivebay.test` / `password`.

## Testing and error handling

- `test/` exists but wasn't inventoried in this pass (breadth-only learning) — check
  test coverage before assuming any feature has automated tests.
- `error_interceptor.dart` centralizes dio error handling — check there before adding
  ad-hoc try/catch around API calls.

## Gotchas

- Android release signing: `android/key.properties` + `android/upload-keystore.jks`
  (gitignored). `build.gradle.kts` uses the release config when `key.properties`
  exists; otherwise falls back to debug (Play rejects debug-signed AABs). Back up
  both files offline; never commit them.
- Fastlane local runs need Ruby + Bundler on the machine; this Windows box did not
  have them installed during the KAN-72 setup, so only the GitHub Actions path was
  directly executable here. Secrets/JSON stay out of git (`android/play-store.json`,
  keystore, `key.properties`).
- In CI, prefer pasting **raw** Play service-account JSON into
  `PLAY_STORE_JSON_BASE64` (starts with `{`). Base64 also works if complete;
  workflows strip whitespace, auto-pad `=`, and validate JSON before Fastlane.
  Truncated base64 produces “doesn't seem to be a JSON file”. `(**Jira: KAN-72**)`
- GitHub Actions branch flow:
  - `preprd` branch pushes trigger `Play Beta`
  - `prod` branch pushes trigger `Play Production Draft`
  Both still support manual `workflow_dispatch`. `(**Jira: KAN-72**)`
- Play rejects reused Android `versionCode`. Bump the `+N` in `pubspec.yaml`
  (`1.0.0+N`) before each upload that should land on Play. `(**Jira: KAN-72**)`
- Do **not** re-add `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` for gallery attach —
  Play rejects them when targeting API 33+. Use `image_picker` system pickers
  only (`**Jira: KAN-71**`). Manifest uses `tools:node="remove"` as a belt-and-suspenders
  strip if a plugin merges those permissions.
- Settings legal links use `Env.webBaseUrl` (derived from `API_BASE_URL` by stripping
  `/api/v1`). Point builds at the host that serves `/privacy` etc., or links open a
  wrong origin.

- README's relative doc links assume a nested-inside-drivebay layout that doesn't match
  this wrapper's sibling `apps/` structure — see `topics/architecture.md` "High-risk
  change areas".
- README's "Phase 1 scope" list is stale relative to the `lib/features/` folders that
  actually exist now (see `topics/domain.md`).

