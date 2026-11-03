import { readFileSync } from "node:fs";
import type { Report } from "../report";

const LEVEL = { CRITICAL: "error", HIGH: "error", MEDIUM: "warning", LOW: "note", UNKNOWN: "note" } as const;
const SCORE = { CRITICAL: "9.5", HIGH: "8.0", MEDIUM: "5.5", LOW: "3.0", UNKNOWN: "0.0" } as const;

function lineOf(path: string, needle: string, cache: Map<string, string[]>): number {
  let lines = cache.get(path);
  if (!lines) {
    try {
      lines = readFileSync(path, "utf8").split("\n");
    } catch {
      lines = [];
    }
    cache.set(path, lines);
  }
  const idx = lines.findIndex((l) => l.includes(needle));
  return idx === -1 ? 1 : idx + 1;
}

/** SARIF 2.1.0 for GitHub code scanning (`github/codeql-action/upload-sarif`). */
export function renderSarif(report: Report, pathMap: Map<string, string>): string {
  const rules = new Map<string, object>();
  const results: object[] = [];
  const cache = new Map<string, string[]>();

  for (const f of report.analysis.findings) {
    if (!rules.has(f.id)) {
      rules.set(f.id, {
        id: f.id,
        name: f.kind === "MALWARE" ? "MaliciousPackage" : "VulnerableDependency",
        shortDescription: { text: f.summary },
        fullDescription: { text: f.details || f.summary },
        helpUri: f.url,
        help: { text: `${f.fixInstruction}${f.fixCommand ? `\n\n${f.fixCommand}` : ""}`, markdown: `${f.fixInstruction}${f.fixCommand ? `\n\n\`\`\`\n${f.fixCommand}\n\`\`\`` : ""}` },
        properties: {
          tags: ["security", "dependency", f.ecosystem.toLowerCase(), ...(f.cve ? [f.cve] : [])],
          "security-severity": f.cvssScore !== null ? f.cvssScore.toFixed(1) : SCORE[f.severity],
        },
      });
    }
    for (const file of f.sourceFiles) {
      const abs = pathMap.get(file) ?? file;
      results.push({
        ruleId: f.id,
        level: LEVEL[f.severity],
        message: {
          text: `${f.packageName}@${f.installedVersion}: ${f.summary}. ${f.fixedVersion ? `Fixed in ${f.fixedVersion}.` : f.fixInstruction}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: file.replace(/\\/g, "/") },
              region: { startLine: lineOf(abs, f.packageName, cache) },
            },
          },
        ],
        partialFingerprints: { packageVersion: `${f.ecosystem}/${f.packageName}@${f.installedVersion}/${f.id}` },
      });
    }
  }

  for (const i of report.mcpIssues) {
    const id = `MCP-${i.code}`;
    if (!rules.has(id)) {
      rules.set(id, {
        id,
        name: i.code,
        shortDescription: { text: i.title.replace(/"[^"]*"/g, "").trim() || i.code },
        help: { text: i.fix },
        properties: { tags: ["security", "mcp"], "security-severity": { HIGH: "8.0", MEDIUM: "5.5", LOW: "3.0", INFO: "0.0" }[i.severity] },
      });
    }
    results.push({
      ruleId: id,
      level: { HIGH: "error", MEDIUM: "warning", LOW: "note", INFO: "note" }[i.severity],
      message: { text: `${i.server}: ${i.title}. ${i.fix}` },
      locations: [{ physicalLocation: { artifactLocation: { uri: i.file.replace(/\\/g, "/") }, region: { startLine: lineOf(pathMap.get(i.file) ?? i.file, `"${i.server.split("/").pop()}"`, cache) } } }],
    });
  }

  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "iamcooked",
              version: report.tool.version,
              informationUri: "https://github.com/nanaagyei/iamcooked",
              rules: [...rules.values()],
            },
          },
          results,
        },
      ],
    },
    null,
    2,
  );
}
