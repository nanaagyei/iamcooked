import type { MockIncident, MockIncidentPackage } from "@/lib/mock-incidents";
import type { AffectedPackage } from "@/components/incidents/AffectedPackageTable";
import type { IncidentCardProps } from "@/components/incidents/IncidentCard";

export function toIncidentCardProps(incident: MockIncident): IncidentCardProps {
  return {
    slug: incident.slug,
    title: incident.title,
    severity: incident.severity as IncidentCardProps["severity"],
    confidence: incident.confidence as IncidentCardProps["confidence"],
    ecosystem: incident.ecosystem,
    incidentType: incident.incidentType,
    beginnerTldr: incident.beginnerTldr,
    affectedPackages: incident.affectedPackages.map((pkg) => ({
      packageName: pkg.name,
      ecosystem: pkg.ecosystem,
    })),
    publishedAt: incident.publishedAt,
    sourceCount: incident.sources.length,
  };
}

export function toAffectedPackageArray(packages: MockIncidentPackage[]): AffectedPackage[] {
  return packages.map((pkg) => ({
    packageName: pkg.packageName,
    ecosystem: pkg.ecosystem,
    affectedVersions: pkg.affectedVersions.join(", "),
    patchedVersions: pkg.patchedVersions.join(", "),
  }));
}

type DbIncident = {
  slug: string;
  title: string;
  severity: string;
  confidence: string;
  ecosystem?: string | null;
  incidentType: string;
  beginnerTldr?: string | null;
  publishedAt?: Date | null;
  packages: Array<{ packageName: string; ecosystem: string }>;
  sources: Array<unknown>;
};

export function toIncidentCardPropsFromDb(incident: DbIncident): IncidentCardProps {
  return {
    slug: incident.slug,
    title: incident.title,
    severity: incident.severity as IncidentCardProps["severity"],
    confidence: incident.confidence as IncidentCardProps["confidence"],
    ecosystem: incident.ecosystem ?? "NPM",
    incidentType: incident.incidentType,
    beginnerTldr: incident.beginnerTldr ?? "",
    affectedPackages: incident.packages.map((pkg) => ({
      packageName: pkg.packageName,
      ecosystem: pkg.ecosystem,
    })),
    publishedAt: incident.publishedAt?.toISOString() ?? new Date().toISOString(),
    sourceCount: incident.sources.length,
  };
}
