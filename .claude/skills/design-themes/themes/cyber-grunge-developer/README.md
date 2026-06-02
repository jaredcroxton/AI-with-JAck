# Cyber-Grunge Developer

**Source:** written design brief + reference image (burnt-out dev at a messy neon desk).
**Prefix:** `cgd-` · **Wrapper class:** `.cgd`

## Vibe
A moody, high-stress dark terminal room meets hyper-clean glowing holographic
glassmorphism UI. Deep near-black canvas (~90% of layout) with a faint blue
tech grid, frosted-glass cards that glow and "breathe," neon-blue for healthy
metrics, error-red for alerts and the primary CTA, and sticky-note yellow for
hand-drawn callouts.

## Palette
| Role | Hex |
|------|-----|
| Deep background | `#0B0E14` |
| Card / panel | `#161B25` |
| **Primary (neon blue)** | `#00D2FF` |
| **Secondary (error red)** | `#FF3B6B` |
| Tertiary (sticky yellow) | `#E5C158` |
| Title text | `#FFFFFF` |
| Body copy | `#A0AAB8` |
| Status-nominal green | `#2EE6A8` |

## Type
- **Headings & UI:** Plus Jakarta Sans → Inter (geometric sans, weight 800).
- **Metrics / code / status:** JetBrains Mono → Fira Code.
- **Hand-drawn callouts:** Architects Daughter → Permanent Marker (e.g. *"why is this so hard?!"*).

## Signature details (holographic glassmorphism)
- **Glass cards:** `background: rgba(22,27,37,.7)` + `backdrop-filter: blur(8px)`.
- **Borders:** 1px neon-blue (`--cgd-border-blue`) or error-red (`--cgd-border-red`).
- **Outer glow:** `box-shadow: 0 0 15px rgba(0,210,255,.2)`; `.cgd-card--breathe` adds a slow pulsing glow.
- **Tech grid backdrop:** faint blue isometric grid baked into `--cgd-grid` on `.cgd`.
- **Primary CTA:** error-red button with a continuous pulsing neon halo (`.cgd-btn--primary`).
- **Status indicator:** blinking green dot — *"System Status: Nominal"* (`.cgd-status`).
- Helper components for metric widgets, error alerts, feature-request lists, sticky notes, and badges.

## Robot hero asset
The brief calls for a glossy white-and-red 3D robot with emissive neon-blue eyes
in the right hero column. That's a rendered image asset, not CSS — the demo
leaves a **labelled drop slot** (`.robot-slot`) where you place the render
(`robot.png`). Everything around it is built to frame a 3D character floating
over the flat 2D dashboard. If you upload/generate the robot image, drop it in
this folder and swap the slot for an `<img>`.

## Use
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@400;700&family=Architects+Daughter&display=swap" rel="stylesheet">
<link rel="stylesheet" href="theme.css">
<body class="cgd"> ... </body>
```
See `demo.html` for the full assembled hero + floating-panel dashboard.
