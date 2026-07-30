# drivebay-flutter — Current handoff

## Goal

Polish listing seller card + declutter dealer storefront; prep **KAN-87**
multi-contact (phones/emails with labels).

## Current state

- Local uncommitted (on top of KAN-81 storefront):
  - **Seller card**: cleaner card + divider; feature tiles in a **side-by-side
    Row** (test drive / mechanic / highly rated) — short labels
  - **Dealer hero**: decluttered (logo, verified/count, title, tagline,
    location·rating only). Policies + contacts moved below
  - **Contact card**: tappable rows showing the **number/email** (not just
    “Call”); parses future `phones[]`/`emails[]`, falls back to scalar
  - Viewing options section on listing also side-by-side tiles
- Jira: epic **KAN-87** + children **KAN-88** (schema/editor), **KAN-89**
  (API), **KAN-90** (Flutter/web render)

## Exact next action

1. Hot restart; QA seller card chips side-by-side + cleaner dealer header
2. User working multi-contact backend in parallel — align with KAN-88/89 shape
3. Ask commit/push when QA ok

## Decisions made

- Feature tiles use equal `Expanded` width so two policies sit next to each other
- Contact display = list the value; optional label above (Showroom / Mobile)
- Proposed API: `{ label, value }` arrays + keep scalar phone/email
