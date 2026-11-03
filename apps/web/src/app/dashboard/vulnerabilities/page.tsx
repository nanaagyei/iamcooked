export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getVulnerabilityTriage } from "@/lib/db/queries";
import { AppShell } from "@/components/layout";
import { VulnerabilityTriageTable } from "@/components/dashboard/VulnerabilityTriageTable";

export default async function VulnerabilitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const items = await getVulnerabilityTriage(session.user.id);

  return (
    <AppShell
      title="Vulnerabilities"
      description="Triage what's actually wrong. Reachable issues first — those are the ones that can really cook you."
    >
      <VulnerabilityTriageTable items={items} />
    </AppShell>
  );
}
