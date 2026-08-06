/* ============================================================
   tabularasa.cl - i18n-strings.js

   The single source of truth for every translated string on the page.
   English (`en`) is canonical - edit it first. Spanish (`es`) is kept in
   sync via the `sync-i18n` skill (.claude/skills/sync-i18n/SKILL.md): after
   editing `en`, run that skill to translate the changed/new keys and flag
   any subtleties (idiom, brand name, ambiguous term) for a human call.

   Both locales MUST have exactly the same key set - i18n.js does not
   fall back key-by-key. See docs/decisions/i18n.md for the two-tier design
   (marketing shell is translated; the app-faithful showcase demo is not,
   same rationale as theming.md's app-faithful token isolation).
   ============================================================ */
window.TR_I18N = {
  en: {
    "meta.title": "Tabula Rasa: a blank slate for your data",
    "meta.description":
      "Tabula Rasa is a fast, cross-platform CSV viewer and editor built in Rust. Opens huge files instantly, never hangs, and feels like Sublime Text for tabular data. Free to use, for Linux, Windows and macOS.",
    "meta.og_title": "Tabula Rasa - a blank slate for your data",
    "meta.og_description":
      "A fast, cross-platform CSV viewer/editor. Opens huge files instantly and never hangs. Free to use.",

    skip_link: "Skip to content",
    "nav.features": "Features",
    "nav.showcase": "See it in action",
    "nav.download": "Download",
    "theme_toggle.aria_label": "Toggle dark / light theme",
    "lang_toggle.aria_label": "Switch language",
    "header.download_btn": "Download",

    "hero.title_html":
      'A blank slate<br />for your <span class="accent-text">data</span>.',
    "hero.subtitle":
      "Tabula Rasa is a fast, cross-platform CSV viewer and editor. It opens huge files instantly, never hangs on bad data, and feels like a tool you keep open all day - closer to Sublime Text than to a spreadsheet.",
    "hero.cta_download_default": "Download for your platform",
    "hero.cta_showcase": "See it in action",
    "hero.meta":
      "Linux &middot; Windows &middot; macOS (Apple Silicon) - no account required.",

    "showcase.eyebrow": "Try it here",
    "showcase.title":
      "This is the real interface - hardcoded, but interactive.",
    "showcase.desc":
      "Same pixels as the app, frozen sample data - sort, group, filter, or search below.",
    "showcase.noscript":
      "This interactive preview needs JavaScript. Download the real app below - it needs no JavaScript at all.",
    "showcase.aria_label":
      "Interactive Tabula Rasa demo - hardcoded sample data",

    "features.eyebrow": "Under the hood",
    "features.title": "Built for people who live in tabular data.",
    "features.desc":
      "Every feature above is real - here's the fuller list, and what's still on the way.",
    "features.card1.title": "Huge files, instantly",
    "features.card1.desc":
      "Multi-gigabyte CSVs load in the background - the UI never hangs while a big file opens, and you get a first paint immediately.",
    "features.card2.title": "Filter, sort, group by",
    "features.card2.desc":
      "Click a header to sort, stack multiple keys, group rows into collapsible bands, and build filters - all reflected as removable rule pills in the status bar.",
    "features.card3.title": "Instant search",
    "features.card3.desc":
      "A find bar highlights every match live across the whole file, with a density rail showing where matches cluster, without ever filtering rows out.",
    "features.card4.title": "Column control",
    "features.card4.desc":
      "Show/hide columns, auto-fit or fix widths, wrap text, freeze panes - the grid adapts to the shape of your data, not the other way around.",
    "features.card5.title": "Beyond CSV",
    "features.card5.desc":
      "Built as a semi-universal tabular viewer from day one - Parquet, JSON and more are the natural next formats, not a rewrite.",
    "status.shipped": "Shipped",
    "status.roadmap": "Roadmap",

    "trust.eyebrow": "You can trust it with your data",
    "trust.title": "Three guarantees that never bend.",
    "trust.card1.title": "What you see is real",
    "trust.card1.desc":
      "The app never silently shows coerced, truncated, or placeholder values as if they were your file's actual content. If something can't be parsed, you're told.",
    "trust.card2.title": "No surprise data loss",
    "trust.card2.desc":
      "If a file loaded in a lossy way, saving is guarded and you're clearly warned before anything is overwritten.",
    "trust.card3.title": "Corrupt data can't hang it",
    "trust.card3.desc":
      "Bad input may mean a failed or partial load - it never freezes or blocks the interface while you figure out why.",

    "download.eyebrow": "Get Tabula Rasa",
    "download.title": "Free to use, on every desktop platform.",
    "download.desc":
      "No account, no trial timer. An occasional, easily-dismissable nag is the only thing a one-time lifetime pass ever removes - that's the whole monetization model.",
    "download.linux.desc":
      "AppImage - runs on any modern distro, no installation required.",
    "download.windows.desc": "Installer (.exe) for 64-bit Windows 10/11.",
    "download.macos.desc": "Disk image (.dmg) - Apple Silicon (M-series).",
    "download.btn_appimage": "Download .AppImage",
    "download.btn_exe": "Download .exe",
    "download.btn_dmg": "Download .dmg",
    "download.note_fetching": "Fetching the latest release…",
    "download.note_no_fetch":
      "this browser can't check for the newest version automatically",
    "download.note_fetch_failed": "couldn't reach the release server just now",
    "download.note_fallback":
      "Showing the standard download links - {reason}. They still point to the latest release.",
    "download.note_latest":
      "Latest release: v{version} · SHA-256 checksums ship alongside every download.",
    "download.cta_for_platform": "Download for {platform}",

    "footer.tagline": "A blank slate for your data.",
    "footer.col_product": "Product",
    "footer.col_support": "Support",
    "footer.col_author": "More from the author",
    "footer.link_features": "Features",
    "footer.link_showcase": "Showcase",
    "footer.link_download": "Download",
    "footer.eula_label": "License / EULA",
    "footer.eula_tag": "Coming soon",
    "footer.eula_tooltip":
      "Not drafted yet - pending legal review before the paid tier ships",
    "footer.copyright_prefix": "&copy;",
    "footer.copyright_suffix": "Benjamín Opazo. All rights reserved.",
    "footer.built_by": "Built by benjaopazoc.cl",
  },

  es: {
    "meta.title": "Tabula Rasa - una hoja en blanco para tus datos",
    "meta.description":
      "Tabula Rasa es un visor y editor de CSV rápido y multiplataforma, hecho en Rust. Abre archivos enormes al instante, nunca se cuelga, y se siente como Sublime Text para datos tabulares. Gratis, para Linux, Windows y macOS.",
    "meta.og_title": "Tabula Rasa - una hoja en blanco para tus datos",
    "meta.og_description":
      "Un visor/editor de CSV rápido y multiplataforma. Abre archivos enormes al instante y nunca se cuelga. Gratis.",

    skip_link: "Saltar al contenido",
    "nav.features": "Funciones",
    "nav.showcase": "Pruébalo en acción",
    "nav.download": "Descargar",
    "theme_toggle.aria_label": "Cambiar tema claro / oscuro",
    "lang_toggle.aria_label": "Cambiar idioma",
    "header.download_btn": "Descargar",

    "hero.title_html":
      'Una hoja en blanco<br />para tus <span class="accent-text">datos</span>.',
    "hero.subtitle":
      "Tabula Rasa es un visor y editor de CSV rápido y multiplataforma. Abre archivos enormes al instante, no se cuelga con datos corruptos, y se siente como una herramienta que dejas abierta todo el día - más cerca de Sublime Text que de una planilla de cálculo.",
    "hero.cta_download_default": "Descarga para tu plataforma",
    "hero.cta_showcase": "Pruébalo en acción",
    "hero.meta":
      "Linux &middot; Windows &middot; macOS (Apple Silicon) - sin cuenta necesaria.",

    "showcase.eyebrow": "Pruébalo aquí",
    "showcase.title":
      "Esta es la interfaz real - hardcodeada, pero interactiva.",
    "showcase.desc":
      "Los mismos píxeles que la app, con datos de muestra congelados - ordena, agrupa, filtra o busca abajo.",
    "showcase.noscript":
      "Esta vista previa interactiva necesita JavaScript. Descarga la app real más abajo - no necesita JavaScript en absoluto.",
    "showcase.aria_label":
      "Demo interactiva de Tabula Rasa - datos de muestra hardcodeados",

    "features.eyebrow": "Por dentro",
    "features.title": "Hecho para quienes viven en datos tabulares.",
    "features.desc":
      "Cada función de arriba es real - aquí está la lista completa, y lo que todavía viene en camino.",
    "features.card1.title": "Archivos enormes, al instante",
    "features.card1.desc":
      "Los CSV de varios gigabytes cargan en segundo plano - la interfaz nunca se cuelga mientras se abre un archivo grande, y ves el primer render de inmediato.",
    "features.card2.title": "Filtra, ordena, agrupa",
    "features.card2.desc":
      "Haz clic en un encabezado para ordenar, combina varias claves, agrupa filas en bandas colapsables, y arma filtros - todo reflejado como chips removibles en la barra de estado.",
    "features.card3.title": "Búsqueda instantánea",
    "features.card3.desc":
      "Una barra de búsqueda resalta cada coincidencia en vivo en todo el archivo, con un riel de densidad que muestra dónde se agrupan, sin filtrar filas nunca.",
    "features.card4.title": "Control de columnas",
    "features.card4.desc":
      "Muestra/oculta columnas, ajusta o fija anchos, envuelve texto, congela paneles - la grilla se adapta a la forma de tus datos, no al revés.",
    "features.card5.title": "Más allá de CSV",
    "features.card5.desc":
      "Construido desde el día uno como un visor tabular semi-universal - Parquet, JSON y más son los siguientes formatos naturales, no una reescritura.",
    "status.shipped": "Disponible",
    "status.roadmap": "En camino",

    "trust.eyebrow": "Puedes confiarle tus datos",
    "trust.title": "Tres garantías que nunca se doblan.",
    "trust.card1.title": "Lo que ves es real",
    "trust.card1.desc":
      "La app nunca muestra silenciosamente valores forzados, truncados o de relleno como si fueran el contenido real de tu archivo. Si algo no se puede interpretar, se te avisa.",
    "trust.card2.title": "Sin pérdida de datos sorpresa",
    "trust.card2.desc":
      "Si un archivo se cargó de forma imperfecta, guardar queda protegido y se te advierte claramente antes de sobrescribir nada.",
    "trust.card3.title": "Los datos corruptos no la cuelgan",
    "trust.card3.desc":
      "Una entrada mala puede significar una carga fallida o parcial - nunca congela ni bloquea la interfaz mientras averiguas por qué.",

    "download.eyebrow": "Consigue Tabula Rasa",
    "download.title": "Gratis, en cada plataforma de escritorio.",
    "download.desc":
      "Sin cuenta, sin cronómetro de prueba. Un aviso ocasional y fácil de cerrar es lo único que una licencia única de por vida elimina - ese es todo el modelo de monetización.",
    "download.linux.desc":
      "AppImage - funciona en cualquier distro moderna, sin instalación.",
    "download.windows.desc": "Instalador (.exe) para Windows 10/11 de 64 bits.",
    "download.macos.desc": "Imagen de disco (.dmg) - Apple Silicon (serie M).",
    "download.btn_appimage": "Descargar .AppImage",
    "download.btn_exe": "Descargar .exe",
    "download.btn_dmg": "Descargar .dmg",
    "download.note_fetching": "Buscando la última versión…",
    "download.note_no_fetch":
      "este navegador no puede revisar la versión más reciente automáticamente",
    "download.note_fetch_failed":
      "no se pudo contactar al servidor de descargas en este momento",
    "download.note_fallback":
      "Mostrando los enlaces de descarga estándar - {reason}. Igual apuntan a la última versión.",
    "download.note_latest":
      "Última versión: v{version} · las sumas SHA-256 vienen incluidas con cada descarga.",
    "download.cta_for_platform": "Descarga para {platform}",

    "footer.tagline": "Una hoja en blanco para tus datos.",
    "footer.col_product": "Producto",
    "footer.col_support": "Soporte",
    "footer.col_author": "Más del autor",
    "footer.link_features": "Funciones",
    "footer.link_showcase": "Demo",
    "footer.link_download": "Descargar",
    "footer.eula_label": "Licencia / EULA",
    "footer.eula_tag": "Próximamente",
    "footer.eula_tooltip":
      "Todavía no redactada - pendiente de revisión legal antes de lanzar el nivel pago",
    "footer.copyright_prefix": "&copy;",
    "footer.copyright_suffix": "Benjamín Opazo. Todos los derechos reservados.",
    "footer.built_by": "Hecho por benjaopazoc.cl",
  },
};
