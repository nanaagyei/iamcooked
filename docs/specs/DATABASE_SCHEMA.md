# Database Schema

Use PostgreSQL with Prisma.

## Entity Concepts

### Incident

A real-world security event.

Examples:

- npm package compromise
- maintainer account takeover
- CI/CD secret exfiltration
- actively exploited CVE
- malicious package campaign
- dependency confusion campaign

### Advisory

A structured vulnerability record.

Examples:

- OSV record
- GHSA
- CVE
- CISA KEV record

### Source

A raw source of information.

Examples:

- OSV API response
- GitHub Advisory
- CISA advisory
- vendor blog
- maintainer GitHub issue

### Finding

A project-specific risk discovered during a scan.

Example:

- User project contains `example-package@1.2.3`, which is in an affected version range.

## Prisma Model Draft

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  projects        Project[]
  subscriptions   NewsletterSubscription[]
  scans           ScanReport[]
}

model Project {
  id          String   @id @default(cuid())
  userId      String?
  name        String
  ecosystem   Ecosystem
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user         User? @relation(fields: [userId], references: [id])
  dependencies ProjectDependency[]
  scans        ScanReport[]
}

model ProjectDependency {
  id             String   @id @default(cuid())
  projectId      String
  packageName    String
  version        String?
  ecosystem      Ecosystem
  direct         Boolean  @default(false)
  sourceFile     String?
  createdAt      DateTime @default(now())

  project        Project @relation(fields: [projectId], references: [id])

  @@index([packageName, ecosystem])
}

model Incident {
  id                 String   @id @default(cuid())
  slug               String   @unique
  title              String
  shortTitle         String?
  severity           Severity
  confidence         Confidence
  status             IncidentStatus
  ecosystem          Ecosystem?
  incidentType       IncidentType
  beginnerTldr       String?
  technicalSummary   String?
  founderImpact      String?
  recommendedActions Json?
  affectedPackages   Json?
  timeline           Json?
  publishedAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  sources            IncidentSource[]
  packages           IncidentPackage[]
  findings           ScanFinding[]
}

model IncidentSource {
  id          String   @id @default(cuid())
  incidentId  String
  sourceId    String
  claimScope  String?
  createdAt   DateTime @default(now())

  incident    Incident @relation(fields: [incidentId], references: [id])
  source      Source   @relation(fields: [sourceId], references: [id])
}

model Source {
  id             String   @id @default(cuid())
  name           String
  url            String
  sourceType     SourceType
  trustTier      Int
  title          String?
  excerpt        String?
  rawContentHash String?
  publishedAt    DateTime?
  fetchedAt      DateTime @default(now())

  incidents      IncidentSource[]
}

model Advisory {
  id              String   @id @default(cuid())
  externalId      String   @unique
  source          AdvisorySource
  packageName     String?
  ecosystem       Ecosystem?
  severity        Severity?
  cvssScore       Float?
  summary         String?
  details         String?
  affectedRanges  Json?
  patchedVersions Json?
  references      Json?
  publishedAt     DateTime?
  modifiedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  findings        ScanFinding[]
}

model IncidentPackage {
  id                String   @id @default(cuid())
  incidentId         String
  packageName        String
  ecosystem          Ecosystem
  affectedVersions   Json?
  patchedVersions    Json?
  notes              String?

  incident           Incident @relation(fields: [incidentId], references: [id])

  @@index([packageName, ecosystem])
}

model ScanReport {
  id              String   @id @default(cuid())
  userId          String?
  projectId       String?
  uploadFileName  String?
  ecosystem       Ecosystem
  riskScore       Int
  riskLevel       RiskLevel
  summary         String?
  createdAt       DateTime @default(now())

  user            User? @relation(fields: [userId], references: [id])
  project         Project? @relation(fields: [projectId], references: [id])
  findings        ScanFinding[]
}

model ScanFinding {
  id                String   @id @default(cuid())
  scanReportId       String
  advisoryId         String?
  incidentId         String?
  packageName        String
  installedVersion   String?
  findingType        FindingType
  severity           Severity
  confidence         Confidence
  explanation        String
  actionItems        Json?
  createdAt          DateTime @default(now())

  scanReport         ScanReport @relation(fields: [scanReportId], references: [id])
  advisory           Advisory? @relation(fields: [advisoryId], references: [id])
  incident           Incident? @relation(fields: [incidentId], references: [id])
}

model NewsletterSubscription {
  id          String   @id @default(cuid())
  userId      String?
  email       String
  interests   Json?
  frequency   DigestFrequency @default(WEEKLY)
  createdAt   DateTime @default(now())

  user        User? @relation(fields: [userId], references: [id])
}

enum Ecosystem {
  NPM
  PYPI
  GO
  MAVEN
  RUBYGEMS
  NUGET
  CARGO
  COMPOSER
  GITHUB_ACTIONS
  UNKNOWN
}

enum Severity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
  INFO
  UNKNOWN
}

enum Confidence {
  CONFIRMED
  LIKELY
  DEVELOPING
  UNVERIFIED
  DISPUTED
}

enum IncidentStatus {
  DRAFT
  NEEDS_REVIEW
  PUBLISHED
  ARCHIVED
}

enum IncidentType {
  CVE
  SUPPLY_CHAIN_ATTACK
  MALICIOUS_PACKAGE
  MAINTAINER_COMPROMISE
  CI_CD_COMPROMISE
  SECRET_EXFILTRATION
  DATA_BREACH
  PACKAGE_TYPO_SQUATTING
  DEPENDENCY_CONFUSION
  OTHER
}

enum SourceType {
  OSV
  GITHUB_ADVISORY
  CISA_KEV
  NVD
  VENDOR_BLOG
  MAINTAINER_ADVISORY
  NEWS_ARTICLE
  COMMUNITY_POST
  MANUAL
}

enum AdvisorySource {
  OSV
  GITHUB
  CISA
  NVD
}

enum RiskLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
  NONE
  UNKNOWN
}

enum FindingType {
  KNOWN_VULNERABILITY
  AFFECTED_BY_INCIDENT
  POSSIBLY_RELATED
  ACTIVELY_EXPLOITED
  MALICIOUS_PACKAGE
  OUTDATED_SECURITY_SENSITIVE_PACKAGE
}

enum DigestFrequency {
  DAILY
  WEEKLY
  CRITICAL_ONLY
}