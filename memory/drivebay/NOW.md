# drivebay — Current handoff

## Goal

Ship **KAN-87** multi-contact (phones/emails + country dialer). Keep **KAN-80**
QR reviews Done on remote; finish remaining **KAN-73** / **KAN-79** WIP in the
local tree.

## Current state

- App remote HEAD includes **KAN-80** QR dealer reviews (`0a9ed54` era).
- Local **KAN-87** (uncommitted with other WIP):
  - Migration `2026_07_30_183000_add_multi_contact_to_dealer_accounts` → JSON
    `phones` / `emails` (+ backfill); applied locally (pgsql)
  - `DealerContactNormalizer`; storefront dual-writes arrays + scalar mirrors
  - Public payload exposes `phones` / `emails`
  - Editor: PhoneInput with **flag + dial code**, multi emails; max 5 each
  - Public storefront hero + Contact page list labeled contacts
  - Pest `DealerMultiContactTest` — 3 passed
- Also dirty: KAN-73 viewing policies + KAN-79 Filament

## Exact next action

1. QA storefront: add phones via country picker + emails; check public + Flutter
2. Ask commit/push `apps/drivebay` (exclude `docs/og-preview-mock.html`)
3. Mark KAN-87 children In Review after QA

## Decisions made

- JSON on `dealer_accounts`; `{ label, value }` E.164 phones; scalar mirrors BC
- Reuse `PhoneInput` / `usePhoneCountries` (no new npm lib)
- QR reviews (KAN-80): `?src=qr`, `source: qr`, one review per user/dealer
