import { TextLink } from "@/components/ui/text-link";
import { SeverityBadge, PackageBadge } from "@/components/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface ScanFindingData {
  id: string;
  packageName: string;
  installedVersion?: string | null;
  findingType: string;
  severity: Severity;
  confidence: string;
  explanation: string;
  actionItems?: Array<{ action?: string; title?: string; command?: string; urgency: string }> | null;
  incident?: { id: string; slug: string; title: string; severity: Severity } | null;
  advisory?: { id: string; externalId: string; summary?: string | null; severity?: Severity | null } | null;
}

export function ScanFindingCard({ finding }: { finding: ScanFindingData }) {
  const isKev = finding.findingType === "ACTIVELY_EXPLOITED";

  return (
    <Card className="border-border bg-card shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <PackageBadge name={finding.packageName} />
              {finding.installedVersion && (
                <span className="font-mono text-xs text-muted-foreground">
                  v{finding.installedVersion}
                </span>
              )}
              <Badge variant="outline" className="text-xs">
                {finding.findingType.replace(/_/g, " ")}
              </Badge>
              {isKev && (
                <Badge className="bg-severity-critical/15 text-severity-critical border-severity-critical/30">
                  CISA KEV
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {finding.explanation}
            </p>
            {finding.advisory && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Advisory: {finding.advisory.externalId}
              </p>
            )}
            {finding.incident && (
              <div className="mt-3">
                <TextLink href={`/incidents/${finding.incident.slug}`} variant="inline" size="sm">
                  View incident: {finding.incident.title}
                </TextLink>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
