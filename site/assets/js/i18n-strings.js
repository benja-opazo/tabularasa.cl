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
      "Tabula Rasa is a fast, cross-platform tabular viewer and editor built in Rust. Opens huge files instantly and it's free to use.",
    "meta.og_title": "Tabula Rasa: a blank slate for your data",
    "meta.og_description":
      "A fast, cross-platform tabular viewer/editor. Opens huge files instantly and it's free to use.",

    skip_link: "Skip to content",
    "nav.features": "Features",
    "nav.showcase": "See it in action",
    "theme_toggle.aria_label": "Toggle dark / light theme",
    "lang_toggle.aria_label": "Switch language",
    "header.download_btn": "Downloads",

    "hero.title_html":
      'A blank slate<br />for your <span class="accent-text">data</span>.',
    "hero.subtitle":
      "Tabula Rasa is a fast, cross-platform tabular viewer and editor. It's stupidly fast, free to use, and so good that it disappears between your fingers!",
    "hero.cta_download_default": "Download for your platform",
    "hero.cta_showcase": "See it in action",
    "hero.meta": "Linux &middot; Windows &middot; macOS (Apple Silicon)",

    "showcase.eyebrow": "Try it here",
    "showcase.title":
      'Check the interface and marvel at the real <span class="accent-text">Tabula Rasa</span> experience.',
    "showcase.desc":
      'This is how the app looks and feels, if you want the full feature set, <a href="#download" class="accent-text">Download the real app</a>.',
    "showcase.noscript":
      "This interactive preview needs JavaScript. Download the real app below - it needs no JavaScript at all.",
    "showcase.aria_label":
      "Interactive Tabula Rasa demo - hardcoded sample data",

    "features.eyebrow": "Under the hood",
    "features.title":
      'Built for people who live submerged in <span class="accent-text">data</span>.',
    "features.desc":
      "Tabula Rasa will disappear between your fingers, and these are the reasons why:",
    "features.card1.title": "Huge files, instantly",
    "features.card1.desc":
      'Load Multi GB files while you are still blinking, the UI <span class="accent-text">will never hang</span>, no matter how big or complex the file is.',
    "features.card2.title": "Stacked sort, filters or groups",
    "features.card2.desc":
      "Manipulate your data however you want, add multiple filters, group by multiple keys, sort by multiple columns, and stack them on top of each other.",
    "features.card3.title": "Instant search",
    "features.card3.desc":
      "You search, the app handles the rest: you will find everything you need instantly.",
    "features.card4.title": "Column control",
    "features.card4.desc":
      "Easily show and hide columns, order them by drag and drop, and use our smart column resizing and wrapping: don't conform with the useless walls of text of other apps.",
    "features.card5.title": "Beyond CSV",
    "features.card5.desc":
      "The tabular viewer is so powerful, that it will gracefully handle multiple data types: Live Databases, Parquet, JSON, and more.",
    "status.shipped": "Shipped",
    "status.roadmap": "Roadmap",
    "features.play_aria": "Watch demo",
    "features.modal_close_aria": "Close",
    "features.demo_coming_soon": "Demo coming soon",

    "trust.eyebrow": "You can trust it with your data",
    "trust.title":
      '<span class="accent-text">Three</span> guarantees that never bend.',
    "trust.card1.title": "Snappy",
    "trust.card1.desc":
      "Every feature is designed to be fast and responsive, so you can work with your data without any delays. Even updates are instant!",
    "trust.card2.title": "No surprises",
    "trust.card2.desc":
      "The interface is always intuitive, you click on something, and it does what you expect.",
    "trust.card3.title":
      'No <a href="https://en.wikipedia.org/wiki/Enshittification" target="_blank" rel="noopener" class="accent-text"><i>Enshittification</i></a>',
    "trust.card3.desc":
      "The user is at the center of the experience: to be honest, I hate it when you have to fight against the app to get it to do what you want, because some techno fascist corporation wants to squeeze the last penny out of you.",

    "download.eyebrow": "Get Tabula Rasa",
    "download.title": "Free to use*, on every desktop platform.",
    "download.desc":
      "*For personal use, not for commercial purposes. A donation is always appreciated ❤️",
    "download.linux.desc":
      "AppImage: runs on any modern distro, no installation required.",
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
    "meta.title": "Tabula Rasa: una hoja en blanco para tus datos",
    "meta.description":
      "Tabula Rasa es un visor y editor tabular rápido y multiplataforma, hecho en Rust. Abre archivos enormes al instante y es gratis.",
    "meta.og_title": "Tabula Rasa: una hoja en blanco para tus datos",
    "meta.og_description":
      "Un visor/editor tabular rápido y multiplataforma. Abre archivos enormes al instante y es gratis.",

    skip_link: "Saltar al contenido",
    "nav.features": "Funciones",
    "nav.showcase": "Pruébalo en acción",
    "theme_toggle.aria_label": "Cambiar tema claro / oscuro",
    "lang_toggle.aria_label": "Cambiar idioma",
    "header.download_btn": "Descargas",

    "hero.title_html":
      'Una hoja en blanco<br />para tus <span class="accent-text">datos</span>.',
    "hero.subtitle":
      "Tabula Rasa es un visor y editor tabular rápido y multiplataforma. ¡Es absurdamente rápido, gratis, y tan bueno que desaparece entre tus dedos!",
    "hero.cta_download_default": "Descarga para tu plataforma",
    "hero.cta_showcase": "Pruébalo en acción",
    "hero.meta": "Linux &middot; Windows &middot; macOS (Apple Silicon)",

    "showcase.eyebrow": "Pruébalo aquí",
    "showcase.title":
      'Revisa la interfaz y maravíllate con la verdadera experiencia <span class="accent-text">Tabula Rasa</span>.',
    "showcase.desc":
      'Así se ve y se siente la app. Si quieres el conjunto completo de funciones, <a href="#download" class="accent-text">descarga la app</a>.',
    "showcase.noscript":
      "Esta vista previa interactiva necesita JavaScript. Descarga la app real más abajo - no necesita JavaScript en absoluto.",
    "showcase.aria_label":
      "Demo interactiva de Tabula Rasa - datos de muestra hardcodeados",

    "features.eyebrow": "Por dentro",
    "features.title":
      'Hecho para quienes viven sumergidos en <span class="accent-text">datos</span>.',
    "features.desc":
      "Tabula Rasa va a desaparecer entre tus dedos, y estas son las razones:",
    "features.card1.title": "Archivos enormes, al instante",
    "features.card1.desc":
      'Carga archivos de varios GB en lo que dura un parpadeo: la interfaz <span class="accent-text">nunca se cuelga</span>, sin importar cuán grande o complejo sea el archivo.',
    "features.card2.title": "Orden, filtros y agrupaciones combinables",
    "features.card2.desc":
      "Manipula tus datos como quieras: agrega múltiples filtros, agrupa por varias claves, ordena por varias columnas, y combínalos entre sí.",
    "features.card3.title": "Búsqueda instantánea",
    "features.card3.desc":
      "Tú buscas, la app se encarga del resto: encontrarás todo lo que necesitas al instante.",
    "features.card4.title": "Control de columnas",
    "features.card4.desc":
      "Muestra y oculta columnas fácilmente, reordénalas arrastrándolas, y usa nuestro ajuste y ancho de columna inteligente: no te conformes con las inútiles paredes de texto de otras apps.",
    "features.card5.title": "Más allá de CSV",
    "features.card5.desc":
      "El visor tabular es tan potente que maneja con elegancia múltiples tipos de datos: bases de datos en vivo, Parquet, JSON y más.",
    "status.shipped": "Disponible",
    "status.roadmap": "En camino",
    "features.play_aria": "Ver demo",
    "features.modal_close_aria": "Cerrar",
    "features.demo_coming_soon": "Demo próximamente",

    "trust.eyebrow": "Puedes confiarle tus datos",
    "trust.title":
      'Nuestros <span class="accent-text">tres</span> sellos de garantía',
    "trust.card1.title": "Ágil",
    "trust.card1.desc":
      "Cada función está diseñada para ser rápida y responsiva, así trabajas con tus datos sin demoras. ¡Hasta las actualizaciones son instantáneas!",
    "trust.card2.title": "Sin sorpresas",
    "trust.card2.desc":
      "La interfaz siempre es intuitiva: haces clic en algo, y hace lo que esperas.",
    "trust.card3.title":
      'Sin <a href="https://es.wikipedia.org/wiki/Decadencia_de_plataformas" target="_blank" rel="noopener" class="accent-text"><i>Enshittification</i></a>',
    "trust.card3.desc":
      "El usuario está en el centro de la experiencia: siendo honesto, odio cuando tienes que pelear contra la aplicación para que haga lo que quieres, porque alguna corporación tecnofascista quiere sacarte hasta el último centavo.",

    "download.eyebrow": "Consigue Tabula Rasa",
    "download.title": "Gratis*, en cada plataforma de escritorio.",
    "download.desc":
      "*Para uso personal, no para fines comerciales. Una donación siempre se agradece ❤️",
    "download.linux.desc":
      "AppImage: funciona en cualquier distro moderna, sin instalación.",
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
