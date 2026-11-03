"use client";

import Link from "next/link";
import { ArrowRight, Upload, ShieldCheck } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { RadarIllustration } from "@/components/ui/radar-illustration";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CopyCommand } from "@/components/check/CopyCommand";
import { SplitText, Reveal, Parallax, GridBackground, GlowOrbs, Terminal, BorderBeam, TextShimmer, type TerminalLine } from "@/components/motion";

const DEMO: TerminalLine[] = [
  { kind: "cmd", text: "npx iamcooked" },
  { kind: "out", text: "  3 lockfiles · 812 packages (npm, PyPI) · 1 MCP config", tone: "muted" },
  { kind: "gap" },
  { kind: "out", text: "  WELL DONE  risk 62/100", tone: "high" },
  { kind: "out", text: "  2 critical · 5 high advisories across 4 packages", tone: "muted" },
  { kind: "gap" },
  { kind: "out", text: "  CRITICAL  next 14.1.0 → 14.2.25", tone: "critical" },
  { kind: "out", text: "            Authorization bypass in Next.js middleware", tone: "bold" },
  { kind: "out", text: "            CVE-2025-29927 · actively exploited (CISA KEV)", tone: "muted" },
  { kind: "out", text: "            $ pnpm add next@^14.2.25", tone: "accent" },
  { kind: "gap" },
  { kind: "out", text: "  CRITICAL  mcp-remote 0.1.10 → 0.1.16  (.cursor/mcp.json)", tone: "critical" },
  { kind: "out", text: "            OS command injection via untrusted MCP servers", tone: "bold" },
  { kind: "gap" },
  { kind: "out", text: "  HIGH      github: hard-coded token in MCP config", tone: "high" },
];

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Parallax speed={40} className="absolute inset-0 -z-10">
        <GridBackground size={64} />
      </Parallax>
      <GlowOrbs className="-z-10" />
      <Parallax speed={-25} className="pointer-events-none absolute inset-y-0 right-[-10%] -z-10 hidden w-[70%] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] lg:block dark:opacity-70">
        <RadarIllustration variant="hero" seed="iamcooked-hero-radar" />
      </Parallax>

      <SectionContainer size="wide" className="grid min-h-[100dvh] items-center gap-14 pb-20 pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-32">
        <div className="max-w-2xl">
          <Reveal blur={false} distance={10}>
            <Link
              href="/tools"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 text-xs backdrop-blur transition-colors hover:border-foreground/25"
            >
              <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">New</span>
              <TextShimmer>Tool Watch: is your AI coding stack in a CVE?</TextShimmer>
              <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" weight="bold" aria-hidden />
            </Link>
          </Reveal>

          <SplitText
            text="Your AI agent installed 247 packages. Are you cooked?"
            highlight={[8]}
            className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl"
          />

          <Reveal delay={0.5}>
            <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              iamcooked checks your dependencies, your MCP servers and the AI tools themselves for CVEs and
              malware. You get plain English and the exact fix command. No panic, no jargon, receipts included.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton size="lg" className="h-12 px-6 shadow-[0_12px_40px_-12px_var(--primary)]" asChild>
                <Link href="/scan">
                  <Upload className="h-4 w-4" weight="bold" aria-hidden />
                  Am I cooked?
                </Link>
              </MagneticButton>
              <Button variant="outline" size="lg" className="h-12 px-6 backdrop-blur" asChild>
                <Link href="/mcp">
                  Check my MCP servers
                  <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CopyCommand command="npx iamcooked" className="w-full max-w-[16rem] bg-card/70 backdrop-blur" />
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-severity-safe" weight="bold" aria-hidden />
                Free · open source · no signup
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.35} direction="left" distance={40} className="relative">
          <Parallax speed={-12}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-tr from-primary/25 via-amber-400/10 to-transparent blur-3xl" aria-hidden />
              <div className="relative rounded-2xl">
                <Terminal lines={DEMO} />
                <BorderBeam duration={7} />
              </div>
              <div className="absolute -bottom-6 -left-4 hidden rounded-xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scanned in</p>
                <p className="text-xl font-semibold tabular-nums">1.8s</p>
              </div>
            </div>
          </Parallax>
        </Reveal>
      </SectionContainer>
    </section>
  );
}
