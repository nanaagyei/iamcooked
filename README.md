<h1 align="center">iamcooked</h1>

<p align="center">
  <strong>Your AI agent installed 247 packages. Are you cooked?</strong>
  <br>
  Find out when your dependencies, your MCP servers, and the AI coding tools themselves are hit by a CVE or a malicious release. You get it in plain English, with the exact command to fix it.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#what-it-checks">What it checks</a> ·
  <a href="#use-it-in-ci">CI</a> ·
  <a href="#the-web-app">Web app</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT license">
  <img src="https://img.shields.io/badge/data-OSV.dev%20%C2%B7%20GitHub%20Advisories%20%C2%B7%20CISA%20KEV-orange?style=flat-square" alt="Data sources">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome">
</p>

---

## Why

Vibecoding moved the attack surface. Your agent picks packages you never reviewed, wires up MCP servers by
pasting `npx -y some-server` into a config, and the agent CLIs themselves ship CVEs every few weeks. The
information exists, scattered across OSV, GitHub Advisories, CISA, vendor blogs and Reddit, but nobody
reads CVE feeds while shipping.

iamcooked answers four questions:

1. **Am I affected?** Exact package + version matching across your whole repo, not "you use lodash somewhere".
2. **How bad is it?** Real CVSS scores, actively-exploited (CISA KEV) and known-malware flags, dev vs. prod.
3. **What do I run?** The fix command for *your* package manager, on *your* release line.
4. **Will I hear about the next one?** Tool Watch, watchlist emails, and a daily CI job.

## Quick start

```bash
npx iamcooked            # scan every lockfile in this repo + project MCP configs
npx iamcooked mcp        # check every MCP config on this machine (Cursor, Claude, Windsurf, VS Code…)
npx iamcooked tools      # check installed AI agents (Claude Code, Codex, Gemini CLI, Aider) + global packages
npx iamcooked doctor     # all of the above
```

```
  WELL DONE  risk 60/100
  Some serious findings are live. Worth a focused afternoon of patching.
  5 critical · 31 high · 53 medium advisories across 7 packages

  Fix these first

  CRITICAL  mcp-remote 0.1.10 → 0.1.16  npm
            mcp-remote exposed to OS command injection via untrusted MCP server connections
            you depend on it directly · used by MCP server linear
            CVE-2025-6514 · GHSA-6xpm-ggf7-wc3p  https://github.com/advisories/GHSA-6xpm-ggf7-wc3p
            → In your MCP config, change "mcp-remote@0.1.10" to "mcp-remote@0.1.16" and restart your editor.
            in .cursor/mcp.json

  CRITICAL  next 14.1.0 → 14.2.25  npm
            Authorization Bypass in Next.js Middleware
            you depend on it directly
            CVE-2025-29927 · GHSA-f82v-jwr5-mffw  https://github.com/advisories/GHSA-f82v-jwr5-mffw
            $ pnpm add next@^14.2.25
```

No account, no API key, zero runtime dependencies. Only package names and versions leave your machine.
Full CLI docs: [`packages/cli/README.md`](packages/cli/README.md).

## What it checks

| | |
|---|---|
| **JavaScript / TypeScript** | `package-lock.json`, `pnpm-lock.yaml` (v5–v9), `yarn.lock` (v1 + Berry), `bun.lock` |
| **Python** | `requirements*.txt`, `poetry.lock`, `uv.lock`, `Pipfile.lock` |
| **Go** | `go.mod`, including **Go standard-library** CVEs from your `go`/`toolchain` line |
| **Rust · Ruby · PHP** | `Cargo.lock` · `Gemfile.lock` · `composer.lock` |
| **MCP configs** | Vulnerable/malicious server packages, hard-coded API keys, unpinned `npx -y` installs, plain-HTTP remotes, whole-disk filesystem access, `curl \| sh` launchers |
| **AI tools** | Claude Code, Codex CLI, Gemini CLI, Aider, MCP SDKs, LangChain, LiteLLM, Next.js, Supabase and ~40 more in [Tool Watch](packages/core/src/tools.ts) |

**Data sources:** [OSV.dev](https://osv.dev) (aggregating GitHub Advisories, PyPA, Go, RustSec, RubySec and
the [OpenSSF malicious-packages](https://github.com/ossf/malicious-packages) feed) and
[CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog). Severities come from the advisory,
never from an LLM.

## Use it in CI

```yaml
# .github/workflows/iamcooked.yml
on: [pull_request]
jobs:
  iamcooked:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nanaagyei/iamcooked@main
        with:
          fail-on: high       # malware always fails
          prod-only: "true"   # ignore dev-only deps
```

You get a plain-English job summary on every run. Add `sarif: iamcooked.sarif` plus
`github/codeql-action/upload-sarif` to see findings in the Security tab. There's a full example in
[`.github/workflows/iamcooked-example.yml.sample`](.github/workflows/iamcooked-example.yml.sample).
Outside GitHub, use `npx iamcooked --ci` (exit 1 on high/critical) or `--format json|markdown|sarif`.

## The web app

For people who'd rather not touch a terminal, and for staying informed over time:

- **Scan**: drop a lockfile and get a shareable risk report with fix commands and an AI remediation plan.
- **Tool Watch** (`/tools`): live CVE status for the AI coding stack. Check your version in one click.
- **MCP check** (`/mcp`): paste a config. It's analysed in the browser, so secrets never leave the tab.
- **Watchlist + alerts**: watch any package or tool and get an email the day a new advisory is published.
- **Incidents + Learn**: curated, source-backed briefs on supply-chain attacks, written for beginners.
- **Dashboard**: projects, dependencies, vulnerability triage, and which agent session installed what.

### Running it locally

Prerequisites: Node.js ≥ 20, pnpm ≥ 10, Docker.

```bash
git clone https://github.com/nanaagyei/iamcooked.git && cd iamcooked
pnpm install
cp .env.example apps/web/.env.local && cp .env.example packages/db/.env
docker compose up -d
pnpm --filter @iamcooked/db db:push && pnpm --filter @iamcooked/db db:seed
pnpm dev   # http://localhost:3000
```

Everything optional degrades gracefully: without `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` AI summaries are
off, without `RESEND_API_KEY` emails are skipped, without `GITHUB_TOKEN` GitHub enrichment is skipped.
Scheduled jobs call `/api/cron/digest?type=weekly|critical|advisories` with `Authorization: Bearer $CRON_SECRET`.

## Architecture

```
packages/scanner   lockfile + MCP config parsers        pure TS, also runs in the browser
packages/core      OSV client · CVSS · fix selection    zero dependencies, shared by CLI + web
                   scoring · verdict · Tool Watch list
packages/cli       npx iamcooked                        bundled to one file with esbuild
apps/web           Next.js 15 app + API routes          Tailwind 4, shadcn/ui, Prisma, Auth.js
packages/sources   DB-backed jobs                       digests, watchlist alerts, KEV, GitHub enrichment
packages/ai        structured LLM pipelines             Zod-validated, never the source of facts
packages/db        Prisma schema + seed                 PostgreSQL 16
```

Design notes and product specs live in [`docs/specs`](docs/specs); implementation history is in
[`docs/specs/IMPLEMENTATION_STATUS.md`](docs/specs/IMPLEMENTATION_STATUS.md).

## Principles

- **Source-backed.** Every finding links to an advisory. AI summarises; it never decides severity.
- **Beginner-first.** Plain English first, technical depth one click away.
- **Actionable.** Every finding ends in a command or a concrete next step.
- **Private by default.** Only names and versions are sent anywhere; MCP configs are analysed locally.
- **No panic.** Calm, precise copy. Being "cooked" is fixable.

## Roadmap

Ideas we'd love help with. See [CONTRIBUTING.md](CONTRIBUTING.md):

- [ ] More ecosystems: Maven/Gradle, NuGet, Swift, Dart/Pub
- [ ] VS Code / Cursor extension CVE tracking (extensions aren't in OSV yet)
- [ ] Reachability hints: is the vulnerable function actually imported?
- [ ] Slopsquatting checks: flag packages that don't exist or were published days ago
- [ ] `iamcooked fix`: apply safe patch/minor upgrades automatically
- [ ] Codex `config.toml` and other TOML-based MCP configs
- [ ] Slack/Discord alert channels

## Contributing

Contributions of every size are welcome. Adding a tool to Tool Watch is a one-line PR. Start with
[CONTRIBUTING.md](CONTRIBUTING.md). Please read the [Code of Conduct](CODE_OF_CONDUCT.md), and report
security issues privately per [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
