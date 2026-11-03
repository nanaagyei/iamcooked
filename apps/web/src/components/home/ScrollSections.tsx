"use client";

import Link from "next/link";
import { SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { IncidentCard } from "@/components/incidents";
import type { IncidentCardProps } from "@/components/incidents/IncidentCard";
import { NewsletterCapture } from "@/components/forms/NewsletterCapture";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react";
import { TextLink } from "@/components/ui/text-link";
import { useGsapReveal } from "@/components/hooks/use-gsap-reveal";
import { FeatureTrailSection } from "./FeatureTrailSection";

const audiences = [
  {
    title: "Vibe coders",
    description:
      "You let Cursor, Claude, or Bolt install whatever they wanted. We'll quietly tell you which of those packages can actually hurt you.",
    meta: "cursor · claude · bolt",
  },
  {
    title: "Solo founders",
    description:
      "Running a real product with no security team and no time. Find out when your stack has an actual problem — not when it's already on fire.",
    meta: "production · no SOC · no chill",
  },
];

interface ScrollSectionsProps {
  latestIncident: IncidentCardProps | null;
}

export function ScrollSections({ latestIncident }: ScrollSectionsProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ selector: "[data-reveal]" });

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-background">
      {latestIncident && (
        <section className="relative border-t border-border/60 py-20 lg:py-28">
          <SectionContainer>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
              <div data-reveal className="relative z-10">
                <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  Live intelligence
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl">
                  Latest incident brief
                </h2>
                <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
                  The newest supply-chain mess, explained like a friend texting
                  you — calm, source-backed, and minus the scary jargon. Here&apos;s
                  what happened and whether you need to care.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button variant="contrast" asChild>
                    <Link href={`/incidents/${latestIncident.slug}`}>
                      Read full brief
                      <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
                    </Link>
                  </Button>
                  <TextLink href="/incidents" variant="muted">
                    Browse all incidents
                  </TextLink>
                </div>
              </div>
              <div data-reveal className="relative">
                <IncidentCard {...latestIncident} />
              </div>
            </div>
          </SectionContainer>
        </section>
      )}

      <FeatureTrailSection />

      <section className="relative border-t border-border/60 py-20 lg:py-28">
        <SectionContainer>
          <p data-reveal className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Built for
          </p>
          <h2 data-reveal className="mt-3 max-w-2xl text-3xl font-semibold tracking-tighter sm:text-4xl">
            For people who ship faster than they audit
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {audiences.map((audience) => (
              <article
                key={audience.title}
                data-reveal
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors duration-200 hover:border-foreground/20 lg:p-10"
              >
                <PageBackdrop
                  variant="learn-card"
                  seed={audience.title}
                  className="opacity-60"
                />
                <div className="relative z-10">
                  <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                    {audience.meta}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">
                    {audience.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="relative border-t border-border/60 py-20 lg:py-28">
        <SectionContainer>
          <div
            data-reveal
            className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 sm:px-12 lg:px-16"
          >
            <PageBackdrop variant="newsletter" seed="iamcooked-newsletter" />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                Weekly brief
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tighter text-balance">
                Get the &ldquo;you might be cooked&rdquo; email
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                A heads-up only when something actually hits a package in your
                stack. No spam, no doomscrolling, no fear-mongering.
              </p>
              <div className="mt-8 flex justify-center">
                <NewsletterCapture variant="inline" />
              </div>
              <div className="mt-6">
                <MagneticButton variant="contrast" asChild>
                  <Link href="/scan">Or scan your project now</Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
