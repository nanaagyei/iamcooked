import { cn } from "../lib/cn";
import { Badge } from "./badge";
import type { Confidence } from "../types";

const confidenceStyles: Record<Confidence, string> = {
  CONFIRMED: "bg-severity-safe/15 text-severity-safe border-severity-safe/30",
  LIKELY: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  DEVELOPING: "bg-severity-low/15 text-severity-low border-severity-low/30",
  UNVERIFIED: "bg-severity-info/15 text-severity-info border-severity-info/30",
  DISPUTED: "bg-severity-high/15 text-severity-high border-severity-high/30",
};

const confidenceLabels: Record<Confidence, string> = {
  CONFIRMED: "Confirmed",
  LIKELY: "Likely",
  DEVELOPING: "Developing",
  UNVERIFIED: "Unverified",
  DISPUTED: "Disputed",
};

interface ConfidenceBadgeProps {
  confidence: Confidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", confidenceStyles[confidence], className)}
      aria-label={`Confidence: ${confidenceLabels[confidence]}`}
    >
      {confidenceLabels[confidence]}
    </Badge>
  );
}
