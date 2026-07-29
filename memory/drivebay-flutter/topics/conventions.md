# drivebay-flutter — Conventions

## Verified commands

| Action | Command | Evidence |
|---|---|---|
| Install deps | `flutter pub get` | `README.md` |
| Generate freezed/json_serializable code | `dart run build_runner build --delete-conflicting-outputs` | `README.md` |
| Run (Windows desktop dev) | `flutter run -d windows --dart-define=API_BASE_URL=https://drivebay.test/api/v1` | `README.md` |
| Run brand (Android) | `flutter run --flavor drivebay --dart-define=BRAND=drivebay` (or `.\tool\run_brand.ps1 drivebay`) | `docs/development/branding.md` |
| Play release AAB (DriveBay) | `flutter build appbundle --release --flavor drivebay --dart-define=BRAND=drivebay` → `build/app/outputs/bundle/drivebayRelease/app-drivebay-release.aab` | `android/app/build.gradle.kts` |
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
- Settings legal links use `Env.webBaseUrl` (derived from `API_BASE_URL` by stripping
  `/api/v1`). Point builds at the host that serves `/privacy` etc., or links open a
  wrong origin.

- README's relative doc links assume a nested-inside-drivebay layout that doesn't match
  this wrapper's sibling `apps/` structure — see `topics/architecture.md` "High-risk
  change areas".
- README's "Phase 1 scope" list is stale relative to the `lib/features/` folders that
  actually exist now (see `topics/domain.md`).

