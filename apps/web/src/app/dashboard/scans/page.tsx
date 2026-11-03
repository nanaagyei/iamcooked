import { AppShell } from "@/components/layout";
import { ScanHistoryClient } from "./ScanHistoryClient";

export default function ScanHistoryPage() {
  return (
    <AppShell
      title="Scan history"
      description="Review past lockfile scans and compare risk over time."
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Scan history" },
      ]}
    >
      <ScanHistoryClient />
    </AppShell>
  );
}
