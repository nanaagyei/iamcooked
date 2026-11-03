
# Incident Specification

## Incident Definition

An incident is a real-world security event that may affect builders, packages, infrastructure, or software projects.

Examples:

- npm package compromise
- PyPI malicious package campaign
- GitHub Actions token theft
- exposed maintainer credential
- actively exploited CVE
- major data breach
- supply-chain attack
- dependency confusion campaign

## Incident Page Required Sections

### Header

- Title
- Severity
- Confidence
- Ecosystem
- Published date
- Last updated date
- Source count

### Beginner TLDR

Plain-English summary for non-security experts.

### Who May Be Affected

Examples:

- users of package X,
- apps using version range Y,
- maintainers with GitHub Actions workflow Z,
- projects that installed during time window A.

### What Happened

Narrative explanation.

### Why It Matters

Explain practical risk.

### What To Do

Action checklist.

### Technical Details

More advanced details:

- CVEs
- GHSAs
- OSV IDs
- package names
- affected versions
- patched versions
- attack vector
- exploitability
- indicators of compromise
- mitigation

### Sources

Every page must show sources.

### Related Incidents

Show related incidents by:

- package,
- ecosystem,
- attack type,
- CVE,
- maintainer,
- campaign.

## Incident Data Contract

```ts
type Incident = {
  id: string;
  slug: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";
  confidence: "CONFIRMED" | "LIKELY" | "DEVELOPING" | "UNVERIFIED" | "DISPUTED";
  status: "DRAFT" | "NEEDS_REVIEW" | "PUBLISHED" | "ARCHIVED";
  ecosystem?: "NPM" | "PYPI" | "GO" | "MAVEN" | "CARGO" | "UNKNOWN";
  incidentType:
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
  beginnerTldr: string;
  technicalSummary?: string;
  founderImpact?: string;
  affectedPackages: AffectedPackage[];
  recommendedActions: RecommendedAction[];
  sources: Source[];
};