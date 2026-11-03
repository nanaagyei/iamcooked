export const dynamic = "force-dynamic";

import { MarketingLayout } from "@/components/layout";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { HomeStats } from "@/components/home/HomeStats";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeBento } from "@/components/home/HomeBento";
import { HomeLatest } from "@/components/home/HomeLatest";
import { HomeFaq, FAQ } from "@/components/home/HomeFaq";
import { HomeCta } from "@/components/home/HomeCta";
import { getLatestIncidents } from "@/lib/db/queries";
import { toIncidentCardPropsFromDb } from "@/lib/adapters";

export default async function Homepage() {
  let latestIncident = null;
  try {
    const incidents = await getLatestIncidents(1);
    if (incidents[0]) latestIncident = toIncidentCardPropsFromDb(incidents[0]);
  } catch {
    latestIncident = null;
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <MarketingLayout overlap>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HomeHero />
      <TrustMarquee />
      <HomeStats />
      <HowItWorks />
      <HomeBento />
      {latestIncident && <HomeLatest incident={latestIncident} />}
      <HomeFaq />
      <HomeCta />
    </MarketingLayout>
  );
}
