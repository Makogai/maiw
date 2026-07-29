# drivebay — Memory index

Read only the notes needed for the current task. This app already has rich in-repo
guidance — `apps/drivebay/CLAUDE.md` (architecture/domain/API/conventions) and
`apps/drivebay/docs/` (schema, search, recommendations, API, deployment). These MAIW
notes are deliberately thin: they point at that guidance and add only what's been
verified against code or wasn't already written down.

| Need | Read | Freshness |
|---|---|---|
| Resume current work | `NOW.md` | current session handoff (2026-07-28) |
| Architecture/boundaries | `topics/architecture.md`, then `apps/drivebay/CLAUDE.md` | partial |
| Business behavior | `topics/domain.md`, then `apps/drivebay/CLAUDE.md` | partial |
| Local coding/testing patterns | `topics/conventions.md`, then `apps/drivebay/AGENTS.md` | partial |
| Why a choice was made | `topics/decisions.md` | entries |
| SEO (sitemap, robots, noindex, OG) | `topics/seo.md` | KAN-63/64/65 done, current |

## Change recipes

- Add/change domain logic → `apps/drivebay/app/Domains/{Domain}/Services/`.
- Add API endpoint → `apps/drivebay/routes/api/v1/*.php` + `Http/Controllers/Api/V1/`,
  then update `apps/drivebay/docs/api/modules/{module}.md`.
- Change DB schema → update `apps/drivebay/docs/database/database_schema.dbml` first,
  then write the migration (see `apps/drivebay/CLAUDE.md` "Where to look" for the full
  table).

## Detailed subsystem notes

- `topics/domains-core.md` — deep reference for the 6 core marketplace domains (Listing,
  Vehicle, Moderation, Media, Search, Recommendation): key services/models, cross-domain
  event/job wiring, and gotchas (e.g. Media domain does not actually use Spatie Media Library,
  recommendation rebuild jobs are not scheduled). Read this before touching any of those six
  domains instead of re-exploring `app/Domains/`.
- `topics/frontend-and-admin.md` — deep reference for `resources/js/` (Pages→controller
  map, Components/ subfolders, composables/ one-liners, confirmed Vue/Inertia/Tailwind
  v4 conventions, vite.config.js) and `app/Filament/Admin/` (all 32 resources with
  model/relation-manager table, Livewire components, dashboard widgets). Read this
  before frontend or Filament-admin work instead of re-exploring those trees.
- `topics/domains-account.md` — deep reference for the Dealer, Billing, Viewing,
  Messaging, User, Geography, and Experiment domains (key services/models, cross-domain
  connections, Stripe/Spatie-Permission/Pennant wiring, gotchas). Read this before
  touching any of those seven domains instead of re-exploring `app/Domains/`.
- `topics/infra.md` — deep reference for Docker (multi-stage build, aarch64/QEMU fix),
  CI (`tests.yml`, `php-base-image.yml`), Horizon/queue config (with a found gotcha:
  `ImportAutodilerListingsJob`'s 900s timeout exceeds the 90s redis `retry_after`),
  Console Commands, Observers/Providers, top-level Jobs, and Coolify deployment/env-var
  categories. Read this before touching Docker, CI, Horizon config, or deployment
  instead of re-exploring those files.
- `topics/domains-growth.md` — deep reference for the 8 growth/engagement domains
  (Notification, Engagement, Analytics, Promotion, SocialPublishing, Advertising,
  FuelPricing, FuelEconomy): key services/models, a cross-domain connection map (e.g.
  FuelPricing writes `Notification` rows directly, `NotificationObserver` pushes on
  *any* `in_app` row, Moderation warnings hijack the Engagement popup slot), Firebase/
  Meta-Graph/OpenAI/data.gov.me external integrations, and gotchas (empty `PageEvent` stub,
  ad `impressions_count` never incremented, stale
  `/go/ad/{id}` doc claim). Read this before touching any of those eight domains instead
  of re-exploring `app/Domains/`.
- `topics/api-and-database.md` — deep reference for `routes/api/v1/*.php` (endpoint
  tables: method/path/controller/auth per route file) and the DB schema (migration
  phases, schema-evolution history). OpenAPI regenerated (**Jira: KAN-13** `cd53e3e`); 8
  API controllers still intentionally reuse `Requests/Web/*` Form Requests. Read this before
  adding/changing an API endpoint or touching migrations instead of re-deriving the
  route/schema map from scratch.
- `topics/seo.md` — deep reference for the SEO epic (**Jira: KAN-62**, sub-tasks KAN-63/64/65
  done): `SeoData::forPage()`/`forPrivatePage()`, which controllers are `noindex`, the dynamic
  `sitemap.xml` design (`SitemapGenerator`, dealer/listing filtering gotchas), and a test gotcha
  around FK-constrained query params. Read this before touching meta tags, robots policy, the
  sitemap, or before starting KAN-66 (canonicals) / KAN-68 (JSON-LD).

