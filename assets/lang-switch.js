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

  // Localised About labels by current page language.
  const ABOUT_LABELS = {
    en: 'About',
    ru: 'Мы',
    be: 'Мы',
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
        const ok = await urlExists(candidate);
        window.location.href = ok ? candidate : fallback;
      });
    });
  }

  function init() {
    localizeAboutLink();
    decorateLangLinks();
    attachLangSwitchHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
