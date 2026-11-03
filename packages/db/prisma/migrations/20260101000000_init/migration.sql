-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Ecosystem" AS ENUM ('NPM', 'PYPI', 'GO', 'MAVEN', 'RUBYGEMS', 'NUGET', 'CARGO', 'COMPOSER', 'GITHUB_ACTIONS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('CONFIRMED', 'LIKELY', 'DEVELOPING', 'UNVERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('CVE', 'SUPPLY_CHAIN_ATTACK', 'MALICIOUS_PACKAGE', 'MAINTAINER_COMPROMISE', 'CI_CD_COMPROMISE', 'SECRET_EXFILTRATION', 'DATA_BREACH', 'PACKAGE_TYPO_SQUATTING', 'DEPENDENCY_CONFUSION', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OSV', 'GITHUB_ADVISORY', 'CISA_KEV', 'NVD', 'VENDOR_BLOG', 'MAINTAINER_ADVISORY', 'NEWS_ARTICLE', 'COMMUNITY_POST', 'MANUAL');

-- CreateEnum
CREATE TYPE "AdvisorySource" AS ENUM ('OSV', 'GITHUB', 'CISA', 'NVD');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('KNOWN_VULNERABILITY', 'AFFECTED_BY_INCIDENT', 'POSSIBLY_RELATED', 'ACTIVELY_EXPLOITED', 'MALICIOUS_PACKAGE', 'OUTDATED_SECURITY_SENSITIVE_PACKAGE');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'CRITICAL_ONLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "ecosystem" "Ecosystem" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDependency" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT,
    "ecosystem" "Ecosystem" NOT NULL,
    "direct" BOOLEAN NOT NULL DEFAULT false,
    "sourceFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "severity" "Severity" NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "status" "IncidentStatus" NOT NULL,
    "ecosystem" "Ecosystem",
    "incidentType" "IncidentType" NOT NULL,
    "beginnerTldr" TEXT,
    "technicalSummary" TEXT,
    "founderImpact" TEXT,
    "recommendedActions" JSONB,
    "affectedPackages" JSONB,
    "timeline" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentSource" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "claimScope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "trustTier" INTEGER NOT NULL,
    "title" TEXT,
    "excerpt" TEXT,
    "rawContentHash" TEXT,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advisory" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "AdvisorySource" NOT NULL,
    "packageName" TEXT,
    "ecosystem" "Ecosystem",
    "severity" "Severity",
    "cvssScore" DOUBLE PRECISION,
    "summary" TEXT,
    "details" TEXT,
    "affectedRanges" JSONB,
    "patchedVersions" JSONB,
    "references" JSONB,
    "publishedAt" TIMESTAMP(3),
    "modifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentPackage" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "ecosystem" "Ecosystem" NOT NULL,
    "affectedVersions" JSONB,
    "patchedVersions" JSONB,
    "notes" TEXT,

    CONSTRAINT "IncidentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "uploadFileName" TEXT,
    "ecosystem" "Ecosystem" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanFinding" (
    "id" TEXT NOT NULL,
    "scanReportId" TEXT NOT NULL,
    "advisoryId" TEXT,
    "incidentId" TEXT,
    "packageName" TEXT NOT NULL,
    "installedVersion" TEXT,
    "findingType" "FindingType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "explanation" TEXT NOT NULL,
    "actionItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "interests" JSONB,
    "frequency" "DigestFrequency" NOT NULL DEFAULT 'WEEKLY',
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ProjectDependency_packageName_ecosystem_idx" ON "ProjectDependency"("packageName", "ecosystem");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_slug_key" ON "Incident"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Advisory_externalId_key" ON "Advisory"("externalId");

-- CreateIndex
CREATE INDEX "IncidentPackage_packageName_ecosystem_idx" ON "IncidentPackage"("packageName", "ecosystem");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_unsubscribeToken_key" ON "NewsletterSubscription"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDependency" ADD CONSTRAINT "ProjectDependency_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentSource" ADD CONSTRAINT "IncidentSource_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentSource" ADD CONSTRAINT "IncidentSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentPackage" ADD CONSTRAINT "IncidentPackage_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFinding" ADD CONSTRAINT "ScanFinding_scanReportId_fkey" FOREIGN KEY ("scanReportId") REFERENCES "ScanReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFinding" ADD CONSTRAINT "ScanFinding_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "Advisory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFinding" ADD CONSTRAINT "ScanFinding_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterSubscription" ADD CONSTRAINT "NewsletterSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

