# iamcooked QA Report

Last updated: 2026-06-25

QA performed against [docs/agents/QA_AGENT.md](agents/QA_AGENT.md) after pre-launch gap closure.

## Functional

| Check | Result | Notes |
|-------|--------|-------|
| Incident feed loads | Pass | `/incidents` DB-backed with filters and mobile sheet |
| Filters work | Pass | Severity, ecosystem, type, search, sort |
| Incident detail renders | Pass | Beginner summary, who-is-affected, related incidents, deduplicated sections |
| Lockfile upload | Pass | `/scan` + `/api/scan/upload` |
| Invalid files rejected | Pass | Unit tests + upload validation |
| Scan report generated | Pass | Token-gated report with findings |
| Newsletter subscribe | Pass | Homepage + scan report CTA |

## Scanner

| Case | Result |
|------|--------|
| Valid package-lock.json | Pass (unit + E2E) |
| Valid pnpm-lock.yaml | Pass (unit) |
| Valid yarn.lock | Pass (unit) |
| Invalid JSON | Pass (rejected) |
| Empty file | Pass (rejected) |
| Unsupported file | Pass (rejected) |
| Large file (>10MB) | Pass (rejected) |

## UI

| Check | Result | Notes |
|-------|--------|-------|
| Mobile responsiveness | Pass | Manual spot-check on key routes |
| Dark/light mode | Pass | Theme toggle present |
| Keyboard navigation | Pass | Focus rings on interactive controls |
| Accessible labels | Pass | Severity/confidence badges use aria-label |
| Loading states | Pass | Skeletons on scan report, incidents |
| Empty states | Pass | Incidents filter empty state |
| Production imagery | Pass | picsum.photos removed; CSS backdrops used |

## Trust

| Check | Result | Notes |
|-------|--------|-------|
| Every incident has sources | Pass | Source count on cards and detail |
| Confidence labels visible | Pass | Badges + unverified warnings |
| Unverified not presented as confirmed | Pass | Warning on detail page |
| Critical alerts require review | Pass | Publish gate + personalized critical digest |

## Automation

- Unit tests: `pnpm test` (scanner, sources digest, AI schemas, admin warnings, web lib)
- E2E: `pnpm --filter @iamcooked/web test:e2e` (Playwright)
- CI: `.github/workflows/ci.yml`

## Known issues (post-MVP)

- Saved GitHub projects (`Project` model) not wired in UI
- NVD API not integrated (removed from trust marquee)
- Full accessibility audit (axe) not automated in CI

## Bugs filed

No open P0/P1 bugs at time of report. Track follow-ups in GitHub Issues.
