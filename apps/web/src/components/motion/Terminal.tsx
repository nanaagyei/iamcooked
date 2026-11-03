"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TerminalLine =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string; tone?: "muted" | "critical" | "high" | "safe" | "accent" | "bold" }
  | { kind: "gap" };

const TONE: Record<string, string> = {
  muted: "text-white/50",
  critical: "text-severity-critical font-semibold",
  high: "text-severity-high",
  safe: "text-severity-safe",
  accent: "text-[#f9743b]",
  bold: "text-white font-semibold",
};

/**
 * A terminal that types its commands and streams the output in when scrolled into view
 * (inspired by Magic UI's "Terminal", MIT). Under reduced motion everything renders at once.
 */
export function Terminal({ lines, className, title = "zsh — iamcooked" }: { lines: TerminalLine[]; className?: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0); // how many lines are visible
  const [typed, setTyped] = useState(0); // chars typed of the current cmd line

  useEffect(() => {
    if (reduce) {
      setShown(lines.length);
      return;
    }
    if (!inView || shown >= lines.length) return;
    const line = lines[shown]!;
    if (line.kind === "cmd") {
      if (typed < line.text.length) {
        const t = setTimeout(() => setTyped((n) => n + 1), 38 + Math.random() * 40);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setShown((n) => n + 1);
        setTyped(0);
      }, 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), line.kind === "gap" ? 120 : 90);
    return () => clearTimeout(t);
  }, [inView, shown, typed, lines, reduce]);

  const current = lines[shown];

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-[#0f0d0b] text-[#f2ede7] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)]",
        className,
      )}
      role="img"
      aria-label={`Terminal demo: ${lines.filter((l) => l.kind !== "gap").map((l) => ("text" in l ? l.text : "")).join(". ")}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-white/40">{title}</span>
      </div>
      <pre aria-hidden className="min-h-[19rem] overflow-hidden px-4 py-4 font-mono text-[12px] leading-[1.7] sm:text-[13px]">
        {lines.slice(0, shown).map((l, i) => (
          <Line key={i} line={l} />
        ))}
        {current && current.kind === "cmd" && shown < lines.length && (
          <div>
            <span className="text-primary">❯ </span>
            {current.text.slice(0, typed)}
            <span className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-primary/80" />
          </div>
        )}
        {shown >= lines.length && (
          <div>
            <span className="text-primary">❯ </span>
            <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-primary/80" />
          </div>
        )}
      </pre>
    </div>
  );
}

function Line({ line }: { line: TerminalLine }) {
  if (line.kind === "gap") return <div>&nbsp;</div>;
  if (line.kind === "cmd")
    return (
      <div>
        <span className="text-primary">❯ </span>
        {line.text}
      </div>
    );
  return <div className={cn("animate-[term-in_240ms_ease-out]", line.tone ? TONE[line.tone] : "text-white/80")}>{line.text}</div>;
}
