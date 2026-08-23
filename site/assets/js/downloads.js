// Populates the download cards from the real release manifest, not
// hand-maintained links. Manifest schema, the CORS dependency, and the
// fallback behavior: docs/decisions/downloads.md.
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

  // Remembers the last real state so a language switch can re-render text
  // without re-fetching the manifest.
  var lastManifest = null;

  function updateHeroCta(platform, manifest) {
    var label = document.getElementById("hero-download-label");
    var link = document.getElementById("hero-download-btn");
    if (!label || !link) return;
    if (platform && PLATFORM_NAMES[platform]) {
      label.textContent = t("download.cta_for_platform", {
        platform: PLATFORM_NAMES[platform],
      });
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
      var card = document.querySelector(
        '.download-card[data-platform="' + platform + '"]',
      );
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
  updateHeroCta(platform, null);

  if (window.TRI18N) {
    window.TRI18N.onChange(function () {
      updateHeroCta(platform, lastManifest);
      if (lastManifest) applyManifest(lastManifest);
    });
  }

  if (!("fetch" in window)) {
    hideNote();
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
      hideNote();
    });
})();
