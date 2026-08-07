# tabularasa.cl - Docs

Map of this repo's documentation. Read `../CLAUDE.md` first for the working rules;
this folder is where the reasoning behind them lives.

## Where things are

| Path                      | What it is                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `decisions/INDEX.md`      | One line per decision, grouped by topic. **Search here before redesigning anything.**                                                            |
| `decisions/theming.md`    | The two-tier token system, dark-default rationale, font/icon vendoring, responsive breakpoints.                                                  |
| `decisions/demo-table.md` | What the interactive showcase faithfully replicates vs. simplifies, dataset design, rendering-strategy tradeoffs.                                |
| `decisions/downloads.md`  | Manifest-driven downloads vs. hardcoded links, the CORS dependency, fallback behavior.                                                           |
| `decisions/i18n.md`       | Client-side EN/ES dictionary swap, why not per-locale pages, why the showcase demo stays English-only.                                           |
| `decisions/ambient-grid.md` | Decorative tilted grid + mouse-tracked glow in the side gutters - why the glow layer isn't rotated with the grid, breakpoint gating, z-index approach. |
| `decisions/pricing.md`    | The site's first second page - why plain HTML duplication over templating, the two honest-stub CTAs, why the comparison table shows identical features for both tiers. |
| `decisions/feature-media.md` | Feature card flip + demo modal - scope (Shipped cards only), expected GIF filenames, the `[hidden]` CSS gotcha, hand-drawn play icon rationale. |
| `decisions/deploy.md`     | Why GitHub Actions + `wrangler deploy` over dashboard-only Cloudflare Pages, and the exact secret/dashboard setup steps a human still has to do. |
| `decisions/copy.md`       | Where every factual marketing claim on the page came from, so it can be re-verified instead of re-guessed.                                       |

## Cold-start read order

1. `../CLAUDE.md` - the working rules and file map.
2. `decisions/INDEX.md` - skim for prior art on whatever you're about to touch.
3. The specific `decisions/<topic>.md` for full context before changing that area.

## Model in one line

This is a small, single-page static site with no build step - the docs are
scaled to that: a flat `decisions/` folder instead of the app repo's full
epic/roadmap/work-plan machinery. When a change is non-obvious, it earns a decision
entry; when it's routine (a copy tweak, a new feature card using the existing
pattern), it doesn't.
