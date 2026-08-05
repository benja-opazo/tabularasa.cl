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
   ============================================================ */
(function () {
  "use strict";

  var MANIFEST_URL = "https://downloads.tabularasa.cl/releases/manifest.json";

  var TARGET_BY_PLATFORM = {
    linux: "x86_64-unknown-linux-gnu",
    windows: "x86_64-pc-windows-msvc",
    macos: "aarch64-apple-darwin",
  };

  var LABEL_BY_PLATFORM = {
    linux: "Download .AppImage",
    windows: "Download .exe",
    macos: "Download .dmg",
  };

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

  function applyDetected(platform) {
    document.querySelectorAll(".download-card").forEach(function (card) {
      var isMatch = card.getAttribute("data-platform") === platform;
      card.classList.toggle("is-detected", isMatch);
      var badge = card.querySelector(".download-detected-badge");
      if (badge) badge.hidden = !isMatch;
    });
  }

  function updateHeroCta(platform, manifest) {
    var label = document.getElementById("hero-download-label");
    var link = document.getElementById("hero-download-btn");
    if (!label || !link) return;
    var names = { linux: "Linux", windows: "Windows", macos: "macOS" };
    if (platform && names[platform]) {
      label.textContent = "Download for " + names[platform];
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
        linkEl.textContent = LABEL_BY_PLATFORM[platform] || "Download";
      }
    });
    if (note) {
      note.textContent =
        "Latest release: v" + manifest.version +
        " · SHA-256 checksums ship alongside every download.";
    }
  }

  function fallbackNote(reason) {
    var note = document.getElementById("download-note");
    if (note) {
      note.textContent =
        "Showing the standard download links — " + reason + ". They still point to the latest release.";
    }
  }

  var platform = detectPlatform();
  applyDetected(platform);
  updateHeroCta(platform, null);

  if (!("fetch" in window)) {
    fallbackNote("this browser can't check for the newest version automatically");
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
      fallbackNote("couldn't reach the release server just now");
    });
})();
