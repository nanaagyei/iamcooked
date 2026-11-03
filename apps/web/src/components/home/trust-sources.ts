export interface TrustSource {
  id: string;
  label: string;
  logoUrl?: string;
  logoDarkUrl?: string;
}

export const trustSources: TrustSource[] = [
  {
    id: "osv",
    label: "OSV",
    logoUrl: "/trust-logos/osv.svg",
    logoDarkUrl: "/trust-logos/osv-dark.svg",
  },
  {
    id: "github",
    label: "GitHub Advisory",
    logoUrl: "/trust-logos/github.svg",
    logoDarkUrl: "/trust-logos/github-dark.svg",
  },
  {
    id: "cisa",
    label: "CISA KEV",
    logoUrl: "/trust-logos/cisa.svg",
    logoDarkUrl: "/trust-logos/cisa-dark.svg",
  },
  {
    id: "nvd",
    label: "NVD",
    logoUrl: "/trust-logos/nvd.svg",
    logoDarkUrl: "/trust-logos/nvd-dark.svg",
  },
  {
    id: "npm",
    label: "npm Security",
    logoUrl: "/trust-logos/npm.svg",
  },
  {
    id: "snyk",
    label: "Snyk",
    logoUrl: "/trust-logos/snyk.svg",
    logoDarkUrl: "/trust-logos/snyk-dark.svg",
  },
  {
    id: "vendors",
    label: "Vendor advisories",
  },
];
