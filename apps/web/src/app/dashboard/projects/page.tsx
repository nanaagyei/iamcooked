export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectsOverview } from "@/lib/db/queries";
import { AppShell } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/cooked";
import { Stack, CubeTransparent } from "@phosphor-icons/react/dist/ssr";

const riskStyles: Record<string, string> = {
  CRITICAL: "border-severity-critical/30 bg-severity-critical/10 text-severity-critical",
  HIGH: "border-severity-high/30 bg-severity-high/10 text-severity-high",
  MEDIUM: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium",
  LOW: "border-severity-low/30 bg-severity-low/10 text-severity-low",
  NONE: "border-severity-safe/30 bg-severity-safe/10 text-severity-safe",
};

const riskLabels: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "Clean",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const projects = await getProjectsOverview(session.user.id);

  return (
    <AppShell
      title="Projects"
      description="Every project we've scanned, ranked by how cooked it is."
    >
      {projects.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <Stack className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan a lockfile to add your first project.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2fr_0.8fr_0.6fr_1fr_0.8fr_0.9fr] gap-4 border-b border-border bg-muted/40 px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground md:grid">
            <span>Project</span>
            <span>Ecosystem</span>
            <span className="text-right">Deps</span>
            <span className="text-right">Vulnerabilities</span>
            <span className="text-right">Risk</span>
            <span className="text-right">Scanned</span>
          </div>
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-2 px-5 py-3.5 md:grid-cols-[2fr_0.8fr_0.6fr_1fr_0.8fr_0.9fr] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <CubeTransparent className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="truncate font-mono text-sm font-medium">{p.name}</span>
                </div>

                <span className="text-sm text-muted-foreground">{p.ecosystem}</span>

                <span className="text-sm tabular-nums md:text-right">
                  <span className="text-muted-foreground md:hidden">Deps: </span>
                  {p.depCount}
                </span>

                <span className="text-sm tabular-nums md:text-right">
                  {p.vulnCount === 0 ? (
                    <span className="text-muted-foreground">none</span>
                  ) : (
                    <span>
                      {p.criticalCount > 0 && (
                        <span className="font-medium text-severity-critical">
                          {p.criticalCount} crit
                        </span>
                      )}
                      {p.criticalCount > 0 ? " · " : ""}
                      <span className="text-muted-foreground">{p.vulnCount} total</span>
                    </span>
                  )}
                </span>

                <span className="md:text-right">
                  <Badge variant="outline" className={cn("text-[10px]", riskStyles[p.riskLevel])}>
                    {riskLabels[p.riskLevel] ?? p.riskLevel}
                  </Badge>
                </span>

                <span className="text-sm text-muted-foreground md:text-right">
                  {formatRelativeTime(p.lastScannedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
