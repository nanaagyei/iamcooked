import { MarketingLayout, SectionContainer } from "@/components/layout";

export default function TermsPage() {
  return (
    <MarketingLayout>
      <SectionContainer size="narrow" className="py-16 sm:py-20">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          Legal
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 max-w-[65ch] text-muted-foreground">
          By using iamcooked, you agree to the following terms. If you do not agree, do not use
          the service.
        </p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Service Provided As Is
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              iamcooked is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              basis. We make no representations or warranties of any kind, express or implied,
              regarding the operation or availability of the service, or the accuracy,
              completeness, or reliability of any information provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Security Information Is Advisory
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              The security intelligence, vulnerability reports, risk assessments, and
              recommendations provided by iamcooked are for informational and advisory purposes
              only. They do not constitute a guarantee that your software is secure or free from
              vulnerabilities. Security information originates from public databases including OSV,
              GitHub Advisory Database, and CISA, and may be supplemented by AI-generated summaries.
              AI-generated content is labeled with confidence indicators to help you assess
              reliability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              User Responsibilities
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              You are solely responsible for verifying any security information before taking
              action. This includes independently confirming vulnerability details, assessing the
              applicability to your specific environment, and testing patches or mitigations before
              deploying to production. iamcooked does not replace professional security auditing,
              penetration testing, or your own security review processes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              No Warranty
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, iamcooked disclaims all
              warranties, express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement. We do not
              warrant that the service will be uninterrupted, error-free, secure, or free from
              harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Limitation of Liability
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              In no event shall iamcooked, its operators, or its contributors be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but not
              limited to loss of profits, data, use, goodwill, or other intangible losses,
              resulting from:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>Your use or inability to use the service.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  Actions taken or not taken based on security information provided by the service.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  Unauthorized access to or alteration of your data. Note that we do not store
                  lockfile contents or dependency data.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <span>
                  Any other matter relating to the service.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Governing Law
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the
              State of Delaware, United States, without regard to its conflict of law provisions.
              Any disputes arising from these terms or the service shall be resolved exclusively in
              the courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Changes to These Terms
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Material changes will be
              communicated via the service or by email to registered users. Continued use of the
              service after changes take effect constitutes acceptance of the revised terms.
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
