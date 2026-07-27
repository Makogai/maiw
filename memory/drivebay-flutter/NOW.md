# drivebay-flutter — Current handoff

## Goal

- Local API debugging so LAN/device connection failures are visible in the console.

## Current state

- **KAN-39 Done** — pushed `1a1d51b` (keep previous listing detail on reopen).
- **DEBUG_API logging still local only** (not committed):
  - `Env.debugApi` / `debugApiDefineSet` / `isLocalDevApi`
  - `DebugApiInterceptor` logs method/path/status/timing/connection errors (no tokens/bodies)
  - Auto-on in debug builds against localhost / `*.test` / private LAN; force with
    `--dart-define=DEBUG_API=true|false`
  - Startup banner in `main.dart`; README updated
- Default `API_BASE_URL` remains `http://192.168.1.226:8000/api/v1`
- Backend image optimization planned: **KAN-40** (WebP + variants at process time)

## Exact next action

1. Ask human: commit/push remaining DEBUG_API work if desired.
2. When prioritized: consume **KAN-40** WebP/variant URLs in Flutter once API exposes them.

## Decisions made this session

- Auto-enable debug API logs for local/LAN in `kDebugMode`; explicit `DEBUG_API` overrides.

## Changed files

- (pending) DEBUG_API: `lib/config/env.dart`, `api_client.dart`, `debug_api_interceptor.dart`,
  `main.dart`, `README.md`

## Verification

- KAN-39: product-verified reopen with no spinner flash.
