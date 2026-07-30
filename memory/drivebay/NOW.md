# drivebay — Current handoff

## Goal

Ship **KAN-91** web dealer QR card + continue **KAN-87** multi-contact. **KAN-80**
QR reviews already on remote (`0a9ed54`).

## Current state

- App remote HEAD **`0a9ed54`** (KAN-80).
- Local **KAN-91** (this session, uncommitted):
  - `DealerQrCard.vue` (`qrcode` npm) → `{appUrl}/dealers/{slug}?src=qr`
  - On `/account` (dealer sidebar), storefront editor, domain page
  - Copy / download PNG / print; EN/SR `dealer.storefront.qr_*`; Vite build green
- Local **KAN-87** (teammate WIP, may share tree):
  - Migration multi-contact `phones` / `emails`; editor + public payload
  - Pest `DealerMultiContactTest` — 3 passed
- Also possibly dirty: KAN-73 viewing policies + KAN-79 Filament
- Flutter QR client at `d962551`.

## Exact next action

1. Ask commit/push `apps/drivebay` (KAN-91 QR; coordinate with KAN-87 dirty files).
2. Browser QA: Account + storefront → QR; multi-contact if present.
3. Mark **KAN-91** / **KAN-87** In Review after verify.

## Decisions made

- QR URL same as Flutter/KAN-80 (`src=qr`); use `marketplaceUrl || appUrl`.
- Multi-contact: JSON `{ label, value }` on `dealer_accounts`; scalar mirrors BC.

## Verification

- `npm run build` succeeded (DealerQrCard chunk present)
