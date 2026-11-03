"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskMeter } from "@/components/feedback";
import { SeverityBadge, PackageBadge } from "@/components/badges";
import { IncidentCard } from "@/components/incidents";
import type { IncidentCardProps } from "@/components/incidents/IncidentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, ClockCounterClockwise, Binoculars } from "@phosphor-icons/react";

interface DashboardData {
  riskScore: number;
  riskLevel: string;
  findings: Array<{
    id: string;
    packageName: string;
    severity: string;
    explanation: string;
    installedVersion?: string | null;
  }>;
  relevantIncidents: IncidentCardProps[];
  watchedPackages: Array<{ name: string; findingCount: number }>;
  actions: Array<{ id: string; title: string; urgency: string }>;
  digestPreferences: { frequency: string } | null;
  latestScan?: { id: string } | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

const LiveFindingsList = memo(function LiveFindingsList({
  findings,
}: {
  findings: DashboardData["findings"];
}) {
  const [order, setOrder] = useState(findings);

  useEffect(() => {
    setOrder(findings);
    if (findings.length < 2) return;
    const id = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [findings]);

  return (
    <AnimatePresence mode="popLayout">
      {order.slice(0, 4).map((f) => (
        <motion.div
          key={f.id}
          layout
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={f.severity as "HIGH"} />
            <PackageBadge name={f.packageName} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{f.explanation}</p>
        </motion.div>
      ))}
    </AnimatePresence>
  );
});

export function DashboardBento({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href="/scan">
            <Upload className="h-4 w-4" weight="bold" aria-hidden />
            New scan
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/scans">
            <ClockCounterClockwise className="h-4 w-4" weight="bold" aria-hidden />
            Scan history
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/watchlist">
            <Binoculars className="h-4 w-4" weight="bold" aria-hidden />
            Watchlist
          </Link>
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-[2fr_1fr_1fr]"
      >
        <motion.div variants={item} className="lg:row-span-2">
          <Card className="h-full rounded-2xl border-border/50 shadow-[var(--shadow-diffusion)]">
            <CardHeader>
              <CardTitle className="tracking-tight">Project risk overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskMeter score={data.riskScore} level={data.riskLevel as "CRITICAL"} />
              {data.latestScan && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/scan/report/${data.latestScan.id}`}>View full report</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base tracking-tight">Digest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {data.digestPreferences?.frequency ?? "WEEKLY"}
                </span>
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/settings">Update</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base tracking-tight">Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {data.watchedPackages.slice(0, 4).map((pkg) => (
                  <Badge key={pkg.name} variant="outline" className="font-mono text-xs">
                    {pkg.name}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/watchlist">Manage</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Active findings</h2>
          <div className="space-y-3">
            {data.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active findings.</p>
            ) : (
              <LiveFindingsList findings={data.findings} />
            )}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Actions</h2>
          <ul className="space-y-2">
            {data.actions.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm"
              >
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {a.urgency}
                </span>
                <p className="mt-1">{a.title}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Relevant incidents</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data.relevantIncidents.map((inc) => (
              <IncidentCard key={inc.slug} {...inc} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
