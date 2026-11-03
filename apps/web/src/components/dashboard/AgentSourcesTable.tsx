"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/badges/SeverityBadge";
import {
  AGENT_VENDOR_LABELS,
  AGENT_SOURCE_LABELS,
  formatRelativeTime,
} from "@/lib/cooked";
import { CaretDown, Robot, GitBranch, Cloud, Desktop, CheckCircle, Warning } from "@phosphor-icons/react";
import type { AgentSourceSummary } from "@/lib/db/queries";
import type { Severity } from "@prisma/client";

const sourceIcon: Record<string, typeof GitBranch> = {
  REPO: GitBranch,
  CLOUD: Cloud,
  LOCAL: Desktop,
};

export function AgentSourcesTable({ sessions }: { sessions: AgentSourceSummary[] }) {
  const [expanded, setExpanded] = useState<string | null>(sessions[0]?.id ?? null);

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <Robot className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm font-medium">No agent sessions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once your AI tools start installing packages, every session shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* header */}
      <div className="hidden grid-cols-[1.4fr_1fr_0.6fr_0.6fr_0.8fr_2.5rem] gap-4 border-b border-border bg-muted/40 px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground md:grid">
        <span>Agent · session</span>
        <span>Source</span>
        <span className="text-right">Deps</span>
        <span className="text-right">Vulns</span>
        <span className="text-right">Last seen</span>
        <span />
      </div>

      <ul className="divide-y divide-border">
        {sessions.map((s) => {
          const open = expanded === s.id;
          const SourceIcon = sourceIcon[s.sourceType] ?? Cloud;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : s.id)}
                aria-expanded={open}
                className="grid w-full grid-cols-1 gap-2 px-5 py-3.5 text-left transition-colors hover:bg-accent/40 md:grid-cols-[1.4fr_1fr_0.6fr_0.6fr_0.8fr_2.5rem] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Robot className="h-4 w-4" weight="fill" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.sessionName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {AGENT_VENDOR_LABELS[s.vendor] ?? s.vendor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <SourceIcon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    {AGENT_SOURCE_LABELS[s.sourceType] ?? s.sourceType}
                    {s.sourceRef && s.sourceRef !== "cloud" && s.sourceRef !== "local"
                      ? ` · ${s.sourceRef}`
                      : ""}
                  </span>
                </div>

                <span className="text-sm tabular-nums md:text-right">
                  <span className="text-muted-foreground md:hidden">Deps: </span>
                  {s.depCount}
                </span>

                <span className="text-sm tabular-nums md:text-right">
                  {s.vulnCount > 0 ? (
                    <Badge
                      variant="outline"
                      className="border-severity-high/30 bg-severity-high/10 text-severity-high"
                    >
                      {s.vulnCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </span>

                <span className="text-sm text-muted-foreground md:text-right">
                  {formatRelativeTime(s.lastSeenAt)}
                </span>

                <span className="hidden justify-self-end md:block">
                  <CaretDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </span>
              </button>

              {open && (
                <div className="border-t border-border bg-muted/20 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Packages this session introduced
                    </p>
                    {s.unreviewedCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-severity-high">
                        <Warning className="h-3.5 w-3.5" weight="fill" aria-hidden />
                        {s.unreviewedCount} never reviewed
                      </span>
                    )}
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {s.packages.map((p) => (
                      <li
                        key={p.name}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm">
                            {p.name}
                            {p.version ? (
                              <span className="text-muted-foreground">@{p.version}</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {p.severity && <SeverityBadge severity={p.severity as Severity} />}
                          {p.reviewed ? (
                            <span className="inline-flex items-center gap-1 text-xs text-severity-safe">
                              <CheckCircle className="h-3.5 w-3.5" weight="fill" aria-hidden />
                              reviewed
                            </span>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border bg-muted text-[10px] text-muted-foreground"
                            >
                              unreviewed
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
