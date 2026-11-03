"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getGsap, prefersReducedMotion } from "./gsap";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children?: ReactNode;
  className?: string;
  /** Positive = moves slower than scroll (drifts down), negative = faster. Percent of own height. */
  speed?: number;
  /** Also fade out as it leaves the viewport. */
  fade?: boolean;
  scale?: number;
}

/** Scroll-linked parallax layer driven by GSAP ScrollTrigger (scrubbed). */
export function Parallax({ children, className, speed = 20, fade = false, scale }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed / 2, opacity: 1, scale: 1 },
        {
          yPercent: speed / 2,
          opacity: fade ? 0.2 : 1,
          scale: scale ?? 1,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [speed, fade, scale]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
