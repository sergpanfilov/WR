# White Ribbon

An academic editorial project on democratic institutions and
autocratisation. Built with Quarto, hosted on GitHub Pages.

**Site:** https://white-ribbon.net
**Languages:** English (canonical), Russian, Belarusian

---

## Repository layout

```
white-ribbon/
├── _quarto.yml              # main project config
├── index.qmd                # root → redirects to /en/
├── about.qmd
├── CNAME                    # custom domain for GitHub Pages
├── references.bib           # global bibliography
├── csl/
│   └── chicago-author-date.csl
├── styles/
│   └── custom.scss          # Modern Editorial design system
├── assets/
│   ├── Logo_WR_light.svg
│   └── Logo_WR_dark.svg
├── en/
│   ├── index.qmd            # English listing page
│   └── posts/
│       └── 2026-05-23-on-democratic-erosion/
│           └── index.qmd
├── ru/
│   ├── index.qmd            # Russian listing (placeholder)
│   └── posts/
└── be/
    ├── index.qmd            # Belarusian listing (placeholder)
    └── posts/
```

---

## First-time local setup

You need Quarto, Git, and a text editor. Optional: a TeX distribution
if you want to also produce PDF versions of essays.

### 1. Install Quarto

Download the installer for your OS from <https://quarto.org/docs/get-started/>.

Verify:

```bash
quarto --version
# expected: 1.5.x or newer
```

### 2. Clone the repository

```bash
git clone git@github.com:YOUR_GITHUB_USERNAME/white-ribbon.git
cd white-ribbon
```

### 3. Download the Chicago Author-Date CSL

The repository contains a placeholder. Replace it with the real file:

```bash
curl -L \
  https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-author-date.csl \
  -o csl/chicago-author-date.csl
```

### 4. Preview the site locally

```bash
quarto preview
```

This starts a local server (usually at <http://localhost:5544>) and
auto-reloads on file changes.

### 5. Render the site to static HTML

```bash
quarto render
```

Output lands in `_site/`. To see what GitHub Pages will actually serve,
open `_site/index.html`.

---

## Deploying to GitHub Pages

Done automatically by GitHub Actions on every push to `main`. To enable
the first time:

1. Create the repository on GitHub (public).
2. Push the contents of this directory to `main`.
3. In the repository on GitHub: **Settings → Pages**.
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch").
5. Push any commit — the workflow `.github/workflows/publish.yml` will
   render Quarto and deploy.

### Custom domain (white-ribbon.net)

The `CNAME` file in the repo root tells GitHub Pages to serve the site
on `white-ribbon.net`. After the first successful deploy:

1. At your registrar, set DNS records for the domain:
   - **A records** (apex) → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - **AAAA records** (apex, IPv6) → `2606:50c0:8000::153`,
     `2606:50c0:8001::153`, `2606:50c0:8002::153`,
     `2606:50c0:8003::153`
   - **CNAME** (`www`) → `YOUR_GITHUB_USERNAME.github.io`
2. In **Settings → Pages**, the custom domain field will already be
   populated from the `CNAME` file. Wait until "DNS check successful"
   appears (can take 10–60 minutes).
3. Tick **Enforce HTTPS**.

GitHub's published IP addresses can change. If you set this up months
later, verify the current ones at
<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>.

---

## Writing a new essay

1. Create a new directory under the appropriate language:
   `en/posts/YYYY-MM-DD-slug/`
2. Inside, create `index.qmd`. Use the existing essay as a template —
   copy its YAML frontmatter and adjust.
3. Add new bibliography entries to `references.bib` (or to a local
   `refs.bib` in the post directory if you want to keep the global file
   clean).
4. Cite with `[@levitsky_how_2018]` syntax.
5. Preview locally with `quarto preview`.
6. Commit and push → GitHub Actions handles the rest.

### Frontmatter fields

```yaml
---
title: "Title of the essay"
subtitle: "One-sentence deck"
description: "Used for meta tags and listings"
author: "The Editors"
date: "2026-05-23"
categories: [essay, democratic-theory]
reading-time: true
lang: en
---
```

### Custom block styles available

- `::: {.deck} ... :::` — italic deck under the title
- `::: {.byline} ... :::` — monospace byline
- `::: {.dropcap-paragraph} ... :::` — explicit drop cap (otherwise the
  first paragraph gets it automatically)
- `::: {.essay-end} ... :::` — monospace sign-off block
- Block quotes (`>`) get a red left rule automatically

---

## Translations

When a Russian or Belarusian translation of an English essay is ready,
place it in the matching directory structure:

```
en/posts/2026-05-23-on-democratic-erosion/index.qmd
ru/posts/2026-05-23-on-democratic-erosion/index.qmd
be/posts/2026-05-23-on-democratic-erosion/index.qmd
```

Use the same date and slug for the directory — this keeps URLs aligned
across languages and makes a future language-switcher trivial to wire up.

---

## Design system

See `styles/custom.scss`. The full design rationale lives in the original
brief and logo book.

- Body: Source Serif 4, 20px, line-height 1.7
- Display / logo: Exo 2 Thin (100)
- Mono (kickers, bylines, metadata): JetBrains Mono, ALL CAPS, 0.25em
  letter-spacing
- Column width: 36em max
- Drop cap on first paragraph
- Single accent colour: `#C8202A` (used only for the red rule on block
  quotes, footnote markers, and link underlines)
- Background: `#FEFDF8` cream

---

## Licence

Editorial content: All rights reserved unless otherwise noted on
individual essays.

Code (config files, SCSS, GitHub Actions workflow): MIT.
