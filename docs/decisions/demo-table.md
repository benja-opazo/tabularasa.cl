# Demo table (the interactive showcase)

## What it is

`site/assets/js/demo-table.js` renders a full replica of Tabula Rasa's chrome —
title bar, menu bar, tab strip, toolbar, grid, status bar, find bar — into
`#tr-demo-root`, driven by ~18 hardcoded fixture rows (an orders-style dataset:
`id, customer, region, status, amount, date`) and a small client-side state
machine. There is no engine, no file loading, no persistence — it resets on page
reload. This is the "let a visitor feel the app without installing it" surface the
brief asked for.

## Feature parity — what's real vs. stub

Matched directly against `tabula-rasa/docs/ui-ux/components.md`'s own
"Status: built" / "disabled stub" table, **on purpose**:

| Control | Demo behavior | Matches app's current state? |
|---|---|---|
| Sort (header click) | Functional, asc/desc toggle, chevron indicator, sort pill | Yes |
| Columns ▾ | Functional show/hide checkboxes | Yes |
| Wrap | Functional toggle | Yes |
| Heatmap | Functional toggle, diverging blue↔red on `amount` | Yes |
| Filter | Functional, status-inclusion checkboxes, green pill | Yes |
| Group by ▾ | Functional, region/status/none, purple pill, collapsible bands | Yes |
| Find | Functional — full-width bar, live highlight, match counter, Enter/Shift+Enter stepping, Esc to close | Deliberately **ahead** of the app's current toolbar wiring — see below |
| Width ▾ / Height ▾ | "Coming soon" popover + Download CTA | Matches (real controls, not modeled — see Simplifications) |
| Number format / Freeze cols / Freeze rows / Format panel / Go to row | Disabled-look stub / "coming soon" popover | Yes — these are real disabled stubs in the app today |
| Order by (toolbar label) | Disabled, tooltip points at header-click instead | Yes — the app's own Order-by toolbar entry is a stub for the same reason |

**Why Find is functional here but is still a toolbar stub in the app:** the app's
`components.md` stub table already states the intended fix is "wiring \[Find\]
as a second entry point to the \[existing\] search strip" — i.e. the feature is
real, only the toolbar button isn't wired yet. Making the demo's Find button
clickable previews already-decided future app behavior rather than inventing
new scope, and a first-time website visitor has no way to know about `Ctrl/Cmd+F`
otherwise — an accessible entry point matters more here than exact stub-for-stub
parity.

## Simplifications (deliberately out of scope)

- **No drag-to-select / cell ranges.** Click selects one row (gutter) or one cell;
  no shift-click range, no drag-block selection. The visual tokens
  (`--line-selection`, `--block-selection`) are still used correctly for the
  single-row/single-cell case.
- **No draggable rule-pill reordering.** The app's status-bar pills support
  drag-to-reorder by precedence; the demo's pills are add/remove only.
- **Width/Height popovers are a "coming soon" card**, not the app's real
  Auto/Fit/N-lines steppers — modeling that algorithm faithfully wasn't worth the
  scope for a marketing page, and it's an honest stub rather than a fake control.
- **Heatmap has no scale-options dropdown** (`Heatmap [▾]` in the app) — it's a
  plain on/off toggle here.
- **Aggregates are fixed** to Count + Sum(amount) over the currently filtered
  rows, not the app's full per-column, per-slot aggregate-function picker.

## Rendering strategy

Two distinct update paths, and mixing them up is the one thing to avoid when
extending this file:

1. **`renderShell()`** — replaces the entire `#tr-demo-root` innerHTML. Used for
   every *discrete* action: sort, filter, group, heatmap, wrap, column
   visibility, opening/closing a popover, opening/closing the search bar. None of
   these have live text-entry focus to lose, so a full rebuild is simplest and
   there's no reason to hand-diff the DOM for an ~18-row fixture.
2. **`refreshRows()`** — replaces only `<tbody>`'s innerHTML. Used for **every
   search keystroke** and Enter/Shift+Enter match-stepping. The search `<input>`
   lives outside `<tbody>`, so this path never touches it — critical, because a
   full shell rebuild on every keystroke would destroy and recreate the input
   element, dropping focus and cursor position after every character typed.

Delegated event listeners (`root.addEventListener("click"/"change", ...)`) are
attached **once**, outside both render functions, to the `#tr-demo-root` node
itself — that node is never destroyed (only its children are, via `innerHTML =`),
so delegation survives every re-render without needing to re-bind anything. The
search `<input>`'s own `input`/`keydown` listeners are the one exception — that
element *is* recreated on every `renderShell()`, so they're re-attached inside
`renderShell()` itself whenever the search bar is open.

## Ctrl/Cmd+F scope

The keyboard shortcut only activates `if (root.contains(document.activeElement))`
— never globally. An earlier draft also allowed it whenever the demo section was
merely visible-ish in the viewport, which would have hijacked the browser's native
find-in-page on unrelated parts of the site. `#tr-demo-root` carries `tabindex="0"`
and a click handler parks focus on it when the click target isn't already
focusable (a grid cell, a group-header row), so the shortcut reliably works after
any interaction with the demo, without ever intercepting it elsewhere.

## Dataset

18 rows, 4 regions (North/South/East/West), 3 statuses (Shipped=green,
Pending=orange, Cancelled=red) — matches
`visual-system.md`'s semantic-color table exactly (status dot + colored text). The
`id` column renders dimmed per the same doc's "numeric id/t-style columns render
dimmed" rule. Enough rows to make sorting/grouping/filtering feel real, few enough
to keep the page weight and cognitive load low.
