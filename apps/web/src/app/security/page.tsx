import Link from "next/link";
import {
  ShieldCheck,
  Prohibit,
  LockKey,
  Books,
  Sparkle,
  GitBranch,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { MagneticButton } from "@/components/ui/magnetic-button";

const principles = [
  { label: "In-memory only", value: "Lockfiles never hit disk", icon: ShieldCheck },
  { label: "No execution", value: "Parsed as data, never run", icon: Prohibit },
  { label: "Encrypted", value: "TLS 1.2+ with HSTS", icon: LockKey },
  { label: "Source-backed", value: "Every claim cites a source", icon: Books },
];

const confidenceLevels = [
  {
    label: "Confirmed",
    dot: "bg-severity-safe",
    body: "Corroborated by multiple trusted sources.",
  },
  {
    label: "Likely",
    dot: "bg-severity-medium",
    body: "Supported by at least one trusted source with partial corroboration.",
  },
  {
    label: "Developing",
    dot: "bg-severity-low",
    body: "Initial reports exist but details are still emerging.",
  },
  {
    label: "Unverified",
    dot: "bg-severity-info",
    body: "Based on preliminary information or a single source.",
  },
  {
    label: "Disputed",
    dot: "bg-severity-high",
    body: "Conflicting reports exist; claims are under active review.",
  },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string; weight?: "bold"; "aria-hidden"?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted">
          <Icon className="h-4 w-4 text-primary" weight="bold" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="mt-4 max-w-[68ch] space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
        {children}
      </div>
    </section>
  );
}

export default function SecurityPage() {
  return (
    <MarketingLayout>
      <div className="relative overflow-hidden bg-background">
        <section className="relative overflow-hidden border-b border-border/60">
          <PageBackdrop variant="incident-hero" seed="security-hero" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 [mask-image:linear-gradient(to_left,black,transparent)] lg:block">
            <Image
              src="/images/security-header.png"
              alt=""
              fill
              priority
              sizes="50vw"
              className="object-cover opacity-80"
            />
          </div>
          <SectionContainer className="relative py-20 lg:py-24">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Security
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl">
              How we handle your data, and our own
            </h1>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              iamcooked exists to make supply-chain risk legible. We hold our own
              platform to the standard we ask of yours: minimal data, no code
              execution, and claims you can trace back to a source.
            </p>
          </SectionContainer>
        </section>

        <SectionContainer className="py-12 lg:py-16">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.label} className="bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" weight="bold" aria-hidden />
                  <p className="mt-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {p.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{p.value}</p>
                </li>
              );
            })}
          </ul>
        </SectionContainer>

        <SectionContainer className="grid gap-14 pb-20 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-20 lg:pb-28">
          <div className="min-w-0 space-y-14">
            <Section id="lockfile-handling" icon={ShieldCheck} title="Lockfile handling">
              <p>
                When you upload a lockfile for scanning, dependency metadata is extracted and
                processed entirely in memory. Package names, versions, and ecosystems are matched
                against public vulnerability databases to generate your report. Once the report is
                returned, all extracted data is discarded.
              </p>
              <p>
                We do not store lockfile contents or dependency trees on disk, in databases, or in
                logs at any point. Scan reports retain only the findings and the metadata needed to
                show them to you, never the raw lockfile.
              </p>
            </Section>

            <Section id="no-code-execution" icon={Prohibit} title="No code execution">
              <p>
                iamcooked never executes uploaded code, installs packages, runs build scripts, or
                evaluates lockfile contents as executable code. Lockfiles are parsed as structured
                data only.
              </p>
              <p>
                Post-install scripts, native addons, and other executable payloads referenced in
                dependency metadata are never downloaded or run by our systems. The 2025 npm
                incidents that abused install hooks to steal credentials are exactly the class of
                behavior this rules out by design.
              </p>
            </Section>

            <Section id="transport-and-infrastructure" icon={LockKey} title="Transport and infrastructure">
              <p>
                All communication with iamcooked is encrypted over HTTPS. We enforce TLS 1.2 or
                higher for all client-server traffic, and HSTS headers are set to prevent downgrade
                attacks.
              </p>
              <p>
                Scan uploads and AI endpoints are rate limited and access-token gated. A scan report
                is only readable with its access token or by the signed-in owner who claimed it.
                Administrative AI workflows are restricted to authorized accounts.
              </p>
            </Section>

            <Section id="source-trust-tiers" icon={Books} title="Source-backed claims and trust tiers">
              <p>
                Every security claim in our incident reports is backed by at least one public
                source. Sources include the OSV vulnerability database, the GitHub Advisory
                Database, the CISA Known Exploited Vulnerabilities catalog, vendor security blogs,
                and maintainer advisories.
              </p>
              <p>
                Each source carries a trust tier so you can weigh reliability yourself. A claim
                corroborated by CISA and OSV is treated differently from a single social-media
                report, and the interface makes that difference visible rather than flattening
                everything into one confident-sounding summary.
              </p>
            </Section>

            <Section id="ai-confidence" icon={Sparkle} title="AI outputs and confidence">
              <p>
                Where AI is used to generate or supplement incident summaries, the output is
                explicitly labeled with a confidence indicator, and AI inference is never presented
                as confirmed fact. Our confidence ratings are:
              </p>
              <ul className="space-y-2 pt-1">
                {confidenceLevels.map((level) => (
                  <li key={level.label} className="flex gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${level.dot}`} aria-hidden />
                    <span>
                      <strong className="font-medium text-foreground">{level.label}</strong> — {level.body}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="dependency-hygiene" icon={GitBranch} title="Practicing what we preach">
              <p>
                A security tool with a careless dependency tree would be hard to trust. We keep our
                own surface defensible: pinned lockfiles under review, scoped and short-lived
                credentials in CI, and phishing-resistant authentication on the accounts that can
                publish or deploy.
              </p>
              <p>
                We watch the same signals we surface to you, OSV, GitHub Advisories, and CISA KEV,
                against our own dependencies, and treat a flagged version as something to act on,
                not a number to ignore.
              </p>
            </Section>

            <Section id="responsible-disclosure" icon={ShieldCheck} title="Report a security issue">
              <p>
                If you discover a security vulnerability in iamcooked itself, or believe any
                incident data is inaccurate, please contact us directly. We take all reports
                seriously and respond promptly.
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:security@iamcooked.dev"
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
                >
                  security@iamcooked.dev
                </a>
              </p>
              <p>
                We support responsible disclosure. Please do not publicly disclose a vulnerability
                before we have had a reasonable opportunity to address it. We aim to acknowledge
                reports within 48 hours and provide an initial assessment within 5 business days.
              </p>
            </Section>

            <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10">
              <PageBackdrop variant="incident-cta" seed="security-cta" className="opacity-60" />
              <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  See it on your own stack
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Upload a lockfile and watch the same source-backed process run against your
                  dependencies, in memory, in under a minute.
                </p>
                <div className="mt-5">
                  <MagneticButton asChild>
                    <Link href="/scan">Scan your project</Link>
                  </MagneticButton>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60">Last updated: June 26, 2026</p>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              On this page
            </p>
            <nav className="mt-3 space-y-2 text-sm">
              {[
                ["lockfile-handling", "Lockfile handling"],
                ["no-code-execution", "No code execution"],
                ["transport-and-infrastructure", "Transport & infrastructure"],
                ["source-trust-tiers", "Source-backed claims"],
                ["ai-confidence", "AI outputs & confidence"],
                ["dependency-hygiene", "Practicing what we preach"],
                ["responsible-disclosure", "Report an issue"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
