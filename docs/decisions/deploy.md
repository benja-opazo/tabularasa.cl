# Deploy

## Why GitHub Actions + `wrangler deploy`, not dashboard-only Cloudflare Pages

`benjaopazoc.cl` currently deploys via Cloudflare Pages configured entirely in
the Cloudflare dashboard - no workflow file in that repo at all. It also just
added a `wrangler.toml` (its most recent commit) pointing at Cloudflare's newer
Workers-with-static-assets model, but hasn't wired any CI to it yet either. Asked
directly which path to match, the choice was **GitHub Actions + `wrangler
deploy`** against the Workers static-assets model - so the whole deploy pipeline
is versioned and reviewable in this repo, not configured out-of-band in a
dashboard no one else can see.

`wrangler.toml` mirrors `benjaopazoc.cl`'s shape (`workers_dev = true`,
`preview_urls = true`, no `main` entry since this is a pure static-assets Worker)
with one difference: `[assets] directory = "./site"` instead of `"./_site"`,
because there's no build step here - `site/` is hand-authored and IS the deploy
artifact, not generated output.

## Manual trigger only - a deliberate deviation from `benjaopazoc.cl`

Unlike a typical site, this deploys **only via manual `workflow_dispatch`**, not
on every push to `main`. This is a companion site still being actively
prototyped/iterated on - auto-deploying every push would ship half-finished
changes to production. Trigger a deploy from the repo's Actions tab when a
change is actually ready to go live.

## Pipeline

`.github/workflows/deploy.yml`, run manually via `workflow_dispatch`:

1. **`check`** - `node --check` on each JS file. No build step exists to catch a
   syntax error otherwise (this caught a real bug once already: a malformed
   duplicate `style=` attribute in `demo-table.js`'s heatmap+right-align cell
   path, found by manual review before this pipeline existed).
2. **`deploy`** - `cloudflare/wrangler-action@v3` runs `wrangler deploy` using the
   two secrets below.

## One-time setup a human has to do (not scriptable from here)

1. **Create the Cloudflare API token** - Cloudflare dashboard → My Profile → API
   Tokens → Create Token → scope it to "Edit Cloudflare Workers" (or a custom
   policy: Account.Workers Scripts:Edit, Account.Workers Routes:Edit if using a
   custom domain) for the specific account this deploys under.
2. **Add repo secrets** - GitHub repo → Settings → Secrets and variables →
   Actions:
   - `CLOUDFLARE_API_TOKEN` - the token from step 1.
   - `CLOUDFLARE_ACCOUNT_ID` - found on the Cloudflare dashboard's right sidebar
     for this account.
3. **First deploy** creates the Worker (`tabularasa-cl`, from `wrangler.toml`'s
   `name`) under `workers_dev` - reachable at `tabularasa-cl.<subdomain>.workers.dev`
   immediately.
4. **Custom domain** - Cloudflare dashboard → Workers & Pages →
   `tabularasa-cl` → Settings → Domains & Routes → add `tabularasa.cl` (and
   `www.tabularasa.cl` if wanted). Deliberately left out of `wrangler.toml` itself
   - same convention `benjaopazoc.cl` uses (no explicit `routes` there either),
     so DNS/domain binding stays a dashboard concern, not something this repo
     claims to own.
