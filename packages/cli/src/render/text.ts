import { ECOSYSTEM_LABEL, type SeverityLevel } from "@iamcooked/core";
import { c } from "../ansi";
import type { Report } from "../report";
import type { PackageGroup } from "../group";

const SEV_STYLE: Record<SeverityLevel, (s: string) => string> = {
  CRITICAL: (s) => c.bold(c.red(s)),
  HIGH: (s) => c.red(s),
  MEDIUM: (s) => c.yellow(s),
  LOW: (s) => c.blue(s),
  UNKNOWN: (s) => c.gray(s),
};
const SEV_LABEL: Record<SeverityLevel, string> = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH    ",
  MEDIUM: "MEDIUM  ",
  LOW: "LOW     ",
  UNKNOWN: "UNRATED ",
};

const TONE_STYLE = {
  safe: (s: string) => c.bold(c.green(s)),
  low: (s: string) => c.bold(c.blue(s)),
  medium: (s: string) => c.bold(c.yellow(s)),
  high: (s: string) => c.bold(c.red(s)),
  critical: (s: string) => c.bold(c.inverse(c.red(` ${s} `))),
} as const;

const PAD = "  ";
const INDENT = "            ";

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function why(g: PackageGroup): string {
  if (g.malware) return c.bold(c.red("Known malicious release — assume anything this machine/CI could reach is compromised."));
  const bits: string[] = [];
  if (g.kev) bits.push(c.red("actively exploited in the wild (CISA KEV)"));
  bits.push(g.direct ? "you depend on it directly" : "pulled in by another package");
  if (g.devOnly) bits.push(c.dim("dev-only, lower risk"));
  if (g.via.length) bits.push(`used by MCP server ${g.via.map((v) => v.replace(/^mcp:/, "")).join(", ")}`);
  return bits.join(" · ");
}

function renderGroup(g: PackageGroup, verbose: boolean): string[] {
  const lines: string[] = [];
  const sev = g.malware ? c.bold(c.inverse(c.red(" MALWARE "))) : SEV_STYLE[g.severity](SEV_LABEL[g.severity]);
  const arrow = g.fixedVersion ? `${c.dim("→")} ${c.green(g.fixedVersion)}` : g.malware ? "" : c.dim("(no fix yet)");
  const eco = c.dim(ECOSYSTEM_LABEL[g.ecosystem]);
  lines.push(`${PAD}${sev}  ${c.bold(g.packageName)} ${c.dim(g.installedVersion)} ${arrow}  ${eco}`);

  const top = g.findings[0]!;
  const extra = g.findings.length > 1 ? c.dim(` (+${g.findings.length - 1} more)`) : "";
  lines.push(`${INDENT}${top.summary}${extra}`);
  lines.push(`${INDENT}${c.dim(why(g))}`);
  const ids = [top.cve, top.id].filter(Boolean).join(" · ");
  lines.push(`${INDENT}${c.dim(ids)}  ${c.dim(c.underline(top.url))}`);
  if (g.fixCommand) lines.push(`${INDENT}${c.cyan("$")} ${c.bold(g.fixCommand)}`);
  else lines.push(`${INDENT}${c.cyan("→")} ${g.fixInstruction}`);
  if (g.fixCommand && !g.direct && !g.malware) lines.push(`${INDENT}${c.dim(g.fixInstruction)}`);
  if (g.majorBump && g.fixCommand) lines.push(`${INDENT}${c.yellow("!")} ${c.dim("Major version upgrade — skim the changelog and run your tests (or ask your agent to do the migration).")}`);
  if (g.someUnfixed && g.fixedVersion) lines.push(`${INDENT}${c.yellow("!")} ${c.dim("Some advisories on this package have no fix yet.")}`);

  if (verbose && g.findings.length > 1) {
    for (const f of g.findings.slice(1)) {
      lines.push(`${INDENT}${c.dim("·")} ${SEV_STYLE[f.severity](f.severity.toLowerCase())} ${f.summary} ${c.dim(f.cve ?? f.id)}`);
    }
  }
  lines.push(`${INDENT}${c.dim(`in ${g.sourceFiles.join(", ")}`)}`);
  return lines;
}

export interface TextOptions {
  verbose: boolean;
  limit: number;
  showDev: boolean;
}

export function renderText(report: Report, opts: TextOptions): string {
  const out: string[] = [""];
  const { analysis } = report;

  // ---- What we looked at
  const lf = report.lockfiles.filter((l) => !l.error);
  const ecos = [...new Set(lf.map((l) => l.ecosystem).filter(Boolean))].map((e) => ECOSYSTEM_LABEL[e!]);
  const looked: string[] = [];
  if (lf.length) looked.push(`${plural(lf.length, "lockfile")} · ${analysis.dependencyCount} packages${ecos.length ? ` (${ecos.join(", ")})` : ""}`);
  if (report.mcpFiles.length) looked.push(`${plural(report.mcpFiles.filter((m) => !m.error).length, "MCP config")} · ${plural(report.mcpFiles.reduce((a, m) => a + m.servers, 0), "server")}`);
  if (report.detectedTools.length) looked.push(`${plural(report.detectedTools.length, "AI tool")} detected`);
  out.push(`${PAD}${c.bold("iamcooked")} ${c.dim(`v${report.tool.version}`)}  ${c.dim(report.root)}`);
  out.push(`${PAD}${c.dim(looked.join("  ·  ") || "Nothing to scan.")}`);
  for (const l of report.lockfiles.filter((l) => l.error)) out.push(`${PAD}${c.yellow("!")} ${l.display}: ${c.dim(l.error!)}`);
  for (const m of report.mcpFiles.filter((m) => m.error)) out.push(`${PAD}${c.yellow("!")} ${m.display}: ${c.dim(m.error!)}`);

  if (report.detectedTools.length) {
    out.push("");
    out.push(`${PAD}${c.bold("Your AI tools")}`);
    for (const d of report.detectedTools) {
      const hit = report.groups.find((g) => g.packageName === d.tool.packageName && g.installedVersion === d.version);
      const status = hit
        ? hit.malware
          ? c.red("malicious version!")
          : `${SEV_STYLE[hit.severity](plural(hit.findings.length, "advisory").replace("advisorys", "advisories"))} ${hit.fixedVersion ? c.dim(`→ update to ${hit.fixedVersion}`) : ""}`
        : c.green("no known CVEs");
      out.push(`${PAD}  ${d.tool.name.padEnd(22)} ${c.dim(d.version.padEnd(12))} ${status}`);
    }
  }

  // ---- Verdict
  out.push("");
  const tone = TONE_STYLE[report.verdict.tone];
  out.push(`${PAD}${tone(report.verdict.label.toUpperCase())}  ${c.dim(`risk ${report.riskScore}/100`)}`);
  out.push(`${PAD}${report.verdict.blurb}`);

  const counts = analysis.counts;
  const parts: string[] = [];
  if (counts.MALWARE) parts.push(c.bold(c.red(plural(counts.MALWARE, "malicious package"))));
  if (counts.CRITICAL) parts.push(SEV_STYLE.CRITICAL(`${counts.CRITICAL} critical`));
  if (counts.HIGH) parts.push(SEV_STYLE.HIGH(`${counts.HIGH} high`));
  if (counts.MEDIUM) parts.push(SEV_STYLE.MEDIUM(`${counts.MEDIUM} medium`));
  if (counts.LOW) parts.push(SEV_STYLE.LOW(`${counts.LOW} low`));
  if (counts.UNKNOWN) parts.push(c.gray(`${counts.UNKNOWN} unrated`));
  if (parts.length) out.push(`${PAD}${parts.join(c.dim(" · "))} ${c.dim(`advisories across ${plural(report.groups.length, "package")}`)}`);

  // ---- Package findings
  const visible = report.groups.filter((g) => opts.showDev || !g.devOnly || g.malware);
  const hiddenDev = report.groups.length - visible.length;
  if (visible.length) {
    out.push("");
    out.push(`${PAD}${c.bold("Fix these first")}`);
    out.push("");
    for (const g of visible.slice(0, opts.limit)) {
      out.push(...renderGroup(g, opts.verbose), "");
    }
    if (visible.length > opts.limit) {
      out.push(`${PAD}${c.dim(`…and ${visible.length - opts.limit} more packages. Run with --all to see everything, or --format markdown for a full report.`)}`, "");
    }
  }
  if (hiddenDev > 0) out.push(`${PAD}${c.dim(`${plural(hiddenDev, "dev-only package")} with advisories hidden (--dev to show).`)}`);

  // ---- MCP
  const mcpVisible = report.mcpIssues.filter((i) => i.severity !== "INFO" || opts.verbose);
  if (mcpVisible.length) {
    out.push("");
    out.push(`${PAD}${c.bold("MCP server config")}`);
    out.push("");
    const st = { HIGH: SEV_STYLE.HIGH("HIGH    "), MEDIUM: SEV_STYLE.MEDIUM("MEDIUM  "), LOW: SEV_STYLE.LOW("LOW     "), INFO: c.gray("INFO    ") };
    for (const i of mcpVisible) {
      out.push(`${PAD}${st[i.severity]}  ${c.bold(i.server)}: ${i.title}`);
      out.push(`${INDENT}${c.dim(i.detail)}`);
      out.push(`${INDENT}${c.cyan("→")} ${i.fix}`);
      out.push(`${INDENT}${c.dim(`in ${i.file}`)}`, "");
    }
  }

  // ---- Unchecked
  if (analysis.unchecked.length) {
    const names = analysis.unchecked.slice(0, 6).map((u) => u.name).join(", ");
    const more = analysis.unchecked.length > 6 ? ` +${analysis.unchecked.length - 6}` : "";
    out.push(`${PAD}${c.yellow("!")} ${plural(analysis.unchecked.length, "package")} had no pinned version and couldn't be checked: ${c.dim(names + more)}`);
    out.push(`${PAD}  ${c.dim("Commit a lockfile (or pin with ==) so iamcooked can check exact versions.")}`);
  }

  if (report.groups.length === 0 && mcpVisible.length === 0 && (lf.length || report.mcpFiles.length || report.detectedTools.length)) {
    out.push("");
    out.push(`${PAD}${c.green("✓")} No known vulnerabilities or malware in what we checked.`);
  }

  out.push("");
  out.push(`${PAD}${c.dim("Data: OSV.dev (GitHub Advisories, PyPA, Go, RustSec, OpenSSF malicious packages) + CISA KEV.")}`);
  out.push(`${PAD}${c.dim("Only package names & versions leave your machine. github.com/nanaagyei/iamcooked")}`);
  out.push("");
  return out.join("\n");
}
