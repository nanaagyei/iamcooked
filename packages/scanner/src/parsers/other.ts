import type { NormalizedDependency } from "../types";
import { readTomlPackages } from "./util";

/**
 * go.mod — modules from `require` blocks plus the Go toolchain itself (OSV tracks Go
 * standard-library CVEs under the "stdlib" package, which bite more projects than any module).
 * Versions are stored without the leading "v" because that is what OSV expects.
 */
export function parseGoMod(raw: string): NormalizedDependency[] {
  const results: NormalizedDependency[] = [];
  const lines = raw.split(/\r?\n/);
  let inRequire = false;
  let goVersion: string | null = null;
  let toolchain: string | null = null;

  const push = (line: string) => {
    const m = line.trim().match(/^(\S+)\s+v(\S+)(.*)$/);
    if (!m) return;
    results.push({
      ecosystem: "GO",
      name: m[1]!,
      version: m[2]!.replace(/\+incompatible$/, ""),
      direct: !/\/\/\s*indirect/.test(m[3] ?? ""),
      sourceFile: "",
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (inRequire) {
      if (line.startsWith(")")) inRequire = false;
      else if (line && !line.startsWith("//")) push(line);
      continue;
    }
    if (/^require\s*\($/.test(line)) inRequire = true;
    else if (line.startsWith("require ")) push(line.slice("require ".length));
    else if (line.startsWith("go ")) goVersion = line.slice(3).trim();
    else if (line.startsWith("toolchain ")) toolchain = line.slice(10).trim().replace(/^go/, "");
  }

  const stdlib = toolchain ?? goVersion;
  if (stdlib && /^\d+\.\d+(\.\d+)?$/.test(stdlib)) {
    // `go 1.22` means "at least 1.22.0" — the minimum the module declares.
    const version = stdlib.split(".").length === 2 ? `${stdlib}.0` : stdlib;
    results.push({ ecosystem: "GO", name: "stdlib", version, direct: true, sourceFile: "" });
  }
  return results;
}

export function parseCargoLock(raw: string): NormalizedDependency[] {
  return readTomlPackages(raw)
    // Packages without a `source` are workspace members (your own crates)
    .filter((b) => b.fields["name"] && b.fields["version"] && b.fields["source"])
    .map((b) => ({
      ecosystem: "CARGO" as const,
      name: b.fields["name"]!,
      version: b.fields["version"]!,
      direct: false,
      sourceFile: "",
    }));
}

export function parseGemfileLock(raw: string): NormalizedDependency[] {
  const lines = raw.split(/\r?\n/);
  const direct = new Set<string>();
  const results: NormalizedDependency[] = [];
  let section = "";
  let inSpecs = false;

  for (const line of lines) {
    if (/^[A-Z]/.test(line)) {
      section = line.trim();
      inSpecs = false;
      continue;
    }
    if (section === "DEPENDENCIES") {
      const m = line.match(/^ {2}([^\s!(]+)/);
      if (m) direct.add(m[1]!);
      continue;
    }
    if (section === "GEM") {
      if (/^ {2}specs:/.test(line)) {
        inSpecs = true;
        continue;
      }
      if (!inSpecs) continue;
      const m = line.match(/^ {4}([^\s(]+) \(([^)]+)\)$/);
      if (m) {
        // Strip platform suffixes like "1.15.4-x86_64-linux"
        const version = m[2]!.split("-")[0]!;
        results.push({ ecosystem: "RUBYGEMS", name: m[1]!, version, direct: false, sourceFile: "" });
      }
    }
  }
  return results.map((d) => ({ ...d, direct: direct.has(d.name) }));
}

interface ComposerLock {
  packages?: Array<{ name: string; version: string }>;
  "packages-dev"?: Array<{ name: string; version: string }>;
}

export function parseComposerLock(raw: string): NormalizedDependency[] {
  const data = JSON.parse(raw) as ComposerLock;
  const map = (list: ComposerLock["packages"], dev: boolean): NormalizedDependency[] =>
    (list ?? [])
      .filter((p) => p.name && p.version && !p.version.startsWith("dev-"))
      .map((p) => ({
        ecosystem: "COMPOSER" as const,
        name: p.name,
        version: p.version.replace(/^v/, ""),
        direct: false,
        dev: dev || undefined,
        sourceFile: "",
      }));
  return [...map(data.packages, false), ...map(data["packages-dev"], true)];
}
