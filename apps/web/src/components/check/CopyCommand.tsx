"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function CopyCommand({ command, className, prompt = "$" }: { command: string; className?: string; prompt?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 font-mono text-xs sm:text-sm",
        className,
      )}
    >
      <span className="select-none text-primary" aria-hidden>
        {prompt}
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground">{command}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked */
          }
        }}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={copied ? "Copied" : `Copy command: ${command}`}
      >
        {copied ? <Check className="h-4 w-4 text-severity-safe" weight="bold" /> : <Copy className="h-4 w-4" weight="bold" />}
      </button>
    </div>
  );
}
