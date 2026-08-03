# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-03): **KAN-106** Your viewing UI on listing from notification
pushed @ `74a90f6`. Prior: social login UI on `main` (`295c408`), **KAN-104** @
`d8fdae0`.

## Current state

- **KAN-106 (shipped `74a90f6`)**:
  - Route `/listings/:id?src=viewing&appointment={uuid}`
  - Banner + **Your viewing** CTA (hides Schedule); sheet with reschedule/cancel
  - Push/inbox route enrichment via `appointment_uuid`
  - Needs drivebay API `5563367` deployed for new `mobile_route` shape

- **KAN-105** social login client on `main` via `295c408`
- **KAN-104** multi make/model @ `d8fdae0`

## Exact next action

1. Hot-restart/rebuild phone after API deploy; QA notification → Your viewing
2. Confirm browse open still shows Schedule viewing
3. Move KAN-106 to Done after QA

## Decisions made

- Booked UI only when `src=viewing`, not on every listing open

## Verification

- `flutter gen-l10n` OK; analyze clean of new errors on touched files
