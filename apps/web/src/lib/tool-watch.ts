import { unstable_cache } from "next/cache";
import {
  OsvClient,
  TOOL_CATALOG,
  recordSeverity,
  normalizePackageName,
  fromOsvEcosystem,
  type OsvRecord,
  type SeverityLevel,
  type ToolEntry,
} from "@iamcooked/core";

export interface ToolAdvisory {
  id: string;
  cve: string | null;
  summary: string;
  severity: SeverityLevel;
  published: string | null;
  fixedVersions: string[];
  malware: boolean;
  url: string;
}

export interface ToolStatus {
  tool: ToolEntry;
  total: number;
  last90Days: number;
  last365Days: number;
  criticalOrHigh365: number;
  latest: ToolAdvisory | null;
  recent: ToolAdvisory[];
  /** Advisories first published in each of the last 12 months (oldest first). */
  monthly: number[];
  error?: boolean;
}

const DAY = 24 * 60 * 60 * 1000;

function toAdvisory(rec: OsvRecord, tool: ToolEntry): ToolAdvisory {
  const id = rec.id.startsWith("GHSA-") ? rec.id : (rec.aliases ?? []).find((a) => a.startsWith("GHSA-")) ?? rec.id;
  const fixed = new Set<string>();
  for (const a of rec.affected ?? []) {
    if (!a.package || fromOsvEcosystem(a.package.ecosystem) !== tool.ecosystem) continue;
    if (normalizePackageName(tool.ecosystem, a.package.name) !== normalizePackageName(tool.ecosystem, tool.packageName)) continue;
    for (const r of a.ranges ?? []) for (const e of r.events) if (e.fixed) fixed.add(e.fixed);
  }
  return {
    id,
    cve: [rec.id, ...(rec.aliases ?? [])].find((a) => a.startsWith("CVE-")) ?? null,
    summary: (rec.summary || rec.details || rec.id).replace(/\s+/g, " ").slice(0, 180),
    severity: rec.id.startsWith("MAL-") ? "CRITICAL" : recordSeverity(rec).severity,
    published: rec.published ?? null,
    fixedVersions: [...fixed],
    malware: rec.id.startsWith("MAL-"),
    url: id.startsWith("GHSA-") ? `https://github.com/advisories/${id}` : `https://osv.dev/vulnerability/${id}`,
  };
}

function monthlyCounts(advisories: ToolAdvisory[], now: number): number[] {
  const end = new Date(now);
  const buckets = new Array<number>(12).fill(0);
  for (const a of advisories) {
    if (!a.published) continue;
    const d = new Date(a.published);
    const diff = (end.getUTCFullYear() - d.getUTCFullYear()) * 12 + (end.getUTCMonth() - d.getUTCMonth());
    if (diff >= 0 && diff < 12) buckets[11 - diff]! += 1;
  }
  return buckets;
}

async function loadToolStatuses(): Promise<ToolStatus[]> {
  const osv = new OsvClient({ baseUrl: process.env["OSV_API_BASE_URL"], userAgent: "iamcooked-web", concurrency: 6 });
  const now = Date.now();

  const results = await Promise.all(
    TOOL_CATALOG.map(async (tool): Promise<ToolStatus> => {
      try {
        const records = await osv.queryPackage(tool.ecosystem, tool.packageName);
        // Collapse GHSA/PYSEC duplicates of the same bug
        const seen = new Set<string>();
        const advisories: ToolAdvisory[] = [];
        for (const rec of records.sort((a, b) => Number(b.id.startsWith("GHSA-")) - Number(a.id.startsWith("GHSA-")))) {
          const ids = [rec.id, ...(rec.aliases ?? [])];
          if (ids.some((x) => seen.has(x))) continue;
          ids.forEach((x) => seen.add(x));
          advisories.push(toAdvisory(rec, tool));
        }
        advisories.sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
        const age = (a: ToolAdvisory) => (a.published ? now - new Date(a.published).getTime() : Infinity);
        const in365 = advisories.filter((a) => age(a) <= 365 * DAY);
        return {
          tool,
          total: advisories.length,
          last90Days: advisories.filter((a) => age(a) <= 90 * DAY).length,
          last365Days: in365.length,
          criticalOrHigh365: in365.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length,
          latest: advisories[0] ?? null,
          recent: advisories.slice(0, 5),
          monthly: monthlyCounts(advisories, now),
        };
      } catch {
        return { tool, total: 0, last90Days: 0, last365Days: 0, criticalOrHigh365: 0, latest: null, recent: [], monthly: [], error: true };
      }
    }),
  );
  return results;
}

/** Cached for 6 hours — OSV data changes slowly and this fans out ~40 requests. */
export const getToolStatuses = unstable_cache(loadToolStatuses, ["tool-watch-v2"], { revalidate: 6 * 60 * 60 });
