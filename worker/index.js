// One server-side route on top of the static site: a click-through OG-tagged
// landing page at downloads.tabularasa.cl/latest/<platform>. Everything else
// falls through to env.ASSETS.fetch(). See docs/decisions/download-redirect.md.

const MANIFEST_URL = "https://downloads.tabularasa.cl/releases/manifest.json";

// Keep in sync with TARGET_BY_PLATFORM in site/assets/js/downloads.js.
const TARGET_BY_PLATFORM = {
  linux: "x86_64-unknown-linux-gnu",
  windows: "x86_64-pc-windows-msvc",
  macos: "aarch64-apple-darwin",
};

const PLATFORM_NAMES = { linux: "Linux", windows: "Windows", macos: "macOS" };

// Paraphrased from the `download.*` English strings in
// site/assets/i18n/en.json (see docs/decisions/copy.md's sourcing rule) -
// re-check there if that copy changes.
const PLATFORM_DESC = {
  linux: "Portable AppImage for 64-bit Linux.",
  windows: "Installer (.exe) for 64-bit Windows 10/11.",
  macos: "Disk image (.dmg) for Apple Silicon (M-series).",
};

const BUTTON_LABEL = {
  linux: "Download .AppImage",
  windows: "Download .exe",
  macos: "Download .dmg",
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

// Renders the click-through landing page. No og:image is set - matches
// index.html's own convention (docs/decisions/copy.md: "none set" rather
// than a placeholder) since no asset for one exists yet.
function renderPage({ platform, version, installerUrl, size, failed }) {
  const platformName = PLATFORM_NAMES[platform];
  const title = version
    ? `Download Tabula Rasa v${escapeHtml(version)} for ${platformName}`
    : `Download Tabula Rasa for ${platformName}`;
  const description = PLATFORM_DESC[platform];
  const pageUrl = `https://downloads.tabularasa.cl/latest/${platform}`;

  const body = failed
    ? `<p class="tr-error">Couldn't reach the release manifest right now. Try the full download page instead.</p>
       <a class="tr-btn" href="https://tabularasa.cl/#download">Go to tabularasa.cl</a>`
    : `<a class="tr-btn" href="${escapeHtml(installerUrl)}">${escapeHtml(BUTTON_LABEL[platform])}</a>
       <p class="tr-meta">v${escapeHtml(version)}${size ? " &middot; " + escapeHtml(size) : ""}</p>`;

  return `<!doctype html>
<html lang="en" data-theme="dark">
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
</style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

async function handleLatest(platform) {
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
    });
    return new Response(html, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (err) {
    const html = renderPage({ platform, failed: true });
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
      return handleLatest(platform);
    }
    return env.ASSETS.fetch(request);
  },
};
