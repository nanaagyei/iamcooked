import type { NormalizedDependency } from "../types";

function extractNameFromDescriptor(descriptor: string): string | null {
  if (descriptor.length === 0) return null;

  if (descriptor.startsWith("@")) {
    const slashIdx = descriptor.indexOf("/");
    if (slashIdx === -1) return null;
    const afterSlash = descriptor.slice(slashIdx + 1);
    const atIdx = afterSlash.indexOf("@");
    if (atIdx === -1) return null;
    return descriptor.slice(0, slashIdx + 1 + atIdx);
  }

  const atIdx = descriptor.lastIndexOf("@");
  if (atIdx <= 0) return null;
  return descriptor.slice(0, atIdx);
}

export function parseYarnLock(raw: string): NormalizedDependency[] {
  const results: NormalizedDependency[] = [];
  const lines = raw.split("\n");
  const seen = new Set<string>();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;

    if (!line.trim() || line.trim().startsWith("#") || line.startsWith("  ")) {
      i++;
      continue;
    }

    if (!line.endsWith(":")) {
      i++;
      continue;
    }

    const header = line.slice(0, -1).trim();
    const firstDescriptor = header.split(",")[0]!.trim().replace(/"/g, "");
    const name = extractNameFromDescriptor(firstDescriptor);

    // Skip Yarn Berry metadata and workspace/link/patch entries
    if (!name || header === "__metadata" || /@(workspace|link|portal|file):/.test(firstDescriptor)) {
      i++;
      continue;
    }

    i++;
    let version: string | null = null;

    while (i < lines.length) {
      const metaLine = lines[i]!;
      if (metaLine === "" || metaLine.startsWith("  ")) {
        const trimmed = metaLine.trim();
        // Yarn v1: `version "1.2.3"` — Yarn Berry (v2+): `version: 1.2.3`
        const m = trimmed.match(/^version:?\s+"?([^"\s]+)"?$/);
        if (m && !version) {
          version = m[1]!;
        }
        i++;
      } else {
        break;
      }
    }

    const key = `${name}@${version ?? ""}`;
    if (version && name && !seen.has(key)) {
      seen.add(key);
      results.push({
        ecosystem: "NPM",
        name,
        version,
        direct: false,
        sourceFile: "",
      });
    }
  }

  return results;
}
