# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **KAN-107** finish-profile after social signup pushed
(await SHA after push). Needs deployed drivebay `6a5c809` + migrate.

Ticket: https://drivebayme.atlassian.net/browse/KAN-107

## Current state

- `User.profileCompletionRequired` + `/complete-profile` screen
- Gates: login/register/verify/bootstrap + GoRouter redirect
- Google Sign-In: no hanging authorizeScopes; surface fake-cancel as config error
- Docs: Android SHA-1 / Web client ID troubleshooting in `docs/social-login.md`
- `Env.googleServerClientId` default = Web OAuth client ID (not Android client)

## Exact next action

1. Confirm drivebay deploy + migrate on the API the app hits.
2. Rebuild app; QA brand-new Google account → finish-profile with required phone.
3. Move KAN-107 to Done after QA.

## Verification

- Built/analyzed locally during implementation; Attribution clean on commit.
