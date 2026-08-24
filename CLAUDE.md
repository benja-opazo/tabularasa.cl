# CLAUDE.md - tabularasa.cl

Instructions + style guide for this repo. Read this before making changes so each
session continues the same design language instead of starting fresh. **Start at
`docs/README.md`** for the docs map, then come back here for the working rules.

## What this site is

The **companion / download page for Tabula Rasa** (`../tabula-rasa` on this
machine - a fast, cross-platform CSV viewer/editor built in Rust + egui). Visitors
land here to understand what the app does, **try a faithful interactive replica of
its grid** without installing anything, and download it for their OS. This is a
marketing/distribution surface, not the product itself - the real engine lives in
the sibling `tabula-rasa` repo.

**Core intent:** the page must feel like it's part of the same environment as the
app - same colors, same fonts, same icon glyphs, same interaction language - so a
visitor who downloads the app afterwards feels zero discontinuity.

## Hard constraints (do not break these)

- **Vanilla output, no build step, no npm.** Plain HTML + CSS + a few small vanilla
  JS files. No framework, no bundler, no client libraries, no Google Fonts/CDN
  dependency (fonts are vendored - see below). `site/` **is** the deploy root
  as-authored; nothing generates it. Local dev: open `site/index.html` directly,
  or `python3 -m http.server --directory site` for a URL-like origin (needed for
  `fetch()` in `downloads.js` to behave the same as production).
- **Visual tokens must mirror `tabula-rasa/src/theme.rs` exactly.** Every hex in
  `site/assets/css/tokens.css`'s app-faithful block is copied from that file's
  `Palette` consts - never "tidy," round, or invent one. See
  `docs/decisions/theming.md` for the two-tier token system (app-faithful vs.
  site-only) and the manual re-sync procedure (there's no build-time link between
  the two repos).
- **Never hardcode a color in a component.** Read it from a CSS custom property in
  `tokens.css`. This is the same invariant the app itself enforces in `theme.rs` -
  keep both sides honest so a future accent-color change is a one-file edit.
- **Icon glyphs come from the vendored Lucide font, at the app's exact codepoints**
  (copied from `tabula-rasa/src/icons.rs`, see `ICON` in `demo-table.js`). Never
  guess a Lucide codepoint - if a control needs a glyph that file doesn't define,
  it gets a hand-drawn inline SVG instead (see the platform icons / theme toggle
  in `index.html`), not a guessed PUA character.
- **Mobile-first.** Design and test the ~375px layout first; desktop is the
  enhancement, not the baseline. See `docs/decisions/theming.md`'s responsive
  breakpoints.
- **Dark is the default theme** (matches the app's default), following the OS
  preference until the visitor picks explicitly - same convention as
  `benjaopazoc.cl`. Persisted in `localStorage.theme`.

## Comments policy

Comments should be a short pointer (what's non-obvious + a `docs/decisions/*.md`
link), not a duplicated explanation - the rationale lives in docs, not in a
20-line file-header essay. A one-to-three-line comment is fine (and often the
right call for a genuinely hidden constraint or bug workaround right next to
the code it affects); CI fails a comment block over 10 lines
(`scripts/check-comments.mjs`, run on `site/assets/js/` + `worker/`) as a
guard against header blocks creeping back - if you need more than that,
that's a sign the rationale belongs in a decision doc instead, linked from a
short pointer. `styles.css`'s numbered TOC is a deliberate, documented
exception to this (see the file map below) - not something the linter checks.

## File map

```
site/index.html                  # The main page (single page, anchor-linked sections).
site/pricing.html                # Second page - feature comparison table. Duplicates index.html's head/header/footer by hand. See pricing.md.
site/assets/css/tokens.css       # ALL colors + site-level spacing/type tokens. Two-tier - see theming.md.
site/assets/css/styles.css       # Every other style. Numbered TOC at top - keep it updated.
site/assets/js/theme.js          # Toggle button + persistence + OS-follow (anti-flash script is inline in index.html's <head>).
site/assets/js/nav.js            # Mobile hamburger menu (<860px) - open/close, closes on link/outside click/Escape/resize. See mobile-nav.md.
site/assets/js/demo-table.js     # The interactive grid replica - hardcoded dataset + state machine. See demo-table.md.
site/assets/js/downloads.js      # Fetches the real release manifest, detects OS, populates download cards. See downloads.md.
site/assets/js/feature-cards.js  # Flip-to-GIF + demo modal on the 4 Shipped feature cards. See feature-media.md.
site/assets/img/features/        # Feature-card GIFs (huge-files.gif, filter-sort-group.gif, instant-search.gif, column-control.gif) - not shipped yet, see feature-media.md.
site/assets/js/ambient-grid.js   # Mouse-tracked glow on the decorative side-gutter grid panels. See ambient-grid.md.
site/assets/fonts/               # Vendored JetBrainsMono-Regular.ttf + lucide.ttf, copied byte-for-byte from tabula-rasa/assets/fonts/, plus their licenses.
site/assets/img/favicon.svg      # Brand mark (accent-colored rounded square, matches the nav brand mark).
site/assets/i18n/en.json         # Canonical EN string dictionary, one flat key per string. See i18n.md.
site/assets/i18n/es.json         # ES translation, same key set as en.json - kept in sync via the sync-i18n skill.
site/assets/js/i18n.js           # Fetches the active locale, background-loads the rest, applies the dictionary, toggle button. See i18n.md.
.claude/skills/sync-i18n/        # The official workflow for editing copy + syncing the ES translation.
worker/index.js                  # Worker `main` script - /latest/<platform> OG landing page on downloads.tabularasa.cl; falls through to the static site otherwise. See download-redirect.md.
wrangler.toml                    # Cloudflare Workers static-assets config - directory = ./site, plus the worker/routes above.
scripts/check-comments.mjs       # CI guard for the comments policy above - no npm deps, plain Node.
.github/workflows/deploy.yml     # CI: JS syntax check (site/ + worker/) + comments-policy check, then `wrangler deploy` - manual `workflow_dispatch` only, not on push.
docs/README.md                   # Docs map - read this first for anything beyond quick edits.
docs/decisions/                  # One file per topic; INDEX.md is the one-line index. Search before redesigning.
```

There is no `layouts/` or per-page templating. `pricing.html` (added per
`docs/decisions/pricing.md`) duplicates `index.html`'s head/header/footer by
hand rather than introducing a build step — if a **third** page gets added,
that's the point to revisit whether some form of shared-fragment tooling is
finally worth it. Don't silently add more pages without a matching decision
entry.

## How theming works

- `tokens.css` has **two tiers**, kept in explicitly separate, labeled blocks:
  1. **App-faithful tokens** (`--bg`, `--accent`, `--green`, etc.) - exact hex from
     `theme.rs`. Dark + Light variants, plus derived alpha tints (`--accent-soft`,
     `--block-selection`, …) computed to the same byte values as `Palette`'s
     derive methods. **Only edit these by re-syncing from the app.**
  2. **Site-level tokens** (`--space-*`, `--radius-*`, `--container-max`, `--ease`,
     `--font-*`) - additive, marketing-shell-only, free to restyle.
- Theme switch: `data-theme="dark"|"light"` on `<html>`, set by an inline
  pre-paint script in `<head>` (reads `localStorage.theme`, falls back to OS
  preference) so there's no flash - **keep that script and `theme.js` in sync** if
  this logic changes (`docs/decisions/theming.md`).
- The showcase demo (`.showcase-frame` and everything inside it) is visually
  **isolated** - it always renders in the app-faithful token set regardless of
  what the marketing shell around it does, same as the real app never mixing in
  marketing-site colors.

## How the demo table works

`demo-table.js` is a **hardcoded, client-side-only replica** of the grid - no
engine, ~18 fixture rows, and a state machine covering: sort (header click),
group-by, filter, heatmap, wrap, column show/hide, and a full find bar with match
highlighting - the same feature set `docs/ui-ux/components.md` in the app repo
marks as "built" today. What's a disabled stub in the demo (Number format, Freeze
cols/rows, Format panel, Order by, Go to row) mirrors what's **actually** still a
stub in the app itself - that's deliberate parity, not laziness. Full rationale,
the rendering-strategy tradeoff (why search keystrokes only refresh `<tbody>`, not
the whole shell), and what's simplified: `docs/decisions/demo-table.md`.

## How the feature cards work

Only the 4 **Shipped** cards in `#features` (`.feature-card.is-flippable`) are
interactive: click/Enter/Space flips the card to a GIF on the back
(`feature-cards.js`), and a separate play button opens the same GIF full-size
in a modal regardless of flip state. The Roadmap card and the trust-section
cards deliberately opt out (no GIF exists for an unbuilt feature). GIFs live
at `site/assets/img/features/<slug>.gif` and aren't shipped yet - a missing
file falls back to "Demo coming soon" instead of a broken image. Full
rationale, exact filenames, and a CSS `[hidden]` gotcha worth knowing before
touching this file: `docs/decisions/feature-media.md`.

## How downloads work

Cards are populated from the **real** release manifest
(`https://downloads.tabularasa.cl/releases/manifest.json`, schema owned by
`tabula-rasa/scripts/release/gen_manifest.py`) via `fetch()`, with the OS
auto-detected client-side. The static `href`s already in `index.html` are the
fallback if that fetch fails. **This needs CORS enabled on the R2 bucket** - see
`docs/decisions/downloads.md` for the header required and what happens if it's
missing (silent fallback, not a crash).

## How the download redirect worker works

`worker/index.js` is this repo's own Worker `main` script (see
`wrangler.toml`'s `routes`), handling exactly one path pattern:
`downloads.tabularasa.cl/latest/<platform>`. It fetches `manifest.json`
**server-side** (no CORS involved) and renders a small click-through HTML
landing page with Open Graph tags - not a bare redirect, so links shared raw
into WhatsApp/Slack/etc. still unfurl a real preview card. Every other
request (all of `tabularasa.cl`, any other path) falls through to
`env.ASSETS.fetch()`, i.e. the static site unchanged. Full rationale, the
options considered, and what's still unverified (Cloudflare zone name, API
token scope): `docs/decisions/download-redirect.md`.

## How i18n works

Copy lives in per-locale JSON files (`site/assets/i18n/en.json`, `es.json`,
one flat key per string), not one shared JS file. `i18n.js` fetches only the
**active** locale up front, applies it to the DOM via
`data-i18n`/`data-i18n-html`/`data-i18n-attr` attributes, then background-
fetches every other locale after the page's `load` event so a later toggle
click applies instantly from cache. English is canonical. **To edit copy, use
the `sync-i18n` skill** (`.claude/skills/sync-i18n/SKILL.md`) rather than
hand-editing both files - it's the official workflow for keeping `en`/`es` in
sync and surfacing translation subtleties for a human call instead of
guessing them. Adding a new locale is "new JSON file + one entry in `i18n.js`'s
`SUPPORTED` array" - no edits to existing locale files. The showcase demo
(`#tr-demo-root`) is deliberately left untranslated - see
`docs/decisions/i18n.md`.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) runs a JS syntax check, then
`wrangler deploy`, against `wrangler.toml`'s Workers static-assets config
(`site/` as the asset directory, plus `main = "worker/index.js"` for the
`/latest/<platform>` redirect route - see "How the download redirect worker
works" above). **Manual trigger only**
(`workflow_dispatch`) - this is still an active prototype, so nothing
auto-deploys on push to `main`; trigger it from the Actions tab when a change
is actually ready. Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo
secrets - setup steps and why this differs from `benjaopazoc.cl`'s current
dashboard-only Cloudflare Pages setup: `docs/decisions/deploy.md`.

## Adding content

- **New feature card / copy change:** the marketing copy in `index.html` was
  written from `tabula-rasa/docs/project/overview.md` and `docs/roadmap.md`
  (factual claims, not invented) - see `docs/decisions/copy.md` for exactly which
  claim came from where, so an edit can be checked against the live roadmap
  instead of guessed. Re-verify a claim there before changing it.
- **New icon:** check `tabula-rasa/src/icons.rs` for an existing const first. Only
  reach for a hand-drawn inline SVG if the app truly has no Lucide glyph for it -
  match stroke width ~1.5px to stay visually consistent with the vendored Lucide
  set.
- **Color change:** only ever in `tokens.css`, and only the app-faithful tier if
  it's meant to also change in the app (propose it there first - this site
  doesn't lead that decision, `theme.rs` does).
- **New demo-table feature:** extend the state machine in `demo-table.js` rather
  than adding a parallel mechanism - read `docs/decisions/demo-table.md` first for
  what's already been decided (dataset shape, rendering strategy, stub parity).
- **New or changed copy:** edit `site/assets/i18n/en.json`, add the matching
  `data-i18n*` attribute in `index.html` if it's a new string, then run the
  `sync-i18n` skill to translate it into `es.json` - don't hand-write the
  Spanish yourself or leave it out of sync.
- **New feature card with a demo:** only give it `.is-flippable` + a `data-gif`
  once a real GIF exists (or is imminently coming) for it - a Roadmap/not-yet-
  built feature should stay a plain, non-interactive `.feature-card` per
  `docs/decisions/feature-media.md`.

### Checklist before finishing a change

- [ ] Opens directly from `site/index.html` (or the http.server one-liner above) - no build step assumed.
- [ ] Light **and** dark both look right, including inside the showcase demo.
- [ ] Looks right at ~375px, ~768px, and desktop widths - mobile first.
- [ ] No hardcoded colors - tokens only, right tier.
- [ ] `node --check` passes on every changed JS file (what CI runs).
- [ ] No comment block over 10 lines (`node scripts/check-comments.mjs`, what CI runs) - move rationale to `docs/decisions/*.md` instead.
- [ ] Any icon used is either a named app codepoint or a deliberate hand-drawn SVG - never a guessed codepoint.
- [ ] New/changed copy exists in **both** `en.json` and `es.json` (via the `sync-i18n` skill), not just hardcoded in `index.html`.
- [ ] Non-obvious decision? Add it to `docs/decisions/<topic>.md` + `INDEX.md`.
