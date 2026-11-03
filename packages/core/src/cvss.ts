/**
 * CVSS v3.x base score calculator (FIRST spec §7). OSV stores severities as vector strings
 * such as "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" — not numbers — so a score has to
 * be computed. CVSS v4 vectors use a lookup-table algorithm; for those we fall back to the
 * advisory's own severity label.
 */

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

const W = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
} as const;

function roundUp(n: number): number {
  const i = Math.round(n * 100000);
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10;
}

export function cvss3BaseScore(vector: string): number | null {
  if (!/^CVSS:3\.[01]\//.test(vector)) return null;
  const m: Record<string, string> = {};
  for (const part of vector.split("/").slice(1)) {
    const [k, v] = part.split(":");
    if (k && v) m[k] = v;
  }
  const av = W.AV[m["AV"] as keyof typeof W.AV];
  const ac = W.AC[m["AC"] as keyof typeof W.AC];
  const ui = W.UI[m["UI"] as keyof typeof W.UI];
  const c = W.CIA[m["C"] as keyof typeof W.CIA];
  const i = W.CIA[m["I"] as keyof typeof W.CIA];
  const a = W.CIA[m["A"] as keyof typeof W.CIA];
  const scope = m["S"];
  if ([av, ac, ui, c, i, a].some((x) => x === undefined) || (scope !== "U" && scope !== "C")) return null;
  const changed = scope === "C";
  const prMap = changed ? { N: 0.85, L: 0.68, H: 0.5 } : { N: 0.85, L: 0.62, H: 0.27 };
  const pr = prMap[m["PR"] as keyof typeof prMap];
  if (pr === undefined) return null;

  const iss = 1 - (1 - c!) * (1 - i!) * (1 - a!);
  const impact = changed ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const exploitability = 8.22 * av! * ac! * pr * ui!;
  if (impact <= 0) return 0;
  return changed
    ? roundUp(Math.min(1.08 * (impact + exploitability), 10))
    : roundUp(Math.min(impact + exploitability, 10));
}

export function severityFromScore(score: number): SeverityLevel {
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "UNKNOWN";
}

export function normalizeSeverityLabel(label: unknown): SeverityLevel | null {
  if (typeof label !== "string") return null;
  const l = label.trim().toUpperCase();
  if (l === "MODERATE") return "MEDIUM";
  if (l === "CRITICAL" || l === "HIGH" || l === "MEDIUM" || l === "LOW") return l;
  return null;
}

/** Rank for sorting: higher is worse. */
export const SEVERITY_RANK: Record<SeverityLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  UNKNOWN: 0,
};
