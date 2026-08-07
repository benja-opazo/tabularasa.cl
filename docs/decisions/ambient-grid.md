# Ambient background grid (decorative)

## What it is

Two faint, 3D-tilted grid panels (`.ambient-grid-panel`) sitting in the empty
gutters on either side of the centered content column, dimming toward the
center via a CSS mask, with a soft accent-colored glow that follows the
cursor (`ambient-grid.js` writes `--gx`/`--gy` custom properties). Pure
"pizzazz" — aria-hidden, pointer-events: none, zero effect on layout or
interaction.

## CSS-only glow, not a real per-cell hover grid

Two ways to do "hovering lights up the grid" were considered: a real DOM
grid of small cells with individual `:hover` states, or a CSS pattern +
mouse-tracked radial-gradient "spotlight". Went with the spotlight —
explicitly requested over the heavier real-grid version, which would need
JS to generate/regenerate a variable number of cell elements per viewport
size and is meaningfully more DOM weight for a purely decorative effect.

## Why the glow layer isn't rotated with the grid

`.ambient-grid-pattern` (the visible grid lines) is 3D-tilted
(`perspective(600px) rotateY(...)`) so it reads as a table receding into the
distance. `.ambient-grid-glow` (the interactive part) is a **flat, untilted**
sibling layer instead of sharing that transform. Reason: `radial-gradient(at
X Y)` positions itself in the element's own pre-transform coordinate space —
to make a *tilted* glow track the mouse accurately you'd need to invert the
perspective+rotateY matrix to convert `clientX/clientY` into that local
space, just to move a soft blob. Not worth it: a flat glow sitting visually
"on top of" the tilted grid still reads as ambient light near the cursor,
and the coordinate math stays trivial (`clientX - panel.getBoundingClientRect().left`).
If a future pass wants the glow to actually sit on the tilted plane, that
inversion is the piece to add.

## The center-ward fade is a `mask-image`, applied to the panel, not the layers

`mask-image: linear-gradient(to right/left, black, transparent)` is set on
`.ambient-grid-panel` itself, not on the pattern/glow children individually.
A mask on a parent composites everything painted inside it (including
transformed descendants) before applying the mask — so one mask rule fades
both the tilted pattern and the flat glow together, instead of needing two
separately-tuned gradients that could drift out of sync.

## Breakpoint: 1300px, gated in both CSS and JS

Below `1300px` the gutters are too narrow for the effect to read as
intentional rather than cramped, so `.ambient-grid { display: none }` below
that width — and `ambient-grid.js` uses the *same* `matchMedia("(min-width:
1300px)")` query to skip attaching `pointermove`/`resize` listeners entirely
below it, not just hide the result. Keep both in sync if the breakpoint
changes.

## z-index / stacking: relies on transparency, not fighting for a high z-index

The panels are `position: fixed; z-index: -1`, placed as the very first
children of `<body>`. This works (rather than being hidden behind the page's
own background) because almost nothing between the panels and the visible
content sets an opaque `background` — sections render transparent over the
canvas background, so paint order lets the panels show through everywhere
except actual opaque UI (cards, the showcase frame, the header), which
correctly sits on top. No component needs to know the panels exist or
coordinate z-index with them.
