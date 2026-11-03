import { satisfies, valid } from "semver";
import type { VulnFinding } from "@iamcooked/core";
import type { Prisma } from "@iamcooked/db";
import { prisma } from "@iamcooked/db";

/** Cache a finding's advisory so scan reports and the dashboard can link to it. */
export async function upsertAdvisoryFromFinding(f: VulnFinding): Promise<string> {
  const source = f.id.startsWith("GHSA-") ? "GITHUB" : "OSV";
  const severity = f.severity;
  const data = {
    packageName: f.packageName,
    ecosystem: f.ecosystem,
    severity,
    cvssScore: f.cvssScore ?? undefined,
    summary: f.summary,
    details: f.details || undefined,
    patchedVersions: (f.fixedVersion ? [f.fixedVersion] : []) as Prisma.InputJsonValue,
    references: [f.url, ...f.aliases] as Prisma.InputJsonValue,
    publishedAt: f.published ? new Date(f.published) : undefined,
  };
  const advisory = await prisma.advisory.upsert({
    where: { externalId: f.id },
    create: { externalId: f.id, source, ...data },
    update: data,
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
