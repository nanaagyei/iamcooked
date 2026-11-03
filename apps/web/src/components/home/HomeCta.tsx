import Link from "next/link";
import { Upload, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { SplitText, Reveal, Parallax, DotBackground } from "@/components/motion";

export function HomeCta() {
  return (
    <section className="pb-8">
      <SectionContainer size="wide">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-20 text-center sm:px-12 sm:py-28">
          <Parallax speed={30} className="absolute inset-0 -z-10">
            <DotBackground />
          </Parallax>
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <SplitText as="h2" onScroll text="Stop wondering. Find out if you're cooked." highlight={[6]} className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl" />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              It takes about ten seconds, and the worst case is you learn something before an attacker does.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <MagneticButton size="lg" className="h-12 px-7" asChild>
                <Link href="/scan">
                  <Upload className="h-4 w-4" weight="bold" aria-hidden />
                  Scan my project
                </Link>
              </MagneticButton>
              <Button size="lg" variant="outline" className="h-12 px-7" asChild>
                <a href="https://github.com/nanaagyei/iamcooked" target="_blank" rel="noreferrer">
                  <GithubLogo className="h-4 w-4" weight="bold" aria-hidden />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </SectionContainer>
    </section>
  );
}
