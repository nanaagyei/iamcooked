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
