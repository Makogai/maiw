# drivebay — Current handoff

## Goal

Latest (2026-08-03): **KAN-106** follow-up shipped — `viewing.my_appointment` on
listing detail (`6351ad1`). Prior deep-link: `5563367`.

## Current state

- `ViewingAppointmentService::upcomingForBuyerOnListing` (light query; reuses listing)
- `ListingDetailResource.viewing.my_appointment` for authenticated non-owner buyers
- Docs + ApiViewingTest coverage

## Exact next action

- Confirm mobile against deployed API; no open coding slice

## Verification

- ApiViewingTest (session); pushed `6351ad1`
