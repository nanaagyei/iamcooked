import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { RadarIllustration } from "@/components/ui/radar-illustration";
import { ScanUploadDropzone } from "@/components/scan/ScanUploadDropzone";
import { ScanStepper } from "@/components/scan/ScanStepper";

export default function ScanPage() {
  return (
    <MarketingLayout>
      <section className="relative min-h-[36dvh] overflow-hidden border-b border-border">
        <PageBackdrop variant="scan" seed="iamcooked-scan" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 [mask-image:linear-gradient(to_left,black,transparent)] lg:block">
          <RadarIllustration variant="ambient" seed="scan-radar" className="opacity-50 dark:opacity-70" />
        </div>
        <SectionContainer className="relative py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Scan
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tighter leading-[1.05] sm:text-5xl">
              Scan your project
            </h1>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-foreground">
              Upload a lockfile from npm, pnpm, Yarn, Bun, pip, Poetry, uv, Go, Cargo, Bundler or
              Composer. We check every package against OSV, CISA KEV and curated incident reports.
              The file is processed in memory and never stored.
            </p>
          </div>
        </SectionContainer>
      </section>
      <SectionContainer className="py-16 sm:py-20" size="narrow">
        <ScanStepper activeStep={1} />
        <ScanUploadDropzone />
      </SectionContainer>
    </MarketingLayout>
  );
}
