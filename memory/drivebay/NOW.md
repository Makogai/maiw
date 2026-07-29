# drivebay — Current handoff

## Goal

Ship **KAN-63** (Blade SEO for crawlers), then **KAN-64** (default OG images).

## Current state

- **KAN-63 Done (local, uncommitted):** `resources/views/app.blade.php` reads
  Inertia `$page['props']['seo']` into Blade `$seo` so WhatsApp/Facebook/etc. get
  title + OG meta without JS. Fallback brand `<title>`. Tests:
  `SeoBladeMetaTest` (3 passed). Listing OG + legal tests still green.
- Last pushed HEAD **`a315547`** (legal pages). Jira epic **KAN-62**.
- Next open SEO slice: **KAN-64** (pages still won't show an *image* card until
  default og:image exists — titles/descriptions will).

## Exact next action

Commit+push `apps/drivebay` for KAN-63, deploy, then implement **KAN-64**.
