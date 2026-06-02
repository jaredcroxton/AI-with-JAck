---
name: design-themes
description: A library of reusable website design themes extracted from real sites (colors, fonts, components as drop-in CSS). Use when the user wants to build or restyle an HTML page/dashboard in the look of one of the saved themes ("use the glitch cat style", "make a dashboard in the trending AI topics style"), wants to see/list the available themes, or wants to extract and ADD a new theme from a URL.
---

# Design Themes

A catalog of design systems extracted from real websites using the Firecrawl
`branding` scrape + a screenshot for visual verification. Each theme is a
self-contained, framework-agnostic CSS file (CSS variables + helper classes)
plus a demo dashboard and a reference README.

## Theme catalog

| Theme | Folder | Vibe | Prefix / wrapper |
|-------|--------|------|------------------|
| **Trending AI Topics** | `themes/trending-ai-topics/` | Neo-brutalist · warm cream canvas, hard black borders, square corners, red + lime accents | `tat-` / `.tat` |
| **Glitch Cat Club** | `themes/glitch-cat-club/` | Dark glitch zine · black canvas, cream text, hot-pink accent, Impact headings, mono body, glitch-cut corners | `gcc-` / `.gcc` |
| **TrendHustler** | `themes/trendhustler/` | GTA black-market · near-black chart-grid canvas, Pricedown wordmark, toxic-green + magenta + gold, ticker bar, mono data, sharp corners | `th-` / `.th` |

Each theme folder contains:
- `theme.css` — design tokens (`--<prefix>-*`) + component classes
- `demo.html` — a working sample dashboard using the theme
- `README.md` — palette, type scale, signature details, usage

## How to APPLY a theme (when the user wants to build something)
1. Read the chosen theme's `README.md` and `theme.css` to load its tokens/classes.
2. Build the user's page/dashboard using that theme's prefix classes, or by
   mapping the `--<prefix>-*` variables onto their stack (Tailwind, styled-
   components, etc.).
3. Keep the signature details intact (e.g. square corners for `tat`, glitch-cut
   button corners + hard shadows for `gcc`) — those carry the brand feel.
4. Offer the matching `demo.html` as a starting point if useful.

## How to ADD a new theme (when the user gives a URL)
1. Scrape it: `firecrawl_scrape` with `formats: ["branding", "screenshot"]` and
   `waitFor: 4000`.
2. **Always verify colors against the screenshot** — Firecrawl's auto color
   picker sometimes reports low confidence or misses accents. Trust the rendered
   image over raw numbers when they disagree.
3. Create `themes/<kebab-name>/` with `theme.css`, `demo.html`, `README.md`,
   following the structure and conventions of the existing themes (unique
   prefix + wrapper class, tokens for palette/type/spacing/radius/shadow,
   component classes for header/cards/buttons/badges).
4. Add a row to the **Theme catalog** table above.
5. Commit and push.

## Conventions
- Prefix every token and class with a short theme code (`tat-`, `gcc-`, …) so
  multiple themes can coexist on one page without collisions.
- Capture the *signature* of the site (corner style, shadow style, accent
  usage), not just the raw colors — that's what makes it recognizable.
- Pure CSS, no build step required; fonts loaded via `<link>` when the site
  uses web fonts (noted in each README).
