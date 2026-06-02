// Language switcher for navbar EN/RU/BE links + About label localization.
//
// Site structure: parallel trees under /en/, /ru/, /be/ with mirrored
// filenames. About pages live at /en/about.html, /ru/about.html,
// /be/about.html.
//
// Responsibilities:
//   1. Intercept clicks on EN/RU/BE links and route to the same article
//      under the target language (with 404 fallback to language home).
//   2. Localize the "About" nav item label and href based on the current
//      page's language.
//   3. Decorate the EN/RU/BE links as a distinct cluster: tag them for
//      CSS, mark the current language active, and insert a separator
//      before the first language link (vertical rule on desktop, full
//      width divider above the language row on mobile).

(function () {
  const LANGS = ['en', 'ru', 'be'];

  // Localised navbar labels by destination page and current language.
  // Edit the values to taste — e.g. swap the Belarusian forms to your
  // Taraškievica spellings if that's the house style.
  const NAV_LABELS = {
    about:      { en: 'About',      ru: 'Мы',        be: 'Мы' },
    philosophy: { en: 'Philosophy', ru: 'Философия', be: 'Філасофія' },
    projects:   { en: 'Projects',   ru: 'Проекты',   be: 'Праекты' },
    join:       { en: 'Contact',    ru: 'Контакт',   be: 'Кантакт' },
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

  // HEAD-check whether a URL exists. Guarded by a 2s timeout so a slow or
  // non-responding request can never block navigation.
  async function urlExists(url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
      clearTimeout(timer);
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Identify which page a navbar link points to — by its visible text
  // (in any language) or by its href filename. Returns 'about',
  // 'philosophy', 'projects', 'join', or null.
  function pageOfLink(a) {
    const href = a.getAttribute('href') || '';
    const text = (a.textContent || '').trim();
    for (const page of Object.keys(NAV_LABELS)) {
      if (Object.values(NAV_LABELS[page]).includes(text)) return page;
      if (new RegExp('/' + page + '(\\.html)?$').test(href)) return page;
      if (new RegExp(page + '\\.qmd$').test(href)) return page;
    }
    return null;
  }

  // Localise the navbar item labels to the current page language.
  // Only the About item's href is rewritten (About exists in every
  // language); philosophy/projects/join currently live only under /ru/,
  // so their hrefs are left untouched.
  function localizeNavLabels() {
    const lang = currentLang();
    const links = document.querySelectorAll('#quarto-header a, .navbar a');
    links.forEach((a) => {
      if (isLangLink(a)) return;
      // Only relabel real menu links. Quarto's tool anchors (dark-mode
      // toggle, search) carry the CURRENT page's href, which would
      // otherwise be mistaken for a nav item and get its label written
      // over the icon.
      if (!a.classList.contains('nav-link')) return;
      if (a.classList.contains('quarto-color-scheme-toggle') ||
          a.classList.contains('quarto-navigation-tool')) return;
      const page = pageOfLink(a);
      if (!page) return;
      const label = NAV_LABELS[page][lang];
      if (label) a.textContent = label;
      if (page === 'about') a.setAttribute('href', '/' + lang + '/about.html');
    });
  }

  // Tag the language links so CSS can render them as a separate cluster,
  // mark the current language active, and insert a separator <li> before
  // the first language item.
  function decorateLangLinks() {
    const cur = currentLang();
    const links = document.querySelectorAll('#quarto-header a, .navbar a');
    let firstItem = null;

    links.forEach((a) => {
      if (!isLangLink(a)) return;

      a.classList.add('wr-lang');
      const item = a.closest('.nav-item') || a.parentElement;

      if (langOf(a) === cur) {
        a.classList.add('wr-lang-active');
        if (item) item.classList.add('wr-lang-item-active');
      }

      if (item) {
        item.classList.add('wr-lang-item');
        if (!firstItem) {
          item.classList.add('wr-lang-item-first');
          firstItem = item;
        }
      }
    });

    // Insert a separator element before the first language item (once).
    if (firstItem && firstItem.parentElement) {
      const prev = firstItem.previousElementSibling;
      const hasSep = prev && prev.classList && prev.classList.contains('wr-lang-sep');
      if (!hasSep) {
        const sep = document.createElement('li');
        sep.className = 'wr-lang-sep';
        sep.setAttribute('aria-hidden', 'true');
        firstItem.parentElement.insertBefore(sep, firstItem);
      }
    }
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
        // Always navigate: try the mirrored page, fall back to the
        // language home on any failure. Never leave the click dead.
        let dest = fallback;
        try {
          dest = (await urlExists(candidate)) ? candidate : fallback;
        } catch (err) {
          dest = fallback;
        }
        window.location.href = dest;
      });
    });
  }

  function init() {
    localizeNavLabels();
    decorateLangLinks();
    attachLangSwitchHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
