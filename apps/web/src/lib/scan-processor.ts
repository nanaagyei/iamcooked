import type { NormalizedDependency } from "@iamcooked/scanner";
import { prisma } from "@iamcooked/db";
import { queryBatch, enrichFromGitHub } from "@iamcooked/sources";
import type { OsvVulnerability } from "@iamcooked/sources";
import { isInKev } from "@iamcooked/sources";
import {
  calculateRiskScore,
  getRiskLevel,
  type RiskFactors,
} from "./scoring";
import { isVersionAffected, upsertAdvisoryFromOsv } from "./advisory-upsert";

const OSV_CHUNK_SIZE = 500;

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";

export interface ProcessedFinding {
  packageName: string;
  installedVersion: string | null;
  findingType:
    | "KNOWN_VULNERABILITY"
    | "AFFECTED_BY_INCIDENT"
    | "ACTIVELY_EXPLOITED";
  severity: Severity;
  confidence: "CONFIRMED" | "LIKELY" | "DEVELOPING";
  explanation: string;
  incidentId?: string;
  advisoryId?: string;
  advisoryExternalId?: string;
  actionItems?: unknown;
  riskScore: number;
}

function mapOsvSeverity(vuln: OsvVulnerability): Severity {
  const cvss = vuln.severity?.find((s) => s.type === "CVSS_V3")?.score;
  if (cvss) {
    const score = parseFloat(cvss.split("/")[0] ?? "0");
    if (score >= 9) return "CRITICAL";
    if (score >= 7) return "HIGH";
    if (score >= 4) return "MEDIUM";
    if (score > 0) return "LOW";
  }
  if (vuln.id.startsWith("GHSA") || vuln.id.startsWith("CVE")) return "HIGH";
  return "MEDIUM";
}

function toRiskSeverity(severity: Severity): RiskFactors["severity"] {
  if (severity === "CRITICAL" || severity === "HIGH" || severity === "MEDIUM" || severity === "LOW") {
    return severity;
  }
  return "LOW";
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function osvKey(name: string, version: string): string {
  return `${name}@${version}`;
}

export async function processLockfileScan(deps: NormalizedDependency[]) {
  const packageNames = [...new Set(deps.map((d) => d.name))];

  const matchedIncidentPackages = await prisma.incidentPackage.findMany({
    where: {
      packageName: { in: packageNames },
      incident: { status: "PUBLISHED" },
    },
    include: {
      incident: {
        select: {
          id: true,
          severity: true,
          slug: true,
          title: true,
          status: true,
        },
      },
    },
  });

  const versionedDeps = deps.filter((d) => d.version);
  const osvResults: Record<string, OsvVulnerability[]> = {};

  for (const batch of chunk(versionedDeps, OSV_CHUNK_SIZE)) {
    const batchResult = await queryBatch(
      batch.map((d) => ({ name: d.name, version: d.version! })),
    );
    Object.assign(osvResults, batchResult);
  }

  const findings: ProcessedFinding[] = [];
  const seen = new Set<string>();
  const advisoryCache = new Map<string, string>();

  for (const dep of deps) {
    if (!dep.version) continue;

    const vulns = osvResults[osvKey(dep.name, dep.version)] ?? [];
    for (const rawVuln of vulns) {
      const vuln = await enrichFromGitHub(rawVuln);
      const key = `osv:${dep.name}:${vuln.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      let advisoryId = advisoryCache.get(vuln.id);
      if (!advisoryId) {
        advisoryId = await upsertAdvisoryFromOsv(vuln);
        advisoryCache.set(vuln.id, advisoryId);
      }

      const severity = mapOsvSeverity(vuln);
      let inKev = false;
      for (const alias of vuln.aliases) {
        if (alias.startsWith("CVE-") && (await isInKev(alias))) {
          inKev = true;
          break;
        }
      }

      const factors: RiskFactors = {
        hasKnownVulnerability: true,
        severity: toRiskSeverity(severity),
        inCisaKev: inKev,
        isDirectDependency: dep.direct,
        isTransitiveDependency: !dep.direct,
        isKnownMalicious: false,
        hasRecentSupplyChainIncident: false,
        hasPatchAvailable: vuln.patchedVersions.length > 0,
      };

      const riskScore = calculateRiskScore(factors);
      const patched =
        vuln.patchedVersions.length > 0
          ? ` Patched in ${vuln.patchedVersions.join(", ")}.`
          : "";

      findings.push({
        packageName: dep.name,
        installedVersion: dep.version,
        findingType: inKev ? "ACTIVELY_EXPLOITED" : "KNOWN_VULNERABILITY",
        severity,
        confidence: "CONFIRMED",
        explanation: `${vuln.summary ?? vuln.id}: ${vuln.details?.slice(0, 200) ?? "Known vulnerability detected."}${patched}`,
        advisoryId,
        advisoryExternalId: vuln.id,
        riskScore,
        actionItems: vuln.patchedVersions.length
          ? [{ action: `Update ${dep.name} to ${vuln.patchedVersions[0]}`, urgency: "immediate" }]
          : undefined,
      });
    }
  }

  for (const ip of matchedIncidentPackages) {
    const dep = deps.find((d) => d.name === ip.packageName);
    if (
      !isVersionAffected(dep?.version, ip.affectedVersions, ip.patchedVersions)
    ) {
      continue;
    }

    const key = `incident:${ip.packageName}:${ip.incidentId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const severity = ip.incident.severity as Severity;
    const factors: RiskFactors = {
      hasKnownVulnerability: true,
      severity: toRiskSeverity(severity),
      inCisaKev: false,
      isDirectDependency: dep?.direct ?? false,
      isTransitiveDependency: !(dep?.direct ?? false),
      isKnownMalicious: false,
      hasRecentSupplyChainIncident: true,
      hasPatchAvailable: false,
    };

    findings.push({
      packageName: ip.packageName,
      installedVersion: dep?.version ?? null,
      findingType: "AFFECTED_BY_INCIDENT",
      severity,
      confidence: "CONFIRMED",
      explanation: `Your project includes ${ip.packageName}, which matches incident: ${ip.incident.title}`,
      incidentId: ip.incidentId,
      riskScore: calculateRiskScore(factors),
    });
  }

  findings.sort((a, b) => b.riskScore - a.riskScore);

  const topScores = findings.slice(0, 10).map((f) => f.riskScore);
  const aggregateScore =
    topScores.length > 0
      ? Math.min(100, Math.round(topScores.reduce((a, b) => a + b, 0) / topScores.length))
      : 0;

  const riskLevel = getRiskLevel(aggregateScore);

  return {
    findings,
    riskScore: aggregateScore,
    riskLevel,
    dependencyCount: deps.length,
  };
}
