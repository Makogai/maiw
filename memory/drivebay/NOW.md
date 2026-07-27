# drivebay — Current handoff

## Goal

- Backend bug queue: **KAN-8** ad impression tracking.

## Current state

- **KAN-7 Done** — `18b1d4f` (restart Horizon after Coolify deploy).
- **KAN-9 Done** — `1197f74` (run `favorites:backfill-counts` once after deploy).
- **KAN-8 implemented locally (uncommitted)**:
  - `POST /go/promo/{advertisement}/impression`
  - `AdSlot.vue` + `useAdImpressions.js` (IntersectionObserver, once per ad+placement/session)
  - Tests green (AdvertisementTest + PagePayload)
- Always discard dirty `public/images/brands/*` before commits.

## Exact next action

1. Human: commit + push KAN-8 (exclude brand SVGs); frontend build ships with deploy.
2. Next: **KAN-10** (dual staff-auth gates).

## Verification

- AdvertisementTest 6/6, AdvertisementPagePayloadTest 1/1.
