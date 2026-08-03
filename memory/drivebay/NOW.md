# drivebay — Current handoff

## Goal

Latest (2026-08-03): **Social login** (Google / Facebook / Apple) — [**KAN-105**](https://drivebayme.atlassian.net/browse/KAN-105)
on branch `feature/social-login` (based on `main` @ `4c4d8df`). **Uncommitted** in
`apps/drivebay` — do not treat as shipped until committed/pushed. UI polish: branded
`SocialAuthButtons.vue` (Google multicolor SVG, Facebook blue, Apple black).

Prior on `main`: **KAN-103** API locale fix @ `4c4d8df`.

## Current state

- Branch: `feature/social-login` @ working tree on top of `4c4d8df`.
- Packages: `laravel/socialite`, `socialiteproviders/apple` (composer.lock updated).
- Schema: `oauth_identities` table + nullable `users.password_hash` (DBML + migrations).
- `SocialAuthService::loginWithProviderUser(SocialProviderUser)` — find identity →
  auto-link verified email → create private verified user (`password_hash=null` +
  profile). Blocks banned/suspended + pending deletion (mirrors login).
- API: `POST /api/v1/auth/social/{provider}` (`google|facebook|apple`), throttle
  `api-auth`. Body: `access_token` and/or `id_token`, optional `device_name` /
  `full_name` (Apple).
- Web: guest `GET auth/{provider}/redirect`, `GET|POST auth/{provider}/callback`
  (Apple form_post; CSRF excepted). Branded buttons via `SocialAuthButtons.vue`
  on `Login.vue` / `Register.vue`.
- Password login returns `auth.login.social_only` when `password_hash` is null.
- Docs: `docs/auth/social-login-setup.md`, `docs/api/modules/auth.md`,
  `docs/flutter/mobile-api-changelog.md`, OpenAPI regenerated (includes
  `/v1/auth/social/{provider}`).
- Still dirty locally (ignore / do not commit with this work): `package-lock.json`,
  `docs/og-preview-mock.html`.

## Exact next action

1. **Ask user** “Want me to commit and push `apps/drivebay`?” (feature/social-login).
2. Fill OAuth console credentials (see `docs/auth/social-login-setup.md`) and migrate.
3. Flutter: wire native Google/Facebook/Apple SDKs → `POST /auth/social/{provider}`.
4. Prior backlog: deploy KAN-103 for mobile locale QA; PR moderation branch when ready.

## Decisions made

- Do **not** store provider access/refresh tokens long-term — only identity rows.
- Apple API uses SocialiteProviders `userByIdentityToken()` (JWKS verify); Google
  API accepts `access_token` (Socialite `userFromToken`) or `id_token` (Google
  tokeninfo); Facebook `access_token`.
- New social users are `type=private`, `status=active`, `email_verified_at=now()`,
  minimal `UserProfile` from provider name (no address/phone required).
- Web social session login does **not** use `remember` (users table has no
  `remember_token` column).

## Verification

- `ApiSocialAuthTest` + `WebSocialAuthTest` + `ApiAuthTest` +
  `ApiAccountDeletionRestoreTest`: **20 passed / 84 assertions**.
- Pint clean on dirty PHP.
- OpenAPI exported with sqlite/`memory_limit=512M` (local Postgres was down;
  `composer run api:docs` alone fails without DB).
- Not verified: live OAuth consoles, real Apple JWKS against production keys,
  Flutter SDK wiring.
