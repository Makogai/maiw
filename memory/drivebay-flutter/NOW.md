# drivebay-flutter — Current handoff

## Goal

Seller card matches product mock; storefront + multi-contact consume ready.

## Current state

- Local HEAD **`0bc1b3a`** (behind origin by 1 / QR may be on remote).
- Uncommitted seller card = mock layout:
  - Circular avatar · name · blue “Verified Seller” · “Member since {year}”
  - Rating + “(N reviews)” + chevron on the right
  - Soft grey Wrap pills: Highly rated / Responds fast / Offers test drive /
    Offers mechanic visit (only when true)
  - Model: `memberSinceYear`, `respondsFast`; l10n EN/SR regenerated
- Also local: KAN-81 storefront header/widgets, viewing options, multi-contact
  parse on dealer profile
- When merging with QR (`d962551`+): keep `fromQr` rate CTA under dealer body

## Exact next action

1. Hot **restart** (not just reload) and QA listing seller card vs mock.
2. Note: “Responds fast” won’t show until API sets `responds_fast: true`.
3. Ask commit/push when QA ok.

## Decisions made

- Soft Wrap pills (not stretched equal tiles) — matches mock
- Highly rated = avg ≥ 4.5 and count ≥ 3
- Contact rows list actual phone/email values

## Verification

- `flutter gen-l10n` + `build_runner` ran successfully this session
