# drivebay-flutter — Conventions

## Verified commands

| Action | Command | Evidence |
|---|---|---|
| Install deps | `flutter pub get` | `README.md` |
| Generate freezed/json_serializable code | `dart run build_runner build --delete-conflicting-outputs` | `README.md` |
| Run (Windows desktop dev) | `flutter run -d windows --dart-define=API_BASE_URL=https://drivebay.test/api/v1` | `README.md` |
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

- README's relative doc links assume a nested-inside-drivebay layout that doesn't match
  this wrapper's sibling `apps/` structure — see `topics/architecture.md` "High-risk
  change areas".
- README's "Phase 1 scope" list is stale relative to the `lib/features/` folders that
  actually exist now (see `topics/domain.md`).

