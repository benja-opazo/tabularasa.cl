# Mobile navigation (hamburger menu)

## Why this reverses the earlier "no hamburger" call

`theming.md` originally declared: below `860px`, the header collapses to just
the theme toggle + a persistent "Download" button, no hamburger - three nav
links didn't justify one. That stopped being true once `pricing.html` shipped
(`docs/decisions/pricing.md`): a third nav link, `Pricing`, existed with no
way to reach it below `860px` except scrolling all the way to the footer.
Mobile visitors were silently losing navigation, not just convenience.

## What changed

- **`.nav-toggle`** - a hand-drawn hamburger/close SVG icon button (same
  36×36px square style as `.lang-toggle`/`.theme-toggle`), visible only below
  `860px`. No Lucide codepoint exists for a hamburger menu in
  `tabula-rasa/src/icons.rs` (checked before drawing one) - the app itself
  has no navigation drawer, so there was never a reason for one to exist
  there. Toggles `aria-expanded` and swaps between a menu/close glyph via
  CSS attribute selectors, same pattern as the theme toggle's sun/moon swap.
- **`#mobile-nav`** - a panel directly below the sticky header (not an
  overlay - it pushes page content down when open, simplest option with no
  z-index/backdrop to manage), holding Features / Demo / Download as plain
  stacked links (Pricing is not in here - see below). Hidden via the
  `hidden` attribute; `[hidden] { display: none }` is required here too, the
  same gotcha as the feature modal (`docs/decisions/feature-media.md`) - an
  author `display` rule otherwise beats the UA default.
- **`site/assets/js/nav.js`** (new file) - toggles the panel; closes it on a
  link click, outside click, Escape, or the viewport crossing back to
  `>=860px` (avoids a stuck-open panel underneath the full nav that
  reappears there). Kept separate from `theme.js`/`i18n.js` since it's a
  distinct interaction with its own state, not an extension of either.

## Pricing stays directly visible; Download is what actually moves

**Revised from the first pass** (which put Pricing inside the hamburger
alongside everything else): Pricing was the specific link mobile visitors
were losing, so it now has its own permanent slot in `.main-nav` at every
width (`.nav-pricing` class), not gated behind the hamburger tap at all.
`.main-nav a:not(.nav-pricing) { display: none }` hides Features/Demo below
`860px` while leaving `.nav-pricing` alone; the `>=860px` media query
restores them (`.main-nav a:not(.nav-pricing) { display: inline }` there,
matching specificity so the override actually wins - a plain `.main-nav a`
rule there is *lower* specificity than the `:not()` rule and would silently
lose the cascade). Download is the one that's actually deprioritized on
mobile - no persistent header button below `860px`
(`.nav-download-desktop` only shows `>=860px`), living inside `#mobile-nav`
instead, per the original "not the priority action on a small screen"
reasoning.

## Bug fixed: the panel was only reachable scrolled to the top

`#mobile-nav` was a plain (non-sticky) sibling right after the sticky
`.site-header`. Once the visitor scrolled down, the header stayed pinned via
`position: sticky`, but the panel - never given the same treatment - stayed
at its original document position and scrolled out of view with the rest of
the page, so opening the hamburger anywhere but the very top of the page
showed nothing visible. Fixed with `position: sticky; top: 64px` (64px
matching `.site-header`'s fixed height) on `.mobile-nav` itself, so it sticks
directly under the header at any scroll position, same as the header does.

## Bug fixed: Download appeared both in the header and the panel

`.nav-download-desktop { display: none; }` (meant to hide the persistent
header Download button below `860px`) silently lost the cascade to `.btn {
display: inline-flex; }` - both are single-class selectors (equal
specificity), and `.btn`'s rule is defined later in `styles.css` (section 5)
than `.nav-download-desktop`'s (section 3), so the later rule won regardless
of which one looks like it should apply. The button never actually hid,
showing up both in the header and inside `#mobile-nav`. Fixed by scoping both
the hide and the `>=860px` show rule to `.header-actions .nav-download-desktop`
(two classes, specificity `(0,2,0)`) - reliably beats `.btn` regardless of
source order, rather than depending on rule placement in the file.

## Both pages need the same edit by hand

Same constraint as the rest of the shared chrome (`pricing.md`): `nav.js`,
the CSS, and the `#nav-toggle`/`#mobile-nav` markup are duplicated between
`index.html` and `pricing.html`, with `pricing.html`'s links pointing at
`index.html#section` and its own `Pricing` link marked `.is-current` - same
convention `.main-nav` already uses.
