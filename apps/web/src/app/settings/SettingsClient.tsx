"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { SettingsFormSkeleton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signOutAction } from "@/components/auth/sign-out";
import { resetOnboarding } from "@/components/onboarding/OnboardingDialog";

export function SettingsClient() {
  const router = useRouter();
  const [frequency, setFrequency] = useState("WEEKLY");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => {
        if (res.status === 401) {
          router.push("/signin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setFrequency(data.frequency ?? "WEEKLY");
          setEmail(data.email ?? "");
        }
        setLoading(false);
      });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency }),
    });
    setSaving(false);
    if (res.ok) toast.success("Preferences saved");
    else toast.error("Failed to save preferences");
  };

  if (loading) {
    return <SettingsFormSkeleton />;
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border-border/60 shadow-[var(--shadow-diffusion)]">
        <CardHeader>
          <CardTitle>Digest preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="CRITICAL_ONLY">Critical only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Replay the onboarding walkthrough or upload a new lockfile.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetOnboarding();
                toast.info("Onboarding reset", "Refresh the dashboard to see it again.");
              }}
            >
              Reset onboarding
            </Button>
            <Button variant="outline" asChild>
              <Link href="/scan">New scan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
