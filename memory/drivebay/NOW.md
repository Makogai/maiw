# drivebay — Current handoff

## Goal

Ship **KAN-57** listing-wizard polish (web seller create/edit) + additive
`body_styles.vehicle_type_id`.

## Current state

- **KAN-57** implemented in working tree (not committed): wizard UI polish + schema.
  - Owners `previous_owner_count` min=0 (Input forwards min/max; clamp + server min:0).
  - Body styles filtered by vehicle type; null `vehicle_type_id` = all types; cleared on type change.
  - TaxonomyIcon: explicit `null` svg_url → muted placeholder (no invent); invent only when prop omitted; `@error` probe fallback.
  - Field `:error` / `data-field` / picker `field` + scroll-focus via `useListingWizard`.
  - Wizard nav: in-card Previous/Continue footer (sticky/floating nav dropped — UX not right).
  - Additive `body_styles.vehicle_type_id` (DBML + migration + motorcycle null backfill + model/seeder/snapshot/options/Filament + Store/Update rule).
  - Tests: `ListingWizardBodyStyleTest` + extended `MobileDeMultiSegmentTaxonomyTest` — green.
- SEO epic **KAN-62** / **KAN-69** still the last pushed commit (`5c89591`).

## Exact next action

1. Manual QA create/edit (car vs motorcycle body filter, field errors). Sticky nav out of scope for now.
2. Commit/push `apps/drivebay` when ready (ask user; do not auto-push).
3. Transition **KAN-57** Done after verify (AC sticky-nav item deferred/waived).
