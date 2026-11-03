import Link from "next/link";
import { MarketingLayout, PageHero, SectionContainer } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
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
    <MarketingLayout overlap>
      <div className="relative overflow-hidden bg-background">
        <PageHero
          eyebrow="Learn"
          title="Security explained for builders who ship fast"
          highlight={[0, 1]}
          description="Plain-English guides without the panic UX. Start with the fundamentals, read close analyses of recent supply-chain incidents, then keep the habits that keep your stack defensible."
        >
          <div className="mt-8">
            <MagneticButton asChild>
              <Link href="/scan">Scan your lockfile</Link>
            </MagneticButton>
          </div>
        </PageHero>

        {featured && (
          <SectionContainer className="relative pb-16 pt-12 lg:pb-20">
            <Reveal>
              <LearnContentCard article={featured} layout="featured" />
            </Reveal>
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
