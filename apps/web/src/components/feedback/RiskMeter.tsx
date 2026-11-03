import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | "UNKNOWN";
  className?: string;
}

const levelConfig = {
  CRITICAL: { color: "bg-severity-critical", label: "Critical Risk", range: "90-100" },
  HIGH: { color: "bg-severity-high", label: "High Risk", range: "70-89" },
  MEDIUM: { color: "bg-severity-medium", label: "Medium Risk", range: "40-69" },
  LOW: { color: "bg-severity-low", label: "Low Risk", range: "10-39" },
  NONE: { color: "bg-severity-safe", label: "No Risk", range: "0-9" },
  UNKNOWN: { color: "bg-severity-info", label: "Unknown", range: "N/A" },
};

export function RiskMeter({ score, level, className }: RiskMeterProps) {
  const config = levelConfig[level];
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Risk score: ${score} out of 100`}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", config.color.replace("bg-", "text-"))}>
          {config.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {config.range}
        </span>
      </div>
    </div>
  );
}
