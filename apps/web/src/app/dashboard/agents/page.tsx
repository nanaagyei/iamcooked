export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgentSources } from "@/lib/db/queries";
import { AppShell } from "@/components/layout";
import { AgentSourcesTable } from "@/components/dashboard/AgentSourcesTable";

export default async function AgentSourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const sessions = await getAgentSources(session.user.id);

  return (
    <AppShell
      title="Agent Sources"
      description="Every package your AI coding sessions snuck in — and which ones nobody on your team ever reviewed."
    >
      <AgentSourcesTable sessions={sessions} />
    </AppShell>
  );
}
