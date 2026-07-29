# drivebay-flutter — Current handoff

## Goal

Ship DriveBay Play closed-beta AAB with proper release signing.

## Current state

- App HEAD is still **`8299084`** on `main` (pushed). Local dirty: `android/app/build.gradle.kts` now loads release signing from `android/key.properties` + `android/upload-keystore.jks` (both gitignored).
- Verified release AAB: `build/app/outputs/bundle/drivebayRelease/app-drivebay-release.aab` signed `CN=DriveBay` (not Android Debug).
- SDK fix on this machine: installed `cmdline-tools/latest` under `%LOCALAPPDATA%\Android\Sdk`; `flutter doctor` clean.

## Exact next action

1. Back up offline: `android/upload-keystore.jks` + `android/key.properties` (lose = cannot update Play app with same upload key).
2. Upload the new AAB to Play closed testing.
3. Ask whether to commit/push the `build.gradle.kts` signing wiring (secrets stay untracked).
4. After first Play upload, put the **upload** cert SHA-256 into server `assetlinks.json` for App Links (**KAN-27**).

## Decisions made

- Play release builds use local upload keystore via Flutter’s `key.properties` pattern; debug fallback only if `key.properties` is missing.
- Edit profile v1 = name fields only. `(**Jira: KAN-61**)`
- Compare entry = app-bar icon. `(**Jira: KAN-70**)`

## Verification

- `flutter build appbundle --release --flavor drivebay --dart-define=BRAND=drivebay` → success; `keytool -printcert` on AAB `META-INF/UPLOAD.RSA` → Owner `CN=DriveBay,…`
