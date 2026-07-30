# drivebay-flutter — Current handoff

## Goal

Polish listing seller card + declutter dealer storefront; prep **KAN-87**
multi-contact (phones/emails with labels). **KAN-80** QR is on `main`.

## Current state

- App remote HEAD **`d962551`** — dealer QR profile card + QR-sourced rating
  (`DealerQrCard`, deep link `src=qr`, rate sheet → `POST …/reviews`).
- Local uncommitted (teammate tree, on top of KAN-81 storefront):
  - **Seller card**: cleaner card + divider; feature tiles in a **side-by-side
    Row** (test drive / mechanic / highly rated) — short labels
  - **Dealer hero**: decluttered (logo, verified/count, title, tagline,
    location·rating only). Policies + contacts moved below
  - **Contact card**: tappable rows showing the **number/email**; parses future
    `phones[]`/`emails[]`, falls back to scalar
  - Viewing options section on listing also side-by-side tiles
- When merging storefront + QR: keep `fromQr` rate CTA under dealer body.
- Jira: epic **KAN-87** + **KAN-88** (schema/editor), **KAN-89** (API),
  **KAN-90** (Flutter/web render)

## Exact next action

1. Hot restart; QA seller card chips + cleaner dealer header; also QR rate flow.
2. Align multi-contact with KAN-88/89 shape.
3. Ask commit/push when QA ok; mark **KAN-80** Done after QR QA.

## Decisions made

- Feature tiles use equal `Expanded` width so two policies sit next to each other
- Contact display = list the value; optional label above (Showroom / Mobile)
- Proposed API: `{ label, value }` arrays + keep scalar phone/email
- QR encodes web `/dealers/{slug}?src=qr`; rating only when `fromQr`

## Verification

- KAN-80 pushed: flutter `d962551`, drivebay `0a9ed54`
