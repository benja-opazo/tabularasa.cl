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

## Runbook: setting up the `/latest/<platform>` redirect route

One-time setup on top of steps 1-4 above, needed since `wrangler.toml` grew a
`main` script + a `routes` entry for the download-redirect worker (see
`docs/decisions/download-redirect.md`). Do these **before** the first deploy
that includes the `routes` entry - a bad zone name or an under-scoped token
fails at deploy time, not silently.

1. **Confirm the zone.** Cloudflare dashboard → your account → *Websites* -
   `downloads.tabularasa.cl` should appear as a DNS record **inside** the
   `tabularasa.cl` zone (check that zone's DNS tab), not as its own separate
   zone entry. `wrangler.toml`'s `routes` entry assumes
   `zone_name = "tabularasa.cl"` - if `downloads.tabularasa.cl` actually lives
   in a different zone, change `zone_name` to match before deploying.

2. **Widen the API token.** The token from step 1 above (scoped to "Edit
   Cloudflare Workers", i.e. `Account / Workers Scripts / Edit`) is not
   enough to attach a Worker Route to a zone - that needs the *zone-level*
   permission `Zone / Workers Routes / Edit` on the `tabularasa.cl` zone.
   - Dashboard → My Profile → API Tokens → edit the existing token → add
     permission `Zone / Workers Routes / Edit`, scoped to zone
     `tabularasa.cl` → Save. (Or create a new token with both permissions and
     update the `CLOUDFLARE_API_TOKEN` GitHub secret to match.)

3. **Dry-run locally before deploying.** From the repo root:
   ```
   npx wrangler deploy --dry-run
   ```
   Bundles `worker/index.js` and validates `wrangler.toml` (including the new
   `routes` entry) without publishing anything - catches a bad `zone_name` or
   malformed route pattern here instead of mid-deploy.

4. **Deploy** - either `npx wrangler deploy` locally, or the usual path:
   GitHub repo → Actions tab → "Deploy" workflow → *Run workflow*.

5. **Confirm the route attached.** Dashboard → Workers & Pages →
   `tabularasa-cl` → Settings → Domains & Routes - `downloads.tabularasa.cl/latest/*`
   should now be listed as a Route, alongside the existing `tabularasa.cl`
   custom domain.

6. **Smoke test in production** (plain `curl`, no browser/JS involved - this
   is what a crawler sees too):
   ```
   curl -i https://downloads.tabularasa.cl/latest/linux
   curl -i https://downloads.tabularasa.cl/latest/windows
   curl -i https://downloads.tabularasa.cl/latest/macos
   curl -i https://downloads.tabularasa.cl/latest/bogus     # expect 404
   curl -i https://downloads.tabularasa.cl/releases/manifest.json  # R2 /releases/* still untouched
   curl -i https://tabularasa.cl/                            # main site still serves normally
   ```
   Each `/latest/<platform>` response should be `200`, `content-type:
   text/html`, and contain the right `og:title`/`og:description` plus a
   download button pointing at a real `downloads.tabularasa.cl/releases/...`
   URL matching the manifest's current version.

7. **Optional: verify the preview card itself** with a real link-unfurl
   client (send the URL to yourself in Slack/Telegram, or use a browser-based
   OG-tag debugger) - the `curl` output already proves the tags are correct;
   this proves an actual client renders them as expected.
