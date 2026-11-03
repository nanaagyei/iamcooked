import { cn } from "@/lib/utils";

/**
 * A light that travels around the border of its (relative, rounded) parent
 * (inspired by Magic UI's "Border Beam", MIT). Pure CSS; see `.border-beam` in globals.css.
 */
export function BorderBeam({ className, duration = 8 }: { className?: string; duration?: number }) {
  return <span aria-hidden className={cn("border-beam", className)} style={{ ["--beam-duration" as string]: `${duration}s` }} />;
}
