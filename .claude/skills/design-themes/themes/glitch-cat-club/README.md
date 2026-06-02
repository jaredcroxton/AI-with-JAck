# Glitch Cat Club

**Source:** https://glitchcatclub.com · extracted via Firecrawl `branding` (confidence 0.93)
**Prefix:** `gcc-` · **Wrapper class:** `.gcc`

## Vibe
Dark "glitch zine." Black canvas, warm cream text, one hot-pink accent. Big
condensed Impact-style display headings, monospace body copy, and signature
**wonky asymmetric "glitch-cut" button corners** (`6px 14px 7px 13px`) with hard
black offset shadows. Cards are dark by default with one cream highlight card.

## Palette
| Role | Hex |
|------|-----|
| Background | `#070707` |
| Card (dark) | `#15110F` |
| Card (highlight) | `#F3E6C8` |
| Text (cream) | `#F3E6C8` |
| Text dim | `#CCC1A8` |
| Border / muted | `#867F6E` |
| **Accent (pink)** | `#EF4F7A` |

## Type
- **Display headings:** Changa One → Impact fallback (uppercase, condensed)
- **Body:** Inter
- **Labels / captions:** DM Mono (uppercase, wide tracking, `//` eyebrows)
- Hero scale up to ~108px.

## Signature details
- **Glitch-cut corners:** `border-radius: 6px 14px 7px 13px` on buttons.
- **Hard shadow:** `7px 7px 0 #000` + subtle inset bevels.
- Mono eyebrow labels like `// WHAT THIS IS`.
- Numbered cards (`01`–`04`) with a single cream highlight.

## Use
```html
<link href="https://fonts.googleapis.com/css2?family=Changa+One&family=Inter:wght@400;600;800&family=DM+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="theme.css">
<body class="gcc"> ... </body>
```
See `demo.html` for a full assembled dashboard.
