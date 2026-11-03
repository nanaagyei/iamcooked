"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  /** Number of decimal places to render. */
  decimals?: number;
  /** Optional suffix, e.g. "%". */
  suffix?: string;
  /** Optional prefix. */
  prefix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` once the element scrolls into view. Tabular mono numerals
 * for stable width. Renders the final value immediately under reduced motion.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1.1,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const counter = { v: 0 };
    let tween: gsap.core.Tween | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            tween = gsap.to(counter, {
              v: value,
              duration,
              ease: "power2.out",
              onUpdate: () => setDisplay(counter.v),
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
