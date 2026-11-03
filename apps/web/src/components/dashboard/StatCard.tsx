import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Icon } from "@phosphor-icons/react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: Icon;
  href?: string;
  tone?: "default" | "critical" | "high" | "safe";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-primary",
  critical: "text-severity-critical",
  high: "text-severity-high",
  safe: "text-severity-safe",
};

export function StatCard({ label, value, hint, icon: IconCmp, href, tone = "default" }: StatCardProps) {
  const inner = (
    <Card className="group h-full p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("rounded-lg bg-muted p-1.5", toneStyles[tone])}>
          <IconCmp className="h-[1.05rem] w-[1.05rem]" weight="bold" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
