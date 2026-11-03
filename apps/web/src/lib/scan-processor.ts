import type { NormalizedDependency } from "@iamcooked/scanner";
import { prisma } from "@iamcooked/db";
import {
  OsvClient,
  analyzeDependencies,
  calculateRiskScore,
  aggregateRiskScore,
  getRiskLevel,
  type RiskFactors,
  type VulnFinding,
} from "@iamcooked/core";
import { isInKev } from "@iamcooked/sources";
import { isVersionAffected, upsertAdvisoryFromFinding } from "./advisory-upsert";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";

export interface ProcessedFinding {
  packageName: string;
  installedVersion: string | null;
  findingType: "KNOWN_VULNERABILITY" | "AFFECTED_BY_INCIDENT" | "ACTIVELY_EXPLOITED" | "MALICIOUS_PACKAGE";
  severity: Severity;
  confidence: "CONFIRMED" | "LIKELY" | "DEVELOPING";
  explanation: string;
  incidentId?: string;
  advisoryId?: string;
  advisoryExternalId?: string;
  cveId?: string;
  fixedVersion?: string;
  actionItems?: unknown;
  riskScore: number;
}

function toRiskSeverity(severity: Severity): RiskFactors["severity"] {
  if (severity === "CRITICAL" || severity === "HIGH" || severity === "MEDIUM" || severity === "LOW") {
    return severity;
  }
  return "LOW";
}

function explain(f: VulnFinding): string {
  const where = f.direct ? "You depend on it directly" : "It's pulled in by another package";
  const dev = f.devOnly ? " (development only, so lower risk)" : "";
  if (f.kind === "MALWARE") {
    return `${f.packageName}@${f.installedVersion} is a known malicious release. Anything that installed it (your laptop, CI) should be treated as compromised.`;
  }
  const fix = f.fixedVersion ? ` Fixed in ${f.fixedVersion}.` : " No patched version yet.";
  const kev = f.inCisaKev ? " CISA lists this as actively exploited." : "";
  return `${f.summary}. ${where}${dev}.${kev}${fix}`.replace(/\.\./g, ".");
}

const osv = new OsvClient({ baseUrl: process.env["OSV_API_BASE_URL"], userAgent: "iamcooked-web" });

async function kevSafe(cve: string): Promise<boolean> {
  try {
    return await isInKev(cve);
  } catch {
    return false; // KEV is an enrichment — never fail a scan because CISA is slow
  }
}

export async function processLockfileScan(deps: NormalizedDependency[]) {
  const packageNames = [...new Set(deps.map((d) => d.name))];

  const [analysis, matchedIncidentPackages] = await Promise.all([
    analyzeDependencies(deps, { osv, isKev: kevSafe }),
    prisma.incidentPackage.findMany({
      where: {
        packageName: { in: packageNames },
        incident: { status: "PUBLISHED" },
      },
      include: {
        incident: { select: { id: true, severity: true, slug: true, title: true, status: true } },
      },
    }),
  ]);

  const findings: ProcessedFinding[] = [];
  const advisoryCache = new Map<string, string>();

  for (const f of analysis.findings) {
    let advisoryId = advisoryCache.get(f.id);
    if (!advisoryId) {
      advisoryId = await upsertAdvisoryFromFinding(f);
      advisoryCache.set(f.id, advisoryId);
    }

    findings.push({
      packageName: f.packageName,
      installedVersion: f.installedVersion,
      findingType: f.kind === "MALWARE" ? "MALICIOUS_PACKAGE" : f.inCisaKev ? "ACTIVELY_EXPLOITED" : "KNOWN_VULNERABILITY",
      severity: f.severity,
      confidence: "CONFIRMED",
      explanation: explain(f),
      advisoryId,
      advisoryExternalId: f.id,
      cveId: f.cve ?? undefined,
      fixedVersion: f.fixedVersion ?? undefined,
      riskScore: f.riskScore,
      actionItems: [
        {
          action: f.fixInstruction,
          command: f.fixCommand ?? undefined,
          urgency: f.kind === "MALWARE" || f.severity === "CRITICAL" || f.inCisaKev ? "immediate" : "soon",
        },
      ],
    });
  }

  const seen = new Set<string>();
  for (const ip of matchedIncidentPackages) {
    const dep = deps.find((d) => d.name === ip.packageName);
    if (!isVersionAffected(dep?.version, ip.affectedVersions, ip.patchedVersions)) continue;

    const key = `incident:${ip.packageName}:${ip.incidentId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const severity = ip.incident.severity as Severity;
    findings.push({
      packageName: ip.packageName,
      installedVersion: dep?.version ?? null,
      findingType: "AFFECTED_BY_INCIDENT",
      severity,
      confidence: "CONFIRMED",
      explanation: `Your project includes ${ip.packageName}, which matches incident: ${ip.incident.title}`,
      incidentId: ip.incidentId,
      riskScore: calculateRiskScore({
        hasKnownVulnerability: true,
        severity: toRiskSeverity(severity),
        inCisaKev: false,
        isDirectDependency: dep?.direct ?? false,
        isTransitiveDependency: !(dep?.direct ?? false),
        isKnownMalicious: false,
        hasRecentSupplyChainIncident: true,
        hasPatchAvailable: false,
        isDevOnly: dep?.dev ?? false,
      }),
    });
  }

  findings.sort((a, b) => b.riskScore - a.riskScore);
  const riskScore = aggregateRiskScore(findings.map((f) => f.riskScore));

  return {
    findings,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    dependencyCount: deps.length,
    uncheckedCount: analysis.unchecked.length,
  };
}
