# drivebay-flutter — Current handoff

## Goal

- Local API debugging so LAN/device connection failures are visible in the console.

## Current state

- **DEBUG_API logging shipped in working tree** (pending app commit/push ask):
  - `Env.debugApi` / `debugApiDefineSet` / `isLocalDevApi`
  - `DebugApiInterceptor` logs method/path/status/timing/connection errors (no tokens/bodies)
  - Auto-on in debug builds against localhost / `*.test` / private LAN; force with
    `--dart-define=DEBUG_API=true|false`
  - Startup banner in `main.dart` prints resolved API base/host
  - README updated for LAN HTTP + DEBUG_API
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`
- Sibling Laravel note: `MARKETPLACE_HOSTS` must include LAN IP for web `/`; API health OK

## Exact next action

1. Ask human: commit/push `apps/drivebay-flutter`?
2. Hot restart / `flutter run` on device; watch console for `[DriveBayAPI]` lines.

## Decisions made this session

- Auto-enable debug API logs for local/LAN in `kDebugMode` so phones don’t need an extra
  define; explicit `DEBUG_API` overrides.

## Changed files

- `lib/config/env.dart`
- `lib/core/api/api_client.dart`
- `lib/core/api/interceptors/debug_api_interceptor.dart`
- `lib/main.dart`
- `README.md`

## Verification

- `flutter analyze` on touched files (see session)

## Blockers and unknowns

- Device still must reach `192.168.1.226:8000` on same Wi‑Fi; firewall may block.
