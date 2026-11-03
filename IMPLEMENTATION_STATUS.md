# Implementation Status

Last updated: 2026-06-26

## Summary

iamcooked MVP is launch-ready after pre-launch gap closure: personalized digests, incident detail completeness, admin warnings, scan claim-on-sign-in, shared UI package, CI/E2E, and production-safe imagery.

## Rebrand + dashboard redesign (2026-06-26)

- **Rebrand**: StackRadar → **iamcooked**. Full rename of the `@stackradar/*` workspace scope to `@iamcooked/*`, DB name `stackradar_dev` → `iamcooked_dev`, dark-first **ember/lime** palette, and whimsical "am I cooked?" marketing copy.
- **New dashboard shell**: persistent full-height sidebar (`AppShell` rewritten) with workspace switcher, grouped nav, user menu, and a mobile `Sheet`.
- **New pages**: Overview (stat cards + active vulnerabilities + recent tasks + cooked verdict), **Agent Sources** (the differentiator), Projects, Dependencies (master-detail + create fix task), and Vulnerabilities (triage with expandable rows).
- **Schema**: added `AgentSession`, `AgentInstalledPackage`, `FixTask`; extended `ScanFinding` with `reachable`, `status`, `cveId`, `fixedVersion`.
- **Data**: seeded a demo workspace (5 projects, 8 agent sessions, scans/findings, fix tasks). Dashboard queries fall back to the demo workspace for users with no data of their own.

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 00 Project Setup | Verified | pnpm + Turborepo, Next.js 15, Prisma, Vitest, Playwright |
| 01 Design Foundation | Verified | Geist fonts, shadcn tokens, shared `@iamcooked/ui` |
| 02 Incident Feed | Verified | Related incidents, who-is-affected, extracted components |
| 03 Lockfile Scanner | Verified | OSV batch + CISA KEV + semver incident matching |
| 04 AI Pipeline | Verified | AI SDK v7; 6 workflows; claim verifier; audit log |
| 05 Dashboard | Verified | Scan claim-on-sign-in links anonymous scans to user |
| 06 Email Digest | Verified | Interests filter, AI subject, lesson + ecosystem summary |
| 07 Admin Review | Verified | All 6 warning types in admin panel |
| 08 Security Hardening | Verified | See [PHASE_08_SECURITY_HARDENING.md](docs/implementation/PHASE_08_SECURITY_HARDENING.md) |

## Routes

| Route | Status |
|-------|--------|
| `/` | Dynamic — GSAP hero, product preview, DB latest incident |
| `/incidents` | Dynamic — search, filters, mobile sheet |
| `/incidents/[slug]` | Dynamic — related incidents, who-is-affected, sources |
| `/scan` | Upload dropzone with claim-on-sign-in |
| `/scan/report/[id]?token=` | Token-gated report + on-demand AI remediation |
| `/dashboard` | Overview — stat cards, active vulnerabilities, recent tasks, "am I cooked?" verdict |
| `/dashboard/agents` | Agent Sources — per-session installed packages + unreviewed flags |
| `/dashboard/projects` | Projects table — deps, vulnerabilities, risk, last scanned |
| `/dashboard/dependencies` | Dependency inventory — searchable master-detail + create fix task |
| `/dashboard/vulnerabilities` | Vulnerability triage — reachable filter, expandable affected projects |
| `/dashboard/scans` | Scan history |
| `/dashboard/watchlist` | Watched packages |
| `/admin` | Full AI review panel with 6 warning types |
| `/settings` | Digest preferences |
| `/learn`, `/learn/[slug]` | Beginner articles |
| `/signin` | GitHub OAuth |
| `/privacy`, `/terms`, `/security` | Legal pages |
| `/api/incidents` | GET with enum-validated query params |
| `/api/scan/upload` | POST with rate limit + access token |
| `/api/scan/report/[id]` | GET requires token or owner session |
| `/api/scan/claim` | POST links anonymous scans to signed-in user |
| `/api/scan/history` | GET auth required |
| `/api/ai/generate` | Admin-only AI workflows |
| `/api/ai/remediation` | Token-gated scan remediation |
| `/api/ai/status` | Admin AI provider status |
| `/api/copilot/chat` | Rate limited copilot |
| `/api/admin/incidents/*` | CRUD, publish, archive |
| `/api/watchlist` | Watched package CRUD |
| `/api/newsletter/subscribe` | Newsletter capture |
| `/api/newsletter/unsubscribe` | Unsubscribe |
| `/api/user/preferences` | Digest preferences |
| `/api/cron/digest` | Weekly + critical jobs |

## Quality Gates

- `pnpm typecheck` — pass
- `pnpm lint` — pass
- `pnpm test` — pass
- `pnpm build` — pass
- `pnpm --filter @iamcooked/web test:e2e` — Playwright suite

## QA

- Report: [docs/QA_REPORT.md](docs/QA_REPORT.md)
- Last QA pass: 2026-06-25

## Launch Checklist

- [x] Critical digest package matching
- [x] QA report + Playwright E2E
- [x] CI workflow (`.github/workflows/ci.yml`)
- [x] `.env.example` complete
- [x] Trust marquee accuracy (OSV, GitHub, CISA, npm only)
- [x] Production image assets (CSS backdrops, no picsum)

## Vercel deployment

1. Link project and set env vars from `.env.example`
2. Set `DATABASE_URL` to production Postgres (Neon recommended)
3. Run migrations: `pnpm --filter @iamcooked/db db:migrate deploy`
4. Set `CRON_SECRET` — Vercel cron sends `Authorization: Bearer <secret>`
5. Configure Upstash Redis for rate limiting
6. Verify Resend domain for `newsletter@` and `alerts@` senders
7. Set `NEXT_PUBLIC_APP_URL` to production domain

Cron schedules in `vercel.json`:

- Weekly digest: Mondays 09:00 UTC
- Critical alerts: Daily 08:00 UTC

## Environment Variables

See [.env.example](.env.example) for full list with comments.

## Deferred (post-MVP)

- Saved `Project` / GitHub repo connection
- NVD API integration
- Vercel AI Gateway OIDC migration (optional)
