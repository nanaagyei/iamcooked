import { cn } from "../lib/cn";
import { Badge } from "./badge";
import type { Severity } from "../types";

const severityStyles: Record<Severity, string> = {
  CRITICAL: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  HIGH: "bg-severity-high/15 text-severity-high border-severity-high/30",
  MEDIUM: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  LOW: "bg-severity-low/15 text-severity-low border-severity-low/30",
  INFO: "bg-severity-info/15 text-severity-info border-severity-info/30",
  UNKNOWN: "bg-muted text-muted-foreground border-border",
};

const severityLabels: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  INFO: "Info",
  UNKNOWN: "Unknown",
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", severityStyles[severity], className)}
      aria-label={`Severity: ${severityLabels[severity]}`}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-2 w-2 rounded-full",
          severity === "CRITICAL" && "bg-severity-critical",
          severity === "HIGH" && "bg-severity-high",
          severity === "MEDIUM" && "bg-severity-medium",
          severity === "LOW" && "bg-severity-low",
          severity === "INFO" && "bg-severity-info",
          severity === "UNKNOWN" && "bg-text-secondary-dark",
        )}
        aria-hidden="true"
      />
      {severityLabels[severity]}
    </Badge>
  );
}
