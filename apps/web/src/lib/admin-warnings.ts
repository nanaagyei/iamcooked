export type AdminIncidentWarningInput = {
  id: string;
  severity: string;
  confidence: string;
  technicalSummary?: string | null;
  sources: Array<{
    source: {
      sourceType: string;
    };
  }>;
  packages: Array<{
    packageName: string;
    affectedVersions?: unknown;
    notes?: string | null;
  }>;
};

export type AdminIncidentWarning = {
  id: string;
  label: string;
};

export function getAdminIncidentWarnings(incident: AdminIncidentWarningInput): AdminIncidentWarning[] {
  const warnings: AdminIncidentWarning[] = [];

  if (incident.sources.length < 2) {
    warnings.push({ id: "low-sources", label: "Fewer than 2 sources" });
  }

  const missingVersions = incident.packages.some((pkg) => {
    const versions = pkg.affectedVersions;
    return !versions || (Array.isArray(versions) && versions.length === 0);
  });
  if (missingVersions) {
    warnings.push({ id: "missing-versions", label: "Missing affected versions" });
  }

  const inferredPackage = incident.packages.some(
    (pkg) => pkg.notes?.toLowerCase().includes("inferred") ?? false,
  );
  if (inferredPackage) {
    warnings.push({ id: "inferred-package", label: "Inferred package names" });
  }

  if (
    (incident.severity === "CRITICAL" || incident.severity === "HIGH") &&
    incident.confidence === "UNVERIFIED"
  ) {
    warnings.push({ id: "unverified-severity", label: "High severity with unverified confidence" });
  }

  const exploitUnknown =
    incident.technicalSummary?.toLowerCase().includes("exploit status unknown") ||
    incident.technicalSummary?.toLowerCase().includes("exploitability unknown");
  if (exploitUnknown) {
    warnings.push({ id: "exploit-unknown", label: "Exploit status unclear" });
  }

  if (incident.severity === "CRITICAL") {
    const hasKev = incident.sources.some((s) => s.source.sourceType === "CISA_KEV");
    if (!hasKev) {
      warnings.push({ id: "kev-unknown", label: "CISA KEV status unknown" });
    }
  }

  return warnings;
}

export function countIncidentsWithWarnings(
  incidents: AdminIncidentWarningInput[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const incident of incidents) {
    for (const warning of getAdminIncidentWarnings(incident)) {
      counts[warning.id] = (counts[warning.id] ?? 0) + 1;
    }
  }
  return counts;
}
