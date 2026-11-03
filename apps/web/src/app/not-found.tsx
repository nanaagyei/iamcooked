import Link from "next/link";
import { MarketingLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Compass, House, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <MarketingLayout>
      <div className="flex min-h-[65dvh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
          <Compass className="h-8 w-8 text-muted-foreground" weight="bold" aria-hidden />
        </div>
        <p className="mt-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">
          404 · Not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          This page does not exist
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          The URL may be wrong, or the page was moved or removed. Head back to the homepage to
          continue exploring iamcooked.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">
              <House className="h-4 w-4" weight="bold" aria-hidden />
              Back to homepage
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/incidents">
              <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden />
              Browse incidents
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/scan">Scan your project</Link>
          </Button>
        </div>
      </div>
    </MarketingLayout>
  );
}
