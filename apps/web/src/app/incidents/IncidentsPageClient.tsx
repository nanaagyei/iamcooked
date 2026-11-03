"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { IncidentCard } from "@/components/incidents";
import { IncidentFilters } from "@/components/incidents";
import type { IncidentFilters as IFilters } from "@/components/incidents";
import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import type { Incident, IncidentSource, IncidentPackage, Source } from "@prisma/client";

type IncidentWithRelations = Incident & {
  sources: (IncidentSource & { source: Source })[];
  packages: IncidentPackage[];
};

interface Props {
  incidents: IncidentWithRelations[];
  total: number;
}

export function IncidentsPageClient({ incidents: initialIncidents }: Props) {
  const [filters, setFilters] = useState<IFilters>({ sort: "latest" });

  const filtered = useMemo(() => {
    return initialIncidents
      .filter((i) => {
        if (filters.severity && i.severity !== filters.severity) return false;
        if (filters.ecosystem && i.ecosystem !== filters.ecosystem) return false;
        if (filters.incidentType && i.incidentType !== filters.incidentType) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchesTitle = i.title.toLowerCase().includes(q);
          const matchesPackage = i.packages.some((p) =>
            p.packageName.toLowerCase().includes(q),
          );
          if (!matchesTitle && !matchesPackage) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "severity") {
          const sevOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "UNKNOWN"];
          return sevOrder.indexOf(a.severity) - sevOrder.indexOf(b.severity);
        }
        return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
      });
  }, [filters, initialIncidents]);

  const clearFilters = () =>
    setFilters({ sort: "latest" });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-diffusion)]">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Refine feed
          </p>
          <div className="mt-4">
            <IncidentFilters onFilterChange={setFilters} />
          </div>
        </div>
      </aside>
      <div>
        {filtered.length === 0 ? (
          <EmptyState
            title="No incidents match your filters"
            description="Try adjusting severity, ecosystem, or search terms."
          >
            <Button variant="contrast" onClick={clearFilters}>
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            {filtered.map((incident) => (
              <motion.div
                key={incident.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <IncidentCard
                  slug={incident.slug}
                  title={incident.title}
                  severity={incident.severity}
                  confidence={incident.confidence}
                  ecosystem={incident.ecosystem ?? "NPM"}
                  incidentType={incident.incidentType}
                  beginnerTldr={incident.beginnerTldr ?? ""}
                  affectedPackages={incident.packages.map((p) => ({
                    packageName: p.packageName,
                    ecosystem: p.ecosystem,
                  }))}
                  publishedAt={incident.publishedAt?.toISOString() ?? null}
                  sourceCount={incident.sources.length}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
