# tabularasa.cl

Companion / download site for [Tabula Rasa](../tabula-rasa), a CSV
viewer/editor built in Rust + egui. Plain HTML/CSS/JS, no build step, no npm.

See `CLAUDE.md` and `docs/README.md` for the design/architecture docs.

## Running it locally

The `site/` directory is the deploy root as-authored - nothing generates it.

**Quickest:** open `site/index.html` directly in a browser.

**Recommended** (needed for `fetch()` in `downloads.js` to behave like
production, since `file://` origins block it):

```bash
python3 -m http.server --directory site
```

Then visit `http://localhost:8000`.

## Running the download-redirect worker

`worker/index.js` only matters for the `downloads.tabularasa.cl/latest/<platform>`
route (see `docs/decisions/download-redirect.md`) - the rest of the site
doesn't need it. To run it locally with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npx wrangler dev
```

## Checks before pushing

```bash
node --check site/assets/js/<file>.js   # syntax check, per changed file
node scripts/check-comments.mjs         # comments-policy lint
```

Both also run as the build step in Cloudflare Workers Builds (see below) -
running them locally first just means you find out before the build does.

## Deploying

No GitHub Actions - this repo deploys via **Cloudflare Workers Builds**
(Cloudflare's own git-connected CI/CD), same as `benjaopazoc.cl` and
`blog.benjaopazoc.cl` deploy without ever touching GitHub Actions. A push to
`main` builds automatically, but **does not** go live by itself (deliberate,
this is still an active prototype) - publish manually from the Cloudflare
dashboard, or skip the dashboard and deploy straight from your machine:

```bash
npx wrangler deploy
```

No repo secrets needed. Full setup + the one-time dashboard runbook:
`docs/decisions/deploy.md`.
