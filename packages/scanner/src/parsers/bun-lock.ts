import type { NormalizedDependency } from "../types";
import { stripJsonc } from "./util";

interface BunWorkspace {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface BunLock {
  lockfileVersion?: number;
  workspaces?: Record<string, BunWorkspace>;
  packages?: Record<string, unknown[]>;
}

/** Split "name@version" where name may be scoped ("@scope/pkg@1.0.0"). */
function splitSpec(spec: string): { name: string; version: string } | null {
  const at = spec.lastIndexOf("@");
  if (at <= 0) return null;
  return { name: spec.slice(0, at), version: spec.slice(at + 1) };
}

/** Parses the text-based `bun.lock` (Bun ≥ 1.2). The binary `bun.lockb` is not supported. */
export function parseBunLock(raw: string): NormalizedDependency[] {
  const data = JSON.parse(stripJsonc(raw)) as BunLock;
  const direct = new Set<string>();
  const dev = new Set<string>();
  for (const ws of Object.values(data.workspaces ?? {})) {
    for (const k of ["dependencies", "optionalDependencies", "peerDependencies"] as const) {
      for (const name of Object.keys(ws[k] ?? {})) direct.add(name);
    }
    for (const name of Object.keys(ws.devDependencies ?? {})) dev.add(name);
  }

  const results: NormalizedDependency[] = [];
  const seen = new Set<string>();
  for (const [key, entry] of Object.entries(data.packages ?? {})) {
    if (!Array.isArray(entry) || typeof entry[0] !== "string") continue;
    const parsed = splitSpec(entry[0]);
    if (!parsed || parsed.version.includes(":")) continue; // workspace:, file:, github: refs
    const id = `${parsed.name}@${parsed.version}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const topLevel = !key.includes("/") || (key.startsWith("@") && key.split("/").length === 2);
    results.push({
      ecosystem: "NPM",
      name: parsed.name,
      version: parsed.version,
      direct: topLevel && (direct.has(parsed.name) || dev.has(parsed.name)),
      dev: (topLevel && dev.has(parsed.name) && !direct.has(parsed.name)) || undefined,
      sourceFile: "",
    });
  }
  return results;
}
