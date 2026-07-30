# drivebay-flutter — Current handoff

## Goal

Clear Play Console photo/video permissions policy block for closed beta (**Jira: KAN-71**).

## Current state

- App HEAD still **`8299084`** on `main`; **local uncommitted** fix for KAN-71 + prior release signing wiring.
- Chat attach uses OS picker (`ImagePicker.pickMultipleMedia`); removed `photo_manager` / `permission_handler` custom gallery.
- Manifest strips `READ_MEDIA_*` (+ `READ_EXTERNAL_STORAGE`) via `tools:node="remove"`.
- Version **`1.0.0+2`**. Merged drivebayRelease manifest has **no** `READ_MEDIA_IMAGES`/`VIDEO`.
- Signed AAB ready: `build/app/outputs/bundle/drivebayRelease/app-drivebay-release.aab`.
- Release signing: `android/key.properties` + `upload-keystore.jks` (gitignored).

## Exact next action

1. Commit/push `apps/drivebay-flutter` (ask user) — include signing gradle + KAN-71 media picker changes; **never** commit keystore/key.properties.
2. Re-upload AAB (versionCode 2) to Play closed testing.
3. Mark **KAN-71** Done after Play accepts.

## Decisions made

- Play AABs use local upload keystore via `key.properties`.
- Chat media attach = system picker only (no broad gallery permissions). `(**Jira: KAN-71**)`

## Verification

- `flutter analyze lib/features/messages` — clean
- Merged release manifest — no READ_MEDIA_IMAGES/VIDEO
- AAB built with flavor `drivebay`, BRAND=drivebay, versionCode 2
