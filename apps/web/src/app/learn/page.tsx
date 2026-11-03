import Link from "next/link";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { RadarIllustration } from "@/components/ui/radar-illustration";
import { LearnContentCard } from "@/components/learn/LearnContentCard";
import { LearnContentGrid } from "@/components/learn/LearnContentGrid";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  getFeaturedLearnArticle,
  learnArticles,
} from "@/lib/learn-content";

export default function LearnIndexPage() {
  const featured = getFeaturedLearnArticle();

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-background">
        <section className="relative overflow-hidden border-b border-border/60">
          <PageBackdrop variant="learn-hero" seed="learn-hub-hero" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 [mask-image:linear-gradient(to_left,black,transparent)] lg:block">
            <RadarIllustration
              variant="ambient"
              seed="learn-hub-radar"
              className="opacity-50 dark:opacity-70"
            />
          </div>
          <SectionContainer className="relative py-20 lg:py-28">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Learn
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tighter sm:text-5xl">
              Guides and articles for builders who ship fast
            </h1>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
              Plain-English security education without the panic UX. Start with
              fundamentals, read close analyses of recent npm incidents, then keep
              the habits that keep your stack defensible.
            </p>
            <div className="mt-8">
              <MagneticButton variant="contrast" asChild>
                <Link href="/scan">Scan your lockfile</Link>
              </MagneticButton>
            </div>
          </SectionContainer>
        </section>

        {featured && (
          <SectionContainer className="relative pb-16 pt-4 lg:pb-20">
            <LearnContentCard article={featured} layout="featured" />
          </SectionContainer>
        )}

        <SectionContainer className="relative pb-20 lg:pb-28">
          <LearnContentGrid
            articles={learnArticles}
            featuredSlug={featured?.slug}
          />
        </SectionContainer>

        <SectionContainer className="relative pb-24 lg:pb-32">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 sm:px-10 shadow-[var(--shadow-diffusion)]">
            <PageBackdrop variant="newsletter" seed="learn-hub-cta" className="opacity-60" />
            <div className="absolute inset-0 bg-card/98" />
            <div className="relative z-10 mx-auto max-w-lg text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Put the guides into practice
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Upload your lockfile and see which incidents and CVEs match your
                installed versions.
              </p>
              <div className="mt-6 flex justify-center">
                <MagneticButton variant="contrast" asChild>
                  <Link href="/scan">Start a free scan</Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
