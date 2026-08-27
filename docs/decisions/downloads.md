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

`downloads.js` fetches this manifest client-side and reads each platform's
`installer.url`/`.size` to fill in the download cards' version/size text (not
the href - see "Every click goes through the landing page" below). The user's
OS is detected from `navigator.platform`/`userAgent` to rewrite the hero CTA's
label. **Fetching the manifest was chosen over hardcoding links** because the
displayed version/size can never drift from what a real release actually
publishes - a version bump needs zero edits to this site.

## The CORS dependency - verified working

Browser `fetch()` from `tabularasa.cl` to `downloads.tabularasa.cl` is a
cross-origin request, so it needs the R2 bucket to send
`Access-Control-Allow-Origin: https://tabularasa.cl` on `manifest.json` -
confirmed present and working (an R2 bucket CORS policy allowing that origin
+ `GET`). If it ever regresses, the failure is silent (browsers don't expose
the reason to JS) and `downloads.js`'s `.catch()` degrades gracefully: the
cards just keep showing `v—`/`—` instead of the real version/size - see
below. It no longer gates whether downloads *work*, only whether that text
is accurate, since the buttons don't depend on the manifest fetch at all
(see next section).

## Every click goes through the landing page - not a CORS fallback anymore

Card buttons and the hero CTA all link to the **`/latest/<platform>` landing
page** (`worker/index.js`, a Cloudflare Worker route on
`downloads.tabularasa.cl/latest/*`) in a new tab - never straight to the
manifest-resolved file. That page resolves the manifest **server-side** (no
CORS involved), auto-triggers the real file download on load, and shows a
"thanks for choosing Tabula Rasa" message plus an optional donate link. This
was a deliberate design change (see chat/PR history around the Cloudflare
migration) that reverses an earlier plan on this page: previously, once CORS
worked, buttons were meant to skip the redirect and link directly to the
exact file - that's no longer the intent. The landing page **is** the steady
state now, for every visitor, regardless of whether the manifest fetch
succeeds. Full rationale for the page itself, its bilingual copy, and the
auto-download mechanism: `docs/decisions/download-redirect.md`.

`downloads.js`'s manifest fetch now only feeds the cards' version/size text
and the OS-detected hero CTA label - it no longer touches any `href`.

### The version/size fallback is silent - no explanatory note

The note under the cards (`#download-note`) only ever says something on the
**success** path (`download.note_latest`, the version + checksum line). On any
failure - fetch missing, CORS, offline, R2 down - `hideNote()` removes it
entirely rather than explaining what went wrong. This was a deliberate
removal: the visitor can't act on any of it, and the download buttons work
regardless (they never depended on this fetch to begin with) - the note
would just be an infrastructure excuse in front of a working button. If a
future change needs to surface a real, actionable failure here, add a new
key; don't resurrect the old `{reason}`-composition pattern from before this
note was simplified.
