import { execFile } from "node:child_process";
import { TOOL_CATALOG, type ToolEntry } from "@iamcooked/core";
import type { NormalizedDependency } from "@iamcooked/scanner";
import type { DetectedTool } from "./report";

function run(cmd: string, args: string[], timeoutMs = 8000): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, windowsHide: true, shell: process.platform === "win32", maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
      resolve(err ? null : stdout.toString());
    });
  });
}

const VERSION_RE = /(\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.]+)?)/;

/** Global npm packages (`npm ls -g`) — catches agent CLIs and MCP servers installed globally. */
async function npmGlobals(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const json = await run("npm", ["ls", "-g", "--depth=0", "--json"], 20000);
  if (!json) return out;
  try {
    const data = JSON.parse(json) as { dependencies?: Record<string, { version?: string }> };
    for (const [name, info] of Object.entries(data.dependencies ?? {})) if (info.version) out.set(name, info.version);
  } catch {
    /* ignore */
  }
  return out;
}

/** pipx-installed apps (aider, etc). */
async function pipxApps(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const json = await run("pipx", ["list", "--json"]);
  if (!json) return out;
  try {
    const data = JSON.parse(json) as { venvs?: Record<string, { metadata?: { main_package?: { package?: string; package_version?: string } } }> };
    for (const v of Object.values(data.venvs ?? {})) {
      const p = v.metadata?.main_package;
      if (p?.package && p.package_version) out.set(p.package.toLowerCase(), p.package_version);
    }
  } catch {
    /* ignore */
  }
  return out;
}

export interface ToolDetection {
  detected: DetectedTool[];
  /** Every global package found, so all of them get checked — not just catalog tools. */
  dependencies: NormalizedDependency[];
}

export async function detectInstalledTools(): Promise<ToolDetection> {
  const [npm, pipx] = await Promise.all([npmGlobals(), pipxApps()]);
  const detected: DetectedTool[] = [];
  const dependencies: NormalizedDependency[] = [];

  for (const [name, version] of npm) {
    dependencies.push({ ecosystem: "NPM", name, version, direct: true, sourceFile: "npm (global)" });
  }
  for (const [name, version] of pipx) {
    dependencies.push({ ecosystem: "PYPI", name, version, direct: true, sourceFile: "pipx" });
  }

  const pending: Array<Promise<void>> = [];
  for (const tool of TOOL_CATALOG) {
    const fromNpm = tool.ecosystem === "NPM" ? npm.get(tool.packageName) : undefined;
    const fromPipx = tool.ecosystem === "PYPI" ? pipx.get(tool.packageName.toLowerCase()) : undefined;
    if (fromNpm || fromPipx) {
      detected.push({ tool, version: (fromNpm ?? fromPipx)!, source: fromNpm ? "npm -g" : "pipx" });
      continue;
    }
    if (tool.bin) pending.push(detectBinary(tool, detected, dependencies));
  }
  await Promise.all(pending);
  detected.sort((a, b) => a.tool.name.localeCompare(b.tool.name));
  return { detected, dependencies };
}

async function detectBinary(tool: ToolEntry, detected: DetectedTool[], deps: NormalizedDependency[]) {
  const out = await run(tool.bin!, ["--version"]);
  const version = out?.match(VERSION_RE)?.[1];
  if (!version) return;
  detected.push({ tool, version, source: `${tool.bin} --version` });
  deps.push({ ecosystem: tool.ecosystem, name: tool.packageName, version, direct: true, sourceFile: `${tool.bin} (installed)` });
}
