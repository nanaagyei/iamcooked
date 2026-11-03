<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/pnpm-10-orange?style=flat-square&logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/Turborepo-2.x-EF4444?style=flat-square&logo=turborepo" alt="Turborepo">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

<h1 align="center">iamcooked</h1>

<p align="center">
  <strong>Your AI agent installed 247 packages. Are you cooked?</strong>
  <br>
  The dependency vibe check for people who ship fast — turn CVEs, supply-chain attacks, and package compromises into plain-English briefs and a clear "am I cooked?" verdict.
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#api">API</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## Why iamcooked?

Modern builders ship fast with AI coding tools — Cursor, Claude, ChatGPT, Bolt, Lovable. Those agents install packages, wire up auth, and generate production code. But many builders don't know when those dependencies become risky.

iamcooked bridges that gap. Instead of reading scattered CVE feeds, GitHub advisories, Reddit threads, and vendor blogs, iamcooked answers:

- **What happened?**
- **Does my project use the affected package?**
- **How urgent is this?**
- **What should I do next?**

## Core Promise

> Paste your lockfile. We'll tell you — in plain English — whether you're cooked, and exactly what to fix first.

## Features

- **"Am I cooked?" verdict** — A single playful cooked-meter (`not cooked` → `getting toasty` → `burnt to a crisp`) layered over the real risk score
- **Agent Sources** — Track what each AI coding session (Cursor, Claude Code, Lovable, Replit, v0, Windsurf, Bolt) actually installed, and flag the packages nobody ever reviewed
- **Workspace dashboard** — Persistent-sidebar app shell with Overview, Agent Sources, Projects, Dependencies, and Vulnerabilities views
- **Vulnerability triage** — Package, CVE, reachability, affected projects, and status (Open / In progress / Done) with expandable rows
- **Dependency inventory** — Searchable master-detail of every package: severity, reachability, fix availability, who depends on it, and one-click "Create fix task"
- **Incident Feed** — Curated, source-backed security incidents with severity, confidence, and beginner-friendly summaries
- **Lockfile Scanner** — Upload `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` to check dependencies against known vulnerabilities
- **AI-Powered Summaries** — Structured, Zod-validated LLM output for incident extraction, beginner TLDRs, technical summaries, and remediation plans
- **Newsletter Digest** — Weekly security briefs with critical alerts when your packages are affected
- **Every Claim Source-Backed** — Confidence labels on all content. AI never invents facts; the cooked verdict is always backed by OSV / GitHub Advisories / CISA KEV.

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10
- **Docker** (for local PostgreSQL)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/iamcooked.git
cd iamcooked

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Push database schema
pnpm --filter @iamcooked/db db:push

# Seed with sample incidents
pnpm --filter @iamcooked/db db:seed

# Start the dev server
pnpm dev
```

Visit `http://localhost:3000`.

### Environment Variables

Copy `.env.example` to `apps/web/.env.local` and `packages/db/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iamcooked_dev"
OPENAI_API_KEY="sk-..."           # Optional — for AI summaries
ANTHROPIC_API_KEY="sk-ant-..."    # Optional — alternative AI provider
GITHUB_TOKEN="ghp_..."            # Optional — for GitHub Advisory enrichment
RESEND_API_KEY="re_..."           # Optional — for email digests
NEXT_PUBLIC_APP_URL="http://localhost:3000"
OSV_API_BASE_URL="https://api.osv.dev"
```

### Quality Gates

```bash
pnpm typecheck   # TypeScript strict mode across all packages
pnpm lint        # ESLint flat config
pnpm build       # Next.js production build
pnpm test        # Vitest (scanner + AI packages)
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    apps/web                       │
│              Next.js 15 · App Router              │
│    Tailwind 4 · shadcn/ui · TanStack Query       │
├─────────────────────────────────────────────────┤
│  Dashboard (persistent sidebar shell):           │
│  /dashboard (Overview) · /dashboard/agents        │
│  /dashboard/projects · /dashboard/dependencies    │
│  /dashboard/vulnerabilities                        │
│  Marketing: / · /incidents · /scan · /learn        │
│  API routes  │  Server Components                 │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬──────────┐
    │          │          │          │          │
┌───▼──┐ ┌────▼───┐ ┌───▼───┐ ┌───▼───┐ ┌────▼───┐
│  db  │ │scanner │ │  ai   │ │sources│ │valida- │
│Prisma│ │npm/yarn│ │OpenAI │ │ OSV   │ │ tors   │
│ PG   │ │ /pnpm  │ │Anthro-│ │ CISA  │ │ zod    │
│      │ │ parser │ │ pic   │ │ KEV   │ │schemas │
└──────┘ └────────┘ └───────┘ └───────┘ └────────┘
```

## Project Structure

```
iamcooked/
├── apps/
│   ├── web/                    # Next.js 15 frontend + API routes
│   │   └── src/
│   │       ├── app/            # Pages + API routes
│   │       ├── components/     # App-specific UI (re-exports @iamcooked/ui)
│   │       └── lib/            # Queries, scoring, auth, admin warnings
│   └── worker/                 # CLI digest runner (cron uses /api/cron/digest on Vercel)
├── packages/
│   ├── ai/                     # AI provider abstraction, prompt templates, Zod schemas
│   ├── db/                     # Prisma schema, client, seed script
│   ├── scanner/                # Lockfile parsers (npm, pnpm, yarn)
│   ├── sources/                # OSV, CISA KEV, email digests
│   ├── ui/                     # Shared badges, feedback, layout primitives
│   └── validators/             # Zod schemas (env, scan, newsletter)
├── docs/                       # Specifications, QA report, agent instructions
├── IMPLEMENTATION_STATUS.md    # Phase status and launch checklist
├── docker-compose.yml          # PostgreSQL 16
├── turbo.json                  # Turborepo pipeline
├── pnpm-workspace.yaml         # Workspace config
└── tsconfig.base.json          # Shared TypeScript config
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/incidents` | `GET` | List published incidents (filterable) |
| `/api/incidents/:slug` | `GET` | Single incident by slug |
| `/api/scan/upload` | `POST` | Upload and scan a lockfile |
| `/api/scan/report/:id` | `GET` | Retrieve a scan report (token or session) |
| `/api/scan/claim` | `POST` | Claim anonymous scans after sign-in |
| `/api/scan/history` | `GET` | User scan history |
| `/api/ai/generate` | `POST` | Admin AI workflows |
| `/api/ai/remediation` | `POST` | On-demand scan remediation |
| `/api/copilot/chat` | `POST` | Security copilot |
| `/api/admin/incidents/*` | `GET/POST/PATCH` | Admin incident management |
| `/api/watchlist` | `GET/POST/DELETE` | Watched packages |
| `/api/newsletter/subscribe` | `POST` | Subscribe to digest |
| `/api/newsletter/unsubscribe` | `GET` | Unsubscribe |
| `/api/user/preferences` | `GET/PATCH` | Digest preferences |
| `/api/cron/digest` | `GET` | Weekly/critical digest cron |

### Scan Upload

```bash
curl -X POST http://localhost:3000/api/scan/upload \
  -F "file=@package-lock.json"
```

**Response:**
```json
{
  "scanReportId": "clx...",
  "riskLevel": "MEDIUM",
  "riskScore": 45,
  "findingCount": 3,
  "ecosystem": "NPM",
  "dependencyCount": 247
}
```

### Error Shape

All errors follow the same structure:

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds the 10MB limit."
  }
}
```

## Data Sources

| Source | Tier | Usage |
|---|---|---|
| [OSV](https://osv.dev) | 1 — Authoritative | Package vulnerability matching |
| [GitHub Advisory Database](https://github.com/advisories) | 1 — Authoritative | Advisory lookup, CVE/GHSA references |
| [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | 1 — Authoritative | Known exploitation detection |
| Vendor Blogs | 2 — Research | Incident context, timelines |
| Community Posts | 3 — Signal only | Never treated as confirmed without corroboration |

## Design Principles

- **Source-backed.** Every claim traces to an advisory, article, or maintainer statement.
- **Beginner-first.** Plain English before technical depth. Jargon explained inline.
- **Label uncertainty.** Every incident shows Confirmed / Likely / Developing / Unverified / Disputed.
- **No panic.** Risk information is calm, precise, and actionable — never fear-driven.
- **AI is a summarizer, not a source.** LLM output is always validated and never published unreviewed.

## Contributing

We welcome contributions. Here's how to get started:

1. **Read the docs.** Start with [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) and [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md).
2. **Find an issue.** Check open issues or the implementation status for gaps.
3. **Follow the conventions.**
   - TypeScript strict mode everywhere
   - shadcn/ui components with the dark-first design system
   - Zod validation on all API inputs and AI outputs
   - ESLint flat config (run `pnpm lint` before committing)
4. **Open a PR.** Include a description, screenshots if UI changes, and verify `pnpm build` passes.

### Development Workflow

```bash
# Run dev server with Turbopack
pnpm dev

# Type-check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Run tests
pnpm test

# Run E2E tests (starts dev server)
pnpm --filter @iamcooked/web test:e2e

# Build for production
pnpm build

# Format code
pnpm format
```

### Database

```bash
# Start PostgreSQL
docker compose up -d

# Push schema changes
pnpm --filter @iamcooked/db db:push

# Re-seed sample data
pnpm --filter @iamcooked/db db:seed

# Open Prisma Studio
pnpm --filter @iamcooked/db db:studio
```

## License

MIT © iamcooked

---

<p align="center">
  <sub>Built with TypeScript, Next.js, Prisma, and PostgreSQL. Designed for clarity, built for trust.</sub>
</p>
