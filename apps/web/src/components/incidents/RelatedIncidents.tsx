import Link from "next/link";
import { IncidentCard } from "./IncidentCard";

export type RelatedIncident = {
  slug: string;
  title: string;
  severity: string;
  confidence: string;
  ecosystem: string | null;
  incidentType: string;
  publishedAt: Date | null;
  beginnerTldr: string | null;
  sources: Array<{ source: { name: string } }>;
};

type RelatedIncidentsProps = {
  incidents: RelatedIncident[];
};

export function RelatedIncidents({ incidents }: RelatedIncidentsProps) {
  if (incidents.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Related incidents</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Other published incidents affecting similar packages.
      </p>
      <div className="mt-6 grid gap-4">
        {incidents.map((incident) => (
          <Link key={incident.slug} href={`/incidents/${incident.slug}`}>
            <IncidentCard
              slug={incident.slug}
              title={incident.title}
              severity={incident.severity as "CRITICAL"}
              confidence={incident.confidence as "CONFIRMED"}
              ecosystem={incident.ecosystem ?? "UNKNOWN"}
              incidentType={incident.incidentType}
              publishedAt={incident.publishedAt?.toISOString() ?? null}
              beginnerTldr={incident.beginnerTldr ?? ""}
              affectedPackages={[]}
              sourceCount={incident.sources.length}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
