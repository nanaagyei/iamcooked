"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/hooks/use-prefers-reduced-motion";

type RadarVariant = "hero" | "panel" | "ambient";

interface RadarIllustrationProps {
  className?: string;
  variant?: RadarVariant;
  interactive?: boolean;
  seed?: string;
}

interface RadarNode {
  angle: number;
  radius: number;
  size: number;
  pulse: number;
  baseAlpha: number;
}

const VARIANT_CONFIG: Record<
  RadarVariant,
  { nodeCount: number; rings: number; sweepSpeed: number; centerYBias: number; scale: number }
> = {
  hero: { nodeCount: 26, rings: 4, sweepSpeed: 0.45, centerYBias: 0.5, scale: 1 },
  panel: { nodeCount: 16, rings: 3, sweepSpeed: 0.55, centerYBias: 0.5, scale: 0.92 },
  ambient: { nodeCount: 12, rings: 3, sweepSpeed: 0.3, centerYBias: 0.4, scale: 1.1 },
};

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseRgb(value: string, fallback: [number, number, number]): [number, number, number] {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1] ?? "";
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 6) {
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ];
    }
  }
  const rgb = v.match(/(\d+(?:\.\d+)?)/g);
  if (rgb && rgb.length >= 3) {
    return [Number(rgb[0] ?? 0), Number(rgb[1] ?? 0), Number(rgb[2] ?? 0)];
  }
  return fallback;
}

export function RadarIllustration({
  className,
  variant = "hero",
  interactive = true,
  seed = "iamcooked",
}: RadarIllustrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = VARIANT_CONFIG[variant];
    const rng = mulberry32(hashSeed(seed));

    let primary: [number, number, number] = [158, 203, 61];
    let neutral: [number, number, number] = [139, 146, 154];
    const readColors = () => {
      const styles = getComputedStyle(canvas);
      primary = parseRgb(styles.getPropertyValue("--primary"), [158, 203, 61]);
      neutral = parseRgb(styles.getPropertyValue("--muted-foreground"), [139, 146, 154]);
    };
    readColors();

    const nodes: RadarNode[] = Array.from({ length: config.nodeCount }, () => ({
      angle: rng() * Math.PI * 2,
      radius: 0.18 + rng() * 0.78,
      size: 1.2 + rng() * 2.6,
      pulse: 0,
      baseAlpha: 0.25 + rng() * 0.4,
    }));

    // Edges: connect each node to its nearest neighbour for a dependency-graph look.
    const toXY = (n: RadarNode, cx: number, cy: number, maxR: number) => ({
      x: cx + Math.cos(n.angle) * n.radius * maxR,
      y: cy + Math.sin(n.angle) * n.radius * maxR,
    });
    const edges: Array<[RadarNode, RadarNode]> = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!a) continue;
      let best: RadarNode | null = null;
      let bestIndex = -1;
      let bestDist = Infinity;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const b = nodes[j];
        if (!b) continue;
        const dx = a.radius * Math.cos(a.angle) - b.radius * Math.cos(b.angle);
        const dy = a.radius * Math.sin(a.angle) - b.radius * Math.sin(b.angle);
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = b;
          bestIndex = j;
        }
      }
      if (best && i < bestIndex) edges.push([a, best]);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: -9999, y: -9999, active: false };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = (sweep: number) => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height * config.centerYBias;
      const maxR = Math.min(width, height * (config.centerYBias > 0.45 ? 1.1 : 1.6)) * 0.62 * config.scale;
      const [pr, pg, pb] = primary;
      const [nr, ng, nb] = neutral;

      // Concentric rings
      for (let r = 1; r <= config.rings; r++) {
        const ringR = (maxR / config.rings) * r;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${nr},${ng},${nb},${0.1 - r * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Crosshair axes
      ctx.strokeStyle = `rgba(${nr},${ng},${nb},0.06)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Sweep wedge
      if (!prefersReducedMotion) {
        const sweepWidth = 0.55;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        grad.addColorStop(0, `rgba(${pr},${pg},${pb},0.16)`);
        grad.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, sweep - sweepWidth, sweep);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Leading edge line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.4)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Static wedge for reduced motion
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        grad.addColorStop(0, `rgba(${pr},${pg},${pb},0.1)`);
        grad.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, -0.9, -0.35);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Edges
      ctx.lineWidth = 1;
      for (const [na, nb] of edges) {
        const pa = toXY(na, cx, cy, maxR);
        const pb2 = toXY(nb, cx, cy, maxR);
        const glow = Math.max(na.pulse, nb.pulse);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb2.x, pb2.y);
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},${0.05 + glow * 0.2})`;
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const p = toXY(n, cx, cy, maxR);

        if (!prefersReducedMotion) {
          // Light up as the sweep passes
          let diff = ((sweep - n.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          if (diff < 0.25) n.pulse = 1;
          n.pulse *= 0.965;
        }

        // Cursor proximity
        let prox = 0;
        if (interactive && pointer.active && !prefersReducedMotion) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          prox = Math.max(0, 1 - dist / 140);
          if (prox > 0.01) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},${prox * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const intensity = Math.min(1, n.baseAlpha + n.pulse * 0.8 + prox * 0.8);
        const radius = n.size + n.pulse * 2 + prox * 2.5;

        if (n.pulse > 0.05 || prox > 0.05) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${(n.pulse * 0.12 + prox * 0.12)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        const useLime = n.pulse > 0.15 || prox > 0.15;
        ctx.fillStyle = useLime
          ? `rgba(${pr},${pg},${pb},${intensity})`
          : `rgba(${nr},${ng},${nb},${intensity * 0.7})`;
        ctx.fill();
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pr},${pg},${pb},0.9)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    let raf = 0;
    let last = performance.now();
    let sweep = -Math.PI / 2;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sweep += dt * config.sweepSpeed * Math.PI;
      if (sweep > Math.PI * 2) sweep -= Math.PI * 2;
      draw(sweep);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => readColors());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (prefersReducedMotion) {
      draw(-Math.PI / 2);
    } else {
      if (interactive) {
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerleave", onPointerLeave);
      }
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [variant, interactive, seed, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("h-full w-full", interactive ? "touch-none" : "pointer-events-none", className)}
    />
  );
}
