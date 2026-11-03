"use client";

import {
  FileText,
  MagnifyingGlass,
  UploadSimple,
} from "@phosphor-icons/react";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { SectionContainer } from "@/components/layout";

const features = [
  {
    step: "01",
    title: "Drop your lockfile",
    description:
      "package-lock.json, pnpm-lock.yaml, or yarn.lock. We read the whole dependency tree in seconds, in memory. No repo access, no drama.",
    icon: UploadSimple,
  },
  {
    step: "02",
    title: "We check the receipts",
    description:
      "OSV, GitHub Advisories, and CISA KEV matched against every installed version — not just package names. The real ones, not the rumors.",
    icon: MagnifyingGlass,
  },
  {
    step: "03",
    title: "Find out if you're cooked",
    description:
      "A plain-English verdict, the packages that matter, and copy-paste fixes. No security degree required.",
    icon: FileText,
  },
] as const;

export function FeatureTrailSection() {
  return (
    <section
      className="relative overflow-hidden border-t border-border/60 py-20 lg:py-28"
      aria-labelledby="features-trail-heading"
    >
      <PageBackdrop variant="incident-cta" seed="how-it-works" className="opacity-70" />

      <SectionContainer className="relative z-10">
        <div className="max-w-2xl">
          <p data-reveal className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2
            data-reveal
            id="features-trail-heading"
            className="mt-3 text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            Lockfile in. Vibe check out.
          </h2>
          <p data-reveal className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
            Three steps from &ldquo;I have no idea what&apos;s in here&rdquo; to a
            source-backed plan you can actually run. Built for people who ship
            faster than they audit.
          </p>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:mt-14 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.step}
                data-reveal
                className="group relative bg-card p-6 transition-colors duration-200 hover:bg-card/60 lg:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                    <Icon className="h-5 w-5 text-primary" weight="bold" aria-hidden />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {feature.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </SectionContainer>
    </section>
  );
}
