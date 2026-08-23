// Toggle + persistence + OS-follow only - the anti-flash pick itself is the
// inline <head> script in index.html/pricing.html. See docs/decisions/theming.md.
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
