# Demo table (the interactive showcase)

## What it is

`site/assets/js/demo-table.js` renders a full replica of Tabula Rasa's chrome -
title bar, menu bar, tab strip, toolbar, grid, status bar, find bar - into
`#tr-demo-root`, driven by ~18 hardcoded fixture rows (an orders-style dataset:
`id, customer, region, status, amount, date`) and a small client-side state
machine. There is no engine, no file loading, no persistence - it resets on page
reload. This is the "let a visitor feel the app without installing it" surface the
brief asked for.

## Feature parity - what's real vs. stub

Matched directly against `tabula-rasa/docs/ui-ux/components.md`'s own
"Status: built" / "disabled stub" table, **on purpose**. Re-verified
2026-08-27 against the app's current source/docs (`src/view.rs`,
`src/compute.rs`, `docs/ui-ux/interactions.md`/`components.md`) after the
demo was found to have drifted behind the app - see "What the 2026-08-27
resync changed" below.

| Control                                                              | Demo behavior                                                                                        | Matches app's current state?                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Sort (header click, `Order by ▾`)                                    | Functional, **stackable multi-column** - shift+click a header adds a tiebreak, `Order by ▾` popover manages the stack, pills show precedence + direction | Yes                                                                      |
| Columns ▾                                                            | Functional show/hide checkboxes                                                                      | Yes                                                                      |
| Wrap                                                                 | Functional toggle                                                                                    | Yes                                                                      |
| Heatmap                                                              | Functional toggle, diverging blue↔red on `amount`                                                    | Yes                                                                      |
| Filter                                                               | Functional builder (column/operator/value, "Add" applies it), plus a present-but-gated SQL query tab | Yes (partial - see Simplifications: one rule only, no real per-column stack) |
| Group by ▾                                                           | Functional, **nested** (region and/or status, either order), purple pill per level, collapsible nested bands, swap-precedence control | Yes                                                                      |
| Cell selection                                                       | Functional rectangular range - click, click+drag, shift+click extends from the last anchor; column-header label click selects the whole column | Yes (partial - see Simplifications)                                     |
| Column headers                                                       | Drag handle (left, real reorder), label (click selects the column), chevron (right, always visible, click stacks/toggles sort) - three independent hit zones | Yes                                                                      |
| Aggregates (status-bar left zone)                                    | Per-column: Sum for numeric columns, unique-value count for text columns, computed over the current selection (narrowed to the selected columns for a range) or the filtered set | Yes in spirit (partial - see Simplifications: no per-slot function picker) |
| Aggregates (per-group-header row)                                    | Same Sum/Uniq stat, computed over that group band's own rows, shown next to the row count (skips whichever column that level is grouped on) | Yes in spirit - the app's own per-group aggregate is still in progress there |
| Find                                                                 | Functional - full-width bar, live highlight, match counter, Enter/Shift+Enter stepping, Esc to close | Deliberately **ahead** of the app's current toolbar wiring - see below   |
| Width ▾ / Height ▾                                                   | "Coming soon" popover, same uniform copy as every other gated/unbuilt stub                            | Matches app behavior; deliberately not modeled here (see Simplifications) |
| Number format / Freeze cols / Freeze rows / Format panel / Go to row | Disabled-look stub / "coming soon" popover                                                            | Yes - these are real disabled stubs in the app today                     |

**Why Find is functional here but is still a toolbar stub in the app:** the app's
`components.md` stub table already states the intended fix is "wiring \[Find\]
as a second entry point to the \[existing\] search strip" - i.e. the feature is
real, only the toolbar button isn't wired yet. Making the demo's Find button
clickable previews already-decided future app behavior rather than inventing
new scope, and a first-time website visitor has no way to know about `Ctrl/Cmd+F`
otherwise - an accessible entry point matters more here than exact stub-for-stub
parity.

## What the 2026-08-27 resync changed

The demo had drifted into feature/behavior staleness (not visual staleness -
icons, colors, and chrome layout checked out fine). Re-verified against the
app's current source/docs and brought up to parity:

- Sort and Group by were single-dimension only; now both are real stackable/
  nested multi-key state (`state.sorts`, `state.groupBy` arrays), matching
  the app's `Vec<SortKey>`/`Vec<GroupKey>` model.
- `Order by ▾` was a disabled stub with a tooltip pointing at header-click -
  that claim was itself stale, since the app has since shipped `Order by ▾`
  as a real control. It's now a real popover here too.
- Grouping sorted rows *within* each bucket; the app's actual pipeline is
  filter → sort → group, with bucket order being first-appearance order in
  the sorted sequence, not a fixed enum order. Fixed to match.
- Cell selection was single-cell only with no drag/range support at all
  ("now it's broken" turned out to be a CSS specificity bug masking the
  selection tint under row-hover, fixed separately - see `styles.css`'s
  `.tr-grid tbody tr td.is-cell-selected`). Real rectangular drag-select and
  shift-click extension were added on top of that fix.
- Aggregates were a static Count + Sum(amount) over the filtered set only;
  now they react to the current selection first, matching the app's
  status-bar live-selection aggregate in spirit (see Simplifications for
  what's still not modeled).
- Status cells (Shipped/Pending/Cancelled) were colored - removed, since
  conditional formatting isn't a real, built feature yet and coloring it
  implied otherwise.
- The demo's initial state was blank; it now loads pre-grouped/sorted/
  selected (see Dataset below) so a first-time visitor sees the payoff
  immediately.

A follow-up pass the same day corrected course on a few of the above after
visual/behavioral review:

- **Toolbar density**: the toolbar's gap was 16px (`--space-3`) between every
  button/group/divider - way looser than the real app. Tightened to 4px
  (`--space-1`) plus smaller per-button padding, so it reads as one dense
  row instead of visibly spaced-out clusters.
- **Gating messaging**: the `unbuilt`/`gated` copy split (and its lock badge)
  was reverted - every "coming soon" popover now shows identical copy ("Not
  available in the demo.") regardless of whether the app has it built or
  not. Its "Get the app" button now mirrors the hero CTA's already-detected-
  platform download link/target live (`downloadCtaHtml()`, reads
  `#hero-download-btn`), so it downloads immediately instead of just
  scrolling to `#download`.
- **Filter was rebuilt from scratch.** The original status-inclusion
  checkbox UI didn't look or behave like a real filter. It's now a
  Builder/SQL query tabbed popover (`Builder` real, `SQL query` a gated stub
  reusing the same "coming soon" mechanism) with one editable rule - column
  select, operator (`is`/`is not`), value input, "Add" to apply. There is
  still only ever one rule (see Simplifications) - the rebuild was about the
  *shape* of that one rule looking and working like a real filter, not about
  supporting a stack.
- **Aggregates were rebuilt** from a fixed Count+Sum(amount) pair to a
  basic per-column stat: Sum for numeric columns, unique-value count for
  text columns, across every visible column (or just the selected ones, for
  a range selection) - closer to the app's live-selection aggregate in
  spirit while staying far simpler than its real per-slot function catalog.
- **Column headers were redesigned** into three independent zones (drag
  handle, label, sort chevron), matching the app instead of one whole-header
  click-to-sort target. This is a real, working column drag-reorder
  (`state.columnOrder`), a real column-select-on-label-click (extends the
  selection/aggregate model to whole columns), and an always-visible sort
  chevron (dimmed when that column isn't sorted) that always stacks/toggles
  rather than replacing the whole sort on a plain click.

A second follow-up pass fixed remaining fidelity/positioning issues found in
visual review of the above:

- **Toolbar button order and right-alignment**: reordered the Format cluster
  to match the app's own toolbar (Columns, Width, Height, Number format,
  Heatmap - now with a label + chevron like the app's, still a plain toggle
  under the hood, see Simplifications - then Freeze cols/rows, Format panel,
  Wrap), and the Data cluster (Find, Go to row, Order by, Group by, Filter)
  now sits flush against the toolbar's right edge via a
  `.tr-toolbar-right-start` divider (`margin-left: auto`), instead of
  trailing left-aligned right after Format. Menu bar's fourth item corrected
  from "Data" to "Settings" to match the app.
- **Per-group-header aggregates added** - each group-header row now shows a
  Sum/Uniq stat per visible column (excluding whatever column that level is
  grouped on, since it's constant within the band) next to its row count,
  reusing the same basic Sum/Uniq logic as the status-bar aggregate
  (`groupAggregateHtml()`). The app has an equivalent feature in progress
  (not finished there yet) - this is the demo's own basic version, not an
  attempt to track that in-flight work.
- **Initial selection changed** to rows 2-7 (1-based) of the `amount` column
  only, rather than a 3-row/3-column block - with the default sort (amount
  desc) + group (region), that range crosses the West/South group boundary,
  so first paint shows a selection spanning two groups.
- **Filter popover positioning fixed.** Anchoring the wider (280px) filter
  popover to its own button's `right: 0` worked at some widths and
  overflowed off the left edge of the viewport at others, since the Filter
  button's position shifts as the (now right-aligned) toolbar wraps. Fixed
  by having the filter popover's anchor div opt out of the generic
  `.tr-popover-anchor` positioning (`.tr-filter-anchor { position: static }`)
  so the popover escapes up to position against `.tr-toolbar` itself
  (`right: 12px`, matching the toolbar's own padding) - a wide, stable
  reference point regardless of where the button wraps to.
- **Filter's SQL query tab no longer hides the tab strip.** Clicking it used
  to swap in the generic "coming soon" popover wholesale, which replaced the
  Builder/SQL query tabs with a plain title, leaving no way back to Builder
  without closing and reopening. Replaced with `state.filterTab`
  (`"builder"`/`"sql"`) - the same filter popover shell renders either way,
  swapping only the body between the builder row and the gated message, so
  the tabs stay clickable in both states.
- **Rule pill close icons ("×") were tofu** - `.tr-pill-close` (and
  `.tr-search-btn`) render a lucide-font codepoint but were missing
  `font-family: var(--font-icon)` (only the `.icon` class sets that), so the
  glyph fell back to the body font and showed as a missing-glyph box. Fixed
  by adding the font-family directly to both rules.

## Simplifications (deliberately out of scope)

- **Groupable/sortable dimensions are the fixture's existing columns**, not
  generalized to arbitrary columns - region/status for grouping (the
  fixture's only two useful categorical dimensions), any column for sorting.
- **No ctrl-click additive multi-select, no Alt-drag pan, no ctrl/shift-arrow
  keyboard selection, no draggable anchor dot.** The app doesn't have
  ctrl-click multi-select either; the rest is real app behavior but
  disproportionate keyboard-navigation depth for this demo.
- **Precedence reordering (sort/group) is a swap button, not the app's real
  drag-handle.** With at most 2 active levels per stack, a swap achieves the
  same practical outcome without a drag-and-drop implementation in a
  vanilla-JS, no-build-step codebase. Same reasoning for rule pills
  generally - no draggable reordering (column *headers* do get a real drag,
  see the parity table above - that one was worth building since it's a
  primetime, frequently-used gesture, unlike precedence reordering).
- **Aggregates are Sum/Uniq only** - not the app's full per-column, per-slot
  aggregate-function picker (Count, Min, Max, Median, etc.).
- **Filtering is a single hardcoded-shape rule** - column/operator/value are
  all real and editable, but there is exactly one rule ever (no "add another
  filter"), unlike the app's real multiple-simultaneous-AND-combined
  per-column filter stack. The SQL query tab is a real tab that's present
  for fidelity, but opening it is itself just another gated stub.
- **Width/Height popovers are a "coming soon" card**, not the app's real
  Auto/Fit/N-lines steppers - modeling that algorithm faithfully wasn't worth
  the scope for a marketing page.
- **Heatmap has no scale-options dropdown** - the button has the app's label
  + chevron for visual parity, but the chevron is cosmetic; clicking anywhere
  on the button just toggles heatmap on/off, it's a plain toggle here.

## Rendering strategy

Three distinct update paths, and mixing them up is the one thing to avoid
when extending this file:

1. **`renderShell()`** - replaces the entire `#tr-demo-root` innerHTML. Used for
   every _discrete_ action: sort, filter, group, heatmap, wrap, column
   visibility, opening/closing a popover, opening/closing the search bar. None of
   these have live text-entry focus to lose, so a full rebuild is simplest and
   there's no reason to hand-diff the DOM for an ~18-row fixture.
2. **`refreshRows()`** - replaces only `<tbody>`'s innerHTML. Used for **every
   search keystroke**, Enter/Shift+Enter match-stepping, and every selection
   change (row click, cell click/drag, shift-click extend). The search
   `<input>` lives outside `<tbody>`, so this path never touches it - critical,
   because a full shell rebuild on every keystroke would destroy and recreate
   the input element, dropping focus and cursor position after every
   character typed.
3. **`refreshAggregates()`** - replaces only `.tr-status-left`'s innerHTML.
   Called alongside `refreshRows()` on every selection change, since
   aggregates now depend on the current selection but selection changes are
   a `refreshRows()`-only action - `refreshRows()` itself deliberately stays
   ignorant of the toolbar/pills/status-bar zones (that's what makes it safe
   for search keystrokes), so a selection-driven aggregate update needs its
   own small, separate patch rather than widening `refreshRows()`'s scope.

Delegated event listeners (`root.addEventListener("click"/"change", ...)`) are
attached **once**, outside both render functions, to the `#tr-demo-root` node
itself - that node is never destroyed (only its children are, via `innerHTML =`),
so delegation survives every re-render without needing to re-bind anything. The
search `<input>`'s own `input`/`keydown` listeners are the one exception - that
element _is_ recreated on every `renderShell()`, so they're re-attached inside
`renderShell()` itself whenever the search bar is open.

## Ctrl/Cmd+F scope

The keyboard shortcut only activates `if (root.contains(document.activeElement))`

- never globally. An earlier draft also allowed it whenever the demo section was
  merely visible-ish in the viewport, which would have hijacked the browser's native
  find-in-page on unrelated parts of the site. `#tr-demo-root` carries `tabindex="0"`
  and a click handler parks focus on it when the click target isn't already
  focusable (a grid cell, a group-header row), so the shortcut reliably works after
  any interaction with the demo, without ever intercepting it elsewhere.

## Dataset

18 rows, 4 regions (North/South/East/West), 3 statuses (Shipped/Pending/
Cancelled) - status renders as plain text, not color-coded (conditional
formatting isn't a real, built feature yet - see "What the 2026-08-27 resync
changed"). The `id` column renders dimmed per `visual-system.md`'s "numeric
id/t-style columns render dimmed" rule. Enough rows to make sorting/grouping/
filtering feel real, few enough to keep the page weight and cognitive load
low.

Initial state on page load is deliberately "lived-in," not blank: grouped by
region, sorted by amount (descending), with rows 2-7 (1-based) of the
`amount` column pre-selected - given that default sort/group, this range
crosses the West/South group boundary, so a first-time visitor's first
selection already demonstrates that selection works across group bands, not
just within one. Single-level grouping only by default (both dimensions
nested would fragment 18 rows into sparse buckets on first paint) - nested
grouping stays fully available for a visitor who tries it.
