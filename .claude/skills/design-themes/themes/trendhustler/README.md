# TrendHustler

**Source:** https://hustlerv369.github.io/trendhustler/ · extracted via Firecrawl `branding` (confidence 0.93)
**Prefix:** `th-` · **Wrapper class:** `.th`

## Vibe
GTA "black market" energy. Near-black canvas overlaid with a faint green
candlestick/chart grid, a huge **Pricedown (GTA logo font)** two-tone wordmark,
and a stock-**ticker bar** of made-up "trend" prices. Loud, illicit, high-energy
— toxic green is the "money" color, magenta is the loud secondary, gold marks
"premium" drops. Sharp `0` corners, no shadows, monospace data everywhere.

## Palette
| Role | Hex |
|------|-----|
| Background | `#07080A` |
| Card | `#0E1012` |
| Ticker / raised | `#15181B` |
| Text | `#EAF2EC` |
| Text dim | `#8A968E` |
| **Green (primary)** | `#00E676` |
| **Magenta (secondary)** | `#FF2E97` |
| **Gold (premium)** | `#D4AF37` |
| Red (down) | `#FF3B5C` |

## Type
- **Display / wordmark:** Pricedown → **Anton** → Impact fallback (uppercase, condensed). Hero scales up to ~164px.
- **Body:** Helvetica Neue / Arial.
- **Data, labels, buttons:** JetBrains Mono (uppercase, wide tracking).

> Pricedown isn't on Google Fonts. The theme self-hosts it via `@font-face` if
> you have the file; otherwise **Anton** stands in for the GTA look. JetBrains
> Mono + Anton load from Google Fonts via the `<link>` in `demo.html`.

## Signature details
- **Chart-grid backdrop:** faint green grid lines baked into `--th-grid` (applied on `.th`).
- **Ticker bar:** `.th-ticker` with `.th-up` (green ▲) / `.th-down` (red ▼) prices.
- **Two-tone wordmark:** `<span class="th-green">TREND</span>HUSTLER`.
- Sharp 0-radius corners, flat (no shadows), neon-on-black contrast.

## Use
```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="theme.css">
<body class="th"> ... </body>
```
See `demo.html` for a full assembled dashboard.
