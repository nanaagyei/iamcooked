"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/badges/SeverityBadge";
import { createFixTaskAction } from "@/app/dashboard/actions";
import {
  MagnifyingGlass,
  Package,
  CheckCircle,
  Warning,
  Plus,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type { DependencyInventoryItem } from "@/lib/db/queries";
import type { Severity } from "@prisma/client";

export function DependencyExplorer({ items }: { items: DependencyInventoryItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(items[0]?.name ?? null);
  const [createdFor, setCreatedFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.cveId?.toLowerCase().includes(q) ?? false) ||
        i.projects.some((p) => p.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const selected = useMemo(
    () => items.find((i) => i.name === selectedName) ?? filtered[0] ?? null,
    [items, selectedName, filtered],
  );

  function handleCreateTask(item: DependencyInventoryItem) {
    setCreatedFor(null);
    startTransition(async () => {
      const res = await createFixTaskAction({
        packageName: item.name,
        fromVersion: item.version,
        toVersion: item.fixedVersion,
      });
      if (res.ok) setCreatedFor(item.name);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      {/* List */}
      <Card className="flex h-[70vh] flex-col overflow-hidden">
        <div className="border-b border-border p-3">
          <div className="relative">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages, CVEs, projects…"
              className="pl-9"
              aria-label="Search dependencies"
            />
          </div>
        </div>
        <ul className="flex-1 divide-y divide-border overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              No dependencies match “{query}”.
            </li>
          ) : (
            filtered.map((item) => {
              const active = selected?.name === item.name;
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => setSelectedName(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                      active ? "bg-primary/10" : "hover:bg-accent/40",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.projects.length}{" "}
                        {item.projects.length === 1 ? "project" : "projects"}
                        {item.version ? ` · ${item.version}` : ""}
                      </p>
                    </div>
                    {item.severity ? (
                      <SeverityBadge severity={item.severity as Severity} />
                    ) : (
                      <span className="text-xs text-muted-foreground">clean</span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </Card>

      {/* Detail */}
      <Card className="h-[70vh] overflow-y-auto p-6">
        {!selected ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Package className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">Select a dependency to inspect it.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-mono text-xl font-semibold">{selected.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.ecosystem}
                  {selected.version ? ` · installed ${selected.version}` : ""}
                </p>
              </div>
              {selected.severity ? (
                <SeverityBadge severity={selected.severity as Severity} />
              ) : (
                <Badge
                  variant="outline"
                  className="border-severity-safe/30 bg-severity-safe/10 text-severity-safe"
                >
                  no known issues
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Reachable</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  {selected.severity ? (
                    selected.reachable ? (
                      <>
                        <Warning className="h-4 w-4 text-severity-critical" weight="fill" aria-hidden />
                        Yes — in a code path
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-severity-safe" weight="fill" aria-hidden />
                        Not reachable
                      </>
                    )
                  ) : (
                    <span className="text-muted-foreground">n/a</span>
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Fix available</p>
                <p className="mt-1 text-sm font-medium">
                  {selected.fixedVersion ? (
                    <span className="text-severity-safe">{selected.fixedVersion}</span>
                  ) : (
                    <span className="text-muted-foreground">none yet</span>
                  )}
                </p>
              </div>
            </div>

            {selected.cveId && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Advisory
                </p>
                <a
                  href={`https://osv.dev/vulnerability/${selected.cveId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
                >
                  {selected.cveId}
                  <ArrowSquareOut className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Used by {selected.projects.length}{" "}
                {selected.projects.length === 1 ? "project" : "projects"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.projects.map((p) => (
                  <Badge key={p} variant="outline" className="font-mono text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {selected.severity && (
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <Button
                  onClick={() => handleCreateTask(selected)}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" weight="bold" aria-hidden />
                  {isPending ? "Creating…" : "Create fix task"}
                </Button>
                {createdFor === selected.name && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-severity-safe">
                    <CheckCircle className="h-4 w-4" weight="fill" aria-hidden />
                    Task created
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
