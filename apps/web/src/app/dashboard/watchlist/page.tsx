import { AppShell } from "@/components/layout";
import { WatchlistClient } from "./WatchlistClient";

export default function WatchlistPage() {
  return (
    <AppShell
      title="Watchlist"
      description="Track packages you care about and see matching incidents."
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Watchlist" },
      ]}
    >
      <WatchlistClient />
    </AppShell>
  );
}
