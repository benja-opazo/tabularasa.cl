# Donations page (`donations.html`)

## Why a page exists at all

Both donate entry points (`pricing.html`'s standalone "Donate ❤️" line, and
`download.desc`'s inline donation phrase on `index.html`) were `href="#"`
honest stubs - no destination, because no donation URL exists yet
(`docs/decisions/pricing.md`). Direct instruction this round: don't remove
the buttons (that reads as a rug-pull to anyone who already noticed them),
but don't wire them to real payment processing either - there's no server
for verifying/reconciling a donation on this stack yet, so accepting money
without that in place isn't responsible. `donations.html` is the resolution:
a real page, honestly stating donations aren't open yet, that both entry
points now link to instead of a dead `#`.

## Why a static page, not something fancier

Same reasoning as `pricing.html` (`docs/decisions/pricing.md`): no build
step, so a third static HTML file duplicating `index.html`'s head/header/
footer by hand is the only option that doesn't introduce tooling. Content is
minimal on purpose - reuses the existing `.hero`/`.eyebrow`/`.hero-sub`/
`.hero-ctas` classes already styled for `index.html`'s own hero, so no new
CSS was needed at all.

## The "third page" checkpoint, revisited

`CLAUDE.md` flagged this exact moment: "if a third page gets added, that's
the point to revisit whether shared-fragment tooling is finally worth it."
Re-examined and still called **not worth it** - `donations.html` is a
minimal, likely-temporary placeholder (it exists to be replaced once real
donation infrastructure ships, not to become permanent content), which is a
weak argument for taking on build tooling. Revisit again if a fourth,
more substantial page shows up, or if `donations.html` itself grows real
content instead of staying a stub.

## Not in the main nav or footer

`donations.html` is only reachable via the donate links themselves, not
added to `.main-nav`, `#mobile-nav`, or the footer's link columns - it isn't
a primary destination, just a landing spot for an existing CTA. Revisit if
donations become a real, permanent feature worth its own nav entry.

## Copy

- `donations.eyebrow` / `donations.title` / `donations.desc` /
  `donations.back_link` - new i18n keys, translated via the `sync-i18n`
  skill like everything else (`docs/decisions/i18n.md`).
- The copy states the actual current reason (no payment processing, and no
  way to pay a donor back for their support) rather than a vague "coming
  soon" - consistent with `docs/decisions/copy.md`'s stance against
  inventing or hand-waving product claims. Edited directly in `es.json`
  once already (not authored in `en.json` first) - keep both in sync if it
  changes again.
