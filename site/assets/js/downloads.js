/* ============================================================
   tabularasa.cl — downloads.js

   Populates the download cards from the REAL release manifest instead of
   hand-maintained links, so this page never drifts from what the release
   pipeline actually publishes. Contract + why this exists over hardcoded
   /latest/<platform> URLs: docs/decisions/downloads.md.

   Manifest: GET https://downloads.tabularasa.cl/releases/manifest.json
     { schema_version, version, released_at,
       targets: { "<rust-target-triple>": { installer: {url,sha256,size}, update: {...} } } }
   Schema source: tabula-rasa/scripts/release/gen_manifest.py — keep in sync
   if that script's TARGETS or schema_version ever changes.

   Requires the manifest's R2 bucket to send
   `Access-Control-Allow-Origin: https://tabularasa.cl` (or `*`) — see the
   CORS note in docs/decisions/downloads.md. Without it this fetch fails
   silently (browsers don't expose the reason) and the page just falls back
   to the static hrefs already in the HTML.

   All user-facing strings route through window.TRI18N (assets/js/i18n.js) —
   loaded before this script — so a language switch re-renders whatever this
   file last computed. See docs/decisions/i18n.md.
   ============================================================ */
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

  // Platform names are proper nouns — same in both locales, not looked up in TR_I18N.
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
    if (!bytes && bytes !== 0) return "—";
    var units = ["B", "KB", "MB", "GB"];
    var i = 0;
    var n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return (i === 0 ? n : n.toFixed(1)) + " " + units[i];
  }

  // Remembers the last real state so a language switch can re-render text
  // without re-fetching the manifest.
  var lastManifest = null;
  var lastFallbackReason = null;

  function updateHeroCta(platform, manifest) {
    var label = document.getElementById("hero-download-label");
    var link = document.getElementById("hero-download-btn");
    if (!label || !link) return;
    if (platform && PLATFORM_NAMES[platform]) {
      label.textContent = t("download.cta_for_platform", { platform: PLATFORM_NAMES[platform] });
      if (manifest) {
        var triple = TARGET_BY_PLATFORM[platform];
        var entry = manifest.targets && manifest.targets[triple];
        if (entry && entry.installer && entry.installer.url) {
          link.setAttribute("href", entry.installer.url);
          return;
        }
      }
    }
    link.setAttribute("href", "#download");
  }

  function applyManifest(manifest) {
    lastManifest = manifest;
    var note = document.getElementById("download-note");
    Object.keys(TARGET_BY_PLATFORM).forEach(function (platform) {
      var triple = TARGET_BY_PLATFORM[platform];
      var entry = manifest.targets && manifest.targets[triple];
      var card = document.querySelector('.download-card[data-platform="' + platform + '"]');
      if (!card || !entry || !entry.installer) return;

      var versionEl = card.querySelector(".dl-version");
      var sizeEl = card.querySelector(".dl-size");
      var linkEl = card.querySelector(".dl-link");
      if (versionEl) versionEl.textContent = "v" + manifest.version;
      if (sizeEl) sizeEl.textContent = humanSize(entry.installer.size);
      if (linkEl) {
        linkEl.setAttribute("href", entry.installer.url);
        linkEl.textContent = t(LABEL_KEY_BY_PLATFORM[platform]) || "Download";
      }
    });
    if (note) note.textContent = t("download.note_latest", { version: manifest.version });
  }

  function fallbackNote(reasonKey) {
    lastFallbackReason = reasonKey;
    var note = document.getElementById("download-note");
    if (note) note.textContent = t("download.note_fallback", { reason: t(reasonKey) });
  }

  var platform = detectPlatform();
  updateHeroCta(platform, null);

  if (window.TRI18N) {
    window.TRI18N.onChange(function () {
      updateHeroCta(platform, lastManifest);
      if (lastManifest) applyManifest(lastManifest);
      else if (lastFallbackReason) fallbackNote(lastFallbackReason);
    });
  }

  if (!("fetch" in window)) {
    fallbackNote("download.note_no_fetch");
    return;
  }

  fetch(MANIFEST_URL, { mode: "cors" })
    .then(function (res) {
      if (!res.ok) throw new Error("manifest request failed: " + res.status);
      return res.json();
    })
    .then(function (manifest) {
      applyManifest(manifest);
      updateHeroCta(platform, manifest);
    })
    .catch(function () {
      fallbackNote("download.note_fetch_failed");
    });
})();
