# drivebay — Current handoff

## Goal

- KAN-29 recommendations end-to-end. Phases 1–3 done in code (KAN-30/31/32).
  Phase 4 email digests (**KAN-33**) done in code this session.

## Current state

- **KAN-33 done in code** (pending commit/push by parent/human):
  - Models fleshed: `EmailCampaign`, `EmailCampaignRecipient`, `NotificationTemplate`.
  - `RecommendationDigestService` + `RecommendationDigestMail` + markdown view.
  - Job `SendRecommendationDigestsJob`, Artisan `recommendations:send-digests`,
    weekly schedule (Mon 09:00 default) gated by `recommendations.digest.enabled`
    (default **false** — set `RECOMMENDATIONS_DIGEST_ENABLED=true` to send).
  - Opt-in gate: `users.marketing_email_opt_in`; verified email; non-expired candidates;
    same-day idempotency via digest campaign recipients / `segment_json.digest_day`.
  - Pest: `tests/Feature/Recommendation/RecommendationDigestTest.php` (4 passed).
  - Docs: `docs/recommendations/recommendation_architecture.md` digest section.
- Subsumes **KAN-17** for email campaign/template/recipient digest path only;
  Analytics `ListingPerformanceDaily` / `SellerPerformanceDaily` stubs still open.
- Prior: KAN-31 For you + KAN-32 search sort still pending commit/push if not already.

## Exact next action

1. Human: commit + push drivebay KAN-33 (and any pending KAN-31/32) with Attribution OFF.
2. Main session: Jira comment/transition **KAN-33**; note partial **KAN-17** (Analytics stubs remain).
3. Enable digests in target env via `RECOMMENDATIONS_DIGEST_ENABLED=true` when ready.

## Decisions made this session

- Digest default **disabled** (`RECOMMENDATIONS_DIGEST_ENABLED` default false) so schedule
  is inert until ops opts in.
- Code-first `NotificationTemplate` upsert by `code=recommendation_digest` (no seed migration).
- No Filament UI, no Flutter, no new migrations.

## Changed files

- Models: `EmailCampaign`, `EmailCampaignRecipient`, `NotificationTemplate`; `User::recommendationCandidates()`
- `config/recommendations.php` digest section
- `RecommendationDigestService`, `SendRecommendationDigestsJob`, `SendRecommendationDigestsCommand`
- `RecommendationDigestMail`, `resources/views/mail/recommendation-digest.blade.php`
- `routes/console.php`, `bootstrap/app.php`
- `lang/{en,sr}/marketplace.php` digest strings
- `tests/Feature/Recommendation/RecommendationDigestTest.php`
- `docs/recommendations/recommendation_architecture.md`
- Memory: `NOW.md`, `topics/domains-growth.md`

## Verification

- `php artisan test --compact tests/Feature/Recommendation/RecommendationDigestTest.php` → 4 passed
- `vendor/bin/pint --dirty` → pass

## Blockers and unknowns

- Digests stay off until env flag enabled.
- Ranking quality for digest content still depends on candidates being rebuilt (KAN-30 schedule).
