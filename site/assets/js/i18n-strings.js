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
      "Tabula Rasa is a fast, cross-platform tabular viewer and editor written in Rust. Instantly opens massive files and it's free to use.",
    "meta.og_title": "Tabula Rasa: a blank slate for your data",
    "meta.og_description":
      "A fast, cross-platform tabular viewer/editor. Instantly opens massive files and it's free to use.",

    skip_link: "Skip to content",
    "nav.features": "Features",
    "nav.showcase": "Demo",
    "nav.pricing": "Pricing",
    "theme_toggle.aria_label": "Toggle theme",
    "lang_toggle.aria_label": "Switch language",
    "header.download_btn": "Download",

    "hero.title_html":
      'A blank slate<br />for your <span class="accent-text">data</span>.',
    "hero.subtitle":
      "Tabula Rasa is a fast, cross-platform tabular viewer and editor. It's ridiculously fast, free to use, and so good that it disappears between your fingers!",
    "hero.cta_download_default": "Download for your platform",
    "hero.cta_showcase": "Demo",
    "hero.meta": "Linux &middot; Windows &middot; macOS (Apple Silicon)",

    "showcase.eyebrow": "Try the demo here",
    "showcase.title":
      'Check the interface and marvel at the real <span class="accent-text">Tabula Rasa</span> experience.',
    "showcase.desc":
      'This is the app. <a href="#download" class="accent-text">Download it</a> to get the full feature set.',
    "showcase.noscript":
      "This interactive preview needs JavaScript. Download the app below.",
    "showcase.aria_label": "Interactive Tabula Rasa demo",

    "features.eyebrow": "Features",
    "features.title":
      'Built for people who live submerged in <span class="accent-text">data</span>.',
    "features.desc":
      "Tabula Rasa will disappear between your fingers:",
    "features.card1.title": "Instantly open gigantic files",
    "features.card1.desc":
      'Load multi-GB files in the blink of an eye: the UI <span class="accent-text">will never freeze</span>, no matter how big your file is.',
    "features.card2.title": "Stacked sort, filters or groups",
    "features.card2.desc":
      "Your data can be manipulated however you want: apply multiple filters, group rows, and sort them in a stacked fashion.",
    "features.card3.title": "Instant search",
    "features.card3.desc":
      'You search, the app handles the rest: you will find everything you need in a <span class="accent-text">flash</span>.',
    "features.card4.title": "Column control",
    "features.card4.desc":
      "Easily show and hide columns, reorder them, and use our smart column wrapping: don't settle for the walls of text of other apps.",
    "features.card5.title": "Much more than just CSV",
    "features.card5.desc":
      "The tabular viewer is so powerful that it will gracefully handle any tabular data: databases, Parquet, JSON, and more.",
    "status.shipped": "Shipped",
    "status.roadmap": "Roadmap",
    "features.play_aria": "Watch demo",
    "features.modal_close_aria": "Close",
    "features.demo_coming_soon": "Demo coming soon",

    "trust.eyebrow": "Trust Tabula Rasa",
    "trust.title":
      '<span class="accent-text">Three</span> guarantees that never bend.',
    "trust.card1.title": "Snappy",
    "trust.card1.desc":
      "Every feature is designed to be fast and responsive. Even updates are instant!",
    "trust.card2.title": "No surprises",
    "trust.card2.desc":
      "The interface is always intuitive, you click on something, and it does what you expect.",
    "trust.card3.title":
      'No <a href="https://en.wikipedia.org/wiki/Enshittification" target="_blank" rel="noopener" class="accent-text"><i>Enshittification</i></a>',
    "trust.card3.desc":
      "The user is at the center of the experience: to be honest, I hate having to fight against an app to get it to do what you want, because some techno fascist corporation wants to squeeze the last penny out of you.",

    "download.eyebrow": "Get Tabula Rasa",
    "download.title_html":
      '<span class="accent-text">Free</span> to use*, on every desktop platform.',
    "download.desc":
      "*For personal use, not for commercial purposes. A donation is always welcome ❤️",
    "download.linux.desc": "Portable AppImage for 64-bit Linux.",
    "download.windows.desc": "Installer (.exe) for 64-bit Windows 10/11.",
    "download.macos.desc": "Disk image (.dmg) for Apple Silicon (M-series).",
    "download.btn_appimage": "Download .AppImage",
    "download.btn_exe": "Download .exe",
    "download.btn_dmg": "Download .dmg",
    "download.note_fetching": "Fetching the latest release…",
    "download.note_latest":
      "Latest release: v{version} · SHA-256 checksums ship alongside every download.",
    "download.cta_for_platform": "Download for {platform}",

    "pricing.meta.title": "Tabula Rasa — Pricing",
    "pricing.meta.description":
      "Free for personal use, same full feature set for enterprise. See the comparison and get in touch.",
    "pricing.eyebrow": "Pricing",
    "pricing.title_html":
      'One app, <span class="accent-text">zero</span> feature gates.',
    "pricing.subtitle":
      "Personal or enterprise, you get the exact same app. The only thing that changes is how you're allowed to use it.",
    "pricing.personal.title": "Personal",
    "pricing.personal.price": "Free",
    "pricing.personal.tagline":
      "For your own machine, your own data, your own rules.",
    "pricing.personal.highlight1": "Every feature, no restrictions",
    "pricing.personal.highlight2": "Personal, non-commercial license",
    "pricing.personal.highlight3":
      "No subscription - one-time optional donation",
    "pricing.enterprise.title": "Enterprise",
    "pricing.enterprise.price": "Contact us",
    "pricing.enterprise.tagline": "Using it across a company? Let's talk.",
    "pricing.enterprise.highlight1": "Every feature, no restrictions",
    "pricing.enterprise.highlight2": "Commercial-use license",
    "pricing.enterprise.highlight3": "Direct support and custom terms",
    "pricing.table.feature_col": "What you get",
    "pricing.table.license_row": "License",
    "pricing.personal.license_value": "Personal use",
    "pricing.enterprise.license_value": "Commercial use",
    "pricing.included": "Included",
    "pricing.cta_download": "Download",
    "pricing.cta_donate": "Donate ❤️",
    "pricing.cta_contact": "Contact for pricing",

    "footer.tagline": "A blank slate for your data.",
    "footer.col_product": "Product",
    "footer.col_support": "Support",
    "footer.col_author": "More from the author",
    "footer.link_features": "Features",
    "footer.link_showcase": "Showcase",
    "footer.link_download": "Download",
    "footer.link_pricing": "Pricing",
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
      "Tabula Rasa es un visor y editor tabular rápido y multiplataforma escrito en Rust. Abre al instante archivos gigantes y es gratis.",
    "meta.og_title": "Tabula Rasa: una hoja en blanco para tus datos",
    "meta.og_description":
      "Un visor/editor tabular rápido y multiplataforma. Abre al instante archivos gigantes y es gratis.",

    skip_link: "Saltar al contenido",
    "nav.features": "Funcionalidades",
    "nav.showcase": "Demo",
    "nav.pricing": "Precios",
    "theme_toggle.aria_label": "Cambiar tema",
    "lang_toggle.aria_label": "Cambiar idioma",
    "header.download_btn": "Descargar",

    "hero.title_html":
      'Una hoja en blanco<br />para tus <span class="accent-text">datos</span>.',
    "hero.subtitle":
      "Tabula Rasa es un visor y editor tabular rápido y multiplataforma. Es ridículamente rápido, gratis, y es tan bueno ¡que desaparece de entre tus dedos!",
    "hero.cta_download_default": "Descarga para tu plataforma",
    "hero.cta_showcase": "Demo",
    "hero.meta": "Linux &middot; Windows &middot; macOS (Apple Silicon)",

    "showcase.eyebrow": "Prueba el demo aquí",
    "showcase.title":
      'Revisa la interfaz y maravíllate con la verdadera experiencia <span class="accent-text">Tabula Rasa</span>.',
    "showcase.desc":
      'Así es la app. <a href="#download" class="accent-text">Descárgala</a> para acceder a todas las funciones.',
    "showcase.noscript":
      "Esta vista previa interactiva necesita JavaScript. Descarga la app más abajo.",
    "showcase.aria_label":
      "Demo interactiva de Tabula Rasa.",

    "features.eyebrow": "Funcionalidades",
    "features.title":
      'Hecho para quienes viven sumergidos en <span class="accent-text">datos</span>.',
    "features.desc":
      "Tabula Rasa va a desaparecer entre tus dedos:",
    "features.card1.title": "Abre instantáneamente archivos gigantescos",
    "features.card1.desc":
      'Carga archivos de varios GB en un parpadeo: la interfaz <span class="accent-text">nunca se queda pegada</span>, sin importar el tamaño de tu archivo.',
    "features.card2.title": "Orden, filtros y agrupaciones acumulables",
    "features.card2.desc":
      "Los datos se pueden manipular como quieras: aplica filtros múltiples, agrupa filas y ordénalas de forma apilada.",
    "features.card3.title": "Búsqueda instantánea",
    "features.card3.desc":
      'Tú buscas, la app se encarga del resto: encontrarás todo lo que necesitas en un <span class="accent-text">santiamén</span>.',
    "features.card4.title": "Control de columnas",
    "features.card4.desc":
      "Muestra y oculta columnas fácilmente, reordénalas, y usa nuestro ajuste de columna inteligente: no te conformes con las murallas de texto de otras apps.",
    "features.card5.title": "Mucho más que sólo CSV",
    "features.card5.desc":
      "El visor tabular es tan potente que maneja con elegancia cualquier dato tabular: bases de datos, Parquet, JSON y más.",
    "status.shipped": "Disponible",
    "status.roadmap": "En desarrollo",
    "features.play_aria": "Ver demo",
    "features.modal_close_aria": "Cerrar",
    "features.demo_coming_soon": "Demo próximamente",

    "trust.eyebrow": "Confía en Tabula Rasa",
    "trust.title":
      'Nuestros <span class="accent-text">tres</span> sellos de garantía',
    "trust.card1.title": "Respuesta inmediata",
    "trust.card1.desc":
      "Cada función está diseñada para ser rápida y responsiva. ¡Hasta las actualizaciones son instantáneas!",
    "trust.card2.title": "Sin sorpresas",
    "trust.card2.desc":
      "La interfaz siempre es intuitiva: haces clic en algo, y hace lo que esperas.",
    "trust.card3.title":
      'Sin <a href="https://es.wikipedia.org/wiki/Decadencia_de_plataformas" target="_blank" rel="noopener" class="accent-text"><i>Enshittification</i></a>',
    "trust.card3.desc":
      "El usuario está en el centro de la experiencia: para serle honesto, odio cuando hay que pelear contra la aplicación para que haga lo que quieres porque alguna corporación tecnofascista busca sacarte hasta el último peso.",

    "download.eyebrow": "Consigue Tabula Rasa",
    "download.title_html":
      '<span class="accent-text">Gratis</span>*, en cada plataforma.',
    "download.desc":
      "*Para uso personal, no para fines comerciales. Una donación siempre es bienvenida ❤️",
    "download.linux.desc": "AppImage portátil para Linux de 64 bits.",
    "download.windows.desc": "Instalador (.exe) para Windows 10/11 de 64 bits.",
    "download.macos.desc": "Imagen de disco (.dmg) para Apple Silicon (serie M).",
    "download.btn_appimage": "Descargar .AppImage",
    "download.btn_exe": "Descargar .exe",
    "download.btn_dmg": "Descargar .dmg",
    "download.note_fetching": "Buscando la última versión…",
    "download.note_latest":
      "Última versión: v{version} · las sumas SHA-256 vienen incluidas con cada descarga.",
    "download.cta_for_platform": "Descarga para {platform}",

    "pricing.meta.title": "Tabula Rasa — Precios",
    "pricing.meta.description":
      "Gratis para uso personal, el mismo conjunto completo de funciones para empresas. Mira la comparación y contáctanos.",
    "pricing.eyebrow": "Precios",
    "pricing.title_html":
      'Una sola app, <span class="accent-text">cero</span> funciones bloqueadas.',
    "pricing.subtitle":
      "Personal o empresarial, obtienes exactamente la misma app. Lo único que cambia es cómo se te permite usarla.",
    "pricing.personal.title": "Personal",
    "pricing.personal.price": "Gratis",
    "pricing.personal.tagline":
      "Para tu propio equipo, tus propios datos, tus propias reglas.",
    "pricing.personal.highlight1": "Todas las funciones, sin restricciones",
    "pricing.personal.highlight2": "Licencia personal, sin uso comercial",
    "pricing.personal.highlight3":
      "Sin suscripción - donación única opcional",
    "pricing.enterprise.title": "Empresas",
    "pricing.enterprise.price": "Contáctanos",
    "pricing.enterprise.tagline": "¿La usas en toda una empresa? Hablemos.",
    "pricing.enterprise.highlight1": "Todas las funciones, sin restricciones",
    "pricing.enterprise.highlight2": "Licencia de uso comercial",
    "pricing.enterprise.highlight3":
      "Soporte directo y términos personalizados",
    "pricing.table.feature_col": "Qué obtienes",
    "pricing.table.license_row": "Licencia",
    "pricing.personal.license_value": "Uso personal",
    "pricing.enterprise.license_value": "Uso comercial",
    "pricing.included": "Incluido",
    "pricing.cta_download": "Descargar",
    "pricing.cta_donate": "Donar ❤️",
    "pricing.cta_contact": "Contactar para precios",

    "footer.tagline": "Una hoja en blanco para tus datos.",
    "footer.col_product": "Producto",
    "footer.col_support": "Soporte",
    "footer.col_author": "Más del autor",
    "footer.link_features": "Funciones",
    "footer.link_showcase": "Demo",
    "footer.link_download": "Descargar",
    "footer.link_pricing": "Precios",
    "footer.eula_label": "Licencia / EULA",
    "footer.eula_tag": "Próximamente",
    "footer.eula_tooltip":
      "Todavía no redactada - pendiente de revisión legal antes de lanzar el nivel pago",
    "footer.copyright_prefix": "&copy;",
    "footer.copyright_suffix": "Benjamín Opazo. Todos los derechos reservados.",
    "footer.built_by": "Hecho por benjaopazoc.cl",
  },
};
