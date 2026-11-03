"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiskMeter } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { ScanReportSkeleton } from "@/components/feedback";
import { ClockCounterClockwise } from "@phosphor-icons/react";

interface ScanHistoryItem {
  id: string;
  uploadFileName?: string | null;
  ecosystem: string;
  riskScore: number;
  riskLevel: string;
  findingCount: number;
  createdAt: string;
}

export function ScanHistoryClient() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/scan/history")
      .then((r) => r.json())
      .then((data) => setScans(data.scans ?? []))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        const second = prev[1];
        return second ? [second, id] : [id];
      }
      return [...prev, id];
    });
  };

  if (loading) return <ScanReportSkeleton />;

  if (scans.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <ClockCounterClockwise className="mx-auto h-10 w-10 text-muted-foreground" weight="bold" />
        <p className="mt-4 font-semibold">No scan history yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a lockfile to start building your timeline.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/scan">Scan project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selected.length === 2 && (
        <p className="text-sm text-muted-foreground">
          Comparing {selected.length} reports — open each to review detailed diffs.
        </p>
      )}
      <ol className="relative space-y-4 border-l border-border pl-6">
        {scans.map((scan) => (
          <li key={scan.id} className="relative">
            <span className="absolute -left-[1.4rem] top-4 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
            <div
              className={`rounded-xl border p-5 transition-colors ${
                selected.includes(scan.id)
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {new Date(scan.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 font-semibold">
                    {scan.uploadFileName ?? "Lockfile scan"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scan.findingCount} findings · {scan.ecosystem}
                  </p>
                </div>
                <div className="min-w-[10rem]">
                  <RiskMeter
                    score={scan.riskScore}
                    level={scan.riskLevel as "CRITICAL"}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href={`/scan/report/${scan.id}`}>Open report</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSelect(scan.id)}
                >
                  {selected.includes(scan.id) ? "Deselect" : "Compare"}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
