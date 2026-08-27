// One server-side route on top of the static site: a click-through OG-tagged
// landing page at downloads.tabularasa.cl/latest/<platform>, and the
// canonical destination for every download click on the site (not just a
// CORS-failure fallback). Reuses the real site chrome (tokens.css/
// styles.css, header/footer, ambient-grid, i18n.js/theme.js/nav.js) via the
// same env.ASSETS binding tabularasa.cl uses - see docs/decisions/
// download-redirect.md for why that works and the root-relative-path
// gotcha it requires. Everything else falls through to env.ASSETS.fetch().

const MANIFEST_URL = "https://downloads.tabularasa.cl/releases/manifest.json";
const SITE_URL = "https://tabularasa.cl";

// Keep in sync with TARGET_BY_PLATFORM in site/assets/js/downloads.js.
const TARGET_BY_PLATFORM = {
  linux: "x86_64-unknown-linux-gnu",
  windows: "x86_64-pc-windows-msvc",
  macos: "aarch64-apple-darwin",
};

// Proper nouns - same in both locales, not part of COPY below.
const PLATFORM_NAMES = { linux: "Linux", windows: "Windows", macos: "macOS" };

// Per-platform data-i18n key, so the visible text is backed by the real
// dictionaries (site/assets/i18n/{en,es}.json) once i18n.js hydrates it -
// these values here are only the pre-hydration/no-JS seed and MUST match
// those keys' current strings exactly (paraphrase rule: docs/decisions/copy.md).
const DESC_I18N_KEY = {
  linux: "download.linux.desc",
  windows: "download.windows.desc",
  macos: "download.macos.desc",
};
const BUTTON_I18N_KEY = {
  linux: "download.btn_appimage",
  windows: "download.btn_exe",
  macos: "download.btn_dmg",
};

// Hand-duplicated EN/ES seed copy - this page has no runtime access to
// en.json/es.json (rendered at the edge, not in the browser). platformDesc/
// buttonLabel/thanks/donate all mirror a real i18n key (noted per field) and
// get a matching `data-i18n` attribute in the markup, so once i18n.js loads
// they're confirmed correct (or corrected) instead of silently drifting.
// errorMsg/goToSite have no i18n-key counterpart - this page's error state
// intentionally stays server-only, there's no download to hand off to JS.
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
    thanks: "Thanks for choosing Tabula Rasa!", // mirrors download.thanks
    donate: "Donate ❤️", // mirrors pricing.cta_donate
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
// i18n.js reads the same `?lang=` param (see its detectLocale()), so the
// hand-rendered bits below and the i18n.js-hydrated header/footer agree.
function detectLang(url, request) {
  const q = url.searchParams.get("lang");
  if (q === "es" || q === "en") return q;
  const accept = request.headers.get("Accept-Language") || "";
  return /^\s*es/i.test(accept) ? "es" : "en";
}

// `?theme=` (also set by downloads.js) lets the anti-flash script below
// match the visitor's theme on tabularasa.cl - localStorage can't cross
// origins, so without this the OS preference would be the only signal.
function detectThemeAttr(url) {
  const q = url.searchParams.get("theme");
  return q === "dark" || q === "light" ? `"${q}"` : "null";
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

// Prevent dark/light flash before CSS+JS load - same convention as
// index.html's inline script (docs/decisions/theming.md), plus a `?theme=`
// override (see detectThemeAttr) since this origin has no access to
// tabularasa.cl's localStorage. Keep in sync with assets/js/theme.js AND
// index.html's copy if the underlying logic (not just the extra param) ever
// changes.
function antiFlashScript(themeAttrLiteral) {
  return `<script>
(function () {
  var fromQuery = ${themeAttrLiteral};
  var stored = localStorage.getItem("theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = fromQuery || stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();
</script>`;
}

const AMBIENT_GRID_HTML = `<div class="ambient-grid" aria-hidden="true">
  <div class="ambient-grid-panel is-left">
    <div class="ambient-grid-pattern"></div>
    <div class="ambient-grid-glow"></div>
  </div>
  <div class="ambient-grid-panel is-right">
    <div class="ambient-grid-pattern"></div>
    <div class="ambient-grid-glow"></div>
  </div>
</div>`;

const SKIP_LINK_HTML = `<a class="skip-link" href="#main" data-i18n="skip_link">Skip to content</a>`;

// Hand-copied from index.html's <header>/<nav class="mobile-nav">, with the
// in-page anchors/pricing.html link rewritten to absolute tabularasa.cl URLs
// - this page has none of those sections itself. Text stays the hardcoded
// English + data-i18n attribute pattern verbatim; i18n.js hydrates it
// exactly like on every other page.
const HEADER_HTML = `<header class="site-header" id="site-header">
  <div class="container">
    <a class="brand" href="${SITE_URL}/#top">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">Tabula Rasa</span>
    </a>
    <nav class="main-nav" aria-label="Primary">
      <a href="${SITE_URL}/#features" data-i18n="nav.features">Features</a>
      <a href="${SITE_URL}/#showcase" data-i18n="nav.showcase">Demo</a>
      <a href="${SITE_URL}/pricing.html" class="nav-pricing" data-i18n="nav.pricing">Pricing</a>
    </nav>
    <div class="header-actions">
      <button class="lang-toggle" id="lang-toggle" type="button" data-i18n-attr="aria-label:lang_toggle.aria_label" aria-label="Switch language">ES</button>
      <button class="theme-toggle" id="theme-toggle" type="button" data-i18n-attr="aria-label:theme_toggle.aria_label" aria-label="Toggle theme">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
        </svg>
      </button>
      <a class="btn btn-primary btn-sm nav-download-desktop" href="${SITE_URL}/#download" data-i18n="header.download_btn">Download</a>
      <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" data-i18n-attr="aria-label:nav_toggle.aria_label" aria-label="Menu">
        <svg class="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
  <div class="container">
    <a href="${SITE_URL}/#features" data-i18n="nav.features">Features</a>
    <a href="${SITE_URL}/#showcase" data-i18n="nav.showcase">Demo</a>
    <a class="btn btn-primary" href="${SITE_URL}/#download" data-i18n="header.download_btn">Download</a>
  </div>
</nav>`;

// Hand-copied from index.html's <footer>, same absolute-URL rewrite as the
// header above. External links (benjaopazoc.cl, GitHub) are untouched.
const FOOTER_HTML = `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <span class="brand-mark" aria-hidden="true"></span>
          Tabula Rasa
        </div>
        <p class="footer-tagline" data-i18n="footer.tagline">A blank slate for your data.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4 data-i18n="footer.col_product">Product</h4>
          <ul>
            <li><a href="${SITE_URL}/#features" data-i18n="footer.link_features">Features</a></li>
            <li><a href="${SITE_URL}/#showcase" data-i18n="footer.link_showcase">Showcase</a></li>
            <li><a href="${SITE_URL}/#download" data-i18n="footer.link_download">Download</a></li>
            <li><a href="${SITE_URL}/pricing.html" data-i18n="footer.link_pricing">Pricing</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer.col_support">Support</h4>
          <ul>
            <li>
              <span class="footer-stub" data-i18n-attr="title:footer.eula_tooltip" title="Not drafted yet - pending legal review before the paid tier ships">
                <span data-i18n="footer.eula_label">License / EULA</span>
                <span class="footer-stub-tag" data-i18n="footer.eula_tag">Coming soon</span>
              </span>
            </li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer.col_author">More from the author</h4>
          <ul>
            <li><a href="https://benjaopazoc.cl" target="_blank" rel="noopener">benjaopazoc.cl</a></li>
            <li><a href="https://github.com/benja-opazo/kimu" target="_blank" rel="noopener">Kimu</a></li>
            <li><a href="https://github.com/benja-opazo/home-assistant-hand-recognition" target="_blank" rel="noopener">HASS Hand Recognition</a></li>
            <li><a href="https://github.com/benja-opazo/dns-cloudflare-mpy" target="_blank" rel="noopener">DNS Cloudflare mPy</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>
        <span data-i18n-html="footer.copyright_prefix">&copy;</span>
        <span id="footer-year">2026</span>
        <span data-i18n="footer.copyright_suffix">Benjamín Opazo. All rights reserved.</span>
      </span>
      <a href="https://benjaopazoc.cl" target="_blank" rel="noopener" data-i18n="footer.built_by">Built by benjaopazoc.cl</a>
    </div>
  </div>
</footer>`;

// Same scripts index.html loads, minus demo-table.js/downloads.js/
// feature-cards.js - nothing on this page needs the demo grid, the download
// cards, or the feature-card flip/modal behavior.
const SCRIPTS_HTML = `<script src="/assets/js/i18n.js"></script>
<script src="/assets/js/theme.js"></script>
<script src="/assets/js/nav.js"></script>
<script src="/assets/js/ambient-grid.js"></script>
<script>
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  window.addEventListener("scroll", function () {
    document.getElementById("site-header").classList.toggle("is-scrolled", window.scrollY > 4);
  });
</script>`;

// Renders the click-through landing page. No og:image is set - matches
// index.html's own convention (docs/decisions/copy.md: "none set" rather
// than a placeholder) since no asset for one exists yet.
function renderPage({ platform, version, installerUrl, size, failed, lang, themeAttrLiteral }) {
  const platformName = PLATFORM_NAMES[platform];
  const c = COPY[lang];
  const title = titleFor(lang, platformName, version);
  const description = c.platformDesc[platform];
  const pageUrl = `https://downloads.tabularasa.cl/latest/${platform}`;

  // The visible button also carries `download` (same-origin as the R2
  // release file, so the browser honors it) - a hidden twin auto-clicks on
  // load so the file starts saving without waiting for a tap.
  const main = failed
    ? `<section class="hero container" id="top">
         <p class="tr-error">${escapeHtml(c.errorMsg)}</p>
         <a class="btn btn-primary" href="${SITE_URL}/#download">${escapeHtml(c.goToSite)}</a>
       </section>`
    : `<section class="hero container" id="top">
         <h1>${title}</h1>
         <p class="hero-sub" data-i18n="${DESC_I18N_KEY[platform]}">${escapeHtml(description)}</p>
         <a id="tr-auto-dl" href="${escapeHtml(installerUrl)}" download style="display:none" aria-hidden="true"></a>
         <div class="hero-ctas">
           <div class="hero-cta-row">
             <a class="btn btn-primary" href="${escapeHtml(installerUrl)}" download data-i18n="${BUTTON_I18N_KEY[platform]}">${escapeHtml(c.buttonLabel[platform])}</a>
           </div>
           <p class="hero-meta">v${escapeHtml(version)}${size ? " &middot; " + escapeHtml(size) : ""}</p>
         </div>
         <p class="pricing-donate-standalone">
           <span data-i18n="download.thanks">${escapeHtml(c.thanks)}</span>
           <a class="donate-link" href="${SITE_URL}/donations.html" data-i18n="pricing.cta_donate">${escapeHtml(c.donate)}</a>
         </p>
       </section>`;

  const autoDownloadScript = failed
    ? ""
    : `<script>document.getElementById("tr-auto-dl").click();</script>`;

  return `<!doctype html>
<html lang="${lang}">
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
${antiFlashScript(themeAttrLiteral)}
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
<link rel="stylesheet" href="/assets/css/tokens.css" />
<link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
${AMBIENT_GRID_HTML}
${SKIP_LINK_HTML}
${HEADER_HTML}
<main id="main">
${main}
</main>
${FOOTER_HTML}
${SCRIPTS_HTML}
${autoDownloadScript}
</body>
</html>`;
}

async function handleLatest(platform, lang, themeAttrLiteral) {
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
      themeAttrLiteral,
    });
    return new Response(html, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (err) {
    const html = renderPage({ platform, failed: true, lang, themeAttrLiteral });
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
      return handleLatest(platform, detectLang(url, request), detectThemeAttr(url));
    }
    return env.ASSETS.fetch(request);
  },
};
