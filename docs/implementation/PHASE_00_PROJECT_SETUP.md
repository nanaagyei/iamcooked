# Phase 00: Project Setup

## Objective

Initialize the iamcooked monorepo with a production-ready foundation.

## Tasks

### 1. Create Monorepo

Use npm workspaces.

Required structure:

```txt

apps/web

apps/worker

packages/db

packages/ui

packages/scanner

packages/ai

packages/sources

packages/validators

2. Create Web App

Use:

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* lucide-react
* TanStack Query

3. Configure Shared Tooling

Add:

* ESLint
* Prettier
* TypeScript strict mode
* zod
* dotenv validation
* Prisma
* Vitest
* Playwright later

4. Environment Variables

Create .env.example.

Required:
DATABASE_URL=
OPENAI_API_KEY=
GITHUB_TOKEN=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
OSV_API_BASE_URL=https://api.osv.dev

5. Quality Gates

The app must pass:
npm run lint
npm run typecheck
npm run test
npm run build

Acceptance Criteria

* App boots locally.
* Database package exists.
* Shared packages compile.
* TypeScript strict mode enabled.
* README setup instructions work.