# Scanner Specification

## Purpose

The scanner answers:

"Does this user's project contain packages or versions affected by known vulnerabilities or recent incidents?"

## MVP Input Types

Support:

- package-lock.json
- pnpm-lock.yaml
- yarn.lock

## MVP Output

The scanner returns a normalized dependency list and a risk report.

## Normalized Dependency Format

```ts
type NormalizedDependency = {
  ecosystem: "NPM";
  name: string;
  version: string | null;
  direct: boolean;
  sourceFile: string;
  dependencyPath?: string[];
};

### Scan Flow

1. User uploads lockfile.
2. Backend validates file type and size.
3. Parser extracts dependencies.
4. Dependencies are normalized.
5. Backend queries OSV in batches.
6. Backend checks local incident package mappings.
7. Backend checks GitHub advisory enrichment where available.
8. Backend checks whether any CVE appears in CISA KEV.
9. Findings are scored.
10. Report is generated.
11. Optional AI explanation is generated from structured findings.

### Risk Scoring

Risk score range: 0-100.

### Suggested scoring

* Known vulnerability: +20
* Critical severity: +30
* High severity: +20
* Medium severity: +10
* CISA KEV match: +30
* Direct dependency: +15
* Transitive dependency: +5
* Known malicious package: +40
* Recent supply-chain incident: +25
* Patch available: -5
* No patch available: +10

Clamp score to 100.

Risk Levels

* 90-100: Critical
* 70-89: High
* 40-69: Medium
* 10-39: Low
* 0-9: None

Report Sections

1. Project Risk Summary
2. Most Urgent Findings
3. Affected Packages
4. Possibly Related Packages
5. What Happened
6. What To Do Next
7. Commands To Run
8. Sources
9. Beginner Explanation
10. Technical Details

Required UX Behavior

The scan result page must not overwhelm beginners.

Use progressive disclosure:

* show summary first,
* show urgent actions second,
* hide raw advisory details behind expandable sections,
* provide copyable commands,
* explain terms inline.