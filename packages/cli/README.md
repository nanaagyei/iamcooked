# iamcooked (CLI)

> Your AI agent installed 247 packages. Are you cooked?

`iamcooked` checks your project's lockfiles, your **MCP server configs** and the **AI coding tools installed on your machine** against [OSV.dev](https://osv.dev) (GitHub Advisories, PyPA, Go, RustSec, RubySec and the OpenSSF malicious-packages feed) and CISA's Known Exploited Vulnerabilities catalog. Then it tells you, in plain English, what's wrong and the exact command to fix it.

```bash
npx iamcooked
```

```
  WELL DONE  risk 60/100
  Some serious findings are live. Worth a focused afternoon of patching.
  5 critical · 31 high · 53 medium advisories across 7 packages

  Fix these first

  CRITICAL  mcp-remote 0.1.10 → 0.1.16  npm
            mcp-remote exposed to OS command injection via untrusted MCP server connections
            you depend on it directly · used by MCP server remote
            CVE-2025-6514 · GHSA-6xpm-ggf7-wc3p  https://github.com/advisories/GHSA-6xpm-ggf7-wc3p
            $ npm install mcp-remote@^0.1.16
            in .cursor/mcp.json
```

No account, no API key, zero runtime dependencies. Only package names and versions leave your machine.

## Commands

| Command | What it checks |
|---|---|
| `npx iamcooked [path]` | Every lockfile under `path` plus project MCP configs (`.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json`) |
| `npx iamcooked mcp` | MCP configs for Cursor, Claude Desktop, Claude Code, Windsurf, VS Code, Zed, Gemini CLI and Amazon Q on this machine |
| `npx iamcooked tools` | Installed AI agents (Claude Code, Codex CLI, Gemini CLI, Aider…), global npm packages and pipx apps |
| `npx iamcooked doctor` | All of the above |

## Supported ecosystems

| Ecosystem | Files |
|---|---|
| JavaScript / TypeScript | `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml` (v5–v9), `yarn.lock` (v1 + Berry), `bun.lock` |
| Python | `requirements*.txt`, `poetry.lock`, `uv.lock`, `Pipfile.lock` |
| Go | `go.mod` (modules **and** the Go standard library via your `go`/`toolchain` line) |
| Rust | `Cargo.lock` |
| Ruby | `Gemfile.lock` |
| PHP | `composer.lock` |

## MCP config checks

On top of CVEs in the packages your MCP servers launch, iamcooked flags:

- **Hard-coded secrets** in `env`, `headers` or args (never printed in full)
- **Unpinned packages** (`npx -y some-server`, which runs whatever was published last)
- **Remote servers over plain HTTP**
- **Filesystem servers with access to your whole home directory or disk**
- **`curl … | sh`** launchers and floating Docker tags

## CI

```bash
npx iamcooked --ci                                   # exit 1 on high/critical (malware always counts)
npx iamcooked --fail-on critical --prod              # ignore dev-only deps
npx iamcooked --format sarif -o iamcooked.sarif      # GitHub code scanning
npx iamcooked --format markdown > report.md          # PR comments
```

Inside GitHub Actions, a Markdown job summary is added automatically. There's also a ready-made action:

```yaml
- uses: nanaagyei/iamcooked@main
  with:
    fail-on: high
```

Exit codes: `0` ok, `1` findings at or above `--fail-on`, `2` usage or network error.

## License

MIT
