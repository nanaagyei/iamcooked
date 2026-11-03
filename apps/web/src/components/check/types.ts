export type CheckSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface CheckFinding {
  id: string;
  cve: string | null;
  kind: "VULNERABILITY" | "MALWARE";
  ecosystem: string;
  packageName: string;
  installedVersion: string;
  severity: CheckSeverity;
  cvssScore: number | null;
  summary: string;
  fixedVersion: string | null;
  fixCommand: string | null;
  fixInstruction: string;
  inCisaKev: boolean;
  published: string | null;
  url: string;
  via: string[];
}

export interface CheckResponse {
  riskScore: number;
  verdict: { label: string; blurb: string; tone: "safe" | "low" | "medium" | "high" | "critical" };
  counts: Record<CheckSeverity | "MALWARE", number>;
  findings: CheckFinding[];
}

export interface CheckPackage {
  ecosystem: "NPM" | "PYPI" | "GO" | "CARGO" | "RUBYGEMS" | "COMPOSER";
  name: string;
  version: string;
  via?: string;
}

export async function checkPackages(packages: CheckPackage[]): Promise<CheckResponse> {
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packages }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Check failed");
  return json as CheckResponse;
}
