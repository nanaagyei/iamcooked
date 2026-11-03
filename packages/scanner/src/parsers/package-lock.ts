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

/** "node_modules/a/node_modules/@scope/b" → "@scope/b" */
export function extractNameFromPath(path: string): string {
  const idx = path.lastIndexOf("node_modules/");
  return idx === -1 ? path : path.slice(idx + "node_modules/".length);
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
  const devDepNames = new Set(Object.keys(root?.devDependencies ?? {}));
  const results: NormalizedDependency[] = [];

  for (const [path, pkg] of Object.entries(packages)) {
    if (path === "") continue;
    if (pkg.link === true) continue;

    // Workspace packages live outside node_modules (e.g. "packages/foo") — not third-party deps.
    if (!path.includes("node_modules/")) continue;

    // Aliased installs ("npm:real-pkg@1") record the real package in `name`
    const name = pkg.name ?? extractNameFromPath(path);
    const version = pkg.version ?? null;

    if (!version) continue;

    // Only the top-level install of a package counts as direct; nested copies are transitive.
    const isTopLevel = path === `node_modules/${name}`;
    const entry = pkg as PackageEntry & { dev?: boolean };

    results.push({
      ecosystem: "NPM",
      name,
      version,
      direct: isTopLevel && directDepNames.has(name),
      dev: entry.dev === true || (isTopLevel && devDepNames.has(name)) || undefined,
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
