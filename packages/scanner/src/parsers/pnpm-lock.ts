import { parse, YAMLParseError } from "yaml";
import type { NormalizedDependency } from "../types";

type DepMap = Record<string, { specifier?: string; version: string } | string>;

interface PnpmImporter {
  dependencies?: DepMap;
  devDependencies?: DepMap;
  optionalDependencies?: DepMap;
}

interface PnpmLockfile {
  lockfileVersion: string | number;
  packages?: Record<string, { dev?: boolean } | null>;
  importers?: Record<string, PnpmImporter>;
  dependencies?: DepMap;
  devDependencies?: DepMap;
  optionalDependencies?: DepMap;
}

interface ParsedKey {
  name: string;
  version: string;
}

/**
 * Supports every pnpm key style:
 *   v5:   /lodash/4.17.21           /@scope/pkg/1.0.0_peer@1
 *   v6-8: /lodash@4.17.21           /@scope/pkg@1.0.0(peer@1)
 *   v9+:  lodash@4.17.21            '@scope/pkg@1.0.0'
 */
export function parsePnpmPackageKey(key: string): ParsedKey | null {
  const k = key.startsWith("/") ? key.slice(1) : key;
  const scoped = k.startsWith("@");
  const searchFrom = scoped ? k.indexOf("/") + 1 : 0;
  if (scoped && searchFrom === 0) return null;

  const at = k.indexOf("@", searchFrom);
  const slashAt = k.indexOf("/", searchFrom);
  if (at > 0 && (slashAt === -1 || at < slashAt)) {
    const name = k.slice(0, at);
    const version = k.slice(at + 1).split(/[(_]/)[0]!;
    if (!name || !version || version.includes(":")) return null; // skip link:/file:/git: refs
    return { name, version };
  }

  // v5 style: name/version
  const slash = slashAt;
  if (slash > 0) {
    const name = k.slice(0, slash);
    const version = k.slice(slash + 1).split(/[(_]/)[0]!;
    if (!name || !/^\d/.test(version)) return null;
    return { name, version };
  }
  return null;
}

function collect(map: DepMap | undefined, into: Set<string>) {
  for (const name of Object.keys(map ?? {})) into.add(name);
}

export function parsePnpmLock(raw: string): NormalizedDependency[] {
  let data: PnpmLockfile | null;
  try {
    data = parse(raw, { maxAliasCount: 100 }) as PnpmLockfile | null;
  } catch (err) {
    if (err instanceof YAMLParseError) {
      throw new Error(`Invalid pnpm lockfile YAML: ${err.message}`);
    }
    throw err;
  }

  if (!data || !data.packages) return [];

  const direct = new Set<string>();
  const devOnly = new Set<string>();
  collect(data.dependencies, direct);
  collect(data.optionalDependencies, direct);
  collect(data.devDependencies, devOnly);
  for (const importer of Object.values(data.importers ?? {})) {
    collect(importer.dependencies, direct);
    collect(importer.optionalDependencies, direct);
    collect(importer.devDependencies, devOnly);
  }

  const results: NormalizedDependency[] = [];
  const seen = new Set<string>();

  for (const [key, meta] of Object.entries(data.packages)) {
    const parsed = parsePnpmPackageKey(key);
    if (!parsed) continue;
    const id = `${parsed.name}@${parsed.version}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const isDirect = direct.has(parsed.name) || devOnly.has(parsed.name);
    results.push({
      ecosystem: "NPM",
      name: parsed.name,
      version: parsed.version,
      direct: isDirect,
      dev: meta?.dev === true || (devOnly.has(parsed.name) && !direct.has(parsed.name)) || undefined,
      sourceFile: "",
    });
  }

  return results;
}
