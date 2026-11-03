import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        "relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-foreground/5 after:to-transparent",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function IncidentCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-diffusion)]">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-5 w-20" />
        <SkeletonBlock className="h-5 w-20" />
      </div>
      <SkeletonBlock className="h-6 w-3/4" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
    </div>
  );
}

export function ScanReportSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-12 w-48" />
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-diffusion)]">
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div className="max-w-lg space-y-6">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-10 w-full rounded-lg" />
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-10 w-full rounded-lg" />
      <SkeletonBlock className="h-10 w-28 rounded-lg" />
    </div>
  );
}

export { SkeletonBlock };
