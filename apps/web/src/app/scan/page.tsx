import { MarketingLayout, PageHero, SectionContainer } from "@/components/layout";
import { ScanUploadDropzone } from "@/components/scan/ScanUploadDropzone";
import { ScanStepper } from "@/components/scan/ScanStepper";

export default function ScanPage() {
  return (
    <MarketingLayout overlap>
      <PageHero
        eyebrow="Scan"
        title="Drop a lockfile. Find out if you're cooked."
        highlight={[6, 7]}
        description="npm, pnpm, Yarn, Bun, pip, Poetry, uv, Go, Cargo, Bundler or Composer. We check every package against OSV, CISA KEV and curated incident reports. The file is processed in memory and never stored."
        size="compact"
      />
      <SectionContainer className="py-16 sm:py-20" size="narrow">
        <ScanStepper activeStep={1} />
        <ScanUploadDropzone />
      </SectionContainer>
    </MarketingLayout>
  );
}
