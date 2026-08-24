# Pricing page — the site's first second page

## This is the architectural change `CLAUDE.md` flags

`CLAUDE.md`: "There is no `layouts/` or per-page templating — it's one HTML
file. If this grows past one page, that's a real architectural decision:
propose it in `docs/decisions/` before restructuring." `site/pricing.html` is
that decision, made on explicit request rather than proposed speculatively.
Recorded here for the next session.

## Approach: a second static HTML file, not templating

No build step, so no shared-layout mechanism exists (no includes, no
partials). `pricing.html` duplicates `index.html`'s `<head>`, header, and
footer markup verbatim, with internal anchors rewritten to `index.html#...`
and the brand/logo link rewritten to `index.html#top`. **This duplication is
the accepted cost of staying build-free** — if a third page gets added,
revisit whether a tiny include mechanism (even a pre-commit script that
inlines a shared header/footer fragment) is worth the added tooling. Not
worth it yet for two pages.

**When editing shared chrome (nav, footer, theme/lang toggles), both files
need the same edit by hand.** There is no automated check that they stay in
sync — this is the main risk of the no-templating approach. Diff the two
`<header>`/`<footer>` blocks if something looks inconsistent between pages.

## Nav wiring

- `index.html`'s nav gained a third link, `Pricing` → `pricing.html`.
- `pricing.html`'s nav points `Features`/`See it in action` back at
  `index.html#features` / `index.html#showcase`, and marks its own `Pricing`
  link with `.is-current` (new CSS rule, `styles.css` section 3) instead of
  linking it — same convention most static sites use for "you are here"
  without a router.
- The header's `Download`/`Downloads` CTA button and the footer's `Download`
  link both point at `index.html#download` from the pricing page — there's no
  reason to duplicate the manifest-driven download cards on a second page.

## Same feature set, on purpose — the table says so twice

The brief was explicit: personal and enterprise get the **identical** feature
set, the only difference is license terms. The comparison table reflects
that literally (every feature row is checked for both columns) rather than
inventing an artificial "enterprise-only" feature to make the table look
more like a typical differentiated pricing grid — that would misrepresent
the product. A `License` row (Personal use / Commercial use) was added as the
one row that *does* differ, specifically so the table doesn't read as a
copy-paste bug when every other row is identical.

## One honest stub left (Contact is now wired up)

- **"Contact for pricing"** (enterprise CTA) — **resolved:** it is now a real
  `mailto:tabularasa@benjaopazoc.cl` link (subject prefilled `Tabula Rasa -
  Enterprise`), promoted from `.btn-stub` to `.btn .btn-primary` so it reads
  as a peer of the Personal column's Download button. The stub styling and
  the `pricing.cta_contact_tooltip` key were removed with it — a working link
  wearing `cursor: not-allowed` would be worse than either honest state.
  `.btn-stub` in styles.css now has no users; left in place for the next stub
  rather than deleted.
- **"Donate ❤️"** — still `href="#"`, unchanged. No donation URL exists
  anywhere in this repo or `tabula-rasa` (checked before building this) —
  wiring a guessed payment link would be actively wrong, not just
  incomplete. Placeholder until a real URL is provided.

## Donate is a standalone, quiet prompt below both cards - not inside Personal

**Reversed decision** (was: a louder `.btn-donate` button sitting directly
under Download in the Personal column, "more prominent than either button" -
that never actually shipped; the button that did ship, `.pricing-donate-link`,
was already a small subdued text link, just still nested inside Personal's
card). Moved out entirely to `.pricing-donate-standalone`, a centered
"Enjoying Tabula Rasa? Donate ❤️" line below the two-card grid, for two
reasons:

- **Alignment.** With Donate stacked inside Personal's `.pricing-card-actions`
  and nothing equivalent in Enterprise's, the two cards' primary buttons
  (Download / Contact for pricing) couldn't land on the same line no matter
  how the flexbox was tuned - one action block always had more stacked
  content than the other. Pulling Donate out entirely means both cards now
  contain the exact same shape (header/price/tagline/highlights/one button),
  so `margin-top: auto` on `.pricing-card-actions` reliably pins both
  buttons to the bottom of the (`align-items: stretch`) equal-height cards -
  the only technique that survives the two taglines wrapping to different
  line counts.
- **Framing.** Donating isn't really a Personal-tier feature - it reads
  better as a general, low-key "if this was useful" ask than something
  bundled into one specific pricing column.

Still `href="#"` - no donation URL exists anywhere in this repo or
`tabula-rasa` (checked before building this) - see "One honest stub" above.

## `.pricing-donate-link` renamed to `.donate-link` - reused on index.html too

The download section's copy (`download.desc` in `en.json`/`es.json`) now
wraps its own donation phrase ("A donation is always welcome ❤️") in the
same quiet, underlined link style, not just plain text - same
`href="#"` honest-stub reasoning as above. Since the link style is no
longer pricing-page-specific, the class dropped its `pricing-` prefix.
The one thing that *is* still pricing-specific is the standalone wrapper
around it (`.pricing-donate-standalone`, the centered line + margin below
both cards) - only the link's own color/underline treatment moved to the
generic name.

## Price font-size now matches on both cards

`.pricing-price` (the "Free" / "Contact us" line) used to be overridden to
`1.4rem` on the Enterprise card, smaller than Personal's `2rem` - an
unintentional inconsistency, not a documented decision. Removed the
override so both share the same base size.

## No new JS

Everything on this page is static HTML + the existing `i18n.js`/`theme.js`/
`ambient-grid.js` (reused unmodified — same scripts, same behavior, same
`1300px` ambient-grid breakpoint). No page-specific interactivity was needed,
so no `pricing.js` was added — don't create one preemptively if a future
feature (e.g., an actual contact form) needs page-specific JS, add it then.
