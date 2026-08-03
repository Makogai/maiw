# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-03): **Social login UI + client flow** — [**KAN-105**](https://drivebayme.atlassian.net/browse/KAN-105)
on `feature/social-login` (uncommitted, based on `main` @ `7a85f48`). Matches drivebay
`POST /api/v1/auth/social/{provider}` (`google`|`facebook`|`apple`). UI polish: branded
buttons (`SocialBrandIcon` + Google white / Facebook `#1877F2` / Apple black).

Prior: **EN/SR translation audit** on `main` @ `7a85f48`; **KAN-101** moderation
tools v2 on `feature/kan-100-moderation-mode`.

## Social login (2026-08-03, uncommitted on `feature/social-login`)

- Packages: `google_sign_in` ^7.2.0, `flutter_facebook_auth` ^7.1.5,
  `sign_in_with_apple` ^8.1.0.
- `SocialAuthService` (`lib/core/auth/social_auth_service.dart`) obtains native
  tokens; `SocialAuthTokens.toRequestBody` builds the API payload.
- `AuthRepository.loginWithSocial` → `POST /auth/social/{provider}`; stores
  Sanctum token like password login.
- `AuthNotifier.loginWithSocial` → `_completeSignIn` (favorites, locale, FCM,
  experiments/platform config).
- UI: branded `SocialLoginButtons` on `LoginScreen` (above email) and register step 0;
  Apple always on iOS, else `SignInWithApple.isAvailable()`. Icons in
  `lib/features/auth/widgets/social_brand_icons.dart`.
- Optional `--dart-define=GOOGLE_SERVER_CLIENT_ID` for Google `id_token`.
- Platform stubs (placeholders only): Android Facebook strings/manifest; iOS
  Info.plist URL schemes + Facebook keys; Sign in with Apple entitlement.
  Setup notes: `docs/social-login.md`.
- EN+SR arb keys: `continueWithGoogle|Facebook|Apple`, `orContinueWithEmail`,
  `socialLoginFailed`.
- Verified: `flutter gen-l10n`, `flutter analyze` on touched auth/config paths
  (2 pre-existing infos only), `flutter test test/social_auth_tokens_test.dart`
  (4/4). NOT verified: live Google/Facebook/Apple consoles or real token exchange.

## Exact next action

1. Fill real Facebook App ID / client token (Android strings + iOS Info.plist)
   and Google Web client ID via dart-define; enable Apple capability on the App ID.
2. QA against drivebay `feature/social-login` API with real provider tokens.
3. Ask user to commit/push `apps/drivebay-flutter` when ready (do not auto-push).

## Decisions made

- Prefer Google `id_token`; fall back to access token via `authorizeScopes` if
  no server client ID.
- User cancel of native sheets is silent (`SocialAuthCancelledException`).
- No new Jira ticket found specifically for mobile social login (search hit only
  unrelated KAN-86 dealer social links).

## Verification

- Unit: `social_auth_tokens_test.dart` green.
- Analyze: no new issues on touched files.
- Runtime social SDKs: not exercised in this session.
