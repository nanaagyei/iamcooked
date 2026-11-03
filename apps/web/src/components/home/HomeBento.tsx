import Link from "next/link";
import { ArrowRight, FileMagnifyingGlass, Plugs, Robot, GitPullRequest, EnvelopeSimple, LockKey } from "@phosphor-icons/react/dist/ssr";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { SpotlightCard, Stagger, StaggerItem, SplitText, Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

function CardHead({ icon: Icon, eyebrow, title, body }: { icon: typeof Plugs; eyebrow: string; title: string; body: string }) {
  return (
    <div>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
        <Icon className="h-5 w-5 text-primary" weight="duotone" aria-hidden />
      </span>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function More({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium after:absolute after:inset-0">
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover/spot:translate-x-1" weight="bold" aria-hidden />
    </Link>
  );
}

const MCP_SNIPPET = [
  { t: '"github": {', c: "" },
  { t: '  "command": "npx",', c: "" },
  { t: '  "args": ["-y", "@mcp/server-github"],', c: "bg-severity-medium/15 text-severity-medium" },
  { t: '  "env": { "TOKEN": "ghp_9f…2c" }', c: "bg-severity-critical/15 text-severity-critical" },
  { t: "}", c: "" },
];

const TOOLS = [
  { name: "Claude Code", s: "High · 18d", tone: "bg-severity-high" },
  { name: "Next.js", s: "Critical · 12d", tone: "bg-severity-critical" },
  { name: "MCP Python SDK", s: "Medium · 6d", tone: "bg-severity-medium" },
  { name: "Supabase JS", s: "Quiet", tone: "bg-severity-safe" },
];

const ECOS = ["npm", "pnpm", "yarn", "bun", "pip", "poetry", "uv", "go", "cargo", "bundler", "composer"];

export function HomeBento() {
  return (
    <section className="relative py-24 sm:py-32">
      <SectionContainer size="wide">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Three ways to get cooked</p>
          </Reveal>
          <SplitText as="h2" onScroll text="Your code, your agent's plugins, and the tools themselves." highlight={[4, 5]} className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl" />
          <Reveal delay={0.2}>
            <p className="mt-4 text-muted-foreground">
              Vibecoding moved the attack surface. It&apos;s not only your dependencies anymore. It&apos;s the MCP
              servers your agent launches and the agent CLIs you installed last Tuesday.
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid auto-rows-[minmax(0,auto)] gap-4 md:grid-cols-6">
          {/* MCP — large */}
          <StaggerItem className="md:col-span-4">
            <SpotlightCard className="h-full p-7">
              <div className="grid h-full gap-8 lg:grid-cols-2">
                <div className="flex flex-col">
                  <CardHead icon={Plugs} eyebrow="Your agent's plugins" title="MCP config check" body="Vulnerable servers, leaked API keys, unpinned npx -y installs, plain-HTTP remotes and whole-disk file access. Runs in your browser." />
                  <More href="/mcp" label="Check my config" />
                </div>
                <div className="relative self-center rounded-xl border border-border bg-[#0f0d0b] p-4 font-mono text-[12px] leading-relaxed text-white/80 shadow-2xl">
                  {MCP_SNIPPET.map((l, i) => (
                    <div key={i} className={cn("-mx-2 whitespace-pre rounded px-2", l.c)}>
                      {l.t}
                    </div>
                  ))}
                  <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 font-sans text-[11px]">
                    <p className="text-severity-critical">● Hard-coded GitHub token</p>
                    <p className="text-severity-medium">● Unpinned package runs on every launch</p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </StaggerItem>

          {/* Tool Watch */}
          <StaggerItem className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <CardHead icon={Robot} eyebrow="Your tools" title="Tool Watch" body="Live CVE status for Claude Code, Codex, MCP SDKs, Next.js and more." />
              <ul className="mt-5 space-y-2">
                {TOOLS.map((t) => (
                  <li key={t.name} className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-xs">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className={cn("h-1.5 w-1.5 rounded-full", t.tone)} />
                      {t.name}
                    </span>
                    <span className="text-muted-foreground">{t.s}</span>
                  </li>
                ))}
              </ul>
              <More href="/tools" label="Open Tool Watch" />
            </SpotlightCard>
          </StaggerItem>

          {/* Scan */}
          <StaggerItem className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <CardHead icon={FileMagnifyingGlass} eyebrow="Your code" title="Every lockfile" body="CVEs, malicious releases and actively-exploited bugs with the exact fix command." />
              <div className="mt-5 flex flex-wrap gap-1.5">
                {ECOS.map((e) => (
                  <span key={e} className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {e}
                  </span>
                ))}
              </div>
              <More href="/scan" label="Scan a lockfile" />
            </SpotlightCard>
          </StaggerItem>

          {/* CI */}
          <StaggerItem className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <CardHead icon={GitPullRequest} eyebrow="Your pipeline" title="One line in CI" body="Fail on critical CVEs or malware, upload SARIF, get a plain-English job summary." />
              <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed">
                <span className="text-muted-foreground">- uses: </span>nanaagyei/iamcooked@main{"\n"}
                <span className="text-muted-foreground">  with: </span>
                {"{ fail-on: high }"}
              </pre>
            </SpotlightCard>
          </StaggerItem>

          {/* Alerts */}
          <StaggerItem className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <CardHead icon={EnvelopeSimple} eyebrow="Your inbox" title="Alerts that matter" body="Watch any package or tool. We email you the day a new advisory lands, and stay quiet otherwise." />
              <div className="mt-5 rounded-lg border border-border bg-background/60 p-3 text-xs">
                <p className="font-medium">Critical CVE in mcp-remote</p>
                <p className="mt-0.5 text-muted-foreground">Fixed in 0.1.16 · run npx iamcooked doctor</p>
              </div>
            </SpotlightCard>
          </StaggerItem>

          {/* Privacy — wide */}
          <StaggerItem className="md:col-span-6">
            <SpotlightCard className="p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                    <LockKey className="h-5 w-5 text-primary" weight="duotone" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Private by default, open by design</h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Lockfiles are parsed in memory and never stored. MCP configs never leave your browser. The CLI only
                      sends package names and versions. Every line of it is MIT-licensed on GitHub.
                    </p>
                  </div>
                </div>
                <Link href="/security" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium after:absolute after:inset-0">
                  How we handle data
                  <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
                </Link>
              </div>
            </SpotlightCard>
          </StaggerItem>
        </Stagger>
      </SectionContainer>
    </section>
  );
}
