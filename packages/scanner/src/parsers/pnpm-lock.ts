import { parse, YAMLParseError } from "yaml";
import type { NormalizedDependency } from "../types";

interface PnpmLockfile {
  lockfileVersion: string | number;
  packages?: Record<string, unknown>;
  dependencies?: Record<string, { specifier: string; version: string }>;
  devDependencies?: Record<string, { specifier: string; version: string }>;
  optionalDependencies?: Record<string, { specifier: string; version: string }>;
}

interface ParsedKey {
  name: string;
  version: string;
}

function parsePackageKey(key: string): ParsedKey | null {
  const match = key.match(/^\/((?:@[^/]+\/)?[^@]+)@([^/(]+)/);
  if (!match) return null;
  return { name: match[1]!, version: match[2]! };
}

export function parsePnpmLock(raw: string): NormalizedDependency[] {
  let data: PnpmLockfile | null;
  try {
    data = parse(raw, {
      maxAliasCount: 100,
    }) as PnpmLockfile | null;
  } catch (err) {
    if (err instanceof YAMLParseError) {
      throw new Error(`Invalid pnpm lockfile YAML: ${err.message}`);
    }
    throw err;
  }

  if (!data || !data.packages) return [];

  const directDepNames = new Set([
    ...Object.keys(data.dependencies ?? {}),
    ...Object.keys(data.devDependencies ?? {}),
    ...Object.keys(data.optionalDependencies ?? {}),
  ]);

  const results: NormalizedDependency[] = [];

  for (const [key] of Object.entries(data.packages)) {
    const parsed = parsePackageKey(key);
    if (!parsed) continue;

    results.push({
      ecosystem: "NPM",
      name: parsed.name,
      version: parsed.version,
      direct: directDepNames.has(parsed.name),
      sourceFile: "",
    });
  }

  return results;
}
