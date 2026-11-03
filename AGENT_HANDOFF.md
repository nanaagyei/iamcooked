# Agent Handoff: iamcooked

## Current Mission

Build the MVP of iamcooked: a personalized security intelligence platform for AI-assisted JavaScript/TypeScript builders.

The product must help users understand security incidents and determine whether their project dependencies are affected.

## What The Next Agent Must Understand

This is not a generic news aggregator.

The most important workflow is:

1. User reads or sees a security incident.
2. User uploads a lockfile.
3. System checks whether the user's project uses affected packages or vulnerable versions.
4. System produces a plain-English risk report with actionable steps.
5. User subscribes for future alerts.

## Build Order

Follow this order strictly:

1. Project foundation
2. Design system
3. Static landing page
4. Incident feed UI
5. Incident detail page
6. Database schema
7. Source ingestion models
8. Lockfile parser
9. OSV query integration
10. Scan report generation
11. AI summary pipeline
12. Admin review
13. Email digest
14. QA and security hardening

## Core Product Pages

- `/`
- `/incidents`
- `/incidents/[slug]`
- `/scan`
- `/scan/report/[id]`
- `/dashboard`
- `/settings`
- `/admin`
- `/learn/[slug]`

## Design Direction

The UI should feel:

- technical,
- calm,
- trustworthy,
- premium,
- startup-ready,
- security-aware,
- modern without being gimmicky.

Avoid:

- purple AI gradients,
- cartoon hacker visuals,
- neon cyberpunk cliché,
- emoji-heavy UI,
- fearmongering,
- cluttered dashboards,
- generic SaaS templates.

## Preferred Style

Use a dark-first interface with excellent light-mode support.

Suggested visual direction:

- near-black or deep graphite background,
- muted green/blue severity accents,
- off-white text,
- subtle borders,
- card-based layouts,
- dense but readable technical metadata,
- clean typography,
- high contrast,
- responsive behavior from mobile to desktop.

## Important Product Rule

Every incident must distinguish:

- confirmed facts,
- likely interpretation,
- unknowns,
- recommended action.

Never present AI-generated inference as fact.

## Important Engineering Rule

All AI output must be stored as structured JSON and linked back to sources.

Do not generate freeform summaries without validation.

## Completed (2026-06-09)

- OSV + CISA KEV wired into scan upload pipeline
- Admin role gate, publish/archive APIs, AdminReviewPanel
- Newsletter persistence with unsubscribe tokens
- `/settings`, `/learn/[slug]` routes
- Homepage GSAP redesign + Framer dashboard bento
- Email digest worker + `/api/cron/digest`
- Geist fonts, unified design tokens, light/dark mode

## Completed (2026-06-25) — AI Pipeline

- Unified `@iamcooked/ai` on AI SDK v7 with Zod structured outputs
- All 6 workflows: extraction, TLDR, technical summary, remediation, source verification, digest
- `AiGeneration` audit model + claim verifier against source context
- Admin panel: extract, TLDR, technical, verify with preview-before-apply
- On-demand scan remediation via `/api/ai/remediation` (cached in DB)
- Copilot hardening: message sanitization, token requirement, markdown-safe rendering
- Publish gate: CRITICAL/HIGH + UNVERIFIED blocked
- Tests: schema contracts, claim verifier, API security validators

## Env vars (required for full functionality)

See IMPLEMENTATION_STATUS.md for complete list. Key: `DATABASE_URL`, `ADMIN_EMAILS`, `CRON_SECRET`, `RESEND_API_KEY`.
