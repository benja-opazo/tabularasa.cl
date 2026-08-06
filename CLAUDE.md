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

## File map

```
site/index.html                  # The whole page (single page, anchor-linked sections).
site/assets/css/tokens.css       # ALL colors + site-level spacing/type tokens. Two-tier - see theming.md.
site/assets/css/styles.css       # Every other style. Numbered TOC at top - keep it updated.
site/assets/js/theme.js          # Toggle button + persistence + OS-follow (anti-flash script is inline in index.html's <head>).
site/assets/js/demo-table.js     # The interactive grid replica - hardcoded dataset + state machine. See demo-table.md.
site/assets/js/downloads.js      # Fetches the real release manifest, detects OS, populates download cards. See downloads.md.
site/assets/fonts/               # Vendored JetBrainsMono-Regular.ttf + lucide.ttf, copied byte-for-byte from tabula-rasa/assets/fonts/, plus their licenses.
site/assets/img/favicon.svg      # Brand mark (accent-colored rounded square, matches the nav brand mark).
site/assets/js/i18n-strings.js   # EN/ES string dictionary - single source of truth for all copy. See i18n.md.
site/assets/js/i18n.js           # Applies the dictionary, persists choice, toggle button. See i18n.md.
.claude/skills/sync-i18n/        # The official workflow for editing copy + syncing the ES translation.
wrangler.toml                    # Cloudflare Workers static-assets config - directory = ./site.
.github/workflows/deploy.yml     # CI: JS syntax check, then `wrangler deploy` - manual `workflow_dispatch` only, not on push.
docs/README.md                   # Docs map - read this first for anything beyond quick edits.
docs/decisions/                  # One file per topic; INDEX.md is the one-line index. Search before redesigning.
```

There is no `layouts/` or per-page templating - it's one HTML file. If this grows
past one page, that's a real architectural decision: propose it in
`docs/decisions/` before restructuring, don't silently split files.

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

## How downloads work

Cards are populated from the **real** release manifest
(`https://downloads.tabularasa.cl/releases/manifest.json`, schema owned by
`tabula-rasa/scripts/release/gen_manifest.py`) via `fetch()`, with the OS
auto-detected client-side. The static `href`s already in `index.html` are the
fallback if that fetch fails. **This needs CORS enabled on the R2 bucket** - see
`docs/decisions/downloads.md` for the header required and what happens if it's
missing (silent fallback, not a crash).

## How i18n works

All copy lives in `site/assets/js/i18n-strings.js` (`window.TR_I18N.en` /
`.es`), applied to the DOM by `i18n.js` via `data-i18n`/`data-i18n-html`/
`data-i18n-attr` attributes in `index.html`. English is canonical. **To edit
copy, use the `sync-i18n` skill** (`.claude/skills/sync-i18n/SKILL.md`) rather
than hand-editing both locale objects - it's the official workflow for
keeping `en`/`es` in sync and surfacing translation subtleties for a human
call instead of guessing them. The showcase demo (`#tr-demo-root`) is
deliberately left untranslated - see `docs/decisions/i18n.md`.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) runs a JS syntax check, then
`wrangler deploy`, against `wrangler.toml`'s Workers static-assets config
(`site/` as the asset directory, no `main` script). **Manual trigger only**
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
- **New or changed copy:** edit the `en` object in `i18n-strings.js`, add the
  matching `data-i18n*` attribute in `index.html` if it's a new string, then run
  the `sync-i18n` skill to translate it into `es` - don't hand-write the Spanish
  yourself or leave `es` out of sync.

### Checklist before finishing a change

- [ ] Opens directly from `site/index.html` (or the http.server one-liner above) - no build step assumed.
- [ ] Light **and** dark both look right, including inside the showcase demo.
- [ ] Looks right at ~375px, ~768px, and desktop widths - mobile first.
- [ ] No hardcoded colors - tokens only, right tier.
- [ ] `node --check` passes on every changed JS file (what CI runs).
- [ ] Any icon used is either a named app codepoint or a deliberate hand-drawn SVG - never a guessed codepoint.
- [ ] New/changed copy exists in `i18n-strings.js` for **both** `en` and `es` (via the `sync-i18n` skill), not just hardcoded in `index.html`.
- [ ] Non-obvious decision? Add it to `docs/decisions/<topic>.md` + `INDEX.md`.
