"use client";

import Link from "next/link";
import { ArrowRight, Upload, ShieldCheck } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CopyCommand } from "@/components/check/CopyCommand";
import SplitFlapText from "@/components/kokonutui/split-flap-text";
import { SplitText, Reveal, Parallax, Terminal, VantaNet, ScrambleText, type TerminalLine } from "@/components/motion";

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
    <section className="relative isolate overflow-hidden border-b border-border/60">
      <VantaNet className="-z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />

      <SectionContainer size="wide" className="pointer-events-none grid min-h-[100dvh] items-center gap-14 pb-20 pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-32 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div className="max-w-2xl">
          <Reveal blur={false} distance={10}>
            <Link
              href="/tools"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-xs transition-colors hover:border-primary/50"
            >
              <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground">New</span>
              <ScrambleText text="Tool Watch: is your AI stack in a CVE?" className="font-mono text-muted-foreground" />
              <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" weight="bold" aria-hidden />
            </Link>
          </Reveal>

          <SplitText
            text="Your AI agent installed 247 packages. Are you cooked?"
            highlight={[8]}
            className="mt-6 text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]"
          />

          <Reveal delay={0.5}>
            <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              iamcooked checks your dependencies, your MCP servers and the AI tools themselves for CVEs and
              malware. You get plain English and the exact fix command. No panic, no jargon, receipts included.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton size="lg" className="h-12 px-6" asChild>
                <Link href="/scan">
                  <Upload className="h-4 w-4" weight="bold" aria-hidden />
                  Am I cooked?
                </Link>
              </MagneticButton>
              <Button variant="outline" size="lg" className="h-12 bg-card px-6" asChild>
                <Link href="/mcp">
                  Check my MCP servers
                  <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CopyCommand command="npx iamcooked" className="w-full max-w-[16rem] bg-card" />
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
              <Terminal lines={DEMO} />
              <div className="absolute -bottom-10 right-6 hidden rounded-xl border border-border bg-card p-3 shadow-xl sm:block">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Verdict board</p>
                <SplitFlapText
                  words={["NOT COOKED", "TOASTY", "WELL DONE", "BURNT"]}
                  interval={2600}
                  length={10}
                  className="text-lg sm:text-lg"
                />
              </div>
            </div>
          </Parallax>
        </Reveal>
      </SectionContainer>
    </section>
  );
}
