# Trending AI Topics — Style Guide

Design tokens and components extracted from
[trendingaitopics.com](https://www.trendingaitopics.com) using the Firecrawl
`branding` scrape + a screenshot of the live page.

**Visual character:** *neo-brutalist* — a warm cream paper canvas, hard 2–3px
black borders, **square corners (0 radius)**, offset hard shadows (no blur),
heavy black sans-serif headings, and punchy red + lime-green accents.

---

## Color palette

| Role | Hex | Use |
|------|-----|-----|
| Page background | `#F4F0DC` | Main canvas (warm cream) |
| Panel wash | `#FAF3D8` | Subtle section background |
| Card surface | `#FEF7E4` | Default card/panel |
| Highlight card | `#FFF0D4` | Feature / emphasized card |
| Ink (text + borders) | `#001806` | Near-black green — text, borders, solid buttons |
| Soft ink | `#2E3A2E` | Body copy |
| Muted | `#5C6657` | Captions, metadata, ranks |
| **Red accent** | `#FF3B12` | Emphasis word, score tiles, brand mark |
| Red deep | `#E22600` | Hover/pressed |
| **Green** | `#7CC000` | Signal dots, progress fill |
| Green soft | `#C8E89A` | Signal-row background |
| Yellow | `#FFE45C` | "Daily email" pill / CTA highlight |

> Note: Firecrawl's automatic color picker reported low confidence on this site,
> so the palette above was hand-verified against the rendered screenshot rather
> than taken raw from the extractor.

## Typography

- **Font stack:** `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  (the source site uses the native system sans stack — no web font to load).
- **Headings:** weight `800`, tight tracking (`-0.02em` to `-0.03em`), line-height ~`0.95`.
- **Display/hero:** up to ~`105px` on desktop (`clamp(2.75rem, 7vw, 6.5rem)`).
- **Body:** ~`19px` (`1.18rem`), line-height `1.5`.

## Shape & spacing

- **Border radius:** `0` everywhere (pills `999px` are the only exception, used for CTA pills/badges).
- **Borders:** `2px` default, `3px` for feature cards / hero blocks. Always ink (`#001806`).
- **Shadow:** offset, zero-blur — `4px 4px 0 #001806` (lg: `6px 6px 0`).
- **Spacing base unit:** `4px` (matches the source).

## Components included in `theme.css`

| Class | What it is |
|-------|------------|
| `.tat` | Base wrapper (bg + font + ink color) |
| `.tat-display`, `.tat-accent` | Hero heading + red emphasis word |
| `.tat-card`, `.tat-card--feature`, `.tat-card--raised` | Panels |
| `.tat-btn` + `--primary` / `--ghost` / `--yellow` | Buttons & CTA pill |
| `.tat-badge` + `--red` / `--green` / `--label` | Tag pills |
| `.tat-score` | Big red square score tile (the "75 priority" block) |
| `.tat-signal`, `.tat-progress` | Green "strong signal" rows + progress bar |
| `.tat-row` | Ranked list item |
| `.tat-header`, `.tat-brand`, `.tat-nav` | Top bar |

## How to use

```html
<link rel="stylesheet" href="theme.css" />
<body class="tat">
  <h1 class="tat-display">Know what <span class="tat-accent">matters</span> today.</h1>
  <div class="tat-card tat-card--feature"> ... </div>
</body>
```

Open **`demo.html`** in a browser to see all the pieces assembled into
a sample dashboard. Everything is plain CSS variables, so you can also map the
`--tat-*` tokens onto Tailwind, styled-components, or any framework.
