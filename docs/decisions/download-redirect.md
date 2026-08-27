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
  `https://tabularasa.cl/donations.html` below the download button, in
  English or Spanish depending on `?lang=` (set by `downloads.js` from the
  visitor's active site locale) or, failing that, the `Accept-Language`
  header (for a raw shared link with no query param). See "How it works"
  below for the copy-duplication mechanics.
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
  else English), fetches `https://downloads.tabularasa.cl/releases/manifest.json`,
  looks up `targets[<triple>].installer`, and renders a small standalone
  HTML page (OG tags, an auto-triggered + manual download button, a
  thanks/donate message, dark-only, hand-copied inline app-faithful colors
  since a Worker can't `<link>` `tokens.css`) with a 200. Manifest fetch
  failure (offline R2, bad schema, unknown platform key not in
  `TARGET_BY_PLATFORM`) renders the same shell with an error message and a
  link back to `tabularasa.cl/#download`, with a 502 (404 for a platform key
  that isn't `linux`/`windows`/`macos` at all) - no auto-download or
  thanks/donate block in that case, there's no file to offer.
- Everything else (all of `tabularasa.cl`, any other path on
  `downloads.tabularasa.cl`) → `env.ASSETS.fetch(request)`, i.e. the static
  site behaves exactly as it did before this change.

`TARGET_BY_PLATFORM` (platform key → Rust target triple) and the per-platform
copy strings are duplicated **by hand**, in both English and Spanish, from
`site/assets/js/downloads.js` and the `download.*`/`pricing.cta_donate`
strings in `site/assets/i18n/{en,es}.json` respectively - there's no bundler
shared-module step across a Worker script and the plain-script/JSON site
files, so this is a manual-sync invariant like the `tokens.css` ↔ `theme.rs`
one. Comments in `worker/index.js` point back here. **The donate link is a
hardcoded absolute URL** (`https://tabularasa.cl/donations.html`), not a
relative path - this page is served from the `downloads.tabularasa.cl` host,
where only the `/latest/*` Route is attached, so a relative link would
resolve against the wrong origin and 404.

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
