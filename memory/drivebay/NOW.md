# drivebay — Current handoff

## Goal

Session shipped to `main`; Jira + Confluence synced.

## Current state

- Local/remote HEAD **`5c23464`** (rebased onto QR `c14bce5` / `0a9ed54`).
- Shipped this batch (Done):
  - **KAN-90** multi-contact listing UI (API + web)
  - **KAN-94** dealer essentials API + branding
  - **KAN-95** Account Dealer profile essentials (coexists with KAN-91 QR card)
  - Viewing policy migrations + Filament/admin touch-ups
- Confluence: [Multi-contact & dealer essentials](https://drivebayme.atlassian.net/wiki/spaces/DW/pages/5472259/Multi-contact+dealer+essentials+Jul+2026)
- Still untracked locally: `docs/og-preview-mock.html` (do not commit)

## Exact next action

1. Run migrations on environments that need them (`2026_07_30_160000_*`, `2026_07_30_183000_*`).
2. Browser smoke: Account essentials + listing multi-contact + QR card still present.
3. Optionally close parent epics **KAN-87** / **KAN-92** when remaining children are clear.

## Decisions made

- Listing contact uses storefront multi-contact lists; WhatsApp/Viber stay on primary phone.
- Theme/appearance stays in Customize storefront; essentials on Account/API.

## Verification

- Rebase conflict in `Account/Index.vue` resolved (QR + essentials imports).
- Prior Pest filters for contact channels / essentials / viewing policies were included in the commit.
