# drivebay — Current handoff

## Goal

Use production legal URLs in Play Console and start internal/closed testing.

## Current state

- App HEAD **`a315547`** (pushed): privacy / terms / cookies / account-deletion
  pages (`LegalController`, `Legal/Show.vue`, `lang/{en,sr}/legal.php`), footer
  links, Play checklist `docs/operations/legal-and-play-console.md`.
  Tests: `LegalPagesTest` passed before ship.
- Operator: DriveBay LLC; `:app` brandify; Montenegro law; 7-day deletion grace.
- Privacy URL for Play: `https://drivebay.me/privacy` (after deploy).
  Account deletion: `https://drivebay.me/account-deletion`.
- Jira not filed (Atlassian MCP was down when pages were added).

## Exact next action

Deploy so Play can fetch `/privacy` and `/account-deletion`, then paste those
URLs into Play Console Data safety / privacy fields and start the testing track.
