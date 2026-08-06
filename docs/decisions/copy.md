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
| "Beyond CSV... Parquet, JSON" marked **Roadmap** | `overview.md` §Future direction |
| Platform list (Linux AppImage / Windows .exe / macOS Apple Silicon .dmg) | `tabula-rasa/scripts/release/gen_manifest.py`'s `TARGETS` — note **Intel Mac is not built today**, only `aarch64-apple-darwin` |

## Removed since the first draft

- **"Beta · free to use" hero badge** — removed. Premature messaging for a
  prototype still being fixed up; revisit once there's an actual beta to badge.
- **"Edit, in place" feature card** — removed rather than left as **In
  progress**. `roadmap.md` E5 (editing & save) is listed as entirely untouched,
  so promising it — even as a roadmap item — overstated where the app actually
  is. Re-add once editing genuinely ships.
- **"no telemetry by default" hero-meta claim** — removed. The app doesn't have
  telemetry today, but that's expected to change soon, so a blanket "no
  telemetry" promise would go stale fast. Don't restore this claim without
  checking the current telemetry posture first.
- **Download-card "Detected" badge/highlight** — removed (`downloads.js`
  `applyDetected`, the `.is-detected` card border/background, and the badge
  markup/CSS). OS auto-detection still drives the hero CTA's label/link — only
  the per-card visual highlight was cut.
- **Contact email** — removed (`mailto:benjamin.opazo.c@gmail.com`) until a
  public-facing address exists. The footer's Support column currently only has
  the License/EULA stub; re-add a Contact link once there's an address to show.

## License / EULA — why it's empty

Not a bug: the EULA genuinely doesn't exist yet. `tabula-rasa/LICENSE` is a
proprietary copyright notice, explicit that it is **not** the end-user licence
agreement; `roadmap.md` E8 Backlog has "EULA drafting + legal review" as an
open, `[post-beta]` item that blocks *charging money*, not shipping. Rather than
a dead `href="#"` link, the footer now renders it as a non-interactive
`.footer-stub` ("License / EULA — Coming soon") with a `title` tooltip
explaining why — matches the demo table's own "honest stub, not a fake control"
convention (`docs/decisions/demo-table.md`). Wire the real link once legal
review lands; don't invent placeholder legal text here.

## Known placeholders still needing the owner's input

- **OG image** — none set (`og:image` meta tag omitted rather than pointing at a
  placeholder). Add one before this URL gets shared anywhere link previews matter.
- **Contact** — no public-facing email exists yet; the footer link was removed
  rather than left pointing at a personal address (see above). Add it back once
  one is set up.
