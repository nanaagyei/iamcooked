"use client";

import type { CSSProperties } from "react";
import {
  CisaIcon,
  GitHubIcon,
  NpmIcon,
  NvdIcon,
  OsvIcon,
  SnykIcon,
  VendorIcon,
} from "./trust-icons";
import { trustSources } from "./trust-sources";

const iconMap = {
  osv: OsvIcon,
  github: GitHubIcon,
  cisa: CisaIcon,
  nvd: NvdIcon,
  npm: NpmIcon,
  snyk: SnykIcon,
  vendors: VendorIcon,
} as const;

function TrustChip({ id, label }: { id: string; label: string }) {
  const Icon = iconMap[id as keyof typeof iconMap] ?? VendorIcon;

  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]">
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="whitespace-nowrap text-xs font-medium tracking-tight text-foreground">
        {label}
      </span>
    </div>
  );
}

export function TrustMarquee() {
  return (
    <section
      aria-label="Trusted data sources"
      className="relative z-20 border-y border-border/50 bg-background/40 py-6"
    >
      <p className="mb-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
        Cross-referenced against trusted sources
      </p>
      <div className="marquee-group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div
          className="flex w-max animate-marquee items-center gap-4"
          style={{ "--marquee-duration": "44s" } as CSSProperties}
        >
          {/* Two identical groups so the -50% translate loops seamlessly. */}
          {[0, 1].map((group) => (
            <div
              key={group}
              className="flex shrink-0 items-center gap-4"
              aria-hidden={group === 1}
            >
              {trustSources.map((source) => (
                <TrustChip key={`${group}-${source.id}`} id={source.id} label={source.label} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
