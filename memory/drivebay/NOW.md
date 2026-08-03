# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-106** viewing notification → listing appointment focus
pushed @ `5563367`. Prior: social login on `main` (`f241851`), **KAN-104** @
`d0c6571`.

## Current state

- **KAN-106 (shipped `5563367`)**:
  - `SellerNotificationPresenter::mobileRoute` for `viewing.booked|reminder|rescheduled`
    → `/listings/{id}?src=viewing&appointment={uuid}`
  - Presents `appointment_uuid` on inbox items; `viewing.rescheduled` in match arms
  - Flutter counterpart: `74a90f6`

- **KAN-105** social login on `main` via `f241851`
- **KAN-104** multi make/model @ `d0c6571`

## Exact next action

1. Confirm API deploy of `5563367`, then phone QA with Flutter `74a90f6`
2. Move KAN-106 to Done after QA

## Decisions made

- Cancelled viewing notifications still open plain listing (buyer can book again)
- Focus query only for booked/reminder/rescheduled

## Verification

- Presenter viewing booked route test passed
