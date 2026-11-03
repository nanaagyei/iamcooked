import Link from "next/link";
import { SectionContainer } from "@/components/layout";
import { TextLink } from "@/components/ui/text-link";
import { Shield } from "@phosphor-icons/react/dist/ssr";

const footerLinks = {
  Product: [
    { href: "/incidents", label: "Incidents" },
    { href: "/scan", label: "Scan project" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/learn", label: "Learn" },
  ],
  Company: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/security", label: "Security" },
  ],
};

const trustBadges = ["Source-backed", "No panic UX", "AI labeled"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <SectionContainer className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-transparent underline-offset-4 hover:decoration-foreground/30"
            >
              <Shield className="h-4 w-4 text-primary" weight="bold" aria-hidden />
              iamcooked
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              The dependency vibe check for people who ship fast. Find out if your AI agent cooked you — before production does.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md border border-border/60 bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <TextLink href={link.href} variant="footer">
                      {link.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} iamcooked. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Security information is source-backed. AI summaries are labeled.
          </p>
        </div>
      </SectionContainer>
    </footer>
  );
}
