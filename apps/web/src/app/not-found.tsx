import Link from "next/link";
import { House, MagnifyingGlass, Robot } from "@phosphor-icons/react/dist/ssr";
import { MarketingLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { GridBackground, Reveal, SplitText, Parallax } from "@/components/motion";

export default function NotFound() {
  return (
    <MarketingLayout overlap>
      <div className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-32 text-center">
        <GridBackground className="-z-10" />
        <Parallax speed={-30} className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none">
          <p aria-hidden className="text-[40vw] font-bold leading-none tracking-tight text-foreground/[0.05] sm:text-[28vw]">
            404
          </p>
        </Parallax>
        <Reveal blur={false}>
          <p className="font-mono text-sm uppercase tracking-widest text-primary">404 · not found</p>
        </Reveal>
        <SplitText text="This page got cooked." highlight={[3]} className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl" />
        <Reveal delay={0.3}>
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">
            The link may be wrong, or the page moved. Your dependencies might still be fine, so why not check?
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">
                <House className="h-4 w-4" weight="bold" aria-hidden />
                Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/scan">
                <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden />
                Scan a project
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/tools">
                <Robot className="h-4 w-4" weight="bold" aria-hidden />
                Tool Watch
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </MarketingLayout>
  );
}
