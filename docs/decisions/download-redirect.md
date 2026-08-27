# Download redirect worker (`/latest/<platform>`)

## What this replaces

`downloads.md` originally flagged `https://downloads.tabularasa.cl/latest/<platform>`
(the static fallback hrefs already in `index.html`) as "coming soon: a small
Cloudflare Worker route... that reads `manifest.json` server-side and 302s to
the current installer." That plan changed once link-preview behavior came up:
a bare 302 satisfies "works with zero JS" but fails "produces a decent
preview card" when pasted raw into WhatsApp/Slack/Telegram/etc., because the
crawler fetches a binary, not HTML, and has nothing to build a card from.
What's built instead: a small HTML **click-through landing page** with Open
Graph tags, served by a Cloudflare Worker.

## Decisions made this round

- **Owning repo/infra: this repo (`tabularasa.cl`), not `tabula-rasa`.**
  `wrangler.toml` now has a `main` script (`worker/index.js`) instead of being
  a pure static-assets Worker, plus a `routes` entry scoping it to
  `downloads.tabularasa.cl/latest/*`. Chosen because the landing page is
  visitor-facing copy/branding - the same responsibility this repo already
  owns for everything else on the site (`copy.md`, `theming.md`) - not
  release-pipeline logic. `tabula-rasa`'s R2 Custom Domain still serves
  `/releases/*` on the same hostname unchanged; a Worker Route on the more
  specific `/latest/*` path pattern takes precedence without needing to move
  anything off R2.
- **Auto-downloads on load, but keeps a real button too.** Originally this
  page required a manual click (to match GitHub Releases/SourceForge-style
  pages and avoid an unsolicited-download surprise). That changed once this
  became the canonical destination for *every* download click, not just a
  CORS-failure fallback: a hidden `<a download>` auto-clicks itself on page
  load so the file starts saving immediately, while the same visible button
  stays in the DOM (now also carrying `download`) as a manual fallback if a
  browser/extension blocks the auto-click. Same-origin as the R2 release
  file (`downloads.tabularasa.cl` on both sides), so `download` is honored
  without needing `Content-Disposition` from R2.
- **Every download click routes here now, not just the CORS-fallback case.**
  `site/index.html`'s card buttons and the hero CTA all link to this page
  (in a new tab) instead of a manifest-resolved file URL - see
  `docs/decisions/downloads.md`'s "Every click goes through the landing
  page" section for why that reverses an earlier plan.
- **Bilingual, plus a thank-you/donate message.** The page shows "Thanks for
  choosing Tabula Rasa" and an optional "Donate" link to
  `https://tabularasa.cl/donations.html` below the download button. The
  dynamic/crawler-facing parts (title, meta description, OG tags, button
  text before JS hydrates) pick English or Spanish from `?lang=` (set by
  `downloads.js` from the visitor's active site locale) or, failing that,
  `Accept-Language` - see "How it works" below.
- **Reuses the real site chrome instead of a hand-rolled inline page.**
  Originally this was a minimal standalone HTML fragment with hardcoded
  inline colors (a Worker can't `<link>` a stylesheet from its own
  filesystem) and no header/footer, because it was conceived as a lightweight
  fallback. Once it became the canonical destination for every download
  click, "lightweight fallback" stopped being the right frame - it needed to
  look like the rest of the site. It now `<link>`s the real `tokens.css`/
  `styles.css`, includes the same header/footer/ambient-grid markup as
  `index.html` (hand-copied, same convention `pricing.html`/`donations.html`
  already use), and loads `i18n.js`/`theme.js`/`nav.js` - all of it resolved
  via the same `env.ASSETS` binding that serves `tabularasa.cl`. **This
  needed a second `wrangler.toml` route**, `downloads.tabularasa.cl/assets/*`
  - a Cloudflare Route only sends matching paths to this Worker, so without
  it `/assets/...` requests on that hostname would miss the Worker entirely
  and 404 against whatever else serves it (the initial version of this
  change shipped without that route and broke exactly this way - see git
  history). Once a request does reach the Worker, every asset/script
  `src`/`href` in `worker/index.js` must still be **root-relative**
  (`/assets/...`) - a bare relative path (`assets/...`, what `index.html`
  itself uses, since it lives at the site root) would resolve against this
  route's own `/latest/<platform>` URL and get misread as another platform
  lookup by the same handler.
- **Full light/dark theme, via a `?theme=` param.** Since the page now loads
  the real tokens.css, it can support both themes like every other page -
  but `localStorage.theme` is scoped to `tabularasa.cl` and invisible from
  `downloads.tabularasa.cl`, so without a signal it would only ever follow
  OS preference. `downloads.js` appends `?theme=<current theme>` next to
  `?lang=`; the page's anti-flash script (mirroring `index.html`'s, see
  `docs/decisions/theming.md`) checks it before `localStorage`/OS
  preference.
- **Reused chrome text is real `data-i18n`, not more hand-duplicated copy.**
  The header/footer/nav markup is byte-identical to `index.html`'s (English
  text + `data-i18n` attributes), so the same `i18n.js` every page already
  loads hydrates it - no separate copy path. That only works because
  `i18n.js` now also accepts `?lang=` as a detection source (it can't read
  this origin's `localStorage` either) - see `docs/decisions/i18n.md`.
- **No `og:image`.** Matches `copy.md`'s existing convention for the main
  page (`og:image` omitted rather than pointing at a placeholder) - no asset
  exists yet. Add one to both places together if that ever changes.
- **Manifest is fetched server-side, no CORS needed.** `worker/index.js`'s
  `fetch()` call to `manifest.json` runs in the Worker, not a browser - CORS
  is a browser-only concept, so this path doesn't depend on the CORS header
  `downloads.md` flags as unverified for the client-side `fetch()` in
  `downloads.js`. These are two independent mechanisms; fixing/breaking CORS
  affects only the client-side one.

## How it works

`worker/index.js` is the Worker's `main` script. On every request it checks
the hostname + path:

- `downloads.tabularasa.cl/latest/<platform>` → picks a language (`?lang=en`
  or `?lang=es` if present and valid, else parsed from `Accept-Language`,
  else English) and a theme (`?theme=dark`/`?theme=light` if present, else
  `localStorage`/OS preference, same as `index.html`), fetches
  `https://downloads.tabularasa.cl/releases/manifest.json`, looks up
  `targets[<triple>].installer`, and renders a full page: the real head
  boilerplate (favicon, `tokens.css`/`styles.css`, anti-flash script, OG
  tags), the hand-copied header/ambient-grid/footer, and a main section with
  an auto-triggered + manual download button, version/size text, and a
  thanks/donate message - with a 200. Manifest fetch failure (offline R2,
  bad schema, unknown platform key not in `TARGET_BY_PLATFORM`) renders the
  same shell (still with the full chrome, so a visitor stuck here can still
  navigate the real site) but swaps the main section for an error message
  and a link back to `tabularasa.cl/#download`, with a 502 (404 for a
  platform key that isn't `linux`/`windows`/`macos` at all) - no
  auto-download or thanks/donate block in that case, there's no file to
  offer.
- `downloads.tabularasa.cl/assets/*` (a **separate** `wrangler.toml` route,
  not inferred automatically - see the "Reuses the real site chrome" bullet
  above) and all of `tabularasa.cl` (a full Custom Domain, so every path
  reaches this Worker) → `env.ASSETS.fetch(request)`, i.e. the exact same
  static files either host serves. This is what makes reusing the real
  CSS/JS/fonts from `downloads.tabularasa.cl` work with zero CORS friction
  (same-origin from the browser's point of view, since it requested
  `/assets/...` from `downloads.tabularasa.cl` in the first place) - but
  only for paths an actual Route sends here.
- Any other path on `downloads.tabularasa.cl` (anything not `/latest/*` or
  `/assets/*`) never reaches this Worker at all - Cloudflare Routes are
  path-scoped, not "this Worker owns the whole hostname." It falls through
  to whatever else serves that host (today, the R2 Custom Domain for
  `/releases/*`, and a plain 404 for anything not covered by that or by a
  Route).

`TARGET_BY_PLATFORM` (platform key → Rust target triple) is duplicated **by
hand** from `site/assets/js/downloads.js` - there's no bundler shared-module
step across a Worker script and the plain-script site files, so this is a
manual-sync invariant like the `tokens.css` ↔ `theme.rs` one. The header/
footer/nav text is **not** duplicated - it's the same markup + `data-i18n`
attributes as `index.html`, hydrated by the real `i18n.js`. What's left
hand-duplicated in English/Spanish is only what must resolve before any JS
runs or has no real i18n-key equivalent: the title, meta description, OG
tags, and the error-state copy; the reused fields (`platformDesc`,
`buttonLabel`, the thanks message, the donate label) each carry a matching
`data-i18n` attribute too, so i18n.js corrects them to the live dictionary
value the moment it loads - comments in `worker/index.js` note which real
key each hand-duplicated string mirrors. **The donate link is a hardcoded
absolute URL** (`https://tabularasa.cl/donations.html`), not a relative
path - relative internal links throughout this page point at
`https://tabularasa.cl/...` on purpose, since it has none of the anchors/
pages they target itself.

## Setup runbook

Step-by-step one-time Cloudflare setup (zone check, token scope, dry run,
deploy, smoke test) lives in `docs/decisions/deploy.md`'s "Runbook: setting up
the `/latest/<platform>` redirect route" section, rather than duplicated here.

## Not yet verified - check before relying on this in production

- **`zone_name = "tabularasa.cl"` in the new `wrangler.toml` route** assumes
  `downloads.tabularasa.cl` sits in the same Cloudflare zone as the apex
  domain. This repo has no visibility into the R2/DNS setup `tabula-rasa`'s
  release pipeline configured (same blind spot `downloads.md` already flags
  for the CORS header) - confirm the zone name matches before the first
  deploy, or `wrangler deploy` will fail to attach the route.
- **API token scope** was a concern under the old GitHub Actions pipeline
  (attaching a route needs `Account.Workers Routes:Edit`, not just `Workers
  Scripts:Edit`) - no longer applicable now that deploys run via Cloudflare
  Workers Builds with the connected account's own full credentials, see
  `deploy.md`.
- **Build check step** (Cloudflare Workers Builds' build command, see
  `deploy.md`) runs `node --check` against `worker/index.js` separately
  (needs `--input-type=module` since it's an ES module, unlike the plain
  scripts in `site/assets/js/`) - keep both checks if either file's module
  format ever changes.

## Downloads.md status update

`docs/decisions/downloads.md`'s "coming soon" language is stale as of this
change - the `/latest/<platform>` redirect now exists as a real landing page,
not a placeholder. See that file's updated fallback-behavior section.
