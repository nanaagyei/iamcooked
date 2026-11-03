import { cn } from "@/lib/utils";

type PageBackdropVariant =
  | "hero"
  | "incident-hero"
  | "incident-context"
  | "incident-cta"
  | "learn-hero"
  | "learn-card"
  | "scan"
  | "newsletter"
  | "default";

type PageBackdropProps = {
  variant?: PageBackdropVariant;
  seed?: string;
  className?: string;
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Each variant only differs by where the single muted-lime glow sits and how
// strong it is. No blue/purple/emerald gradients, no severity colors on
// decorative surfaces. A faint dot grid carries the "infrastructure" texture.
const variantConfig: Record<
  PageBackdropVariant,
  { x: number; y: number; size: number; intensity: number }
> = {
  hero: { x: 18, y: 24, size: 55, intensity: 0.07 },
  "incident-hero": { x: 22, y: 0, size: 55, intensity: 0.06 },
  "incident-context": { x: 80, y: 30, size: 50, intensity: 0.05 },
  "incident-cta": { x: 50, y: 50, size: 60, intensity: 0.06 },
  "learn-hero": { x: 14, y: 0, size: 50, intensity: 0.07 },
  "learn-card": { x: 12, y: 12, size: 55, intensity: 0.05 },
  scan: { x: 50, y: 20, size: 60, intensity: 0.06 },
  newsletter: { x: 85, y: 70, size: 55, intensity: 0.05 },
  default: { x: 50, y: 30, size: 60, intensity: 0.045 },
};

export function PageBackdrop({
  variant = "default",
  seed = "iamcooked",
  className,
}: PageBackdropProps) {
  // Variant/seed are kept for API compatibility; the backdrop is now a plain dot grid.
  void variantConfig[variant];
  void hashSeed(seed);

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, color-mix(in oklab, var(--muted-foreground) 22%, transparent) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, #000 35%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, #000 35%, transparent 80%)",
          opacity: 0.5,
        }}
      />

    </div>
  );
}

export function PageBackdropFill({
  variant = "default",
  seed = "iamcooked",
  className,
}: PageBackdropProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <PageBackdrop variant={variant} seed={seed} />
    </div>
  );
}
