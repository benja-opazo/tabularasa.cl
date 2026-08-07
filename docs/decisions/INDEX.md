# Decisions - Index

One line per decision. Full reasoning + tradeoffs live in the linked topic file.

## Theming (`theming.md`)

- Colors are a **two-tier token system**: app-faithful (exact hex from `theme.rs`, dark + light) vs. site-only (spacing/radius/type, free to restyle).
- Dark is the default theme, OS-preference-following until an explicit choice, mirroring both the app and `benjaopazoc.cl`.
- Fonts are **vendored, not CDN-loaded**: JetBrains Mono + the Lucide icon font, copied byte-for-byte from `tabula-rasa/assets/fonts/`.
- Chrome text uses the system-ui stack (no vendored sans) - matches the app's actual font choice exactly, not an approximation.
- Icon glyphs use the app's exact Lucide codepoints from `icons.rs`; anything without a known codepoint gets a hand-drawn SVG instead of a guess.

## Demo table (`demo-table.md`)

- The showcase is a hardcoded ~18-row fixture with a real client-side state machine - no engine, no backend.
- Feature parity is deliberate: what's a disabled stub in the app (Number format, Freeze, Format panel, Order by, Go to row) is a disabled stub here too.
- Rendering splits into a full-shell rebuild (discrete actions) vs. a `<tbody>`-only refresh (search keystrokes) - the input element must never be destroyed while the user is typing into it.
- Heatmap/aggregate values are computed over the currently **filtered** rows, not the whole fixture.

## Downloads (`downloads.md`)

- Download cards are populated by fetching the real `manifest.json` the release pipeline publishes, not hand-maintained links.
- This requires CORS to be enabled on the `downloads.tabularasa.cl` R2 bucket for `tabularasa.cl` - not yet verified as configured.
- The static `/latest/<platform>` hrefs in the HTML are the fallback if that fetch fails; they are not a real endpoint today (see the decision for what would need to exist for them to be).

## Deploy (`deploy.md`)

- Deploy path is **GitHub Actions + `wrangler deploy`** against Cloudflare Workers static assets (`wrangler.toml`), not `benjaopazoc.cl`'s current dashboard-only Cloudflare Pages setup - chosen explicitly so the pipeline is versioned and visible in-repo.
- **Deviation:** manual `workflow_dispatch` only, no push-to-`main` trigger - this site is still an active prototype, so deploys are a deliberate action, not automatic.
- No build job: the JS syntax check is the only pre-deploy gate.

## Internationalization (`i18n.md`)

- Client-side dictionary swap (`i18n-strings.js` + `i18n.js` + `data-i18n*` attributes), not per-locale pages - no build step means no templating to generate `/en/`/`/es/` statically.
- English is canonical; Spanish is kept in sync via the `sync-i18n` skill (`.claude/skills/sync-i18n/SKILL.md`).
- The showcase demo (`#tr-demo-root`) is deliberately **not** translated - it replicates the real app, which is English-only today.
- Accepted trade-off: a brief flash of English before JS re-writes to Spanish (no build step means no true zero-flash trick for text content, unlike the theme toggle's color swap).

## Feature card flip + demo modal (`feature-media.md`)

- Only the 4 "Shipped" feature cards are interactive (`.is-flippable`) — click flips to a GIF on the back, a separate play button opens the same GIF full-size in a modal. The Roadmap card and trust cards opt out entirely.
- GIFs aren't shipped yet (`site/assets/img/features/<slug>.gif`, exact filenames in the doc) — missing files fall back to a "Demo coming soon" message instead of a broken image.
- The play icon is a hand-drawn SVG (no Lucide play/video codepoint exists in `icons.rs`), matching the existing platform-icon/theme-toggle convention.
- `.feature-modal[hidden] { display: none; }` is required — an author `display` rule otherwise always beats the UA `[hidden]` default.

## Ambient background grid (`ambient-grid.md`)

- Decorative 3D-tilted grid panels in the side gutters, dimming toward center via a `mask-image` on the panel (not the individual layers).
- The mouse-tracked glow is a deliberately flat, untransformed layer sitting under the tilted grid pattern - avoids inverting a 3D transform just to position a soft blob.
- Gated at `1300px` in both CSS (`display: none`) and JS (`matchMedia` skips attaching listeners entirely below it) - keep both in sync if the breakpoint changes.
- `z-index: -1` + first-child-of-body placement works because the rest of the page has transparent section backgrounds - no component needs to coordinate z-index with it.

## Pricing page (`pricing.md`)

- The site's first second page - `site/pricing.html` duplicates `index.html`'s head/header/footer by hand (no build step means no shared-layout mechanism); both files need manual edits kept in sync.
- Feature comparison table shows the **same** feature set for Personal and Enterprise on purpose - only the License row differs, by design (not a bug).
- "Contact for pricing" and "Donate" are both honest stubs (`.btn-stub`, `href="#"`) - no real destinations exist yet, same convention as the footer's License/EULA stub. No donation URL exists anywhere in either repo; don't invent one.
- `.btn-donate` is deliberately more visually prominent (bigger, glowing) than `.btn-primary` - direct request, not a mistake.

## Copy (`copy.md`)

- First-draft marketing copy was written from the app's own docs (`overview.md`, `roadmap.md`), not left as placeholder TODOs - a deliberate departure from `benjaopazoc.cl`'s "never invent the owner's prose" rule, because an unusable empty prototype wasn't the goal here.
- The monetization line ("free, one-time lifetime pass removes an occasional nag") is a direct paraphrase of `overview.md`'s Monetization section - re-check that file before changing the claim.
