export const dynamic = "force-dynamic";

import { MarketingLayout } from "@/components/layout";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { ScrollSections } from "@/components/home/ScrollSections";
import { HomeToolkit } from "@/components/home/HomeToolkit";
import { getLatestIncidents } from "@/lib/db/queries";
import { toIncidentCardPropsFromDb } from "@/lib/adapters";

export default async function Homepage() {
  let latestIncident = null;
  try {
    const incidents = await getLatestIncidents(1);
    if (incidents[0]) {
      latestIncident = toIncidentCardPropsFromDb(incidents[0]);
    }
  } catch {
    latestIncident = null;
  }

  return (
    <MarketingLayout>
      <div id="main-content">
        <HomeHero />
        <TrustMarquee />
        <HomeToolkit />
        <ScrollSections latestIncident={latestIncident} />
      </div>
    </MarketingLayout>
  );
}
