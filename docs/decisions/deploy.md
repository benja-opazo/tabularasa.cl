# Deploy

## Why Cloudflare Workers Builds, not GitHub Actions

This repo used to deploy via GitHub Actions + `wrangler deploy`
(`.github/workflows/deploy.yml`) - see git history for that design and its
original rationale (versioned, reviewable pipeline). That rationale no longer
wins: GitHub Actions minutes are now the binding constraint across all three
of Benjamín's static sites, and `benjaopazoc.cl` / `blog.benjaopazoc.cl` never
touch GitHub Actions at all - Cloudflare's own git integration runs their
builds on Cloudflare's infrastructure instead. This repo was the one holdout.
It now matches them: **no `.github/workflows/` directory**, deploy runs
entirely on Cloudflare.

`benjaopazoc.cl` is a pure static site, so it uses **Cloudflare Pages**. This
repo isn't pure static - `wrangler.toml` has a `main = "worker/index.js"`
entry for the `/latest/<platform>` redirect worker, so it's a
Workers-with-static-assets project. The Cloudflare-native equivalent for that
shape is **Workers Builds** (Workers' own git-connected CI/CD, functionally
the same idea as Pages: Cloudflare clones the repo, runs a build command, then
runs `wrangler deploy` on its own infrastructure).

## Deviation from `benjaopazoc.cl`: deploys stay manually gated

Unlike the other two sites, which auto-deploy on every push, this repo keeps
the same deliberate-gating behavior the old GitHub Actions pipeline had: a
push **builds** (runs the guard checks below) but does **not** go live by
itself. This is still an active prototype - auto-deploying every push to
`main` would ship half-finished changes. Publishing is a manual step once a
change is actually ready. Revisit this if the site graduates out of prototype
status.

## One-time setup: connect Cloudflare Workers Builds

1. The Worker (`tabularasa-cl`, from `wrangler.toml`'s `name`) already exists
   from the old pipeline's deploys. If starting fresh instead, create it once
   with `npx wrangler login && npx wrangler deploy` from the repo root.
2. Cloudflare dashboard → Workers & Pages → `tabularasa-cl` → **Settings →
   Build**.
3. **Connect to Git** → GitHub → authorize the Cloudflare Workers & Pages
   GitHub App (if not already authorized for this account) → select this repo
   → production branch: `main`.
4. **Build configuration:**
   - **Root directory:** `/` (`wrangler.toml` lives at the repo root).
   - **Build command** - the same two guards the old GitHub Actions `check`
     job ran, so a broken push still fails loudly instead of silently:
     ```
     for f in site/assets/js/*.js; do node --check "$f"; done && node --input-type=module --check < worker/index.js && node scripts/check-comments.mjs
     ```
   - **Deploy command:** `npx wrangler deploy` (Cloudflare usually auto-detects
     this once it sees `wrangler.toml`; set it explicitly if the dashboard
     doesn't infer it).
5. **Turn off automatic deployment** for the production branch (Settings →
   Build - look for an "Automatic deployments" toggle on the production
   branch config; exact label depends on the current dashboard). Confirm on
   the **Deployments** tab that a new push shows up as a completed build
   *awaiting* manual deploy, not as an already-live deployment.
6. **No repo secrets needed.** Workers Builds deploys using the connected
   Cloudflare account's own credentials, not a scoped API token - remove the
   old `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` GitHub repo secrets,
   they have no remaining use.

## Day-to-day: shipping a change

1. Push to `main` (or merge a PR into it) as normal. Cloudflare runs the build
   automatically and shows the result under the Worker's **Deployments** tab.
2. When the change is actually ready to go live, open that build in the
   dashboard and trigger the manual publish action next to it.
3. Or skip the dashboard entirely and deploy straight from your machine at any
   time: `npx wrangler deploy` from the repo root (needs `wrangler login`
   once). Useful for a same-day fix without waiting on the Git-triggered
   build.

## Custom domain

Cloudflare dashboard → Workers & Pages → `tabularasa-cl` → Settings →
Domains & Routes → add `tabularasa.cl` (and `www.tabularasa.cl` if wanted).
Deliberately left out of `wrangler.toml` itself, same convention
`benjaopazoc.cl` uses - DNS/domain binding stays a dashboard concern.

## Runbook: setting up the `/latest/<platform>` redirect route

One-time setup on top of the steps above, needed because `wrangler.toml` has
a `main` script + a `routes` entry for the download-redirect worker (see
`docs/decisions/download-redirect.md`). Do these **before** the first deploy
that includes the `routes` entry - a bad zone name fails at deploy time, not
silently.

1. **Confirm the zone.** Cloudflare dashboard → your account → *Websites* -
   `downloads.tabularasa.cl` should appear as a DNS record **inside** the
   `tabularasa.cl` zone (check that zone's DNS tab), not as its own separate
   zone entry. `wrangler.toml`'s `routes` entry assumes
   `zone_name = "tabularasa.cl"` - if `downloads.tabularasa.cl` actually lives
   in a different zone, change `zone_name` to match before deploying.

2. ~~Widen the API token~~ - not applicable anymore. The old GitHub Actions
   pipeline needed a token scoped to `Zone / Workers Routes / Edit` to attach
   a route; Workers Builds deploys with the full connected account's
   credentials, so this is a non-issue.

3. **Dry-run locally before deploying.** From the repo root:
   ```
   npx wrangler deploy --dry-run
   ```
   Bundles `worker/index.js` and validates `wrangler.toml` (including the
   `routes` entry) without publishing anything - catches a bad `zone_name` or
   malformed route pattern here instead of mid-deploy.

4. **Deploy** - either `npx wrangler deploy` locally, or trigger the manual
   publish from the Cloudflare dashboard's **Deployments** tab per the
   day-to-day steps above.

5. **Confirm the route attached.** Dashboard → Workers & Pages →
   `tabularasa-cl` → Settings → Domains & Routes -
   `downloads.tabularasa.cl/latest/*` should now be listed as a Route,
   alongside the existing `tabularasa.cl` custom domain.

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
