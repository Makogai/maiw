# drivebay-flutter — Current handoff

## Goal

**KAN-92 / KAN-93** dealer settings editable on phone from Profile.

## Current state

- Local HEAD **`0bc1b3a`**.
- **Dealer settings** (this session):
  - Profile hub card (dealers only) → `/account/dealer-settings`
  - Edit identity, phones/emails, viewing defaults, logo/cover
  - Uses `GET/PUT /dealer/storefront` + branding POST
  - Repo: `DealerSettingsRepository`; model `ManagedDealerProfile`
- Also local: seller card mock, storefront header, multi-contact parse

## Exact next action

1. Hot restart; as dealer open Profile → Dealer settings; save + upload.
2. Ask commit/push when QA ok.

## Decisions made

- Mobile = essentials only (no theme/domain editor).
- Phones expect E.164 (`+…`).

## Verification

- `flutter gen-l10n` + `dart analyze` (dealer settings files) clean of errors
