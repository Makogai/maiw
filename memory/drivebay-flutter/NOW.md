# drivebay-flutter — Current handoff

## Goal

- Full learning cycle requested after the initial breadth-only pass, matching the
  exhaustive treatment already done for `apps/drivebay`. Done. No feature work requested
  yet.

## Current state

- Cloned to `apps/drivebay-flutter` at commit `eb6132b` ("Merge branch 'main'"). No
  `AGENTS.md`/`CLAUDE.md` existed in this repo's history before clone, so `register`
  created fresh adapter files — nothing was overwritten (contrast with drivebay's clone,
  see `memory/drivebay/topics/decisions.md`).
- Deep-learning pass complete (2026-07-15, 5 parallel agents, evidence-checked against
  commit `eb6132b`): core infra (`lib/core/*`, providers, main/app entry), the full
  API-consumption layer (all 23 repositories mapped to backend endpoints + ~43 models),
  buyer-facing discovery features, account/safety/comms features, and seller/growth
  features + platform/test inventory — see `INDEX.md` "Detailed subsystem notes" for
  which file covers what.
- **Highest-value findings** (full evidence in the topic files — don't rediscover by
  grepping):
  - No token refresh flow exists; a 401 (or *any* `/auth/me` error, even a network
    blip) just logs the user out (`core-infra.md`, `features-account-and-comms.md`).
  - Firebase push is Android-only by design — iOS throws `UnsupportedError` and has no
    `GoogleService-Info.plist`; `DeviceTokenRepository`'s `'ios'` path is dead code
    (`core-infra.md`, `features-seller-growth-and-platform.md`).
  - **Real contract gaps vs. the backend** (`repositories-and-models.md`): saved
    searches are entirely unbuilt in mobile (yet a push-notification type for
    `saved_search.match` already exists client-side); dealer storefront management and
    seller analytics dashboards are unbuilt; most analytics events besides `view` are
    never sent.
  - Search sort options client-side (`freshness|popularity|price_*|year_*`) don't
    include the backend's `recommendation` sort (`features-discovery.md`).
  - Backend's Engagement-popup-hijacked-by-moderation-warning behavior is mirrored
    correctly client-side, but via **two independent, unaware-of-each-other paths**
    (`EngagementHost` and a nested `ModerationHost`) to the same dialog
    (`features-seller-growth-and-platform.md`).
  - Two independent, deliberate FCM-sync call sites exist (`AuthNotifier` methods +
    an `app.dart` listener) — not redundant dead code (`core-infra.md`).

## Bug-hunt pass (2026-07-17, code still @ `eb6132b`)

- Deeper defect dive requested. Codebase is well-guarded overall (error paths swallow
  correctly; `logout`/`handleUnauthorized`/chart/viewing all handle empty+error cases).
- **New bug filed: KAN-26** — `format.dart` `formatMoney`/`formatEuro` use `.` as BOTH
  thousands and decimal separator for amounts ≥ 1000 (`"15.000.00 €"`). Hits promotion
  checkout + registration-tax panel. Tagged in `features-seller-growth-and-platform.md`.
- **Unverified suspicion (NOT filed):** `ApiClient` sets a default `Content-Type:
  application/json` on `BaseOptions` (`api_client.dart:31-34`); multipart uploads
  (`uploadMultipart*`) don't override it. In some dio versions a preset content-type stops
  the FormData boundary being applied → uploads could break. Couldn't confirm statically
  (app ships with uploads, so likely dio handles it). Verify on a device before trusting.

## Exact next action

1. No pending task. Optional: verify the KAN-26 fix, or check the multipart Content-Type
   suspicion above on-device. Otherwise read this file + `INDEX.md`, pick the topic file(s)
   matching the work, and only open real source files to confirm specifics.

## Decisions made this session

- None specific to this app (see `memory/drivebay/topics/decisions.md` for the
  AGENTS.md/CLAUDE.md preservation decision made during the drivebay clone).

## Changed files

- `memory/drivebay-flutter/topics/core-infra.md`, `repositories-and-models.md`,
  `features-discovery.md`, `features-account-and-comms.md`,
  `features-seller-growth-and-platform.md` — new, this session.
- `memory/drivebay-flutter/INDEX.md`, `NOW.md`, `meta.json` — updated to reflect full
  learning. No app code changed.

## Verification

- `node bin/maiw.js doctor drivebay-flutter` and `node bin/memory.js validate
  drivebay-flutter` both passed after this pass.
- Every non-trivial claim in the five new topic files carries a `path:line` citation
  verified against commit `eb6132b`; scanned all five for secret/key patterns
  post-write — none found. Repository→endpoint mapping was cross-verified directly
  against `apps/drivebay/routes/api/v1/*.php`, not just backend memory.

## Blockers and unknowns

- None blocking. Status is `current` for breadth+depth across all `lib/` areas listed
  above. No runtime/device testing was done (static code reading only) — verify
  behavior in-app before relying on any claim for auth/push/payment-adjacent work.

