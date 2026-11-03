import { prisma } from "@iamcooked/db";
import type { ClaimVerificationContext } from "@iamcooked/ai";

export async function buildIncidentClaimContext(incidentId: string): Promise<ClaimVerificationContext> {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      packages: true,
      sources: { include: { source: true } },
    },
  });

  if (!incident) {
    return {};
  }

  const excerpts = incident.sources
    .map((link) => link.source.excerpt ?? link.source.title ?? "")
    .filter(Boolean);

  const versionStrings: string[] = [];
  for (const pkg of incident.packages) {
    const affected = pkg.affectedVersions as string[] | null;
    const patched = pkg.patchedVersions as string[] | null;
    if (affected) versionStrings.push(...affected);
    if (patched) versionStrings.push(...patched);
  }

  const combinedText = [
    incident.title,
    incident.technicalSummary ?? "",
    ...excerpts,
  ].join(" ");

  const cveIds = [...combinedText.matchAll(/\bCVE-\d{4}-\d+\b/gi)].map((m) => m[0]);
  const ghsaIds = [...combinedText.matchAll(/\bGHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b/gi)].map(
    (m) => m[0],
  );

  return {
    packageNames: incident.packages.map((p) => p.packageName),
    cveIds,
    ghsaIds,
    versionStrings,
    sourceExcerpts: excerpts,
  };
}

export async function buildScanRemediationContext(scanReportId: string) {
  const report = await prisma.scanReport.findUnique({
    where: { id: scanReportId },
    include: {
      findings: {
        orderBy: { severity: "desc" },
        include: {
          advisory: true,
          incident: {
            include: {
              packages: true,
              sources: { include: { source: true } },
            },
          },
        },
      },
    },
  });

  if (!report) return null;

  const findings = report.findings.map((f) => ({
    packageName: f.packageName,
    installedVersion: f.installedVersion,
    severity: f.severity,
    confidence: f.confidence,
    explanation: f.explanation,
    findingType: f.findingType,
    advisory: f.advisory
      ? {
          externalId: f.advisory.externalId,
          summary: f.advisory.summary,
          patchedVersions: f.advisory.patchedVersions,
          affectedRanges: f.advisory.affectedRanges,
        }
      : null,
    incident: f.incident
      ? {
          title: f.incident.title,
          severity: f.incident.severity,
          beginnerTldr: f.incident.beginnerTldr,
          recommendedActions: f.incident.recommendedActions,
        }
      : null,
  }));

  const packageNames = [...new Set(report.findings.map((f) => f.packageName))];
  const versionStrings = report.findings
    .map((f) => f.installedVersion)
    .filter((v): v is string => !!v);

  const sourceExcerpts = report.findings.flatMap((f) => {
    if (!f.incident) return [];
    return f.incident.sources.map((s) => s.source.excerpt ?? s.source.title ?? "");
  });

  const claimContext: ClaimVerificationContext = {
    packageNames,
    versionStrings,
    sourceExcerpts,
  };

  return { report, findings, claimContext };
}
