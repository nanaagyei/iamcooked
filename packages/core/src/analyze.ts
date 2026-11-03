import type { CoreEcosystem } from "./ecosystems";
import { fromOsvEcosystem, normalizePackageName } from "./ecosystems";
import type { OsvClient, OsvRecord } from "./osv";
import { cvss3BaseScore, normalizeSeverityLabel, severityFromScore, SEVERITY_RANK, type SeverityLevel } from "./cvss";
import { compareVersions } from "./version";
import { buildFixPlan } from "./fix";
import { aggregateRiskScore, calculateRiskScore, getCookedVerdict, getRiskLevel, type CookedVerdict, type RiskLevel } from "./scoring";

/** Minimal dependency shape (structurally compatible with @iamcooked/scanner's NormalizedDependency). */
export interface DependencyInput {
  ecosystem: CoreEcosystem;
  name: string;
  version: string | null;
  direct: boolean;
  dev?: boolean;
  sourceFile: string;
  dependencyPath?: string[];
}

export type FindingKind = "VULNERABILITY" | "MALWARE";

export interface VulnFinding {
  /** Advisory ID (GHSA preferred, else OSV/PYSEC/GO/RUSTSEC/MAL id). */
  id: string;
  aliases: string[];
  cve: string | null;
  kind: FindingKind;
  ecosystem: CoreEcosystem;
  packageName: string;
  installedVersion: string;
  direct: boolean;
  devOnly: boolean;
  sourceFiles: string[];
  /** Where it came from when not a lockfile (e.g. "mcp:github"). */
  via: string[];
  severity: SeverityLevel;
  cvssScore: number | null;
  summary: string;
  details: string;
  fixedVersion: string | null;
  fixCommand: string | null;
  fixInstruction: string;
  inCisaKev: boolean;
  published: string | null;
  url: string;
  riskScore: number;
}

export interface UncheckedDependency {
  ecosystem: CoreEcosystem;
  name: string;
  sourceFile: string;
  reason: "UNPINNED";
}

export interface AnalysisResult {
  findings: VulnFinding[];
  unchecked: UncheckedDependency[];
  dependencyCount: number;
  ecosystems: CoreEcosystem[];
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: CookedVerdict;
  counts: Record<SeverityLevel | "MALWARE", number>;
}

export interface AnalyzeOptions {
  osv: OsvClient;
  /** Return true if the CVE is in CISA's Known Exploited Vulnerabilities catalog. */
  isKev?: (cveId: string) => boolean | Promise<boolean>;
  onProgress?: (stage: "query" | "hydrate" | "done", detail: { total: number }) => void;
}

export function recordSeverity(record: OsvRecord): { severity: SeverityLevel; score: number | null } {
  const vectors = [...(record.severity ?? []), ...(record.affected ?? []).flatMap((a) => a.severity ?? [])];
  let best: number | null = null;
  for (const s of vectors) {
    if (s.type === "CVSS_V3") {
      const score = cvss3BaseScore(s.score);
      if (score !== null && (best === null || score > best)) best = score;
    }
  }
  const label =
    normalizeSeverityLabel(record.database_specific?.["severity"]) ??
    (record.affected ?? []).map((a) => normalizeSeverityLabel(a.ecosystem_specific?.["severity"] ?? a.database_specific?.["severity"])).find(Boolean) ??
    null;

  if (best !== null) {
    const fromScore = severityFromScore(best);
    // Prefer the curated label when it exists (GHSA reviewers) but keep the number.
    return { severity: label ?? fromScore, score: best };
  }
  if (label) return { severity: label, score: null };
  // Malware entries carry no CVSS but are always critical.
  if (record.id.startsWith("MAL-")) return { severity: "CRITICAL", score: null };
  return { severity: "UNKNOWN", score: null };
}

function isMalware(record: OsvRecord): boolean {
  return (
    record.id.startsWith("MAL-") ||
    (record.aliases ?? []).some((a) => a.startsWith("MAL-")) ||
    /malicious (code|package)|embedded malware/i.test(record.summary ?? "")
  );
}

/** Smallest fixed version that is greater than the installed one, from matching affected ranges. */
export function selectFixedVersion(record: OsvRecord, ecosystem: CoreEcosystem, name: string, installed: string): string | null {
  const target = normalizePackageName(ecosystem, name);
  const candidates: string[] = [];
  for (const affected of record.affected ?? []) {
    const pkg = affected.package;
    if (!pkg) continue;
    if (fromOsvEcosystem(pkg.ecosystem) !== ecosystem) continue;
    if (normalizePackageName(ecosystem, pkg.name) !== target) continue;
    for (const range of affected.ranges ?? []) {
      if (range.type === "GIT") continue;
      let introduced: string | null = null;
      for (const ev of range.events) {
        if (ev.introduced !== undefined) introduced = ev.introduced;
        if (ev.fixed !== undefined) {
          const inRange =
            (introduced === null || introduced === "0" || compareVersions(installed, introduced) >= 0) &&
            compareVersions(installed, ev.fixed) < 0;
          if (inRange) candidates.push(ev.fixed);
        }
      }
    }
  }
  if (candidates.length === 0) {
    // Fallback: any fixed version above what's installed.
    for (const affected of record.affected ?? []) {
      if (!affected.package || normalizePackageName(ecosystem, affected.package.name) !== target) continue;
      for (const range of affected.ranges ?? []) {
        for (const ev of range.events) {
          if (ev.fixed && compareVersions(ev.fixed, installed) > 0) candidates.push(ev.fixed);
        }
      }
    }
  }
  candidates.sort(compareVersions);
  return candidates[0] ?? null;
}

function advisoryUrl(id: string): string {
  if (id.startsWith("GHSA-")) return `https://github.com/advisories/${id}`;
  return `https://osv.dev/vulnerability/${id}`;
}

function preferId(record: OsvRecord): string {
  if (record.id.startsWith("GHSA-")) return record.id;
  const ghsa = (record.aliases ?? []).find((a) => a.startsWith("GHSA-"));
  return ghsa ?? record.id;
}

function firstSentence(text: string, max = 280): string {
  const clean = text
    .replace(/<[^>]+>/g, "")
    .replace(/[#*`>_]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const dot = cut.lastIndexOf(". ");
  return (dot > 80 ? cut.slice(0, dot + 1) : cut.trimEnd() + "…").trim();
}

function emptyCounts(): AnalysisResult["counts"] {
  return { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0, MALWARE: 0 };
}

/**
 * Check dependencies against OSV (which aggregates GitHub Advisories, PyPA, Go, RustSec,
 * RubySec and the OpenSSF malicious-packages feed) and turn the matches into prioritized,
 * plain-English findings with fix commands.
 */
export async function analyzeDependencies(deps: DependencyInput[], opts: AnalyzeOptions): Promise<AnalysisResult> {
  // 1. De-duplicate (same package/version may appear in several lockfiles or paths)
  type Merged = DependencyInput & { sourceFiles: Set<string>; via: Set<string> };
  const merged = new Map<string, Merged>();
  const unchecked: UncheckedDependency[] = [];
  for (const d of deps) {
    if (!d.version) {
      unchecked.push({ ecosystem: d.ecosystem, name: d.name, sourceFile: d.sourceFile, reason: "UNPINNED" });
      continue;
    }
    const key = `${d.ecosystem}:${normalizePackageName(d.ecosystem, d.name)}@${d.version}`;
    const existing = merged.get(key);
    const via = (d.dependencyPath ?? []).filter((p) => p.startsWith("mcp:"));
    if (existing) {
      existing.direct ||= d.direct;
      existing.dev = (existing.dev ?? false) && (d.dev ?? false);
      existing.sourceFiles.add(d.sourceFile);
      via.forEach((v) => existing.via.add(v));
    } else {
      merged.set(key, { ...d, dev: d.dev ?? false, sourceFiles: new Set([d.sourceFile]), via: new Set(via) });
    }
  }
  const list = [...merged.values()];

  // 2. Batch query → IDs
  opts.onProgress?.("query", { total: list.length });
  const ids = await opts.osv.queryBatchIds(
    list.map((d) => ({ ecosystem: d.ecosystem, name: d.name, version: d.version! })),
  );

  // 3. Hydrate full records
  const allIds = ids.flat();
  opts.onProgress?.("hydrate", { total: new Set(allIds).size });
  const records = await opts.osv.getVulns(allIds);

  // 3b. Go/RustSec records carry no severity — borrow it from their GHSA/CVE aliases.
  const severityById = new Map<string, { severity: SeverityLevel; score: number | null }>();
  const needAlias = new Map<string, string>();
  for (const rec of records.values()) {
    const s = recordSeverity(rec);
    severityById.set(rec.id, s);
    if (s.severity === "UNKNOWN" && !rec.id.startsWith("MAL-")) {
      const alias =
        (rec.aliases ?? []).find((a) => a.startsWith("GHSA-")) ?? (rec.aliases ?? []).find((a) => a.startsWith("CVE-"));
      if (alias) needAlias.set(rec.id, alias);
    }
  }
  if (needAlias.size > 0) {
    try {
      const aliasRecords = await opts.osv.getVulns([...needAlias.values()]);
      for (const [id, alias] of needAlias) {
        const aliasRec = aliasRecords.get(alias);
        if (aliasRec) {
          const s = recordSeverity(aliasRec);
          if (s.severity !== "UNKNOWN") severityById.set(id, s);
        }
      }
    } catch {
      /* severity enrichment is best-effort */
    }
  }

  // 4. Build findings
  const findings: VulnFinding[] = [];
  for (let i = 0; i < list.length; i++) {
    const dep = list[i]!;
    const seenAliases = new Set<string>();
    const recs = ids[i]!.map((id) => records.get(id)).filter((r): r is OsvRecord => !!r);
    // Prefer GHSA records first so duplicates (PYSEC + GHSA for the same bug) collapse onto GHSA
    recs.sort((a, b) => Number(b.id.startsWith("GHSA-")) - Number(a.id.startsWith("GHSA-")));

    for (const rec of recs) {
      const allIdsForRec = [rec.id, ...(rec.aliases ?? [])];
      if (allIdsForRec.some((x) => seenAliases.has(x))) continue;
      allIdsForRec.forEach((x) => seenAliases.add(x));

      const malware = isMalware(rec);
      const { severity, score } = severityById.get(rec.id) ?? recordSeverity(rec);
      const cve = allIdsForRec.find((a) => a.startsWith("CVE-")) ?? null;
      const inKev = cve && opts.isKev ? await opts.isKev(cve) : false;
      const fixedVersion = malware ? null : selectFixedVersion(rec, dep.ecosystem, dep.name, dep.version!);
      const primaryFile = [...dep.sourceFiles][0];
      let plan = buildFixPlan({
        ecosystem: dep.ecosystem,
        name: dep.name,
        fixedVersion,
        direct: dep.direct,
        sourceFile: primaryFile,
        malicious: malware,
      });
      // Launched by an MCP server (npx/uvx): the fix is editing the config, not installing.
      if (dep.via.size > 0 && dep.sourceFiles.size === [...dep.sourceFiles].filter((f) => !/lock|requirements|go\.mod/i.test(f)).length) {
        const sep = dep.ecosystem === "PYPI" ? "==" : "@";
        plan = malware
          ? { command: null, instruction: `Remove the MCP server that runs ${dep.name} from your config and rotate any keys it had access to.` }
          : fixedVersion
            ? { command: null, instruction: `In your MCP config, change "${dep.name}${sep}${dep.version}" to "${dep.name}${sep}${fixedVersion}" (or newer) and restart your editor.` }
            : plan;
      }
      const riskSeverity = severity === "UNKNOWN" ? "MEDIUM" : severity;

      findings.push({
        id: preferId(rec),
        aliases: [...new Set(allIdsForRec)].filter((a) => a !== preferId(rec)),
        cve,
        kind: malware ? "MALWARE" : "VULNERABILITY",
        ecosystem: dep.ecosystem,
        packageName: dep.name,
        installedVersion: dep.version!,
        direct: dep.direct,
        devOnly: dep.dev ?? false,
        sourceFiles: [...dep.sourceFiles],
        via: [...dep.via],
        severity: malware ? "CRITICAL" : severity,
        cvssScore: score,
        summary: firstSentence(rec.summary || rec.details || rec.id, 160),
        details: firstSentence(rec.details ?? "", 600),
        fixedVersion,
        fixCommand: plan.command,
        fixInstruction: plan.instruction,
        inCisaKev: !!inKev,
        published: rec.published ?? null,
        url: advisoryUrl(preferId(rec)),
        riskScore: calculateRiskScore({
          hasKnownVulnerability: true,
          severity: riskSeverity,
          inCisaKev: !!inKev,
          isDirectDependency: dep.direct,
          isTransitiveDependency: !dep.direct,
          isKnownMalicious: malware,
          hasRecentSupplyChainIncident: false,
          hasPatchAvailable: fixedVersion !== null,
          isDevOnly: dep.dev ?? false,
        }),
      });
    }
  }

  findings.sort(
    (a, b) =>
      b.riskScore - a.riskScore ||
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      a.packageName.localeCompare(b.packageName),
  );

  const counts = emptyCounts();
  for (const f of findings) {
    if (f.kind === "MALWARE") counts.MALWARE++;
    else counts[f.severity]++;
  }
  const riskScore = aggregateRiskScore(findings.map((f) => f.riskScore));
  opts.onProgress?.("done", { total: findings.length });

  return {
    findings,
    unchecked,
    dependencyCount: list.length + unchecked.length,
    ecosystems: [...new Set(deps.map((d) => d.ecosystem))],
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    verdict: getCookedVerdict(riskScore),
    counts,
  };
}
