export interface ClaimVerificationContext {
  packageNames?: string[];
  cveIds?: string[];
  ghsaIds?: string[];
  versionStrings?: string[];
  sourceExcerpts?: string[];
}

export interface ClaimVerificationResult<T> {
  valid: boolean;
  violations: string[];
  sanitizedOutput: T;
}

const CVE_PATTERN = /\bCVE-\d{4}-\d+\b/gi;
const GHSA_PATTERN = /\bGHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b/gi;
const VERSION_PATTERN = /\b\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?\b/g;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

function normalizeSet(values: string[] | undefined): Set<string> {
  return new Set((values ?? []).map((v) => v.toLowerCase()));
}

function isKnownIdentifier(id: string, known: Set<string>): boolean {
  return known.has(id.toLowerCase());
}

function excerptContains(text: string, excerpts: string[]): boolean {
  const lower = text.toLowerCase();
  return excerpts.some((excerpt) => excerpt.toLowerCase().includes(lower));
}

export function verifyClaims<T extends Record<string, unknown>>(
  output: T,
  context: ClaimVerificationContext,
): ClaimVerificationResult<T> {
  const violations: string[] = [];
  const allText = collectStrings(output).join(" ");
  const combinedContext = [
    ...(context.sourceExcerpts ?? []),
    ...(context.packageNames ?? []),
    ...(context.cveIds ?? []),
    ...(context.ghsaIds ?? []),
    ...(context.versionStrings ?? []),
  ].join(" ");

  const knownPackages = normalizeSet(context.packageNames);
  const knownCves = normalizeSet(context.cveIds);
  const knownGhsas = normalizeSet(context.ghsaIds);
  const knownVersions = normalizeSet(context.versionStrings);
  const excerpts = context.sourceExcerpts ?? [];

  for (const cve of allText.match(CVE_PATTERN) ?? []) {
    if (!isKnownIdentifier(cve, knownCves) && !combinedContext.toLowerCase().includes(cve.toLowerCase())) {
      violations.push(`Unknown CVE referenced: ${cve}`);
    }
  }

  for (const ghsa of allText.match(GHSA_PATTERN) ?? []) {
    if (!isKnownIdentifier(ghsa, knownGhsas) && !combinedContext.toLowerCase().includes(ghsa.toLowerCase())) {
      violations.push(`Unknown GHSA referenced: ${ghsa}`);
    }
  }

  if (knownPackages.size > 0) {
    const packagePattern = new RegExp(
      `@?[a-z0-9][a-z0-9._-]*(?:/[a-z0-9][a-z0-9._-]*)?`,
      "gi",
    );
    for (const pkg of allText.match(packagePattern) ?? []) {
      const normalized = pkg.toLowerCase();
      if (
        normalized.length > 2 &&
        !knownPackages.has(normalized) &&
        !excerptContains(normalized, excerpts) &&
        !["npm", "node", "json", "http", "https"].includes(normalized)
      ) {
        violations.push(`Unknown package referenced: ${pkg}`);
      }
    }
  }

  for (const version of allText.match(VERSION_PATTERN) ?? []) {
    if (
      knownVersions.size > 0 &&
      !isKnownIdentifier(version, knownVersions) &&
      !combinedContext.includes(version)
    ) {
      violations.push(`Unknown version referenced: ${version}`);
    }
  }

  const sanitizedOutput = { ...output } as T & { confidence?: string };
  if ("confidence" in sanitizedOutput && violations.length > 0) {
    sanitizedOutput.confidence = "Unverified";
  }

  return {
    valid: violations.length === 0,
    violations,
    sanitizedOutput: sanitizedOutput as T,
  };
}
