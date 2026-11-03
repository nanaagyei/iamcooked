import type { Metadata } from "next";
import Link from "next/link";
import { GithubLogo, Heart, Code, Plugs, Robot, Translate, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MarketingLayout, PageHero, SectionContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CopyCommand } from "@/components/check/CopyCommand";
import { Reveal, SplitText, SpotlightCard, Stagger, StaggerItem, Parallax } from "@/components/motion";

export const metadata: Metadata = {
  title: "About & open source",
  description: "Why iamcooked exists, the principles behind it, and how to contribute.",
};

const PRINCIPLES = [
  { title: "Source-backed", body: "Every finding links to an advisory. AI summarises; it never decides severity." },
  { title: "Beginner-first", body: "Plain English first, technical depth one click away. No security degree required." },
  { title: "Actionable", body: "Every finding ends in a command or a concrete next step, for your package manager." },
  { title: "Private by default", body: "Names and versions only. Lockfiles in memory. MCP configs never leave the browser." },
  { title: "No panic", body: "Calm, precise copy. Being cooked is fixable, and we'll show you how." },
  { title: "Open", body: "MIT-licensed, built in public, and shaped by the people who use it." },
];

const WAYS = [
  { icon: Robot, title: "Add a tool to Tool Watch", body: "One line in packages/core/src/tools.ts. The best first PR.", href: "https://github.com/nanaagyei/iamcooked/issues/new?template=tool-request.yml" },
  { icon: Code, title: "Write a lockfile parser", body: "Maven, Gradle, NuGet, Swift and Pub are all up for grabs.", href: "https://github.com/nanaagyei/iamcooked/blob/main/CONTRIBUTING.md#adding-a-lockfile-format" },
  { icon: Plugs, title: "Add an MCP check", body: "New client config locations or new risky patterns to flag.", href: "https://github.com/nanaagyei/iamcooked/blob/main/CONTRIBUTING.md#adding-an-mcp-client-or-risk-check" },
  { icon: Translate, title: "Explain an incident", body: "Write a beginner-friendly brief for the Learn section.", href: "https://github.com/nanaagyei/iamcooked/blob/main/CONTRIBUTING.md" },
];

export default function AboutPage() {
  return (
    <MarketingLayout overlap>
      <PageHero
        eyebrow="About"
        title="Security for people who ship faster than they audit."
        highlight={[5, 6, 7]}
        description="AI agents made shipping software ten times faster. They also pick packages you never reviewed, wire up MCP servers you never read, and ship CVEs of their own. iamcooked closes that gap, in the open."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href="https://github.com/nanaagyei/iamcooked" target="_blank" rel="noreferrer">
              <GithubLogo className="h-4 w-4" weight="bold" aria-hidden /> View on GitHub
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://github.com/nanaagyei/iamcooked/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">
              Contribute
            </a>
          </Button>
        </div>
      </PageHero>

      <SectionContainer className="py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">The problem</p>
            <SplitText as="h2" onScroll text="The information exists. Nobody reads it while shipping." className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" />
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <Reveal>
              <p>
                CVEs land in OSV and GitHub Advisories. Malicious packages get flagged by the OpenSSF. CISA tracks which
                bugs are being exploited right now. Vendor blogs and Reddit threads fill in the rest.
              </p>
            </Reveal>
            <Reveal>
              <p>
                But if you&apos;re a solo founder vibecoding with Cursor at 1am, you&apos;re not reading any of it. And the
                tools that do read it were built for security teams: dense dashboards, jargon, and alerts for packages
                you&apos;ve never heard of.
              </p>
            </Reveal>
            <Reveal>
              <p className="text-foreground">
                iamcooked answers four questions, in plain English: <strong>Am I affected? How bad is it? What do I
                run? Will I hear about the next one?</strong>
              </p>
            </Reveal>
          </div>
        </div>
      </SectionContainer>

      <section className="border-y border-border/60 bg-muted/20 py-24">
        <SectionContainer>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Principles</p>
          <SplitText as="h2" onScroll text="Six rules we don't break." className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" />
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <StaggerItem key={p.title}>
                <SpotlightCard className="h-full p-6">
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </SectionContainer>
      </section>

      <SectionContainer className="py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <Heart className="h-3.5 w-3.5" weight="fill" aria-hidden /> Open source
            </p>
            <SplitText as="h2" onScroll text="Built in public. Better with you." className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" />
            <Reveal delay={0.1}>
              <p className="mt-4 text-muted-foreground">
                The CLI, the engine, the GitHub Action and this website are MIT-licensed. Run it locally in thirty
                seconds:
              </p>
              <CopyCommand command="git clone https://github.com/nanaagyei/iamcooked && pnpm i" className="mt-5" />
            </Reveal>
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {WAYS.map(({ icon: Icon, title, body, href }) => (
              <StaggerItem key={title}>
                <a href={href} target="_blank" rel="noreferrer" className="group block h-full rounded-2xl border border-border bg-card p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-foreground/25">
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-primary" weight="duotone" aria-hidden />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SectionContainer>

      <SectionContainer className="pb-8">
        <Parallax speed={10}>
          <Reveal>
            <p className="mx-auto max-w-3xl text-center text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
              &ldquo;You shipped fast. Real fast. We do the part you skipped.&rdquo;
            </p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Built with data from <Link href="https://osv.dev" className="underline underline-offset-4">OSV.dev</Link>, GitHub
              Advisories and CISA KEV.
            </p>
          </Reveal>
        </Parallax>
      </SectionContainer>
    </MarketingLayout>
  );
}
