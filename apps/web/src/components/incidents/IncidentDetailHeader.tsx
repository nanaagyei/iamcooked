import { Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge, ConfidenceBadge } from "@/components/badges";
import type { Severity, Confidence } from "@prisma/client";

interface IncidentDetailHeaderProps {
  title: string;
  severity: Severity;
  confidence: Confidence;
  ecosystem: string;
  incidentType: string;
  publishedAt: string | null;
  sourceCount: number;
}

export function IncidentDetailHeader({
  title,
  severity,
  confidence,
  ecosystem,
  incidentType,
  publishedAt,
  sourceCount,
}: IncidentDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityBadge severity={severity} />
        <ConfidenceBadge confidence={confidence} />
        <Badge
          variant="outline"
          className="font-mono bg-muted border-border text-muted-foreground"
        >
          {incidentType}
        </Badge>
      </div>

      <h1 className="text-2xl font-semibold text-foreground leading-tight tracking-tight sm:text-3xl">
        {title}
      </h1>

      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
        <Badge
          variant="outline"
          className="font-mono text-[11px] uppercase tracking-wider bg-muted border-border text-muted-foreground"
        >
          {ecosystem}
        </Badge>

        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {publishedAt
            ? new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unpublished"}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" />
          {sourceCount} {sourceCount === 1 ? "source" : "sources"}
        </span>
      </div>
    </div>
  );
}
