import { MarketingLayout, SectionContainer } from "@/components/layout";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <SectionContainer size="narrow" className="py-16 sm:py-20">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          Legal
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-[65ch] text-muted-foreground">
          Your privacy is important to us. This policy explains what data we collect and how we
          handle it.
        </p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Information We Collect
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We collect only the information necessary to provide our service:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  <strong className="text-foreground">
                    Email address
                  </strong>{" "}
                  — if you subscribe to our security digest newsletter. We use this solely to
                  deliver the digest and critical alerts matching your stack.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  <strong className="text-foreground">
                    Uploaded lockfile information
                  </strong>{" "}
                  — when you scan a project, we extract dependency names, versions, and ecosystem
                  metadata from your lockfile. This data is processed temporarily in memory and is{" "}
                  <strong className="text-foreground">not stored</strong> on our servers
                  after the scan completes.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              What We Do Not Collect
            </h2>
            <ul className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  <strong className="text-foreground">Tracking</strong> — we do not use
                  third-party analytics, tracking pixels, or behavioral profiling.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  <strong className="text-foreground">Cookies beyond essential session</strong>{" "}
                  — we only use cookies required for the application to function. We do not deploy
                  advertising or cross-site tracking cookies.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  <strong className="text-foreground">Personal data sale</strong> — we do
                  not sell, license, or share your personal data with any third party for
                  commercial purposes.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              How We Process Lockfile Data
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              When you upload a lockfile for scanning, the following happens:
            </p>
            <ol className="mt-3 space-y-2 text-muted-foreground leading-relaxed list-decimal list-inside">
              <li>
                Dependency metadata (package names, versions, ecosystems) is extracted from your
                lockfile in memory.
              </li>
              <li>
                Each dependency is cross-referenced against public vulnerability databases including
                OSV, GitHub Advisory Database, and CISA&apos;s Known Exploited Vulnerabilities
                catalog.
              </li>
              <li>
                A report is generated and returned to you. Once the response is sent, all extracted
                dependency data is discarded from memory.
              </li>
            </ol>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We never store your lockfile contents or extracted dependency graph on disk, in a
              database, or in logs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Email and Newsletter
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              If you subscribe to our security digest, your email address is stored solely for the
              purpose of delivering the digest and relevant security alerts. You may unsubscribe at
              any time via the unsubscribe link included in every email. Upon unsubscribing, your
              email address is permanently removed from our mailing list.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Data Retention
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Email addresses for newsletter subscribers are retained until you unsubscribe. No
              other personal data is stored. Uploaded lockfile data and extracted dependency
              information are processed transiently and discarded after each request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Contact
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy or data handling, contact us at{" "}
              <a
                href="mailto:privacy@iamcooked.dev"
                className="text-foreground underline underline-offset-2 hover:text-foreground/80"
              >
                privacy@iamcooked.dev
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-16 text-xs text-muted-foreground/60">
          Last updated: June 9, 2026
        </p>
      </SectionContainer>
    </MarketingLayout>
  );
}
