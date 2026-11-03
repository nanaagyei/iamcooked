import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (children first to respect FKs)
  await prisma.fixTask.deleteMany();
  await prisma.agentInstalledPackage.deleteMany();
  await prisma.agentSession.deleteMany();
  await prisma.scanFinding.deleteMany();
  await prisma.scanReport.deleteMany();
  await prisma.incidentSource.deleteMany();
  await prisma.incidentPackage.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.source.deleteMany();
  await prisma.advisory.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.projectDependency.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create sources
  const osvSource = await prisma.source.create({
    data: {
      name: "OSV",
      url: "https://osv.dev",
      sourceType: "OSV",
      trustTier: 3,
      title: "Open Source Vulnerability Database",
    },
  });

  const ghSource = await prisma.source.create({
    data: {
      name: "GitHub Advisory Database",
      url: "https://github.com/advisories",
      sourceType: "GITHUB_ADVISORY",
      trustTier: 3,
      title: "GitHub-reviewed security advisories",
    },
  });

  const cisaSource = await prisma.source.create({
    data: {
      name: "CISA KEV",
      url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      sourceType: "CISA_KEV",
      trustTier: 3,
      title: "Known Exploited Vulnerabilities Catalog",
    },
  });

  const sockSource = await prisma.source.create({
    data: {
      name: "Socket Security",
      url: "https://socket.dev",
      sourceType: "VENDOR_BLOG",
      trustTier: 2,
      title: "Socket Security Research Blog",
    },
  });

  const snykSource = await prisma.source.create({
    data: {
      name: "Snyk",
      url: "https://security.snyk.io",
      sourceType: "VENDOR_BLOG",
      trustTier: 2,
      title: "Snyk Vulnerability Database",
    },
  });

  const bleepSource = await prisma.source.create({
    data: {
      name: "BleepingComputer",
      url: "https://www.bleepingcomputer.com",
      sourceType: "NEWS_ARTICLE",
      trustTier: 2,
      title: "Security news and research",
    },
  });

  const lutSource = await prisma.source.create({
    data: {
      name: "Lupin & Holmes",
      url: "https://lupinandholmes.com",
      sourceType: "VENDOR_BLOG",
      trustTier: 2,
      title: "Lupin & Holmes Security Research",
    },
  });

  console.log("Sources created");

  // ─── Incident 1: lodash prototype pollution ───

  const incident1 = await prisma.incident.create({
    data: {
      slug: "cve-2024-38972-lodash-prototype-pollution-mergewith",
      title: "CVE-2024-38972: lodash Prototype Pollution via mergeWith — Upgrade to 4.17.21+",
      shortTitle: "lodash mergeWith prototype pollution",
      severity: "HIGH",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "CVE",
      beginnerTldr:
        "A security issue was found in lodash, a popular JavaScript utility library used by millions of projects. A specific function called mergeWith can be tricked into modifying global objects, which could let attackers crash or manipulate applications. If your project uses lodash version 4.17.20 or older, you should update to version 4.17.21 or later. This is a medium-risk issue — there are no known active attacks exploiting it, but updating is straightforward and recommended.",
      technicalSummary:
        "CVE-2024-38972 is a prototype pollution vulnerability in lodash's mergeWith function. Versions prior to 4.17.21 allow attackers to pollute Object.prototype through crafted input passed to mergeWith. This can lead to denial of service, property injection, or in some configurations, remote code execution. The vulnerability was discovered via OSV scanning and confirmed by the lodash maintainers. Patched in lodash@4.17.21.",
      recommendedActions: [
        { title: "Upgrade lodash", description: "Run npm install lodash@4.17.21 to upgrade to the patched version.", command: "npm install lodash@4.17.21", urgency: "recommended" },
        { title: "Check for transitive dependencies", description: "Run npm ls lodash to identify all instances of lodash in your dependency tree.", command: "npm ls lodash", urgency: "recommended" },
        { title: "Review package overrides", description: "If a direct upgrade is blocked by a dependency, use npm overrides in package.json to force the patched version.", command: 'Add "overrides": { "lodash": "4.17.21" } to package.json', urgency: "if-needed" },
      ],
      publishedAt: new Date("2024-08-15"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident1.id, sourceId: osvSource.id },
      { incidentId: incident1.id, sourceId: ghSource.id },
      { incidentId: incident1.id, sourceId: snykSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident1.id,
      packageName: "lodash",
      ecosystem: "NPM",
      affectedVersions: ["<4.17.21"],
      patchedVersions: ["4.17.21"],
    },
  });

  // ─── Incident 2: malicious eslint config typo-squatting ───

  const incident2 = await prisma.incident.create({
    data: {
      slug: "malicious-package-eslint-config-airbnb-type-2024",
      title: "Malicious Package Campaign: typosquatted eslint configs exfiltrating credentials to hardcoded endpoints",
      shortTitle: "Malicious eslint config typosquatting campaign",
      severity: "CRITICAL",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "MALICIOUS_PACKAGE",
      beginnerTldr:
        "Attackers published packages with names that look almost identical to popular ESLint configurations. If you accidentally installed one of these instead of the real package, the malicious code would steal environment variables, tokens, and secrets from your machine and send them to an attacker-controlled server. This is critical — if you installed any ESLint config package starting with 'eslint-config-airbnb-type' in late July or early August 2024, you should revoke all exposed credentials immediately and remove the package.",
      technicalSummary:
        "A typosquatting campaign targeted the ESLint ecosystem with packages designed to look like eslint-config-airbnb-typescript. The malicious packages contained postinstall scripts that exfiltrated process.env, .env file contents, ~/.npmrc tokens, and GitHub tokens to a hardcoded remote endpoint. Packages were published July 28 – August 2, 2024. npm removed them August 3. Over 800 downloads before removal. Affected organizations should rotate all CI tokens and npm access tokens.",
      recommendedActions: [
        { title: "Remove malicious package immediately", description: "Uninstall any packages matching eslint-config-airbnb-type* that you didn't intentionally install.", command: "npm uninstall eslint-config-airbnb-type", urgency: "immediate" },
        { title: "Rotate all credentials", description: "Rotate GitHub tokens, npm tokens, and any secrets that were exposed in environment variables during the affected time window.", command: undefined, urgency: "immediate" },
        { title: "Audit installed packages", description: "Review all packages matching eslint-config-airbnb-type patterns and verify they are the legitimate package.", command: "npm ls eslint-config-airbnb-type", urgency: "immediate" },
        { title: "Enable 2FA on npm and GitHub", description: "Enable two-factor authentication on all package registry and CI accounts to prevent unauthorized publishes.", command: undefined, urgency: "recommended" },
      ],
      publishedAt: new Date("2024-08-03"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident2.id, sourceId: sockSource.id },
      { incidentId: incident2.id, sourceId: bleepSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident2.id,
      packageName: "eslint-config-airbnb-type",
      ecosystem: "NPM",
      affectedVersions: ["2024.7.28 – 2024.8.2"],
      patchedVersions: [],
      notes: "This is the typosquatted package name. The legitimate package is eslint-config-airbnb-typescript.",
    },
  });

  // ─── Incident 3: ua-parser-js supply-chain attack ───

  const incident3 = await prisma.incident.create({
    data: {
      slug: "supply-chain-attack-ua-parser-js-2024",
      title: "Hijacked ua-parser-js releases contain crypto miner + credential stealer — versions 0.7.30–0.7.32 affected",
      shortTitle: "ua-parser-js supply-chain hijack",
      severity: "CRITICAL",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "SUPPLY_CHAIN_ATTACK",
      beginnerTldr:
        "A popular package for detecting browsers and devices (ua-parser-js) was taken over by attackers who published three malicious versions. These versions secretly installed cryptocurrency mining software on computers and attempted to steal credentials from Linux and Windows systems. If your project uses ua-parser-js versions 0.7.30, 0.7.31, or 0.7.32, you must immediately update to version 0.7.33 or later, and scan your development and production machines for compromise.",
      technicalSummary:
        "The maintainer account for ua-parser-js was compromised through a phishing attack. The attacker published versions 0.7.30, 0.7.31, and 0.7.32 containing preinstall scripts that executed a Linux cryptominer and attempted to steal credentials from Windows systems via a DLL sideloading technique. The malicious releases were available for approximately 4 hours before npm removed them. Over 7 million weekly downloads puts this as one of the most impactful supply-chain attacks of 2024. The maintainer published 0.7.33 as a clean release and rotated compromised credentials.",
      recommendedActions: [
        { title: "Immediately upgrade ua-parser-js", description: "Upgrade to version 0.7.33 or later immediately.", command: "npm install ua-parser-js@0.7.33", urgency: "immediate" },
        { title: "Scan affected machines", description: "If versions 0.7.30–0.7.32 were installed, scan all machines for cryptocurrency miners and unauthorized processes.", command: undefined, urgency: "immediate" },
        { title: "Check for compromised CI/CD", description: "If the affected versions ran in CI/CD pipelines, audit pipeline logs for unusual outbound connections and rotate CI credentials.", command: undefined, urgency: "immediate" },
      ],
      publishedAt: new Date("2024-10-22"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident3.id, sourceId: ghSource.id },
      { incidentId: incident3.id, sourceId: cisaSource.id },
      { incidentId: incident3.id, sourceId: snykSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident3.id,
      packageName: "ua-parser-js",
      ecosystem: "NPM",
      affectedVersions: ["0.7.30", "0.7.31", "0.7.32"],
      patchedVersions: ["0.7.33"],
    },
  });

  // ─── Incident 4: @grpc/grpc-js RCE ───

  const incident4 = await prisma.incident.create({
    data: {
      slug: "cve-2024-45829-grpc-js-remote-code-execution",
      title: "CVE-2024-45829: @grpc/grpc-js Remote Code Execution via Insecure Metadata Parsing — Upgrade to 1.10.0+",
      shortTitle: "@grpc/grpc-js RCE vulnerability",
      severity: "CRITICAL",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "CVE",
      beginnerTldr:
        "A critical vulnerability was discovered in @grpc/grpc-js, a library used by many Node.js applications to communicate via gRPC. An attacker could send specially crafted network data that would execute malicious code on your server. This is one of the most serious types of vulnerabilities. If your application uses @grpc/grpc-js version 1.9.x or earlier, you need to update to version 1.10.0 immediately. There are no workarounds — the fix requires upgrading the package.",
      technicalSummary:
        "CVE-2024-45829 is a use-after-free vulnerability in @grpc/grpc-js's metadata parsing implementation. The flaw exists in how the library handles compressed metadata frames. A remote attacker can send a crafted gRPC request with malformed compressed metadata, triggering memory corruption that leads to arbitrary code execution. CVSS score: 9.8 (Critical). All versions prior to 1.10.0 are affected. The grpc team published 1.10.0 with a complete rewrite of the metadata parsing path.",
      recommendedActions: [
        { title: "Upgrade @grpc/grpc-js immediately", description: "Upgrade to version 1.10.0 or later. There is no workaround.", command: "npm install @grpc/grpc-js@1.10.0", urgency: "immediate" },
        { title: "Verify no other gRPC libraries are affected", description: "Check for other gRPC client/server implementations in your dependency tree that may share similar parsing code.", command: "npm ls @grpc/grpc-js", urgency: "recommended" },
      ],
      publishedAt: new Date("2024-09-28"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident4.id, sourceId: osvSource.id },
      { incidentId: incident4.id, sourceId: ghSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident4.id,
      packageName: "@grpc/grpc-js",
      ecosystem: "NPM",
      affectedVersions: ["<1.10.0"],
      patchedVersions: ["1.10.0"],
    },
  });

  // ─── Incident 5: dependency confusion ───

  const incident5 = await prisma.incident.create({
    data: {
      slug: "dependency-confusion-internal-auth-sdk-2024",
      title: "Dependency Confusion Campaign: Public npm package impersonated private @company/internal-auth-sdk",
      shortTitle: "Dependency confusion on internal auth SDK",
      severity: "HIGH",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "DEPENDENCY_CONFUSION",
      beginnerTldr:
        "A security researcher discovered that attackers had published a package on the public npm registry that had the same name as a private, internal authentication SDK used by a company. Because of how package managers resolve names, some CI/CD pipelines could accidentally install the public (malicious) version instead of the private (safe) one. The malicious package would gather information about the build environment and send it to an attacker-controlled server. If your organization uses private npm packages, you should configure scoped registries and .npmrc files to prevent this type of attack.",
      technicalSummary:
        "A dependency confusion attack exploited npm's name-resolution behavior where non-scoped packages are resolved from the public registry first. The attacker registered 'internal-auth-sdk' on the public npm registry to match a commonly used private package name. The public package ran a reconnaissance script that collected OS info, IP addresses, package.json contents, and sent them to a C2 server. Research revealed similar packages targeting common internal names: internal-helpers, company-config, private-utils. Organizations should configure npm with @scope:registry mappings and prefer scoped package names for internal packages.",
      recommendedActions: [
        { title: "Check for exposed internal packages", description: "Search the npm registry for package names matching your internal packages. If matches exist, investigate whether they are malicious.", command: "npm search <your-internal-package-name>", urgency: "immediate" },
        { title: "Configure scoped registries", description: "Use .npmrc to configure scoped registry mappings so private packages resolve from your private registry.", command: "Add @your-scope:registry=https://your-registry.com/ to .npmrc", urgency: "recommended" },
        { title: "Use scoped package names", description: "Prefix all internal packages with an organization scope (e.g., @company/package-name) to prevent name collisions.", command: undefined, urgency: "recommended" },
      ],
      publishedAt: new Date("2024-06-12"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident5.id, sourceId: sockSource.id },
      { incidentId: incident5.id, sourceId: lutSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident5.id,
      packageName: "internal-auth-sdk",
      ecosystem: "NPM",
      affectedVersions: ["1.0.0 – 1.0.3"],
      patchedVersions: [],
      notes: "Package removed from npm. Do not install any unverified package matching this name.",
    },
  });

  // ─── Incident 6: node-ipc protestware ───

  const incident6 = await prisma.incident.create({
    data: {
      slug: "maintainer-compromise-node-ipc-peacenotwar-2024",
      title: "node-ipc Maintainer Adds Malicious Protestware: Versions 10.1.1/10.1.2 overwrite user files based on IP geolocation",
      shortTitle: "node-ipc protestware sabotage",
      severity: "CRITICAL",
      confidence: "CONFIRMED",
      status: "PUBLISHED",
      ecosystem: "NPM",
      incidentType: "MAINTAINER_COMPROMISE",
      beginnerTldr:
        "The maintainer of node-ipc, a widely used library for inter-process communication, added malicious code to two versions of the package. When installed, the code checks your computer's geographic location from its IP address and, if it detects certain regions, overwrites random files on your system with a heart emoji. This is a form of 'protestware' — a maintainer using their position to push a political message through software sabotage. Do not use node-ipc versions 10.1.1 or 10.1.2. Audit your dependencies for any package depending on node-ipc and lock them to a safe version.",
      technicalSummary:
        "The node-ipc maintainer, self-identifying as Brandon Nozaki Miller, introduced protestware into node-ipc@10.1.1 and node-ipc@10.1.2. Versions 10.1.1–10.1.2 include a dependency 'peacenotwar' that performs geo-IP checks via api.ipgeolocation.io. If the IP resolves to Belarus or Russia, the module recursively walks the filesystem from the root and overwrites all accessible files with a heart emoji character. The malicious code was eventually removed in 10.1.3. The community forked the project as @anthropic-ai/node-ipc-safe. CVE-2024-29472 was assigned.",
      recommendedActions: [
        { title: "Remove or downgrade node-ipc", description: "Uninstall node-ipc or downgrade to version 9.2.1 (last known safe version before the maintainer's protestware).", command: "npm install node-ipc@9.2.1", urgency: "immediate" },
        { title: "Check for transitive dependencies", description: "Many packages depend on node-ipc. Use npm ls to find all instances of node-ipc in your tree.", command: "npm ls node-ipc", urgency: "immediate" },
        { title: "Audit file integrity", description: "If node-ipc 10.1.1/10.1.2 was installed and the IP geolocation matched, your filesystem may have been corrupted. Restore from backup.", command: undefined, urgency: "immediate" },
      ],
      publishedAt: new Date("2024-03-15"),
    },
  });

  await prisma.incidentSource.createMany({
    data: [
      { incidentId: incident6.id, sourceId: ghSource.id },
      { incidentId: incident6.id, sourceId: bleepSource.id },
      { incidentId: incident6.id, sourceId: sockSource.id },
    ],
  });

  await prisma.incidentPackage.create({
    data: {
      incidentId: incident6.id,
      packageName: "node-ipc",
      ecosystem: "NPM",
      affectedVersions: ["10.1.1", "10.1.2"],
      patchedVersions: ["10.1.3"],
      notes: "Community fork available at @anthropic-ai/node-ipc-safe. CVE-2024-29472.",
    },
  });

  console.log("6 incidents seeded with sources and packages");

  // ─── Demo workspace (Agent Sources, Projects, Dependencies, Vulnerabilities) ───
  // Attached to a demo user. The dashboard queries fall back to this workspace
  // when a signed-in user has no data of their own, so the UI looks alive.

  const demoUser = await prisma.user.create({
    data: { email: "demo@iamcooked.dev", name: "Demo Chef", role: "USER" },
  });

  const projectNames = [
    "frontend-monorepo",
    "backend-api",
    "mobile-app",
    "admin-dashboard",
    "data-pipeline",
  ] as const;

  const projects: Record<string, { id: string }> = {};
  for (const name of projectNames) {
    projects[name] = await prisma.project.create({
      data: {
        name,
        ecosystem: name === "data-pipeline" ? "PYPI" : "NPM",
        userId: demoUser.id,
      },
    });
  }

  type Vuln = {
    pkg: string;
    version: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    cve: string;
    fixed: string;
    reachable: boolean;
    findingType:
      | "KNOWN_VULNERABILITY"
      | "AFFECTED_BY_INCIDENT"
      | "ACTIVELY_EXPLOITED"
      | "MALICIOUS_PACKAGE";
    incidentId?: string;
    projects: string[];
    explanation: string;
  };

  const vulns: Vuln[] = [
    {
      pkg: "minimist",
      version: "1.2.5",
      severity: "CRITICAL",
      cve: "CVE-2021-44906",
      fixed: "1.2.6",
      reachable: true,
      findingType: "KNOWN_VULNERABILITY",
      projects: ["frontend-monorepo", "backend-api", "mobile-app", "admin-dashboard", "data-pipeline"],
      explanation:
        "Prototype pollution in minimist lets crafted CLI args mutate Object.prototype. You parse untrusted args, so this one can actually bite. Bump to 1.2.6+.",
    },
    {
      pkg: "lodash",
      version: "4.17.20",
      severity: "HIGH",
      cve: "CVE-2024-38972",
      fixed: "4.17.21",
      reachable: false,
      findingType: "AFFECTED_BY_INCIDENT",
      incidentId: incident1.id,
      projects: ["frontend-monorepo", "backend-api", "mobile-app", "admin-dashboard"],
      explanation:
        "lodash mergeWith prototype pollution. Real, but the vulnerable path doesn't look reachable in your code. Still worth the one-line bump to 4.17.21.",
    },
    {
      pkg: "ua-parser-js",
      version: "0.7.31",
      severity: "CRITICAL",
      cve: "CVE-2021-37713",
      fixed: "0.7.33",
      reachable: true,
      findingType: "ACTIVELY_EXPLOITED",
      incidentId: incident3.id,
      projects: ["frontend-monorepo", "mobile-app", "admin-dashboard"],
      explanation:
        "You're on a hijacked ua-parser-js release that shipped a miner + credential stealer. This is the bad one. Upgrade to 0.7.33 now and rotate anything that touched CI.",
    },
    {
      pkg: "node-ipc",
      version: "10.1.1",
      severity: "CRITICAL",
      cve: "CVE-2024-29472",
      fixed: "9.2.1",
      reachable: false,
      findingType: "MALICIOUS_PACKAGE",
      incidentId: incident6.id,
      projects: ["backend-api", "data-pipeline"],
      explanation:
        "node-ipc protestware that wipes files based on geo-IP. Pin back to 9.2.1 (or drop it). Yes, really.",
    },
    {
      pkg: "@grpc/grpc-js",
      version: "1.9.4",
      severity: "CRITICAL",
      cve: "CVE-2024-45829",
      fixed: "1.10.0",
      reachable: true,
      findingType: "AFFECTED_BY_INCIDENT",
      incidentId: incident4.id,
      projects: ["backend-api", "data-pipeline"],
      explanation:
        "Remote code execution via metadata parsing. Your services speak gRPC over the network, so this is reachable. Upgrade to 1.10.0 — no workaround.",
    },
    {
      pkg: "follow-redirects",
      version: "1.14.7",
      severity: "HIGH",
      cve: "CVE-2022-0155",
      fixed: "1.15.4",
      reachable: true,
      findingType: "KNOWN_VULNERABILITY",
      projects: ["frontend-monorepo", "backend-api", "mobile-app", "admin-dashboard"],
      explanation:
        "follow-redirects leaks cookies/auth headers across hosts on redirect. Bump to 1.15.4+.",
    },
    {
      pkg: "axios",
      version: "0.21.1",
      severity: "MEDIUM",
      cve: "CVE-2021-3749",
      fixed: "1.6.0",
      reachable: true,
      findingType: "KNOWN_VULNERABILITY",
      projects: ["frontend-monorepo", "backend-api", "mobile-app"],
      explanation:
        "ReDoS in axios' trim regex. Annoying more than scary, but you're 3 majors behind. Plan the 1.x upgrade.",
    },
    {
      pkg: "tar",
      version: "4.4.13",
      severity: "HIGH",
      cve: "CVE-2021-37713",
      fixed: "6.1.11",
      reachable: false,
      findingType: "KNOWN_VULNERABILITY",
      projects: ["frontend-monorepo", "backend-api", "mobile-app", "admin-dashboard", "data-pipeline"],
      explanation:
        "Path traversal in tar during extraction. Mostly a build-time dep here, so low blast radius, but update to 6.1.11.",
    },
    {
      pkg: "ansi-regex",
      version: "5.0.0",
      severity: "HIGH",
      cve: "CVE-2021-3807",
      fixed: "5.0.1",
      reachable: false,
      findingType: "KNOWN_VULNERABILITY",
      projects: ["frontend-monorepo", "backend-api", "mobile-app", "admin-dashboard", "data-pipeline"],
      explanation:
        "ReDoS in ansi-regex. Deep transitive dep — the fix is a dedupe/override to 5.0.1.",
    },
  ];

  // Group vulns by project so each project gets one scan report with its findings.
  const sevScore: Record<string, number> = { CRITICAL: 95, HIGH: 70, MEDIUM: 45, LOW: 20 };
  const sevRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  for (const projectName of projectNames) {
    const projectVulns = vulns.filter((v) => v.projects.includes(projectName));
    const topSeverity = projectVulns.reduce(
      (max, v) => (sevRank[v.severity]! > sevRank[max]! ? v.severity : max),
      "LOW" as string,
    );
    const riskScore = projectVulns.length
      ? Math.min(99, (sevScore[topSeverity] ?? 20) + projectVulns.length * 2)
      : 0;
    const riskLevel =
      riskScore >= 80 ? "CRITICAL" : riskScore >= 55 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW";

    const scan = await prisma.scanReport.create({
      data: {
        userId: demoUser.id,
        projectId: projects[projectName]!.id,
        uploadFileName: projectName === "data-pipeline" ? "poetry.lock" : "pnpm-lock.yaml",
        ecosystem: projectName === "data-pipeline" ? "PYPI" : "NPM",
        riskScore,
        riskLevel: riskLevel as "CRITICAL",
        summary: `${projectVulns.length} findings across the ${projectName} dependency tree.`,
      },
    });

    for (const v of projectVulns) {
      await prisma.scanFinding.create({
        data: {
          scanReportId: scan.id,
          incidentId: v.incidentId,
          packageName: v.pkg,
          installedVersion: v.version,
          findingType: v.findingType,
          severity: v.severity,
          confidence: "CONFIRMED",
          explanation: v.explanation,
          reachable: v.reachable,
          cveId: v.cve,
          fixedVersion: v.fixed,
          status: v.severity === "MEDIUM" ? "IN_PROGRESS" : "OPEN",
        },
      });
    }

    // A few clean direct dependencies per project for inventory realism.
    const commonDeps = ["react", "express", "typescript", "next", "zod"];
    for (const dep of commonDeps) {
      await prisma.projectDependency.create({
        data: {
          projectId: projects[projectName]!.id,
          packageName: dep,
          version: "latest",
          ecosystem: projectName === "data-pipeline" ? "PYPI" : "NPM",
          direct: true,
        },
      });
    }
  }

  console.log("5 demo projects + scans + findings seeded");

  // ─── Agent sessions ───
  const agentSessions: Array<{
    vendor: "CURSOR" | "CLAUDE_CODE" | "LOVABLE" | "REPLIT" | "V0" | "WINDSURF" | "BOLT";
    sessionName: string;
    sourceType: "REPO" | "CLOUD" | "LOCAL";
    sourceRef: string;
    lastSeenMinsAgo: number;
    packages: Array<{ name: string; version: string; reviewed: boolean; severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" }>;
  }> = [
    {
      vendor: "CURSOR",
      sessionName: "auth-refactor",
      sourceType: "REPO",
      sourceRef: "acme/api",
      lastSeenMinsAgo: 12,
      packages: [
        { name: "jsonwebtoken", version: "8.5.1", reviewed: false, severity: "HIGH" },
        { name: "bcryptjs", version: "2.4.3", reviewed: true },
        { name: "cookie", version: "0.4.1", reviewed: false, severity: "MEDIUM" },
      ],
    },
    {
      vendor: "CLAUDE_CODE",
      sessionName: "payment-service",
      sourceType: "REPO",
      sourceRef: "acme/payments",
      lastSeenMinsAgo: 60,
      packages: [
        { name: "stripe", version: "14.0.0", reviewed: true },
        { name: "dinero.js", version: "1.9.1", reviewed: true },
      ],
    },
    {
      vendor: "LOVABLE",
      sessionName: "landing-page-v2",
      sourceType: "CLOUD",
      sourceRef: "cloud",
      lastSeenMinsAgo: 120,
      packages: [
        { name: "framer-motion", version: "10.0.0", reviewed: false },
        { name: "ua-parser-js", version: "0.7.31", reviewed: false, severity: "CRITICAL" },
        { name: "clsx", version: "2.0.0", reviewed: false },
      ],
    },
    {
      vendor: "REPLIT",
      sessionName: "data-pipeline-poc",
      sourceType: "CLOUD",
      sourceRef: "cloud",
      lastSeenMinsAgo: 180,
      packages: [
        { name: "node-ipc", version: "10.1.1", reviewed: false, severity: "CRITICAL" },
        { name: "csv-parse", version: "5.0.0", reviewed: true },
      ],
    },
    {
      vendor: "V0",
      sessionName: "admin-ui",
      sourceType: "CLOUD",
      sourceRef: "cloud",
      lastSeenMinsAgo: 300,
      packages: [
        { name: "recharts", version: "2.10.0", reviewed: false },
        { name: "date-fns", version: "2.30.0", reviewed: true },
      ],
    },
    {
      vendor: "CURSOR",
      sessionName: "local-experiment",
      sourceType: "LOCAL",
      sourceRef: "local",
      lastSeenMinsAgo: 360,
      packages: [
        { name: "lodash", version: "4.17.20", reviewed: false, severity: "HIGH" },
      ],
    },
    {
      vendor: "WINDSURF",
      sessionName: "api-gateway",
      sourceType: "REPO",
      sourceRef: "acme/gateway",
      lastSeenMinsAgo: 600,
      packages: [
        { name: "@grpc/grpc-js", version: "1.9.4", reviewed: false, severity: "CRITICAL" },
        { name: "follow-redirects", version: "1.14.7", reviewed: false, severity: "HIGH" },
        { name: "pino", version: "8.0.0", reviewed: true },
      ],
    },
    {
      vendor: "BOLT",
      sessionName: "checkout-flow",
      sourceType: "CLOUD",
      sourceRef: "cloud",
      lastSeenMinsAgo: 720,
      packages: [
        { name: "axios", version: "0.21.1", reviewed: false, severity: "MEDIUM" },
        { name: "zustand", version: "4.4.0", reviewed: true },
      ],
    },
  ];

  for (const s of agentSessions) {
    const vulnCount = s.packages.filter((p) => p.severity).length;
    await prisma.agentSession.create({
      data: {
        userId: demoUser.id,
        vendor: s.vendor,
        sessionName: s.sessionName,
        sourceType: s.sourceType,
        sourceRef: s.sourceRef,
        depCount: s.packages.length,
        vulnCount,
        lastSeenAt: new Date(Date.now() - s.lastSeenMinsAgo * 60 * 1000),
        installedPackages: {
          create: s.packages.map((p) => ({
            packageName: p.name,
            version: p.version,
            ecosystem: "NPM",
            reviewed: p.reviewed,
            severity: p.severity,
          })),
        },
      },
    });
  }

  console.log(`${agentSessions.length} agent sessions seeded`);

  // ─── Fix tasks (Recent Tasks feed) ───
  await prisma.fixTask.createMany({
    data: [
      { userId: demoUser.id, title: "Patch CVE-2021-44906 in minimist", provider: "JIRA", externalRef: "SEC-412", packageName: "minimist", fromVersion: "1.2.5", toVersion: "1.2.6", status: "OPEN" },
      { userId: demoUser.id, title: "Upgrade lodash across monorepo", provider: "LINEAR", externalRef: "ENG-218", packageName: "lodash", fromVersion: "4.17.20", toVersion: "4.17.21", status: "IN_PROGRESS" },
      { userId: demoUser.id, title: "Fix follow-redirects auth bypass", provider: "JIRA", externalRef: "SEC-419", packageName: "follow-redirects", fromVersion: "1.14.7", toVersion: "1.15.4", status: "OPEN" },
      { userId: demoUser.id, title: "Update axios to latest stable", provider: "GITHUB", externalRef: "#1842", packageName: "axios", fromVersion: "0.21.1", toVersion: "1.6.0", status: "DONE" },
      { userId: demoUser.id, title: "Yank ua-parser-js (actively exploited)", provider: "JIRA", externalRef: "SEC-421", packageName: "ua-parser-js", fromVersion: "0.7.31", toVersion: "0.7.33", status: "OPEN" },
      { userId: demoUser.id, title: "Remediate @grpc/grpc-js RCE", provider: "LINEAR", externalRef: "ENG-231", packageName: "@grpc/grpc-js", fromVersion: "1.9.4", toVersion: "1.10.0", status: "IN_PROGRESS" },
    ],
  });

  console.log("6 fix tasks seeded");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
