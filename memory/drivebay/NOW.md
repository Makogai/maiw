# drivebay — Current handoff

## Goal

Ship seller-card mock parity on web + finish **KAN-87** multi-contact.
**KAN-91** QR is on remote.

## Current state

- Local HEAD **`cace2cb`** (behind `origin/main` by 1 — likely KAN-91).
- Uncommitted seller-card redesign (matches Flutter mock):
  - `ListingSellerCard.vue` — circular avatar, blue verified row, member since,
    rating+reviews right, soft Wrap pills (highly rated / responds fast /
    offers test drive / mechanic)
  - Presenter already sends `member_since_year`, `responds_fast` (stub false)
  - EN/SR `listing.verified_seller`, `member_since_year`, chip strings
- Still dirty: KAN-87 multi-contact, KAN-73 viewing policies, KAN-79 Filament
- Do **not** commit `docs/og-preview-mock.html`

## Exact next action

1. Hot reload / browser QA listing seller card vs mock.
2. Ask commit/push when QA ok (exclude og-preview-mock).
3. Continue KAN-87 QA (storefront editor → public → Flutter contacts).

## Decisions made

- Soft horizontal pills (not equal Expanded tiles); only show chips when true.
- `responds_fast` stays false until a real metric exists.

## Verification

- Local multi-contact Pest previously green; seller card UI pending visual QA
