# Contributing to iamcooked

Thanks for helping vibecoders find out whether they're cooked. 🔥

The project has two halves, and both are easy to contribute to:

| Area | Where | Good first contributions |
|---|---|---|
| **CLI + engine** | `packages/cli`, `packages/core`, `packages/scanner` | New lockfile parser, MCP client config location, new MCP risk check, better fix commands |
| **Web app** | `apps/web` | Tool Watch UX, scan report polish, accessibility, copy |
| **Data** | `packages/core/src/tools.ts`, `apps/web/src/lib/learn-content.ts` | Add a tool to Tool Watch, write a beginner explainer |

Look for issues labelled [`good first issue`](https://github.com/nanaagyei/iamcooked/labels/good%20first%20issue)
and [`help wanted`](https://github.com/nanaagyei/iamcooked/labels/help%20wanted).

## Setup

You need Node.js ≥ 20 and pnpm ≥ 10. Docker is only needed for the web app's database.

```bash
git clone https://github.com/nanaagyei/iamcooked.git
cd iamcooked
pnpm install
```

### Working on the CLI (no database needed)

```bash
pnpm --filter iamcooked dev -- .            # run the CLI from source against this repo
pnpm --filter iamcooked dev -- doctor       # try the other commands
pnpm --filter iamcooked build               # bundle to packages/cli/dist/iamcooked.mjs
pnpm --filter @iamcooked/core test
pnpm --filter @iamcooked/scanner test
pnpm --filter iamcooked test
```

### Working on the web app

```bash
cp .env.example apps/web/.env.local     # and packages/db/.env
docker compose up -d                    # Postgres 16
pnpm --filter @iamcooked/db db:push
pnpm --filter @iamcooked/db db:seed
pnpm dev                                # http://localhost:3000
```

## Architecture in 30 seconds

```
packages/scanner   lockfile + MCP config parsers   → NormalizedDependency[]   (pure TS, runs in browsers)
packages/core      OSV client, CVSS, fixes, scoring → VulnFinding[] + verdict (zero dependencies)
packages/cli       npx iamcooked                    → text / json / markdown / sarif
apps/web           Next.js app + API                → scan reports, Tool Watch, MCP check, alerts
packages/sources   DB-backed jobs (digests, alerts, KEV, GitHub enrichment)
```

The CLI and the web app share `scanner` + `core`, so a parser or scoring fix lands in both.

## Recipes

### Adding a lockfile format

1. Add a parser in `packages/scanner/src/parsers/` that returns `NormalizedDependency[]`. Set `direct`
   and `dev` when the format tells you; leave `version: null` for unpinned entries.
2. Register the filename in `LOCKFILES` in `packages/scanner/src/index.ts`.
3. If it's a new ecosystem, add it to `CoreEcosystem`, `OSV_ECOSYSTEM` and `ECOSYSTEM_LABEL` in
   `packages/core/src/ecosystems.ts` and add fix commands in `packages/core/src/fix.ts`.
4. Add a test with a small, real-world fixture in `packages/scanner/src/__tests__/ecosystems.test.ts`.

### Adding a tool to Tool Watch

Add one entry to `TOOL_CATALOG` in `packages/core/src/tools.ts`:

```ts
{ id: "my-tool", name: "My Tool", category: "agent", ecosystem: "NPM", packageName: "my-tool",
  bin: "my-tool", description: "One line, plain English.", homepage: "https://…" },
```

Rules: the package must exist on its registry under that exact name (that's what OSV tracks), and
`bin` should only be set if `<bin> --version` prints the package version.

### Adding an MCP client or risk check

- New config location → `globalMcpConfigCandidates()` in `packages/cli/src/discover.ts`.
- New config shape → `collectServerMaps()` in `packages/scanner/src/mcp.ts`.
- New risk check → `analyzeServer()` in the same file. Every issue needs a plain-English `detail` and a
  concrete `fix`, and **must never echo a full secret** (use `mask()`).

## Conventions

- TypeScript strict mode everywhere. Run `pnpm typecheck && pnpm lint && pnpm test` before pushing.
- `packages/core` and `packages/scanner` stay **dependency-free** (scanner's `yaml` is the one
  exception) and must not import Node built-ins, so they keep working in the browser.
- **Copy is calm and concrete.** Say what happened, whether you're affected, and the exact fix. No
  fear-mongering, no unexplained jargon.
- **Never invent facts.** Severities, fix versions and "actively exploited" flags must come from a
  source (OSV, GitHub Advisories, CISA KEV), not from heuristics or an LLM.
- Conventional-ish commit subjects are appreciated (`scanner: support bun.lock`), not required.

## Pull requests

1. Fork, branch from `main`, keep the PR focused.
2. Add or update tests. Parser PRs need a fixture.
3. Include before/after screenshots for UI changes and sample CLI output for CLI changes.
4. CI must be green (typecheck, lint, unit tests, build, and iamcooked scanning itself).

By contributing you agree that your work is released under the [MIT License](LICENSE) and that you'll
follow the [Code of Conduct](CODE_OF_CONDUCT.md).
