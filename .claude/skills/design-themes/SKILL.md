---
name: design-themes
description: The library of dashboard / website design themes (colors, fonts, components as drop-in CSS). Use this to BUILD a dashboard or page in a saved style, to CHANGE or SWITCH the theme/style of an existing dashboard ("change my dashboard to the cyber-grunge style", "restyle this in trendhustler"), to LIST the available designs, or to ADD a new theme from a URL.
---

# Design Themes — Dashboard Design Library

The home for all saved dashboard designs. Use it to **build a new dashboard** in
a saved style, or to **switch an existing dashboard to a different theme**. Each
theme is a self-contained, framework-agnostic CSS file (CSS variables + helper
classes) plus sample pages and a reference README.

> **Installing this skill for use across all your projects:** see `INSTALL.md`.

## Switch / change your dashboard theme
When the user says "change/switch my dashboard to the **<name>** style":
1. Identify the target theme from the catalog below.
2. Read that theme's `README.md` + `theme.css`.
3. Rebuild the dashboard markup with the new theme's prefix classes (e.g. swap
   `tat-*` for `cgd-*`) and wrapper class on `<body>`. Note: themes are NOT
   drop-in CSS swaps — each uses its own class prefix — so re-skin the markup,
   keeping the content/structure and applying the new theme's components.
4. Preserve the signature details of the target theme (corner style, shadows,
   accent usage).

## Theme catalog

| Theme | Folder | Vibe | Prefix / wrapper |
|-------|--------|------|------------------|
| **Trending AI Topics** | `themes/trending-ai-topics/` | Neo-brutalist · warm cream canvas, hard black borders, square corners, red + lime accents | `tat-` / `.tat` |
| **Glitch Cat Club** | `themes/glitch-cat-club/` | Dark glitch zine · black canvas, cream text, hot-pink accent, Impact headings, mono body, glitch-cut corners | `gcc-` / `.gcc` |
| **TrendHustler** | `themes/trendhustler/` | GTA black-market · near-black chart-grid canvas, Pricedown wordmark, toxic-green + magenta + gold, ticker bar, mono data, sharp corners | `th-` / `.th` |
| **Cyber-Grunge Developer** | `themes/cyber-grunge-developer/` | Dark terminal room + holographic glassmorphism · deep navy-black canvas, frosted glowing cards, neon-blue + error-red + sticky-note yellow, pulsing CTA | `cgd-` / `.cgd` |

Each theme folder contains:
- `theme.css` — design tokens (`--<prefix>-*`) + component classes
- `demo.html` — a working sample page using the theme
- `dashboard.html` — a fuller dashboard example (where present; e.g. the
  "Trend Radar" analytics dashboard in `trending-ai-topics/`)
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
