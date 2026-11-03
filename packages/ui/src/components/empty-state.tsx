"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  className,
  children,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[2rem] border border-border/60 bg-card px-6 py-16 text-center shadow-[var(--shadow-diffusion)]",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/50">
        {icon ?? (
          <span className="text-2xl text-muted-foreground" aria-hidden>
            ◇
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
