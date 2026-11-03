"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { GridBackground } from "./Backgrounds";

/**
 * Interactive 3D "network" background from Vanta.js (MIT, github.com/tengbao/vanta),
 * drawn in a single solid accent colour on a transparent canvas. three.js and Vanta are
 * loaded lazily, only on desktop-class devices with motion allowed and WebGL available;
 * everyone else gets the static grid.
 */
export function VantaNet({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const canvas = document.createElement("canvas");
    const webgl = !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    if (reduce || small || !webgl) return;

    let effect: { destroy: () => void } | null = null;
    let cancelled = false;
    const dark = resolvedTheme === "dark";

    (async () => {
      const [THREE, { default: NET }] = await Promise.all([import("three"), import("vanta/dist/vanta.net.min")]);
      if (cancelled) return;
      effect = NET({
        el,
        THREE,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        color: dark ? 0xf9743b : 0xe25e2b,
        backgroundColor: dark ? 0x0b0a09 : 0xfaf7f3,
        backgroundAlpha: 0,
        points: 9,
        maxDistance: 21,
        spacing: 19,
        showDots: true,
      });
      setActive(true);
    })().catch(() => setActive(false));

    return () => {
      cancelled = true;
      effect?.destroy();
      setActive(false);
    };
  }, [resolvedTheme]);

  return (
    <div className={cn("pointer-events-auto absolute inset-0", className)} aria-hidden>
      {!active && <GridBackground size={64} />}
      <div ref={ref} className={cn("absolute inset-0 transition-opacity duration-1000", active ? "opacity-40 dark:opacity-50" : "opacity-0")} />
    </div>
  );
}
