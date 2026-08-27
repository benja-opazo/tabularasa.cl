# Decisions - Index

One line per decision. Full reasoning + tradeoffs live in the linked topic file.

## Theming (`theming.md`)

- Colors are a **two-tier token system**: app-faithful (exact hex from `theme.rs`, dark + light) vs. site-only (spacing/radius/type, free to restyle).
- Dark is the default theme, OS-preference-following until an explicit choice, mirroring both the app and `benjaopazoc.cl`.
- Fonts are **vendored, not CDN-loaded**: JetBrains Mono + the Lucide icon font, copied byte-for-byte from `tabula-rasa/assets/fonts/`.
- Chrome text uses the system-ui stack (no vendored sans) - matches the app's actual font choice exactly, not an approximation.
- Icon glyphs use the app's exact Lucide codepoints from `icons.rs`; anything without a known codepoint gets a hand-drawn SVG instead of a guess.

## Mobile navigation (`mobile-nav.md`)

- **Reversed decision:** below `860px` there's now a hamburger menu (`.nav-toggle` + `#mobile-nav`) instead of no menu at all - the earlier "three links don't need one" call stopped holding once `pricing.html` added a third link with no mobile way to reach it.
- **Pricing stays directly visible** at every width (`.nav-pricing`, never hidden) - it was the specific link mobile visitors were losing. Download is what's actually demoted - no persistent header button below `860px`, it lives inside the hamburger panel instead.
- `site/assets/js/nav.js` (new file) closes the panel on link click, outside click, Escape, or crossing back to `>=860px`.
- Bug fixed: `.mobile-nav` needs `position: sticky; top: 64px` like the header itself, or it scrolls out of view with the page and is only reachable at the very top.
- Same hand-sync constraint as the rest of the shared chrome - `index.html` and `pricing.html` both need the same edit.

## Mobile polish: cards, legibility, footer (`mobile-polish.md`)

- "Wall of cards" fixed with accent-tinted icon badges (`.feature-card .icon`) and a `--panel-2` background band on `#trust` - both applied at every width, not just mobile, per "the page should look the same in both modes."
- Deliberately not a horizontal-scroll carousel - that would hide cards behind a swipe gesture, undermining the discoverability work already done for the flip/play gestures (`feature-media.md`).
- `.feature-card p` / `.download-card p` font-size bumped (15px/14.5px) for legibility - same values everywhere, not mobile-only.
- `.footer-links` is now a fixed 3-column CSS grid at every width instead of an unpredictable `flex-wrap`.

## Demo table (`demo-table.md`)

- The showcase is a hardcoded ~18-row fixture with a real client-side state machine - no engine, no backend.
- Feature parity is deliberate: what's a disabled stub in the app (Number format, Freeze, Format panel, Order by, Go to row) is a disabled stub here too.
- Rendering splits into a full-shell rebuild (discrete actions) vs. a `<tbody>`-only refresh (search keystrokes) - the input element must never be destroyed while the user is typing into it.
- Heatmap/aggregate values are computed over the currently **filtered** rows, not the whole fixture.

## Downloads (`downloads.md`)

- Download cards' version/size text is populated by fetching the real `manifest.json` the release pipeline publishes - CORS on the `downloads.tabularasa.cl` R2 bucket for `https://tabularasa.cl` is confirmed working.
- The download buttons themselves don't depend on that fetch: every card + the hero CTA link to the `/latest/<platform>` landing page in a new tab, always - not a manifest-resolved file, and not just a CORS-failure fallback anymore (an earlier plan on this page said the opposite; superseded).
- The version/size fallback is **silent**: on any manifest-fetch failure `#download-note` is hidden and the cards keep `v—`/`—`. The old "Showing the standard download links - {reason}" note was cut deliberately - the visitor can't act on it and the buttons work anyway.

## Download redirect worker (`download-redirect.md`)

- `/latest/<platform>` is a Cloudflare Worker-rendered **click-through HTML landing page** with OG tags - the canonical destination for every download click on the site, not a bare 302 or a CORS fallback.
- It **auto-downloads** the real installer on load (hidden `<a download>`, auto-clicked) while keeping the visible button as a manual fallback, and shows a thanks/optional-donate message linking to `https://tabularasa.cl/donations.html` (must be absolute - this page is served from `downloads.tabularasa.cl`, which has no route for that path).
- **Reuses the real site chrome** - `tokens.css`/`styles.css`, header/footer/ambient-grid (hand-copied like `pricing.html`/`donations.html`), `i18n.js`/`theme.js`/`nav.js` - via the same hostname-agnostic `env.ASSETS` binding, instead of a hand-rolled inline stylesheet. Every asset path must be root-relative (`/assets/...`), a bare relative path would collide with the `/latest/*` route.
- Reused chrome text is real `data-i18n`, hydrated by the same `i18n.js`. Only the crawler-facing/pre-JS bits (title, meta/OG description, error state) stay hand-duplicated English/Spanish, chosen via `?lang=` (or `Accept-Language`); `?theme=` does the same job for the anti-flash script, since neither param's underlying state (`localStorage`) is readable across origins.
- This repo owns the worker (`worker/index.js` + `wrangler.toml`'s `main`/`routes`), not `tabula-rasa` - it's visitor-facing copy/branding, same responsibility this repo already has for the rest of the site.
- Manifest is fetched **server-side** in the Worker - no CORS dependency, unlike the client-side `fetch()` in `downloads.js`.
- Not yet verified: the Cloudflare zone name for the route.

## Deploy (`deploy.md`)

- Deploy path is **Cloudflare Workers Builds** (Workers' own git-connected CI/CD, the Workers equivalent of Cloudflare Pages) against Cloudflare Workers static assets (`wrangler.toml`) - moved off GitHub Actions once GH Actions minutes became the binding constraint; matches `benjaopazoc.cl` and `blog.benjaopazoc.cl`, which never used GitHub Actions either.
- **Deviation from the other two sites:** automatic deployment is left off - a push builds but doesn't go live by itself, since this site is still an active prototype. Publishing is a manual dashboard click (or local `npx wrangler deploy`).
- Build command runs the same JS syntax + comments-policy checks the old GitHub Actions job did; no repo secrets needed since Workers Builds deploys with the connected account's own credentials.
- Includes a step-by-step **runbook** for the one-time Cloudflare setup the `/latest/<platform>` redirect route needs (zone check, dry run, smoke test).

## Internationalization (`i18n.md`)

- Client-side dictionary swap (per-locale `assets/i18n/*.json` + `i18n.js` + `data-i18n*` attributes), not per-locale pages - no build step means no templating to generate `/en/`/`/es/` statically.
- **Active locale loads first, the rest load in the background** after `load` and get cached - a toggle click applies instantly once warm, without shipping every locale to every visitor.
- English is canonical; Spanish is kept in sync via the `sync-i18n` skill (`.claude/skills/sync-i18n/SKILL.md`).
- Detection order is `?lang=` query param → `localStorage` → `navigator.language` → English - the query param exists for the downloads.tabularasa.cl landing page (`worker/index.js`), a different origin that can't read this one's `localStorage`.
- The showcase demo (`#tr-demo-root`) is deliberately **not** translated - it replicates the real app, which is English-only today.
- Accepted trade-off: a brief flash of English before JS re-writes to Spanish, now with a small same-origin fetch layered on top - no build step means no true zero-flash trick for text content, unlike the theme toggle's color swap.
- The inline English text on each `data-i18n` element is only a fallback (JS overwrites it) - it drifts silently and must be re-synced whenever `en.json` changes; it's what non-JS crawlers index.
- `<noscript>` content is unreachable by `i18n.js` in both states (raw text when JS is on, no JS to run when it's off) - its `data-i18n` is inert, the hardcoded English always shows.

## Feature card flip + demo modal (`feature-media.md`)

- Only the 4 "Shipped" feature cards are interactive (`.is-flippable`) — click flips to a GIF on the back, a separate play button opens the same GIF full-size in a modal. The Roadmap card and trust cards opt out entirely.
- GIFs aren't shipped yet (`site/assets/img/features/<slug>.gif`, exact filenames in the doc) — missing files fall back to a "Demo coming soon" message instead of a broken image.
- The play icon is a hand-drawn SVG (no Lucide play/video codepoint exists in `icons.rs`), matching the existing platform-icon/theme-toggle convention.
- `.feature-modal[hidden] { display: none; }` is required — an author `display` rule otherwise always beats the UA `[hidden]` default.
- **v1, iterating:** the first card nudges once (flip preview + play-button pulse) the first time it scrolls into view, skipped if the visitor already found either gesture first.

## Ambient background grid (`ambient-grid.md`)

- Decorative 3D-tilted grid panels in the side gutters, dimming toward center via a `mask-image` on the panel (not the individual layers).
- The mouse-tracked glow is a deliberately flat, untransformed layer sitting under the tilted grid pattern - avoids inverting a 3D transform just to position a soft blob.
- Gated at `1300px` in both CSS (`display: none`) and JS (`matchMedia` skips attaching listeners entirely below it) - keep both in sync if the breakpoint changes.
- `z-index: -1` + first-child-of-body placement works because the rest of the page has transparent section backgrounds - no component needs to coordinate z-index with it.

## Pricing page (`pricing.md`)

- The site's first second page - `site/pricing.html` duplicates `index.html`'s head/header/footer by hand (no build step means no shared-layout mechanism); both files need manual edits kept in sync.
- Feature comparison table shows the **same** feature set for Personal and Enterprise on purpose - only the License row differs, by design (not a bug).
- "Contact for pricing" is wired to `mailto:tabularasa@benjaopazoc.cl` and styled as a normal `.btn-primary`; "Donate" now links to `donations.html` (a coming-soon stub) instead of `href="#"` - see `donations.md`.
- Donate is a **standalone prompt below both cards** (`.pricing-donate-standalone`), not nested in the Personal card - both cards now have the identical shape, so `margin-top: auto` reliably aligns both primary buttons on the same line.
- The link's own style, `.donate-link`, is generic (renamed from `.pricing-donate-link`) - reused for the inline donation link in `index.html`'s download section too.

## Donations page (`donations.md`)

- `donations.html` - the third static page, same hand-duplicated shell as `pricing.html`. Both existing donate entry points now link here instead of `href="#"`.
- Exists because the buttons couldn't be removed (reads as a rug-pull) but also couldn't go live (no server to safely process/verify a donation yet) - an honest "coming soon" page threads that needle.
- Revisited `CLAUDE.md`'s flagged "third page" checkpoint (shared-fragment tooling) and still called it not worth it - this page is a minimal, likely-temporary placeholder.
- Not linked from the main nav or footer - only reachable via the existing donate CTAs, since it isn't a primary destination.

## Copy (`copy.md`)

- First-draft marketing copy was written from the app's own docs (`overview.md`, `roadmap.md`), not left as placeholder TODOs - a deliberate departure from `benjaopazoc.cl`'s "never invent the owner's prose" rule, because an unusable empty prototype wasn't the goal here.
- The monetization line ("free, one-time lifetime pass removes an occasional nag") is a direct paraphrase of `overview.md`'s Monetization section - re-check that file before changing the claim.
