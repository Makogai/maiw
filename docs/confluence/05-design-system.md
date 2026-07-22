# Design system

DriveBay's design language, where it lives, and how to design against it.

## The short version

Web and mobile **already share one token vocabulary** — the same names and the same hex values, maintained independently in two files. That shared vocabulary *is* the design system. It's now also encoded as a React kit in **Claude Design**, so AI-assisted design produces on-brand screens that map back to real components.

| Surface | Location | Role |
|---|---|---|
| **Web tokens** | `apps/drivebay/resources/css/app.css` — `--db-*` + Tailwind `@theme` | Source of truth for web |
| **Mobile tokens** | `apps/drivebay-flutter/lib/theme/drivebay_palette.dart` | Source of truth for mobile |
| **Design kit** | Claude Design project *DriveBay Design System* | Where you design; encodes the tokens above |

**Claude Design project:** https://claude.ai/design/p/1bab7cc1-8e35-4918-8d00-84b8f4935432

## The palette

Verified identical across web and Flutter (light mode):

| Token | Value | Purpose |
|---|---|---|
| `page` | `#f4f5f7` | App background |
| `elevated` | `#ffffff` | Cards, panels, bars |
| `muted` | `#eef0f3` | Subtle fills |
| `text` / `secondary` / `tertiary` | `#111318` / `#5c6370` / `#8b939f` | Ink hierarchy |
| `border` / `border-strong` | `#e2e5eb` / `#cdd2db` | Hairlines, inputs |
| **`accent`** | **`#e85d04`** | The brand orange — primary actions |
| `accent-hover` / `accent-muted` | `#d45103` / `#fff4ed` | |
| `success` / `danger` | `#059669` / `#dc2626` | Price drops / destructive |

Dark mode flips automatically — notably the accent moves to `#f97316`. Both platforms agree here too.

Also tokenized: 4 radii (`sm` `.5rem` → `xl` `1.25rem`), 4 shadows (incl. a dedicated `shadow-search`), a 6-step spacing scale, and Inter as both sans and display.

> **⚠️ Two real divergences**
>
> - **`brand`** — Flutter defines `brand: #2563EB` (blue); web maps `--color-brand-*` to the orange accent. Same token name, different colour. The design kit follows **web**.
> - **`success`** — exists on web, **absent** from the Flutter palette.
>
> Worth resolving so the vocabulary is truly shared. Tracked with the design findings.

## The Claude Design kit

A React component library (`apps/drivebay-ds`) that encodes the tokens above and reproduces the core components, so Claude Design builds screens using *our* parts instead of generic ones.

**Why React when our apps are Vue and Flutter?** Claude Design renders React — that's a hard constraint. The kit is a **token-driven mirror of the design language**, not the app UI, and deliberately not a third implementation of behaviour. Component *names* mirror the real ones (`ListingCard`, `BottomNav`…) so a generated design translates cleanly by hand.

**Components (9):** `Button` · `TextField` · `Select` · `Card` · `PriceTag` · `Badge` · `PromotionBadges` · `ListingCard` · `BottomNav`

All nine ship with authored preview cards, typed props, and per-component usage docs. Inter is bundled self-hosted, so designs render in the real brand font.

### How to design with it

Open the project and prompt it — it builds with the components above. Two conventions it's been taught:

- **No provider or wrapper needed.** Components self-style once `styles.css` loads. Dark mode = `class="dark"` or `data-theme="dark"` on an ancestor.
- **No utility classes.** This kit has no Tailwind vocabulary. Layout glue uses `var(--db-*)` tokens directly. **Never hardcode a hex** — it won't flip in dark mode.

### Keeping it honest

The kit's `src/tokens.css` is transcribed **by hand** from the two platform files. Nothing enforces that link. If web or Flutter changes a colour, the kit keeps shipping the old one and every design drifts off-brand. **Re-diff those three files whenever the palette changes.** This is the main maintenance risk and is recorded in the repo's `.design-sync/NOTES.md`.

Scope today is a starter kit — the real apps have more (~18 Vue widgets, ~17 Flutter widgets). More components can be added on any later sync.

## Design principles observed in the code

- **One primary action per view.** The brand orange is for the main CTA, not decoration.
- **Elevation is a hairline, not a drop shadow.** Surfaces are `elevated` + 1px `border` + `radius-lg` + a whisper of `shadow-sm`.
- **Price is the hero.** `PriceTag` uses the display font; reductions strike the original and turn the new price `success` green.
- **Promotions are pills, not paint.** `featured` → solid brand; `top_search`/`boost` → accent; `urgent` → danger. Driven by backend promotion codes — don't hand-style them.
