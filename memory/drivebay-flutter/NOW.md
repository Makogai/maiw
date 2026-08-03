# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-03): **KAN-106** Your viewing on any listing open + shimmer
listing skeleton shipped (`45afec2`).

## Current state

- Prefer `meta.viewing.myAppointment`; fallback `buyerViewingsProvider` while API rolls out
- Listing open: shimmering skeleton (gallery / specs / sections / CTAs)
- Android plugin JVM targets aligned to 17 (`android/build.gradle.kts`)
- Paired API: drivebay `6351ad1`

## Exact next action

- QA on device against API with `my_appointment`; no open coding slice

## Decisions made

- Inbox fallback until `my_appointment` is live everywhere
- Listing loading UX = shimmer skeleton, not spinner
