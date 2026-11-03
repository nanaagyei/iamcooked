"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiskMeter } from "@/components/feedback";

const prompts = [
  "Scan package-lock.json for lodash advisories",
  "Explain CVE-2024-21538 in plain English",
  "Which findings need action today?",
];

const mockFindings = [
  { pkg: "lodash", severity: "HIGH", dot: "bg-severity-high" },
  { pkg: "express", severity: "LOW", dot: "bg-severity-low" },
  { pkg: "@grpc/grpc-js", severity: "MEDIUM", dot: "bg-severity-medium" },
];

const TypewriterBar = memo(function TypewriterBar() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = prompts[index] ?? "";
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          const next = full.slice(0, text.length + 1);
          setText(next);
          if (next === full) {
            setTimeout(() => setDeleting(true), 1800);
          }
        } else {
          const next = full.slice(0, text.length - 1);
          setText(next);
          if (next === "") {
            setDeleting(false);
            setIndex((i) => (i + 1) % prompts.length);
          }
        }
      },
      deleting ? 24 : 42,
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <div className="rounded-xl border border-border bg-muted px-4 py-3 font-mono text-xs text-muted-foreground">
      <span>{text}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-0.5 inline-block h-3 w-0.5 bg-primary align-middle"
      />
    </div>
  );
});

const LiveStatusDot = memo(function LiveStatusDot() {
  return (
    <motion.span
      className="inline-block h-2 w-2 rounded-full bg-primary"
      animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      aria-hidden
    />
  );
});

export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-[var(--shadow-diffusion)] backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Example scan preview
        </p>
        <span className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          <LiveStatusDot />
          Monitoring
        </span>
      </div>
      <div className="mt-5">
        <TypewriterBar />
      </div>
      <div className="mt-6">
        <RiskMeter score={47} level="MEDIUM" animated />
      </div>
      <div className="mt-6 space-y-2">
        {mockFindings.map((f, i) => (
          <motion.div
            key={f.pkg}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.4 + i * 0.15,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
            className="flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-2.5"
          >
            <span className="flex items-center gap-2.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${f.dot}`} aria-hidden />
              <span className="font-mono text-sm tabular-nums">{f.pkg}</span>
            </span>
            <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {f.severity}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
