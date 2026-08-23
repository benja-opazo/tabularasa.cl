// Fetches each locale's dictionary from assets/i18n/<locale>.json on demand
// (only the active locale up front, the rest in the background after
// `load`) instead of shipping every locale to every visitor. Applies to the
// DOM via data-i18n*/data-i18n-html/data-i18n-attr, persists the choice, and
// exposes window.TRI18N for other scripts (downloads.js). See
// docs/decisions/i18n.md for the loading strategy and its trade-offs.
(function () {
  "use strict";

  var STORAGE_KEY = "lang";
  var DEFAULT_LOCALE = "en";
  var SUPPORTED = ["en", "es"];
  var BASE_URL = "assets/i18n/";
  var listeners = [];
  var loaded = {};
  var inFlight = {};

  function detectLocale() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (
      navigator.language ||
      navigator.userLanguage ||
      ""
    ).toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : DEFAULT_LOCALE;
  }

  var current = detectLocale();

  function dict() {
    return loaded[current] || loaded[DEFAULT_LOCALE] || {};
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

  // Cache-or-fetch: resolves immediately if already loaded, dedupes
  // concurrent requests for the same locale, never rejects into caller code
  // that isn't expecting it (callers add their own .catch()).
  function loadLocale(locale) {
    if (loaded[locale]) return Promise.resolve(loaded[locale]);
    if (inFlight[locale]) return inFlight[locale];
    inFlight[locale] = fetch(BASE_URL + locale + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("i18n fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        loaded[locale] = data;
        delete inFlight[locale];
        return data;
      })
      .catch(function (err) {
        delete inFlight[locale];
        throw err;
      });
    return inFlight[locale];
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

    // The toggle always shows the *other* language's code - clicking it
    // switches to whatever it's currently labeled.
    var toggleEl = document.getElementById("lang-toggle");
    if (toggleEl) toggleEl.textContent = current === "en" ? "ES" : "EN";
  }

  // Shared by the initial load AND every explicit switch, so anything
  // subscribed via onChange (downloads.js) also gets a correct re-render the
  // first time real strings arrive, not just on subsequent toggles - without
  // this, code that computes a string via t() before the first fetch
  // resolves (e.g. the hero CTA label) would stay stuck on a raw key.
  function finishApply() {
    apply();
    listeners.forEach(function (cb) {
      cb(current);
    });
    document.dispatchEvent(
      new CustomEvent("trlangchange", { detail: { locale: current } }),
    );
  }

  function setLocale(locale) {
    if (SUPPORTED.indexOf(locale) === -1 || locale === current) return;
    loadLocale(locale)
      .then(function () {
        current = locale;
        localStorage.setItem(STORAGE_KEY, locale);
        finishApply();
      })
      .catch(function () {
        // Network hiccup - stay on the current locale, no partial switch.
      });
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

  loadLocale(current)
    .then(finishApply)
    .catch(function () {
      // Leave the hardcoded English already in the DOM - no dictionary to
      // apply, same spirit as the existing silent-fallback convention
      // (docs/decisions/downloads.md).
    });

  // Background-warm every other locale once the page has finished loading,
  // so a later toggle click applies instantly instead of waiting on a fetch.
  window.addEventListener("load", function () {
    SUPPORTED.forEach(function (locale) {
      if (locale !== current) loadLocale(locale).catch(function () {});
    });
  });

  var toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setLocale(current === "en" ? "es" : "en");
    });
  }
})();
