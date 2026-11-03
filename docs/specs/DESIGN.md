---
name: StackRadar
description: Security intelligence for AI-assisted builders — dark-first, developer-native UI with restrained muted-lime accent and Linear/Raycast precision.
colors:
  background: "#0c0e11"
  background-dark: "#0c0e11"
  background-light: "#f4f3f0"
  foreground: "#eceee9"
  foreground-dark: "#eceee9"
  foreground-light: "#141618"
  primary: "#9ecb3d"
  primary-foreground: "#0c0e11"
  muted: "#181b20"
  muted-foreground: "#8b929a"
  border: "#252a32"
  border-light: "#dddcd8"
  card: "#12151a"
  card-elevated: "#181c22"
  contrast: "#eceee9"
  contrast-foreground: "#0c0e11"
  severity-critical: "#e5484d"
  severity-high: "#f97316"
  severity-medium: "#eab308"
  severity-low: "#6b8afd"
  severity-safe: "#9ecb3d"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.875rem"
  xl: "1.25rem"
spacing:
  section: "4rem"
  section-lg: "6rem"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-contrast:
    backgroundColor: "{colors.contrast}"
    textColor: "{colors.contrast-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

## Overview

StackRadar is **dark-first everywhere**. The default canvas is warm charcoal (`#0c0e11`), tuned for late-night incident reading: low glare, high legibility, no blue-black cyber tint.

**Color strategy: Restrained.** Tinted neutrals carry 90%+ of surfaces. One accent, **muted lime** (`#9ecb3d`), appears only on primary actions and positive/safe severity states. It reads as signal, not decoration.

Reference lane: **Linear / Raycast** — precise spacing, compact type, mono for metadata, neutral-dominant layouts. Not a copy; the same developer-native energy applied to security briefings.

Marketing and app share one system. No warm off-white marketing canvas, no separate "forest" button tier, no editorial zig-zag sections.

## Colors

Neutrals are warm-tinted (chroma ~0.005 toward yellow-green). Never pure `#000` or `#fff`. Prefer OKLCH for new tokens.

| Role | Dark (default) | Light (optional) | Usage |
|------|----------------|------------------|--------|
| Background | `#0c0e11` | `#f4f3f0` | Page canvas |
| Card | `#12151a` | `#fafaf8` | Panels, incident rows |
| Card elevated | `#181c22` | `#ffffff` | Popovers, modals |
| Foreground | `#eceee9` | `#141618` | Primary text |
| Muted foreground | `#8b929a` | `#5c646b` | Secondary text, labels |
| Border | `#252a32` | `#dddcd8` | Hairline separators |
| Primary (muted lime) | `#9ecb3d` | `#7aab2a` | Primary CTAs, safe severity |
| Contrast | `#eceee9` | `#141618` | Secondary solid buttons on dark |

Severity colors are functional data viz only. Never use them on marketing heroes or decorative elements.

**Retired tokens:** `forest`, bright emerald `#22c55e` as primary, warm off-white `#f7f7f4` as marketing default.

## Typography

- **Display:** Geist Sans, semibold, **smaller scale** than typical SaaS heroes. Headlines earn hierarchy through weight and spacing, not 4xl type.
- **Body:** `0.9375rem` (15px), `leading-relaxed`, max **65ch**.
- **Labels / metadata:** Geist Mono, `0.8125rem`, wide tracking for section eyebrows (`LIVE`, `SEVERITY`, version strings).
- **Numbers:** Tabular nums in mono for scores, counts, CVE IDs.

No Inter. No serif. No gradient text.

## Elevation

- **Subtle lift:** `0 1px 0 rgba(255,255,255,0.04)` inset highlight on elevated surfaces
- **Shadow:** `0 8px 24px -8px rgba(0,0,0,0.4)` sparingly on modals only
- Prefer **1px border + background step** over box shadows for cards
- No nested cards. No glassmorphism except filter dropdowns if truly needed

## Layout

- **Container:** `max-w-[1200px]`, tighter than before
- **Section rhythm:** `4rem` / `6rem` vertical gaps; vary intentionally, not uniform padding everywhere
- **Marketing:** Split layouts and inline product demos, not zig-zag editorial blocks or trust marquees
- **App:** Sidebar or top nav with compact density; tables and lists over card grids
- Heroes use `min-h-[80dvh]` max, not full viewport theatrics

## Components

| Component | Notes |
|-----------|--------|
| Primary button | Muted lime fill, dark text, `text-sm font-medium`, active opacity reduction |
| Contrast button | Near-white fill on dark surfaces; secondary actions |
| Ghost button | Transparent, border or hover background only |
| Incident row | Flat or subtly elevated row; severity badge + mono metadata; no left stripe |
| Empty / loading | Skeleton rows matching final layout; no spinners |
| Section container | `max-w-[1200px] mx-auto px-4 md:px-6` |

Icons: **Phosphor** at 16–20px, consistent stroke. No decorative icon grids.

## Illustration

One signature illustration carries the brand: the **radar sweep** (`RadarIllustration`, canvas) — a rotating lime sweep over a constellation of package nodes connected like a dependency graph, on charcoal. Nodes light as the sweep passes and react to the cursor. It is the literal product metaphor (scanning your stack), never a generic gradient blob.

- Lime (`--primary`) + muted-foreground neutrals only; reads color tokens live so it tracks theme.
- Used as an ambient hero/section backdrop at low opacity, masked so content stays legible.
- Renders a single static frame under `prefers-reduced-motion`.
- Supporting texture: a faint dot grid (`PageBackdrop`) plus a single muted-lime glow. No blue/purple/emerald radial gradients, no severity colors on decorative surfaces.

## Motion

- **Product UI:** ease-out (power3 / quart / expo). No spring bounce, no elastic.
- **Duration:** 150–200ms for hovers and state changes; up to ~1.6s for the one-time radar draw-in.
- **Allowed (purposeful):** radar sweep, magnetic CTAs, cursor-reactive nodes, count-up numerals, and one-shot reveal-on-view entrances (IntersectionObserver, not scroll-scrubbed).
- **Banned:** scroll-jacking, parallax tied to scroll position, decorative trust marquees, and motion that runs for its own sake.
- Respect `prefers-reduced-motion`: disable all nonessential motion and render static states.

## Do's and Don'ts

**Do**
- Unify marketing and app on dark charcoal
- Use muted lime sparingly (primary CTA, safe/resolved states)
- Show real product UI in marketing (scan flow, incident row, report snippet)
- Keep source counts and confidence labels visible
- Use mono for versions, scores, timestamps

**Don't**
- Warm off-white marketing pages that feel like a different brand
- Bright emerald or startup-green CTAs
- Zig-zag feature sections, gradient section fades, trust logo marquees
- Generic three-equal-card feature rows
- Side-stripe severity indicators
- Gradient text, purple accents, neon glows
- `h-screen` marketing heroes
