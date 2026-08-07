/* ============================================================
   tabularasa.cl — ambient-grid.js

   Drives the mouse-tracked glow on the decorative side panels
   (.ambient-grid-panel, styles.css section 19). Purely cosmetic — the grid
   lines and the perspective tilt are static CSS; this file's only job is
   updating each panel's --gx/--gy custom properties so the flat (untilted)
   glow layer underneath tracks the cursor. See docs/decisions/ambient-grid.md
   for why the glow itself isn't rotated with the grid (avoids inverting a
   3D transform just to place a soft blob — not worth the complexity for a
   decorative effect).

   Only active at the breakpoint where the CSS actually shows the panels
   (matches styles.css's `min-width: 1300px`) — no listeners attached below
   that width, so this does zero work on mobile/tablet.
   ============================================================ */
(function () {
  "use strict";

  var panels = document.querySelectorAll(".ambient-grid-panel");
  if (!panels.length) return;

  var mq = window.matchMedia("(min-width: 1300px)");
  var rects = [];
  var raf = null;
  var active = false;

  function measure() {
    rects = Array.prototype.map.call(panels, function (p) {
      return p.getBoundingClientRect();
    });
  }

  function onMove(e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      panels.forEach(function (panel, i) {
        var r = rects[i];
        panel.style.setProperty("--gx", e.clientX - r.left + "px");
        panel.style.setProperty("--gy", e.clientY - r.top + "px");
      });
    });
  }

  function enable() {
    if (active) return;
    active = true;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  function disable() {
    if (!active) return;
    active = false;
    window.removeEventListener("resize", measure);
    window.removeEventListener("pointermove", onMove);
  }

  function sync() {
    if (mq.matches) enable();
    else disable();
  }

  mq.addEventListener("change", sync);
  sync();
})();
