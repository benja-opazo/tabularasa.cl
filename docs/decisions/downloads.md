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
publishes - a version bump needs zero edits to this site.

## The CORS dependency - not yet verified

Browser `fetch()` from `tabularasa.cl` to `downloads.tabularasa.cl` is a
cross-origin request. **It needs the R2 bucket (or whatever serves that domain)
to send `Access-Control-Allow-Origin: https://tabularasa.cl` (or `*`) on
`manifest.json`.** This repo has no visibility into whether that's configured -
confirm it before relying on this working in production. If it's missing, the
`fetch` fails silently (browsers don't expose the reason to JS) and
`downloads.js`'s `.catch()` falls back gracefully - see below.

## Fallback behavior

If the manifest fetch fails (CORS, offline, R2 down, browser has no `fetch`), the
download cards keep the **static hrefs already in `index.html`**:
`https://downloads.tabularasa.cl/latest/<platform>`. **Reversed decision (was:
"not a real endpoint today"):** this redirect is going to be built -
a small Cloudflare Worker route on `downloads.tabularasa.cl` that reads
`manifest.json` server-side and 302s to the current installer per platform -
so the fallback hrefs point at a real, intentional URL, not a placeholder. Until
that redirect ships, these links are dead; that's expected and temporary, not a
bug to work around here.

Once both exist, there are two live mechanisms:

1. **`/latest/<platform>` redirect** (coming soon) - the static/fallback hrefs.
   No CORS needed since it's consumed as a normal link, not a `fetch`.
2. **`manifest.json` fetch** (current implementation, primary when it works) -
   rewrites hrefs to the exact versioned asset URL and fills in version/size
   text. Still needs CORS on the R2 bucket (see above) - not yet verified as
   configured.

### The fallback is silent - no explanatory note

The note under the cards (`#download-note`) only ever says something on the
**success** path (`download.note_latest`, the version + checksum line). On any
failure - fetch missing, CORS, offline, R2 down - `hideNote()` removes it
entirely rather than explaining what went wrong.

This was a deliberate removal: the earlier version composed
`download.note_fallback` ("Showing the standard download links - {reason}.
They still point to the latest release.") with a `{reason}` string per failure
mode. It was cut because the visitor can't act on any of it - the static
hrefs work, so the note was an infrastructure excuse in front of a download
button that functions fine. If a future change needs to surface a real,
actionable failure here, add a new key; don't resurrect the `{reason}`
composition pattern.

Kept as-is per explicit confirmation: once CORS is fixed, buttons should point
at the exact per-version release file (manifest-driven), not the `/latest/`
redirect - the redirect is just the resilient fallback path, not the intended
steady state.
