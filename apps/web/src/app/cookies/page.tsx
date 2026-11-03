import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { CookieSettingsButton } from "@/components/consent/CookieConsent";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Every cookie and local-storage key iamcooked uses, and how to control them.",
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          Cookies are small files your browser stores for a website. iamcooked uses as few as possible: the ones needed
          to sign you in and keep requests secure, plus a handful of local-storage keys that remember your preferences on
          this device. <strong>We don&apos;t use advertising or cross-site tracking cookies.</strong>
        </p>
        <div className="not-prose">
          <CookieSettingsButton className="inline-flex h-10 items-center rounded-md border border-border bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:border-foreground/25" />
        </div>
      </>
    ),
  },
  {
    id: "necessary",
    title: "Strictly necessary",
    body: (
      <>
        <p>These are required for the site to work, so they can&apos;t be switched off. They contain no tracking identifiers.</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>authjs.session-token</code> (<code>__Secure-</code> prefixed on HTTPS)</td>
              <td>Keeps you signed in</td>
              <td>30 days</td>
            </tr>
            <tr>
              <td><code>authjs.csrf-token</code></td>
              <td>Protects sign-in and forms against cross-site request forgery</td>
              <td>Session</td>
            </tr>
            <tr>
              <td><code>authjs.callback-url</code></td>
              <td>Returns you to the right page after signing in</td>
              <td>Session</td>
            </tr>
            <tr>
              <td><code>iamcooked_consent</code></td>
              <td>Remembers your cookie choices</td>
              <td>6 months</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "preferences",
    title: "Preferences (local storage)",
    body: (
      <>
        <p>These stay in your browser and are never sent to our servers automatically.</p>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>iamcooked-theme</code></td>
              <td>Light, dark or system theme</td>
            </tr>
            <tr>
              <td><code>iamcooked_pending_scans</code></td>
              <td>Private links to scans you ran before signing in, so they can be added to your account</td>
            </tr>
            <tr>
              <td><code>iamcooked-onboarding-complete</code></td>
              <td>Hides the dashboard welcome tour once you&apos;ve seen it</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    body: (
      <p>
        We don&apos;t run analytics today. If we ever add privacy-friendly usage statistics, they&apos;ll only load after you
        opt in under &ldquo;Analytics&rdquo; in cookie settings, and this page will list exactly what they set.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third parties",
    body: (
      <p>
        Signing in redirects you to GitHub, which sets its own cookies under its own policy. Links to external sites
        (advisories, documentation) are governed by those sites&apos; policies. We don&apos;t embed third-party scripts that
        set cookies on iamcooked.dev.
      </p>
    ),
  },
  {
    id: "control",
    title: "Controlling cookies",
    body: (
      <p>
        Use the cookie settings button above (or in the footer) to change your choices at any time. You can also clear
        or block cookies in your browser settings. Blocking strictly-necessary cookies will sign you out and may break
        forms.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      current="/cookies"
      title="Cookie policy"
      updated="November 3, 2026"
      intro="Just the cookies we need. Here's every one of them, what it does, and how long it lasts."
      summary={[
        "Only strictly-necessary cookies for sign-in and security.",
        "Preferences like your theme live in local storage on your device.",
        "No advertising, tracking or analytics cookies.",
        "Change your choices any time from the footer.",
      ]}
      sections={sections}
    />
  );
}
