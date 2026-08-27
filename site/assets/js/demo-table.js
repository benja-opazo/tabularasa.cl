// Hardcoded, client-side-only replica of Tabula Rasa's grid chrome - no
// engine behind it. See docs/decisions/demo-table.md for what's faithfully
// replicated vs. simplified, and the renderShell()/refreshRows() split below.
(function () {
  "use strict";

  var root = document.getElementById("tr-demo-root");
  if (!root) return;

  // Lucide codepoints - copied 1:1 from tabula-rasa/src/icons.rs. Never
  // invent a codepoint here; if a control needs a glyph that file doesn't
  // have, it gets a "coming soon" treatment instead (see COMING_SOON below).
  var ICON = {
    COLUMNS: "",
    WIDTH: "",
    HEIGHT: "",
    NUMBER_FORMAT: "",
    HEATMAP: "",
    WRAP: "",
    FREEZE_COLS: "",
    FREEZE_ROWS: "",
    FORMAT_PANEL: "",
    FIND: "",
    GOTO: "",
    ORDER_BY: "",
    GROUP_BY: "",
    FILTER: "",
    CHEVRON_DOWN: "",
    CHEVRON_UP: "",
    CHEVRON_RIGHT: "",
    CLOSE: "",
  };

  var REGIONS = ["North", "South", "East", "West"];
  var STATUSES = ["Shipped", "Pending", "Cancelled"];

  var DATA = [
    {
      id: 1,
      customer: "Acme Corp",
      region: "North",
      status: "Shipped",
      amount: 1284.5,
      date: "2026-01-04",
    },
    {
      id: 2,
      customer: "Nimbus Retail",
      region: "South",
      status: "Pending",
      amount: 342.1,
      date: "2026-01-05",
    },
    {
      id: 3,
      customer: "Blue Harbor Ltd",
      region: "East",
      status: "Cancelled",
      amount: 89.99,
      date: "2026-01-06",
    },
    {
      id: 4,
      customer: "Solstice Goods",
      region: "West",
      status: "Shipped",
      amount: 5120.0,
      date: "2026-01-07",
    },
    {
      id: 5,
      customer: "Kepler Supply Co",
      region: "North",
      status: "Shipped",
      amount: 764.25,
      date: "2026-01-08",
    },
    {
      id: 6,
      customer: "Rivet & Co",
      region: "South",
      status: "Cancelled",
      amount: 210.0,
      date: "2026-01-09",
    },
    {
      id: 7,
      customer: "Marrow Studio",
      region: "East",
      status: "Pending",
      amount: 1502.75,
      date: "2026-01-10",
    },
    {
      id: 8,
      customer: "Fernwood Traders",
      region: "West",
      status: "Shipped",
      amount: 998.4,
      date: "2026-01-11",
    },
    {
      id: 9,
      customer: "Acme Corp",
      region: "North",
      status: "Pending",
      amount: 67.5,
      date: "2026-01-12",
    },
    {
      id: 10,
      customer: "Vantage Point Inc",
      region: "South",
      status: "Shipped",
      amount: 3420.6,
      date: "2026-01-13",
    },
    {
      id: 11,
      customer: "Blue Harbor Ltd",
      region: "East",
      status: "Shipped",
      amount: 458.0,
      date: "2026-01-14",
    },
    {
      id: 12,
      customer: "Greyline Freight",
      region: "West",
      status: "Cancelled",
      amount: 129.99,
      date: "2026-01-15",
    },
    {
      id: 13,
      customer: "Kepler Supply Co",
      region: "North",
      status: "Cancelled",
      amount: 2044.1,
      date: "2026-01-16",
    },
    {
      id: 14,
      customer: "Nimbus Retail",
      region: "South",
      status: "Shipped",
      amount: 615.3,
      date: "2026-01-17",
    },
    {
      id: 15,
      customer: "Solstice Goods",
      region: "West",
      status: "Pending",
      amount: 4210.0,
      date: "2026-01-18",
    },
    {
      id: 16,
      customer: "Marrow Studio",
      region: "East",
      status: "Shipped",
      amount: 87.25,
      date: "2026-01-19",
    },
    {
      id: 17,
      customer: "Vantage Point Inc",
      region: "South",
      status: "Pending",
      amount: 1875.0,
      date: "2026-01-20",
    },
    {
      id: 18,
      customer: "Fernwood Traders",
      region: "West",
      status: "Shipped",
      amount: 322.4,
      date: "2026-01-21",
    },
  ];

  var COLUMNS = [
    { key: "id", label: "id", align: "right", dim: true, numeric: true },
    { key: "customer", label: "customer" },
    { key: "region", label: "region" },
    { key: "status", label: "status" },
    {
      key: "amount",
      label: "amount",
      align: "right",
      heat: true,
      fmt: money,
      numeric: true,
    },
    { key: "date", label: "date" },
  ];

  // Every entry gets the same "Not available in the demo" treatment - no
  // unbuilt-vs-gated distinction, see docs/decisions/demo-table.md.
  var COMING_SOON = {
    numfmt: { icon: ICON.NUMBER_FORMAT, label: "Number format" },
    freezecols: { icon: ICON.FREEZE_COLS, label: "Freeze columns" },
    freezerows: { icon: ICON.FREEZE_ROWS, label: "Freeze rows" },
    formatpanel: { icon: ICON.FORMAT_PANEL, label: "Format panel" },
    goto: { icon: ICON.GOTO, label: "Go to row" },
    width: { icon: ICON.WIDTH, label: "Column width" },
    height: { icon: ICON.HEIGHT, label: "Row height" },
  };

  // Mirrors the hero CTA's already-detected-platform link (downloads.js) so
  // "Get the app" from any gated popover downloads immediately instead of
  // just scrolling to #download - falls back to the hero's own fallback
  // (#download, no target) if platform detection never resolved.
  function downloadCtaHtml() {
    var hero = document.getElementById("hero-download-btn");
    var href = hero ? hero.getAttribute("href") : "#download";
    var target = hero && hero.getAttribute("target");
    var attrs = target ? ' target="_blank" rel="noopener"' : "";
    return (
      '<a class="btn btn-primary btn-sm" href="' +
      esc(href) +
      '"' +
      attrs +
      ' style="margin:0 8px 6px;">Get the app</a>'
    );
  }

  var state = {
    // Stackable multi-key sort, sorts[0] primary - mirrors the app's
    // Vec<SortKey> (src/view.rs). No per-key enabled flag (simplification -
    // remove via the pill instead).
    //
    // Initial state is deliberately "lived-in" rather than blank (grouped by
    // region, sorted by amount, a real selection already made) so a
    // first-time visitor sees the payoff immediately instead of an empty
    // grid - see docs/decisions/demo-table.md. Single-level grouping only,
    // to keep first paint legible (both dimensions nested would fragment 18
    // rows into ~12 sparse buckets).
    sorts: [{ col: "amount", dir: "desc" }],
    // Exactly one filter rule ever exists here (not a real per-column
    // filter stack like the app's) - "Add" replaces it, there's no way to
    // add a second one. `filterDraft` holds the builder form's current
    // values independent of whether they've been applied yet.
    filterRule: null,
    filterDraft: { col: "status", op: "is", value: "Shipped" },
    // Which tab of the filter popover is showing - "builder" (real) or "sql"
    // (always the gated "not available" stub). Kept separate from the
    // generic comingsoon/comingSoonKey popover machinery so the tab strip
    // itself stays visible while the SQL stub is showing (see popoverHtml()).
    filterTab: "builder",
    // Nested grouping levels, outermost first - column keys only (region
    // and/or status; the fixture's only two useful group dimensions).
    // Mirrors the app's Vec<GroupKey> (src/view.rs), same simplification.
    groupBy: ["region"],
    collapsed: new Set(),
    heatmap: false,
    wrap: false,
    hiddenCols: new Set(),
    // Left-to-right column order - draggable via each header's drag handle
    // (see the mousedown/mouseover/mouseup trio near the other drag
    // handling). Defaults to COLUMNS' natural order.
    columnOrder: COLUMNS.map(function (c) {
      return c.key;
    }),
    openPopover: null,
    comingSoonKey: null,
    searchOpen: false,
    searchQuery: "",
    matchIndex: 0,
    selectedRow: null,
    // Rectangular range in rendered-row/visible-column index space - see
    // rangeContains() and buildRowsHtml()'s data-row-idx/data-col-idx.
    // {r1,c1,r2,c2} inclusive, r1<=r2 and c1<=c2. Mirrors the app's
    // Selection model (src/compute.rs) rather than the old single-cell key.
    // Pre-selects rows 2-7 (1-based) of the amount column - given the
    // default sort (amount desc) + group (region), that range crosses the
    // West/South group boundary, so a first-time visitor sees a selection
    // spanning two groups on first paint.
    selectedRange: { r1: 1, c1: 4, r2: 6, c2: 4 },
    // Last click/drag-start cell - shift+click extends from here, matching
    // the app's anchor/free-corner model (docs/decisions/demo-table.md).
    rangeAnchor: { r: 1, c: 4 },
  };

  function rangeContains(range, r, c) {
    return (
      !!range &&
      r >= range.r1 &&
      r <= range.r2 &&
      c >= range.c1 &&
      c <= range.c2
    );
  }

  function cellIdx(el) {
    return {
      r: Number(el.getAttribute("data-row-idx")),
      c: Number(el.getAttribute("data-col-idx")),
    };
  }

  function normalizeRange(a, b) {
    return {
      r1: Math.min(a.r, b.r),
      c1: Math.min(a.c, b.c),
      r2: Math.max(a.r, b.r),
      c2: Math.max(a.c, b.c),
    };
  }

  // Live drag feedback without a full refreshRows() per pixel of movement -
  // paints straight onto the existing DOM, superseded by the authoritative
  // refreshRows()/rangeContains() render once the drag/click commits.
  function paintRange(range) {
    root.querySelectorAll(".tr-grid tbody td[data-cell]").forEach(function (td) {
      var r = Number(td.getAttribute("data-row-idx"));
      var c = Number(td.getAttribute("data-col-idx"));
      td.classList.toggle("is-cell-selected", rangeContains(range, r, c));
    });
  }

  function commitRange(range) {
    state.selectedRange = range;
    state.selectedRow = null;
    refreshRows();
    refreshAggregates();
  }

  // Transient drag-in-progress bookkeeping - not part of `state` since it's
  // meaningless outside a live mouse gesture, unlike everything the render
  // functions read.
  var dragState = null;
  var suppressCellClick = false;
  var colDragState = null;

  function money(v) {
    return (
      "$" +
      v.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function visibleColumns() {
    return state.columnOrder
      .map(function (key) {
        return COLUMNS.find(function (c) {
          return c.key === key;
        });
      })
      .filter(function (c) {
        return !state.hiddenCols.has(c.key);
      });
  }

  function filteredRows() {
    var rule = state.filterRule;
    if (!rule) return DATA.slice();
    return DATA.filter(function (r) {
      var raw = r[rule.col];
      var match =
        typeof raw === "number" && !isNaN(Number(rule.value))
          ? raw === Number(rule.value)
          : String(raw).toLowerCase() === String(rule.value).toLowerCase();
      return rule.op === "is" ? match : !match;
    });
  }

  // Stable multi-key sort - sorts[0] is the primary key, later entries are
  // tiebreaks, applied in order (a plain Array.sort comparator naturally
  // supports this: fall through to the next key only on a tie).
  function sortRows(rows) {
    if (!state.sorts.length) return rows;
    return rows.slice().sort(function (a, b) {
      for (var i = 0; i < state.sorts.length; i++) {
        var s = state.sorts[i];
        var dir = s.dir === "asc" ? 1 : -1;
        var av = a[s.col],
          bv = b[s.col];
        var cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        if (cmp) return cmp * dir;
      }
      return 0;
    });
  }

  // Pipeline is filter -> sort -> group (matches the app - see
  // docs/decisions/demo-table.md): the full set is sorted FIRST, then
  // stably partitioned into nested bands, so bucket order is whatever order
  // buckets first appear in the sorted sequence - not a fixed enum order.
  // Returns a flat list of leaf bands: { path: [{col,key}, ...], rows }.
  // Capped at the fixture's two groupable dimensions (region/status), so at
  // most 2 nesting levels - see Scope boundaries in the redesign plan.
  function groupRows(rows) {
    var sorted = sortRows(rows);
    if (!state.groupBy.length) return [{ path: [], rows: sorted }];

    function partition(list, col) {
      var buckets = [];
      var byKey = {};
      list.forEach(function (r) {
        var k = r[col];
        if (!byKey[k]) {
          byKey[k] = { key: k, rows: [] };
          buckets.push(byKey[k]);
        }
        byKey[k].rows.push(r);
      });
      return buckets;
    }

    var level0 = partition(sorted, state.groupBy[0]);
    var out = [];
    level0.forEach(function (b0) {
      if (state.groupBy.length === 1) {
        out.push({
          path: [{ col: state.groupBy[0], key: b0.key }],
          rows: b0.rows,
        });
        return;
      }
      partition(b0.rows, state.groupBy[1]).forEach(function (b1) {
        out.push({
          path: [
            { col: state.groupBy[0], key: b0.key },
            { col: state.groupBy[1], key: b1.key },
          ],
          rows: b1.rows,
        });
      });
    });
    return out;
  }

  function heatRange(rows) {
    var vals = rows.map(function (r) {
      return r.amount;
    });
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  function collectMatches(groups, cols) {
    var q = state.searchQuery.trim().toLowerCase();
    var matches = [];
    if (!q) return matches;
    groups.forEach(function (g) {
      g.rows.forEach(function (row) {
        cols.forEach(function (col) {
          var text = String(
            col.fmt ? col.fmt(row[col.key]) : row[col.key],
          ).toLowerCase();
          var from = 0;
          var idx;
          while ((idx = text.indexOf(q, from)) !== -1) {
            matches.push({
              rowId: row.id,
              colKey: col.key,
              start: idx,
              end: idx + q.length,
            });
            from = idx + q.length;
          }
        });
      });
    });
    return matches;
  }

  function markCell(raw, rowId, colKey, matches) {
    var q = state.searchQuery.trim();
    if (!q) return esc(raw);
    var own = matches
      .map(function (m, i) {
        return Object.assign({ i: i }, m);
      })
      .filter(function (m) {
        return m.rowId === rowId && m.colKey === colKey;
      });
    if (!own.length) return esc(raw);
    var s = String(raw);
    var out = "";
    var cursor = 0;
    own.forEach(function (m) {
      out += esc(s.slice(cursor, m.start));
      var cls = m.i === state.matchIndex ? "tr-match is-current" : "tr-match";
      var id = m.i === state.matchIndex ? ' id="tr-current-match"' : "";
      out +=
        '<mark class="' +
        cls +
        '"' +
        id +
        ">" +
        esc(s.slice(m.start, m.end)) +
        "</mark>";
      cursor = m.end;
    });
    out += esc(s.slice(cursor));
    return out;
  }

  // Plain text - conditional formatting (color-by-value) isn't a real,
  // built feature yet, so this cell shouldn't imply otherwise.
  function statusCell(value) {
    return esc(value);
  }

  function buildRowsHtml() {
    var cols = visibleColumns();
    var rows = filteredRows();
    var groups = groupRows(rows);
    var matches = collectMatches(groups, cols);
    var heat = state.heatmap ? heatRange(rows) : null;
    var rowNum = 0;
    var html = "";

    // Row count (and the rows themselves, for the per-group aggregate) for
    // each nesting prefix ("region:North", "region:North|status:Shipped",
    // ...), so a header band covers every leaf group sharing that prefix,
    // not just the leaf it happens to render on.
    var bandCount = {};
    var bandRows = {};
    groups.forEach(function (g) {
      var pk = [];
      g.path.forEach(function (seg) {
        pk.push(seg.col + ":" + seg.key);
        var k = pk.join("|");
        bandCount[k] = (bandCount[k] || 0) + g.rows.length;
        bandRows[k] = (bandRows[k] || []).concat(g.rows);
      });
    });
    // Aggregating the column(s) currently being grouped on is meaningless
    // (constant within the band), so leave those out of the group-header stat.
    var groupAggCols = cols.filter(function (c) {
      return state.groupBy.indexOf(c.key) === -1;
    });

    var prevPath = [];
    groups.forEach(function (g) {
      var changed = false;
      var collapsedAncestor = false;
      var pk = [];
      g.path.forEach(function (seg, depth) {
        pk.push(seg.col + ":" + seg.key);
        var groupKey = pk.join("|");
        if (!changed && (!prevPath[depth] || prevPath[depth].key !== seg.key)) {
          changed = true;
        }
        if (changed && !collapsedAncestor) {
          var chev = state.collapsed.has(groupKey)
            ? ICON.CHEVRON_RIGHT
            : ICON.CHEVRON_DOWN;
          var count = bandCount[groupKey];
          html +=
            '<tr class="tr-group-header" data-group-toggle="' +
            esc(groupKey) +
            '">' +
            '<td colspan="' +
            (cols.length + 1) +
            '">' +
            '<span class="icon chev" style="margin-left:' +
            depth * 16 +
            'px">' +
            chev +
            "</span>" +
            esc(seg.col) +
            ": " +
            esc(seg.key) +
            '<span class="count">' +
            count +
            " row" +
            (count === 1 ? "" : "s") +
            "</span>" +
            '<span class="tr-group-agg">' +
            groupAggregateHtml(bandRows[groupKey], groupAggCols) +
            "</span>" +
            "</td></tr>";
        }
        if (state.collapsed.has(groupKey)) collapsedAncestor = true;
      });
      prevPath = g.path;
      if (collapsedAncestor) return;

      g.rows.forEach(function (row) {
        var rowIdx = rowNum; // 0-based position in the rendered row list - the
        // coordinate space state.selectedRange lives in (see rangeContains()).
        rowNum++;
        var zebra = rowNum % 2 === 0 ? "tr-row-even" : "tr-row-odd";
        var selectedRowCls =
          state.selectedRow === row.id ? "is-row-selected" : "";
        html +=
          '<tr class="' +
          zebra +
          " " +
          selectedRowCls +
          '" data-row-id="' +
          row.id +
          '" data-row-idx="' +
          rowIdx +
          '">';
        html +=
          '<td class="tr-col-gutter" data-gutter-row="' +
          row.id +
          '">' +
          rowNum +
          "</td>";
        cols.forEach(function (col, colIdx) {
          var raw = row[col.key];
          var display = col.fmt ? col.fmt(raw) : raw;
          var marked = markCell(display, row.id, col.key, matches);
          var cellHtml = col.key === "status" ? statusCell(raw) : marked;
          var classes = [];
          if (col.dim) classes.push("tr-col-id");
          if (rangeContains(state.selectedRange, rowIdx, colIdx)) {
            classes.push("is-cell-selected");
          }
          var styleParts = [];
          if (col.align === "right") styleParts.push("text-align:right");
          if (col.heat && heat) {
            classes.push("tr-cell-heat");
            var t =
              heat.max === heat.min
                ? 0.5
                : (raw - heat.min) / (heat.max - heat.min);
            styleParts.push("--heat:" + t.toFixed(3));
          }
          var styleAttr = styleParts.length
            ? ' style="' + styleParts.join(";") + '"'
            : "";
          html +=
            '<td class="' +
            classes.join(" ").trim() +
            '"' +
            styleAttr +
            ' data-cell="' +
            row.id +
            ":" +
            col.key +
            '" data-row-idx="' +
            rowIdx +
            '" data-col-idx="' +
            colIdx +
            '">' +
            cellHtml +
            "</td>";
        });
        html += "</tr>";
      });
    });

    if (rowNum === 0) {
      html =
        '<tr class="tr-empty-row"><td colspan="' +
        (cols.length + 1) +
        '">No rows match the current filter.</td></tr>';
    }

    return { html: html, matchCount: matches.length };
  }

  // Precedence reorder is a swap button, not the app's real drag-handle -
  // with at most 2 active levels (see Scope boundaries), a swap gets the
  // same practical outcome without a drag-and-drop implementation.
  function pillsHtml() {
    var pills = "";
    state.sorts.forEach(function (s, i) {
      var rank = state.sorts.length > 1 ? i + 1 + ". " : "";
      pills +=
        '<span class="tr-pill is-sort">' +
        '<span class="tr-pill-icon icon">' +
        ICON.ORDER_BY +
        "</span>" +
        '<span class="tr-pill-label">' +
        rank +
        esc(s.col) +
        " " +
        (s.dir === "asc" ? "↑" : "↓") +
        "</span>" +
        '<span class="tr-pill-close" data-remove-rule="sort:' +
        i +
        '" title="Remove sort">' +
        ICON.CLOSE +
        "</span>" +
        "</span>";
    });
    if (state.sorts.length === 2) {
      pills +=
        '<button type="button" class="tr-pill-swap" data-swap-rule="sort" title="Swap precedence">⇅</button>';
    }
    if (state.filterRule) {
      pills +=
        '<span class="tr-pill is-filter">' +
        '<span class="tr-pill-icon icon">' +
        ICON.FILTER +
        "</span>" +
        '<span class="tr-pill-label">' +
        esc(state.filterRule.col) +
        " " +
        esc(state.filterRule.op) +
        " " +
        esc(state.filterRule.value) +
        "</span>" +
        '<span class="tr-pill-close" data-remove-rule="filter" title="Remove filter">' +
        ICON.CLOSE +
        "</span>" +
        "</span>";
    }
    state.groupBy.forEach(function (col, i) {
      var rank = state.groupBy.length > 1 ? i + 1 + ". " : "";
      pills +=
        '<span class="tr-pill is-group">' +
        '<span class="tr-pill-icon icon">' +
        ICON.GROUP_BY +
        "</span>" +
        '<span class="tr-pill-label">' +
        rank +
        "group: " +
        esc(col) +
        "</span>" +
        '<span class="tr-pill-close" data-remove-rule="group:' +
        i +
        '" title="Remove grouping">' +
        ICON.CLOSE +
        "</span>" +
        "</span>";
    });
    if (state.groupBy.length === 2) {
      pills +=
        '<button type="button" class="tr-pill-swap" data-swap-rule="group" title="Swap precedence">⇅</button>';
    }
    return (
      pills ||
      '<span class="tr-rules-empty">No sort, filter, or group rules - click a header, or try Filter / Group by above</span>'
    );
  }

  // Same flattened order buildRowsHtml() renders in (filter -> sort -> group,
  // collapsed groups excluded) - state.selectedRange's r1/r2 index into this.
  function visibleFlatRows() {
    var groups = groupRows(filteredRows());
    var out = [];
    groups.forEach(function (g) {
      var pk = [];
      var collapsed = g.path.some(function (seg) {
        pk.push(seg.col + ":" + seg.key);
        return state.collapsed.has(pk.join("|"));
      });
      if (collapsed) return;
      out = out.concat(g.rows);
    });
    return out;
  }

  // Same Sum/Uniq stat as aggregateHtml(), scoped to one group band's own
  // rows instead of the current selection - the "not finished yet" polish
  // pass on this in the real app (per-group-header aggregates) is out of
  // scope here; this is the basic version, matching the bottom bar's.
  function groupAggregateHtml(rows, cols) {
    return cols
      .map(function (col) {
        var vals = rows.map(function (r) {
          return r[col.key];
        });
        var stat;
        if (col.numeric) {
          var sum = vals.reduce(function (a, v) {
            return a + v;
          }, 0);
          stat = "Σ " + (col.fmt ? col.fmt(sum) : sum);
        } else {
          stat = new Set(vals).size + " uniq";
        }
        return (
          '<span class="agg-label">' +
          esc(col.label) +
          '</span><span class="agg-value">' +
          stat +
          "</span>"
        );
      })
      .join("");
  }

  // Basic per-column aggregate over the current selection - Sum for numeric
  // columns, unique-value count for text columns - not the app's real
  // per-slot function-catalog picker (docs/decisions/demo-table.md). A
  // range selection also narrows which *columns* get a stat (matching what
  // was actually selected); a row selection or no selection covers every
  // visible column, since neither constrains columns the way a range does.
  function aggregateHtml() {
    var range = state.selectedRange;
    var rows;
    if (range) {
      rows = visibleFlatRows().slice(range.r1, range.r2 + 1);
    } else if (state.selectedRow != null) {
      rows = visibleFlatRows().filter(function (r) {
        return r.id === state.selectedRow;
      });
    } else {
      rows = filteredRows();
    }
    var cols = visibleColumns();
    if (range) {
      cols = cols.filter(function (c, i) {
        return i >= range.c1 && i <= range.c2;
      });
    }
    var parts = [
      '<span class="agg-label">Rows</span><span class="agg-value">' +
        rows.length +
        "</span>",
    ];
    cols.forEach(function (col) {
      var vals = rows.map(function (r) {
        return r[col.key];
      });
      var stat;
      if (col.numeric) {
        var sum = vals.reduce(function (a, v) {
          return a + v;
        }, 0);
        stat = "Σ " + (col.fmt ? col.fmt(sum) : sum);
      } else {
        stat = new Set(vals).size + " uniq";
      }
      parts.push(
        '<span class="agg-label">' +
          esc(col.label) +
          '</span><span class="agg-value">' +
          stat +
          "</span>",
      );
    });
    return parts.join("");
  }

  function toolbarBtn(opts) {
    // opts: { icon, label, active, dataset: {action:...}, disabled, chevron }
    var attrs = Object.keys(opts.dataset || {})
      .map(function (k) {
        return " data-" + k + '="' + esc(opts.dataset[k]) + '"';
      })
      .join("");
    return (
      '<button type="button" class="tr-btn' +
      (opts.active ? " is-active" : "") +
      '"' +
      attrs +
      (opts.disabled ? " disabled" : "") +
      (opts.title ? ' title="' + esc(opts.title) + '"' : "") +
      ">" +
      '<span class="icon">' +
      opts.icon +
      "</span>" +
      (opts.label ? "<span>" + esc(opts.label) + "</span>" : "") +
      (opts.chevron
        ? '<span class="chev icon">' + ICON.CHEVRON_DOWN + "</span>"
        : "") +
      "</button>"
    );
  }

  function popoverHtml() {
    if (state.openPopover === "columns") {
      var rows = COLUMNS.map(function (c) {
        var checked = !state.hiddenCols.has(c.key) ? " checked" : "";
        return (
          '<label class="tr-popover-row" style="cursor:pointer">' +
          '<input type="checkbox" data-col-toggle="' +
          c.key +
          '"' +
          checked +
          " />" +
          "<span>" +
          esc(c.label) +
          "</span>" +
          "</label>"
        );
      }).join("");
      return popoverWrap("Show / hide columns", rows);
    }
    if (state.openPopover === "filter") {
      var d = state.filterDraft;
      var colOpts = COLUMNS.map(function (c) {
        return (
          '<option value="' +
          c.key +
          '"' +
          (d.col === c.key ? " selected" : "") +
          ">" +
          esc(c.label) +
          "</option>"
        );
      }).join("");
      var opOpts = ["is", "is not"]
        .map(function (o) {
          return (
            '<option value="' +
            o +
            '"' +
            (d.op === o ? " selected" : "") +
            ">" +
            o +
            "</option>"
          );
        })
        .join("");
      // Single hardcoded-shape filter rule, not the app's real per-column
      // filter stack - "Add" replaces the one rule, there's no way to add a
      // second (see docs/decisions/demo-table.md). The SQL query tab is
      // present for fidelity but its content is just another gated stub -
      // the tab strip itself stays visible/switchable either way, unlike the
      // generic comingsoon popover (which would otherwise replace the whole
      // popover and hide the way back to Builder).
      var body =
        state.filterTab === "sql"
          ? '<div class="tr-filter-gated">' +
            "Not available in the demo." +
            "</div>" +
            downloadCtaHtml()
          : '<div class="tr-filter-row">' +
            '<select class="tr-filter-select" data-filter-col>' +
            colOpts +
            "</select>" +
            '<select class="tr-filter-select" data-filter-op>' +
            opOpts +
            "</select>" +
            '<input class="tr-filter-value" type="text" data-filter-value value="' +
            esc(d.value) +
            '" placeholder="value" />' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="apply-filter">Add</button>' +
            "</div>";
      return (
        '<div class="tr-popover is-open tr-filter-popover">' +
        '<div class="tr-filter-tabs">' +
        '<span class="tr-filter-tab' +
        (state.filterTab === "builder" ? " is-active" : "") +
        '" data-filter-tab="builder">Builder</span>' +
        '<span class="tr-filter-tab' +
        (state.filterTab === "sql" ? " is-active" : "") +
        '" data-filter-tab="sql">SQL query</span>' +
        "</div>" +
        body +
        "</div>"
      );
    }
    if (state.openPopover === "group") {
      var gOptions = [
        { v: "region", label: "Region" },
        { v: "status", label: "Status" },
      ];
      var grows = gOptions
        .map(function (o) {
          var idx = state.groupBy.indexOf(o.v);
          var sel = idx !== -1 ? " is-selected" : "";
          var rank = state.groupBy.length > 1 && idx !== -1 ? idx + 1 + ". " : "";
          return (
            '<button type="button" class="tr-popover-row' +
            sel +
            '" data-group-set="' +
            o.v +
            '">' +
            rank +
            esc(o.label) +
            "</button>"
          );
        })
        .join("");
      return popoverWrap("Group by - click to add/remove a level", grows);
    }
    if (state.openPopover === "order") {
      var sOptions = COLUMNS.filter(function (c) {
        return c.key !== "id";
      });
      var srows = sOptions
        .map(function (c) {
          var idx = state.sorts.findIndex(function (s) {
            return s.col === c.key;
          });
          var sel = idx !== -1 ? " is-selected" : "";
          var suffix =
            idx !== -1
              ? " " +
                (state.sorts.length > 1 ? idx + 1 + ". " : "") +
                (state.sorts[idx].dir === "asc" ? "↑" : "↓")
              : "";
          return (
            '<button type="button" class="tr-popover-row' +
            sel +
            '" data-order-set="' +
            c.key +
            '">' +
            esc(c.label) +
            suffix +
            "</button>"
          );
        })
        .join("");
      return popoverWrap("Order by - click to add/toggle/remove", srows);
    }
    if (state.openPopover === "comingsoon" && state.comingSoonKey) {
      var cs = COMING_SOON[state.comingSoonKey];
      return popoverWrap(
        cs.label,
        '<div style="padding:6px 8px 10px;color:var(--dim);font-size:12.5px;font-family:var(--font-chrome);max-width:220px;">' +
          "Not available in the demo." +
          "</div>" +
          downloadCtaHtml(),
      );
    }
    return "";
  }

  function popoverWrap(title, body) {
    return (
      '<div class="tr-popover is-open">' +
      '<div class="tr-popover-title">' +
      esc(title) +
      "</div>" +
      body +
      "</div>"
    );
  }

  function shellHtml() {
    var rowsBuilt = buildRowsHtml();
    var cols = visibleColumns();

    // Three independent hit zones, matching the real app: drag handle
    // (reorder), label (click selects the whole column), chevron (click
    // stacks/toggles that column's sort - always visible, not just on the
    // active sort column, dimmed when inactive).
    var headCells = cols
      .map(function (c) {
        var sortIdx = state.sorts.findIndex(function (s) {
          return s.col === c.key;
        });
        var active = sortIdx !== -1;
        var rank = active && state.sorts.length > 1 ? sortIdx + 1 : "";
        var chevIcon = active
          ? state.sorts[sortIdx].dir === "asc"
            ? ICON.CHEVRON_UP
            : ICON.CHEVRON_DOWN
          : ICON.CHEVRON_DOWN;
        return (
          '<th data-col-key="' +
          c.key +
          '">' +
          '<div class="tr-col-head">' +
          '<span class="tr-col-drag icon" data-col-drag="' +
          c.key +
          '" title="Drag to reorder">⠿</span>' +
          '<span class="tr-col-label" data-col-select="' +
          c.key +
          '">' +
          esc(c.label) +
          "</span>" +
          '<span class="tr-col-sort icon' +
          (active ? " is-active" : "") +
          '" data-col-sort="' +
          c.key +
          '" title="Sort (stacks with existing sorts)">' +
          rank +
          chevIcon +
          "</span>" +
          "</div>" +
          "</th>"
        );
      })
      .join("");

    return (
      '<div class="tr-titlebar">' +
      '<div class="tr-dots"><span></span><span></span><span></span></div>' +
      '<div class="tr-titlebar-title">orders_q1.csv &mdash; Tabula Rasa</div>' +
      "</div>" +
      '<div class="tr-menubar"><span>File</span><span>Edit</span><span>View</span><span>Settings</span><span>Help</span></div>' +
      '<div class="tr-tabstrip">' +
      '<div class="tr-tab is-active">orders_q1.csv<span class="tr-tab-dirty"></span></div>' +
      '<div class="tr-tab">customers.csv</div>' +
      '<div class="tr-tab-add">+</div>' +
      "</div>" +
      '<div class="tr-toolbar">' +
      '<span class="tr-group-label">Format</span>' +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.COLUMNS,
        label: "Columns",
        chevron: true,
        active: state.openPopover === "columns",
        dataset: { action: "toggle-columns" },
      }) +
      (state.openPopover === "columns" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.WIDTH,
        label: "Width",
        chevron: true,
        dataset: { action: "coming-soon", key: "width" },
        title: "Column width",
      }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "width"
        ? popoverHtml()
        : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.HEIGHT,
        label: "Height",
        chevron: true,
        dataset: { action: "coming-soon", key: "height" },
        title: "Row height",
      }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "height"
        ? popoverHtml()
        : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.NUMBER_FORMAT,
        dataset: { action: "coming-soon", key: "numfmt" },
        title: "Number format",
      }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "numfmt"
        ? popoverHtml()
        : "") +
      "</div>" +
      toolbarBtn({
        icon: ICON.HEATMAP,
        label: "Heatmap",
        chevron: true,
        active: state.heatmap,
        dataset: { action: "toggle-heatmap" },
        title: "Heatmap the amount column",
      }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.FREEZE_COLS,
        dataset: { action: "coming-soon", key: "freezecols" },
        title: "Freeze columns",
      }) +
      (state.openPopover === "comingsoon" &&
      state.comingSoonKey === "freezecols"
        ? popoverHtml()
        : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.FREEZE_ROWS,
        dataset: { action: "coming-soon", key: "freezerows" },
        title: "Freeze rows",
      }) +
      (state.openPopover === "comingsoon" &&
      state.comingSoonKey === "freezerows"
        ? popoverHtml()
        : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.FORMAT_PANEL,
        dataset: { action: "coming-soon", key: "formatpanel" },
        title: "Format panel",
      }) +
      (state.openPopover === "comingsoon" &&
      state.comingSoonKey === "formatpanel"
        ? popoverHtml()
        : "") +
      "</div>" +
      toolbarBtn({
        icon: ICON.WRAP,
        active: state.wrap,
        dataset: { action: "toggle-wrap" },
        title: "Wrap text",
      }) +
      '<div class="tr-divider tr-toolbar-right-start"></div>' +
      '<span class="tr-group-label">Data</span>' +
      toolbarBtn({
        icon: ICON.FIND,
        active: state.searchOpen,
        dataset: { action: "toggle-search" },
        title: "Find (Ctrl/Cmd+F)",
      }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.GOTO,
        dataset: { action: "coming-soon", key: "goto" },
        title: "Go to row",
      }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "goto"
        ? popoverHtml()
        : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.ORDER_BY,
        label: "Order by",
        chevron: true,
        active: state.openPopover === "order" || state.sorts.length > 0,
        dataset: { action: "toggle-order" },
      }) +
      (state.openPopover === "order" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({
        icon: ICON.GROUP_BY,
        label: "Group by",
        chevron: true,
        active: state.openPopover === "group" || state.groupBy.length > 0,
        dataset: { action: "toggle-group" },
      }) +
      (state.openPopover === "group" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor tr-filter-anchor">' +
      toolbarBtn({
        icon: ICON.FILTER,
        label: "Filter",
        active: state.openPopover === "filter" || !!state.filterRule,
        dataset: { action: "toggle-filter" },
      }) +
      (state.openPopover === "filter" ? popoverHtml() : "") +
      "</div>" +
      "</div>" +
      '<div class="tr-grid-scroll">' +
      '<table class="tr-grid' +
      (state.wrap ? " is-wrapped" : "") +
      '">' +
      "<thead><tr>" +
      '<th class="tr-col-gutter">#</th>' +
      headCells +
      "</tr></thead>" +
      "<tbody>" +
      rowsBuilt.html +
      "</tbody>" +
      "</table>" +
      "</div>" +
      '<div class="tr-searchbar' +
      (state.searchOpen ? " is-open" : "") +
      '">' +
      '<span class="icon" style="color:var(--faint);font-size:14px;">' +
      ICON.FIND +
      "</span>" +
      '<input id="tr-search-input" type="text" placeholder="Find in orders_q1.csv" value="' +
      esc(state.searchQuery) +
      '" />' +
      '<span class="tr-search-count" id="tr-search-count">' +
      (state.searchQuery
        ? rowsBuilt.matchCount
          ? state.matchIndex + 1 + " of " + rowsBuilt.matchCount
          : "No matches"
        : "") +
      "</span>" +
      '<button type="button" class="tr-search-btn" data-action="close-search" title="Close (Esc)">' +
      ICON.CLOSE +
      "</button>" +
      "</div>" +
      '<div class="tr-statusbar">' +
      '<div class="tr-status-zone tr-status-left">' +
      aggregateHtml() +
      "</div>" +
      '<div class="tr-status-zone tr-status-center">' +
      '<span class="tr-rules-label">Rules</span>' +
      pillsHtml() +
      "</div>" +
      '<div class="tr-status-zone tr-status-right">' +
      '<span class="tr-badge">UTF-8</span><span class="tr-badge">CSV</span>' +
      "</div>" +
      "</div>"
    );
  }

  function renderShell() {
    root.innerHTML = shellHtml();
    if (state.searchOpen) {
      var input = document.getElementById("tr-search-input");
      if (input) {
        input.addEventListener("input", onSearchInput);
        input.addEventListener("keydown", onSearchKeydown);
        // Only steal focus right after the bar opens, not on every rebuild
        // triggered by an unrelated toolbar action while it's already open.
        if (state._justOpenedSearch) {
          input.focus();
          state._justOpenedSearch = false;
        }
      }
    }
  }

  function refreshRows() {
    var tbody = root.querySelector(".tr-grid tbody");
    var countEl = document.getElementById("tr-search-count");
    if (!tbody) return;
    var built = buildRowsHtml();
    tbody.innerHTML = built.html;
    if (countEl) {
      countEl.textContent = state.searchQuery
        ? built.matchCount
          ? state.matchIndex + 1 + " of " + built.matchCount
          : "No matches"
        : "";
    }
    var current = document.getElementById("tr-current-match");
    if (current)
      current.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  // Targeted patch, not folded into refreshRows()/renderShell() - selection
  // changes are a refreshRows()-only action, but must still keep the
  // aggregate zone live (docs/decisions/demo-table.md's rendering-strategy
  // invariant: don't widen refreshRows()'s scope, it exists to protect the
  // search input's focus).
  function refreshAggregates() {
    var el = root.querySelector(".tr-status-left");
    if (el) el.innerHTML = aggregateHtml();
  }

  function onSearchInput(e) {
    state.searchQuery = e.target.value;
    state.matchIndex = 0;
    refreshRows();
  }

  function onSearchKeydown(e) {
    if (e.key === "Escape") {
      closeSearch();
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    var built = buildRowsHtml();
    if (!built.matchCount) return;
    var dir = e.shiftKey ? -1 : 1;
    state.matchIndex =
      (state.matchIndex + dir + built.matchCount) % built.matchCount;
    refreshRows();
  }

  function closeSearch() {
    state.searchOpen = false;
    state.searchQuery = "";
    state.matchIndex = 0;
    state.openPopover = null;
    renderShell();
  }

  function closePopover() {
    if (state.openPopover) {
      state.openPopover = null;
      state.comingSoonKey = null;
      renderShell();
    }
  }

  root.addEventListener("click", function (e) {
    var t = e.target;

    // Grid cells/rows aren't natively focusable, but the Ctrl/Cmd+F guard
    // below needs a reliable "focus is inside the demo" signal - parks focus
    // on the root itself unless the click already landed on something
    // focusable (an input/button/link keeps its own native focus).
    if (!t.closest("input, button, a") && document.activeElement !== root) {
      root.focus({ preventScroll: true });
    }

    // Chevron click always stacks/toggles - no "plain click replaces the
    // whole sort" shortcut anymore, since drag/select/sort are now separate
    // header hit-zones instead of one whole-header click target.
    var colSort = t.closest("[data-col-sort]");
    if (colSort) {
      var sKey = colSort.getAttribute("data-col-sort");
      var sIdx = state.sorts.findIndex(function (s) {
        return s.col === sKey;
      });
      if (sIdx !== -1) {
        state.sorts[sIdx].dir = state.sorts[sIdx].dir === "asc" ? "desc" : "asc";
      } else {
        state.sorts.push({ col: sKey, dir: "asc" });
      }
      state.openPopover = null;
      renderShell();
      return;
    }

    // Clicking anywhere else in the header (not the drag handle or the
    // chevron) selects the entire column - matches the app's Column
    // selection kind (r1=0, c2=∞, here clamped to the currently visible
    // row/column counts).
    var colSelect = t.closest("[data-col-select]");
    if (colSelect) {
      var selKey = colSelect.getAttribute("data-col-select");
      var colIdx = visibleColumns().findIndex(function (c) {
        return c.key === selKey;
      });
      var lastRow = visibleFlatRows().length - 1;
      if (lastRow >= 0) {
        state.rangeAnchor = { r: 0, c: colIdx };
        commitRange({ r1: 0, c1: colIdx, r2: lastRow, c2: colIdx });
      }
      return;
    }

    var groupToggle = t.closest("[data-group-toggle]");
    if (groupToggle) {
      var gk = groupToggle.getAttribute("data-group-toggle");
      if (state.collapsed.has(gk)) state.collapsed.delete(gk);
      else state.collapsed.add(gk);
      refreshRows();
      return;
    }

    var gutter = t.closest("[data-gutter-row]");
    if (gutter) {
      var rid = Number(gutter.getAttribute("data-gutter-row"));
      state.selectedRow = state.selectedRow === rid ? null : rid;
      state.selectedRange = null;
      refreshRows();
      refreshAggregates();
      return;
    }

    var cell = t.closest("[data-cell]");
    if (cell) {
      if (suppressCellClick) {
        suppressCellClick = false;
        return;
      }
      var idx = cellIdx(cell);
      if (e.shiftKey && state.rangeAnchor) {
        commitRange(normalizeRange(state.rangeAnchor, idx));
        return;
      }
      var r = state.selectedRange;
      var isSameSingleCell =
        r && r.r1 === idx.r && r.r2 === idx.r && r.c1 === idx.c && r.c2 === idx.c;
      state.rangeAnchor = idx;
      commitRange(
        isSameSingleCell ? null : { r1: idx.r, c1: idx.c, r2: idx.r, c2: idx.c },
      );
      return;
    }

    var filterTab = t.closest("[data-filter-tab]");
    if (filterTab) {
      state.filterTab = filterTab.getAttribute("data-filter-tab");
      renderShell();
      return;
    }

    var removeRule = t.closest("[data-remove-rule]");
    if (removeRule) {
      var rule = removeRule.getAttribute("data-remove-rule");
      var parts = rule.split(":");
      if (parts[0] === "sort") state.sorts.splice(Number(parts[1]), 1);
      if (parts[0] === "filter") state.filterRule = null;
      if (parts[0] === "group") {
        state.groupBy.splice(Number(parts[1]), 1);
        state.collapsed = new Set();
      }
      renderShell();
      return;
    }

    var swapRule = t.closest("[data-swap-rule]");
    if (swapRule) {
      var swapWhat = swapRule.getAttribute("data-swap-rule");
      var arr = swapWhat === "sort" ? state.sorts : state.groupBy;
      var tmp = arr[0];
      arr[0] = arr[1];
      arr[1] = tmp;
      if (swapWhat === "group") state.collapsed = new Set();
      renderShell();
      return;
    }

    var groupSet = t.closest("[data-group-set]");
    if (groupSet) {
      var v = groupSet.getAttribute("data-group-set");
      var gIdx = state.groupBy.indexOf(v);
      if (gIdx !== -1) state.groupBy.splice(gIdx, 1);
      else state.groupBy.push(v);
      state.collapsed = new Set();
      renderShell();
      return;
    }

    var orderSet = t.closest("[data-order-set]");
    if (orderSet) {
      var oCol = orderSet.getAttribute("data-order-set");
      var oIdx = state.sorts.findIndex(function (s) {
        return s.col === oCol;
      });
      if (oIdx === -1) {
        state.sorts.push({ col: oCol, dir: "asc" });
      } else if (state.sorts[oIdx].dir === "asc") {
        state.sorts[oIdx].dir = "desc";
      } else {
        state.sorts.splice(oIdx, 1);
      }
      renderShell();
      return;
    }

    var actionBtn = t.closest("[data-action]");
    if (actionBtn) {
      var action = actionBtn.getAttribute("data-action");
      if (action === "toggle-wrap") {
        state.wrap = !state.wrap;
        renderShell();
      } else if (action === "toggle-heatmap") {
        state.heatmap = !state.heatmap;
        renderShell();
      } else if (action === "toggle-columns") {
        state.openPopover = state.openPopover === "columns" ? null : "columns";
        renderShell();
      } else if (action === "toggle-filter") {
        state.openPopover = state.openPopover === "filter" ? null : "filter";
        renderShell();
      } else if (action === "toggle-group") {
        state.openPopover = state.openPopover === "group" ? null : "group";
        renderShell();
      } else if (action === "toggle-order") {
        state.openPopover = state.openPopover === "order" ? null : "order";
        renderShell();
      } else if (action === "toggle-search") {
        state.searchOpen = !state.searchOpen;
        state.openPopover = null;
        if (state.searchOpen) state._justOpenedSearch = true;
        else {
          state.searchQuery = "";
          state.matchIndex = 0;
        }
        renderShell();
      } else if (action === "close-search") {
        closeSearch();
      } else if (action === "coming-soon") {
        var key = actionBtn.getAttribute("data-key");
        var already =
          state.openPopover === "comingsoon" && state.comingSoonKey === key;
        state.openPopover = already ? null : "comingsoon";
        state.comingSoonKey = already ? null : key;
        renderShell();
      } else if (action === "apply-filter") {
        // Reads the builder's live DOM values rather than tracking them in
        // state on every keystroke - only "Add" commits anything, so there's
        // nothing to lose by not syncing state until this point.
        var col = root.querySelector("[data-filter-col]").value;
        var op = root.querySelector("[data-filter-op]").value;
        var value = root.querySelector("[data-filter-value]").value;
        state.filterDraft = { col: col, op: op, value: value };
        state.filterRule = { col: col, op: op, value: value };
        renderShell();
      }
      return;
    }

    if (!t.closest(".tr-popover") && !t.closest("[data-action]")) {
      closePopover();
    }
  });

  // Drag-to-select a cell range. `mousedown` starts a candidate drag but
  // doesn't commit it - a plain click (no movement) still falls through to
  // the click handler above, which owns the single-cell toggle/shift-extend
  // logic. Only an actual multi-cell drag commits here, on mouseup.
  root.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    var dragHandle = e.target.closest("[data-col-drag]");
    if (dragHandle) {
      colDragState = { fromKey: dragHandle.getAttribute("data-col-drag") };
      e.preventDefault();
      return;
    }
    if (e.shiftKey) return;
    var cell = e.target.closest("[data-cell]");
    if (!cell) return;
    var idx = cellIdx(cell);
    dragState = { anchor: idx, cur: idx };
    paintRange(normalizeRange(idx, idx));
    e.preventDefault(); // suppress native text-selection while dragging
  });

  // Delegated `mouseover` (not `mousemove`) - cell-granularity is all we
  // need, and it's cheaper than hit-testing pointer coordinates.
  root.addEventListener("mouseover", function (e) {
    if (colDragState) {
      var th = e.target.closest("th[data-col-key]");
      if (th) colDragState.overKey = th.getAttribute("data-col-key");
      return;
    }
    if (!dragState) return;
    var cell = e.target.closest("[data-cell]");
    if (!cell) return;
    var idx = cellIdx(cell);
    if (idx.r === dragState.cur.r && idx.c === dragState.cur.c) return;
    dragState.cur = idx;
    paintRange(normalizeRange(dragState.anchor, dragState.cur));
  });

  // On `document`, not `root` - the drag can end after the pointer has left
  // the grid (or the whole demo), same reasoning as the outside-click
  // popover-close listener below.
  document.addEventListener("mouseup", function () {
    if (colDragState) {
      var from = colDragState.fromKey;
      var over = colDragState.overKey;
      colDragState = null;
      if (over && over !== from) {
        var order = state.columnOrder;
        order.splice(order.indexOf(from), 1);
        order.splice(order.indexOf(over), 0, from);
        renderShell();
      }
      return;
    }
    if (!dragState) return;
    var anchor = dragState.anchor;
    var cur = dragState.cur;
    dragState = null;
    var wasDrag = anchor.r !== cur.r || anchor.c !== cur.c;
    if (wasDrag) {
      state.rangeAnchor = anchor;
      commitRange(normalizeRange(anchor, cur));
      suppressCellClick = true;
    }
    // else: no real movement - let the upcoming click event handle it as a
    // plain single-cell click (toggle/shift-extend), same as before drag
    // support existed.
  });

  root.addEventListener("change", function (e) {
    var colToggle = e.target.closest("[data-col-toggle]");
    if (colToggle) {
      var key = colToggle.getAttribute("data-col-toggle");
      if (colToggle.checked) state.hiddenCols.delete(key);
      else state.hiddenCols.add(key);
      renderShell();
      state.openPopover = "columns";
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    var cmd = e.ctrlKey || e.metaKey;
    // Only hijack Ctrl/Cmd+F when focus is actually inside the demo - never
    // globally, or it'd steal the browser's real find-in-page everywhere else
    // on the site. root.focus() below (on click) keeps this reliable even
    // when the click landed on a non-focusable cell/row.
    if (
      cmd &&
      (e.key === "f" || e.key === "F") &&
      root.contains(document.activeElement)
    ) {
      e.preventDefault();
      state.searchOpen = true;
      state._justOpenedSearch = true;
      state.openPopover = null;
      renderShell();
    }
  });

  document.addEventListener("click", function (e) {
    // composedPath(), not root.contains(e.target): the root's own click
    // handler above may have already called renderShell() and replaced
    // e.target with a detached node by the time this listener runs (both
    // listeners fire on the same bubbling click), which would make
    // root.contains(e.target) wrongly return false and close the popover
    // that was just opened. composedPath() reflects the tree at dispatch
    // time, before any of this event's own handlers mutated the DOM.
    var path = e.composedPath ? e.composedPath() : [];
    if (path.indexOf(root) === -1) closePopover();
  });

  renderShell();
})();
