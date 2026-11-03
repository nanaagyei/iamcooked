export type DigestIncident = {
  id: string;
  title: string;
  slug: string;
  severity: string;
  ecosystem: string | null;
  beginnerTldr?: string | null;
  packages: Array<{ packageName: string; ecosystem: string }>;
};

export type DigestSubscriber = {
  email: string;
  interests: string[];
  userId: string | null;
  unsubscribeToken: string;
};

export function normalizeInterests(interests: unknown): string[] {
  if (Array.isArray(interests) && interests.length > 0) {
    return interests.map((i) => String(i).toLowerCase());
  }
  return ["npm"];
}

export function ecosystemMatchesInterest(
  ecosystem: string | null | undefined,
  interests: string[],
): boolean {
  const normalized = (ecosystem ?? "NPM").toLowerCase();
  const interestMap: Record<string, string[]> = {
    npm: ["npm"],
    pypi: ["pypi", "python"],
    go: ["go", "golang"],
    maven: ["maven", "java"],
    rubygems: ["rubygems", "ruby"],
    nuget: ["nuget", "dotnet"],
    cargo: ["cargo", "rust"],
    composer: ["composer", "php"],
    github_actions: ["github_actions", "github"],
    unknown: ["npm"],
  };
  const aliases = interestMap[normalized] ?? [normalized];
  return interests.some((interest) => aliases.includes(interest.toLowerCase()));
}

export function filterIncidentsByInterests(
  incidents: DigestIncident[],
  interests: string[],
): DigestIncident[] {
  return incidents.filter((incident) =>
    ecosystemMatchesInterest(incident.ecosystem, interests),
  );
}

export function incidentPackageNames(incident: DigestIncident): Set<string> {
  return new Set(incident.packages.map((p) => p.packageName.toLowerCase()));
}

export function filterIncidentsForPackages(
  incidents: DigestIncident[],
  packageNames: Set<string>,
): DigestIncident[] {
  if (packageNames.size === 0) return [];
  return incidents.filter((incident) => {
    const names = incidentPackageNames(incident);
    for (const name of names) {
      if (packageNames.has(name)) return true;
    }
    return false;
  });
}

export function buildEcosystemSummary(incidents: DigestIncident[]): string {
  const counts: Record<string, number> = {};
  for (const incident of incidents) {
    const key = incident.severity;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const parts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([severity, count]) => `${count} ${severity.toLowerCase()}`);
  if (parts.length === 0) {
    return "No new npm ecosystem incidents were published this week.";
  }
  return `This week in npm: ${parts.join(", ")} incident${incidents.length === 1 ? "" : "s"} published.`;
}

export function pickBeginnerLesson(weekIndex: number): {
  title: string;
  summary: string;
  url: string;
} {
  const lessons = [
    {
      title: "What is a CVE?",
      summary:
        "A CVE is a public identifier for a known security flaw. Your lockfile may pin a vulnerable version even if you never wrote the bad code.",
      url: "/learn/what-is-a-cve",
    },
    {
      title: "Understanding supply chain attacks",
      summary:
        "Attackers often target dependencies you trust. Watch for typosquatting, maintainer takeovers, and compromised releases.",
      url: "/learn/supply-chain-attacks",
    },
    {
      title: "How to read your scan report",
      summary:
        "Start with critical findings, verify affected versions, then follow remediation steps in order of urgency.",
      url: "/learn/reading-a-scan-report",
    },
    {
      title: "AI coding and dependency risk",
      summary:
        "AI-assisted tools install packages quickly — scanning your lockfile catches risks you did not manually review.",
      url: "/learn/ai-coding-and-dependency-risk",
    },
  ];
  return lessons[weekIndex % lessons.length]!;
}
