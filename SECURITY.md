# Security Policy

iamcooked is a security tool, so we take reports about it seriously.

## Reporting a vulnerability

**Please don't open a public issue for security problems.** Use GitHub's
[private vulnerability reporting](https://github.com/nanaagyei/iamcooked/security/advisories/new) instead.

Please include:

- what's affected (CLI, web app, a specific package or route),
- steps to reproduce or a proof of concept,
- the impact as you understand it.

We aim to acknowledge reports within 3 business days and to ship a fix or mitigation for confirmed
high/critical issues within 14 days. We're happy to credit you in the advisory.

## In scope

- The `iamcooked` CLI (`packages/cli`) and the libraries it bundles (`packages/core`, `packages/scanner`)
- The web app (`apps/web`), including its API routes
- The GitHub Action (`action.yml`)

Examples of things we especially want to hear about: a lockfile or MCP config that causes code execution
or path traversal, secrets from an MCP config leaving the browser or being printed in full, SSRF via
configurable URLs, auth bypass on scan reports, and **false negatives**: a known-vulnerable or malicious
package version that iamcooked reports as clean.

## Out of scope

- Vulnerabilities in third-party packages that iamcooked *reports on* (report those upstream, or to
  [OSV](https://osv.dev) / [GitHub Advisories](https://github.com/advisories))
- Rate-limit tuning, missing security headers without demonstrated impact, or social engineering

## Supported versions

Only the latest release of the CLI and the current `main` branch of the web app receive security fixes.
