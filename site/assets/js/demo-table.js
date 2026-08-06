/* ============================================================
   tabularasa.cl — demo-table.js

   A hardcoded, client-side-only replica of Tabula Rasa's grid chrome:
   same tokens (tokens.css), same icon glyphs (assets/fonts/lucide.ttf,
   same codepoints as tabula-rasa/src/icons.rs), same measurements
   (docs/ui-ux/visual-system.md). There is no engine behind this — it's
   ~18 rows of fixture data and a handful of client-side operations that
   mirror the app's actual feature set. See docs/decisions/demo-table.md
   for what's faithfully replicated vs. deliberately simplified.

   Rendering strategy: renderShell() rebuilds the whole showcase-frame
   and is used for every discrete action (sort/filter/group/heatmap/wrap/
   columns/popovers/search open-close). Search KEYSTROKES only refresh
   <tbody> (refreshRows()) so the <input> element is never destroyed —
   a full shell rebuild there would drop focus and cursor position on
   every character typed.
   ============================================================ */
(function () {
  "use strict";

  var root = document.getElementById("tr-demo-root");
  if (!root) return;

  // Lucide codepoints — copied 1:1 from tabula-rasa/src/icons.rs. Never
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
  var STATUS_TONE = { Shipped: "green", Pending: "orange", Cancelled: "red" };

  var DATA = [
    { id: 1, customer: "Acme Corp", region: "North", status: "Shipped", amount: 1284.5, date: "2026-01-04" },
    { id: 2, customer: "Nimbus Retail", region: "South", status: "Pending", amount: 342.1, date: "2026-01-05" },
    { id: 3, customer: "Blue Harbor Ltd", region: "East", status: "Cancelled", amount: 89.99, date: "2026-01-06" },
    { id: 4, customer: "Solstice Goods", region: "West", status: "Shipped", amount: 5120.0, date: "2026-01-07" },
    { id: 5, customer: "Kepler Supply Co", region: "North", status: "Shipped", amount: 764.25, date: "2026-01-08" },
    { id: 6, customer: "Rivet & Co", region: "South", status: "Cancelled", amount: 210.0, date: "2026-01-09" },
    { id: 7, customer: "Marrow Studio", region: "East", status: "Pending", amount: 1502.75, date: "2026-01-10" },
    { id: 8, customer: "Fernwood Traders", region: "West", status: "Shipped", amount: 998.4, date: "2026-01-11" },
    { id: 9, customer: "Acme Corp", region: "North", status: "Pending", amount: 67.5, date: "2026-01-12" },
    { id: 10, customer: "Vantage Point Inc", region: "South", status: "Shipped", amount: 3420.6, date: "2026-01-13" },
    { id: 11, customer: "Blue Harbor Ltd", region: "East", status: "Shipped", amount: 458.0, date: "2026-01-14" },
    { id: 12, customer: "Greyline Freight", region: "West", status: "Cancelled", amount: 129.99, date: "2026-01-15" },
    { id: 13, customer: "Kepler Supply Co", region: "North", status: "Cancelled", amount: 2044.1, date: "2026-01-16" },
    { id: 14, customer: "Nimbus Retail", region: "South", status: "Shipped", amount: 615.3, date: "2026-01-17" },
    { id: 15, customer: "Solstice Goods", region: "West", status: "Pending", amount: 4210.0, date: "2026-01-18" },
    { id: 16, customer: "Marrow Studio", region: "East", status: "Shipped", amount: 87.25, date: "2026-01-19" },
    { id: 17, customer: "Vantage Point Inc", region: "South", status: "Pending", amount: 1875.0, date: "2026-01-20" },
    { id: 18, customer: "Fernwood Traders", region: "West", status: "Shipped", amount: 322.4, date: "2026-01-21" },
  ];

  var COLUMNS = [
    { key: "id", label: "id", align: "right", dim: true },
    { key: "customer", label: "customer" },
    { key: "region", label: "region" },
    { key: "status", label: "status" },
    { key: "amount", label: "amount", align: "right", heat: true, fmt: money },
    { key: "date", label: "date" },
  ];

  var COMING_SOON = {
    numfmt: { icon: ICON.NUMBER_FORMAT, label: "Number format" },
    freezecols: { icon: ICON.FREEZE_COLS, label: "Freeze columns" },
    freezerows: { icon: ICON.FREEZE_ROWS, label: "Freeze rows" },
    formatpanel: { icon: ICON.FORMAT_PANEL, label: "Format panel" },
    goto: { icon: ICON.GOTO, label: "Go to row" },
    width: { icon: ICON.WIDTH, label: "Column width" },
    height: { icon: ICON.HEIGHT, label: "Row height" },
  };

  var state = {
    sortKey: null,
    sortDir: "asc",
    filterInclude: new Set(STATUSES),
    groupBy: null,
    collapsed: new Set(),
    heatmap: false,
    wrap: false,
    hiddenCols: new Set(),
    openPopover: null,
    comingSoonKey: null,
    searchOpen: false,
    searchQuery: "",
    matchIndex: 0,
    selectedRow: null,
    selectedCell: null,
  };

  function money(v) {
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function visibleColumns() {
    return COLUMNS.filter(function (c) {
      return !state.hiddenCols.has(c.key);
    });
  }

  function filteredRows() {
    return DATA.filter(function (r) {
      return state.filterInclude.has(r.status);
    });
  }

  function sortRows(rows) {
    if (!state.sortKey) return rows;
    var key = state.sortKey;
    var dir = state.sortDir === "asc" ? 1 : -1;
    return rows.slice().sort(function (a, b) {
      var av = a[key], bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  // Builds { groups: [{ key, rows }] } — one group ("__all__") when groupBy
  // is off, so the row-render path never has to special-case "no grouping".
  function groupRows(rows) {
    if (!state.groupBy) return [{ key: null, rows: sortRows(rows) }];
    var order = state.groupBy === "region" ? REGIONS : STATUSES;
    return order
      .map(function (g) {
        return { key: g, rows: sortRows(rows.filter(function (r) { return r[state.groupBy] === g; })) };
      })
      .filter(function (g) {
        return g.rows.length > 0;
      });
  }

  function heatRange(rows) {
    var vals = rows.map(function (r) { return r.amount; });
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  function collectMatches(groups, cols) {
    var q = state.searchQuery.trim().toLowerCase();
    var matches = [];
    if (!q) return matches;
    groups.forEach(function (g) {
      g.rows.forEach(function (row) {
        cols.forEach(function (col) {
          var text = String(col.fmt ? col.fmt(row[col.key]) : row[col.key]).toLowerCase();
          var from = 0;
          var idx;
          while ((idx = text.indexOf(q, from)) !== -1) {
            matches.push({ rowId: row.id, colKey: col.key, start: idx, end: idx + q.length });
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
      .map(function (m, i) { return Object.assign({ i: i }, m); })
      .filter(function (m) { return m.rowId === rowId && m.colKey === colKey; });
    if (!own.length) return esc(raw);
    var s = String(raw);
    var out = "";
    var cursor = 0;
    own.forEach(function (m) {
      out += esc(s.slice(cursor, m.start));
      var cls = m.i === state.matchIndex ? "tr-match is-current" : "tr-match";
      var id = m.i === state.matchIndex ? ' id="tr-current-match"' : "";
      out += '<mark class="' + cls + '"' + id + ">" + esc(s.slice(m.start, m.end)) + "</mark>";
      cursor = m.end;
    });
    out += esc(s.slice(cursor));
    return out;
  }

  function statusCell(value) {
    var tone = STATUS_TONE[value] || "green";
    return (
      '<span class="tr-status-cell is-' + tone + '">' +
      '<span class="tr-status-dot is-' + tone + '"></span>' +
      esc(value) +
      "</span>"
    );
  }

  function buildRowsHtml() {
    var cols = visibleColumns();
    var rows = filteredRows();
    var groups = groupRows(rows);
    var matches = collectMatches(groups, cols);
    var heat = state.heatmap ? heatRange(rows) : null;
    var rowNum = 0;
    var html = "";

    groups.forEach(function (g) {
      if (state.groupBy) {
        var chev = state.collapsed.has(g.key) ? ICON.CHEVRON_RIGHT : ICON.CHEVRON_DOWN;
        html +=
          '<tr class="tr-group-header" data-group-toggle="' + esc(g.key) + '">' +
          '<td colspan="' + (cols.length + 1) + '">' +
          '<span class="icon chev">' + chev + "</span>" +
          esc(state.groupBy) + ": " + esc(g.key) +
          '<span class="count">' + g.rows.length + " row" + (g.rows.length === 1 ? "" : "s") + "</span>" +
          "</td></tr>";
      }
      if (state.groupBy && state.collapsed.has(g.key)) return;

      g.rows.forEach(function (row) {
        rowNum++;
        var zebra = rowNum % 2 === 0 ? "tr-row-even" : "tr-row-odd";
        var selectedRowCls = state.selectedRow === row.id ? "is-row-selected" : "";
        html += '<tr class="' + zebra + " " + selectedRowCls + '" data-row-id="' + row.id + '">';
        html +=
          '<td class="tr-col-gutter" data-gutter-row="' + row.id + '">' + rowNum + "</td>";
        cols.forEach(function (col) {
          var raw = row[col.key];
          var display = col.fmt ? col.fmt(raw) : raw;
          var marked = markCell(display, row.id, col.key, matches);
          var cellHtml = col.key === "status" ? statusCell(raw) : marked;
          var classes = [];
          if (col.dim) classes.push("tr-col-id");
          var cellSelected = state.selectedCell === row.id + ":" + col.key;
          if (cellSelected) classes.push("is-cell-selected");
          var styleParts = [];
          if (col.align === "right") styleParts.push("text-align:right");
          if (col.heat && heat) {
            classes.push("tr-cell-heat");
            var t = heat.max === heat.min ? 0.5 : (raw - heat.min) / (heat.max - heat.min);
            styleParts.push("--heat:" + t.toFixed(3));
          }
          var styleAttr = styleParts.length ? ' style="' + styleParts.join(";") + '"' : "";
          html +=
            '<td class="' + classes.join(" ").trim() + '"' +
            styleAttr +
            ' data-cell="' + row.id + ":" + col.key + '">' +
            cellHtml +
            "</td>";
        });
        html += "</tr>";
      });
    });

    if (rowNum === 0) {
      html = '<tr class="tr-empty-row"><td colspan="' + (cols.length + 1) + '">No rows match the current filter.</td></tr>';
    }

    return { html: html, matchCount: matches.length };
  }

  function pillsHtml() {
    var pills = "";
    if (state.sortKey) {
      pills +=
        '<span class="tr-pill is-sort">' +
        '<span class="tr-pill-icon icon">' + ICON.ORDER_BY + "</span>" +
        '<span class="tr-pill-label">' + esc(state.sortKey) + " " + (state.sortDir === "asc" ? "↑" : "↓") + "</span>" +
        '<span class="tr-pill-close" data-remove-rule="sort" title="Remove sort">' + ICON.CLOSE + "</span>" +
        "</span>";
    }
    var included = Array.from(state.filterInclude);
    if (included.length < STATUSES.length) {
      pills +=
        '<span class="tr-pill is-filter">' +
        '<span class="tr-pill-icon icon">' + ICON.FILTER + "</span>" +
        '<span class="tr-pill-label">status: ' + esc(included.join(", ") || "none") + "</span>" +
        '<span class="tr-pill-close" data-remove-rule="filter" title="Remove filter">' + ICON.CLOSE + "</span>" +
        "</span>";
    }
    if (state.groupBy) {
      pills +=
        '<span class="tr-pill is-group">' +
        '<span class="tr-pill-icon icon">' + ICON.GROUP_BY + "</span>" +
        '<span class="tr-pill-label">group: ' + esc(state.groupBy) + "</span>" +
        '<span class="tr-pill-close" data-remove-rule="group" title="Remove grouping">' + ICON.CLOSE + "</span>" +
        "</span>";
    }
    return pills || '<span class="tr-rules-empty">No sort, filter, or group rules — click a header, or try Filter / Group by above</span>';
  }

  function aggregateHtml() {
    var rows = filteredRows();
    var sum = rows.reduce(function (a, r) { return a + r.amount; }, 0);
    return (
      '<span class="agg-label">Rows</span><span class="agg-value">' + rows.length + "</span>" +
      '<span class="agg-label">Sum(amount)</span><span class="agg-value">' + money(sum) + "</span>"
    );
  }

  function toolbarBtn(opts) {
    // opts: { icon, label, active, dataset: {action:...}, disabled, chevron }
    var attrs = Object.keys(opts.dataset || {})
      .map(function (k) { return ' data-' + k + '="' + esc(opts.dataset[k]) + '"'; })
      .join("");
    return (
      '<button type="button" class="tr-btn' + (opts.active ? " is-active" : "") + '"' +
      attrs +
      (opts.disabled ? " disabled" : "") +
      (opts.title ? ' title="' + esc(opts.title) + '"' : "") +
      ">" +
      '<span class="icon">' + opts.icon + "</span>" +
      (opts.label ? "<span>" + esc(opts.label) + "</span>" : "") +
      (opts.chevron ? '<span class="chev icon">' + ICON.CHEVRON_DOWN + "</span>" : "") +
      "</button>"
    );
  }

  function popoverHtml() {
    if (state.openPopover === "columns") {
      var rows = COLUMNS.map(function (c) {
        var checked = !state.hiddenCols.has(c.key) ? " checked" : "";
        return (
          '<label class="tr-popover-row" style="cursor:pointer">' +
          '<input type="checkbox" data-col-toggle="' + c.key + '"' + checked + " />" +
          "<span>" + esc(c.label) + "</span>" +
          "</label>"
        );
      }).join("");
      return popoverWrap("Show / hide columns", rows);
    }
    if (state.openPopover === "filter") {
      var frows = STATUSES.map(function (s) {
        var checked = state.filterInclude.has(s) ? " checked" : "";
        return (
          '<label class="tr-popover-row" style="cursor:pointer">' +
          '<input type="checkbox" data-status-toggle="' + s + '"' + checked + " />" +
          "<span>" + esc(s) + "</span>" +
          "</label>"
        );
      }).join("");
      return popoverWrap("Filter — status includes", frows);
    }
    if (state.openPopover === "group") {
      var options = [
        { v: null, label: "None" },
        { v: "region", label: "Region" },
        { v: "status", label: "Status" },
      ];
      var grows = options
        .map(function (o) {
          var sel = state.groupBy === o.v ? " is-selected" : "";
          return (
            '<button type="button" class="tr-popover-row' + sel + '" data-group-set="' + (o.v || "") + '">' +
            esc(o.label) +
            "</button>"
          );
        })
        .join("");
      return popoverWrap("Group by", grows);
    }
    if (state.openPopover === "comingsoon" && state.comingSoonKey) {
      var cs = COMING_SOON[state.comingSoonKey];
      return popoverWrap(
        cs.label,
        '<div style="padding:6px 8px 10px;color:var(--dim);font-size:12.5px;font-family:var(--font-chrome);max-width:220px;">' +
          "Not wired up in this static preview — it's real in the app.</div>" +
          '<a class="btn btn-primary btn-sm" href="#download" style="margin:0 8px 6px;">Get the app</a>'
      );
    }
    return "";
  }

  function popoverWrap(title, body) {
    return (
      '<div class="tr-popover is-open">' +
      '<div class="tr-popover-title">' + esc(title) + "</div>" +
      body +
      "</div>"
    );
  }

  function shellHtml() {
    var rowsBuilt = buildRowsHtml();
    var cols = visibleColumns();

    var headCells = cols
      .map(function (c) {
        var sortChev = "";
        if (state.sortKey === c.key) {
          sortChev = '<span class="icon sort-chev">' + (state.sortDir === "asc" ? ICON.CHEVRON_UP : ICON.CHEVRON_DOWN) + "</span>";
        }
        return (
          '<th data-sort-key="' + c.key + '"' +
          (c.align === "right" ? ' style="text-align:right"' : "") +
          ">" + esc(c.label) + sortChev + "</th>"
        );
      })
      .join("");

    return (
      '<div class="tr-titlebar">' +
      '<div class="tr-dots"><span></span><span></span><span></span></div>' +
      '<div class="tr-titlebar-title">orders_q1.csv &mdash; Tabula Rasa</div>' +
      "</div>" +
      '<div class="tr-menubar"><span>File</span><span>Edit</span><span>View</span><span>Data</span><span>Help</span></div>' +
      '<div class="tr-tabstrip">' +
      '<div class="tr-tab is-active">orders_q1.csv<span class="tr-tab-dirty"></span></div>' +
      '<div class="tr-tab">customers.csv</div>' +
      '<div class="tr-tab-add">+</div>' +
      "</div>" +
      '<div class="tr-toolbar">' +
      '<span class="tr-group-label">Format</span>' +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.COLUMNS, label: "Columns", chevron: true, active: state.openPopover === "columns", dataset: { action: "toggle-columns" } }) +
      (state.openPopover === "columns" ? popoverHtml() : "") +
      "</div>" +
      toolbarBtn({ icon: ICON.WRAP, active: state.wrap, dataset: { action: "toggle-wrap" }, title: "Wrap text" }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.WIDTH, label: "Width", chevron: true, dataset: { action: "coming-soon", key: "width" }, title: "Column width" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "width" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.HEIGHT, label: "Height", chevron: true, dataset: { action: "coming-soon", key: "height" }, title: "Row height" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "height" ? popoverHtml() : "") +
      "</div>" +
      toolbarBtn({ icon: ICON.HEATMAP, active: state.heatmap, dataset: { action: "toggle-heatmap" }, title: "Heatmap the amount column" }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.NUMBER_FORMAT, dataset: { action: "coming-soon", key: "numfmt" }, title: "Number format" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "numfmt" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.FREEZE_COLS, dataset: { action: "coming-soon", key: "freezecols" }, title: "Freeze columns" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "freezecols" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.FREEZE_ROWS, dataset: { action: "coming-soon", key: "freezerows" }, title: "Freeze rows" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "freezerows" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.FORMAT_PANEL, dataset: { action: "coming-soon", key: "formatpanel" }, title: "Format panel" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "formatpanel" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-divider"></div>' +
      '<span class="tr-group-label">Data</span>' +
      toolbarBtn({ icon: ICON.FIND, active: state.searchOpen, dataset: { action: "toggle-search" }, title: "Find (Ctrl/Cmd+F)" }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.GOTO, dataset: { action: "coming-soon", key: "goto" }, title: "Go to row" }) +
      (state.openPopover === "comingsoon" && state.comingSoonKey === "goto" ? popoverHtml() : "") +
      "</div>" +
      toolbarBtn({ icon: ICON.ORDER_BY, label: "Order by", disabled: true, title: "Sort by clicking a column header instead" }) +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.GROUP_BY, label: "Group by", chevron: true, active: state.openPopover === "group" || !!state.groupBy, dataset: { action: "toggle-group" } }) +
      (state.openPopover === "group" ? popoverHtml() : "") +
      "</div>" +
      '<div class="tr-toolbar-group tr-popover-anchor">' +
      toolbarBtn({ icon: ICON.FILTER, label: "Filter", active: state.openPopover === "filter" || state.filterInclude.size < STATUSES.length, dataset: { action: "toggle-filter" } }) +
      (state.openPopover === "filter" ? popoverHtml() : "") +
      "</div>" +
      "</div>" +
      '<div class="tr-grid-scroll">' +
      '<table class="tr-grid' + (state.wrap ? " is-wrapped" : "") + '">' +
      "<thead><tr>" +
      '<th class="tr-col-gutter">#</th>' +
      headCells +
      "</tr></thead>" +
      "<tbody>" + rowsBuilt.html + "</tbody>" +
      "</table>" +
      "</div>" +
      '<div class="tr-searchbar' + (state.searchOpen ? " is-open" : "") + '">' +
      '<span class="icon" style="color:var(--faint);font-size:14px;">' + ICON.FIND + "</span>" +
      '<input id="tr-search-input" type="text" placeholder="Find in orders_q1.csv" value="' + esc(state.searchQuery) + '" />' +
      '<span class="tr-search-count" id="tr-search-count">' +
      (state.searchQuery ? (rowsBuilt.matchCount ? state.matchIndex + 1 + " of " + rowsBuilt.matchCount : "No matches") : "") +
      "</span>" +
      '<button type="button" class="tr-search-btn" data-action="close-search" title="Close (Esc)">' + ICON.CLOSE + "</button>" +
      "</div>" +
      '<div class="tr-statusbar">' +
      '<div class="tr-status-zone tr-status-left">' + aggregateHtml() + "</div>" +
      '<div class="tr-status-zone tr-status-center">' +
      '<span class="tr-rules-label">Rules</span>' + pillsHtml() +
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
    if (current) current.scrollIntoView({ block: "nearest", inline: "nearest" });
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
    state.matchIndex = (state.matchIndex + dir + built.matchCount) % built.matchCount;
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
    // below needs a reliable "focus is inside the demo" signal — parks focus
    // on the root itself unless the click already landed on something
    // focusable (an input/button/link keeps its own native focus).
    if (!t.closest("input, button, a") && document.activeElement !== root) {
      root.focus({ preventScroll: true });
    }

    var sortTh = t.closest("th[data-sort-key]");
    if (sortTh) {
      var key = sortTh.getAttribute("data-sort-key");
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      state.openPopover = null;
      renderShell();
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
      state.selectedCell = null;
      refreshRows();
      return;
    }

    var cell = t.closest("[data-cell]");
    if (cell) {
      var ck = cell.getAttribute("data-cell");
      state.selectedCell = state.selectedCell === ck ? null : ck;
      state.selectedRow = null;
      refreshRows();
      return;
    }

    var removeRule = t.closest("[data-remove-rule]");
    if (removeRule) {
      var rule = removeRule.getAttribute("data-remove-rule");
      if (rule === "sort") state.sortKey = null;
      if (rule === "filter") state.filterInclude = new Set(STATUSES);
      if (rule === "group") {
        state.groupBy = null;
        state.collapsed = new Set();
      }
      renderShell();
      return;
    }

    var groupSet = t.closest("[data-group-set]");
    if (groupSet) {
      var v = groupSet.getAttribute("data-group-set") || null;
      state.groupBy = v || null;
      state.collapsed = new Set();
      state.openPopover = null;
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
        var already = state.openPopover === "comingsoon" && state.comingSoonKey === key;
        state.openPopover = already ? null : "comingsoon";
        state.comingSoonKey = already ? null : key;
        renderShell();
      }
      return;
    }

    if (!t.closest(".tr-popover") && !t.closest("[data-action]")) {
      closePopover();
    }
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
    var statusToggle = e.target.closest("[data-status-toggle]");
    if (statusToggle) {
      var s = statusToggle.getAttribute("data-status-toggle");
      if (statusToggle.checked) state.filterInclude.add(s);
      else state.filterInclude.delete(s);
      renderShell();
      state.openPopover = "filter";
    }
  });

  document.addEventListener("keydown", function (e) {
    var cmd = e.ctrlKey || e.metaKey;
    // Only hijack Ctrl/Cmd+F when focus is actually inside the demo — never
    // globally, or it'd steal the browser's real find-in-page everywhere else
    // on the site. root.focus() below (on click) keeps this reliable even
    // when the click landed on a non-focusable cell/row.
    if (cmd && (e.key === "f" || e.key === "F") && root.contains(document.activeElement)) {
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
