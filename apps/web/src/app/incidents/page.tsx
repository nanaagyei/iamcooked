export const dynamic = "force-dynamic";

import { MarketingLayout, SectionContainer } from "@/components/layout";
import { IncidentsHero } from "@/components/incidents/IncidentsHero";
import { getPublishedIncidents } from "@/lib/db/queries";
import { IncidentsPageClient } from "./IncidentsPageClient";

export default async function IncidentsPage() {
  const { incidents, total } = await getPublishedIncidents({ sort: "publishedAt" });

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(158,203,61,0.06),transparent_55%)]"
          aria-hidden
        />
        <IncidentsHero total={total} />
        <SectionContainer className="relative pb-20 pt-4 lg:pb-28">
          <IncidentsPageClient incidents={incidents} total={total} />
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
