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

## Donate button is deliberately louder than Download or Contact

`.btn-donate` (styles.css section 20) is taller, has a larger font, and adds
an accent-colored glow (`box-shadow`, not just a fill change) that neither
`.btn-primary` (Download) nor `.btn-stub` (Contact) has — direct request:
"more prominent than either button." It sits directly under Download in the
Personal column, not centered under the whole table, also per the brief.

## No new JS

Everything on this page is static HTML + the existing `i18n.js`/`theme.js`/
`ambient-grid.js` (reused unmodified — same scripts, same behavior, same
`1300px` ambient-grid breakpoint). No page-specific interactivity was needed,
so no `pricing.js` was added — don't create one preemptively if a future
feature (e.g., an actual contact form) needs page-specific JS, add it then.
