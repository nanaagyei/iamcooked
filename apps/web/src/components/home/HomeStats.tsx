import { TOOL_CATALOG } from "@iamcooked/core";
import { SUPPORTED_LOCKFILES } from "@iamcooked/scanner";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Stagger, StaggerItem } from "@/components/motion";

export function HomeStats() {
  const stats = [
    { value: SUPPORTED_LOCKFILES.length, suffix: "", label: "lockfile formats", note: "npm to Composer" },
    { value: 6, suffix: "", label: "ecosystems", note: "JS · Python · Go · Rust · Ruby · PHP" },
    { value: TOOL_CATALOG.length, suffix: "", label: "AI tools watched", note: "agents, MCP, SDKs" },
    { value: 0, suffix: "", label: "API keys needed", note: "names + versions only" },
  ];
  return (
    <section className="relative border-y border-border/60 bg-muted/20">
      <SectionContainer size="wide">
        <Stagger className="grid grid-cols-2 divide-border/60 lg:grid-cols-4 lg:divide-x">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="px-4 py-10 text-center sm:py-12">
              <p className="text-4xl font-semibold tracking-tighter sm:text-5xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium">{s.label}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{s.note}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </SectionContainer>
    </section>
  );
}
