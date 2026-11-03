import { AppShell } from "@/components/layout";
import { SettingsClient } from "./SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Manage your account and alert preferences."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
    >
      <SettingsClient />
    </AppShell>
  );
}
