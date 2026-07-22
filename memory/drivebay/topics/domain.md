# drivebay — Domain

DriveBay is a vehicle marketplace (listings, dealers, buyers). Full domain glossary and
per-domain purpose table: `apps/drivebay/CLAUDE.md` ("Architecture: domain-based modular
structure") — not duplicated here.

## Purpose and users

- Sellers/dealers list vehicles; buyers search/browse/favorite/message/schedule
  viewings; admins moderate via Filament. Dealers can have branded storefronts on a
  subdomain or custom domain.

## Terms and entities

- **Listing** — the core sellable unit; lifecycle create → moderate → publish →
  sold/expired, synced to `listing_search_documents` (Meilisearch source of truth for
  search).
- **Dealer** — an org account with a storefront; storefront host resolved by
  `ResolveDealerStorefrontHost` middleware, verified in `dealer_storefront_domains`.
- **Recommendation candidate** — output of `RecommendationService`, sourced from
  `user_listing_interactions`, `listing_views`, `favorites`, `search_logs`.

## Stable business rules

| ID | Rule | Evidence |
|---|---|---|
| DOM-1 | Listings addressed by `public_id` in API routes, never numeric `id` | `apps/drivebay/CLAUDE.md` "API" section |
| DOM-2 | Seller/write API endpoints require verified email + `throttle:api-write` | `apps/drivebay/CLAUDE.md` "API" section |
| DOM-3 | Recommendation deep-learning models (matrix factorization etc.) are explicit future/TODO, not implemented | `apps/drivebay/CLAUDE.md` "Search & Recommendations" |

## Important flows

- Autodiler import: scrape seller's Autodiler profile → preview vehicles → queue-import
  (listings + media + equipment mapping) → moderation pipeline. Web:
  `AutodilerImportController`; API: `AutodilerImportApiController`; Flutter:
  `autodiler_import_screen.dart`.

