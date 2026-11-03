export type LearnContentKind = "guide" | "post";

export type LearnCategory =
  | "fundamentals"
  | "supply-chain"
  | "product"
  | "industry";

export interface LearnSource {
  label: string;
  url: string;
}

export interface LearnArticle {
  slug: string;
  title: string;
  summary: string;
  readTime: string;
  kind: LearnContentKind;
  category: LearnCategory;
  featured?: boolean;
  /** Optional dateline for time-sensitive incident write-ups. */
  dateline?: string;
  sections: Array<{ heading: string; body: string }>;
  sources?: LearnSource[];
}

export const learnCategoryLabels: Record<LearnCategory, string> = {
  fundamentals: "Fundamentals",
  "supply-chain": "Supply chain",
  product: "Using iamcooked",
  industry: "Industry notes",
};

export const learnCategoryImages: Record<LearnCategory, string> = {
  fundamentals: "/images/learn-fundamentals.png",
  "supply-chain": "/images/learn-supply-chain.png",
  product: "/images/learn-product.png",
  industry: "/images/learn-industry.png",
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "miasma-2026-ai-agents",
    title: "The 2026 Miasma wave: supply-chain malware comes for your AI coding agent",
    summary:
      "TeamPCP's Mini Shai-Hulud went open source, and by June 2026 its Miasma variant was riding CI pipelines, shipping valid provenance, and abusing auto-run in Cursor, Claude Code, and friends. What changed, and why it matters most for AI-assisted builders.",
    readTime: "7 min",
    kind: "post",
    category: "supply-chain",
    featured: true,
    dateline: "June 2026",
    sections: [
      {
        heading: "What Miasma is",
        body: "On June 1, 2026, researchers found malicious code in at least 32 packages (96 versions) under the @redhat-cloud-services npm namespace, components that power the Red Hat Hybrid Cloud Console, averaging roughly 80,000 to 117,000 weekly downloads combined. The payload is a lightly reskinned descendant of Mini Shai-Hulud, the supply-chain worm that the threat actor TeamPCP open-sourced earlier in 2026. The Dune references were swapped for Greek mythology, and attacker repositories carry the description 'Miasma: The Spreading Blight', a useful hunting signal. By June 5, Sonatype counted over 300 affected components.",
      },
      {
        heading: "It rode the CI/CD pipeline, not an npm token",
        body: "The packages were not published with a stolen npm token. A Red Hat employee's GitHub account was compromised and used to push malicious orphan commits that bypassed code review, then publish through GitHub Actions using OIDC. That distinction matters: rotating your npm tokens would not have helped here. When the pipeline itself is the attacker, the secrets to worry about are CI credentials, cloud keys, and GitHub tokens.",
      },
      {
        heading: "Valid provenance, invalid intent",
        body: "Because the publish ran inside a legitimate repository's Actions context, the malicious releases shipped with valid SLSA provenance attestations. The provenance was technically correct: the package really was built by that repository's workflow. What it could not tell you is that the workflow itself was unauthorized. This is the same gap TeamPCP exploited against TanStack weeks earlier. Provenance verification is necessary, and on its own it is not sufficient.",
      },
      {
        heading: "Then it came for the agents",
        body: "The campaign escalated in waves. The second abused binding.gyp, a file meant for compiling native add-ons, to run code during install even when scripts are nominally ignored. The third reportedly abused auto-run features in Claude Code, Gemini, Cursor, and VS Code-based editors via files like .cursor/rules and .vscode/tasks.json. If your agent installs and runs dependencies on your behalf, the install step is the attack surface, which is exactly the workflow iamcooked was built to watch.",
      },
      {
        heading: "What to do",
        body: "Audit your tree for @redhat-cloud-services packages and the wider wave, including transitive pulls. If you installed an affected version, treat CI secrets, cloud credentials, SSH keys, and npm and GitHub tokens as exposed and rotate them, not just npm tokens. Review GitHub, npm, and cloud audit logs for unexpected publishes, workflow changes, or new repositories. Do not rely on provenance alone, and be deliberate about agent auto-run settings. iamcooked matches your installed versions against this wave so you act on what you actually shipped.",
      },
    ],
    sources: [
      {
        label: "Wiz: Miasma Supply Chain Attack Targeting Red Hat npm Packages",
        url: "https://www.wiz.io/blog/miasma-supply-chain-attack-targeting-redhat-npm-packages",
      },
      {
        label: "Aikido: Red Hat npm Packages Compromised to Spread a Credential-Stealing Worm",
        url: "https://www.aikido.dev/blog/red-hat-npm-packages-compromised-credential-stealing-worm",
      },
      {
        label: "Snyk: Miasma Attack Hits Red Hat npm Packages",
        url: "https://snyk.io/blog/miasma-supply-chain-attack-malicious-code-redhat-cloud-services-npm-packages/",
      },
      {
        label: "Sonatype: New Shai-Hulud Miasma Wave Hits Hundreds of npm Packages",
        url: "https://www.sonatype.com/blog/new-shai-hulud-miasma-wave-hits-hundreds-of-npm-packages",
      },
    ],
  },
  {
    slug: "shai-hulud-worm",
    title: "The Shai-Hulud worm: when npm packages started spreading malware on their own",
    summary:
      "In September 2025 a self-replicating worm compromised hundreds of npm packages, stealing developer credentials and republishing itself down the dependency chain. Here is what happened and what to do.",
    readTime: "7 min",
    kind: "post",
    category: "supply-chain",
    dateline: "Updated November 2025",
    sections: [
      {
        heading: "What happened",
        body: "Starting around September 14, 2025, security researchers found a self-replicating worm in the npm registry, publicly named Shai-Hulud. It compromised over 500 package versions, including widely used libraries like @ctrl/tinycolor, ngx-bootstrap, and ng2-file-upload. On September 23, CISA published an alert because the compromise was widespread and hit packages with millions of weekly downloads. This was a turning point: npm attacks moved from one-off nuisances to automated, self-spreading campaigns.",
      },
      {
        heading: "How it spread",
        body: "The worm hijacked a maintainer account, then used that access to publish trojanized versions of every package the account owned. Each infected package, once installed, scanned the environment for secrets and then authenticated to npm as the new victim to publish more infected versions. That feedback loop is what made it a worm rather than a single bad release: every install was a potential new launch point down the dependency chain.",
      },
      {
        heading: "What it stole",
        body: "Shai-Hulud used credential-scanning tooling (TruffleHog) to harvest npm tokens, GitHub Personal Access Tokens, and cloud keys for AWS, GCP, and Azure. It exfiltrated those secrets to attacker-controlled webhooks and to public GitHub repositories named after the worm, and in some cases flipped private repositories to public. End-user apps were less directly affected than build environments, where leaked credentials did the real damage.",
      },
      {
        heading: "The 2.0 escalation",
        body: "In November 2025 a wider campaign dubbed Shai-Hulud 2.0 affected tens of thousands of GitHub repositories. It appears to have started with a phishing campaign that spoofed npm and asked developers to update their multi-factor authentication. This variant added preinstall hooks, persistence through self-hosted GitHub Actions runners, and a punitive fallback: if it could not exfiltrate credentials, it attempted to wipe the user's home directory. Treat any exposed credential as fully compromised.",
      },
      {
        heading: "What to do",
        body: "Audit your package-lock.json or yarn.lock for affected packages, including transitive ones nested deep in the tree. Rotate npm tokens, GitHub PATs, and cloud keys if your build touched a compromised version. Purge local node_modules and caches before reinstalling clean versions. In CI, monitor for unexpected outbound network traffic during installs and block known exfiltration endpoints. iamcooked matches your installed versions against this incident so you are not guessing from a package name alone.",
      },
    ],
    sources: [
      {
        label: "CISA: Widespread Supply Chain Compromise Impacting npm Ecosystem (Sept 23, 2025)",
        url: "https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem",
      },
      {
        label: "Unit 42: Shai-Hulud Worm Compromises npm Ecosystem",
        url: "https://unit42.paloaltonetworks.com/npm-supply-chain-attack/",
      },
      {
        label: "Securelist: Shai-Hulud worm infects 500+ npm packages",
        url: "https://securelist.com/shai-hulud-worm-infects-500-npm-packages-in-a-supply-chain-attack/117547/",
      },
    ],
  },
  {
    slug: "chalk-debug-compromise",
    title: "Inside the chalk and debug compromise",
    summary:
      "A single phishing email put a crypto-stealing payload into packages with billions of weekly downloads. A close read of the September 2025 incident and how to check your lockfile.",
    readTime: "6 min",
    kind: "post",
    category: "supply-chain",
    dateline: "September 2025",
    sections: [
      {
        heading: "The phishing email",
        body: "On September 8, 2025, the npm account of maintainer Qix (Josh Junon) was taken over after a convincing phishing email from the fake domain npmjs.help warned that outdated 2FA credentials would lock the account. The email captured the username, password, and a live one-time code, which was enough to fully take over the account and publish malicious versions of packages Qix maintains, many alongside Sindre Sorhus.",
      },
      {
        heading: "The payload",
        body: "The injected code was a crypto-clipper aimed at browsers. When a Web3 wallet such as MetaMask was present, it hooked wallet calls and intercepted fetch and XMLHttpRequest responses. It scanned for blockchain addresses and silently swapped them for attacker addresses, in some reports using a nearest-match algorithm to pick a similar-looking replacement, across Ethereum, Bitcoin, Solana, and other chains. No browser warning, no obvious sign to the user.",
      },
      {
        heading: "Why it mattered",
        body: "Affected packages including chalk and debug together account for roughly two billion downloads per week. Most projects pull them in transitively, bundled without any direct developer awareness, which is exactly why a styling utility can end up shipping wallet-draining code into a browser app. The malicious versions were live for only about two hours before maintainers and npm removed them, but at that scale even a short window is significant.",
      },
      {
        heading: "How to check your lockfile",
        body: "Look for the specific compromised versions, not just the package names: chalk@5.6.1, debug@4.4.2, ansi-styles@6.2.2, strip-ansi@7.1.1, ansi-regex@6.2.1, color-convert@3.1.1, wrap-ansi@9.0.1, and others published in that window. Update to the patched releases, reinstall, and confirm the bad versions are gone from your lockfile. iamcooked flags these exact version pins if they appear in your dependency tree.",
      },
    ],
    sources: [
      {
        label: "Socket: npm Author Qix Compromised via Phishing Email",
        url: "https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack",
      },
      {
        label: "Snyk: npm Supply Chain Attack via Open Source maintainer compromise",
        url: "https://snyk.io/blog/npm-supply-chain-attack-via-open-source-maintainer-compromise/",
      },
      {
        label: "The Register: Dev caught in phishing net, 18 npm packages compromised",
        url: "https://www.theregister.com/security/2025/09/08/dev-caught-in-phishing-net-18-npm-packages-compromised/1504651",
      },
    ],
  },
  {
    slug: "maintainer-phishing",
    title: "Maintainer phishing is the new supply-chain frontline",
    summary:
      "The biggest npm incidents of 2025 did not start with a clever exploit. They started with an email. Why account takeover is the dominant attack path, and how to defend it from both sides.",
    readTime: "5 min",
    kind: "post",
    category: "industry",
    sections: [
      {
        heading: "Why attackers target maintainers",
        body: "A single popular maintainer can hold publish rights to dozens of foundational packages. Compromise one account and you inherit the trust of every project downstream. Both the chalk/debug compromise and the Shai-Hulud campaigns began with maintainer account takeover, not a memory bug or a zero-day. The registry is only as trustworthy as the accounts allowed to publish to it.",
      },
      {
        heading: "The npmjs.help playbook",
        body: "The recurring pattern in 2025 was a spoofed npm email warning that 2FA credentials were expiring, with an urgent link to a lookalike domain such as npmjs.help. The page captured the password and a live one-time code in real time, defeating TOTP-based two-factor. Time pressure plus a believable brand is enough; the technical bar is low.",
      },
      {
        heading: "What maintainers can do",
        body: "Move from TOTP to phishing-resistant authentication: hardware security keys or passkeys (WebAuthn/FIDO2), which do not hand over a reusable code. Prefer trusted publishing with short-lived OIDC tokens over long-lived npm tokens in CI. Scope and expire any tokens you do keep. Be suspicious of any email that asks you to re-authenticate through a link rather than by navigating to the site yourself.",
      },
      {
        heading: "What consumers can do",
        body: "You cannot stop a maintainer from being phished, but you can shrink the blast radius. Pin versions in a committed lockfile, delay adopting brand-new releases of critical dependencies, and scan after dependency changes so a compromised version that slips in gets caught fast. Defense in depth means assuming any single package can go bad and limiting what that costs you.",
      },
    ],
    sources: [
      {
        label: "Socket: npm Author Qix Compromised via Phishing Email",
        url: "https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack",
      },
      {
        label: "Unit 42: The npm Threat Landscape",
        url: "https://unit42.paloaltonetworks.com/monitoring-npm-supply-chain-attacks/",
      },
    ],
  },
  {
    slug: "what-is-a-cve",
    title: "What is a CVE?",
    summary:
      "A plain-English guide to Common Vulnerabilities and Exposures, and why they matter for your npm project.",
    readTime: "4 min",
    kind: "guide",
    category: "fundamentals",
    sections: [
      {
        heading: "The basics",
        body: "A CVE (Common Vulnerabilities and Exposures) is a public identifier for a known security flaw. When researchers discover a vulnerability in software, it gets assigned a CVE ID like CVE-2024-12345. This lets everyone, including tools like iamcooked, refer to the same issue.",
      },
      {
        heading: "Why npm developers care",
        body: "Your lockfile pins specific package versions. If one of those versions has a published CVE, your app may be vulnerable even if you never wrote the vulnerable code yourself. Transitive dependencies (packages your packages depend on) are the most common source of surprise CVEs.",
      },
      {
        heading: "What to do when you find one",
        body: "Check if the CVE affects your installed version, not just the package name. Look for a patched version in the advisory. Run your test suite after upgrading. If no patch exists, consider workarounds documented in the advisory or temporarily removing the dependency.",
      },
    ],
    sources: [
      {
        label: "OSV: Open Source Vulnerabilities database",
        url: "https://osv.dev/",
      },
      {
        label: "GitHub Advisory Database",
        url: "https://github.com/advisories",
      },
    ],
  },
  {
    slug: "supply-chain-attacks",
    title: "Understanding supply chain attacks",
    summary:
      "How malicious code ends up in trusted packages, and the warning signs to watch for.",
    readTime: "6 min",
    kind: "guide",
    category: "supply-chain",
    sections: [
      {
        heading: "What is a supply chain attack?",
        body: "A supply chain attack targets you by compromising software you depend on, rather than attacking your code directly. An attacker might publish a malicious npm package, hijack a maintainer account, or inject code into a legitimate release. You inherit the risk simply by installing.",
      },
      {
        heading: "Recent patterns in npm",
        body: "The dominant 2025 pattern was maintainer account takeover via phishing, used in both the chalk/debug crypto-clipper compromise and the self-replicating Shai-Hulud worm. By 2026 the frontier moved to the CI/CD pipeline itself: the Miasma wave published through compromised GitHub Actions with valid-but-unauthorized SLSA provenance, abused binding.gyp to run during install, and even targeted AI coding-agent auto-run. Other recurring vectors include typosquatting and malicious install hooks. CISA maintains a Known Exploited Vulnerabilities catalog for issues confirmed to be exploited in the wild.",
      },
      {
        heading: "How iamcooked helps",
        body: "iamcooked cross-references your lockfile against OSV vulnerability data, CISA KEV entries, and curated incident reports. You get a plain-English report showing which of your actual installed versions are affected, not just generic news about a package name.",
      },
    ],
    sources: [
      {
        label: "CISA: Widespread Supply Chain Compromise Impacting npm Ecosystem",
        url: "https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem",
      },
      {
        label: "CISA Known Exploited Vulnerabilities Catalog",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      },
    ],
  },
  {
    slug: "cisa-kev",
    title: "What CISA KEV means for your dependencies",
    summary:
      "Not all vulnerabilities are equal. The Known Exploited Vulnerabilities catalog tells you which ones attackers are actually using right now.",
    readTime: "4 min",
    kind: "guide",
    category: "fundamentals",
    sections: [
      {
        heading: "What KEV is",
        body: "The Known Exploited Vulnerabilities (KEV) catalog is a list maintained by CISA of vulnerabilities with confirmed, reliable evidence of active exploitation in the wild. A CVE describes a flaw; a KEV entry tells you that flaw is being used in real attacks right now. That distinction changes your priorities.",
      },
      {
        heading: "Why 'actively exploited' changes priority",
        body: "A high CVSS score estimates how bad a vulnerability could be in theory. KEV status is evidence of what is happening in practice. A medium-severity issue that is actively exploited often deserves attention before a high-severity one that no one has weaponized. KEV cuts through score inflation and points you at real-world risk.",
      },
      {
        heading: "How iamcooked weights KEV",
        body: "When a finding in your scan matches a CISA KEV entry, iamcooked marks it as actively exploited and weights it more heavily in your risk score. These are the findings to fix first. Every KEV match is labeled with its source so you can verify it against the public catalog yourself.",
      },
    ],
    sources: [
      {
        label: "CISA Known Exploited Vulnerabilities Catalog",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      },
    ],
  },
  {
    slug: "lockfile-hygiene",
    title: "Lockfile hygiene: a five-minute habit",
    summary:
      "Your lockfile is the most honest record of what your app actually ships. A lightweight routine to keep it trustworthy without standing up a security program.",
    readTime: "4 min",
    kind: "guide",
    category: "product",
    sections: [
      {
        heading: "The lockfile is ground truth",
        body: "package.json records your intent; the lockfile records reality, every exact version and transitive dependency that will be installed. When you investigate an incident, the lockfile is what you check, because it reflects what shipped, not what you remember approving.",
      },
      {
        heading: "Pin and review",
        body: "Commit your lockfile and treat changes to it as code worth reviewing. A surprise jump in a transitive dependency is worth a glance, especially during a busy launch week when agent-suggested installs and emergency hotfixes pile up. The diff is small; the signal is high.",
      },
      {
        heading: "Scan after changes",
        body: "Run a scan after any meaningful dependency change. New installs are the moment fresh risk enters your tree, and a quick check catches a compromised version before it sits in production for weeks. Minutes, not meetings.",
      },
      {
        heading: "Rotate on suspicion",
        body: "If you installed a version later flagged as compromised, assume any secret your build could read is exposed. Rotate npm tokens, CI credentials, and cloud keys, then reinstall from clean versions. Rotation is cheap insurance compared to a leaked production key.",
      },
    ],
  },
  {
    slug: "reading-a-scan-report",
    title: "How to read your scan report",
    summary:
      "Walk through a iamcooked scan report and know exactly what to fix first.",
    readTime: "3 min",
    kind: "guide",
    category: "product",
    sections: [
      {
        heading: "Risk score",
        body: "Your risk score (0-100) aggregates the severity of all findings. Scores above 70 indicate high-priority issues. The score weights actively exploited vulnerabilities (CISA KEV) and direct dependencies more heavily than transitive low-severity issues.",
      },
      {
        heading: "Finding types",
        body: "KNOWN VULNERABILITY means OSV found a CVE affecting your installed version. AFFECTED BY INCIDENT means your package matches a curated iamcooked incident. ACTIVELY EXPLOITED means the vulnerability is on CISA's known exploited list. Fix these first.",
      },
      {
        heading: "Action plan",
        body: "Start with findings marked immediate urgency. Update to the patched version shown in the advisory. Re-scan after changes to confirm the finding is resolved. Subscribe to alerts so you hear about new issues affecting your packages.",
      },
    ],
  },
  {
    slug: "ai-coding-and-dependency-risk",
    title: "Why AI coding tools change your dependency risk profile",
    summary:
      "Agents install packages faster than most teams audit them. Here is what that means for solo builders shipping to production.",
    readTime: "5 min",
    kind: "post",
    category: "industry",
    sections: [
      {
        heading: "Speed without a security reviewer",
        body: "When Cursor or Claude adds a dependency to solve a feature request, the decision often happens without a human reading the package's maintainer history, transitive tree, or recent advisories. That is not negligence; it is the default workflow for AI-assisted shipping.",
      },
      {
        heading: "The lockfile is your ground truth",
        body: "Your lockfile records what actually ships, not what you remember approving. Regular scans catch version pins that drifted in through agent-suggested installs, copy-pasted snippets, or emergency hotfixes during a demo week.",
      },
      {
        heading: "A lightweight habit that scales",
        body: "You do not need a security team to stay ahead. Upload your lockfile after meaningful dependency changes, watch packages you rely on heavily, and read incident briefs when severity is high. iamcooked is built for that cadence: minutes, not meetings.",
      },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.slug === slug);
}

export function getFeaturedLearnArticle(): LearnArticle | undefined {
  return learnArticles.find((a) => a.featured) ?? learnArticles[0];
}

export function getLearnArticlesByKind(kind: LearnContentKind): LearnArticle[] {
  return learnArticles.filter((a) => a.kind === kind);
}
