# drivebay — Current handoff

## Goal

Ship **KAN-57** listing-wizard polish (web seller create/edit) + additive
`body_styles.vehicle_type_id`.

## Current state

- **KAN-57** implemented in working tree (not committed): wizard UI polish + schema.
  - Owners `previous_owner_count` min=0 (Input forwards min/max; clamp + server min:0).
  - Body styles filtered by vehicle type; null `vehicle_type_id` = all types; cleared on type change.
  - TaxonomyIcon: explicit `null` svg_url → muted placeholder (no invent); invent only when prop omitted; `@error` probe fallback.
  - Sticky `ListingWizardNav` + sticky WizardSteps; field `:error` / `data-field` / picker `field` + scroll-focus via `useListingWizard`.
  - Additive `body_styles.vehicle_type_id` (DBML + migration + model/seeder/snapshot/options/Filament + Store/Update rule).
  - Tests: `ListingWizardBodyStyleTest` + extended `MobileDeMultiSegmentTaxonomyTest` — **9 passed**.
- SEO epic **KAN-62** / **KAN-69** still the last pushed commit (`5c89591`).

## Exact next action

1. Hard-refresh create listing — body styles should be car-only after
   `2026_07_30_084500_backfill_motorcycle_body_style_vehicle_types` (local migrated;
   null bike categories were showing because filter treats null as all types).
2. Manual QA create/edit (car vs motorcycle body filter, sticky nav, errors).
3. Commit/push `apps/drivebay` when ready (ask user; do not auto-push).
4. Transition **KAN-57** Done after verify.
