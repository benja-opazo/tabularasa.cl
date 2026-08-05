# Downloads

## Manifest-driven, not hardcoded links

The brief's initial ask was download buttons pointing at
`downloads.tabularasa.cl/latest/<platform>`. Investigating the actual release
pipeline (`tabula-rasa/.github/workflows/release.yml` +
`tabula-rasa/scripts/release/gen_manifest.py`) found that endpoint **doesn't
exist**: artifacts publish to `downloads.tabularasa.cl/releases/<version>/<file>`,
and the autoupdater's source of truth is a manifest at
`downloads.tabularasa.cl/releases/manifest.json`:

```json
{
  "schema_version": 1,
  "version": "X.Y.Z",
  "released_at": "2026-...Z",
  "targets": {
    "x86_64-unknown-linux-gnu": { "installer": {"url":..., "sha256":..., "size":...}, "update": {...} },
    "x86_64-pc-windows-msvc":  { "installer": {...}, "update": {...} },
    "aarch64-apple-darwin":    { "installer": {...}, "update": {...} }
  }
}
```

`downloads.js` fetches this manifest client-side, reads each platform's
`installer.url`/`.size`, and rewrites the download cards' href/version/size text.
The user's OS is detected from `navigator.platform`/`userAgent` to highlight the
matching card and rewrite the hero CTA's label + link. **This was chosen over
hardcoding links** because it can never drift from what a real release actually
publishes — a version bump needs zero edits to this site.

## The CORS dependency — not yet verified

Browser `fetch()` from `tabularasa.cl` to `downloads.tabularasa.cl` is a
cross-origin request. **It needs the R2 bucket (or whatever serves that domain)
to send `Access-Control-Allow-Origin: https://tabularasa.cl` (or `*`) on
`manifest.json`.** This repo has no visibility into whether that's configured —
confirm it before relying on this working in production. If it's missing, the
`fetch` fails silently (browsers don't expose the reason to JS) and
`downloads.js`'s `.catch()` falls back gracefully — see below.

## Fallback behavior

If the manifest fetch fails (CORS, offline, R2 down, browser has no `fetch`), the
download cards keep the **static hrefs already in `index.html`**:
`https://downloads.tabularasa.cl/latest/<platform>`. Those are not a real endpoint
today either — this is a "fail toward something plausible, not a dead link"
choice, not a claim that the redirect exists. Two real options if the primary
manifest path turns out to be unreliable in practice:

1. **Build the `/latest/<platform>` redirect** — a tiny Cloudflare Worker route on
   `downloads.tabularasa.cl` that reads `manifest.json` server-side and 302s to
   the current installer per platform. Then the fallback hrefs become real, and
   this becomes the primary mechanism (no CORS needed for a same-origin redirect
   consumed as a normal link, not a `fetch`).
2. **Fix CORS on the existing R2 bucket** and keep the manifest-driven JS as
   primary (current implementation) — smaller change, but keeps a client-side
   dependency in the critical download path.

Not decided which — flagged here for Benjamin to pick when verifying the R2/CORS
setup.
