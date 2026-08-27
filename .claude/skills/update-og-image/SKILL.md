---
name: update-og-image
description: Official workflow for regenerating site/assets/img/og-image.png, the shared social-share preview image used by index.html/pricing.html/donations.html and the downloads.tabularasa.cl landing page. Use whenever the showcase demo's fixture data/styling changes, or when asked to "update the og:image", "refresh the share preview", "regenerate the social card", or similar.
---

# Update the og:image

This site's `og:image` is a screenshot of the interactive showcase demo
(`#tr-demo-root`, rendered by `site/assets/js/demo-table.js`), not a
hand-designed graphic - see `docs/decisions/seo.md` for why. Because the
demo is just fixture data + CSS, the image can be regenerated on demand
with no build step, no design tool, and no manual cropping.

## When to run this

- The showcase demo's fixture rows, columns, or visible feature set change
  in a way that makes the current screenshot look stale or inaccurate.
- `tokens.css`/`styles.css` change in a way that affects the demo's
  appearance (a re-theme, a re-sync from `theme.rs`, etc.).
- The user asks to refresh/regenerate the OG image, share preview, or
  social card.

## How it works

`scripts/og-image/capture.html` is a minimal, isolated page - just the real
`tokens.css`/`styles.css` + a bare `#tr-demo-root` div + `demo-table.js` -
sized so the showcase frame renders at its natural height inside a
1200×630 canvas (the universal OG/Twitter-card image size). It has zero
`fetch()`/network dependency (same as the real demo), so it loads instantly
over `file://` with nothing to time out or hang on.

`scripts/og-image/capture.mjs` drives a headless Chromium (`chromium` on
`PATH`, or set `CHROMIUM_BIN` to point at a different binary) to screenshot
that page directly at `--window-size=1200,630`, writing straight to
`site/assets/img/og-image.png` - no post-processing/cropping step, since the
capture page is already sized to exactly match.

## Steps

1. **Run the capture:**
   ```
   node scripts/og-image/capture.mjs
   ```
2. **Look at the result** (`site/assets/img/og-image.png`) before trusting
   it - confirm the grid, toolbar, and status colors rendered correctly and
   nothing is clipped oddly. If icons look missing/blank, the Lucide
   web font may not have had time to load - increase
   `--virtual-time-budget` in `capture.mjs` and re-run.
3. **Nothing else needs updating** - every page references
   `/assets/img/og-image.png` by a fixed filename (`index.html`,
   `pricing.html`, `donations.html`, `worker/index.js`), so overwriting the
   file is the entire "publish" step. No HTML edits, no cache-busting query
   string in use today.
4. Commit the regenerated PNG like any other asset change.

## Why a screenshot of the demo, not a hand-designed graphic or the hero section

A hand-designed graphic drifts from the product and needs a designer/design
tool to update. A screenshot of the marketing hero section was considered
and rejected - it's mostly typography that just repeats what the
title/description meta tags already say, so it adds no new information in a
tiny share-card thumbnail. The interactive demo is the one asset on this
site that visually proves "this is a real, working data grid" at a glance,
which is what a share preview should do.
