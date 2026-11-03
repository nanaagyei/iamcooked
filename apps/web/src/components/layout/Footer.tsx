import Link from "next/link";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { NewsletterCapture } from "@/components/forms/NewsletterCapture";
import { CookieSettingsButton } from "@/components/consent/CookieConsent";
import { CopyCommand } from "@/components/check/CopyCommand";
import { GridBackground } from "@/components/motion/Backgrounds";
import { Logo, GITHUB_URL } from "./Navbar";

const columns: Record<string, Array<{ href: string; label: string; external?: boolean }>> = {
  Product: [
    { href: "/tools", label: "Tool Watch" },
    { href: "/mcp", label: "MCP check" },
    { href: "/scan", label: "Scan a lockfile" },
    { href: "/incidents", label: "Incidents" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  Resources: [
    { href: "/learn", label: "Learn" },
    { href: "/about", label: "About & open source" },
    { href: `${GITHUB_URL}/tree/main/packages/cli#readme`, label: "CLI docs", external: true },
    { href: `${GITHUB_URL}#use-it-in-ci`, label: "GitHub Action", external: true },
    { href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`, label: "Contribute", external: true },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of service" },
    { href: "/cookies", label: "Cookie policy" },
    { href: "/security", label: "Security" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-muted/20">
      <GridBackground className="opacity-60 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent_70%)]" />
      <SectionContainer className="relative pt-16">
        {/* CTA band */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">Find out if you&apos;re cooked in ten seconds.</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                No signup, no API key. Runs locally, and only package names and versions leave your machine.
              </p>
              <CopyCommand command="npx iamcooked" className="mt-5 max-w-sm" />
            </div>
            <div>
              <p className="text-sm font-medium">Get the weekly brief + critical alerts</p>
              <p className="mt-1 text-xs text-muted-foreground">One calm email a week. Instant ones only when something you use is on fire.</p>
              <div className="mt-3">
                <NewsletterCapture variant="inline" />
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The dependency vibe check for people who ship fast. Open source, source-backed, and never
              fear-mongering.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground/30"
            >
              <GithubLogo className="h-4 w-4" weight="bold" aria-hidden />
              Star us on GitHub
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            </a>
          </div>
          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-foreground">
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
                {title === "Legal" && (
                  <li>
                    <CookieSettingsButton className="text-sm text-foreground/80 transition-colors hover:text-foreground" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} iamcooked contributors · MIT licensed</p>
          <p className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-safe opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-severity-safe" />
            </span>
            Data from OSV.dev, GitHub Advisories and CISA KEV
          </p>
        </div>
      </SectionContainer>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none relative -mb-[3vw] select-none overflow-hidden">
        <p className="bg-gradient-to-b from-foreground/[0.09] to-transparent bg-clip-text text-center text-[19vw] font-bold leading-none tracking-tighter text-transparent">
          iamcooked
        </p>
      </div>
    </footer>
  );
}
