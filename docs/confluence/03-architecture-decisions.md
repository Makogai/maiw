# Architecture decisions (ADRs)

The load-bearing choices in DriveBay, why they were made, and what they cost. These are reconstructed from the code and its history — where intent is inferred rather than documented, it says so.

Detailed mechanics stay in `apps/drivebay/docs/architecture/`; this page is the *why*.

---

## ADR-001 — Domain-based modular structure

**Decision.** Business logic lives in `app/Domains/{Domain}/Services/`, not in controllers. Controllers (`Http/Controllers/{Web,Api/V1,Admin}/`) stay thin and delegate. Models mirror the tree at `app/Models/Domains/{Domain}/Models/`.

**Status.** Adopted, and genuinely followed — 21 domains exist and the boundary holds.

The 21 domains: Listing, Vehicle, Moderation, Media, Search, Recommendation, Notification, Engagement, Analytics, Promotion, SocialPublishing, Advertising, FuelPricing, FuelEconomy, Dealer, Billing, Viewing, Messaging, User, Geography, Experiment.

**Consequences.** One feature usually touches a domain service, not a controller. Cross-domain effects are mostly **direct service calls**, not events — there is only one registered event listener in the whole app (`ListingPublished` → notification). Don't assume an event bus exists; wire side effects the way the neighbouring code does.

**Note.** `docs/architecture/domain-architecture.md` once listed only 12 domains; it's been corrected to 21.

---

## ADR-002 — Search through Scout + Meilisearch, over a denormalized read model

**Decision.** Buyer search queries a denormalized `listing_search_documents` table via Scout/Meilisearch — never the `listings` table directly. `ListingSearchDocument` is its own Scout-`Searchable` model; `Listing` is not searchable itself.

**Why.** Marketplace search needs faceting and relevance ranking over a wide, flattened row; querying the normalized tree per request wouldn't hold up.

**Consequences.** Any lifecycle change must re-sync the document (`SyncListingSearchDocumentJob`). Ranking blends freshness / popularity / quality / recommendation / boost scores.

> **The rule has a real exception.** `CLAUDE.md` says "never build raw SQL search," but `SearchService` has a deliberate, permanent raw-SQL fallback used whenever Meilisearch can't express a filter (`publishedSince`, `priceReduced`, `promotionTypeCode`, `modelName`) **and** automatically on any Scout exception. So not every search hits Meilisearch. Know this before debugging a "why is this slow / why does this filter behave differently" question.

---

## ADR-003 — Eliminate JSON columns in favour of relational tables

**Decision.** On 2026-06-10, seven migrations (`relational_phaseN_eliminate_*_json`) systematically replaced `json`/`*_json` columns with proper relational + pivot tables — each with inline backfill and a full reversing `down()`.

Covered: listings/vehicles/media, dealer storefront settings, search & recommendation filters, billing/notifications, audit logs, and analytics interactions. Example: `saved_searches.filters_json` became ~25 discrete `filter_*` columns; `recommendation_profiles`' eight `*_json` columns became eight child tables.

**Why.** JSON blobs can't be queried, indexed, or constrained. For a filter-heavy marketplace that was a ceiling.

**Consequences.** Almost no JSON columns remain. When reading an older migration, check whether a `relational_phaseN` migration later rewrote that table — the `.dbml` is the fast path and was kept accurately in sync through the rewrite.

---

## ADR-004 — Dealer storefronts on subdomains / custom domains

**Decision.** Dealers get a branded storefront on a subdomain or a fully custom domain, resolved per-request by `ResolveDealerStorefrontHost` middleware. Verified host→dealer mappings live in `dealer_storefront_domains`.

**Status.** A later addition — the table postdates the original dealer build by ~3 months.

**Consequences.**
- A request is either **marketplace mode** or **standalone storefront mode**; storefront mode also switches app locale to the dealer's default.
- A domain only works when `verification_status = verified` **and** the dealer is active.
- Access is **billing-gated**: the single caller of `DealerStandaloneEntitlementService::grantAccess()` is `CheckoutService::fulfillPaidPayment()` — a paid `standalone_storefront` invoice item is what switches it on. Gating modes: `free` / `mock` / `contact`.
- Locally there's no wildcard routing — each subdomain needs an explicit Herd alias.

---

## ADR-005 — Vehicle taxonomy from a committed mobile.de snapshot

**Decision.** Taxonomy (makes/models/generations/trims/engines) is seeded from a committed JSON snapshot, not live API calls. CarQuery import exists but is legacy and not in the default seeder chain.

**Why.** Deterministic, offline-capable seeding; no third-party dependency in local setup or CI.

**Consequences.** Refreshing taxonomy is an explicit act (`vehicles:export-mobile-de-taxonomy`), not something that drifts in silently. Taxonomy nodes are **deletion-guarded**, not cascaded — `VehicleTaxonomyDeletionGuard` blocks removal while anything references them.

---

## ADR-006 — Two separate "feature flag" systems (know which you mean)

**Decision.** Two unrelated systems coexist:

1. **Laravel Pennant** — 14 simple on/off flags in `app/Features/`, config-boolean-backed (e.g. `InstagramPublish`, `PriceRating`, `Mobile`).
2. **The Experiment domain** — an in-house A/B system with weighted variants and per-subject assignment.

They **never reference each other**. Despite both being "feature-flag-shaped," they share no code.

**Consequences.** When a ticket says "add a feature flag," establish which one it means first. A simple kill-switch → Pennant. An A/B test with variants → Experiment.

---

## ADR-007 — Media pipeline is hand-rolled (and the docs are wrong about it)

**Decision (de facto).** Listing images are processed by custom code: `MediaAsset`/`ListingMedia` models + Intervention Image + manual `Storage::disk()` calls.

**The problem.** `CLAUDE.md` and `composer.json` both claim **Spatie Media Library**. It's declared as a dependency but **no code uses it** — no `InteractsWithMedia`, no `Spatie\MediaLibrary\` import anywhere.

**Status.** Unresolved — it's either dead weight to remove or an unfinished migration. Tracked as **KAN-16**.

---

## ADR-008 — Deploy as two Coolify apps from one Dockerfile

**Decision.** Production runs on Coolify as two separate applications built from the same multi-stage Dockerfile: **web** (nginx + supervisor) and **worker** (`php artisan horizon`). PHP + extensions are baked into a separately-built base image on GHCR, so normal deploys don't recompile them.

**Consequences.** The host is **arm64** (Oracle Ampere) — the base image must be built for `linux/arm64` or production fails with `exec format error`. Migrations run only from the web deploy. See *Runbooks*.
