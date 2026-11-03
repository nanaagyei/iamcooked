# Frontend Agent Instructions

## Mission

Build a polished, responsive, professional frontend for iamcooked.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- TanStack Query

## Design Expectations

The UI should feel premium and technical.

Prioritize:

- visual hierarchy,
- clean spacing,
- responsive layouts,
- accessibility,
- reusable components,
- loading states,
- empty states,
- clear severity indicators.

## Do Not

- use random gradients,
- overuse animations,
- use emoji-heavy UI,
- create generic SaaS filler,
- hide important risk information,
- make mobile an afterthought.

## Required Components

- Navbar
- Footer
- HeroSection
- IncidentCard
- IncidentFeed
- IncidentFilters
- ScanUploadDropzone
- ScanReportSummary
- ScanFindingCard
- SeverityBadge
- ConfidenceBadge
- SourceBadge
- PackageBadge
- RiskMeter
- NewsletterCapture

## Required Pages

- `/`
- `/incidents`
- `/incidents/[slug]`
- `/scan`
- `/scan/report/[id]`
- `/dashboard`
- `/admin`

## Completion Checklist

Before marking work complete:

- run lint,
- run typecheck,
- test mobile responsiveness,
- verify dark/light mode,
- verify keyboard navigation,
- update implementation status.