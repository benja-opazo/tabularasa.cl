// Mobile hamburger nav: toggles #mobile-nav, closes on link click, outside
// click, Escape, or resize past the 860px breakpoint where the full nav
// takes over instead (styles.css). See docs/decisions/mobile-nav.md.
(function () {
  "use strict";

  var toggle = document.getElementById("nav-toggle");
  var panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  function open() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function close() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    if (panel.hidden) open();
    else close();
  });

  panel.addEventListener("click", function (e) {
    if (e.target.closest("a")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) close();
  });

  document.addEventListener("click", function (e) {
    if (panel.hidden) return;
    if (e.target.closest("#mobile-nav") || e.target.closest("#nav-toggle")) return;
    close();
  });

  var mq = window.matchMedia("(min-width: 860px)");
  mq.addEventListener("change", function (e) {
    if (e.matches) close();
  });
})();
