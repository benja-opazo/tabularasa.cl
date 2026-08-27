# Handoff: accent-button text is unreadable in light mode (`.btn-primary`, `.skip-link`)

**Status:** not started. Self-contained — everything needed to execute this is in this
file; no other conversation context required. Read `../CLAUDE.md` and
`docs/decisions/theming.md` first if you haven't touched this repo before (both are
short and this task assumes their conventions).

## The bug

Every accent-filled button on the site renders with **near-invisible text in light
mode**. Two places in `site/assets/css/styles.css` pair `background: var(--accent)`
with `color: var(--panel-2)`:

```css
/* styles.css ~line 153 */
.skip-link {
    ...
    background: var(--accent);
    color: var(--panel-2);
    ...
}
```

```css
/* styles.css ~line 483 */
.btn-primary {
    /* Mirrors theme::primary_button: accent fill + panel2 text, strong. */
    background: var(--accent);
    color: var(--panel-2);
}
```

`.btn-primary` is the site's main call-to-action class — the nav "Download" button,
the hero CTA, every download card, both pricing CTAs, across all three pages
(`index.html`, `pricing.html`, `donations.html`). This is the highest-visibility
button class on the site.

**Root cause:** `--accent` (`#66d9ef`, a light cyan) is the *same fixed hex in both
themes* — unlike every other token, its luminance doesn't flip between dark and
light. `--panel-2` does flip: it's dark in the dark theme (`#2a2b26`) but light in
the light theme (`#dedcd3`). So `accent`-bg + `panel-2`-text only reads correctly by
coincidence in dark mode. In light mode both colors are light — WCAG contrast ratio
**≈1.2:1** (fails even the loosest 3:1 UI-element bar, let alone 4.5:1 body text).
In dark mode the same pairing is ≈8.65:1 (comfortably passes), which is why this
went unnoticed until someone looked at the light theme specifically.

This is a straight copy of the identical bug already found and fixed in the sibling
`tabula-rasa` app repo (`../tabula-rasa` on this machine) — `.btn-primary`'s own
comment even names the Rust function it mirrors: `theme::primary_button`. That
function had the exact same `accent` fill + `panel2` text bug and has already been
fixed there. This handoff is the CSS-side equivalent of that fix.

## The fix

Don't invent a different mechanism — copy the one the app now uses, adapted to this
repo's static-token convention (`docs/decisions/theming.md`: app-faithful tokens are
exact hex copies, never computed at runtime — this repo has no JS color-math
utility and shouldn't grow one for this).

The app's fix (`tabula-rasa/src/theme.rs`, method `Palette::on_accent_text`) picks,
**per theme**, whichever neutral token actually clears WCAG's 4.5:1 body-text bar
against `accent`:
- **Dark theme:** `panel2` clears it (8.65:1) → use `panel2`.
- **Light theme:** `panel2` fails (1.2:1) → fall back to `text` (also 8.65:1, since
  light-theme `text` happens to be almost the same dark color as dark-theme
  `panel2`).

Translated to this repo's static tokens (these are already verified consistent with
the current `theme.rs`/`tokens.css` values — no re-derivation needed):

| Theme | `--on-accent-text` value | Source |
| --- | --- | --- |
| Dark | `#2a2b26` | same value as `--panel-2` (dark) |
| Light | `#2b2c27` | same value as `--text` (light) |

### Step 1 — add the `--on-accent-text` token to `tokens.css`

Add it to the **Derived tints** comment group in all **three** places dark/light
tokens are declared (the OS-preference-fallback block needs it too, or a visitor who
never explicitly picked a theme and whose OS is in light mode gets the dark value):

1. In `:root, :root[data-theme="dark"]` (~line 6), alongside the other derived
   tints:
   ```css
   --on-accent-text: #2a2b26; /* = panel-2 (dark) — text/glyphs on an accent fill */
   ```
2. In `:root[data-theme="light"]` (~line 49), same spot:
   ```css
   --on-accent-text: #2b2c27; /* = text (light) — panel-2 fails 4.5:1 against accent here */
   ```
3. In `@media (prefers-color-scheme: light) { :root:not([data-theme]) { ... } }`
   (~line 88, the pre-JS OS-follow fallback block — it already redeclares `--text`/
   `--panel-2` for this exact case, so it needs the light value too):
   ```css
   --on-accent-text: #2b2c27;
   ```

Add a short comment above wherever you land the block pointing at
`tabula-rasa/src/theme.rs`'s `Palette::on_accent_text` and this decision doc, per
the repo's own comments policy (pointer, not an essay).

### Step 2 — use it in `styles.css`

Change both call sites from `var(--panel-2)` to `var(--on-accent-text)`:

```css
.skip-link {
    ...
    background: var(--accent);
    color: var(--on-accent-text);
    ...
}

.btn-primary {
    /* Mirrors theme::primary_button / Palette::on_accent_text — see
       docs/decisions/theming.md. */
    background: var(--accent);
    color: var(--on-accent-text);
}
```

That's the entire code change. No HTML edits needed (`.btn-primary`/`.skip-link` are
shared classes used identically across `index.html`, `pricing.html`,
`donations.html`, and the `/latest/<platform>` worker's reused chrome — fixing the
CSS fixes every usage everywhere at once). No JS references `--accent`/`--panel-2`
together anywhere (checked `site/assets/js/*.js` — this is CSS-only).

## Verification checklist

Beyond this repo's standard pre-finish checklist (`../CLAUDE.md`), specifically:

- [ ] Open `site/index.html` in **light mode** (toggle via the theme button, or set
      OS to light mode and clear `localStorage.theme` to test the pre-JS fallback
      path too) — the hero CTA, nav "Download" button, and all three download-card
      buttons must show clearly dark, legible text on the cyan fill.
- [ ] Same check on `pricing.html` (both plan CTAs) and `donations.html`.
- [ ] Tab from the very top of the page (before any other focusable element) in
      **both** themes — the skip-link must show legible text when it becomes
      visible on focus.
- [ ] Dark mode: confirm nothing changed (the fix should be a visual no-op there —
      `on-accent-text` dark equals the old `panel-2` value exactly).
- [ ] Mobile width (~375px) — same buttons, same check.

## Docs to update (per this repo's own workflow)

- Add an entry to `docs/decisions/theming.md` (a new subsection under the existing
  "Two-tier token system" material, or its own short section) recording: what
  `--on-accent-text` is, why it's a separate token from `--panel-2` instead of just
  fixing `--panel-2`'s light value (because `--panel-2` is used correctly as a
  *background* elsewhere — this bug is specifically about it being wrong as
  *foreground text on an accent fill*), and the exact values + source above.
- Add the matching one-line pointer to `docs/decisions/INDEX.md` under "Theming".

## Out of scope — flagged, not fixed here

Found while investigating, unrelated to this bug, **do not silently fix as part of
this task** (ask first, per this repo's own decision-before-code norm for anything
non-obvious):

- **`--dim` and `--faint` are stale** in `tokens.css` relative to the current
  `tabula-rasa/src/theme.rs`. Current app values: dark `dim=#aeb0a9 faint=#90928b`,
  light `dim=#4f4f49 faint=#61615b`. Current `tokens.css` values: dark
  `dim=#8b8d83 faint=#5c5e55`, light `dim=#74756b faint=#a8a99e`. This predates this
  task and is a separate re-sync per `docs/decisions/theming.md`'s "Sync procedure"
  — `--accent`/`--panel-2`/`--text` (the tokens this fix actually touches) **are**
  confirmed still in sync, only `dim`/`faint` have drifted.
- **`.tr-cell-heat`** (`styles.css` ~line 1206) already hand-solves the same class
  of problem for the heatmap demo cell — dark uses `panel-2`, a
  `:root[data-theme="light"]` override switches to `text`. It's *not* the same bug
  (its background is a blue/red `color-mix`, not `--accent`, so its contrast math
  wasn't verified here) — it's just worth knowing this pattern already exists once,
  ad hoc, in case a future cleanup wants to fold it into `--on-accent-text` too.
