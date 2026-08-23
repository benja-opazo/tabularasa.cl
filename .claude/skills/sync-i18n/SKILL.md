---
name: sync-i18n
description: Official workflow for editing tabularasa.cl's marketing copy and keeping the Spanish translation in sync. Use whenever English strings in site/assets/i18n/en.json are added or changed, or when asked to "translate the site", "update the Spanish copy", "sync i18n", or similar. Do not hand-translate copy without this skill - it exists specifically to surface ambiguous phrasing to the user instead of silently guessing.
---

# Sync i18n (EN → ES)

This site (`tabularasa.cl`) has no build step - each locale is a flat JSON
file, `site/assets/i18n/en.json` and `es.json`, fetched at runtime by
`i18n.js`. English is canonical. This skill is the only sanctioned way to
update the Spanish file - see `docs/decisions/i18n.md` for the architecture
this sits on top of.

## When to run this

- The user (or you, on their behalf) added or edited a key in `en.json`.
- The user asks to translate, localize, or "sync" the site copy.
- You're adding a new translatable element to `index.html` and need both an
  `en.json` and `es.json` entry for its `data-i18n` key before it can ship.

## Steps

1. **Diff `en.json` against `es.json`.** Read both files. Find:
   - Keys present in `en.json` but missing from `es.json` (new copy).
   - Keys present in both, where you have reason to believe `en.json` changed
     (check recent git history with `git log -p --
site/assets/i18n/en.json`, or compare against what the user just edited) -
     the `es.json` value for that key is now stale and must be re-translated.
   - Keys present in `es.json` but missing from `en.json` (orphaned - should
     be removed, not translated).
     Never assume the two files are already in sync; always verify by
     reading both, key by key.

2. **Translate each new/changed key.** Target: neutral Latin American
   Spanish (no `vosotros`, no Spain-specific slang) - this domain is `.cl`
   but the existing translations use general LatAm phrasing, not
   Chile-specific slang, so stay consistent with that register. Match
   `es.json`'s existing tone: direct, technical, marketing-plain - not more
   formal or more flowery than the English.

   **Keep as-is, do not translate:**
   - Proper nouns: `Tabula Rasa`, `benjaopazoc.cl`, `Benjamín Opazo`, `Sublime
Text`, platform names (`Linux`, `Windows`, `macOS`).
   - File format/extension literals: `CSV`, `.AppImage`, `.exe`, `.dmg`,
     `Parquet`, `JSON`, `UTF-8`.
   - Anything inside the showcase demo (`demo-table.js`) - that's out of
     scope entirely, see "Out of scope" below.

3. **Flag subtleties instead of guessing.** Stop and ask the user (don't
   silently pick one) whenever a string has:
   - An idiom or cultural reference that doesn't map 1:1 (e.g. "closer to
     Sublime Text than to a spreadsheet" - the comparison itself needs to
     still land for a Spanish-speaking reader).
   - Wordplay or a pun tied to the English phrasing.
   - A term with more than one reasonable Spanish rendering where the choice
     affects tone (e.g. formal "usted" vs. neutral impersonal phrasing -
     the existing `es.json` strings avoid both; don't introduce one without
     checking).
   - Ambiguous scope on a technical term (e.g. does "nag" mean a popup, a
     banner, a notification? confirm before choosing a Spanish equivalent
     that commits to one).
   - Legal/monetization language (EULA, pricing, "lifetime pass") - get this
     exactly right, ask rather than approximate.
     Ask concisely, batch multiple questions together if several strings are
     ambiguous, and only ask about things that actually change the
     translation - don't ask for approval on straightforward strings.

4. **Write the result into `es.json`**, preserving the same key order as
   `en.json` (makes future diffs readable). Use the same `{var}` placeholder
   tokens as the English string wherever it has one (e.g.
   `"download.cta_for_platform": "Download for {platform}"` →
   `"Descarga para {platform}"`) - don't rename or drop placeholders.

5. **Verify key parity and valid JSON.** Confirm both files parse and have
   identical key sets, e.g.:
   ```
   node -e '
   const en = require("./site/assets/i18n/en.json");
   const es = require("./site/assets/i18n/es.json");
   const a = Object.keys(en).sort(), b = Object.keys(es).sort();
   console.log(JSON.stringify(a) === JSON.stringify(b) ? "OK" : "MISMATCH");
   '
   ```
   A mismatch means either a forgotten translation or an orphaned key - fix
   before finishing, don't leave it.

6. **If a new element was added to `index.html`,** confirm it carries the
   right `data-i18n` / `data-i18n-html` / `data-i18n-attr` attribute and that
   the key matches exactly what you just added to both locale files.

## Out of scope

- `#tr-demo-root` / anything rendered by `demo-table.js` - the showcase
  demo is a faithful replica of the real (English-only) app and is
  deliberately excluded from translation. Never add `data-i18n` inside it.
- Don't invent a third locale. This site only ships `en`/`es` - if asked for
  another language, that's a new architectural decision for
  `docs/decisions/i18n.md`, not something to do inline here.

## If you learn something reusable

If a translation choice sets a pattern likely to recur (e.g. "we render
`nag` as `aviso`, not `recordatorio`, because X"), add it as a short note to
`docs/decisions/i18n.md` so the next translation pass doesn't re-litigate it.
Don't log routine, one-off word choices - only decisions with a non-obvious
reason.
