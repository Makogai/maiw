# drivebay — Current handoff

## Goal

Latest (2026-08-04): **KAN-110** finish-profile private vs dealer — pushed to
`main` as `b47a674` (atop `83c7a5d` KAN-109). Ready for deploy + QA on
`dev.drivebay.me`.

Ticket: https://drivebayme.atlassian.net/browse/KAN-110

## Current state

- `POST /account/complete-profile` requires `account_type` (`individual`|`dealer`)
  + `phone`; `dealer_name` required_if dealer. Names still optional.
- Individual → `type=private`; dealer → `type=dealer_employee` + create
  `DealerAccount` / owner `DealerMember` via public
  `UserRegistrationService::createDealerAccount()` (idempotent if primary dealer
  already exists). Default `country_id` via `GeographyService` when missing.
- Web `CompleteProfile.vue` + Flutter finish-profile both show account-type cards.
- Docs: `docs/api/modules/account.md` + `docs/flutter/mobile-api-changelog.md`.
- Pushed: drivebay `b47a674`, flutter `46baf3c`. No new migration this slice.

## Exact next action

1. Deploy `apps/drivebay` `b47a674` to **dev** (no migrate required for KAN-110;
   ensure KAN-107 `profile_completed_at` migration is already applied).
2. QA: fresh social signup → individual completes as private; fresh social signup
   → dealer with phone + dealer name creates dealer account + owner membership.
3. Move KAN-110 to Done after QA.

## Verification

- `php artisan test --compact` ApiSocialAuthTest + WebSocialAuthTest +
  RegistrationTest → 28 passed (individual/dealer paths, 422s, idempotent).
- Flutter analyze on touched files → clean.
- Did not manually QA live OAuth end-to-end in this environment.
