import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingLayout, PageHero, SectionContainer } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { LegalToc } from "./LegalToc";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/security", label: "Security" },
];

export function LegalPage({
  eyebrow = "Legal",
  title,
  intro,
  updated,
  summary,
  sections,
  current,
}: {
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  updated: string;
  summary: string[];
  sections: LegalSection[];
  current: string;
}) {
  return (
    <MarketingLayout overlap>
      <PageHero eyebrow={eyebrow} title={title} description={intro} size="compact">
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={
                l.href === current
                  ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
                  : "rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {l.label}
            </Link>
          ))}
          <span className="ml-1 font-mono text-[11px] text-muted-foreground">Last updated {updated}</span>
        </div>
      </PageHero>

      <SectionContainer className="grid gap-12 py-16 lg:grid-cols-[15rem_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} />
          </div>
        </aside>

        <div className="min-w-0">
          <Reveal>
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary">The short version</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {summary.map((s) => (
                  <li key={s} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="legal-prose mt-12 space-y-14">
            {sections.map((s, i) => (
              <Reveal key={s.id} as="section">
                <h2 id={s.id} className="flex items-baseline gap-3 text-2xl font-semibold tracking-tight text-foreground">
                  <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4">{s.body}</div>
              </Reveal>
            ))}
          </div>

          <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
            Questions about this page? Open a{" "}
            <a className="text-primary underline underline-offset-4" href="https://github.com/nanaagyei/iamcooked/discussions">
              GitHub discussion
            </a>{" "}
            or, for anything sensitive, use{" "}
            <a className="text-primary underline underline-offset-4" href="https://github.com/nanaagyei/iamcooked/security/advisories/new">
              private reporting
            </a>
            .
          </p>
        </div>
      </SectionContainer>
    </MarketingLayout>
  );
}
