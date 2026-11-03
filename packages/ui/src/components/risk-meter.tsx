"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { RiskLevel } from "../types";

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  className?: string;
  /** Count the score up and grow the bar when scrolled into view. */
  animated?: boolean;
}

const levelConfig = {
  CRITICAL: { color: "bg-severity-critical", label: "Critical Risk", range: "90-100" },
  HIGH: { color: "bg-severity-high", label: "High Risk", range: "70-89" },
  MEDIUM: { color: "bg-severity-medium", label: "Medium Risk", range: "40-69" },
  LOW: { color: "bg-severity-low", label: "Low Risk", range: "10-39" },
  NONE: { color: "bg-severity-safe", label: "No Risk", range: "0-9" },
  UNKNOWN: { color: "bg-severity-info", label: "Unknown", range: "N/A" },
};

export function RiskMeter({ score, level, className, animated = false }: RiskMeterProps) {
  const config = levelConfig[level];
  const percentage = Math.min(100, Math.max(0, score));

  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplay(score);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setDisplay(score);
      return;
    }

    let raf = 0;
    let start = 0;
    const duration = 1100;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const step = (now: number) => {
              if (!start) start = now;
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(score * eased);
              if (t < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [animated, score]);

  const shownScore = Math.round(display);
  const shownWidth = animated ? (display / 100) * 100 : percentage;

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">{shownScore}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk score: ${score} out of 100`}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", config.color)}
          style={{ width: `${Math.min(100, Math.max(0, shownWidth))}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", config.color.replace("bg-", "text-"))}>
          {config.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {config.range}
        </span>
      </div>
    </div>
  );
}
