/** PEP 503 name normalization so "Django", "django_" and "django" compare equal. */
export function normalizePypiName(name: string): string {
  return name.trim().toLowerCase().replace(/[-_.]+/g, "-");
}

/**
 * Remove // and /* *\/ comments and trailing commas from JSONC text (bun.lock, VS Code configs)
 * while leaving string contents untouched.
 */
export function stripJsonc(raw: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  while (i < raw.length) {
    const ch = raw[i]!;
    const next = raw[i + 1];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i++;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < raw.length && raw[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (ch === ",") {
      let j = i + 1;
      while (j < raw.length && /\s/.test(raw[j]!)) j++;
      if (raw[j] === "}" || raw[j] === "]") {
        i++;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

export interface TomlPackageBlock {
  /** Top-level `key = "string"` pairs of the [[package]] table. */
  fields: Record<string, string>;
  /** Raw text of the whole block, including sub-tables. */
  body: string;
}

/**
 * Minimal reader for the `[[package]]` arrays used by Cargo.lock, poetry.lock and uv.lock.
 * We only need simple string fields (name, version, source, category), so a full TOML
 * parser would be an unnecessary dependency.
 */
export function readTomlPackages(raw: string): TomlPackageBlock[] {
  const blocks: TomlPackageBlock[] = [];
  const parts = raw.split(/^\[\[package\]\][ \t]*$/m).slice(1);
  for (const part of parts) {
    const fields: Record<string, string> = {};
    for (const line of part.split("\n")) {
      if (/^\s*\[/.test(line)) break; // a sub-table like [package.dependencies]
      const m = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
      if (!m) continue;
      const key = m[1]!;
      if (key in fields) continue;
      const value = m[2]!.trim();
      const str = value.match(/^"((?:[^"\\]|\\.)*)"/);
      fields[key] = str ? str[1]! : value;
    }
    blocks.push({ fields, body: part });
  }
  return blocks;
}
