/* ============================================================
   tabularasa.cl - theme.js
   Handles ONLY the toggle button + persistence + OS-follow.
   The anti-flash theme pick itself is an inline <script> in
   index.html's <head> (must run before first paint) - same split
   as benjaopazoc.cl's convention. Keep both in sync if this logic
   changes; see docs/decisions/theming.md.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Follow OS theme changes - but only until the user makes an explicit choice.
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function (e) {
        if (!localStorage.getItem("theme")) {
          root.setAttribute("data-theme", e.matches ? "dark" : "light");
        }
      });
  }
})();
