import type { NormalizedDependency } from "../types";

interface PackageEntry {
  name?: string;
  version?: string;
  resolved?: string;
  integrity?: string;
  link?: boolean;
  dependencies?: Record<string, PackageEntry>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function extractNameFromPath(path: string): string {
  const parts = path.split("/node_modules/");
  return parts[parts.length - 1]!;
}

function getDirectDepNames(root: PackageEntry | undefined): Set<string> {
  const names = new Set<string>();
  if (!root) return names;
  for (const key of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const) {
    const deps = root[key] as Record<string, unknown> | undefined;
    if (deps) {
      for (const name of Object.keys(deps)) {
        names.add(name);
      }
    }
  }
  return names;
}

function parsePackagesFormat(packages: Record<string, PackageEntry>): NormalizedDependency[] {
  const root = packages[""];
  const directDepNames = getDirectDepNames(root);
  const results: NormalizedDependency[] = [];

  for (const [path, pkg] of Object.entries(packages)) {
    if (path === "") continue;
    if (pkg.link === true) continue;

    const name = pkg.name ?? extractNameFromPath(path);
    const version = pkg.version ?? null;

    if (!version) continue;

    results.push({
      ecosystem: "NPM",
      name,
      version,
      direct: directDepNames.has(name),
      sourceFile: "",
    });
  }

  return results;
}

function parseDependenciesFormat(
  deps: Record<string, PackageEntry>,
  isDirect: boolean,
  seen: Set<string>,
): NormalizedDependency[] {
  const results: NormalizedDependency[] = [];

  for (const [name, info] of Object.entries(deps)) {
    if (!info || typeof info !== "object") continue;
    if (info.link === true) continue;

    const version = info.version ?? null;
    if (!version) continue;

    const key = `${name}@${version}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      ecosystem: "NPM",
      name,
      version,
      direct: isDirect,
      sourceFile: "",
    });

    if (info.dependencies) {
      results.push(...parseDependenciesFormat(info.dependencies, false, seen));
    }
  }

  return results;
}

export function parsePackageLock(raw: string): NormalizedDependency[] {
  const data = JSON.parse(raw) as Record<string, unknown>;

  if (data.packages && typeof data.packages === "object") {
    return parsePackagesFormat(data.packages as Record<string, PackageEntry>);
  }

  if (data.dependencies && typeof data.dependencies === "object") {
    return parseDependenciesFormat(
      data.dependencies as Record<string, PackageEntry>,
      true,
      new Set(),
    );
  }

  return [];
}
