import { PageHero } from "@/components/layout/PageHero";

interface IncidentsHeroProps {
  total: number;
}

export function IncidentsHero({ total }: IncidentsHeroProps) {
  return (
    <PageHero
      eyebrow="Threat intelligence"
      title="Supply-chain drama, minus the panic"
      highlight={[0, 1]}
      description="Curated, source-backed briefs on vulnerabilities, malicious packages and compromised maintainers across npm, PyPI and beyond. Filter by severity, search packages, and read what to actually do."
    >
      <p className="mt-6 font-mono text-sm tabular-nums text-muted-foreground">
        {total} published brief{total === 1 ? "" : "s"}
      </p>
    </PageHero>
  );
}
