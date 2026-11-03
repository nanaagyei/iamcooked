import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { OsvClient, analyzeDependencies, loadKevSet, type CoreEcosystem } from "@iamcooked/core";
import { parseLockfile, analyzeMcpConfig, type NormalizedDependency } from "@iamcooked/scanner";
import { HELP, parseArgs, UsageError, type CliOptions } from "./args";
import { c } from "./ansi";
import { findLockfiles, findProjectMcpConfigs, globalMcpConfigCandidates, type DiscoveredFile } from "./discover";
import { buildReport, shouldFail, type LockfileSummary, type McpFileSummary, type Report } from "./report";
import { detectInstalledTools } from "./tools";
import { renderText } from "./render/text";
import { renderMarkdown } from "./render/markdown";
import { renderSarif } from "./render/sarif";

declare const __IAMCOOKED_VERSION__: string | undefined;
const VERSION = typeof __IAMCOOKED_VERSION__ === "string" ? __IAMCOOKED_VERSION__ : "0.0.0-dev";

function progress(opts: CliOptions, msg: string) {
  if (opts.quiet || !process.stderr.isTTY) return;
  process.stderr.write(`\r\x1b[2K  ${c.dim(msg)}`);
}
function clearProgress(opts: CliOptions) {
  if (opts.quiet || !process.stderr.isTTY) return;
  process.stderr.write("\r\x1b[2K");
}

function shortPath(p: string): string {
  const home = homedir();
  return p.startsWith(home) ? `~${p.slice(home.length)}` : p;
}

export async function run(argv: string[]): Promise<number> {
  let opts: CliOptions;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    if (e instanceof UsageError) {
      process.stderr.write(`${c.red("error")} ${e.message}\n${HELP}`);
      return 2;
    }
    throw e;
  }
  if (opts.command === "help") {
    process.stdout.write(HELP);
    return 0;
  }
  if (opts.command === "version") {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const root = resolve(opts.paths[0]!);
  const scanProject = opts.command === "scan" || opts.command === "doctor";
  const scanGlobalMcp = opts.command === "mcp" || opts.command === "doctor";
  const scanTools = opts.command === "tools" || opts.command === "doctor";

  const deps: NormalizedDependency[] = [];
  const lockfiles: LockfileSummary[] = [];
  const mcpFiles: McpFileSummary[] = [];
  const mcpIssues: Report["mcpIssues"] = [];
  const pathMap = new Map<string, string>();

  // ---- lockfiles
  if (scanProject) {
    progress(opts, "Finding lockfiles…");
    const files = opts.paths.flatMap((p) => findLockfiles(p));
    for (const f of files) {
      pathMap.set(f.display, f.path);
      let raw: string;
      try {
        raw = readFileSync(f.path, "utf8");
      } catch (e) {
        lockfiles.push({ display: f.display, dependencies: 0, error: (e as Error).message });
        continue;
      }
      const result = parseLockfile(f.display, raw);
      if ("message" in result) {
        lockfiles.push({ display: f.display, dependencies: 0, error: result.message });
        continue;
      }
      lockfiles.push({ display: f.display, ecosystem: result.ecosystem as CoreEcosystem, dependencies: result.dependencies.length });
      deps.push(...result.dependencies);
    }
  }

  // ---- MCP configs
  const mcpCandidates: Array<DiscoveredFile & { client?: string }> = [];
  if (scanProject && opts.mcp) mcpCandidates.push(...findProjectMcpConfigs(root));
  if (scanGlobalMcp) {
    mcpCandidates.push(...findProjectMcpConfigs(root));
    mcpCandidates.push(...globalMcpConfigCandidates());
  }
  const seenMcp = new Set<string>();
  for (const f of mcpCandidates) {
    if (seenMcp.has(f.path)) continue;
    seenMcp.add(f.path);
    pathMap.set(f.display, f.path);
    try {
      const analysis = analyzeMcpConfig(readFileSync(f.path, "utf8"), f.display);
      if (analysis.servers.length === 0 && f.client) continue; // e.g. Zed/Gemini settings without MCP
      mcpFiles.push({ display: f.display, client: f.client, servers: analysis.servers.length });
      mcpIssues.push(...analysis.issues.map((i) => ({ ...i, file: f.display })));
      deps.push(...analysis.dependencies.map((d) => ({ ...d, sourceFile: f.display })));
    } catch (e) {
      mcpFiles.push({ display: f.display, client: f.client, servers: 0, error: `Could not parse: ${(e as Error).message}` });
    }
  }

  // ---- installed tools
  let detectedTools: Report["detectedTools"] = [];
  if (scanTools) {
    progress(opts, "Detecting installed AI tools…");
    const t = await detectInstalledTools();
    detectedTools = t.detected;
    deps.push(...t.dependencies);
  }

  if (scanProject && lockfiles.length === 0 && mcpFiles.length === 0 && opts.command === "scan") {
    clearProgress(opts);
    process.stderr.write(
      `\n  ${c.yellow("No lockfiles found")} in ${shortPath(root)}\n\n  iamcooked reads lockfiles (package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lock,\n  poetry.lock, uv.lock, requirements.txt, go.mod, Cargo.lock, Gemfile.lock, composer.lock).\n  Run your package manager's install once to create one, or try ${c.bold("npx iamcooked doctor")}\n  to check your MCP servers and AI tools instead.\n\n`,
    );
    return 0;
  }

  // ---- analyze
  const osv = new OsvClient({ userAgent: `iamcooked-cli/${VERSION}` });
  const kev = opts.kev ? loadKevSet() : Promise.resolve(new Set<string>());
  let analysis;
  try {
    analysis = await analyzeDependencies(deps, {
      osv,
      isKev: async (cve) => (await kev).has(cve),
      onProgress: (stage, { total }) => {
        if (stage === "query") progress(opts, `Checking ${total} packages against OSV.dev…`);
        if (stage === "hydrate") progress(opts, `Fetching details for ${total} advisories…`);
      },
    });
  } catch (e) {
    clearProgress(opts);
    process.stderr.write(`\n  ${c.red("Could not reach OSV.dev")}: ${(e as Error).message}\n  Check your network/proxy and try again.\n\n`);
    return 2;
  }
  clearProgress(opts);

  const report = buildReport({
    version: VERSION,
    root: shortPath(root),
    lockfiles,
    mcpFiles,
    mcpIssues,
    detectedTools,
    analysis,
  });

  let output: string;
  switch (opts.format) {
    case "json":
      output = JSON.stringify(report, null, 2) + "\n";
      break;
    case "markdown":
      output = renderMarkdown(report, { showDev: opts.showDev });
      break;
    case "sarif":
      output = renderSarif(report, pathMap) + "\n";
      break;
    default:
      output = renderText(report, { verbose: opts.verbose, limit: opts.all ? Infinity : 15, showDev: opts.showDev });
  }

  if (opts.output) {
    writeFileSync(opts.output, opts.format === "text" ? output.replace(/\x1b\[[0-9;]*m/g, "") : output);
    if (!opts.quiet) process.stderr.write(`  Report written to ${opts.output} — ${report.verdict.label} (risk ${report.riskScore}/100)\n`);
  } else {
    process.stdout.write(output);
  }

  // GitHub Actions: add a job summary automatically
  const summaryFile = process.env["GITHUB_STEP_SUMMARY"];
  if (summaryFile && opts.format !== "markdown") {
    try {
      writeFileSync(summaryFile, renderMarkdown(report, { showDev: opts.showDev }), { flag: "a" });
    } catch {
      /* not fatal */
    }
  }

  return shouldFail(report, opts.failOn, opts.showDev) ? 1 : 0;
}

if (!process.env["VITEST"]) run(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (err: unknown) => {
    process.stderr.write(`\n  ${c.red("Unexpected error")}: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n  Please report it: https://github.com/nanaagyei/iamcooked/issues\n`);
    process.exitCode = 2;
  },
);
