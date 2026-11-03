"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { Warning, ArrowSquareOut, Sparkle } from "@phosphor-icons/react";
import { SeverityBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mapConfidenceToDb } from "@/lib/ai-audit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { countIncidentsWithWarnings, getAdminIncidentWarnings } from "@/lib/admin-warnings";

interface AdminIncident {
  id: string;
  slug: string;
  title: string;
  severity: string;
  confidence: string;
  status: string;
  beginnerTldr?: string | null;
  technicalSummary?: string | null;
  sources: Array<{
    source: {
      id: string;
      name: string;
      url: string;
      excerpt?: string | null;
      sourceType: string;
    };
  }>;
  packages: Array<{
    packageName: string;
    affectedVersions?: unknown;
    notes?: string | null;
  }>;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  NEEDS_REVIEW: "bg-amber-500/15 text-amber-400",
  PUBLISHED: "bg-severity-safe/15 text-severity-safe",
  ARCHIVED: "bg-muted text-muted-foreground/50",
};

type AiPreview = {
  incident: AdminIncident;
  field: "beginnerTldr" | "technicalSummary" | "recommendedActions" | "confidence";
  payload: Record<string, unknown>;
};

export function AdminReviewPanel() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<AiPreview | null>(null);

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => {
      const res = await fetch("/api/ai/status");
      if (!res.ok) return { configured: false };
      return res.json() as Promise<{ configured: boolean }>;
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-incidents"],
    queryFn: async () => {
      const res = await fetch("/api/admin/incidents");
      if (!res.ok) throw new Error("Failed to load incidents");
      const json = await res.json();
      return json.incidents as AdminIncident[];
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/incidents/${id}/publish`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Publish failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Incident published");
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
    },
    onError: (e) => toast.error("Publish failed", e.message),
  });

  const applyPatch = async (
    incident: AdminIncident,
    patch: Record<string, unknown>,
    successMessage: string,
  ) => {
    const res = await fetch(`/api/admin/incidents/${incident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update incident");
    toast.success(successMessage);
    queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
  };

  const generateMutation = useMutation({
    mutationFn: async ({
      incident,
      type,
    }: {
      incident: AdminIncident;
      type: "beginner-tldr" | "technical-summary" | "incident-extraction" | "source-verification";
    }) => {
      const sourceExcerpts = incident.sources
        .map((s) => s.source.excerpt ?? s.source.name)
        .filter(Boolean) as string[];

      const primarySource = incident.sources[0]?.source;

      let body: Record<string, unknown>;
      if (type === "incident-extraction") {
        body = {
          type,
          incidentId: incident.id,
          input: {
            title: incident.title,
            excerpt: sourceExcerpts.join("\n\n") || incident.technicalSummary || incident.title,
            url: primarySource?.url ?? "https://iamcooked.dev",
            sourceType: "MANUAL",
          },
        };
      } else if (type === "source-verification") {
        body = {
          type,
          incidentId: incident.id,
          input: {
            title: incident.title,
            claims: [
              incident.beginnerTldr ?? incident.title,
              incident.technicalSummary ?? "",
            ].filter(Boolean),
            sourceExcerpts,
          },
        };
      } else {
        body = {
          type,
          incidentId: incident.id,
          input: {
            title: incident.title,
            severity: incident.severity,
            technicalSummary: incident.technicalSummary ?? incident.title,
            packages: incident.packages.map((p) => p.packageName),
            sourceExcerpts,
          },
        };
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "AI generation failed");
      }
      return res.json();
    },
    onSuccess: (result, { incident, type }) => {
      if (type === "beginner-tldr") {
        setPreview({
          incident,
          field: "beginnerTldr",
          payload: {
            beginnerTldr: result.beginner_tldr ?? result.beginnerTldr,
            confidence: result.confidenceDb ?? result.confidence,
          },
        });
      } else if (type === "technical-summary") {
        setPreview({
          incident,
          field: "technicalSummary",
          payload: {
            technicalSummary: result.technicalSummary ?? result.summary,
            confidence: result.confidenceDb ?? result.confidence,
          },
        });
      } else if (type === "incident-extraction") {
        setPreview({
          incident,
          field: "recommendedActions",
          payload: {
            recommendedActions: (result.recommended_actions as string[] | undefined)?.map(
              (action: string) => ({
                title: action,
                description: action,
                urgency: "review",
              }),
            ),
            confidence: result.confidenceDb ?? result.confidence,
            beginnerTldr: result.impact,
            technicalSummary: result.summary ?? result.impact,
          },
        });
      } else {
        toast.success("Claims verified — review results in preview");
        setPreview({
          incident,
          field: "confidence",
          payload: {
            confidence: result.confidenceDb ?? result.confidence,
          },
        });
      }
    },
    onError: (e) => toast.error("AI generation failed", e.message),
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading incidents...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Failed to load admin data"}
      </p>
    );
  }

  const incidents = data ?? [];
  const warningCounts = countIncidentsWithWarnings(incidents);
  const aiReady = aiStatus?.configured ?? false;

  const warningBanners = [
    { id: "low-sources", label: "fewer than 2 sources" },
    { id: "missing-versions", label: "missing affected versions" },
    { id: "inferred-package", label: "inferred package names" },
    { id: "unverified-severity", label: "high severity with unverified confidence" },
    { id: "exploit-unknown", label: "unclear exploit status" },
    { id: "kev-unknown", label: "unknown CISA KEV status" },
  ].filter((banner) => (warningCounts[banner.id] ?? 0) > 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Sparkle className="h-4 w-4 text-primary" weight="bold" />
        <Badge variant={aiReady ? "default" : "secondary"}>
          AI {aiReady ? "configured" : "not configured"}
        </Badge>
      </div>

      {warningBanners.map((banner) => (
        <div
          key={banner.id}
          className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <Warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" weight="bold" />
          <div>
            <p className="font-medium text-amber-400">Review warning</p>
            <p className="mt-1 text-sm text-amber-300/80">
              {warningCounts[banner.id]} incident
              {(warningCounts[banner.id] ?? 0) !== 1 ? "s have" : " has"} {banner.label}.
            </p>
          </div>
        </div>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Incidents ({incidents.length})</CardTitle>
          <CardDescription>Review, generate AI summaries, verify claims, and publish.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Title</th>
                  <th className="pb-3 pr-4 font-medium">Severity</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Sources</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const blockUnverifiedPublish =
                    (incident.severity === "CRITICAL" || incident.severity === "HIGH") &&
                    incident.confidence === "UNVERIFIED";
                  const warnings = getAdminIncidentWarnings(incident);

                  return (
                    <tr key={incident.id} className="border-b border-border/50">
                      <td className="py-4 pr-4">
                        <p className="font-medium">{incident.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {incident.beginnerTldr ?? "No TLDR yet"}
                        </p>
                        {warnings.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {warnings.map((warning) => (
                              <Badge
                                key={warning.id}
                                variant="outline"
                                className="border-amber-500/40 text-amber-400"
                              >
                                {warning.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <SeverityBadge severity={incident.severity as "CRITICAL"} />
                      </td>
                      <td className="py-4 pr-4">
                        <Badge className={statusStyles[incident.status] ?? ""}>
                          {incident.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs">
                        {incident.sources.length}
                        {incident.sources.length < 2 && (
                          <span className="ml-1 text-amber-400">!</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!aiReady || generateMutation.isPending}
                            onClick={() =>
                              generateMutation.mutate({ incident, type: "incident-extraction" })
                            }
                          >
                            Extract
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!aiReady || generateMutation.isPending}
                            onClick={() =>
                              generateMutation.mutate({ incident, type: "beginner-tldr" })
                            }
                          >
                            TLDR
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!aiReady || generateMutation.isPending}
                            onClick={() =>
                              generateMutation.mutate({ incident, type: "technical-summary" })
                            }
                          >
                            Technical
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!aiReady || generateMutation.isPending}
                            onClick={() =>
                              generateMutation.mutate({ incident, type: "source-verification" })
                            }
                          >
                            Verify
                          </Button>
                          {incident.status !== "PUBLISHED" && (
                            <Button
                              size="sm"
                              disabled={
                                publishMutation.isPending ||
                                incident.sources.length < 2 ||
                                blockUnverifiedPublish
                              }
                              onClick={() => publishMutation.mutate(incident.id)}
                            >
                              Publish
                            </Button>
                          )}
                          <a
                            href={`/incidents/${incident.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              <ArrowSquareOut className="h-3 w-3" weight="bold" />
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply AI output</DialogTitle>
            <DialogDescription>
              Review generated content before saving to the incident record.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(preview.payload, null, 2)}
            </pre>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!preview) return;
                const patch = { ...preview.payload };
                if (typeof patch.confidence === "string") {
                  patch.confidence = mapConfidenceToDb(patch.confidence);
                }
                await applyPatch(preview.incident, patch, "AI output applied");
                setPreview(null);
              }}
            >
              Apply to incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
