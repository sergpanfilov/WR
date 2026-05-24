// Language switcher for navbar EN/RU/BE links.
//
// Site structure: parallel trees under /en/, /ru/, /be/ with mirrored
// filenames. When user is on /en/some-article.html and clicks "RU", we
// want to go to /ru/some-article.html — NOT to /ru/ (the home page).
//
// Strategy: intercept clicks on EN/RU/BE nav links, compute the target
// URL by swapping the language segment, then fetch HEAD to check if the
// translated page exists. If yes, navigate there; if no (404), fall
// back to the language home (/ru/, /en/, /be/).

(function () {
  const LANGS = ['en', 'ru', 'be'];

  // Match navbar links by their visible text (EN / RU / BE), case-insensitive.
  function isLangLink(a) {
    const text = (a.textContent || '').trim().toLowerCase();
    return LANGS.includes(text);
  }

  // Get the language code from a link's text.
  function langOf(a) {
    return (a.textContent || '').trim().toLowerCase();
  }

  // Swap the leading /xx/ segment in the current path for the target lang.
  // If the current path has no recognised lang prefix, just return /target/.
  function buildTargetUrl(targetLang) {
    const path = window.location.pathname;
    const match = path.match(/^\/(en|ru|be)(\/.*)?$/);
    if (match) {
      const rest = match[2] || '/';
      return '/' + targetLang + rest;
    }
    // No recognised prefix — go to that language's home.
    return '/' + targetLang + '/';
  }

  // Check if a URL exists (HEAD request, 200-ish).
  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  function attachHandlers() {
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

        // Try the translated URL first; fall back to language home on 404.
        const ok = await urlExists(candidate);
        window.location.href = ok ? candidate : fallback;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
})();
