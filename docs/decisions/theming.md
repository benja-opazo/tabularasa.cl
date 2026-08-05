# Theming

## Two-tier token system

`site/assets/css/tokens.css` deliberately separates two kinds of custom property,
in explicitly labeled blocks:

1. **App-faithful tokens** — `--bg`, `--panel`, `--panel-2`, `--titlebar`, `--text`,
   `--dim`, `--faint`, `--border`, `--grid`, `--grid-alt`, `--gutter`,
   `--gutter-text`, `--hover`, `--green`, `--orange`, `--red`, `--purple`,
   `--blue`, `--search`, `--accent`, and the derived alpha tints
   (`--accent-soft`, `--block-selection`, `--line-selection`, `--match-bg`,
   `--current-match-bg`). Every hex is copied verbatim from
   `tabula-rasa/src/theme.rs`'s `DARK`/`LIGHT` `Palette` consts — see
   `tabula-rasa/docs/ui-ux/visual-system.md` for the canonical table this was
   transcribed from. The derived-tint alpha bytes match `Palette`'s
   `accent_soft`/`block_selection`/`line_selection`/`match_bg`/`current_match_bg`
   methods exactly (expressed as 8-digit hex, e.g. `#66d9ef29` = accent @ alpha
   `0x29`).
2. **Site-level tokens** — `--space-*`, `--radius-*`, `--container-max`, `--ease`,
   `--font-*`. These exist only for the marketing shell (hero, feature cards,
   footer, etc.) that wraps the app-faithful showcase. Free to restyle without
   touching the app.

**Why split them:** the brief asked for colors to be "refactored and explicit, so
it can be simply updated" while the app's own theme is mid-polish. Mixing "this
must match the app" values with "this is just this website's spacing scale" in
one flat list would make a future re-sync from `theme.rs` error-prone — you'd have
to diff every value instead of replacing one clearly-bounded block.

**Sync procedure (manual — there is no build-time link between the two repos):**
when `tabula-rasa/src/theme.rs`'s `DARK`/`LIGHT` consts change, re-copy the
app-faithful block in `tokens.css` by hand, value for value. This is a rare event
(the app's `theme.rs` header itself calls the accent "the one user-tweakable
brand knob" and the rest fixed), so no tooling was built for it — revisit if that
assumption stops holding.

## Dark default, OS-follow

The app defaults to `Theme::Dark` (`theme.rs`). This site mirrors that as the
default, but — like `benjaopazoc.cl` — actually **follows the OS preference**
until the visitor makes an explicit choice, via the same inline pre-paint script
+ `localStorage.theme` pattern (see `theme.js` and the `<head>` script in
`index.html`). That's a deliberate small deviation from "always start dark": a
visitor arriving in light mode because their OS is in light mode is better UX than
forcing dark and letting them discover the toggle.

## Fonts: vendored, not CDN

- **JetBrains Mono** (`assets/fonts/JetBrainsMono-Regular.ttf`) and the **Lucide
  icon font** (`assets/fonts/lucide.ttf`) are copied byte-for-byte from
  `tabula-rasa/assets/fonts/`, alongside their license files (OFL for JetBrains
  Mono, ISC for Lucide). Using the exact same font binary as the app — not a
  Google Fonts approximation — is what makes data-styled text and icons in the
  showcase pixel-identical to the real app, and it keeps the site fully
  self-contained (no external font request, no CDN dependency, works offline).
- **Chrome text uses the system-ui stack**, no vendored sans-serif — this isn't a
  shortcut, it's what `docs/ui-ux/visual-system.md` says the app itself does
  ("Chrome: system-ui sans... egui's default proportional font"). Matching that
  exactly is more faithful than picking a "nice" web font that the app doesn't
  actually use.

## Icons: named codepoints only

`demo-table.js`'s `ICON` map copies the exact Private-Use-Area codepoints from
`tabula-rasa/src/icons.rs` (e.g. `FILTER = U+E0DC`, `HEATMAP = U+E4FF`) — never
guessed. Lucide's font has thousands of glyphs; guessing a codepoint risks a wrong
or tofu glyph with no easy way to notice visually. Anything the demo needs that
isn't in `icons.rs` (sun/moon theme toggle, download arrow, platform icons in the
download cards) is a small hand-drawn inline SVG instead, at roughly the same
~1.4–1.5px stroke weight as Lucide's thin-line style, so it doesn't visually clash.

Platform icons (Linux/Windows/macOS) are intentionally **generic geometric
glyphs**, not the actual trademarked OS logos — this avoids any brand/trademark
question while still being immediately recognizable paired with the text label.

## Browser baseline

`styles.css` uses `color-mix(in srgb, ...)` (rule pill tints, hover washes,
detected-card border) instead of precomputed static hex — it reads directly as
"tint X toward Y," matching the app's own `theme.rs` mixing/tinting functions in
spirit, and keeps every tint a one-token change instead of a hand-recomputed hex.
That needs a 2023-era browser (Chrome 111+, Safari 16.4+, Firefox 113+). Accepted
for a first prototype; if analytics later show meaningful legacy-browser traffic,
replace those specific declarations with static fallback hex values — not a
site-wide rewrite.

## Responsive

Mobile-first per the brief ("mobile as a centerpiece"). Two breakpoints,
`styles.css` §16: `640px` (2-up feature grid, 3-up download cards, footer goes
horizontal) and `860px` (full nav appears, 3-up feature grid). Below `860px` the
header nav collapses to just the theme toggle + a persistent small "Download"
button — no hamburger menu, matching `benjaopazoc.cl`'s "don't add one unless nav
actually grows" rule; three anchor links don't need it.
