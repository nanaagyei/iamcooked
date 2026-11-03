"use client";

import { useRef, useState } from "react";
import { CheckCircle, FileArrowUp, LockSimple, Plugs, ShieldWarning, WarningCircle } from "@phosphor-icons/react";
// Deep import keeps the lockfile parsers (and their YAML dependency) out of the browser bundle.
import { analyzeMcpConfig, type McpAnalysis, type McpIssue } from "@iamcooked/scanner/src/mcp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cookedToneStyles } from "@/lib/cooked";
import { FindingRow } from "@/components/check/FindingRow";
import { CopyCommand } from "@/components/check/CopyCommand";
import { checkPackages, type CheckResponse } from "@/components/check/types";

const EXAMPLE = `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_exampleexampleexampleexample1234" }
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote@0.1.10", "https://mcp.linear.app/sse"]
    },
    "files": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem@2025.8.21", "~"]
    }
  }
}`;

const LOCATIONS: Array<[string, string]> = [
  ["Cursor", "~/.cursor/mcp.json or .cursor/mcp.json"],
  ["Claude Desktop", "~/Library/Application Support/Claude/claude_desktop_config.json"],
  ["Claude Code", ".mcp.json or ~/.claude.json"],
  ["Windsurf", "~/.codeium/windsurf/mcp_config.json"],
  ["VS Code", ".vscode/mcp.json"],
];

const ISSUE_STYLE: Record<McpIssue["severity"], string> = {
  HIGH: "border-severity-high/30 bg-severity-high/10 text-severity-high",
  MEDIUM: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium",
  LOW: "border-severity-low/30 bg-severity-low/10 text-severity-low",
  INFO: "border-border bg-muted text-muted-foreground",
};

export function McpChecker() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<McpAnalysis | null>(null);
  const [vulns, setVulns] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (raw = text) => {
    setError(null);
    setVulns(null);
    let result: McpAnalysis;
    try {
      result = analyzeMcpConfig(raw);
    } catch (e) {
      setAnalysis(null);
      setError(`That isn't valid JSON: ${(e as Error).message}`);
      return;
    }
    if (result.servers.length === 0) {
      setAnalysis(null);
      setError('No MCP servers found. Paste a config with an "mcpServers" (or VS Code "servers") object.');
      return;
    }
    setAnalysis(result);
    const pinned = result.dependencies.filter((d) => d.version);
    if (pinned.length === 0) return;
    setChecking(true);
    try {
      setVulns(
        await checkPackages(
          pinned.map((d) => ({ ecosystem: d.ecosystem as "NPM" | "PYPI", name: d.name, version: d.version!, via: d.dependencyPath?.[0] })),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  };

  const issues = analysis?.issues ?? [];
  const serious = issues.filter((i) => i.severity === "HIGH" || i.severity === "MEDIUM").length;
  const vulnCount = vulns?.findings.length ?? 0;
  const tone = !analysis ? null : vulns?.verdict.tone === "critical" || issues.some((i) => i.severity === "HIGH") ? "high" : serious || vulnCount ? "medium" : "safe";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="mcp-config" className="text-sm font-medium">
              Paste your MCP config
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => { setText(EXAMPLE); void run(EXAMPLE); }}>
                Try an example
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()}>
                <FileArrowUp className="h-4 w-4" weight="bold" aria-hidden /> Open file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const content = await f.text();
                  setText(content);
                  void run(content);
                }}
              />
            </div>
          </div>
          <textarea
            id="mcp-config"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            placeholder={'{\n  "mcpServers": { … }\n}'}
            className="mt-3 h-72 w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button className="mt-3 w-full" size="lg" onClick={() => void run()} disabled={!text.trim() || checking}>
            {checking ? "Checking packages…" : "Check config"}
          </Button>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <LockSimple className="mt-0.5 h-3.5 w-3.5 shrink-0" weight="bold" aria-hidden />
            Your config is analysed in this browser tab. Only the names and versions of pinned packages are sent to our
            server to check against OSV. Secrets never leave your machine.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border p-4">
          <p className="text-sm font-medium">Where to find it</p>
          <dl className="mt-3 space-y-2 text-xs">
            {LOCATIONS.map(([client, path]) => (
              <div key={client} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="w-28 shrink-0 font-medium text-foreground">{client}</dt>
                <dd className="break-all font-mono text-muted-foreground">{path}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Or check every config on your machine at once:</p>
          <CopyCommand command="npx iamcooked mcp" className="mt-2" />
        </div>
      </div>

      <div aria-live="polite">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <WarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" weight="bold" aria-hidden />
            {error}
          </div>
        )}

        {!analysis && !error && (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
            <Plugs className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">Every MCP server runs with your permissions.</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We look for vulnerable or malicious packages, hard-coded API keys, unpinned <code className="font-mono">npx -y</code>{" "}
              installs, plain-HTTP remotes and whole-disk file access.
            </p>
          </div>
        )}

        {analysis && tone && (
          <div className="space-y-6">
            <div className={cn("rounded-2xl border p-5", cookedToneStyles[tone])}>
              <p className="text-lg font-semibold">
                {tone === "safe" ? "Looks clean" : tone === "medium" ? "A few things to tighten" : "Fix these before your next session"}
              </p>
              <p className="mt-1 text-sm opacity-90">
                {analysis.servers.length} server{analysis.servers.length === 1 ? "" : "s"} · {issues.filter((i) => i.severity !== "INFO").length} config issue
                {issues.filter((i) => i.severity !== "INFO").length === 1 ? "" : "s"} · {checking ? "checking packages…" : `${vulnCount} known vulnerabilit${vulnCount === 1 ? "y" : "ies"}`}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Server</th>
                    <th className="px-4 py-2 font-medium">Runs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analysis.servers.map((s) => (
                    <tr key={s.name}>
                      <td className="px-4 py-2.5 font-medium">{s.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {s.package ? (
                          <>
                            {s.package.name}
                            {s.package.version ? <span className="text-foreground">@{s.package.version}</span> : <span className="text-severity-medium"> (unpinned)</span>}
                          </>
                        ) : s.url ? (
                          s.url
                        ) : s.image ? (
                          `docker: ${s.image}`
                        ) : (
                          s.command ?? "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vulns && vulns.findings.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <ShieldWarning className="h-5 w-5 text-severity-high" weight="bold" aria-hidden /> Vulnerable packages
                </h2>
                <ul className="mt-3 space-y-3">
                  {vulns.findings.map((f) => (
                    <FindingRow key={`${f.packageName}-${f.id}`} finding={f} />
                  ))}
                </ul>
              </section>
            )}

            {issues.length > 0 && (
              <section>
                <h2 className="text-base font-semibold">Config issues</h2>
                <ul className="mt-3 space-y-3">
                  {issues.map((i, idx) => (
                    <li key={`${i.server}-${i.code}-${idx}`} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={ISSUE_STYLE[i.severity]}>
                          {i.severity === "INFO" ? "Note" : i.severity.charAt(0) + i.severity.slice(1).toLowerCase()}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">{i.server}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{i.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{i.detail}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium text-primary">Fix:</span> {i.fix}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {issues.length === 0 && vulns && vulns.findings.length === 0 && (
              <p className="inline-flex items-center gap-2 text-sm text-severity-safe">
                <CheckCircle className="h-4 w-4" weight="bold" aria-hidden /> No known vulnerabilities or risky patterns.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
