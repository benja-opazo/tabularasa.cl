# Mobile polish: card rhythm, legibility, footer

## "Wall of cards" - why cards, not a carousel

On mobile, Features (5 cards) ran straight into Trust (3 more) as one long
column of visually identical `--panel` boxes - same background, border,
radius, one after another - which read as a monotonous wall rather than
distinct content. Fixed with two CSS-only changes, applied at **every**
width (not a mobile-only treatment - the brief was "the page should look
like the same page in both modes, with minor adaptations," not a different
design per breakpoint):

- **Icon badges.** `.feature-card .icon` is now a 40px accent-tinted circle
  (`background: var(--accent-soft)`) instead of a bare colored glyph on the
  card's own background - gives each card a distinct per-card anchor point
  instead of five near-identical text blocks.
- **Trust section band.** `#trust > .container` (not `#trust` itself) gets
  `background: var(--panel-2)` plus `padding-block: var(--space-5)` and
  `border-radius: var(--radius-lg)` - a different token from the `--panel`
  the cards themselves use, so cards stay visible against it, and enough
  internal padding that the "Trust Tabula Rasa" eyebrow doesn't sit flush
  against the panel's top edge.

**Revised from the first pass:** the tint was originally on `#trust` itself
(the full-width `<section>`), which painted over the ambient-grid decorative
effect in the side gutters (`docs/decisions/ambient-grid.md`) - that effect
only shows through because sections are otherwise transparent there. Scoping
the background to `#trust > .container` (the centered, max-width column)
instead keeps the gutters transparent so the ambient grid still plays there,
at the cost of the band no longer being full-bleed - an accepted trade-off
since the gutter effect only exists at `>=1300px` anyway, where the "wall"
problem barely applies (3-up grid, plenty of breathing room already).

Deliberately **not** done: a horizontal-scroll/carousel treatment for the
card grid. That would've hidden cards behind a swipe gesture - the same
discoverability cost `docs/decisions/feature-media.md`'s nudge feature was
built to solve for the flip/play interactions. Trading a wall for a hidden
carousel isn't a win.

## Legibility

`.feature-card p` (14px/1.55) and `.download-card p` (13.5px) were both a
notch small for comfortable mobile reading, given how much body copy each
card carries. Bumped to `.feature-card p` (15px/1.6) and `.download-card p`
(14.5px/1.5) - same values at every width, not a mobile-specific override.

## Footer: fixed 3-column grid instead of flex-wrap

`.footer-links` was `display: flex; flex-wrap: wrap` with no explicit column
count - at narrow widths this reflowed unpredictably depending on how much
text happened to fit per row. Replaced with `display: grid;
grid-template-columns: repeat(3, 1fr)` at every width, so the three columns
(Product / Support / More from the author) always align consistently
regardless of viewport. The "More from the author" column's longer link
labels (e.g. "HASS Hand Recognition") wrap to multiple lines within their own
column at narrow widths - expected and acceptable for a footer, not a bug to
chase.

This is a first pass on all three - revisit spacing/sizing once it's been
seen at actual device widths.
