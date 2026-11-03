# Phase 02: Incident Feed

## Objective

Build the public incident feed and incident detail pages.

## Pages

### `/incidents`

Features:

- list of incident cards,
- filter by severity,
- filter by ecosystem,
- filter by incident type,
- search by package or keyword,
- sort by latest or severity.

### `/incidents/[slug]`

Features:

- header summary,
- beginner TLDR,
- affected packages,
- what happened,
- who is affected,
- what to do,
- technical details,
- sources,
- related incidents.

## Components

- `IncidentCard`
- `IncidentFilters`
- `IncidentDetailHeader`
- `AffectedPackageTable`
- `IncidentTimeline`
- `SourceList`
- `RecommendedActions`

## Acceptance Criteria

- Feed is responsive.
- Incident detail page is readable.
- Beginner summary is shown before technical details.
- Every incident shows source count.
- Page makes it obvious when something is developing or unverified.