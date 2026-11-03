export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ECOSYSTEM_LABEL, TOOL_CATEGORY_LABEL, type ToolCategory } from "@iamcooked/core";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { ToolWatchClient, type ToolCardData } from "@/components/tools/ToolWatchClient";
import { CopyCommand } from "@/components/check/CopyCommand";
import { SeverityBadge } from "@/components/badges";
import { auth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/cooked";
import { getToolStatuses } from "@/lib/tool-watch";

export const metadata: Metadata = {
  title: "Tool Watch: CVEs in your AI coding stack",
  description:
    "Live CVE and malware status for the tools vibecoders use: Claude Code, Codex, Gemini CLI, MCP servers, Next.js, Supabase, LangChain and more.",
};

export default async function ToolsPage() {
  const [statuses, session] = await Promise.all([getToolStatuses(), auth()]);

  const tools: ToolCardData[] = statuses.map((s) => ({
    id: s.tool.id,
    name: s.tool.name,
    category: s.tool.category,
    categoryLabel: TOOL_CATEGORY_LABEL[s.tool.category],
    ecosystem: s.tool.ecosystem,
    ecosystemLabel: ECOSYSTEM_LABEL[s.tool.ecosystem],
    packageName: s.tool.packageName,
    description: s.tool.description,
    homepage: s.tool.homepage,
    total: s.total,
    last90Days: s.last90Days,
    last365Days: s.last365Days,
    criticalOrHigh365: s.criticalOrHigh365,
    error: s.error,
    latest: s.latest,
  }));

  const recent = statuses
    .flatMap((s) => s.recent.map((a) => ({ ...a, toolName: s.tool.name })))
    .filter((a) => a.published)
    .sort((a, b) => b.published!.localeCompare(a.published!))
    .slice(0, 6);

  const active = tools.filter((t) => t.last90Days > 0).length;
  const categories = (Object.keys(TOOL_CATEGORY_LABEL) as ToolCategory[]).map((id) => ({ id, label: TOOL_CATEGORY_LABEL[id] }));

  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border">
        <PageBackdrop variant="scan" seed="iamcooked-tools" />
        <SectionContainer className="relative py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                Tool Watch
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl">
                Is your AI coding stack in a CVE right now?
              </h1>
              <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
                Live advisory status for the agents, MCP servers, SDKs and frameworks vibecoders actually run. Check
                your version in one click, or get an email the day a new CVE lands.
              </p>
              <p className="mt-6 font-mono text-sm tabular-nums text-muted-foreground">
                {tools.length} tools tracked · {active} with advisories in the last 90 days
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
              <p className="text-sm font-medium">Check everything installed on your machine</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Detects Claude Code, Codex, Gemini CLI, Aider, global npm packages and your MCP configs.
              </p>
              <CopyCommand command="npx iamcooked doctor" className="mt-3" />
            </div>
          </div>
        </SectionContainer>
      </section>

      {recent.length > 0 && (
        <SectionContainer className="pt-12">
          <h2 className="text-lg font-semibold tracking-tight">Recently disclosed</h2>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {recent.map((a) => (
              <li key={`${a.toolName}-${a.id}`}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-56">
                    <SeverityBadge severity={a.malware ? "CRITICAL" : a.severity} />
                    <span className="truncate text-sm font-medium">{a.toolName}</span>
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{a.summary}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {a.cve ?? a.id} · {formatRelativeTime(a.published)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </SectionContainer>
      )}

      <SectionContainer className="py-12 sm:py-16">
        <ToolWatchClient tools={tools} categories={categories} signedIn={!!session?.user} />
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Data from OSV.dev (GitHub Advisories, PyPA, OpenSSF malicious packages), refreshed every 6 hours. Missing a tool?{" "}
          <a className="underline underline-offset-4" href="https://github.com/nanaagyei/iamcooked/blob/main/CONTRIBUTING.md#adding-a-tool-to-tool-watch">
            Add it in one line
          </a>
          .
        </p>
      </SectionContainer>
    </MarketingLayout>
  );
}
