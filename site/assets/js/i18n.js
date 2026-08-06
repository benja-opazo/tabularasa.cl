/* ============================================================
   tabularasa.cl — i18n.js

   Applies window.TR_I18N (assets/js/i18n-strings.js) to the DOM, persists
   the choice, and exposes a tiny API other scripts (downloads.js) use for
   strings they build dynamically at runtime. See docs/decisions/i18n.md.

   Marking conventions read by apply():
     data-i18n="key"        textContent = dict[key]
     data-i18n-html="key"   innerHTML = dict[key] (trusted, static strings only)
     data-i18n-attr="attr:key[;attr2:key2]"   sets element attribute(s)

   The showcase demo (#tr-demo-root, rendered by demo-table.js) is
   deliberately NOT translated — it's a pixel-faithful replica of the real
   app, which is English-only today. Translating the chrome around a still-
   English screenshot-alike would be a lie about what you get. Re-visit only
   if/when the app itself ships localization.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "lang";
  var DEFAULT_LOCALE = "en";
  var SUPPORTED = ["en", "es"];
  var listeners = [];

  function detectLocale() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : DEFAULT_LOCALE;
  }

  var current = detectLocale();

  function dict() {
    return window.TR_I18N[current] || window.TR_I18N[DEFAULT_LOCALE];
  }

  function t(key, vars) {
    var s = dict()[key];
    if (s == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace("{" + k + "}", vars[k]);
      });
    }
    return s;
  }

  function apply() {
    document.documentElement.setAttribute("lang", current);

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts.length !== 2) return;
          el.setAttribute(parts[0].trim(), t(parts[1].trim()));
        });
    });

    // The toggle always shows the *other* language's code — clicking it
    // switches to whatever it's currently labeled.
    var toggleEl = document.getElementById("lang-toggle");
    if (toggleEl) toggleEl.textContent = current === "en" ? "ES" : "EN";
  }

  function setLocale(locale) {
    if (SUPPORTED.indexOf(locale) === -1 || locale === current) return;
    current = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    apply();
    listeners.forEach(function (cb) {
      cb(current);
    });
    document.dispatchEvent(new CustomEvent("trlangchange", { detail: { locale: current } }));
  }

  window.TRI18N = {
    t: t,
    locale: function () {
      return current;
    },
    setLocale: setLocale,
    onChange: function (cb) {
      listeners.push(cb);
    },
  };

  apply();

  var toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setLocale(current === "en" ? "es" : "en");
    });
  }
})();
