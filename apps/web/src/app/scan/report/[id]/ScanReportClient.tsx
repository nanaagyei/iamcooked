"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionContainer } from "@/components/layout";
import { RiskMeter, ScanReportSkeleton } from "@/components/feedback";
import { ScanFindingCard, ActionChecklist, type ScanFindingData } from "@/components/scan";
import { ShareToolbar } from "@/components/scan/ShareToolbar";
import { NewsletterCapture } from "@/components/forms/NewsletterCapture";
import { addPendingScan } from "@/components/scan/ScanClaimOnAuth";
import { useCommand } from "@/components/command/command-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Sparkle, CircleNotch } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

interface RemediationPlan {
  risk_summary?: string;
  priority?: string;
  beginner_explanation?: string;
  technical_notes?: string;
  confidence?: string;
  actions?: Array<{
    title: string;
    description: string;
    command?: string;
    urgency: string;
  }>;
}

interface ScanReportData {
  id: string;
  uploadFileName?: string | null;
  ecosystem: string;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  summary?: string | null;
  remediationPlan?: RemediationPlan | null;
  remediationGeneratedAt?: string | null;
  createdAt: string;
  findings: ScanFindingData[];
}

export function ScanReportClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params.id as string;
  const accessToken = searchParams.get("token");
  const { setCopilotContext } = useCommand();
  const [report, setReport] = useState<ScanReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    setCopilotContext({
      scanReportId: reportId,
      scanAccessToken: accessToken ?? undefined,
    });
    return () => setCopilotContext({});
  }, [reportId, accessToken, setCopilotContext]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const query = accessToken ? `?token=${encodeURIComponent(accessToken)}` : "";
        const res = await fetch(`/api/scan/report/${reportId}${query}`);
        if (!res.ok) {
          setError("Report not found or access denied.");
          return;
        }
        const data = await res.json();
        setReport(data);
        if (accessToken) {
          addPendingScan({ scanReportId: reportId, accessToken });
        }
      } catch {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, accessToken]);

  const generateActionPlan = async (regenerate = false) => {
    if (!accessToken) {
      setPlanError("Access token required to generate an action plan.");
      return;
    }
    setGeneratingPlan(true);
    setPlanError(null);
    try {
      const res = await fetch("/api/ai/remediation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanReportId: reportId,
          scanAccessToken: accessToken,
          regenerate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlanError(data.error?.message ?? "Failed to generate action plan.");
        return;
      }
      setReport((prev) =>
        prev
          ? {
              ...prev,
              remediationPlan: data.plan,
              remediationGeneratedAt: data.generatedAt,
            }
          : prev,
      );
    } catch {
      setPlanError("Failed to generate action plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <SectionContainer size="narrow" className="py-12">
        <ScanReportSkeleton />
      </SectionContainer>
    );
  }

  if (error || !report) {
    return (
      <SectionContainer size="narrow" className="py-12">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h1 className="text-xl font-semibold">Report not found</h1>
          <p className="mt-2 text-muted-foreground">{error ?? "The scan report could not be loaded."}</p>
          <Button className="mt-6" asChild>
            <Link href="/scan">Scan another project</Link>
          </Button>
        </div>
      </SectionContainer>
    );
  }

  const URGENT: Severity[] = ["CRITICAL", "HIGH"];
  const criticalFindings = report.findings.filter((f) => URGENT.includes(f.severity));
  const otherFindings = report.findings.filter((f) => !URGENT.includes(f.severity));
  const allActions = report.findings.flatMap((f) => f.actionItems ?? []);
  const remediationActions =
    report.remediationPlan?.actions?.map((a) => ({
      title: a.title,
      action: a.description,
      command: a.command,
      urgency: a.urgency,
    })) ?? [];

  return (
    <>
      <SectionContainer size="narrow" className="py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Scan report</h1>
            <p className="mt-2 text-muted-foreground">
              {report.uploadFileName} · {report.ecosystem} ecosystem
            </p>
          </div>
          <ShareToolbar reportId={reportId} accessToken={accessToken} report={report} />
        </div>

        <Card className="mt-8 rounded-2xl border-border/50 shadow-[var(--shadow-diffusion)]">
          <CardContent className="pt-6">
            <RiskMeter score={report.riskScore} level={report.riskLevel} />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
          </CardContent>
        </Card>

        {allActions.length > 0 && remediationActions.length === 0 && (
          <div className="mt-8">
            <ActionChecklist items={allActions} />
          </div>
        )}

        {report.findings.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Personalized action plan</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI-generated remediation based on your scan findings and advisory data.
                </p>
              </div>
              <Button
                variant="secondary"
                disabled={generatingPlan || !accessToken}
                onClick={() => generateActionPlan(!!report.remediationPlan)}
              >
                {generatingPlan ? (
                  <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <Sparkle className="h-4 w-4" weight="bold" />
                )}
                {report.remediationPlan ? "Regenerate plan" : "Generate action plan"}
              </Button>
            </div>
            {planError && <p className="mt-3 text-sm text-destructive">{planError}</p>}
            {report.remediationPlan && (
              <div className="mt-4 space-y-4">
                {report.remediationPlan.confidence && (
                  <Badge variant="secondary">Confidence: {report.remediationPlan.confidence}</Badge>
                )}
                {report.remediationPlan.beginner_explanation && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {report.remediationPlan.beginner_explanation}
                  </p>
                )}
                {remediationActions.length > 0 && <ActionChecklist items={remediationActions} />}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {report.findings.length === 0 ? (
            <div className="rounded-2xl border border-severity-safe/30 bg-severity-safe/5 p-6 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-severity-safe" weight="bold" />
              <h3 className="mt-3 font-semibold">No vulnerabilities found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your dependencies look clean against OSV, CISA KEV, and incident data.
              </p>
            </div>
          ) : (
            <>
              {criticalFindings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold">Urgent findings</h2>
                  <div className="mt-4 space-y-4">
                    {criticalFindings.map((f) => (
                      <ScanFindingCard key={f.id} finding={f} />
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h2 className="text-xl font-semibold">
                  {criticalFindings.length > 0 ? "Other findings" : "Findings"} ({report.findings.length})
                </h2>
                <div className="mt-4 space-y-4">
                  {otherFindings.map((f) => (
                    <ScanFindingCard key={f.id} finding={f} />
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Save this report</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to keep scan history, manage a watchlist, and get digest alerts.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/signin">Sign in with GitHub</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Get alerted about future threats</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe for weekly briefs and critical alerts.
            </p>
            <div className="mt-4">
              <NewsletterCapture variant="inline" />
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/scan">
                Scan another project
                <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
