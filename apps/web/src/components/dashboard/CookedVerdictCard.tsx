import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { getCookedVerdict, cookedToneStyles } from "@/lib/cooked";
import { Flame } from "@phosphor-icons/react/dist/ssr";

interface CookedVerdictCardProps {
  score: number;
  totalOpenVulns: number;
  reachableCount: number;
}

export function CookedVerdictCard({ score, totalOpenVulns, reachableCount }: CookedVerdictCardProps) {
  const verdict = getCookedVerdict(score);

  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
              cookedToneStyles[verdict.tone],
            )}
          >
            <Flame className="h-7 w-7" weight="fill" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Am I cooked?
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {verdict.label}
            </p>
            <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">{verdict.blurb}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums">{totalOpenVulns}</p>
            <p className="text-xs text-muted-foreground">open issues</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums text-severity-critical">
              {reachableCount}
            </p>
            <p className="text-xs text-muted-foreground">reachable</p>
          </div>
          <div className="hidden h-14 w-px bg-border sm:block" aria-hidden />
          <div className="hidden text-right sm:block">
            <p className="text-3xl font-semibold tabular-nums">{score}</p>
            <p className="text-xs text-muted-foreground">cooked score</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
