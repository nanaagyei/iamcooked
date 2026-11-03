"use client";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  LinkSimple,
  Copy,
  Printer,
} from "@phosphor-icons/react";

interface ShareToolbarProps {
  reportId: string;
  accessToken?: string | null;
  report: {
    uploadFileName?: string | null;
    ecosystem: string;
    riskScore: number;
    riskLevel: string;
    summary?: string | null;
    findings: Array<{
      packageName: string;
      severity: string;
      explanation: string;
    }>;
  };
}

function buildMarkdown(report: ShareToolbarProps["report"], url: string) {
  const lines = [
    `# iamcooked scan report`,
    ``,
    `- File: ${report.uploadFileName ?? "lockfile"}`,
    `- Ecosystem: ${report.ecosystem}`,
    `- Risk: ${report.riskScore}/100 (${report.riskLevel})`,
    `- Link: ${url}`,
    ``,
    report.summary ?? "",
    ``,
    `## Findings`,
    ...report.findings.map(
      (f) => `- **${f.packageName}** (${f.severity}): ${f.explanation}`,
    ),
  ];
  return lines.join("\n");
}

export function ShareToolbar({ reportId, accessToken, report }: ShareToolbarProps) {
  const tokenQuery = accessToken ? `?token=${encodeURIComponent(accessToken)}` : "";
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/scan/report/${reportId}${tokenQuery}`
      : `/scan/report/${reportId}${tokenQuery}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied", "Share this report with your team.");
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(buildMarkdown(report, url));
    toast.success("Summary copied", "Markdown summary is on your clipboard.");
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={copyLink}>
        <LinkSimple className="h-4 w-4" weight="bold" aria-hidden />
        Copy link
      </Button>
      <Button variant="outline" size="sm" onClick={copyMarkdown}>
        <Copy className="h-4 w-4" weight="bold" aria-hidden />
        Copy summary
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" weight="bold" aria-hidden />
        Print
      </Button>
    </div>
  );
}
