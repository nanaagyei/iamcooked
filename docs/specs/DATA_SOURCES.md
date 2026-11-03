# Data Sources

StackRadar uses trusted, structured, and source-backed vulnerability/security intelligence sources.

## Source Priority

### Tier 1: Structured Authoritative Sources

These should be used for automated matching and enrichment.

1. OSV

2. GitHub Advisory Database

3. CISA Known Exploited Vulnerabilities

4. NVD, later if needed

### Tier 2: Security Research Sources

These can be used for incident context, timelines, and explanation.

1. Vendor security blogs

2. Maintainer advisories

3. GitHub issues and release notes

4. OpenSSF reports

5. Security company research blogs

### Tier 3: Community Signals

These should never be treated as confirmed unless corroborated.

1. Reddit

2. Twitter/X

3. Hacker News

4. Discord/community posts

## OSV

Use OSV for package/version vulnerability matching.

OSV supports:

- querying vulnerabilities for a specific project/package/version,

- batched vulnerability queries,

- retrieving vulnerability records by ID.

Use OSV for the lockfile scanner.

## GitHub Advisory Database

Use GitHub Advisory Database to enrich vulnerability data and support ecosystem coverage.

The GitHub Advisory Database includes GitHub-reviewed advisories across multiple ecosystems.

Use it for:

- advisory lookup,

- affected package/version metadata,

- CVE/GHSA references,

- severity,

- patched versions.

## CISA KEV

Use CISA KEV to detect known exploited vulnerabilities.

A vulnerability present in KEV should receive a higher urgency score because it has evidence of exploitation.

## OpenSSF Scorecard

Use OpenSSF Scorecard later to enrich package trust signals.

This should not block MVP.

Useful future signals:

- maintained status,

- branch protection,

- dependency update tooling,

- token permissions,

- signed releases,

- CI security posture.

## Ingestion Rules

Every imported article/advisory must store:

- source name,

- source URL,

- source type,

- published date,

- fetched date,

- raw title,

- raw content excerpt,

- canonical URL,

- trust tier,

- parser status.

## Claim Rules

No generated explanation can include a factual claim unless it is tied to at least one source.

If the AI infers something, label it as inference.

Use these labels:

- Confirmed

- Likely

- Developing

- Unverified

- Disputed