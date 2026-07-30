# drivebay-flutter — Current handoff

## Goal

Polish **KAN-81** dealer storefront on phone to web parity (gradient, dots,
surface cards), keep friend’s seller card alone, and land with **KAN-80** QR
when that tree merges.

## Current state

- App remote HEAD **`0bc1b3a`**.
- Local uncommitted **KAN-81** redesign:
  - Full-bleed hero (no AppBar): gradient/solid/glass → cover @ overlay opacity
    → dotted pattern (banner + `show_hero_pattern`) → logo tile / chips / social
  - Floating back (listing-style)
  - About / highlights / contact as themed surface cards
  - Inventory section on storefront page bg
  - Listing Viewing options section still on detail (KAN-82); MediaUrl parse
    harden (KAN-84)
- Memory mentions KAN-80 QR on another machine — not present in this working
  tree; when merging, re-attach rate CTA under storefront body.

## Exact next action

1. Hot restart; QA dealer profile vs web storefront (pattern, cover, about).
2. Ask commit/push `apps/drivebay-flutter` (+ drivebay KAN-73 if ready).
3. Mark KAN-81 children In Review after QA.

## Decisions made

- Web layer order for hero; dots only when banner + show_hero_pattern.
- Do not edit `listing_seller_card.dart`.
- Cover uses opacity (not heavy dark scrim) so gradient shows through.
