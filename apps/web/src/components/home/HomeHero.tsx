"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Upload, ArrowRight } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { RadarIllustration } from "@/components/ui/radar-illustration";
import { usePrefersReducedMotion } from "@/components/hooks/use-prefers-reduced-motion";
import { SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { ProductPreview } from "./ProductPreview";

export function HomeHero() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-text > *", {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.fromTo(
        ".hero-radar",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" },
      );
      gsap.from(".hero-preview", {
        y: 28,
        opacity: 0,
        duration: 0.95,
        delay: 0.2,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={heroRef} className="relative min-h-[80dvh] overflow-hidden">
      <PageBackdrop variant="hero" seed="iamcooked-hero" />
      <div className="hero-radar absolute inset-0 [mask-image:linear-gradient(105deg,transparent,black_60%)]">
        <RadarIllustration
          variant="hero"
          seed="iamcooked-hero-radar"
          className="opacity-60 dark:opacity-80"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent"
        aria-hidden
      />

      <SectionContainer className="relative z-10 grid min-h-[80dvh] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="hero-text max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            for the vibe-coding generation
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            Your AI agent installed 247 packages. Are you cooked?
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            You shipped fast. Real fast. iamcooked does the part you skipped —
            it checks what your stack actually pulled in, tells you in plain
            English whether you&apos;re fine or fried, and hands you the fix. No
            panic, no jargon, receipts included.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton size="lg" className="h-12 px-6" asChild>
              <Link href="/scan">
                <Upload className="h-4 w-4" weight="bold" aria-hidden />
                Am I cooked?
              </Link>
            </MagneticButton>
            <Button variant="contrast" size="lg" className="h-12 px-6" asChild>
              <Link href="/incidents">
                See the latest drama
                <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-6 font-mono text-xs text-muted-foreground/80">
            OSV · GitHub Advisories · CISA KEV — every verdict is source-backed, never vibes
          </p>
        </div>

        <div className="hero-preview relative">
          <ProductPreview />
        </div>
      </SectionContainer>
    </section>
  );
}
