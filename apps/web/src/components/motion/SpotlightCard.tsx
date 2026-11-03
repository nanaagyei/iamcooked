"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Card with a cursor-following glow and border highlight
 * (inspired by Aceternity UI's "Card Spotlight", MIT).
 */
export function SpotlightCard({
  children,
  className,
  glow = "var(--primary)",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      style={{ ["--glow" as string]: glow }}
      className={cn(
        "group/spot relative overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,transform] duration-300",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--glow)_14%,transparent),transparent_60%)]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100",
        "after:[background:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--glow)_60%,transparent),transparent_70%)] after:[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
        className,
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
