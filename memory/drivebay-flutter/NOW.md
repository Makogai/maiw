# drivebay-flutter — Current handoff

## Goal

Latest (2026-08-04): **Featured badges + seller Featured filter + owner
indicator** (**local, uncommitted**). Prior: KAN-112 `8ca0152`.

## Current state

- `PromotionBadges`: short Featured label, star icon, stronger pill; collapse
  featured_* package codes
- My listings: `MyListingFilter.featured` chip (client-side on promotion_badges)
- Seller cards: badge overlay on image
- Owner listing banner: wired `meta.promotionBadges` + featured copy
- l10n: `filterFeatured`, `ownerListingFeatured` EN/SR

## Exact next action

1. Ask user to commit/push with drivebay web badge pair
2. Hot-restart; QA Featured filter + owner banner + card badges

## Verification

- `dart analyze` clean on touched files (pre-existing unused warning only)
