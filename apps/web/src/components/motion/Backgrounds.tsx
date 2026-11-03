import { cn } from "@/lib/utils";

/** Fine grid that fades out radially (Magic UI "Grid Pattern" style). */
export function GridBackground({ className, size = 56 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/** Dotted field (Magic UI "Dot Pattern" style). */
export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]", className)}
      style={{
        backgroundImage: "radial-gradient(color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

/** Slow-drifting ember glow orbs. */
export function GlowOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="orb absolute -left-[10%] -top-[20%] h-[42rem] w-[42rem] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/15" />
      <div className="orb orb-delay absolute -right-[15%] top-[10%] h-[34rem] w-[34rem] rounded-full bg-amber-400/15 blur-[120px] dark:bg-amber-500/10" />
      <div className="orb orb-slow absolute bottom-[-30%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-rose-500/10 blur-[120px]" />
    </div>
  );
}
