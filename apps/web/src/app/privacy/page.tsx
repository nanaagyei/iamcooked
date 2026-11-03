import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What iamcooked collects, why, who processes it, and how to get it deleted.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        iamcooked is an open-source project that helps people find vulnerable and malicious dependencies, MCP servers
        and AI coding tools. This policy covers the website and API at iamcooked.dev (&ldquo;the service&rdquo;). The{" "}
        <strong>CLI and GitHub Action run on your own machine</strong> and send nothing to us; see{" "}
        <a href="#cli">the CLI section</a>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>When</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GitHub name, email, avatar and user ID</td>
              <td>You sign in with GitHub</td>
              <td>Create your account, save scans and watchlists, send alerts you ask for</td>
            </tr>
            <tr>
              <td>Scan results: file name, ecosystem, matched package names/versions, advisories, risk score</td>
              <td>You scan a lockfile</td>
              <td>Show and share your report; link it to your account if you sign in</td>
            </tr>
            <tr>
              <td>Watchlist packages and digest preferences</td>
              <td>You add them</td>
              <td>Send the alerts and digests you subscribed to</td>
            </tr>
            <tr>
              <td>Email address</td>
              <td>You subscribe to the newsletter</td>
              <td>Send the weekly brief and critical alerts</td>
            </tr>
            <tr>
              <td>IP address and request metadata</td>
              <td>Every request</td>
              <td>Rate limiting and abuse prevention; kept in short-lived counters and standard server logs</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>We do not store your lockfile.</strong> It is parsed in memory and discarded once the report is
          generated. <strong>MCP configs pasted into the MCP checker never leave your browser</strong>; only the
          names and versions of pinned packages are sent to our <code>/api/check</code> endpoint.
        </p>
      </>
    ),
  },
  {
    id: "what-we-dont",
    title: "What we don't do",
    body: (
      <ul>
        <li>We don&apos;t sell or rent personal data, and we don&apos;t run advertising.</li>
        <li>We don&apos;t use third-party tracking pixels or cross-site analytics.</li>
        <li>We don&apos;t read your repositories. GitHub sign-in only asks for your public profile and email.</li>
        <li>We don&apos;t train AI models on your scans.</li>
      </ul>
    ),
  },
  {
    id: "processors",
    title: "Who processes data for us",
    body: (
      <>
        <p>We use a small number of providers, each only for the purpose listed:</p>
        <ul>
          <li>
            <strong>Hosting and database</strong> (e.g. Vercel, a managed PostgreSQL provider): run the app and store
            accounts, scans and watchlists.
          </li>
          <li>
            <strong>OSV.dev</strong> (Google, open source): receives package names and versions to look up advisories.
          </li>
          <li>
            <strong>CISA</strong>: we download the public Known Exploited Vulnerabilities catalog. Nothing about you is
            sent.
          </li>
          <li>
            <strong>Upstash</strong>: short-lived rate-limit counters keyed by IP address.
          </li>
          <li>
            <strong>Resend</strong>: delivers digest and alert emails to your address.
          </li>
          <li>
            <strong>OpenAI / Anthropic</strong>: only when you ask for an AI remediation plan or use the security
            copilot. They receive the relevant findings or your question, not your lockfile.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <p>
        We use strictly-necessary cookies for sign-in and security, plus a few local-storage keys for preferences
        like your theme. The full list, and how to change your choices, is in the <Link href="/cookies">cookie policy</Link>.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Account data: until you delete your account.</li>
        <li>Scan reports: reachable only with their private link or from your account; kept until you ask us to delete them.</li>
        <li>Newsletter subscriptions: until you unsubscribe (every email has a one-click link).</li>
        <li>Rate-limit counters: minutes. Server logs: per our hosting provider&apos;s retention, typically 30 days or less.</li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Wherever you live, you can ask us to access, correct, export or delete your data, and you can object to or
          restrict processing. If you&apos;re in the EU/UK (GDPR) or California (CCPA/CPRA) these are legal rights; we
          extend them to everyone.
        </p>
        <p>
          Our legal bases are: <strong>contract</strong> (providing the service you signed up for),{" "}
          <strong>legitimate interest</strong> (security, abuse prevention) and <strong>consent</strong> (newsletter,
          optional cookies). You can withdraw consent at any time.
        </p>
        <p>
          To make a request, open a{" "}
          <a href="https://github.com/nanaagyei/iamcooked/security/advisories/new">private report</a> titled
          &ldquo;Privacy request&rdquo;. We respond within 30 days. You can also complain to your local data protection
          authority.
        </p>
      </>
    ),
  },
  {
    id: "cli",
    title: "The CLI and GitHub Action",
    body: (
      <p>
        <code>npx iamcooked</code> runs locally. It sends package names and versions directly to OSV.dev and downloads
        the CISA KEV catalog. It does not contact iamcooked servers, does not collect telemetry and does not upload your
        files. You can verify this in the source code on GitHub.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Traffic is encrypted with TLS, report links use unguessable tokens, and the code is public so anyone can audit
        it. See our <Link href="/security">security page</Link> for details, and report vulnerabilities privately on
        GitHub.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>The service isn&apos;t directed at children under 13 (16 in the EU), and we don&apos;t knowingly collect their data.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We&apos;ll update the date at the top when this changes, and email account holders about material changes before
        they take effect. The full history is in our public Git repository.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy policy"
      updated="November 3, 2026"
      intro="We collect as little as possible, keep it for as short as possible, and never sell it. Here's exactly what that means."
      summary={[
        "Lockfiles are processed in memory and never stored.",
        "MCP configs are analysed in your browser. Secrets never leave it.",
        "The CLI doesn't talk to our servers or collect telemetry.",
        "No ads, no trackers, no data sales, no AI training on your scans.",
      ]}
      sections={sections}
    />
  );
}
