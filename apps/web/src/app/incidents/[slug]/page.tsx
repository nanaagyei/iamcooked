export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import {
  IncidentDetailHeader,
  AffectedPackageTable,
  SourceList,
  IncidentTimeline,
  RecommendedActions,
  RelatedIncidents,
} from "@/components/incidents";
import { PackageBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { IncidentCopilotBridge } from "@/components/copilot/IncidentCopilotBridge";
import Link from "next/link";
import { getIncidentBySlug, getRelatedIncidents } from "@/lib/db/queries";
import { PageBackdrop } from "@/components/layout/PageBackdrop";

type Props = { params: Promise<{ slug: string }> };

export default async function IncidentDetailPage({ params }: Props) {
  const { slug } = await params;
  const [incident, relatedIncidents] = await Promise.all([
    getIncidentBySlug(slug),
    getRelatedIncidents(slug),
  ]);

  if (!incident) notFound();

  const recommendedActions = (incident.recommendedActions as Array<{
    title: string;
    description: string;
    command?: string;
    urgency: string;
  }>) ?? [];

  const affectedPackages = (incident.affectedPackages as Array<{
    name: string;
    ecosystem: string;
    affected: string;
    patched: string | null;
  }>) ?? [];

  const timeline = (incident.timeline as Array<{
    date: string;
    event: string;
  }>) ?? [];

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-background">
        <section className="relative overflow-hidden">
          <PageBackdrop variant="incident-hero" seed={slug} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/88 to-background" />
          <SectionContainer size="narrow" className="relative py-16 lg:py-20">
            <IncidentDetailHeader
              title={incident.title}
              severity={incident.severity}
              confidence={incident.confidence}
              ecosystem={incident.ecosystem ?? "UNKNOWN"}
              incidentType={incident.incidentType}
              publishedAt={incident.publishedAt?.toISOString() ?? null}
              sourceCount={incident.sources.length}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <IncidentCopilotBridge slug={slug} />
              <Button variant="contrast" asChild>
                <Link href="/scan">Scan your project</Link>
              </Button>
            </div>
          </SectionContainer>
        </section>

        <SectionContainer size="narrow" className="space-y-16 pb-20 pt-4 lg:pb-28">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">Beginner summary</h2>
            <p className="mt-4 max-w-[65ch] leading-relaxed text-muted-foreground">
              {incident.beginnerTldr ?? "No beginner summary available."}
            </p>
            {incident.confidence === "UNVERIFIED" && (
              <p className="mt-3 text-sm text-amber-400">
                This incident is marked as unverified. Treat details as developing until more sources confirm them.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">Affected packages</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-border/50 bg-card/50">
              <AffectedPackageTable
                packages={incident.packages.map((p: typeof incident.packages[number]) => ({
                  packageName: p.packageName,
                  ecosystem: p.ecosystem,
                  affectedVersions:
                    p.affectedVersions && Array.isArray(p.affectedVersions)
                      ? (p.affectedVersions as string[]).join(", ")
                      : undefined,
                  patchedVersions:
                    p.patchedVersions && Array.isArray(p.patchedVersions)
                      ? (p.patchedVersions as string[]).join(", ")
                      : undefined,
                }))}
              />
            </div>
          </section>

          {(incident.founderImpact || incident.beginnerTldr) && (
            <section>
              <h2 className="text-xl font-semibold tracking-tight">Who may be affected</h2>
              <p className="mt-4 max-w-[65ch] leading-relaxed text-muted-foreground">
                {incident.founderImpact ??
                  "Teams using the affected packages in production should review their dependency tree and scan their lockfile."}
              </p>
            </section>
          )}

          <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">What happened</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {incident.beginnerTldr ?? timeline[0]?.event ?? "Details are still developing."}
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-diffusion)]">
              <PageBackdrop variant="incident-context" seed={`${slug}-context`} className="opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          </section>

          <IncidentTimeline timeline={timeline} />
          <RecommendedActions actions={recommendedActions} />

          <section>
            <h2 className="text-xl font-semibold tracking-tight">Technical details</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {incident.technicalSummary ?? "No technical details available."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {affectedPackages.map((pkg, idx) => (
                <PackageBadge key={idx} name={pkg.name} ecosystem={pkg.ecosystem} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Sources ({incident.sources.length})
            </h2>
            <SourceList sources={incident.sources} />
          </section>

          <RelatedIncidents incidents={relatedIncidents} />

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 text-center sm:px-10 shadow-[var(--shadow-diffusion)]">
            <PageBackdrop variant="incident-cta" seed={`${slug}-cta`} className="opacity-[0.08] dark:opacity-[0.12]" />
            <div className="absolute inset-0 bg-card/98" />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold tracking-tight">Is your project affected?</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Upload your lockfile to check if your dependencies are affected by this incident.
              </p>
              <Link href="/scan" className="mt-5 inline-block">
                <Button variant="contrast">Scan your project</Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
