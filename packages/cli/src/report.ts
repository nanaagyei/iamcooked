import type { AnalysisResult, CookedVerdict, CoreEcosystem, ToolEntry } from "@iamcooked/core";
import { getCookedVerdict, getRiskLevel, type RiskLevel } from "@iamcooked/core";
import type { McpIssue } from "@iamcooked/scanner";
import { groupFindings, type PackageGroup } from "./group";

export interface LockfileSummary {
  display: string;
  ecosystem?: CoreEcosystem;
  dependencies: number;
  error?: string;
}

export interface McpFileSummary {
  display: string;
  client?: string;
  servers: number;
  error?: string;
}

export interface DetectedTool {
  tool: ToolEntry;
  version: string;
  source: string;
}

export interface Report {
  tool: { name: "iamcooked"; version: string };
  generatedAt: string;
  root: string;
  lockfiles: LockfileSummary[];
  mcpFiles: McpFileSummary[];
  mcpIssues: Array<McpIssue & { file: string }>;
  detectedTools: DetectedTool[];
  analysis: AnalysisResult;
  groups: PackageGroup[];
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: CookedVerdict;
}

const MCP_WEIGHT: Record<McpIssue["severity"], number> = { HIGH: 60, MEDIUM: 30, LOW: 10, INFO: 0 };

export function buildReport(input: Omit<Report, "groups" | "riskScore" | "riskLevel" | "verdict" | "generatedAt" | "tool"> & { version: string }): Report {
  const mcpScore = Math.max(0, ...input.mcpIssues.map((i) => MCP_WEIGHT[i.severity]));
  const riskScore = Math.max(input.analysis.riskScore, mcpScore);
  const { version, ...rest } = input;
  return {
    tool: { name: "iamcooked", version },
    generatedAt: new Date().toISOString(),
    ...rest,
    groups: groupFindings(input.analysis.findings),
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    verdict: getCookedVerdict(riskScore),
  };
}

export type FailOn = "none" | "any" | "low" | "medium" | "high" | "critical";

const RANK = { UNKNOWN: 1, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 } as const;
const THRESHOLD: Record<Exclude<FailOn, "none">, number> = { any: 0, low: 1, medium: 2, high: 3, critical: 4 };

/** Should the process exit non-zero? Malware always counts as critical. */
export function shouldFail(report: Report, failOn: FailOn, includeDev: boolean): boolean {
  if (failOn === "none") return false;
  const t = THRESHOLD[failOn];
  const vulnHit = report.groups.some((g) => (includeDev || !g.devOnly || g.malware) && (g.malware ? 4 : RANK[g.severity]) >= t);
  const mcpRank = { HIGH: 3, MEDIUM: 2, LOW: 1, INFO: -1 } as const;
  const mcpHit = report.mcpIssues.some((i) => mcpRank[i.severity] >= t);
  return vulnHit || mcpHit;
}
