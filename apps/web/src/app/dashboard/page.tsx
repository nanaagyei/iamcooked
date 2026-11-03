export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardOverview } from "@/lib/db/queries";
import { AppShell } from "@/components/layout";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { CookedVerdictCard } from "@/components/dashboard/CookedVerdictCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/badges/SeverityBadge";
import { cn } from "@/lib/utils";
import {
  TASK_PROVIDER_LABELS,
  TRIAGE_STATUS_LABELS,
  triageStatusStyles,
} from "@/lib/cooked";
import {
  Stack,
  ShieldWarning,
  Robot,
  Package,
  ArrowRight,
  CheckCircle,
  Circle,
  CircleDashed,
} from "@phosphor-icons/react/dist/ssr";
import type { Severity } from "@prisma/client";

const statusIcon: Record<string, typeof Circle> = {
  OPEN: Circle,
  IN_PROGRESS: CircleDashed,
  DONE: CheckCircle,
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const overview = await getDashboardOverview(session.user.id);

  return (
    <AppShell
      title="Overview"
      description="The state of your stack at a glance — what your agents installed, what's actually risky, and what to fix first."
    >
      <OnboardingDialog />

      <div className="space-y-6">
        <CookedVerdictCard
          score={overview.cookedScore}
          totalOpenVulns={overview.totalOpenVulns}
          reachableCount={overview.reachableCount}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="At-risk projects"
            value={overview.atRiskProjects}
            hint="critical or high severity"
            icon={Stack}
            href="/dashboard/projects"
            tone="high"
          />
          <StatCard
            label="Critical vulnerabilities"
            value={overview.criticalCount}
            hint="across all projects"
            icon={ShieldWarning}
            href="/dashboard/vulnerabilities"
            tone="critical"
          />
          <StatCard
            label="Agent risk"
            value={overview.agentRiskPackages}
            hint={`unreviewed across ${overview.agentSessionCount} sessions`}
            icon={Robot}
            href="/dashboard/agents"
            tone="high"
          />
          <StatCard
            label="Outdated, fixable"
            value={overview.outdatedCount}
            hint="a patched version exists"
            icon={Package}
            href="/dashboard/dependencies"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Active vulnerabilities */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Active vulnerabilities</h2>
                <p className="text-xs text-muted-foreground">Sorted by severity, then blast radius.</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/vulnerabilities">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" weight="bold" aria-hidden />
                </Link>
              </Button>
            </div>
            {overview.activeVulnerabilities.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Nothing active. You&apos;re not cooked. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {overview.activeVulnerabilities.map((v) => (
                  <li
                    key={`${v.packageName}-${v.cveId}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-sm font-medium">{v.packageName}</span>
                        {v.reachable && (
                          <Badge
                            variant="outline"
                            className="border-severity-critical/30 bg-severity-critical/10 text-[10px] text-severity-critical"
                          >
                            reachable
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {v.cveId ?? "advisory"} · {v.projects.length}{" "}
                        {v.projects.length === 1 ? "project" : "projects"}
                        {v.fixedVersion ? ` · fix in ${v.fixedVersion}` : ""}
                      </p>
                    </div>
                    <SeverityBadge severity={v.severity as Severity} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent tasks */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Recent tasks</h2>
                <p className="text-xs text-muted-foreground">Fixes tracked across your tools.</p>
              </div>
            </div>
            {overview.recentTasks.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No fix tasks yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {overview.recentTasks.map((t) => {
                  const StatusIcon = statusIcon[t.status] ?? Circle;
                  return (
                    <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                      <StatusIcon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          t.status === "DONE"
                            ? "text-severity-safe"
                            : t.status === "IN_PROGRESS"
                              ? "text-severity-low"
                              : "text-muted-foreground",
                        )}
                        weight={t.status === "DONE" ? "fill" : "bold"}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {TASK_PROVIDER_LABELS[t.provider] ?? t.provider}
                            {t.externalRef ? ` ${t.externalRef}` : ""}
                          </span>
                          {t.fromVersion && t.toVersion && (
                            <span className="font-mono">
                              · {t.fromVersion} → {t.toVersion}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[10px]", triageStatusStyles[t.status])}
                      >
                        {TRIAGE_STATUS_LABELS[t.status] ?? t.status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
