# drivebay — Current handoff

## Goal

**KAN-90** listing contact lists all dealer phones/emails; listing chips lighter.

## Current state

- Local HEAD **`cace2cb`** (large WIP still uncommitted).
- **KAN-90** (this session, In Review):
  - `ContactChannelBuilder` / `ListingContactPresenter` emit `phones[]` + `emails[]`
    (legacy singular kept)
  - Web: `ListingContactButtons.vue` + `ListingSellerCard.vue` list every row
- Seller/viewing chips: viewing = stacked rows; seller feature pills = **2-col grid**
  (web + Flutter)
- Prior WIP still dirty: KAN-92 essentials, KAN-87 schema, KAN-73, Filament, etc.
- Skip `docs/og-preview-mock.html` on commit

## Exact next action

1. Browser QA listing detail Contact with multi-phone dealer.
2. Ask commit/push when QA ok.
3. Mark **KAN-90** Done after mobile QA too.

## Decisions made

- Listing contact uses storefront multi-contact lists; WhatsApp/Viber stay on primary phone.
- Chips stay stacked columns; lighter fill, no heavy borders.

## Verification

- `php artisan test --filter=ListingContactChannelsTest` passed (4)
