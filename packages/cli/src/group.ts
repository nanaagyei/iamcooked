import { compareVersions, SEVERITY_RANK, type VulnFinding, type SeverityLevel } from "@iamcooked/core";

export interface PackageGroup {
  key: string;
  ecosystem: VulnFinding["ecosystem"];
  packageName: string;
  installedVersion: string;
  direct: boolean;
  devOnly: boolean;
  malware: boolean;
  kev: boolean;
  severity: SeverityLevel;
  riskScore: number;
  /** Version that resolves every advisory on this package (highest needed fix). */
  fixedVersion: string | null;
  /** True when the fix crosses a major version (may need code changes). */
  majorBump: boolean;
  /** True when at least one advisory has no fix yet. */
  someUnfixed: boolean;
  fixCommand: string | null;
  fixInstruction: string;
  sourceFiles: string[];
  via: string[];
  findings: VulnFinding[];
}

function majorOf(v: string): string {
  const parts = v.replace(/^v/, "").split(".");
  // 0.x releases treat the minor as the breaking component
  return parts[0] === "0" ? `0.${parts[1] ?? ""}` : (parts[0] ?? "");
}

/** Collapse many advisories on one package@version into one actionable row. */
export function groupFindings(findings: VulnFinding[]): PackageGroup[] {
  const map = new Map<string, VulnFinding[]>();
  for (const f of findings) {
    const key = `${f.ecosystem}:${f.packageName}@${f.installedVersion}`;
    map.set(key, [...(map.get(key) ?? []), f]);
  }
  const groups: PackageGroup[] = [];
  for (const [key, list] of map) {
    list.sort((a, b) => b.riskScore - a.riskScore || SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
    const top = list[0]!;
    const fixes = list.map((f) => f.fixedVersion).filter((v): v is string => !!v);
    fixes.sort(compareVersions);
    const fixedVersion = fixes[fixes.length - 1] ?? null;
    const carrier = list.find((f) => f.fixedVersion === fixedVersion) ?? top;
    const malware = list.some((f) => f.kind === "MALWARE");
    const severity = list.reduce<SeverityLevel>(
      (worst, f) => (SEVERITY_RANK[f.severity] > SEVERITY_RANK[worst] ? f.severity : worst),
      "UNKNOWN",
    );
    groups.push({
      key,
      ecosystem: top.ecosystem,
      packageName: top.packageName,
      installedVersion: top.installedVersion,
      direct: top.direct,
      devOnly: top.devOnly,
      malware,
      kev: list.some((f) => f.inCisaKev),
      severity,
      riskScore: Math.max(...list.map((f) => f.riskScore)),
      fixedVersion: malware ? null : fixedVersion,
      someUnfixed: list.some((f) => !f.fixedVersion),
      majorBump: !!fixedVersion && majorOf(fixedVersion) !== majorOf(top.installedVersion),
      fixCommand: malware ? (list.find((f) => f.kind === "MALWARE")!.fixCommand) : carrier.fixCommand,
      fixInstruction: malware ? list.find((f) => f.kind === "MALWARE")!.fixInstruction : carrier.fixInstruction,
      sourceFiles: [...new Set(list.flatMap((f) => f.sourceFiles))],
      via: [...new Set(list.flatMap((f) => f.via))],
      findings: list,
    });
  }
  return groups.sort(
    (a, b) =>
      Number(b.malware) - Number(a.malware) ||
      b.riskScore - a.riskScore ||
      Number(b.kev) - Number(a.kev) ||
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      a.packageName.localeCompare(b.packageName),
  );
}
