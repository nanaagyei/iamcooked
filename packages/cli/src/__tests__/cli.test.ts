import { describe, expect, it } from "vitest";
import { getCookedVerdict, type AnalysisResult, type VulnFinding } from "@iamcooked/core";
import { parseArgs, UsageError } from "../args";
import { groupFindings } from "../group";
import { buildReport, shouldFail } from "../report";
import { renderMarkdown } from "../render/markdown";
import { renderSarif } from "../render/sarif";
import { renderText } from "../render/text";

function finding(over: Partial<VulnFinding>): VulnFinding {
  return {
    id: "GHSA-aaaa",
    aliases: [],
    cve: "CVE-2025-0001",
    kind: "VULNERABILITY",
    ecosystem: "NPM",
    packageName: "next",
    installedVersion: "14.1.0",
    direct: true,
    devOnly: false,
    sourceFiles: ["package-lock.json"],
    via: [],
    severity: "HIGH",
    cvssScore: 7.5,
    summary: "Something bad",
    details: "",
    fixedVersion: "14.2.25",
    fixCommand: "npm install next@^14.2.25",
    fixInstruction: "Upgrade next to 14.2.25 or later.",
    inCisaKev: false,
    published: null,
    url: "https://github.com/advisories/GHSA-aaaa",
    riskScore: 50,
    ...over,
  };
}

function analysis(findings: VulnFinding[]): AnalysisResult {
  return {
    findings,
    unchecked: [],
    dependencyCount: 10,
    ecosystems: ["NPM"],
    riskScore: Math.max(0, ...findings.map((f) => f.riskScore)),
    riskLevel: "MEDIUM",
    verdict: getCookedVerdict(50),
    counts: { CRITICAL: 0, HIGH: findings.length, MEDIUM: 0, LOW: 0, UNKNOWN: 0, MALWARE: 0 },
  };
}

describe("parseArgs", () => {
  it("defaults to scanning the current directory", () => {
    expect(parseArgs([], {})).toMatchObject({ command: "scan", paths: ["."], format: "text", failOn: "none" });
  });
  it("parses commands and flags", () => {
    expect(parseArgs(["doctor", "--json", "--fail-on=critical", "--prod", "apps/web"], {})).toMatchObject({
      command: "doctor",
      format: "json",
      failOn: "critical",
      showDev: false,
      paths: ["apps/web"],
    });
    expect(parseArgs(["--ci"], {}).failOn).toBe("high");
    expect(parseArgs(["--ci", "--fail-on", "low"], {}).failOn).toBe("low");
  });
  it("rejects bad input", () => {
    expect(() => parseArgs(["--format", "pdf"], {})).toThrow(UsageError);
    expect(() => parseArgs(["--nope"], {})).toThrow(UsageError);
  });
});

describe("groupFindings", () => {
  it("collapses advisories per package and picks the highest fix", () => {
    const groups = groupFindings([
      finding({ id: "A", fixedVersion: "14.2.25", severity: "HIGH" }),
      finding({ id: "B", fixedVersion: "15.2.3", severity: "CRITICAL", riskScore: 70, fixCommand: "npm install next@^15.2.3" }),
      finding({ id: "C", packageName: "lodash", installedVersion: "4.17.15", fixedVersion: "4.17.21", riskScore: 30 }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ packageName: "next", fixedVersion: "15.2.3", severity: "CRITICAL", majorBump: true, fixCommand: "npm install next@^15.2.3" });
    expect(groups[1]).toMatchObject({ packageName: "lodash", majorBump: false });
  });
  it("puts malware first", () => {
    const groups = groupFindings([
      finding({ riskScore: 90 }),
      finding({ packageName: "evil", kind: "MALWARE", severity: "CRITICAL", riskScore: 60, fixedVersion: null, fixCommand: "npm uninstall evil" }),
    ]);
    expect(groups[0]!.packageName).toBe("evil");
    expect(groups[0]!.fixCommand).toBe("npm uninstall evil");
  });
});

describe("report", () => {
  const base = { version: "0.1.0", root: "~/app", lockfiles: [{ display: "package-lock.json", ecosystem: "NPM" as const, dependencies: 10 }], mcpFiles: [], detectedTools: [] };

  it("fails on threshold and respects --prod", () => {
    const report = buildReport({ ...base, mcpIssues: [], analysis: analysis([finding({ devOnly: true })]) });
    expect(shouldFail(report, "high", true)).toBe(true);
    expect(shouldFail(report, "high", false)).toBe(false);
    expect(shouldFail(report, "critical", true)).toBe(false);
    expect(shouldFail(report, "none", true)).toBe(false);
  });

  it("raises the verdict for risky MCP config even without CVEs", () => {
    const report = buildReport({
      ...base,
      mcpIssues: [{ server: "gh", code: "HARDCODED_SECRET", severity: "HIGH", title: "t", detail: "d", fix: "f", file: ".cursor/mcp.json" }],
      analysis: analysis([]),
    });
    expect(report.riskScore).toBe(60);
    expect(shouldFail(report, "high", true)).toBe(true);
  });

  it("renders all formats", () => {
    const report = buildReport({ ...base, mcpIssues: [], analysis: analysis([finding({})]) });
    const text = renderText(report, { verbose: false, limit: 15, showDev: true });
    expect(text).toContain("npm install next@^14.2.25");
    const md = renderMarkdown(report, { showDev: true });
    expect(md).toContain("| `next`");
    const sarif = JSON.parse(renderSarif(report, new Map()));
    expect(sarif.runs[0].results[0]).toMatchObject({ ruleId: "GHSA-aaaa", level: "error" });
    expect(sarif.runs[0].tool.driver.rules[0].properties["security-severity"]).toBe("7.5");
  });
});
