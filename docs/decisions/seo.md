# SEO basics

## `site/robots.txt` + `site/sitemap.xml`

Fully open (`Allow: /` for every user agent) plus a `Sitemap:` pointer -
nothing on `tabularasa.cl` is sensitive or work-in-progress in a way that
needs hiding from crawlers. The sitemap lists all three real pages
(`/`, `/pricing.html`, `/donations.html`) - `donations.html` is included
even though it's currently a bare "coming soon" stub, since it's a real,
valid page and there's no reason to hide a legitimate URL from search just
because a feature behind it isn't live yet.

No `<lastmod>` in the sitemap entries - there's no build step to keep a
hardcoded date accurate, and a stale one is worse than none. Revisit only if
this repo ever grows a build step that could stamp it automatically.

## Canonical tags on the three main pages

`index.html`/`pricing.html`/`donations.html` each got a self-referencing
`<link rel="canonical">` next to their existing `og:url` (which was already
correct, just not backed by a canonical tag). Cheap, avoids any duplicate-
content ambiguity.

## `noindex` on the `/latest/<platform>` landing pages

These pages (`worker/index.js`, `downloads.tabularasa.cl`) auto-trigger a
file download and have near-identical per-platform meta descriptions -
exactly the shape of thin/duplicate content search engines penalize, and a
poor experience if someone lands on one straight from a search result
instead of clicking an actual download button. Kept out of search results
two ways, deliberately redundant:

1. **`<meta name="robots" content="noindex" />`** in the page itself, plus
   an **`X-Robots-Tag: noindex` response header** on both the success (200)
   and manifest-fetch-failure (502) responses. This is the correct,
   sufficient signal on its own - `noindex` (not `noindex, nofollow`), so
   the real internal links in the reused header/footer still get followed
   normally.
2. **`downloads.tabularasa.cl/robots.txt`** (`Disallow: /` for every user
   agent) - needed its own `wrangler.toml` route (`downloads.tabularasa.cl/robots.txt`,
   exact path, no wildcard) since Routes are path-scoped and that path
   wouldn't otherwise reach this Worker at all, same reasoning as the
   `/assets/*` route in `docs/decisions/download-redirect.md`. Disallows the
   whole host, not just `/latest/*` - nothing there (the redirect pages,
   the shared CSS/JS, the R2-served release binaries) is meant to be a
   search result.

Belt-and-suspenders is intentional here, not redundant in practice: a
robots.txt disallow stops a crawler from ever fetching the page, but if the
URL is still linked from elsewhere and a crawler ignores robots.txt, the
`noindex` meta/header is what actually keeps it out of the index. Relying on
only one of the two leaves a gap the other closes.

## Structured data (`SoftwareApplication` JSON-LD, on `index.html` only)

A `<script type="application/ld+json">` block naming Tabula Rasa, its
description (mirrors `meta.description`/`en.json` - keep in sync),
`operatingSystem`, `applicationCategory: "DeveloperApplication"`, an
`author` (Benjamín Opazo), and a single `offers` entry for the free
Personal tier (`price: "0"`).

Two things deliberately left out:

- **`aggregateRating`** - there is no real rating data anywhere on this
  site, and fabricating one is explicitly against Google's structured-data
  guidelines (and a known penalty risk). This is also the *only* required
  property for Google's dedicated "Software App" rich result, so without it
  this page won't trigger that specific star-rating snippet - the JSON-LD
  is still valid and useful for general entity/product understanding, just
  not eligible for that one enhancement. Add it if/when this product ever
  has real reviews to report, never before.
- **The Enterprise tier's "contact for pricing"** - doesn't map to a
  schema.org `Offer` without either fabricating a number or leaving `price`
  empty (which Google's guidelines expect populated). Only the one real,
  fixed price (free) is represented.

- **`softwareVersion`** is also deliberately omitted - not required or even
  recommended by Google's guidelines, and the real version only exists in
  the release manifest fetched by `downloads.js` at runtime; hardcoding it
  in static HTML would just go stale on every release.

## `og:image` - a screenshot of the showcase demo, not a designed graphic

`site/assets/img/og-image.png` (1200×630, PNG, ~90KB) is a screenshot of the
real interactive showcase demo (`#tr-demo-root`), referenced from
`index.html`/`pricing.html`/`donations.html` and the `worker/index.js`
landing page (`og:image` + `og:image:width`/`height`, and `image` in the
JSON-LD above). `twitter:card` changed from `"summary"` to
`"summary_large_image"` everywhere too - `summary` only ever shows a small
square thumbnail regardless of the image provided.

**Why the demo, not the hero section or a hand-designed graphic:** a
screenshot of the hero is mostly typography that just repeats the
title/description text already in the share card - no new information in a
tiny thumbnail. A hand-designed graphic would need a designer/design tool
to keep updated and would drift from the real product. The interactive
demo is the one asset that visually proves "this is a real, working data
grid" - and it's just fixture data + CSS, so it can be **regenerated on
demand with a script**, no manual screenshotting/cropping.

**The capture pipeline** (`scripts/og-image/`, run via the `update-og-image`
skill): `capture.html` is a minimal page - real `tokens.css`/`styles.css` +
a bare `#tr-demo-root` + `demo-table.js`, nothing else - sized so the
showcase frame renders at its natural height (titlebar + toolbar + the
grid's own internally-scrolled `420px`-capped body + status bar ≈ 528px)
centered in a 1200×630 canvas. It has zero `fetch()`/network dependency
(same as the real demo), so `capture.mjs` can screenshot it over `file://`
with a headless Chromium (`--window-size=1200,630`) with nothing to hang or
time out on - no local server needed, no cropping/resizing step after,
since the page is already sized to match exactly.

**One known gap left in the demo itself:** the showcase demo's fixture data
predates the app's current version, so the screenshot reflects an
already-slightly-outdated demo - not something this pipeline fixes (that's
`docs/decisions/demo-table.md`'s scope), but worth re-running the capture
once the fixture is refreshed.

## What's still a known gap, not fixed here

- **Spanish content has no SEO visibility** - no separate URL per locale, no
  `hreflang`, `<html lang>` is hardcoded `"en"` in the raw HTML (JS flips it
  after the fact). This is the client-side-toggle i18n design's accepted
  trade-off (`docs/decisions/i18n.md`), not something this round changed.
