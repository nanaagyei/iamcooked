# Product

## Register

product

## Users

**Primary:** Solo founders and indie builders shipping production apps with AI coding tools (Cursor, Claude Code, Bolt, Lovable). They move fast, install dependencies through agents, and rarely have a dedicated security team.

**Secondary:** Small engineering teams (2–8 people) who need digestible threat intel without standing up a full SOC. They glance at severity during the day and want copy-paste remediation, not CVE encyclopedias.

**Context:** Users arrive after hearing about an npm incident, from a scan CTA, or while auditing a lockfile before a launch. The defining moment is **late at night**: laptop open in a dim room, checking whether a headline affects their stack. They are stressed but skeptical of fear-mongering. They want proof (sources, affected versions) and a clear next step, not a sales pitch.

## Product Purpose

StackRadar turns scattered security signals (OSV, GitHub Advisories, CISA KEV, vendor advisories) into **project-specific, plain-English action plans**. Success means a builder uploads a lockfile, understands their real risk in under a minute, and knows exactly what to upgrade or watch.

**Marketing and product surfaces are co-equal.** The homepage earns trust in 10 seconds; the scan report and dashboard deliver ongoing value. Both should feel like the same tool: precise, dark-first, developer-native. No split personality between "warm landing page" and "serious app."

## Brand Personality

**Voice:** Calm expert. Direct, source-backed, never alarmist. Writes like a senior engineer explaining risk to a smart founder over coffee.

**Three words:** Precise, trustworthy, grounded.

**Visual personality:** Developer-native density in the Linear/Raycast lane. Quiet confidence, not editorial warmth or startup polish. The interface should feel like infrastructure software: legible at 2am, zero decorative noise.

**Emotional goals:** Confidence without complacency. Users should feel informed and in control, not punished for using AI tools or npm.

**Tone rules:** Concrete verbs over hype. No "seamless," "next-gen," or "elevate." Prefer "check," "match," "fix," "scan," "brief."

## Anti-references

- Generic dark-blue "cybersecurity" dashboards with neon glows and matrix aesthetics
- Panic UX: flashing reds, countdown timers, or guilt-driven copy for builders who use AI
- AI slop: purple gradients, Inter font, identical three-column feature cards, gradient text heroes
- CVE-aggregator clutter: raw feed dumps with no personalization or beginner summaries
- Fear-first security marketing that treats npm users as negligent
- Side-stripe severity cards, hero-metric templates (big number + gradient accent), decorative glassmorphism
- Warm editorial marketing tropes: zig-zag feature sections, trust marquees, gradient section fades, oversized display type
- Bright emerald "startup green" CTAs that read as generic SaaS rather than a precision tool
- Scroll-jacking, parallax, or decorative marquees that hijack the reader; motion that runs for its own sake instead of explaining the product

## Design Principles

1. **Source-backed or labeled.** Every claim ties to a source or carries an explicit AI/confidence label. The UI reinforces this visually (badges, source counts, calm citations).

2. **Calm urgency.** Severity is visible through typography, tint, and badges, not alarm animations or guilt. Critical issues feel serious; low issues feel manageable.

3. **One surface, one tool.** Marketing and app share the same dark-first visual language, spacing rhythm, and component vocabulary. A visitor who scans on the homepage should not feel they entered a different product.

4. **Density over decoration.** Prefer compact data layouts, mono labels, and clear hierarchy. One signature illustration is allowed: an on-brand radar sweep over a dependency-graph constellation (muted lime on charcoal) that ties motion to the product. Motion is purposeful and interactive (magnetic CTAs, draw-in, cursor-reactive nodes, count-ups), never scroll-jacking or ornamental, and always skippable under reduced motion.

5. **Practice what you preach.** StackRadar's own dependencies and security posture should be defensible. Copy and UI avoid overclaiming AI capabilities.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for color contrast on text and interactive controls
- Respect `prefers-reduced-motion`: the radar sweep, count-ups, reveals, and stagger all disable cleanly and render a static state
- Severity never conveyed by color alone; always paired with text labels
- Keyboard navigable command palette, forms, and incident filters
- Body copy capped around **65ch** for readability; monospace reserved for versions, scores, and commands
