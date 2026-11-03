import type { NormalizedDependency } from "../types";
import { normalizePypiName, readTomlPackages } from "./util";

function dep(name: string, version: string | null, direct: boolean, devOnly = false): NormalizedDependency {
  return {
    ecosystem: "PYPI",
    name: normalizePypiName(name),
    version,
    direct,
    dev: devOnly || undefined,
    sourceFile: "",
  };
}

/**
 * requirements.txt — pinned (`==`) entries get a version; unpinned entries are still reported
 * (version null) so the CLI can warn that they can't be checked precisely.
 * Understands pip-compile's `# via` annotations to tell direct from transitive deps.
 */
export function parseRequirementsTxt(raw: string): NormalizedDependency[] {
  const lines = raw.replace(/\\\r?\n/g, " ").split(/\r?\n/);
  const results: NormalizedDependency[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#") || line.startsWith("-") || line.includes("://")) continue;

    const m = line.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]*\])?\s*(?:(===?)\s*([^\s;,]+))?/);
    if (!m) continue;
    const name = m[1]!;
    const version = m[3] ? m[4]!.replace(/\.\*$/, "") : null;

    // pip-compile: look at the following "# via" comment block
    let direct = true;
    const via: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      const c = lines[j]!.trim();
      if (!c.startsWith("#")) break;
      via.push(c.replace(/^#\s*/, "").replace(/^via\s*/, ""));
    }
    if (via.length > 0 && via.some(Boolean) && !via.some((v) => v.startsWith("-r") || v.startsWith("-c"))) {
      direct = false;
    }

    const id = `${normalizePypiName(name)}@${version ?? ""}`;
    if (seen.has(id)) continue;
    seen.add(id);
    results.push(dep(name, version, direct));
  }
  return results;
}

export function parsePoetryLock(raw: string): NormalizedDependency[] {
  return readTomlPackages(raw)
    .filter((b) => b.fields["name"] && b.fields["version"])
    .map((b) => {
      const devOnly =
        b.fields["category"] === "dev" ||
        /^groups\s*=\s*\[\s*"dev"\s*\]/m.test(b.body);
      return dep(b.fields["name"]!, b.fields["version"]!, false, devOnly);
    });
}

export function parseUvLock(raw: string): NormalizedDependency[] {
  const blocks = readTomlPackages(raw);
  const direct = new Set<string>();
  const isProject = (body: string) => /^source\s*=\s*\{\s*(editable|virtual)\s*=/m.test(body);

  for (const b of blocks) {
    if (!isProject(b.body)) continue;
    // Collect `{ name = "x" ... }` entries from the project's dependency arrays/tables
    for (const m of b.body.matchAll(/\{\s*name\s*=\s*"([^"]+)"/g)) direct.add(normalizePypiName(m[1]!));
  }

  return blocks
    .filter((b) => b.fields["name"] && b.fields["version"] && !isProject(b.body))
    .map((b) => dep(b.fields["name"]!, b.fields["version"]!, direct.has(normalizePypiName(b.fields["name"]!))));
}

interface PipfileLock {
  default?: Record<string, { version?: string }>;
  develop?: Record<string, { version?: string }>;
}

export function parsePipfileLock(raw: string): NormalizedDependency[] {
  const data = JSON.parse(raw) as PipfileLock;
  const results: NormalizedDependency[] = [];
  const add = (section: PipfileLock["default"], devOnly: boolean) => {
    for (const [name, info] of Object.entries(section ?? {})) {
      const version = info?.version?.replace(/^===?/, "") ?? null;
      results.push(dep(name, version, false, devOnly));
    }
  };
  add(data.default, false);
  add(data.develop, true);
  return results;
}
