export type CoreEcosystem = "NPM" | "PYPI" | "GO" | "CARGO" | "RUBYGEMS" | "COMPOSER";

/** OSV ecosystem identifiers — https://ossf.github.io/osv-schema/#affectedpackage-field */
export const OSV_ECOSYSTEM: Record<CoreEcosystem, string> = {
  NPM: "npm",
  PYPI: "PyPI",
  GO: "Go",
  CARGO: "crates.io",
  RUBYGEMS: "RubyGems",
  COMPOSER: "Packagist",
};

export const ECOSYSTEM_LABEL: Record<CoreEcosystem, string> = {
  NPM: "npm",
  PYPI: "PyPI",
  GO: "Go",
  CARGO: "crates.io",
  RUBYGEMS: "RubyGems",
  COMPOSER: "Packagist",
};

export function fromOsvEcosystem(value: string): CoreEcosystem | null {
  const base = value.split(":")[0];
  for (const [k, v] of Object.entries(OSV_ECOSYSTEM)) if (v === base) return k as CoreEcosystem;
  return null;
}

/** Normalise names the way each registry does so lookups compare equal. */
export function normalizePackageName(ecosystem: CoreEcosystem, name: string): string {
  if (ecosystem === "PYPI") return name.trim().toLowerCase().replace(/[-_.]+/g, "-");
  if (ecosystem === "COMPOSER") return name.trim().toLowerCase();
  return name.trim();
}

export function packageUrl(ecosystem: CoreEcosystem, name: string): string {
  switch (ecosystem) {
    case "NPM":
      return `https://www.npmjs.com/package/${name}`;
    case "PYPI":
      return `https://pypi.org/project/${name}/`;
    case "GO":
      return name === "stdlib" ? "https://go.dev/doc/devel/release" : `https://pkg.go.dev/${name}`;
    case "CARGO":
      return `https://crates.io/crates/${name}`;
    case "RUBYGEMS":
      return `https://rubygems.org/gems/${name}`;
    case "COMPOSER":
      return `https://packagist.org/packages/${name}`;
  }
}
