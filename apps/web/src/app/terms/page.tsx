import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for using iamcooked: what we provide, what we don't promise, and what we ask of you.",
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <p>
        By using iamcooked.dev or its API (&ldquo;the service&rdquo;) you agree to these terms. If you&apos;re using it for an
        organisation, you confirm you can accept them on its behalf. The open-source code (CLI, GitHub Action and web
        app) is licensed separately under the <a href="https://github.com/nanaagyei/iamcooked/blob/main/LICENSE">MIT License</a>.
      </p>
    ),
  },
  {
    id: "the-service",
    title: "What the service does",
    body: (
      <p>
        iamcooked compares the packages and tools you use against public vulnerability data (OSV.dev, GitHub Security
        Advisories, CISA KEV and others) and explains the results. Incident briefs and AI summaries help you understand
        risk; they are clearly labelled and always link to their sources.
      </p>
    ),
  },
  {
    id: "no-guarantee",
    title: "No guarantee of security",
    body: (
      <>
        <p>
          <strong>A clean result does not mean you are secure.</strong> Vulnerability databases are incomplete and
          delayed, some vulnerabilities are never disclosed, and we can only check the versions you give us. Verdicts
          like &ldquo;not cooked&rdquo; describe what we could see at the time of the scan.
        </p>
        <p>
          The service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>, without warranties of
          any kind, including accuracy, fitness for a particular purpose or uninterrupted availability. You are
          responsible for decisions you make about your software, including applying or not applying a suggested fix.
          Test upgrades before deploying them.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>Please don&apos;t:</p>
        <ul>
          <li>Upload files you don&apos;t have the right to share, or content containing other people&apos;s secrets.</li>
          <li>Attempt to break, overload or bypass rate limits of the service or its data providers.</li>
          <li>Scrape the site or API at volume. Use the open-source CLI or OSV.dev directly instead.</li>
          <li>Use the service to attack systems you don&apos;t own or aren&apos;t authorised to test.</li>
          <li>Misrepresent iamcooked results as an audit, certification or endorsement.</li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <p>
        You sign in with GitHub and are responsible for activity on your account. We may suspend accounts that break
        these terms or put the service at risk. You can delete your account at any time.
      </p>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <p>
        You keep all rights to what you upload. You give us a limited licence to process it only to provide the service
        (for example, to generate and display a scan report). See the <Link href="/privacy">privacy policy</Link> for
        how we handle it.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party data and links",
    body: (
      <p>
        Advisory data comes from third parties under their own licences (for example, OSV data is CC-BY 4.0). We
        aren&apos;t responsible for its accuracy, or for external sites we link to.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, the iamcooked maintainers and contributors are not liable for indirect,
        incidental, special, consequential or punitive damages, or for lost profits, data or goodwill, arising from your
        use of the service. Where liability can&apos;t be excluded, it is limited to the greater of USD $50 or the amount
        you paid us in the last 12 months (which, for a free service, is usually nothing).
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and termination",
    body: (
      <p>
        We may change or discontinue features, and update these terms. We&apos;ll update the date above and, for material
        changes, notify account holders in advance. Continuing to use the service after changes take effect means you
        accept them.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions go to <a href="https://github.com/nanaagyei/iamcooked/discussions">GitHub Discussions</a>; security
        or privacy matters to <a href="https://github.com/nanaagyei/iamcooked/security/advisories/new">private reporting</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of service"
      updated="November 3, 2026"
      intro="Plain-English rules for using iamcooked. The short version: be decent, and remember that no scanner can promise you're safe."
      summary={[
        "The service is free and provided as-is, without warranties.",
        "A clean scan isn't a security guarantee. Test fixes before shipping.",
        "Don't abuse the API or use it against systems you don't own.",
        "You keep the rights to your content. The code is MIT-licensed.",
      ]}
      sections={sections}
    />
  );
}
