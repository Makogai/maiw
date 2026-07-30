# drivebay — Current handoff

## Goal

**KAN-92** dealer profile essentials on Account + API for mobile.

## Current state

- Local HEAD **`cace2cb`** (behind origin; large WIP).
- **KAN-92 / KAN-94 / KAN-95** (this session):
  - API: enriched `GET /dealer/storefront`; `PUT /dealer/storefront`
    essentials; `POST /dealer/storefront/branding` (logo|cover)
  - `updateStorefront` supports essentials-only (no theme wipe)
  - Web Account: inline `DealerProfileEssentialsForm` + clearer sidebar
    “Open →” action cards; Appearance stays Customize storefront
  - Route `PUT seller.dealer.profile`
  - Pest `DealerProfileEssentialsApiTest` green
- Still dirty: KAN-87 multi-contact, KAN-73, seller card, Filament, etc.
- Skip `docs/og-preview-mock.html` on commit

## Exact next action

1. Browser QA `/account` dealer section + sidebar cards.
2. Ask commit/push when QA ok.
3. Mark **KAN-92** Done after Flutter QA too.

## Decisions made

- Essentials on Account/phone; theme only in Customize storefront.
- Essentials PUT omits `storefront_settings` → theme untouched.

## Verification

- `php artisan test --filter=DealerProfileEssentialsApiTest` passed
