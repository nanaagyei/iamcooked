"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react";
import { TextLink } from "@/components/ui/text-link";
import { Badge } from "@/components/ui/badge";
import {
  SeverityBadge,
  ConfidenceBadge,
  PackageBadge,
} from "@/components/badges";
import type { Severity, Confidence } from "@prisma/client";

interface AffectedPackagePreview {
  packageName: string;
  ecosystem: string;
}

export interface IncidentCardProps {
  slug: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  ecosystem: string;
  incidentType: string;
  beginnerTldr: string;
  affectedPackages: AffectedPackagePreview[];
  publishedAt: string | null;
  sourceCount: number;
}

function relativeTime(dateString: string | null): string {
  if (!dateString) return "Unpublished";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `${diffHours}h ago`;
  return "just now";
}

const severitySurface: Record<string, string> = {
  CRITICAL: "bg-severity-critical/8 ring-severity-critical/20",
  HIGH: "bg-severity-high/8 ring-severity-high/20",
  MEDIUM: "bg-severity-medium/8 ring-severity-medium/20",
  LOW: "bg-severity-low/8 ring-severity-low/20",
  INFO: "bg-severity-info/8 ring-severity-info/20",
  UNKNOWN: "bg-muted/50 ring-border/40",
};

export function IncidentCard({
  slug,
  title,
  severity,
  confidence,
  ecosystem,
  incidentType: _incidentType,
  beginnerTldr,
  affectedPackages,
  publishedAt,
  sourceCount,
}: IncidentCardProps) {
  const visiblePackages = affectedPackages.slice(0, 3);
  const remaining = affectedPackages.length - 3;

  return (
    <motion.article layout layoutId={`incident-${slug}`}>
      <div
        className={`group relative overflow-hidden rounded-2xl p-6 ring-1 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-diffusion)] active:scale-[0.995] ${severitySurface[severity] ?? severitySurface.UNKNOWN}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={severity} />
          <ConfidenceBadge confidence={confidence} />
        </div>

        <Link href={`/incidents/${slug}`} className="group/link mt-4 block">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground underline decoration-transparent underline-offset-4 transition-colors group-hover/link:decoration-primary/50">
            {title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {beginnerTldr}
        </p>

        {affectedPackages.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {visiblePackages.map((pkg) => (
              <PackageBadge
                key={pkg.packageName}
                name={pkg.packageName}
                ecosystem={pkg.ecosystem}
              />
            ))}
            {remaining > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                +{remaining} more
              </span>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="border-border/60 bg-background/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {ecosystem}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <CalendarBlank className="h-3 w-3" weight="bold" aria-hidden />
              {relativeTime(publishedAt)}
            </span>
            <span className="tabular-nums">{sourceCount} sources</span>
          </div>

          <TextLink href={`/incidents/${slug}`} variant="inline" size="sm" className="gap-1">
            Read more
            <ArrowRight className="h-3 w-3" weight="bold" aria-hidden />
          </TextLink>
        </div>
      </div>
    </motion.article>
  );
}
