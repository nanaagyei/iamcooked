export const dynamic = "force-dynamic";

import { MarketingLayout, SectionContainer } from "@/components/layout";
import { IncidentsHero } from "@/components/incidents/IncidentsHero";
import { getPublishedIncidents } from "@/lib/db/queries";
import { IncidentsPageClient } from "./IncidentsPageClient";

export default async function IncidentsPage() {
  const { incidents, total } = await getPublishedIncidents({ sort: "publishedAt" });

  return (
    <MarketingLayout overlap>
      <div className="relative overflow-hidden bg-background">
        <IncidentsHero total={total} />
        <SectionContainer className="relative pb-20 pt-4 lg:pb-28">
          <IncidentsPageClient incidents={incidents} total={total} />
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
