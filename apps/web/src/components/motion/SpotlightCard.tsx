"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Card that tilts towards the cursor in 3D and lifts its border on hover
 * (idea from React Bits' "Tilted Card"; our own implementation). Solid colours only.
 */
export function SpotlightCard({ children, className, tilt = 5 }: { children: ReactNode; className?: string; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), { stiffness: 200, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={reduce ? undefined : onMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={cn(
        "group/spot relative overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-300",
        "hover:border-primary/50 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-primary transition-[width] duration-500 group-hover/spot:w-full" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
