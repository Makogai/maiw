# DriveBay — Start here

DriveBay is a vehicle marketplace serving Montenegro. This page is the map: what exists, and **where each kind of documentation lives**.

> **ℹ️ The documentation rule**
>
> Code-level docs (architecture, API, DB schema) live **in the repo**, next to the code, where they version and get reviewed with it. Confluence holds the things that have no code to drift from: onboarding, decisions, runbooks, roadmap.
>
> Please don't copy code docs in here — a Confluence page has no relationship to a commit, so it silently rots. We already have measurable drift in the in-repo docs; duplicating them into a second system makes that worse, not better.

## The systems

| System | Stack | Role |
|---|---|---|
| **drivebay** | Laravel 12, PHP 8.2+, Inertia v3 + Vue 3.5, Tailwind v4, Filament 5 admin, PostgreSQL, Meilisearch, Redis/Horizon | The backend + web marketplace. Owns all business logic across 21 domains, and serves the JSON API. |
| **drivebay-flutter** | Flutter/Dart, Riverpod, dio, go_router, freezed, Firebase (Android only) | Mobile client. Consumes `/api/v1` only — shares no code with the web app. |
| **DriveBay Design System** | React kit, hosted in Claude Design | Shared design tokens + core components, so AI-assisted design stays on-brand. See *Design system*. |

The two apps are joined by exactly one contract: the **v1 JSON API**. Web and API are deliberately separate contract spaces — an Inertia response is *not* an API contract, and must never be treated as one.

## Architecture in one paragraph

Business logic lives in `app/Domains/{Domain}/` (21 of them), **not** in controllers — controllers stay thin and delegate to `Services/`. Eloquent models mirror that tree at `app/Models/Domains/{Domain}/Models/`. Buyer-facing search goes through Scout/Meilisearch over a denormalized `listing_search_documents` table. The admin panel is Filament (32 resources). Queues are Redis + Horizon. Full detail: `apps/drivebay/docs/architecture/system-overview.md` and `apps/drivebay/CLAUDE.md`.

## Where to look

| I want… | Go to |
|---|---|
| Architecture, domains, subsystems | `apps/drivebay/docs/architecture/` |
| The canonical DB schema | `apps/drivebay/docs/database/database_schema.dbml` — the **only** truth for tables/columns |
| API contract (for mobile) | `docs/api/INDEX.md` → `docs/api/modules/{module}.md` → the route files under `routes/api/v1/`. See the warning below. |
| Search behaviour | `apps/drivebay/docs/search/search_architecture.md` |
| Bugs, tasks, known gaps | Jira project **KAN** (Drivebay LLC) |
| Onboarding, decisions, runbooks | This space |

> **⚠️ Don't trust `docs/api/v1/openapi.json` as-is**
>
> It's stale: **16 real endpoints are missing** from it, and one documented path (`PUT /v1/seller/listings/{publicId}/viewing`) **doesn't exist in code**. Read the route files under `routes/api/v1/` instead, and re-run `composer run api:docs` to regenerate. Tracked as **KAN-13**.

## Current state, honestly

A structured audit of both codebases produced **20 tracked issues** in Jira (label `maiw-found`), each with exact file/line evidence:

- **KAN-4** — epic: Drivebay backend findings (`KAN-6` … `KAN-17`)
- **KAN-5** — epic: Drivebay Flutter findings (`KAN-18` … `KAN-25`)

Read **Known gaps & drift** before assuming any documented feature works as written. Highlights: PayPal is documented as a payment gateway but **only Stripe is implemented**; the Docker setup doc says MySQL when the stack actually runs **Postgres**; recommendation data only refreshes if someone runs a command by hand.

None of this is alarming for a project this young — but it's the difference between docs you can trust and docs you can't.

## Conventions worth knowing on day one

- Listings are addressed by **`public_id`** in API routes, never the numeric `id`.
- **Never invent tables/columns** — update `database_schema.dbml` first, then write the migration.
- **Never hand-roll SQL search** — it goes through Scout/Meilisearch (with one documented exception, see *Architecture decisions*).
- Recommendation logic belongs in `RecommendationService`, never in controllers.
- Run `vendor/bin/pint --dirty` after touching PHP.
