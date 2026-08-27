// Fills in each download card's version/size from the real release
// manifest - the actual download link always goes to the
// /latest/<platform> landing page (worker/index.js), not a manifest-
// resolved file URL. Manifest schema, the CORS dependency, and why the
// landing page is the steady state: docs/decisions/downloads.md.
(function () {
  "use strict";

  var MANIFEST_URL = "https://downloads.tabularasa.cl/releases/manifest.json";

  var TARGET_BY_PLATFORM = {
    linux: "x86_64-unknown-linux-gnu",
    windows: "x86_64-pc-windows-msvc",
    macos: "aarch64-apple-darwin",
  };

  var LABEL_KEY_BY_PLATFORM = {
    linux: "download.btn_appimage",
    windows: "download.btn_exe",
    macos: "download.btn_dmg",
  };

  // Platform names are proper nouns - same in both locales, not looked up via t().
  var PLATFORM_NAMES = { linux: "Linux", windows: "Windows", macos: "macOS" };

  function t(key, vars) {
    return window.TRI18N ? window.TRI18N.t(key, vars) : key;
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    var plat = navigator.platform || "";
    if (/Win/i.test(plat) || /Windows/i.test(ua)) return "windows";
    if (/Mac/i.test(plat) || /Macintosh/i.test(ua)) return "macos";
    if (/Linux/i.test(plat) || /Linux/i.test(ua)) return "linux";
    return null;
  }

  function humanSize(bytes) {
    if (!bytes && bytes !== 0) return "-";
    var units = ["B", "KB", "MB", "GB"];
    var i = 0;
    var n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return (i === 0 ? n : n.toFixed(1)) + " " + units[i];
  }

  function currentLang() {
    return window.TRI18N ? window.TRI18N.locale() : "en";
  }

  // downloads.tabularasa.cl can't read this origin's localStorage, so its
  // theme would otherwise only ever follow OS preference.
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  // Stamps/replaces `?lang=`/`?theme=` on an already-absolute URL so the
  // /latest/<platform> landing page (worker/index.js) matches whatever
  // language/theme the visitor has the site in, not just Accept-Language/OS
  // preference.
  function withState(rawUrl) {
    var u = new URL(rawUrl, window.location.href);
    u.searchParams.set("lang", currentLang());
    u.searchParams.set("theme", currentTheme());
    return u.toString();
  }

  // Every download click - card buttons and the hero CTA alike - always
  // goes through the /latest/<platform> landing page (worker/index.js),
  // which auto-downloads the real file and shows a thanks/donate message.
  // See docs/decisions/downloads.md for why this replaced linking straight
  // to the manifest-resolved file.
  function syncCardLinks() {
    document.querySelectorAll(".dl-link").forEach(function (a) {
      a.setAttribute("href", withState(a.getAttribute("href")));
    });
  }

  // Remembers the last real state so a language switch can re-render text
  // without re-fetching the manifest.
  var lastManifest = null;

  function updateHeroCta(platform) {
    var label = document.getElementById("hero-download-label");
    var link = document.getElementById("hero-download-btn");
    if (!label || !link) return;
    if (platform && PLATFORM_NAMES[platform]) {
      label.textContent = t("download.cta_for_platform", {
        platform: PLATFORM_NAMES[platform],
      });
      link.setAttribute(
        "href",
        withState("https://downloads.tabularasa.cl/latest/" + platform),
      );
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
      return;
    }
    link.setAttribute("href", "#download");
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }

  function applyManifest(manifest) {
    lastManifest = manifest;
    var note = document.getElementById("download-note");
    Object.keys(TARGET_BY_PLATFORM).forEach(function (platform) {
      var triple = TARGET_BY_PLATFORM[platform];
      var entry = manifest.targets && manifest.targets[triple];
      var card = document.querySelector(
        '.download-card[data-platform="' + platform + '"]',
      );
      if (!card || !entry || !entry.installer) return;

      var versionEl = card.querySelector(".dl-version");
      var sizeEl = card.querySelector(".dl-size");
      var linkEl = card.querySelector(".dl-link");
      if (versionEl) versionEl.textContent = "v" + manifest.version;
      if (sizeEl) sizeEl.textContent = humanSize(entry.installer.size);
      if (linkEl) linkEl.textContent = t(LABEL_KEY_BY_PLATFORM[platform]) || "Download";
    });
    if (note)
      note.textContent = t("download.note_latest", {
        version: manifest.version,
      });
  }

  // Silent fallback (docs/decisions/downloads.md): if the manifest can't be
  // reached we just drop the note - the static hrefs in index.html already
  // point at the latest release, so there's nothing for the visitor to act on.
  // `.download-note` sets no `display`, so the UA `[hidden]` rule is enough.
  function hideNote() {
    var note = document.getElementById("download-note");
    if (note) note.hidden = true;
  }

  var platform = detectPlatform();
  updateHeroCta(platform);
  syncCardLinks();

  if (window.TRI18N) {
    window.TRI18N.onChange(function () {
      updateHeroCta(platform);
      syncCardLinks();
      if (lastManifest) applyManifest(lastManifest);
    });
  }

  // Toggling dark/light must re-stamp `?theme=` too, not just a language
  // switch - otherwise the /latest/<platform> landing page opens in whatever
  // theme was active at page load. See theme.js's trthemechange.
  document.addEventListener("trthemechange", function () {
    updateHeroCta(platform);
    syncCardLinks();
  });

  if (!("fetch" in window)) {
    hideNote();
    return;
  }

  fetch(MANIFEST_URL, { mode: "cors" })
    .then(function (res) {
      if (!res.ok) throw new Error("manifest request failed: " + res.status);
      return res.json();
    })
    .then(applyManifest)
    .catch(function () {
      hideNote();
    });
})();
