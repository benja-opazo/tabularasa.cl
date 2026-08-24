# Feature card flip + demo modal

## What it is

The four **Shipped** cards in `#features` (`#feature-grid .feature-card.is-flippable`)
support two independent interactions, both in `assets/js/feature-cards.js`:

1. **Click/Enter/Space anywhere on a card** (except its play button) flips it
   180° (CSS 3D transform, `.feature-card-flipper`) to reveal a GIF of that
   feature on the back.
2. **The play button** (top-right circle) opens the same GIF full-size in a
   shared modal (`#feature-modal`), independent of flip state — you don't have
   to flip a card first to use it.

## Scope: only the 4 Shipped cards

The **Beyond CSV** card (Roadmap) and the three trust-section cards reuse the
plain `.feature-card` class with no `.is-flippable` modifier and no GIF — a
demo of a feature that doesn't exist yet would be dishonest, same
"stub-parity, not laziness" convention as `demo-table.md`'s disabled controls.
`feature-cards.js` only ever queries `.feature-card.is-flippable`, so adding
the class is what opts a future card in.

## GIF filenames — not shipped yet, `Benjamin` is producing them

Expected paths (referenced by `data-gif` on each card and the front-face
`<img>`'s static `src`, both must match):

```
site/assets/img/features/huge-files.gif
site/assets/img/features/filter-sort-group.gif
site/assets/img/features/instant-search.gif
site/assets/img/features/column-control.gif
```

Until a file exists at that path, the `<img>`'s `error` handler adds
`.has-no-gif` to its container (`.feature-card-back` / `#feature-modal-media`),
which swaps in a "Demo coming soon" fallback (`features.demo_coming_soon` in
`site/assets/i18n/en.json`) instead of a broken-image icon — the same honest-stub
pattern as `demo-table.js`'s "coming soon" popovers. Drop a GIF in at the
right filename and it starts working with zero code changes.

## Why CSS 3D flip, not a JS-driven swap

`.feature-card-front` is normal flow (sets the card's height); `.feature-card-back`
is `position: absolute; inset: 0` inside the same `position: relative` flipper,
so it fills the exact same box without any JS height-measuring — flipping is
a single `transform: rotateY(180deg)` on `.feature-card-flipper` triggered by
toggling `.is-flipped` on the card. No image preloading or layout math needed.

## The video/play icon is a hand-drawn SVG, not a Lucide codepoint

`tabula-rasa/src/icons.rs` has no play/video glyph — checked before drawing
this, per `CLAUDE.md`'s "never guess a Lucide codepoint" rule. Drawn at
~1.5px stroke to match the vendored Lucide set's weight, same convention as
the platform icons and theme-toggle sun/moon SVGs already in `index.html`.

## Modal: `[hidden]` needed an explicit override

`.feature-modal` sets `display: flex` for its open state. An element's own
`display` rule in an author stylesheet always wins over the UA stylesheet's
default `[hidden] { display: none }` — so without `.feature-modal[hidden] {
display: none; }` also declared, the modal stayed visually present (and
intercepted clicks on the rest of the page) even while `hidden` was set.
Found via an automated interaction test that timed out clicking behind it;
keep this override if the modal's `display` value ever changes.

## Accessibility

- Cards are `tabindex="0" role="button" aria-pressed="true|false"`; Enter/Space
  toggle flip the same as a click.
- The play button is a real nested `<button>` — reachable by Tab independent
  of the card's own tabbing, `stopPropagation()` keeps its click from also
  flipping the card.
- Modal: `role="dialog" aria-modal="true"`, focus moves to the close button on
  open and back to whichever control opened it on close, Escape and backdrop
  click both close it, `document.body.style.overflow` is locked while open.

## i18n

`features.play_aria`, `features.modal_close_aria`, `features.demo_coming_soon`
are translated like every other string — see `docs/decisions/i18n.md` and the
`sync-i18n` skill. The GIFs themselves aren't localized (no audio/on-screen
text expected in them); revisit only if that changes.

## First-visit discovery hint (v1 - expect to iterate)

Both gestures (click-the-card-to-flip, click-the-play-button-for-the-modal)
turned out to be non-obvious to a first-time visitor. `feature-cards.js` now
watches the first `.feature-card.is-flippable` with an `IntersectionObserver`
and, the first time it scrolls into view, adds `.is-nudging` to its
`.feature-card-flipper` (a brief `rotateY` wiggle previewing the flip) and its
`.feature-card-play` (an expanding-ring `box-shadow` pulse) - both are plain
CSS `@keyframes`, removed via `animationend` so the class doesn't linger.
Fires once per page load; skipped entirely if the visitor already flipped a
card or opened the modal before the observer would've fired
(`hasInteracted`), so it never nudges something already discovered.
`prefers-reduced-motion` needs no special handling here - the site's existing
global `animation-duration: 0.001ms !important` override (styles.css §18)
already neuters it like every other animation.

This is a first pass, not a settled design - timing, amplitude, and whether
it should also persist across visits (currently resets every page load, not
`localStorage`-backed) are all open to revisit once it's been seen in use.
