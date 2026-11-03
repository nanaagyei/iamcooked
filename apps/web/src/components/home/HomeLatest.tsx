import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { IncidentCard } from "@/components/incidents";
import type { IncidentCardProps } from "@/components/incidents/IncidentCard";
import { Button } from "@/components/ui/button";
import { Reveal, SplitText, Parallax, DotBackground } from "@/components/motion";

export function HomeLatest({ incident }: { incident: IncidentCardProps }) {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 py-24 sm:py-28">
      <Parallax speed={20} className="absolute inset-0">
        <DotBackground className="opacity-60" />
      </Parallax>
      <SectionContainer size="wide" className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live intelligence
            </p>
          </Reveal>
          <SplitText as="h2" onScroll text="The latest supply-chain drama, explained calmly." className="mt-4 text-3xl font-semibold tracking-tighter sm:text-5xl" />
          <Reveal delay={0.2}>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-muted-foreground">
              Source-backed briefs written like a friend texting you: what happened, who&apos;s affected, and whether
              you need to do anything today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/incidents/${incident.slug}`}>
                  Read the brief <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/incidents">All incidents</Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal direction="left" distance={40}>
          <div className="[transform:perspective(1200px)_rotateY(-6deg)_rotateX(3deg)] transition-transform duration-700 hover:[transform:perspective(1200px)_rotateY(0)_rotateX(0)]">
            <IncidentCard {...incident} />
          </div>
        </Reveal>
      </SectionContainer>
    </section>
  );
}
