"use client";

import { useEffect, useRef } from "react";
import { FileMagnifyingGlass, Translate, Wrench, BellRinging } from "@phosphor-icons/react";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { SplitText } from "@/components/motion";

const STEPS = [
  {
    n: "01",
    icon: FileMagnifyingGlass,
    title: "Detect",
    body: "We read every lockfile, every MCP config and every agent CLI you've installed, and match exact versions. Not just “you use lodash somewhere”.",
    chips: ["pnpm-lock.yaml", "uv.lock", ".cursor/mcp.json", "claude 2.1.42"],
  },
  {
    n: "02",
    icon: Translate,
    title: "Explain",
    body: "Each advisory becomes one sentence a human can act on: what it is, whether you depend on it directly, if it's dev-only, and if attackers are already using it.",
    chips: ["CVSS 9.1", "actively exploited", "dev-only", "transitive"],
  },
  {
    n: "03",
    icon: Wrench,
    title: "Fix",
    body: "The exact command for your package manager on your release line, plus override snippets for transitive deps and a heads-up before major bumps.",
    chips: ["pnpm add next@^14.2.25", "uv lock --upgrade-package", "overrides"],
  },
  {
    n: "04",
    icon: BellRinging,
    title: "Watch",
    body: "Put it in CI with one line, watch your tools on Tool Watch, and get an email the day a new CVE lands in something you use.",
    chips: ["--ci", "SARIF", "daily alerts"],
  },
];

/** Pinned horizontal-scroll story on desktop; a simple vertical list on mobile/reduced motion. */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth + 96;
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      t.querySelectorAll<HTMLElement>("[data-step]").forEach((card) => {
        gsap.from(card.querySelector("[data-num]"), {
          yPercent: 60,
          opacity: 0,
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 85%", end: "left 40%", scrub: true },
        });
      });
      return () => ScrollTrigger.getAll().forEach((s) => s.vars.containerAnimation === tween && s.kill());
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden py-24 lg:flex lg:h-[100dvh] lg:flex-col lg:justify-center lg:py-0">
      <SectionContainer size="wide" className="w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">How it works</p>
            <SplitText as="h2" onScroll text="From “is this bad?” to fixed, in one screen." className="mt-3 max-w-2xl text-3xl font-semibold tracking-tighter sm:text-5xl" />
          </div>
          <div className="hidden h-1 w-48 overflow-hidden rounded-full bg-muted lg:block">
            <div ref={bar} className="h-full origin-left scale-x-0 rounded-full bg-primary" />
          </div>
        </div>
      </SectionContainer>

      <div ref={track} className="mt-12 flex flex-col gap-5 px-4 sm:px-6 lg:w-max lg:flex-row lg:gap-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-24">
        {STEPS.map(({ n, icon: Icon, title, body, chips }) => (
          <article
            key={n}
            data-step
            className="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 lg:w-[30rem]"
          >
            <span data-num className="pointer-events-none absolute -right-4 -top-10 select-none text-[11rem] font-bold leading-none tracking-tighter text-foreground/[0.04]">
              {n}
            </span>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Icon className="h-6 w-6" weight="duotone" aria-hidden />
            </span>
            <p className="mt-8 font-mono text-xs text-muted-foreground">Step {n}</p>
            <h3 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{body}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              {chips.map((c) => (
                <span key={c} className="rounded-full border border-border bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
