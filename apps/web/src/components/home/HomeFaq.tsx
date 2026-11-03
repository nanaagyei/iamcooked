import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Reveal, SplitText } from "@/components/motion";

export const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. The CLI, the GitHub Action and the web scanner are free and MIT-licensed. There's no paid tier hiding the useful parts.",
  },
  {
    q: "What leaves my machine?",
    a: "With the CLI, only package names and versions are sent to OSV.dev to look up advisories. Your code, file paths and secrets stay local. MCP configs pasted on the website are analysed in your browser, and only pinned package names and versions are sent to our server.",
  },
  {
    q: "How is this different from npm audit or Dependabot?",
    a: "Those are great, and you should keep them. iamcooked covers every lockfile in a polyglot repo in one pass, checks MCP server configs and the AI coding tools on your machine, flags known-malicious releases and actively-exploited bugs, and explains each finding in plain English with the command for your package manager.",
  },
  {
    q: "Where does the vulnerability data come from?",
    a: "OSV.dev, which aggregates GitHub Security Advisories, the Python Packaging Advisory DB, the Go vulnerability DB, RustSec, RubySec and the OpenSSF malicious-packages feed, plus CISA's Known Exploited Vulnerabilities catalog. Severities come from the advisories, never from an AI model.",
  },
  {
    q: "I'm not technical. Can I still use it?",
    a: "That's who it's for. Drop your lockfile on the Scan page (your AI agent can tell you where it is), and you'll get a verdict, a short explanation and a command you can paste back into your agent.",
  },
  {
    q: "Can I contribute?",
    a: "Please do! Adding a tool to Tool Watch is a one-line PR, and new lockfile parsers and MCP checks are well-scoped first issues. See CONTRIBUTING.md on GitHub.",
  },
];

export function HomeFaq() {
  return (
    <section className="py-24 sm:py-32">
      <SectionContainer className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">FAQ</p>
          </Reveal>
          <SplitText as="h2" onScroll text="Questions people ask before they find out." className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" />
        </div>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="border-border">
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </SectionContainer>
    </section>
  );
}
