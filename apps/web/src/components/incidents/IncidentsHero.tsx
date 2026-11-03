import { SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";

interface IncidentsHeroProps {
  total: number;
}

export function IncidentsHero({ total }: IncidentsHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <PageBackdrop variant="incident-hero" seed="iamcooked-incidents-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
      </div>
      <SectionContainer className="relative py-20 lg:py-28">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Threat intelligence
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tighter sm:text-5xl">
          Incidents affecting your stack
        </h1>
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          Curated briefs on vulnerabilities and supply-chain events across npm and
          adjacent ecosystems. Filter by severity, search packages, and read source-backed
          guidance.
        </p>
        <p className="mt-6 font-mono text-sm tabular-nums text-muted-foreground">
          {total} published brief{total === 1 ? "" : "s"}
        </p>
      </SectionContainer>
    </section>
  );
}
