import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Text with a light sweep across it (Magic UI "Animated Shiny Text" style). */
export function TextShimmer({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-shimmer", className)}>{children}</span>;
}
