export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDependencyInventory } from "@/lib/db/queries";
import { AppShell } from "@/components/layout";
import { DependencyExplorer } from "@/components/dashboard/DependencyExplorer";

export default async function DependenciesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const items = await getDependencyInventory(session.user.id);

  return (
    <AppShell
      title="Dependencies"
      description="Everything in your stack, searchable. Click a package to see whether it's reachable, fixable, and who depends on it."
    >
      <DependencyExplorer items={items} />
    </AppShell>
  );
}
