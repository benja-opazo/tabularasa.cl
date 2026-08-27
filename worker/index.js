// One server-side route on top of the static site: a click-through OG-tagged
// landing page at downloads.tabularasa.cl/latest/<platform>. It's the
// canonical destination for every download click on the site (not just a
// CORS-failure fallback) - see docs/decisions/downloads.md and
// docs/decisions/download-redirect.md. Everything else falls through to
// env.ASSETS.fetch().

const MANIFEST_URL = "https://downloads.tabularasa.cl/releases/manifest.json";

// Keep in sync with TARGET_BY_PLATFORM in site/assets/js/downloads.js.
const TARGET_BY_PLATFORM = {
  linux: "x86_64-unknown-linux-gnu",
  windows: "x86_64-pc-windows-msvc",
  macos: "aarch64-apple-darwin",
};

// Proper nouns - same in both locales, not part of COPY below.
const PLATFORM_NAMES = { linux: "Linux", windows: "Windows", macos: "macOS" };

// Paraphrased from the `download.*`/`pricing.cta_donate` strings in
// site/assets/i18n/{en,es}.json (see docs/decisions/copy.md's sourcing
// rule) - this page has no runtime access to those JSON files (it's
// rendered at the edge, not in the browser), so the two locales are
// hand-duplicated here. Re-check both sides if that copy changes.
const COPY = {
  en: {
    platformDesc: {
      linux: "Portable AppImage for 64-bit Linux.",
      windows: "Installer (.exe) for 64-bit Windows 10/11.",
      macos: "Disk image (.dmg) for Apple Silicon (M-series).",
    },
    buttonLabel: {
      linux: "Download .AppImage",
      windows: "Download .exe",
      macos: "Download .dmg",
    },
    thanks: "Thanks for choosing Tabula Rasa!",
    donate: "Donate ❤️",
    errorMsg:
      "Couldn't reach the release manifest right now. Try the full download page instead.",
    goToSite: "Go to tabularasa.cl",
  },
  es: {
    platformDesc: {
      linux: "AppImage portátil para Linux de 64 bits.",
      windows: "Instalador (.exe) para Windows 10/11 de 64 bits.",
      macos: "Imagen de disco (.dmg) para Apple Silicon (serie M).",
    },
    buttonLabel: {
      linux: "Descargar .AppImage",
      windows: "Descargar .exe",
      macos: "Descargar .dmg",
    },
    thanks: "¡Gracias por elegir Tabula Rasa!",
    donate: "Donar ❤️",
    errorMsg:
      "No se pudo contactar el manifiesto de la versión. Prueba la página de descargas completa.",
    goToSite: "Ir a tabularasa.cl",
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanSize(bytes) {
  if (!bytes && bytes !== 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return (i === 0 ? n : n.toFixed(1)) + " " + units[i];
}

// `?lang=` (set by downloads.js from the visitor's active site locale) wins
// over Accept-Language, since it reflects an explicit toggle rather than a
// guess - Accept-Language is only the fallback for a raw shared link.
function detectLang(url, request) {
  const q = url.searchParams.get("lang");
  if (q === "es" || q === "en") return q;
  const accept = request.headers.get("Accept-Language") || "";
  return /^\s*es/i.test(accept) ? "es" : "en";
}

function titleFor(lang, platformName, version) {
  if (lang === "es") {
    return version
      ? `Descarga Tabula Rasa v${escapeHtml(version)} para ${platformName}`
      : `Descarga Tabula Rasa para ${platformName}`;
  }
  return version
    ? `Download Tabula Rasa v${escapeHtml(version)} for ${platformName}`
    : `Download Tabula Rasa for ${platformName}`;
}

// Renders the click-through landing page. No og:image is set - matches
// index.html's own convention (docs/decisions/copy.md: "none set" rather
// than a placeholder) since no asset for one exists yet.
function renderPage({ platform, version, installerUrl, size, failed, lang }) {
  const platformName = PLATFORM_NAMES[platform];
  const c = COPY[lang];
  const title = titleFor(lang, platformName, version);
  const description = c.platformDesc[platform];
  const pageUrl = `https://downloads.tabularasa.cl/latest/${platform}`;

  // The visible button also carries `download` (same-origin as the R2
  // release file, so the browser honors it) - a hidden twin auto-clicks on
  // load so the file starts saving without waiting for a tap, per the
  // "always opens a landing page that auto-downloads" design.
  const body = failed
    ? `<p class="tr-error">${escapeHtml(c.errorMsg)}</p>
       <a class="tr-btn" href="https://tabularasa.cl/#download">${escapeHtml(c.goToSite)}</a>`
    : `<a id="tr-auto-dl" href="${escapeHtml(installerUrl)}" download style="display:none" aria-hidden="true"></a>
       <a class="tr-btn" href="${escapeHtml(installerUrl)}" download>${escapeHtml(c.buttonLabel[platform])}</a>
       <p class="tr-meta">v${escapeHtml(version)}${size ? " &middot; " + escapeHtml(size) : ""}</p>
       <p class="tr-thanks">${escapeHtml(c.thanks)}</p>
       <a class="tr-donate" href="https://tabularasa.cl/donations.html">${escapeHtml(c.donate)}</a>`;

  const autoDownloadScript = failed
    ? ""
    : `<script>document.getElementById("tr-auto-dl").click();</script>`;

  return `<!doctype html>
<html lang="${lang}" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta name="twitter:card" content="summary" />
<link rel="canonical" href="${pageUrl}" />
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px; text-align: center;
    background: #1c1d1a; color: #e6e6df;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    padding: 24px;
  }
  h1 { font-size: 1.4rem; font-weight: 600; margin: 0; max-width: 40ch; }
  p { margin: 0; color: #8b8d83; }
  .tr-btn {
    display: inline-block; padding: 12px 28px; border-radius: 7px;
    background: #66d9ef; color: #1c1d1a; font-weight: 600; text-decoration: none;
  }
  .tr-btn:hover { opacity: 0.9; }
  .tr-error { color: #f9685f; max-width: 40ch; }
  .tr-thanks { color: #e6e6df; margin-top: 4px; }
  .tr-donate { color: #66d9ef; font-weight: 600; text-decoration: none; }
  .tr-donate:hover { text-decoration: underline; }
</style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
  ${autoDownloadScript}
</body>
</html>`;
}

async function handleLatest(platform, lang) {
  const triple = TARGET_BY_PLATFORM[platform];
  if (!triple) return new Response("Not found", { status: 404 });

  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error("manifest fetch failed: " + res.status);
    const manifest = await res.json();
    const entry = manifest.targets && manifest.targets[triple];
    if (!entry || !entry.installer || !entry.installer.url) {
      throw new Error("no installer entry for " + triple);
    }
    const html = renderPage({
      platform,
      version: manifest.version,
      installerUrl: entry.installer.url,
      size: humanSize(entry.installer.size),
      lang,
    });
    return new Response(html, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (err) {
    const html = renderPage({ platform, failed: true, lang });
    return new Response(html, {
      status: 502,
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.hostname === "downloads.tabularasa.cl" &&
      url.pathname.startsWith("/latest/")
    ) {
      const platform = url.pathname.slice("/latest/".length).replace(/\/+$/, "");
      return handleLatest(platform, detectLang(url, request));
    }
    return env.ASSETS.fetch(request);
  },
};
