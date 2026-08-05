# Copy

## Why this page has real copy, not TODO placeholders

`benjaopazoc.cl`'s `CLAUDE.md` has a hard rule: never invent the owner's prose,
leave `<!-- TODO -->` for headings/taglines/body copy. That rule was written for
*that* repo. Here, the brief asked for a first working prototype to iterate on —
an index.html that's mostly empty TODO comments wouldn't be a demonstrable
prototype. So this page's copy is a **first draft written from the product's own
docs**, not invented, and it's flagged here precisely so it's easy to check each
claim against its source before it goes live.

## Source of every factual claim

| Claim on the page | Source |
|---|---|
| "fast, cross-platform CSV viewer/editor," "opens huge files instantly," "never hangs," "closer to Sublime Text than a spreadsheet" | `tabula-rasa/docs/project/overview.md` §Motivation |
| The three "trust guarantees" section (real data / no surprise loss / corrupt data can't hang it) | `overview.md` §Trust guarantees — paraphrased, not reworded in meaning |
| "Free to use... one-time lifetime pass removes the occasional nag" | `overview.md` §Monetization — **re-check this file if the monetization model changes**; the EULA itself is still undrafted per `roadmap.md`'s E8 Backlog |
| "No file locking... reloads or prompts on external change" | `overview.md` §Core requirements |
| Feature-card claims (huge files, filter/sort/group, search, column control) | `tabula-rasa/docs/ui-ux/components.md`'s "Status: built" rows |
| "Edit, in place" marked **In progress** | `overview.md` non-goals + `roadmap.md` E5 (editing/save) is listed as entirely untouched — this is aspirational, not shipped, and the badge says so |
| "Beyond CSV... Parquet, JSON" marked **Roadmap** | `overview.md` §Future direction |
| Platform list (Linux AppImage / Windows .exe / macOS Apple Silicon .dmg) | `tabula-rasa/scripts/release/gen_manifest.py`'s `TARGETS` — note **Intel Mac is not built today**, only `aarch64-apple-darwin` |
| "Beta" badge in the hero | `roadmap.md`'s "Current status" — beta scope is explicitly reopened/in progress as of the doc's last update |

## Known placeholders still needing the owner's input

- **License / EULA footer link** — points at `#` with a `data-todo` marker. The
  EULA itself doesn't exist yet (`roadmap.md` E8 Backlog: "EULA drafting + legal
  review... blocks charging money, not shipping"). Don't invent legal text here;
  wire the real link once it exists.
- **Contact** — uses `benjamin.opazo.c@gmail.com` directly (a `mailto:` link).
  Swap for a dedicated address if one gets set up.
- **OG image** — none set (`og:image` meta tag omitted rather than pointing at a
  placeholder). Add one before this URL gets shared anywhere link previews matter.
- **"Beta" framing** — re-check `roadmap.md`'s status before a real release;
  the badge and copy assume beta is still accurate as of this writing.
