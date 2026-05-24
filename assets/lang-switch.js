// Language switcher for navbar EN/RU/BE links + About label localization.
//
// Site structure: parallel trees under /en/, /ru/, /be/ with mirrored
// filenames. About pages live at /en/about.html, /ru/about.html,
// /be/about.html.
//
// Two responsibilities:
//   1. Intercept clicks on EN/RU/BE links and route to the same article
//      under the target language (with 404 fallback to language home).
//   2. Localize the "About" nav item label and href based on the current
//      page's language.

(function () {
  const LANGS = ['en', 'ru', 'be'];

  // Localised About labels by current page language.
  const ABOUT_LABELS = {
    en: 'About',
    ru: 'О проекте',
    be: 'Пра праект',
  };

  // Detect current page language from URL prefix.
  function currentLang() {
    const m = window.location.pathname.match(/^\/(en|ru|be)(\/|$)/);
    return m ? m[1] : 'en';
  }

  // Match navbar links by their visible text (EN / RU / BE), case-insensitive.
  function isLangLink(a) {
    const text = (a.textContent || '').trim().toLowerCase();
    return LANGS.includes(text);
  }

  function langOf(a) {
    return (a.textContent || '').trim().toLowerCase();
  }

  // Swap the leading /xx/ segment in the current path for the target lang.
  function buildTargetUrl(targetLang) {
    const path = window.location.pathname;
    const match = path.match(/^\/(en|ru|be)(\/.*)?$/);
    if (match) {
      const rest = match[2] || '/';
      return '/' + targetLang + rest;
    }
    return '/' + targetLang + '/';
  }

  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Locate the About link in the navbar. Match by href ending in
  // /about.html or by text being one of the known About labels.
  function findAboutLink() {
    const links = document.querySelectorAll('#quarto-header a, .navbar a');
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      const text = (a.textContent || '').trim();
      if (
        /\/about(\.html)?$/.test(href) ||
        Object.values(ABOUT_LABELS).includes(text)
      ) {
        return a;
      }
    }
    return null;
  }

  // Rewrite the About link's label and href to match the current language.
  function localizeAboutLink() {
    const lang = currentLang();
    const a = findAboutLink();
    if (!a) return;
    a.textContent = ABOUT_LABELS[lang];
    a.setAttribute('href', '/' + lang + '/about.html');
  }

  function attachLangSwitchHandlers() {
    const links = document.querySelectorAll('#quarto-header a, .navbar a');
    links.forEach((a) => {
      if (!isLangLink(a)) return;
      if (a.dataset.langSwitcherAttached) return;
      a.dataset.langSwitcherAttached = '1';

      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = langOf(a);
        const candidate = buildTargetUrl(target);
        const fallback = '/' + target + '/';
        const ok = await urlExists(candidate);
        window.location.href = ok ? candidate : fallback;
      });
    });
  }

  function init() {
    localizeAboutLink();
    attachLangSwitchHandlers();
    attachThemeRepaintFix();
  }

  // Force-repaint the theme toggle icon after theme switch.
  //
  // The icon is a Bootstrap Icons SVG embedded as a data-URL background
  // on `.bi::before`. When the theme changes, the CSS rule updates, but
  // browsers (notably Chrome on mobile) sometimes don't repaint the
  // pseudo-element's background-image — leaving the old icon visible or
  // a blank space. Toggling a no-op transform on the toggle button forces
  // a repaint of its pseudo-element children.
  function attachThemeRepaintFix() {
    const observer = new MutationObserver(() => {
      const toggles = document.querySelectorAll('.quarto-color-scheme-toggle');
      toggles.forEach((t) => {
        // Trigger reflow + repaint by briefly toggling a transform.
        t.style.transform = 'translateZ(0)';
        // Read offsetHeight to force layout, then clear in next frame.
        void t.offsetHeight;
        requestAnimationFrame(() => {
          t.style.transform = '';
        });
      });
    });

    // Quarto toggles theme by changing classes on <body> (quarto-light /
    // quarto-dark) and data-bs-theme on <html>. Watch both.
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme', 'class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
