# Known gaps & drift

The honest current-state map. Every item below was found by a structured, evidence-backed pass over both codebases (backend at `8f7840f`, mobile at `eb6132b`) and is tracked in Jira with exact file/line evidence.

**Read this before trusting a documented feature.** Nothing here is alarming for a project this young — but several items mean *the docs say X and the code does Y*.

- Epic **KAN-4** — backend (`KAN-6` … `KAN-17`)
- Epic **KAN-5** — mobile (`KAN-18` … `KAN-25`)
- Label: `maiw-found`

---

## Things that silently don't work

| Ticket | Issue | Why it matters |
|---|---|---|
| **KAN-6** | **Recommendation rebuild jobs are never scheduled.** `routes/console.php` only schedules saved-search alerts. | Similarity/candidate/profile tables only refresh if someone runs `recommendations:rebuild` by hand. `RecommendationService` silently falls back to simple make/model heuristics — so "recommendations" have plausibly been running on a fallback since launch. Degrades *quietly*. |
| **KAN-8** | **Ad impressions are never recorded.** `AdvertisementDeliveryService::recordImpression()` is fully implemented but has zero callers; `AdSlot.vue` only wires clicks. | Any `impressions_limit` rotation/cutoff never fires from real impressions. |
| **KAN-9** | **`Listing.favorites_count` is a dead counter.** Never incremented or decremented; only read by `SellerAnalyticsService`. | Sellers are shown a wrong (likely always-zero) favourites count. |
| **KAN-12** | **`ListingUpdated` event has zero listeners.** Dispatched from two places, handled nowhere. | Latent trap: a future feature that hangs side effects off this event will silently do nothing. |
| **KAN-24** | **Mobile analytics is partial** — only `analytics/view` is ever sent; impressions, engagement and click events are never called. | Search-result impressions/clicks from mobile are untracked, undercounting the data recommendations train on. |

## Correctness / reliability risks

| Ticket | Issue |
|---|---|
| **KAN-7** | **Horizon timeout ordering is inverted.** `ImportAutodilerListingsJob` sets `$timeout = 900` but the redis queue's `retry_after` defaults to **90s**. If an import runs past 90s (likely — it scrapes and imports many listings), the reservation lapses and a second worker can pick up the same job → **duplicate concurrent imports**. |
| **KAN-10** | **Dual staff-authorization checks.** `StaffAccessService::isStaff()` and `User::canAccessPanel()` independently check `type` OR Spatie role. `AdminUserSeeder` sets only the role half. An admin can pass one gate and fail the other. |
| **KAN-11** | **FuelEconomy AI cache never expires** — OpenAI results are keyed by vehicle-spec hash with no TTL, so prompt/model changes never invalidate old estimates. |
| **KAN-18** | **`restoreSession` logs users out on any error** — including a plain network blip — even though the Sanctum token never expires. A transient failure on cold start = unnecessary re-login. |
| **KAN-19** | **Message mute has a silent client-only fallback** — if the endpoint 404/405s, the client mutes locally and says nothing, so mute desyncs across devices. |
| **KAN-20** | **Two independent UI paths can show the same moderation-warning dialog** (`EngagementHost` and a nested `ModerationHost`), mounted simultaneously with separate dedupe flags. |
| **KAN-21** | **Two parallel favorite-state sources** on mobile can desync with each other. |

## Docs that lie

| Ticket | The claim | The reality |
|---|---|---|
| **KAN-13** | `docs/api/v1/openapi.json` is the API spec | **Stale.** 16 real endpoints missing; 1 phantom path (`PUT /v1/seller/listings/{publicId}/viewing`) doesn't exist. Some endpoints are documented **nowhere** (`GET /experiments`, `GET /featured-listings`, notification unread-count, messaging typing/report). Re-run `composer run api:docs`. |
| **KAN-14** | Docker DB is MySQL/MariaDB on 3306 | It's **Postgres 16 on 5432**. No MySQL service exists in any compose file. |
| **KAN-15** | "Stripe + PayPal" payment gateways | **Only Stripe.** No PayPal gateway class, config key, or route exists. |
| **KAN-16** | Media handled by Spatie Media Library | **Not used at all.** Declared in `composer.json`, but the pipeline is hand-rolled (Intervention Image). Dead dependency or unfinished migration. |

Also worth knowing (not ticketed): `CLAUDE.md` references a `tests/Browser` directory that doesn't exist.

## Unbuilt / incomplete

| Ticket | Gap |
|---|---|
| **KAN-23** | **Saved searches don't exist on mobile at all** — no repository, no screens. Yet the app already ships a notification icon for `saved_search.match`, so a user could receive a push about a saved search they have no way to create or manage from the app. |
| **KAN-25** | Mobile search never exposes the backend's **`recommendation` sort**, which the API supports. |
| **KAN-22** | **No favorite button in search results** — `ListingCard` has no `isFavorited` field; favouriting requires opening the detail screen. |
| **KAN-17** | **Dead stub models** with zero producing code: `EmailCampaign`, `EmailCampaignRecipient`, `NotificationTemplate`, `ListingPerformanceDaily`, `SellerPerformanceDaily`. Schema exists, feature doesn't. |

Backend features with **no mobile client** (not defects — just unbuilt): dealer storefront management, seller analytics dashboard, compare, recent-listings, VIN decode, model-groups.

## Cross-platform design divergence

Web and mobile share a token vocabulary almost perfectly (same names, same hex values) — with two exceptions:

- **`brand`**: Flutter defines `brand: #2563EB` (blue); web maps `--color-brand-*` to the **orange** accent. Same name, different colour.
- **`success`**: web has `--db-success: #059669`; the Flutter palette has no success token at all.

See *Design system*.

## How this list is maintained

Findings are tagged inline in the AI memory notes as `(**Jira: KAN-N**)`, so the ticket and the evidence stay linked. When a fix lands, the ticket gets a comment (files changed + how verified) and is transitioned; the memory note is updated or the stale gotcha deleted. Convention: `core/JIRA.md` in the wrapper repo.
