import { satisfies, valid } from "semver";
import type { OsvVulnerability } from "@iamcooked/sources";
import type { Prisma } from "@iamcooked/db";
import { prisma } from "@iamcooked/db";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";

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

export async function upsertAdvisoryFromOsv(
  vuln: OsvVulnerability,
): Promise<string> {
  const severity = mapOsvSeverity(vuln);
  const cvss = vuln.severity?.find((s) => s.type === "CVSS_V3")?.score;
  const cvssScore = cvss ? parseFloat(cvss.split("/")[0] ?? "0") : undefined;

  const advisory = await prisma.advisory.upsert({
    where: { externalId: vuln.id },
    create: {
      externalId: vuln.id,
      source: "OSV",
      severity,
      cvssScore,
      summary: vuln.summary,
      details: vuln.details,
      affectedRanges: vuln.affectedVersions as Prisma.InputJsonValue,
      patchedVersions: vuln.patchedVersions as Prisma.InputJsonValue,
      references: vuln.aliases as Prisma.InputJsonValue,
      publishedAt: vuln.published ? new Date(vuln.published) : undefined,
      modifiedAt: vuln.modified ? new Date(vuln.modified) : undefined,
    },
    update: {
      severity,
      cvssScore,
      summary: vuln.summary,
      details: vuln.details,
      affectedRanges: vuln.affectedVersions as Prisma.InputJsonValue,
      patchedVersions: vuln.patchedVersions as Prisma.InputJsonValue,
      references: vuln.aliases as Prisma.InputJsonValue,
      modifiedAt: vuln.modified ? new Date(vuln.modified) : undefined,
    },
    select: { id: true },
  });

  return advisory.id;
}

function parseVersionList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function isVersionAffected(
  installedVersion: string | null | undefined,
  affectedVersions: unknown,
  patchedVersions: unknown,
): boolean {
  if (!installedVersion || !valid(installedVersion)) {
    return affectedVersions === null || affectedVersions === undefined;
  }

  const affected = parseVersionList(affectedVersions);
  const patched = parseVersionList(patchedVersions);

  if (patched.some((range) => satisfies(installedVersion, range, { includePrerelease: true }))) {
    return false;
  }

  if (affected.length === 0) return true;

  return affected.some((range) => {
    if (range === "0" || range === "*") return true;
    try {
      return satisfies(installedVersion, range, { includePrerelease: true });
    } catch {
      return installedVersion === range;
    }
  });
}
