
# UI Specification

## Product Feel

StackRadar should feel like a calm, technical, high-trust command center.

The UI should communicate:

- precision,
- credibility,
- clarity,
- intelligence,
- restraint.

It should not look like:

- a crypto dashboard,
- a generic AI SaaS,
- a noisy cybersecurity blog,
- a neon hacker terminal,
- a toy project.

## Visual Direction

### Typography

Use a modern sans-serif with excellent readability.

Recommended:

- Inter
- Geist
- Satoshi
- IBM Plex Sans
- Instrument Sans

For code/package names:

- Geist Mono
- IBM Plex Mono
- JetBrains Mono

### Layout

Use generous spacing, dense cards, and strong hierarchy.

Primary layout structure:

- max-width content containers,
- sticky top nav,
- split hero section,
- card-based incident feed,
- structured report pages,
- responsive dashboard grid.

### Color Direction

Dark-first:

```txt
Background: deep graphite / near black
Surface: slightly lighter graphite
Border: low-contrast slate
Text: off-white
Muted text: gray
Critical: red
High: orange
Medium: amber
Low: blue/green
Safe: green
Info: muted blue

Light mode must still be supported.

Components

Required components:

* IncidentCard
* SeverityBadge
* ConfidenceBadge
* SourceBadge
* PackageBadge
* RiskMeter
* ScanUploadDropzone
* ScanFindingCard
* ActionChecklist
* SourceList
* Timeline
* ExplanationToggle
* NewsletterCapture
* EmptyState
* LoadingSkeleton
* AdminReviewPanel

Responsive Behavior

Mobile

* Incident cards become single column.
* Filters collapse into sheet/drawer.
* Scan upload remains large and obvious.
* Report summary appears before details.
* Tables become cards.
* Technical metadata is collapsed by default.

Tablet

* Two-column feed where possible.
* Sidebar filters optional.
* Report summary sticky card can collapse.

Desktop

* Three-column dashboard possible.
* Left-side filters.
* Main feed.
* Right-side “Today’s Risk Signals” panel.

Homepage Structure

1. Navbar
2. Hero
3. Lockfile scan CTA
4. Example incident card
5. How it works
6. Who it is for
7. Supported sources
8. Product preview
9. Newsletter CTA
10. Footer

Hero Copy

Headline:

“Know when the packages your AI coding agent installed put your app at risk.”

Subheadline:

“StackRadar turns CVEs, package compromises, and supply-chain attacks into plain-English security briefs and project-specific action plans.”

Primary CTA:

“Scan your project”

Secondary CTA:

“Read latest incidents”

Incident Card Fields

Each card should include:

* severity,
* confidence,
* ecosystem,
* title,
* beginner TLDR,
* affected packages,
* published date,
* source count,
* CTA.

Scan Report UI

The scan report page should include:

1. Overall risk score
2. Top action
3. Critical findings
4. Affected package table
5. Beginner explanation
6. Technical details
7. Sources
8. Subscribe CTA

Design Quality Bar

The interface must look good enough for:

* Product Hunt launch
* YC application demo
* investor conversation
* founder Twitter/X demo video
* recruiter-facing portfolio project