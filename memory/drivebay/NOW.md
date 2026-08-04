# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-110** finish-profile now asks private/individual vs
dealer — **uncommitted** on `main` atop `83c7a5d` (KAN-109, now committed).

Ticket: https://drivebayme.atlassian.net/browse/KAN-110

## Current state

- `CompleteProfileRequest`: `account_type` required (`individual`|`dealer`),
  `dealer_name` required_if dealer (max:255), phone still required, names still
  optional, plus optional dealer address fields mirroring `RegisterRequest`.
- `UserProfileService::completeProfile()` (new) drives both branches:
  individual → `type=private` if still private/unset; dealer → `type=dealer_employee`,
  profile `display_name` = `dealer_name`, and `DealerAccount` + owner `DealerMember`
  created via `UserRegistrationService::createDealerAccount()` (now **public**, reused
  as-is) **only if** `DealerAccessService::primaryDealerFor($user)` is still null
  (idempotent — re-submitting dealer never creates a second org). Missing
  `country_id` on the dealer payload defaults via `GeographyService::defaultCountryId()`
  (`dealer_accounts.country_id` is NOT NULL).
- `AccountApiController::completeProfile` + web `CompleteProfileController` both call
  the new service method.
- Web `CompleteProfile.vue`: individual/dealer account-type cards (mirrors
  `Register.vue`), conditional `dealer_name` input.
- Lang EN+SR `auth.finish_profile.{account_type,individual,individual_hint,dealer,
  dealer_hint,dealer_name_label,dealer_name_hint}` added (reused register-flow phrasing
  where possible).
- Flutter `CompleteProfileScreen`: reuses existing `AccountTypeCard` widget + arb keys
  already shipped with KAN-107 register flow (`accountTypeIndividual`,
  `accountTypeDealer`, `dealerNameLabel`, `dealerNameHint`, `howWillYouUseDriveBay` —
  no new l10n keys needed). `_submit()` sends `account_type` + `dealer_name` (dealer
  only). `AccountRepository.completeProfile()` docblock updated.
- Docs: `docs/api/modules/account.md` + `docs/flutter/mobile-api-changelog.md` updated
  for the new required/conditional fields.

## Exact next action

1. Ask user whether to commit/push `apps/drivebay` and `apps/drivebay-flutter`
   (KAN-110 changes are uncommitted in both).
2. After push + deploy + migrate (no new migration this time, schema unchanged),
   QA: fresh social signup → individual completes as `type=private`; fresh social
   signup → dealer with only `dealer_name`+phone creates a `DealerAccount` with the
   default country and an owner `DealerMember`.
3. Move KAN-110 to Done after QA.

## Verification

- `php artisan test --compact tests/Feature/Api/V1/ApiSocialAuthTest.php
  tests/Feature/WebSocialAuthTest.php tests/Feature/RegistrationTest.php` → 28 passed.
  Covers: individual completes private, dealer creates `dealer_accounts` + membership,
  missing `account_type` → 422, dealer without `dealer_name` → 422, idempotent re-submit.
- `flutter analyze` on the two changed Flutter files → no issues.
- Did not run the full backend suite this pass (pre-existing unrelated failures noted
  in prior KAN-109 handoff still apply — not re-verified this session).
- Did not manually QA against a real Google/Facebook account end-to-end (no live OAuth
  creds in this environment) — API/web tests above simulate the flow via factories.
