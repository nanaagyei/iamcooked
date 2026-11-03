// ─── Inline type definitions matching @prisma/client enums ───
// Defined here so the file is self-contained and always resolves.

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";
export type Confidence = "CONFIRMED" | "LIKELY" | "DEVELOPING" | "UNVERIFIED" | "DISPUTED";
export type IncidentStatus = "DRAFT" | "NEEDS_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type Ecosystem = "NPM" | "PYPI" | "GO" | "MAVEN" | "RUBYGEMS" | "NUGET" | "CARGO" | "COMPOSER" | "GITHUB_ACTIONS" | "UNKNOWN";
export type IncidentType =
  | "CVE"
  | "SUPPLY_CHAIN_ATTACK"
  | "MALICIOUS_PACKAGE"
  | "MAINTAINER_COMPROMISE"
  | "CI_CD_COMPROMISE"
  | "SECRET_EXFILTRATION"
  | "DATA_BREACH"
  | "PACKAGE_TYPO_SQUATTING"
  | "DEPENDENCY_CONFUSION"
  | "OTHER";
export type SourceType =
  | "OSV"
  | "GITHUB_ADVISORY"
  | "CISA_KEV"
  | "NVD"
  | "VENDOR_BLOG"
  | "MAINTAINER_ADVISORY"
  | "NEWS_ARTICLE"
  | "COMMUNITY_POST"
  | "MANUAL";

// ─── Sub-object interfaces (for Prisma Json fields) ───

export interface RecommendedAction {
  title: string;
  description: string;
  urgency: "immediate" | "soon" | "when-possible" | "monitor";
  command?: string;
}

export interface AffectedPackageEntry {
  name: string;
  ecosystem: string;
  affected: string;
  patched: string | null;
}

export interface TimelineEntry {
  date: string;
  event: string;
}

// ─── Source & package interfaces (standalone, not nested in Incident) ───

export interface MockSource {
  id: string;
  name: string;
  url: string;
  sourceType: SourceType;
  trustTier: 1 | 2 | 3;
  title?: string;
  excerpt?: string;
  publishedAt: string;
}

export interface MockIncidentSource {
  id: string;
  incidentId: string;
  sourceId: string;
  source: MockSource;
}

export interface MockIncidentPackage {
  id: string;
  incidentId: string;
  packageName: string;
  ecosystem: Ecosystem;
  affectedVersions: string[];
  patchedVersions: string[];
  notes?: string;
}

// ─── Top-level mock incident (mirrors Prisma Incident + nested relations) ───

export interface MockIncident {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  severity: Severity;
  confidence: Confidence;
  status: IncidentStatus;
  ecosystem: Ecosystem;
  incidentType: IncidentType;
  beginnerTldr: string;
  technicalSummary: string;
  recommendedActions: RecommendedAction[];
  affectedPackages: AffectedPackageEntry[];
  timeline: TimelineEntry[];
  sources: MockIncidentSource[];
  packages: MockIncidentPackage[];
  publishedAt: string;
  createdAt: string;
}

// ─── Shared sources (reused across incidents for realism) ───

const sourceOSV = (id: string, advisoryId: string, publishedAt: string, excerpt?: string): MockSource => ({
  id,
  name: "OSV",
  url: `https://osv.dev/vulnerability/${advisoryId}`,
  sourceType: "OSV" as const,
  trustTier: 3,
  title: `Open Source Vulnerability — ${advisoryId}`,
  excerpt,
  publishedAt,
});

const sourceGitHubAdvisory = (id: string, ghsaId: string, publishedAt: string, excerpt?: string): MockSource => ({
  id,
  name: "GitHub Advisory Database",
  url: `https://github.com/advisories/${ghsaId}`,
  sourceType: "GITHUB_ADVISORY" as const,
  trustTier: 3,
  title: `GitHub Advisory — ${ghsaId}`,
  excerpt,
  publishedAt,
});

const sourceVendorBlog = (id: string, vendor: string, url: string, publishedAt: string, excerpt?: string): MockSource => ({
  id,
  name: `${vendor} Security Blog`,
  url,
  sourceType: "VENDOR_BLOG" as const,
  trustTier: 2,
  title: `${vendor} Security Advisory`,
  excerpt,
  publishedAt,
});

const sourceMaintainer = (id: string, pkg: string, url: string, publishedAt: string, excerpt?: string): MockSource => ({
  id,
  name: `${pkg} Maintainers`,
  url,
  sourceType: "MAINTAINER_ADVISORY" as const,
  trustTier: 3,
  title: `Maintainer Advisory for ${pkg}`,
  excerpt,
  publishedAt,
});

const sourceNVD = (id: string, cveId: string, publishedAt: string, excerpt?: string): MockSource => ({
  id,
  name: "National Vulnerability Database",
  url: `https://nvd.nist.gov/vuln/detail/${cveId}`,
  sourceType: "NVD" as const,
  trustTier: 3,
  title: `${cveId} — NVD Detail`,
  excerpt,
  publishedAt,
});

// ─── Helper to build an incident source relation ───

const makeIncidentSource = (incidentId: string, source: MockSource): MockIncidentSource => ({
  id: `is_${source.id}`,
  incidentId,
  sourceId: source.id,
  source,
});

// ═══════════════════════════════════════════════════════════
// INCIDENT 1 — lodash prototype pollution (CVE)
// ═══════════════════════════════════════════════════════════

const incident1: MockIncident = {
  id: "inc_cve_lodash_pp_2024",
  slug: "cve-2024-38972-lodash-prototype-pollution-mergewith",
  title: "CVE-2024-38972: lodash prototype pollution via _.mergeWith when called with attacker-controlled key paths",
  shortTitle: "lodash prototype pollution (_.mergeWith)",
  severity: "HIGH",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "CVE",
  beginnerTldr:
    "A widely-used utility library, lodash, has a bug in its `_.mergeWith` function that lets attackers pollute the global Object prototype. In practice this means an attacker who controls the keys being merged can inject properties into every object in your app—turning a data-processing bug into authentication bypass or remote code execution. Upgrade to lodash 4.17.22 or later to fix this.",
  technicalSummary:
    "The `_.mergeWith` function in lodash versions prior to 4.17.22 does not properly sanitize key paths that include `__proto__`, `constructor`, or `prototype`. When customizer callbacks are used alongside attacker-controlled key names, properties are written directly onto `Object.prototype`. This is a classic prototype pollution vector. Exploitation requires the application to merge attacker-supplied JSON into a target object. Impact ranges from denial-of-service (corrupted built-in methods) to privilege escalation in Node.js servers and client-side XSS in browser bundles. The fix introduces a denylist of blocked property names in the internal `safeGet` and `baseMerge` utilities.",
  recommendedActions: [
    {
      title: "Upgrade lodash to 4.17.22 or later",
      description:
        "The fix was backported to the 4.x line. Run `npm ls lodash` to verify every copy in your tree.",
      urgency: "immediate",
      command: "npm install lodash@^4.17.22",
    },
    {
      title: "Audit for lodash copies in lockfiles and bundled dependencies",
      description:
        "Some transitive dependencies pin older lodash versions. Use `npm why lodash` and check your lockfile. Consider overrides/resolutions.",
      urgency: "soon",
      command: "npm ls lodash --all",
    },
    {
      title: "Sanitize user input before passing to merge utilities",
      description:
        "If you cannot upgrade immediately, strip `__proto__`, `constructor`, and `prototype` keys from any user-supplied objects before merging.",
      urgency: "when-possible",
    },
  ],
  affectedPackages: [
    {
      name: "lodash",
      ecosystem: "npm",
      affected: ">= 4.0.0, < 4.17.22",
      patched: "4.17.22",
    },
    {
      name: "lodash-es",
      ecosystem: "npm",
      affected: ">= 4.0.0, < 4.17.22",
      patched: "4.17.22",
    },
  ],
  timeline: [
    { date: "2024-09-12", event: "Vulnerability privately reported to lodash maintainers via Snyk" },
    { date: "2024-09-18", event: "Maintainers acknowledge and begin triage" },
    { date: "2024-10-03", event: "CVE-2024-38972 reserved by MITRE" },
    { date: "2024-10-10", event: "Patch committed to lodash 4.17.22 and released to npm" },
    { date: "2024-10-11", event: "GitHub Advisory GHSA-9xr4-8qw5-3m2p published" },
    { date: "2024-10-12", event: "NVD entry published with CVSS 7.3" },
    { date: "2024-10-14", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_lodash_1",
      incidentId: "inc_cve_lodash_pp_2024",
      packageName: "lodash",
      ecosystem: "NPM",
      affectedVersions: [">= 4.0.0, < 4.17.22"],
      patchedVersions: ["4.17.22"],
    },
    {
      id: "incpkg_lodash_es_1",
      incidentId: "inc_cve_lodash_pp_2024",
      packageName: "lodash-es",
      ecosystem: "NPM",
      affectedVersions: [">= 4.0.0, < 4.17.22"],
      patchedVersions: ["4.17.22"],
    },
  ],
  publishedAt: "2024-10-14T12:00:00.000Z",
  createdAt: "2024-10-14T12:00:00.000Z",
};

// Attach sources after declaration so we can reference the incident id
incident1.sources = [
  makeIncidentSource(incident1.id, sourceNVD("src_nvd_lodash_pp", "CVE-2024-38972", "2024-10-12T08:00:00.000Z")),
  makeIncidentSource(
    incident1.id,
    sourceGitHubAdvisory("src_ghsa_lodash_pp", "GHSA-9xr4-8qw5-3m2p", "2024-10-11T14:00:00.000Z"),
  ),
  makeIncidentSource(incident1.id, sourceOSV("src_osv_lodash_pp", "GHSA-9xr4-8qw5-3m2p", "2024-10-11T14:00:00.000Z")),
  makeIncidentSource(
    incident1.id,
    sourceVendorBlog(
      "src_blog_lodash_pp",
      "Snyk",
      "https://security.snyk.io/vuln/SNYK-JS-LODASH-567746",
      "2024-10-10T10:00:00.000Z",
      "Prototype pollution in lodash.mergeWith — Snyk analysis and remediation guide.",
    ),
  ),
];

// ═══════════════════════════════════════════════════════════
// INCIDENT 2 — Malicious typosquatting package
// ═══════════════════════════════════════════════════════════

const incident2: MockIncident = {
  id: "inc_mal_eslint_config_airbnb_typo_2024",
  slug: "malicious-package-eslint-config-airbnb-type-2024",
  title: "Malicious typosquatting package 'eslint-config-airbnb-type' exfiltrates environment variables and .npmrc tokens",
  shortTitle: "Typosquatting: eslint-config-airbnb-type",
  severity: "CRITICAL",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "PACKAGE_TYPO_SQUATTING",
  beginnerTldr:
    "A malicious package was published to npm with a name nearly identical to the popular `eslint-config-airbnb-typescript` (note the missing 'script' at the end). If you accidentally installed `eslint-config-airbnb-type`, the package's post-install script steals your environment variables and `.npmrc` tokens and sends them to a remote server. Check your package.json lockfile immediately and remove it.",
  technicalSummary:
    "The package `eslint-config-airbnb-type` was published on 2024-08-21 mimicking the legitimate package `eslint-config-airbnb-typescript` (11M+ weekly downloads). The impostor package declares a `postinstall` script that executes `node steal.js`, which enumerates `process.env`, reads `~/.npmrc`, and POSTs the contents to a command-and-control server hosted behind Cloudflare. The package also embeds an obfuscated copy of `node-fetch` to avoid detection by static analysis. Six versions were published over 48 hours before npm Security removed them. GitHub Advisory assigned a severity of CRITICAL due to the credential-exfiltration payload.",
  recommendedActions: [
    {
      title: "Remove the malicious package immediately",
      description:
        "Delete from package.json, node_modules, and all lockfiles. Do not just uninstall — scan for lingering references.",
      urgency: "immediate",
      command: "npm uninstall eslint-config-airbnb-type && npm install",
    },
    {
      title: "Rotate all exposed credentials",
      description:
        "Rotate your npm access token, any `.npmrc` tokens for private registries, and all environment-variable-based secrets that were present in CI environments that ran the install.",
      urgency: "immediate",
    },
    {
      title: "Audit CI logs for any exfiltration indicators",
      description:
        "Look for outbound POST requests to domains you don't recognize from your build pipeline. Block known IOCs at the network layer.",
      urgency: "soon",
    },
    {
      title: "Use npm's name-confusion detection alias",
      description:
        "Register your org-scoped packages under their lookalike names as a defensive measure (`npm org add --protection`).",
      urgency: "when-possible",
    },
  ],
  affectedPackages: [
    {
      name: "eslint-config-airbnb-type",
      ecosystem: "npm",
      affected: "1.0.0 - 1.0.6",
      patched: null,
    },
  ],
  timeline: [
    { date: "2024-08-21T03:12:00Z", event: "First version (1.0.0) published to npm" },
    { date: "2024-08-22T17:45:00Z", event: "Community member flags suspicious package on Twitter/X" },
    { date: "2024-08-23T09:00:00Z", event: "npm Security confirms malicious postinstall script" },
    { date: "2024-08-23T11:30:00Z", event: "All six versions (1.0.0–1.0.6) removed from the registry" },
    { date: "2024-08-23T14:00:00Z", event: "GitHub Advisory GHSA-4f82-pq9v-6h7j published" },
    { date: "2024-08-23T18:00:00Z", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_eslint_typo_1",
      incidentId: "inc_mal_eslint_config_airbnb_typo_2024",
      packageName: "eslint-config-airbnb-type",
      ecosystem: "NPM",
      affectedVersions: ["1.0.0", "1.0.1", "1.0.2", "1.0.3", "1.0.4", "1.0.5", "1.0.6"],
      patchedVersions: [],
      notes: "Malicious package — no patch exists. Remove entirely.",
    },
  ],
  publishedAt: "2024-08-23T18:00:00.000Z",
  createdAt: "2024-08-23T18:00:00.000Z",
};

incident2.sources = [
  makeIncidentSource(
    incident2.id,
    sourceGitHubAdvisory("src_ghsa_eslint_typo", "GHSA-4f82-pq9v-6h7j", "2024-08-23T14:00:00.000Z",
      "The npm package eslint-config-airbnb-type contains a postinstall credential harvester targeting CI environments."),
  ),
  makeIncidentSource(
    incident2.id,
    sourceOSV("src_osv_eslint_typo", "GHSA-4f82-pq9v-6h7j", "2024-08-23T14:00:00.000Z"),
  ),
  makeIncidentSource(
    incident2.id,
    sourceMaintainer(
      "src_mnt_eslint_typo",
      "eslint-config-airbnb-typescript",
      "https://github.com/iamturns/eslint-config-airbnb-typescript/security/advisories/malicious-imposter",
      "2024-08-23T10:00:00.000Z",
    ),
  ),
];

// ═══════════════════════════════════════════════════════════
// INCIDENT 3 — Supply-chain attack on ua-parser-js
// ═══════════════════════════════════════════════════════════

const incident3: MockIncident = {
  id: "inc_sca_ua_parser_js_2024",
  slug: "supply-chain-attack-ua-parser-js-2024",
  title: "Supply-chain attack: ua-parser-js publishes versions containing cryptocurrency miner and credential-stealer in NPM packages",
  shortTitle: "Supply-chain attack on ua-parser-js",
  severity: "CRITICAL",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "SUPPLY_CHAIN_ATTACK",
  beginnerTldr:
    "A popular User-Agent parsing library used by millions of websites and Node.js apps had three of its npm releases hijacked to include malware. The compromised versions install a hidden cryptocurrency miner and steal credentials from browser localStorage. If you installed ua-parser-js versions 0.7.31, 0.8.2, or 1.0.1, you need to replace them with the clean versions (0.7.32 / 0.8.3 / 1.0.2) and rotate any credentials that were active during the compromise window.",
  technicalSummary:
    "On 2024-11-15, the maintainer's npm 2FA token was phished via a targeted OAuth app impersonation. The attacker published three tainted versions across the 0.7.x, 0.8.x, and 1.0.x release lines within a 40-minute window. Each tainted tarball includes the legitimate library code plus a pre-built native addon (`lib/crypto-helper.node`) that downloads and runs an XMRig miner on Linux x64 hosts, while a separate script (`lib/session-collect.js`) exfiltrates `window.localStorage` entries in browser bundles. The miner payload is retrieved from a now-sinkholed C2 domain. npm Security revoked the compromised tokens and unpublished the tainted versions within 4 hours of detection. Analysis showed 2 847 unique IPs downloaded the tainted versions before takedown.",
  recommendedActions: [
    {
      title: "Downgrade or patch to clean versions immediately",
      description:
        "The clean releases are 0.7.32, 0.8.3, and 1.0.2. Verify the integrity hash against the maintainer's published checksums.",
      urgency: "immediate",
      command:
        "npm install ua-parser-js@0.7.32   # or @0.8.3, @1.0.2 depending on your major version",
    },
    {
      title: "Rotate all npm tokens and session secrets",
      description:
        "The credential stealer targets browser storage. If you serve ua-parser-js to clients, assume client-side secrets were exfiltrated. Rotate server-side npm tokens too.",
      urgency: "immediate",
    },
    {
      title: "Scan production hosts for unexpected CPU spikes",
      description:
        "The XMRig miner targets Linux x64. Check for unexpected `xmrig` processes and unusual outbound connections on port 14444.",
      urgency: "soon",
      command: "ps aux | grep -i xmrig",
    },
    {
      title: "Pin ua-parser-js to exact version with integrity hash",
      description:
        "Add a `integrity` field in your lockfile and enable npm's `--verify-signatures` flag to prevent future poisoned updates.",
      urgency: "when-possible",
    },
  ],
  affectedPackages: [
    {
      name: "ua-parser-js",
      ecosystem: "npm",
      affected: "0.7.31, 0.8.2, 1.0.1",
      patched: "0.7.32 / 0.8.3 / 1.0.2",
    },
  ],
  timeline: [
    { date: "2024-11-15T08:05:00Z", event: "Maintainer's npm account compromised via OAuth phishing" },
    { date: "2024-11-15T08:14:00Z", event: "Tainted version 1.0.1 published" },
    { date: "2024-11-15T08:27:00Z", event: "Tainted version 0.8.2 published" },
    { date: "2024-11-15T08:38:00Z", event: "Tainted version 0.7.31 published" },
    { date: "2024-11-15T09:12:00Z", event: "Automated scanner flags unusual native addon in tarball" },
    { date: "2024-11-15T10:30:00Z", event: "npm Security revokes token, unpublishes all three versions" },
    { date: "2024-11-15T14:00:00Z", event: "GitHub Advisory GHSA-fj7q-6p8v-9m2x published" },
    { date: "2024-11-15T15:00:00Z", event: "CISA adds incident to Known Exploited Vulnerabilities catalog" },
    { date: "2024-11-15T18:00:00Z", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_ua_parser_1",
      incidentId: "inc_sca_ua_parser_js_2024",
      packageName: "ua-parser-js",
      ecosystem: "NPM",
      affectedVersions: ["0.7.31", "0.8.2", "1.0.1"],
      patchedVersions: ["0.7.32", "0.8.3", "1.0.2"],
      notes: "All published after the compromise and verified clean by maintainer.",
    },
  ],
  publishedAt: "2024-11-15T18:00:00.000Z",
  createdAt: "2024-11-15T18:00:00.000Z",
};

incident3.sources = [
  makeIncidentSource(
    incident3.id,
    sourceGitHubAdvisory("src_ghsa_ua_parser", "GHSA-fj7q-6p8v-9m2x", "2024-11-15T14:00:00.000Z",
      "Compromised NPM account used to publish ua-parser-js versions containing cryptocurrency miner and credential stealer."),
  ),
  makeIncidentSource(
    incident3.id,
    sourceOSV("src_osv_ua_parser", "GHSA-fj7q-6p8v-9m2x", "2024-11-15T14:00:00.000Z"),
  ),
  makeIncidentSource(
    incident3.id,
    sourceVendorBlog(
      "src_cisa_ua_parser",
      "CISA",
      "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      "2024-11-15T15:00:00.000Z",
    ),
  ),
];

// ═══════════════════════════════════════════════════════════
// INCIDENT 4 — RCE in @grpc/grpc-js
// ═══════════════════════════════════════════════════════════

const incident4: MockIncident = {
  id: "inc_cve_grpc_js_rce_2024",
  slug: "cve-2024-45829-grpc-js-remote-code-execution",
  title: "CVE-2024-45829: @grpc/grpc-js remote code execution via maliciously crafted metadata when using insecure credentials",
  shortTitle: "RCE in @grpc/grpc-js",
  severity: "CRITICAL",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "CVE",
  beginnerTldr:
    "The official gRPC JavaScript library has a serious bug that lets an attacker run arbitrary code on your server. If your gRPC endpoints accept connections without TLS (often the case in internal microservices), a specially crafted metadata header can overwrite internal object prototypes and trigger code execution. Upgrade to @grpc/grpc-js 1.10.11 or later to close this vulnerability.",
  technicalSummary:
    "The vulnerability resides in the `Metadata` class constructor of @grpc/grpc-js versions < 1.10.11. When `grpc.credentials.createInsecure()` is used, incoming metadata values are passed through `Object.assign` without sanitization of `__proto__` paths. A remote unauthenticated attacker can send a gRPC request with a binary metadata value whose key resolves to `constructor.prototype`, polluting the metadata object's prototype chain and overwriting methods called downstream. The practical exploit chains this into arbitrary code execution via `child_process.execSync` when the polluted object is passed to a user-defined server handler that invokes a shell command (e.g., health-check probes). The fix replaces `Object.assign` with a safe property-set loop that skips dangerous keys.",
  recommendedActions: [
    {
      title: "Upgrade @grpc/grpc-js to 1.10.11 or later",
      description:
        "The fix is available in the 1.10.x line. Check for nested copies: `npm ls @grpc/grpc-js`.",
      urgency: "immediate",
      command: "npm install @grpc/grpc-js@^1.10.11",
    },
    {
      title: "Enforce TLS on all gRPC endpoints",
      description:
        "Even after patching, running gRPC over insecure channels exposes metadata in plaintext. Use `grpc.credentials.createSsl()` with proper certificate validation.",
      urgency: "soon",
    },
    {
      title: "Add gRPC-level input validation middleware",
      description:
        "Strip metadata keys containing `__proto__`, `constructor`, or `prototype` before they reach handler logic.",
      urgency: "when-possible",
    },
  ],
  affectedPackages: [
    {
      name: "@grpc/grpc-js",
      ecosystem: "npm",
      affected: ">= 1.0.0, < 1.10.11",
      patched: "1.10.11",
    },
  ],
  timeline: [
    { date: "2024-10-28", event: "Vulnerability discovered by internal security team at a large fintech company" },
    { date: "2024-11-02", event: "Reported privately to Google gRPC maintainers via Google VRP" },
    { date: "2024-11-08", event: "CVE-2024-45829 reserved" },
    { date: "2024-11-15", event: "Patch released in @grpc/grpc-js 1.10.11" },
    { date: "2024-11-16", event: "GitHub Advisory GHSA-9w8v-7h6p-3m4q published" },
    { date: "2024-11-18", event: "NVD entry published with CVSS 9.8" },
    { date: "2024-11-19", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_grpc_1",
      incidentId: "inc_cve_grpc_js_rce_2024",
      packageName: "@grpc/grpc-js",
      ecosystem: "NPM",
      affectedVersions: [">= 1.0.0, < 1.10.11"],
      patchedVersions: ["1.10.11"],
    },
  ],
  publishedAt: "2024-11-19T12:00:00.000Z",
  createdAt: "2024-11-19T12:00:00.000Z",
};

incident4.sources = [
  makeIncidentSource(incident4.id, sourceNVD("src_nvd_grpc_js", "CVE-2024-45829", "2024-11-18T08:00:00.000Z")),
  makeIncidentSource(
    incident4.id,
    sourceGitHubAdvisory("src_ghsa_grpc_js", "GHSA-9w8v-7h6p-3m4q", "2024-11-16T12:00:00.000Z",
      "Remote code execution in @grpc/grpc-js through prototype pollution in Metadata class when using insecure credentials."),
  ),
  makeIncidentSource(
    incident4.id,
    sourceOSV("src_osv_grpc_js", "GHSA-9w8v-7h6p-3m4q", "2024-11-16T12:00:00.000Z"),
  ),
];

// ═══════════════════════════════════════════════════════════
// INCIDENT 5 — Dependency confusion on internal package
// ═══════════════════════════════════════════════════════════

const incident5: MockIncident = {
  id: "inc_depconf_internal_auth_2024",
  slug: "dependency-confusion-internal-auth-sdk-2024",
  title: "Dependency confusion attack: malicious public package 'stripe-internal-auth-sdk' hijacks private registry resolution for Stripe-like monorepos",
  shortTitle: "Dependency confusion: stripe-internal-auth-sdk",
  severity: "HIGH",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "DEPENDENCY_CONFUSION",
  beginnerTldr:
    "An attacker published a package on the public npm registry with the same name as a company's internal private package. Because npm (and Yarn/pnpm by default) check the public registry before private registries, any install that didn't have explicit registry scoping pulled the malicious public package instead. The attacker's package exfiltrates API keys and AWS credentials. If you use `stripe-internal-auth-sdk` as a private package, verify your `.npmrc` scoping and rotate credentials.",
  technicalSummary:
    "The attacker registered `stripe-internal-auth-sdk` on the public npm registry after discovering the name in a leaked `package.json` from a bug-bounty report. By default, npm resolves package names against the public registry unless the scope is explicitly mapped to a private registry via `.npmrc` (e.g., `@stripe-internal:registry=https://npm.stripeinternal.com/`). Without this mapping, `npm install stripe-internal-auth-sdk` fetches the public package. The malicious package declares a `preinstall` script that executes `node collect.js`, which uploads environment variables and `~/.aws/credentials` to a Pastebin-like endpoint reachable over DNS-over-HTTPS to evade corporate DNS monitoring. The attack was discovered when a developer noticed the package's README differed from the internal GitLab repo.",
  recommendedActions: [
    {
      title: "Verify registry scoping in your .npmrc",
      description:
        "Add explicit registry mappings for all internal scoped packages. Example: `@your-scope:registry=https://npm.yourcompany.com/`.",
      urgency: "immediate",
    },
    {
      title: "Shut down and block the malicious package",
      description:
        "If you installed the public version, remove it and check for any residual scripts. Report to npm Security to request takedown.",
      urgency: "immediate",
      command: "npm uninstall stripe-internal-auth-sdk",
    },
    {
      title: "Rotate all credentials exposed during the window",
      description:
        "Rotate AWS IAM keys, API tokens, and any secrets stored in environment variables on developer machines and CI runners that ran the install.",
      urgency: "immediate",
    },
    {
      title: "Enable package-lock integrity verification",
      description:
        "Use `npm ci` instead of `npm install` in CI to enforce exact lockfile resolution. Consider using a lockfile linter in pre-commit hooks.",
      urgency: "soon",
    },
  ],
  affectedPackages: [
    {
      name: "stripe-internal-auth-sdk",
      ecosystem: "npm",
      affected: "1.0.0 - 1.0.3 (malicious public versions)",
      patched: null,
    },
  ],
  timeline: [
    { date: "2024-07-05", event: "Package name leaked in public GitHub issue on an open-source fork" },
    { date: "2024-07-08", event: "Attacker publishes malicious stripe-internal-auth-sdk 1.0.0 to npm" },
    { date: "2024-07-10", event: "Internal developer at affected company encounters mismatched README" },
    { date: "2024-07-11", event: "Security team confirms dependency confusion, contacts npm Security" },
    { date: "2024-07-11T18:00:00Z", event: "npm removes all published versions of the malicious package" },
    { date: "2024-07-12", event: "GitHub Advisory GHSA-6v3q-7f2w-4x8m published" },
    { date: "2024-07-12T20:00:00Z", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_depconf_1",
      incidentId: "inc_depconf_internal_auth_2024",
      packageName: "stripe-internal-auth-sdk",
      ecosystem: "NPM",
      affectedVersions: ["1.0.0", "1.0.1", "1.0.2", "1.0.3"],
      patchedVersions: [],
      notes: "Malicious public package removed. No legitimate public package exists.",
    },
  ],
  publishedAt: "2024-07-12T20:00:00.000Z",
  createdAt: "2024-07-12T20:00:00.000Z",
};

incident5.sources = [
  makeIncidentSource(
    incident5.id,
    sourceGitHubAdvisory("src_ghsa_depconf", "GHSA-6v3q-7f2w-4x8m", "2024-07-12T14:00:00.000Z",
      "Dependency confusion attack: public npm package stripe-internal-auth-sdk impersonated a private registry package."),
  ),
  makeIncidentSource(
    incident5.id,
    sourceOSV("src_osv_depconf", "GHSA-6v3q-7f2w-4x8m", "2024-07-12T14:00:00.000Z"),
  ),
  makeIncidentSource(
    incident5.id,
    sourceVendorBlog(
      "src_blog_depconf",
      "npm Security Blog",
      "https://blog.npmjs.org/post/dependency-confusion-stripe-internal",
      "2024-07-12T10:00:00.000Z",
      "How a single missing .npmrc scope line exposed internal packages to dependency confusion.",
    ),
  ),
];

// ═══════════════════════════════════════════════════════════
// INCIDENT 6 — Maintainer compromise on node-ipc
// ═══════════════════════════════════════════════════════════

const incident6: MockIncident = {
  id: "inc_mntr_node_ipc_2024",
  slug: "maintainer-compromise-node-ipc-peacenotwar-2024",
  title: "Maintainer compromise: node-ipc author publishes protestware that overwrites files based on geo-IP of host and adds malicious transitive dependency",
  shortTitle: "Maintainer compromise: node-ipc protestware",
  severity: "CRITICAL",
  confidence: "CONFIRMED",
  status: "PUBLISHED",
  ecosystem: "NPM",
  incidentType: "MAINTAINER_COMPROMISE",
  beginnerTldr:
    "The maintainer of the widely-used Node.js IPC library injected 'protestware' into new releases. If your server's IP geolocates to Russia or Belarus, the library deliberately overwrites files on disk and replaces them with a heart emoji. This is installed automatically when your dependencies upgrade to the affected versions. Upgrade to the patched fork `@peacenotwar-lts/node-ipc` or pin to version 9.2.1 and audit your transitive dependency chain.",
  technicalSummary:
    "Starting with node-ipc v10.1.2, the maintainer introduced `peacenotwar`, an obfuscated transitive dependency that performs IP geolocation via an external API. If the host's country matches a hardcoded blocklist, the module recursively walks user-writable directories (`$HOME`, `/tmp`, any path from `process.env`) and overwrites file contents with a single heart emoji (❤️). The module also appends `es5-ext` — a completely unrelated package — as a dependency to enable a secondary code path that injects newline-delimited protest messages into any file with a `.js`, `.ts`, `.vue`, or `.svelte` extension. The npm Security team flagged this as malicious because the behavior is not disclosed in the package README or changelog. All versions from 10.1.2 through 11.1.7 are affected.",
  recommendedActions: [
    {
      title: "Pin node-ipc to version 9.2.1",
      description:
        'Version 9.2.1 is the last clean release. Add an override/resolution to prevent transitive upgrades: "overrides": { "node-ipc": "9.2.1" } in package.json.',
      urgency: "immediate",
      command: "npm install node-ipc@9.2.1",
    },
    {
      title: "Migrate to the community-maintained fork",
      description:
        "`@peacenotwar-lts/node-ipc` is a drop-in replacement maintained by former collaborators. It mirrors the 9.x API and receives security patches.",
      urgency: "soon",
      command: "npm uninstall node-ipc && npm install @peacenotwar-lts/node-ipc",
    },
    {
      title: "Audit file integrity on affected hosts",
      description:
        "Check for heart-emoji file corruption in user directories. Restore from backups. Run `find ~/ -type f -size 6c` to locate byte-exact overwrites.",
      urgency: "soon",
      command: "find ~/ -type f -size 6c -exec file {} \\;",
    },
    {
      title: "Remove es5-ext if installed through protestware chain",
      description:
        "Run `npm ls es5-ext` to verify it was not pulled in transitively. Remove it if it appears as an unexpected dependency.",
      urgency: "when-possible",
      command: "npm ls es5-ext",
    },
  ],
  affectedPackages: [
    {
      name: "node-ipc",
      ecosystem: "npm",
      affected: ">= 10.1.2, <= 11.1.7",
      patched: "9.2.1 (last clean), @peacenotwar-lts/node-ipc (fork)",
    },
    {
      name: "peacenotwar",
      ecosystem: "npm",
      affected: ">= 9.0.0",
      patched: null,
    },
  ],
  timeline: [
    { date: "2024-03-08", event: "node-ipc v10.1.2 published, introducing peacenotwar as a dependency" },
    { date: "2024-03-09", event: "Community members report unexpected es5-ext and vunerable directory scanning" },
    { date: "2024-03-10", event: "npm Security investigation opened" },
    { date: "2024-03-11", event: "npm suspends maintainer account; v10.1.2 through v11.1.7 marked as malicious" },
    { date: "2024-03-13", event: "GitHub Advisory GHSA-9r7x-p2hm-5m8j published" },
    { date: "2024-03-14", event: "Community fork @peacenotwar-lts/node-ipc published" },
    { date: "2024-03-15", event: "iamcooked ingested and published this incident" },
  ],
  sources: [],
  packages: [
    {
      id: "incpkg_node_ipc_1",
      incidentId: "inc_mntr_node_ipc_2024",
      packageName: "node-ipc",
      ecosystem: "NPM",
      affectedVersions: [">= 10.1.2, <= 11.1.7"],
      patchedVersions: ["9.2.1"],
      notes: "Versions 10.1.2–11.1.7 are malicious. Pin to 9.2.1 or migrate to @peacenotwar-lts/node-ipc.",
    },
    {
      id: "incpkg_peacenotwar_1",
      incidentId: "inc_mntr_node_ipc_2024",
      packageName: "peacenotwar",
      ecosystem: "NPM",
      affectedVersions: [">= 9.0.0"],
      patchedVersions: [],
      notes: "Entirely malicious. Should not exist in any dependency tree.",
    },
  ],
  publishedAt: "2024-03-15T12:00:00.000Z",
  createdAt: "2024-03-15T12:00:00.000Z",
};

incident6.sources = [
  makeIncidentSource(
    incident6.id,
    sourceGitHubAdvisory("src_ghsa_node_ipc", "GHSA-9r7x-p2hm-5m8j", "2024-03-13T10:00:00.000Z",
      "node-ipc versions >= 10.1.2 contain protestware; overwrites user files based on geo-IP and includes obfuscated transitive dependency."),
  ),
  makeIncidentSource(
    incident6.id,
    sourceOSV("src_osv_node_ipc", "GHSA-9r7x-p2hm-5m8j", "2024-03-13T10:00:00.000Z"),
  ),
  makeIncidentSource(
    incident6.id,
    sourceVendorBlog(
      "src_blog_node_ipc",
      "Snyk",
      "https://snyk.io/blog/node-ipc-protestware-supply-chain-attack/",
      "2024-03-12T16:00:00.000Z",
      "Analyzing the node-ipc protestware incident: how a maintainer weaponized their own package.",
    ),
  ),
];

// ─── Aggregate and export ───

export const mockIncidents: MockIncident[] = [
  incident1,
  incident2,
  incident3,
  incident4,
  incident5,
  incident6,
];

export const incidentsBySlug: Record<string, MockIncident> = {
  [incident1.slug]: incident1,
  [incident2.slug]: incident2,
  [incident3.slug]: incident3,
  [incident4.slug]: incident4,
  [incident5.slug]: incident5,
  [incident6.slug]: incident6,
};

export { incident1 as cve202438972Lodash };
export { incident2 as maliciousEslintConfigAirbnbType };
export { incident3 as supplyChainAttackUaParserJs };
export { incident4 as cve202445829GrpcJs };
export { incident5 as dependencyConfusionInternalAuth };
export { incident6 as maintainerCompromiseNodeIpc };
