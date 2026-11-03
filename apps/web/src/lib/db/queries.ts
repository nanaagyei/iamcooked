import { prisma } from "@iamcooked/db";

export async function getPublishedIncidents({
  severity,
  ecosystem,
  incidentType,
  search,
  limit = 50,
  offset = 0,
  sort = "publishedAt",
}: {
  severity?: string;
  ecosystem?: string;
  incidentType?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "publishedAt" | "severity";
}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (severity) where.severity = severity;
  if (ecosystem) where.ecosystem = ecosystem;
  if (incidentType) where.incidentType = incidentType;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { packages: { some: { packageName: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const orderBy = sort === "severity"
    ? [{ severity: "desc" as const }, { publishedAt: "desc" as const }]
    : [{ publishedAt: "desc" as const }];

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: {
        sources: { include: { source: true } },
        packages: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.incident.count({ where }),
  ]);

  return { incidents, total };
}

export async function getIncidentBySlug(slug: string) {
  return prisma.incident.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      sources: { include: { source: true } },
      packages: true,
    },
  });
}

export async function getRelatedIncidents(slug: string, limit = 3) {
  const incident = await prisma.incident.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { packages: true },
  });

  if (!incident || incident.packages.length === 0) {
    return [];
  }

  const packageNames = incident.packages.map((p) => p.packageName);
  const ecosystems = [...new Set(incident.packages.map((p) => p.ecosystem))];

  return prisma.incident.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: slug },
      packages: {
        some: {
          packageName: { in: packageNames },
          ecosystem: { in: ecosystems },
        },
      },
    },
    include: {
      sources: { include: { source: true } },
      packages: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getLatestIncidents(limit = 3) {
  return prisma.incident.findMany({
    where: { status: "PUBLISHED" },
    include: {
      sources: { include: { source: true } },
      packages: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getUserDashboardData(userId: string) {
  const [scans, subscriptions, watchedFromDb] = await Promise.all([
    prisma.scanReport.findMany({
      where: { userId },
      include: {
        findings: {
          include: {
            incident: { select: { id: true, slug: true, title: true, severity: true } },
          },
          orderBy: { severity: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.newsletterSubscription.findMany({
      where: { userId },
      take: 1,
    }),
    prisma.watchedPackage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const latestScan = scans[0];
  const allFindings = scans.flatMap((s) => s.findings);
  const packageNames = [...new Set(allFindings.map((f) => f.packageName))];

  const relevantIncidents = packageNames.length
    ? await prisma.incident.findMany({
        where: {
          status: "PUBLISHED",
          packages: { some: { packageName: { in: packageNames } } },
        },
        include: {
          sources: { include: { source: true } },
          packages: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
      })
    : await getLatestIncidents(3);

  const watchedPackages =
    watchedFromDb.length > 0
      ? watchedFromDb.map((w) => ({
          name: w.packageName,
          findingCount: allFindings.filter((f) => f.packageName === w.packageName).length,
        }))
      : packageNames.slice(0, 8).map((name) => ({
          name,
          findingCount: allFindings.filter((f) => f.packageName === name).length,
        }));

  const actions = allFindings
    .filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH")
    .slice(0, 5)
    .map((f) => ({
      id: f.id,
      title: `Review ${f.packageName}`,
      urgency: f.severity === "CRITICAL" ? "immediate" : "soon",
    }));

  return {
    latestScan,
    scans,
    findings: allFindings.slice(0, 10),
    relevantIncidents,
    watchedPackages,
    actions,
    digestPreferences: subscriptions[0] ?? null,
    riskScore: latestScan?.riskScore ?? 0,
    riskLevel: latestScan?.riskLevel ?? "NONE",
  };
}

export async function getAdminIncidents() {
  return prisma.incident.findMany({
    where: { status: { in: ["DRAFT", "NEEDS_REVIEW", "PUBLISHED"] } },
    include: {
      sources: { include: { source: true } },
      packages: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Workspace dashboard (Overview, Agent Sources, Projects, Dependencies, Vulnerabilities) ───

const DEMO_EMAIL = "demo@iamcooked.dev";

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  INFO: 0,
  UNKNOWN: 0,
};

/**
 * Resolve which workspace to read from. If the signed-in user has no data of
 * their own yet, fall back to the seeded demo workspace so the dashboard is
 * populated. Real users with data always see their own.
 */
async function resolveWorkspaceUserId(userId: string): Promise<string> {
  const [sessions, scans] = await Promise.all([
    prisma.agentSession.count({ where: { userId } }),
    prisma.scanReport.count({ where: { userId } }),
  ]);
  if (sessions > 0 || scans > 0) return userId;
  const demo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  return demo?.id ?? userId;
}

export type AgentSourceSummary = {
  id: string;
  vendor: string;
  sessionName: string;
  sourceType: string;
  sourceRef: string | null;
  depCount: number;
  vulnCount: number;
  unreviewedCount: number;
  lastSeenAt: Date;
  packages: Array<{
    name: string;
    version: string | null;
    reviewed: boolean;
    severity: string | null;
  }>;
};

export async function getAgentSources(userId: string): Promise<AgentSourceSummary[]> {
  const ownerId = await resolveWorkspaceUserId(userId);
  const sessions = await prisma.agentSession.findMany({
    where: { userId: ownerId },
    include: { installedPackages: { orderBy: { createdAt: "asc" } } },
    orderBy: { lastSeenAt: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    vendor: s.vendor,
    sessionName: s.sessionName,
    sourceType: s.sourceType,
    sourceRef: s.sourceRef,
    depCount: s.depCount,
    vulnCount: s.vulnCount,
    unreviewedCount: s.installedPackages.filter((p) => !p.reviewed).length,
    lastSeenAt: s.lastSeenAt,
    packages: s.installedPackages.map((p) => ({
      name: p.packageName,
      version: p.version,
      reviewed: p.reviewed,
      severity: p.severity,
    })),
  }));
}

export type ProjectSummary = {
  id: string;
  name: string;
  ecosystem: string;
  depCount: number;
  vulnCount: number;
  criticalCount: number;
  riskLevel: string;
  lastScannedAt: Date | null;
};

export async function getProjectsOverview(userId: string): Promise<ProjectSummary[]> {
  const ownerId = await resolveWorkspaceUserId(userId);
  const projects = await prisma.project.findMany({
    where: { userId: ownerId },
    include: {
      dependencies: true,
      scans: { include: { findings: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { name: "asc" },
  });

  return projects.map((p) => {
    const findings = p.scans.flatMap((s) => s.findings);
    const vulnPackages = new Set(findings.map((f) => f.packageName));
    const depPackages = new Set(p.dependencies.map((d) => d.packageName));
    for (const name of vulnPackages) depPackages.add(name);
    return {
      id: p.id,
      name: p.name,
      ecosystem: p.ecosystem,
      depCount: depPackages.size,
      vulnCount: findings.length,
      criticalCount: findings.filter((f) => f.severity === "CRITICAL").length,
      riskLevel: p.scans[0]?.riskLevel ?? "NONE",
      lastScannedAt: p.scans[0]?.createdAt ?? null,
    };
  });
}

export type DependencyInventoryItem = {
  name: string;
  version: string | null;
  ecosystem: string;
  severity: string | null;
  cveId: string | null;
  fixedVersion: string | null;
  reachable: boolean;
  projects: string[];
};

export async function getDependencyInventory(
  userId: string,
): Promise<DependencyInventoryItem[]> {
  const ownerId = await resolveWorkspaceUserId(userId);
  const [findings, deps] = await Promise.all([
    prisma.scanFinding.findMany({
      where: { scanReport: { userId: ownerId } },
      include: { scanReport: { include: { project: { select: { name: true } } } } },
    }),
    prisma.projectDependency.findMany({
      where: { project: { userId: ownerId } },
      include: { project: { select: { name: true } } },
    }),
  ]);

  const map = new Map<string, DependencyInventoryItem & { _projects: Set<string> }>();

  function ensure(name: string, ecosystem: string, version: string | null) {
    let entry = map.get(name);
    if (!entry) {
      entry = {
        name,
        version,
        ecosystem,
        severity: null,
        cveId: null,
        fixedVersion: null,
        reachable: false,
        projects: [],
        _projects: new Set<string>(),
      };
      map.set(name, entry);
    }
    return entry;
  }

  for (const d of deps) {
    const entry = ensure(d.packageName, d.ecosystem, d.version ?? null);
    if (d.project?.name) entry._projects.add(d.project.name);
  }

  for (const f of findings) {
    const entry = ensure(f.packageName, f.scanReport.ecosystem, f.installedVersion ?? null);
    if (f.scanReport.project?.name) entry._projects.add(f.scanReport.project.name);
    if (f.installedVersion) entry.version = f.installedVersion;
    if (f.reachable) entry.reachable = true;
    const currentRank = entry.severity ? (SEVERITY_RANK[entry.severity] ?? 0) : -1;
    if ((SEVERITY_RANK[f.severity] ?? 0) > currentRank) {
      entry.severity = f.severity;
      entry.cveId = f.cveId;
      entry.fixedVersion = f.fixedVersion;
    }
  }

  return [...map.values()]
    .map((e) => ({ ...e, projects: [...e._projects].sort() }))
    .map(({ _projects, ...rest }) => {
      void _projects;
      return rest;
    })
    .sort((a, b) => {
      const rank = (SEVERITY_RANK[b.severity ?? "UNKNOWN"] ?? 0) - (SEVERITY_RANK[a.severity ?? "UNKNOWN"] ?? 0);
      if (rank !== 0) return rank;
      return b.projects.length - a.projects.length;
    });
}

export type VulnerabilityTriageItem = {
  id: string;
  packageName: string;
  version: string | null;
  severity: string;
  cveId: string | null;
  fixedVersion: string | null;
  reachable: boolean;
  status: string;
  projects: string[];
};

export async function getVulnerabilityTriage(
  userId: string,
): Promise<VulnerabilityTriageItem[]> {
  const ownerId = await resolveWorkspaceUserId(userId);
  const findings = await prisma.scanFinding.findMany({
    where: { scanReport: { userId: ownerId } },
    include: { scanReport: { include: { project: { select: { name: true } } } } },
    orderBy: { severity: "desc" },
  });

  const map = new Map<
    string,
    VulnerabilityTriageItem & { _projects: Set<string>; _statuses: Set<string> }
  >();

  for (const f of findings) {
    const key = `${f.packageName}::${f.cveId ?? "no-cve"}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        id: f.id,
        packageName: f.packageName,
        version: f.installedVersion ?? null,
        severity: f.severity,
        cveId: f.cveId,
        fixedVersion: f.fixedVersion,
        reachable: f.reachable ?? false,
        status: f.status,
        projects: [],
        _projects: new Set<string>(),
        _statuses: new Set<string>(),
      };
      map.set(key, entry);
    }
    if (f.scanReport.project?.name) entry._projects.add(f.scanReport.project.name);
    entry._statuses.add(f.status);
    if (f.reachable) entry.reachable = true;
    if ((SEVERITY_RANK[f.severity] ?? 0) > (SEVERITY_RANK[entry.severity] ?? 0)) {
      entry.severity = f.severity;
    }
  }

  return [...map.values()]
    .map((e) => {
      const status = e._statuses.has("OPEN")
        ? "OPEN"
        : e._statuses.has("IN_PROGRESS")
          ? "IN_PROGRESS"
          : "DONE";
      const { _projects, _statuses, ...rest } = e;
      void _statuses;
      return { ...rest, status, projects: [..._projects].sort() };
    })
    .sort((a, b) => {
      const rank = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
      if (rank !== 0) return rank;
      return b.projects.length - a.projects.length;
    });
}

export async function createFixTask(
  userId: string,
  input: {
    packageName: string;
    fromVersion?: string | null;
    toVersion?: string | null;
    title?: string;
  },
) {
  const ownerId = await resolveWorkspaceUserId(userId);
  return prisma.fixTask.create({
    data: {
      userId: ownerId,
      packageName: input.packageName,
      fromVersion: input.fromVersion ?? null,
      toVersion: input.toVersion ?? null,
      title: input.title ?? `Patch ${input.packageName}`,
      provider: "INTERNAL",
      status: "OPEN",
    },
  });
}

export type DashboardOverview = {
  atRiskProjects: number;
  criticalCount: number;
  agentRiskPackages: number;
  agentSessionCount: number;
  outdatedCount: number;
  cookedScore: number;
  riskLevel: string;
  totalOpenVulns: number;
  reachableCount: number;
  activeVulnerabilities: VulnerabilityTriageItem[];
  recentTasks: Array<{
    id: string;
    title: string;
    provider: string;
    externalRef: string | null;
    packageName: string | null;
    fromVersion: string | null;
    toVersion: string | null;
    status: string;
  }>;
};

export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const ownerId = await resolveWorkspaceUserId(userId);

  const [projects, agentSessions, tasks, triage] = await Promise.all([
    getProjectsOverview(userId),
    prisma.agentSession.findMany({
      where: { userId: ownerId },
      include: { installedPackages: true },
    }),
    prisma.fixTask.findMany({
      where: { userId: ownerId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    getVulnerabilityTriage(userId),
  ]);

  const atRiskProjects = projects.filter(
    (p) => p.riskLevel === "CRITICAL" || p.riskLevel === "HIGH",
  ).length;
  const criticalCount = triage.filter((v) => v.severity === "CRITICAL").length;
  const reachableCount = triage.filter((v) => v.reachable).length;
  const totalOpenVulns = triage.filter((v) => v.status !== "DONE").length;
  const outdatedCount = triage.filter((v) => v.fixedVersion).length;

  const agentRiskPackages = agentSessions.reduce(
    (sum, s) => sum + s.installedPackages.filter((p) => !p.reviewed && p.severity).length,
    0,
  );

  // Workspace "cooked score": max project risk, nudged up by reachable findings.
  const maxProjectRank = Math.max(
    0,
    ...projects.map((p) => SEVERITY_RANK[p.riskLevel] ?? 0),
  );
  const baseScore = maxProjectRank * 22;
  const cookedScore = Math.min(99, baseScore + reachableCount * 3 + criticalCount * 2);
  const riskLevel =
    cookedScore >= 80
      ? "CRITICAL"
      : cookedScore >= 55
        ? "HIGH"
        : cookedScore >= 30
          ? "MEDIUM"
          : cookedScore > 0
            ? "LOW"
            : "NONE";

  return {
    atRiskProjects,
    criticalCount,
    agentRiskPackages,
    agentSessionCount: agentSessions.length,
    outdatedCount,
    cookedScore,
    riskLevel,
    totalOpenVulns,
    reachableCount,
    activeVulnerabilities: triage.slice(0, 7),
    recentTasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      provider: t.provider,
      externalRef: t.externalRef,
      packageName: t.packageName,
      fromVersion: t.fromVersion,
      toVersion: t.toVersion,
      status: t.status,
    })),
  };
}
