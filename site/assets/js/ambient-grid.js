// Updates each .ambient-grid-panel's --gx/--gy so the flat glow layer tracks
// the cursor. See docs/decisions/ambient-grid.md. Breakpoint below must match
// styles.css's `min-width: 1300px` - no listeners attached below it.
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
