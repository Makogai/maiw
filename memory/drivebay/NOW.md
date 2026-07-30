# drivebay — Current handoff

## Goal

Continue **KAN-87** multi-contact / remaining **KAN-73** WIP. **KAN-91** web
dealer QR card is on `main`.

## Current state

- App remote HEAD **`c14bce5`** — `KAN-91: add dealer QR card on account and
  storefront pages.`
  - `DealerQrCard.vue` (`qrcode`) → `{appUrl}/dealers/{slug}?src=qr`
  - Mounted on `/account`, storefront editor, domain page
  - Copy / download PNG / print; EN/SR `dealer.storefront.qr_*`
- **KAN-80** reviews API + web rate panel earlier at `0a9ed54`.
- Flutter QR at `d962551`.
- Teammate may still have local **KAN-87** multi-contact WIP.

## Exact next action

1. Browser QA QR as dealer; mark **KAN-91** Done.
2. Land KAN-87 / KAN-73 remainder when ready.

## Decisions made

- Same QR URL as Flutter (`src=qr`); `marketplaceUrl || appUrl` base.

## Verification

- Pushed `c14bce5` to `origin/main`
- Vite build green pre-commit
