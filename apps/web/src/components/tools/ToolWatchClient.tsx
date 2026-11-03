"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowSquareOut, BellSimple, CheckCircle, MagnifyingGlass, Pulse, Skull } from "@phosphor-icons/react";
import { SeverityBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/cooked";
import { toast } from "@/lib/toast";
import { FindingRow } from "@/components/check/FindingRow";
import { checkPackages, type CheckResponse } from "@/components/check/types";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface ToolCardData {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  ecosystem: "NPM" | "PYPI" | "GO" | "CARGO" | "RUBYGEMS" | "COMPOSER";
  ecosystemLabel: string;
  packageName: string;
  description: string;
  homepage: string;
  total: number;
  last90Days: number;
  last365Days: number;
  criticalOrHigh365: number;
  error?: boolean;
  latest: {
    id: string;
    cve: string | null;
    summary: string;
    severity: Severity;
    published: string | null;
    url: string;
    malware: boolean;
  } | null;
}

type Status = "hot" | "warm" | "quiet" | "unknown";

function statusOf(t: ToolCardData): Status {
  if (t.error) return "unknown";
  if (t.last90Days > 0 && t.latest && (t.latest.severity === "CRITICAL" || t.latest.severity === "HIGH" || t.latest.malware)) return "hot";
  if (t.last90Days > 0) return "warm";
  return "quiet";
}

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  hot: { label: "New serious advisory", className: "border-severity-critical/30 bg-severity-critical/10 text-severity-critical" },
  warm: { label: "Recent advisory", className: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium" },
  quiet: { label: "Quiet for 90 days", className: "border-severity-safe/30 bg-severity-safe/10 text-severity-safe" },
  unknown: { label: "Couldn't load", className: "border-border bg-muted text-muted-foreground" },
};

function VersionCheck({ tool }: { tool: ToolCardData }) {
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const v = version.trim().replace(/^v/, "");
    if (!v) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await checkPackages([{ ecosystem: tool.ecosystem, name: tool.packageName, version: v }]));
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <label htmlFor={`v-${tool.id}`} className="sr-only">
          Your {tool.name} version
        </label>
        <Input
          id={`v-${tool.id}`}
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="Your version, e.g. 1.2.3"
          className="h-9 min-w-0 font-mono text-xs"
          inputMode="text"
          autoComplete="off"
        />
        <Button type="submit" size="sm" variant="outline" disabled={loading || !version.trim()}>
          {loading ? "Checking…" : "Check"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {result && result.findings.length === 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-severity-safe">
          <CheckCircle className="h-4 w-4" weight="bold" aria-hidden /> No known vulnerabilities in {version.trim()}.
        </p>
      )}
      {result && result.findings.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium">
            {result.findings.length} known {result.findings.length === 1 ? "advisory" : "advisories"} affect {version.trim()}.
          </p>
          <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
            {result.findings.slice(0, 5).map((f) => (
              <FindingRow key={f.id} finding={f} />
            ))}
          </ul>
          {result.findings.length > 5 && (
            <p className="mt-2 text-xs text-muted-foreground">+{result.findings.length - 5} more. Run <code className="font-mono">npx iamcooked tools</code> for the full list.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, signedIn }: { tool: ToolCardData; signedIn: boolean }) {
  const status = statusOf(tool);
  const [watching, setWatching] = useState(false);

  const watch = async () => {
    if (!signedIn) {
      window.location.href = "/signin";
      return;
    }
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageName: tool.packageName, ecosystem: tool.ecosystem }),
    });
    if (res.ok) {
      setWatching(true);
      toast.success(`Watching ${tool.name}`, "You'll get an email when a new advisory lands.");
    } else {
      toast.error("Could not add to watchlist");
    }
  };

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-[0_30px_60px_-30px_rgba(249,116,59,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            <a href={tool.homepage} target="_blank" rel="noreferrer" className="hover:underline underline-offset-4">
              {tool.name}
            </a>
          </h3>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground" title={tool.packageName}>
            {tool.ecosystemLabel} · {tool.packageName}
          </p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[11px]", STATUS_STYLE[status].className)}>
          {status === "hot" && <Pulse className="mr-1 h-3 w-3" weight="bold" aria-hidden />}
          {STATUS_STYLE[status].label}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["90 days", tool.last90Days],
          ["12 months", tool.last365Days],
          ["All time", tool.total],
        ].map(([label, n]) => (
          <div key={label} className="rounded-lg border border-border bg-muted/40 px-2 py-2">
            <dt className="truncate text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">{label}</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      {tool.latest ? (
        <a
          href={tool.latest.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-lg border border-border p-3 transition-colors hover:border-foreground/25"
        >
          <div className="flex flex-wrap items-center gap-2">
            {tool.latest.malware ? (
              <Badge variant="outline" className="border-severity-critical/30 bg-severity-critical/15 text-severity-critical">
                <Skull className="mr-1 h-3 w-3" aria-hidden /> Malware
              </Badge>
            ) : (
              <SeverityBadge severity={tool.latest.severity} />
            )}
            <span className="text-xs text-muted-foreground">Latest · {formatRelativeTime(tool.latest.published)}</span>
            <ArrowSquareOut className="ml-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 line-clamp-2 text-sm">{tool.latest.summary}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{tool.latest.cve ?? tool.latest.id}</p>
        </a>
      ) : (
        !tool.error && <p className="mt-4 text-sm text-severity-safe">No advisories on record.</p>
      )}

      <div className="mt-auto">
        <VersionCheck tool={tool} />
        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={watch} disabled={watching}>
          <BellSimple className="h-4 w-4" weight="bold" aria-hidden />
          {watching ? "Watching" : signedIn ? "Alert me about new CVEs" : "Sign in to get alerts"}
        </Button>
      </div>
    </article>
  );
}

export function ToolWatchClient({
  tools,
  categories,
  signedIn,
}: {
  tools: ToolCardData[];
  categories: Array<{ id: string; label: string }>;
  signedIn: boolean;
}) {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools
      .filter((t) => category === "all" || t.category === category)
      .filter((t) => !onlyActive || t.last90Days > 0)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.packageName.toLowerCase().includes(q))
      .sort((a, b) => {
        const rank = { hot: 0, warm: 1, quiet: 2, unknown: 3 } as const;
        return rank[statusOf(a)] - rank[statusOf(b)] || (b.latest?.published ?? "").localeCompare(a.latest?.published ?? "");
      });
  }, [tools, category, query, onlyActive]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex flex-wrap gap-1.5" role="tablist" aria-label="Tool categories">
          {[{ id: "all", label: "All" }, ...categories].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "relative isolate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                category === c.id ? "border-primary/40 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {category === c.id && (
                <motion.span layoutId="tool-cat" className="absolute inset-0 -z-10 rounded-full bg-primary/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} className="accent-primary" />
            Active in last 90 days
          </label>
          <div className="relative w-full sm:w-56">
            <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools" className="h-9 pl-8 text-sm" aria-label="Search tools" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No tools match. Missing one?{" "}
          <Link href="https://github.com/nanaagyei/iamcooked/issues/new?template=tool-request.yml" className="underline underline-offset-4">
            Request it
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i, 8) * 0.03 } }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="min-w-0"
              >
                <ToolCard tool={t} signedIn={signedIn} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
