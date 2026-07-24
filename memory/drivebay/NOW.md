# drivebay — Current handoff

## Goal

- KAN-29 recommendations end-to-end. Phase 1 (**KAN-30**) data plane implemented in
  `apps/drivebay`. Next: Phase 2 For you (**KAN-31**).

## Current state

- **KAN-30 done in code** (pending push of drivebay branch): config-driven
  `ListingRecommendationScoreService`, `ComputeListingRecommendationScoresJob` @ 03:15,
  collaborative also-viewed fix, extracted scorers, schedule guards, profile `message` type,
  fallback logging, 6 Pest tests green, docs + Confluence sorting page updated.
- Epic **KAN-29** In Progress; children KAN-30…KAN-33.
- Investigation / score map:
  https://drivebayme.atlassian.net/wiki/spaces/DM/pages/3440642/Search+sorting+ranking+scores
- Older MAIW-findings (KAN-7…KAN-17 etc.) still open where not subsumed.

## Exact next action

1. Push `apps/drivebay` KAN-30 commit if not yet on origin.
2. Start **KAN-31** (For you feed API + Flutter) once scores/candidates verified with
   `php artisan recommendations:rebuild` against local Docker data.
3. Do not open API `sort=recommendation` until KAN-32.

## Decisions made this session

- No new ML / no schema migrations — use existing columns + `config/recommendations.php`.
- Jira is ticket source of truth; Confluence kept in sync (MAIW rules).

## Changed files

- `apps/drivebay`: recommendation services/jobs/config/tests/docs/console schedule
- `memory/drivebay/topics/domains-core.md`, `NOW.md`, `meta.json`
- Wrapper: Jira/Confluence rules (already on origin)

## Verification

- `php artisan test --compact tests/Feature/Recommendation` → 6 passed

## Blockers and unknowns

- Drivebay was behind origin by 1 at last check — rebase/pull before push.
- Full production-sized rebuild not run; queue workers must process search-doc sync jobs.
