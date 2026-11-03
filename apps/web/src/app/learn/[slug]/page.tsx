import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import {
  getLearnArticle,
  learnArticles,
  learnCategoryLabels,
  learnCategoryImages,
} from "@/lib/learn-content";
import { TextLink } from "@/components/ui/text-link";

export function generateStaticParams() {
  return learnArticles.map((a) => ({ slug: a.slug }));
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();

  const related = learnArticles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-background">
        <section className="relative min-h-[52vh] overflow-hidden lg:min-h-[58vh]">
          <Image
            src={learnCategoryImages[article.category]}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <SectionContainer className="relative flex min-h-[52vh] flex-col justify-end pb-16 pt-28 lg:min-h-[58vh] lg:pb-20">
          <TextLink href="/learn" variant="muted">
            All guides
          </TextLink>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-primary">
              {article.kind === "guide" ? "Guide" : "Article"} ·{" "}
              {learnCategoryLabels[article.category]} · {article.readTime}
              {article.dateline ? ` · ${article.dateline}` : ""}
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
          </SectionContainer>
        </section>

        <SectionContainer className="grid gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20 lg:py-24">
          <article className="min-w-0">
            <div className="space-y-20">
              {article.sections.map((section, index) => (
                <section
                  key={section.heading}
                  id={section.heading.toLowerCase().replace(/\s+/g, "-")}
                  className="scroll-mt-28"
                >
                  <div
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${
                      index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {section.heading}
                      </h2>
                      <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                        {section.body}
                      </p>
                    </div>
                    <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-[var(--shadow-diffusion)]">
                      <PageBackdrop
                        variant="learn-card"
                        seed={`learn-${slug}-${index}`}
                        className="opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {article.sources && article.sources.length > 0 && (
              <div className="mt-20 border-t border-border pt-8">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Sources
                </p>
                <ul className="mt-4 space-y-3">
                  {article.sources.map((source) => (
                    <li key={source.url} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="relative mt-20 overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 shadow-[var(--shadow-diffusion)]">
              <PageBackdrop variant="incident-cta" seed={`learn-cta-${slug}`} className="opacity-50" />
              <div className="absolute inset-0 bg-card/98" />
              <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-semibold tracking-tight">
                  Check if this affects your project
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Upload your lockfile to get a personalized risk report in under a minute.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <MagneticButton variant="contrast" asChild>
                    <Link href="/scan">Scan your project</Link>
                  </MagneticButton>
                  <Button variant="outline" asChild>
                    <Link href="/incidents">Browse incidents</Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              On this page
            </p>
            <nav className="mt-3 space-y-2">
              {article.sections.map((section) => (
                <a
                  key={section.heading}
                  href={`#${section.heading.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
            {related.length > 0 && (
              <div className="mt-10 space-y-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Related guides
                </p>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/learn/${r.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={learnCategoryImages[r.category]}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="p-3 text-sm font-medium leading-snug">{r.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
