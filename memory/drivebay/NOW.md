# drivebay — Current handoff

## Goal

Start **KAN-62** SEO epic (plain share links → rich previews everywhere).

## Current state

- Legal pages shipped **`a315547`**: `/privacy`, `/terms`, `/cookies`,
  `/account-deletion` + Play checklist.
- **Jira: KAN-62** — Amazing SEO everywhere (High). Children:
  - **KAN-63** Blade meta for all public pages (Highest — fixes plain shares)
  - **KAN-64** default / page-type OG images
  - **KAN-65** sitemap + robots/noindex
  - **KAN-66** search/dealer/storefront canonicals
  - **KAN-67** HTML-meta QA harness
  - **KAN-68** JSON-LD expansion
- Root cause: only listings use `withViewData(['seo'])`; crawlers don't run JS.

## Exact next action

Pull/implement **KAN-63** first (server-render SEO into Blade), then **KAN-64**
so homepage/search/legal get `og:image`. Use Facebook/WhatsApp debugger after deploy.
