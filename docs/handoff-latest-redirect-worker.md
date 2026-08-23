# Handoff: build the `/latest/<platform>` redirect worker

Not a decision doc — nothing here is decided yet. Once resolved, fold the outcome
into `docs/decisions/downloads.md` (update its existing note) and add an
`INDEX.md` line; delete this file at that point.

## Why this exists

`downloads.js` already fetches `manifest.json` client-side to populate the
download cards (`docs/decisions/downloads.md`) — that's fine for a visitor
loading the page in a browser. But `index.html`'s static/fallback hrefs already
point at `https://downloads.tabularasa.cl/latest/<platform>` (linux/windows/macos —
same three keys as `TARGET_BY_PLATFORM` in `downloads.js`), and `downloads.md`
already flags that endpoint as "coming soon: a small Cloudflare Worker route on
`downloads.tabularasa.cl` that reads `manifest.json` server-side and 302s to the
current installer per platform."

New requirement from this round of discussion: these links need to work when
shared raw with **zero JS execution** — pasted into a messaging app, an ad, etc.
— and produce a **decent link-preview card** (title/image) when the receiving
app unfurls the URL (WhatsApp/Slack/Telegram/Twitter-X/iMessage all do a
plain GET and read Open Graph tags, no JS).

**This changes the previously recorded plan.** A bare 302 straight to the
installer binary satisfies "works without JS" but fails "good preview card" —
the crawler fetches a binary, not HTML, so there's nothing to build a card
from. `downloads.md`'s current "302 to the installer" note needs to become
"serve a small HTML page with OG tags, plus a real download action" once this
is built.

## What's already fixed (don't re-litigate)

- Domain + path: `downloads.tabularasa.cl/latest/<platform>` — already baked
  into `index.html`'s fallback hrefs.
- Platform keys: `linux` / `windows` / `macos` (not Rust target triples) — see
  `TARGET_BY_PLATFORM` in `site/assets/js/downloads.js`, which maps those to
  `x86_64-unknown-linux-gnu` / `x86_64-pc-windows-msvc` / `aarch64-apple-darwin`.
  Reuse that mapping rather than re-deriving it.
- Manifest source of truth: `https://downloads.tabularasa.cl/releases/manifest.json`
  (unversioned, atomically overwritten last by the release pipeline — see
  `tabula-rasa/docs/decisions/platform.md`, "Hosting: Cloudflare R2..."). The
  worker resolves the redirect target by reading `targets[triple].installer.url`
  from this, server-side, same shape `downloads.js` already parses.

## Open question 1: which repo/infra owns this worker

`downloads.tabularasa.cl` is **not** this repo's domain — it's an R2 bucket
custom-bound to that hostname by the `tabula-rasa` repo's release pipeline
(`tabula-rasa/docs/decisions/platform.md`). This repo (`tabularasa.cl`) only
owns the `tabularasa.cl` hostname, deployed as a pure static-assets Worker
(`wrangler.toml`, no `main` script today).

So the redirect worker is infra glue between the two repos, not naturally
"inside" either:

- **Option A — new Worker Route scoped to `downloads.tabularasa.cl/latest/*`,
  defined alongside the release pipeline in `tabula-rasa`.** Coexists with the
  existing R2 Custom Domain serving `/releases/*` on the same hostname —
  Cloudflare lets a Worker Route on a path pattern take precedence over
  whatever else is bound to a zone, so this doesn't require moving `/releases/*`
  off R2. Pro: lives next to the manifest schema and hosting decision it
  depends on (`platform.md`), one less place to keep in sync when the schema
  changes. Con: `tabula-rasa`'s repo scope is the app + release pipeline, not
  web copy/OG-tag design.
- **Option B — add a `main` script to *this* repo's `wrangler.toml`**
  (Cloudflare Workers-with-assets supports a worker script that handles
  specific routes and falls through to `env.ASSETS.fetch()` for everything
  else), bound to `downloads.tabularasa.cl` as a second route on this Worker.
  Pro: OG-tag copy/branding naturally belongs with the site that already owns
  all other visitor-facing copy (`docs/decisions/copy.md`) and i18n strings.
  Con: this repo currently has zero visibility into the R2/manifest hosting
  setup it would now depend on and partially front.

No strong default here — flag it to Benjamin rather than picking silently.
Leaning note: since the page/OG copy and i18n strings are this repo's
responsibility, and the worker script itself is tiny (fetch manifest, pick
target, render one HTML template), Option B keeps content changes in the repo
that already owns content — but Option A keeps infra changes in the repo that
already owns `downloads.tabularasa.cl`. Ask before building.

## Open question 2: redirect page UX

For "click here" JS-less human path — plain 302 (like the original plan)
auto-downloads the binary instantly on click, but forces a choice between:
- A visible **click-through landing page** (OG tags for the crawler, a real
  `<a href>` "Download for Windows" button for the human) — no auto-redirect.
  Safer (no surprise auto-download some browsers/security software flag) and
  simplest to reason about; costs one extra click.
- A **meta-refresh page** (`<meta http-equiv="refresh" content="0;url=...">`):
  crawlers reading OG tags don't execute the refresh, so the preview stays
  clean; a real browser bounces through automatically. Zero extra click, more
  moving parts.

Recommend the click-through version — matches how most software download
pages behave (SourceForge, GitHub Releases) and avoids an unsolicited-download
UX surprise. Not decided; confirm before building.

## Open question 3: page content

If a landing page is built (either option above), it needs:
- OG title/description/image sourced the same way every other on-page claim
  is — see `docs/decisions/copy.md`'s sourcing convention, don't invent copy.
- Visual tokens from `tokens.css` if it should look like the rest of the site
  (dark-default, same fonts/icons — see `docs/decisions/theming.md`) rather
  than a bare unstyled HTML page. Given it may live in a different repo
  (`tabula-rasa`, per question 1) that doesn't have `tokens.css`, this also
  bears on which option to pick — Option B gets the tokens for free.

## Suggested next step

Ask Benjamin to settle question 1 (which repo/Worker owns
`downloads.tabularasa.cl/latest/*`) before writing any code — it decides
where the rest of this work happens. Once settled, write the actual
`docs/decisions/download-redirect.md` (or the equivalent doc in whichever repo
wins) recording the choice and why, add its `INDEX.md` line, and delete this
handoff file.
