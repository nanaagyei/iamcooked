import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  OSV_API_BASE_URL: z.string().url().default("https://api.osv.dev"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const severitySchema = z.enum([
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
  "UNKNOWN",
]);

export const confidenceSchema = z.enum([
  "CONFIRMED",
  "LIKELY",
  "DEVELOPING",
  "UNVERIFIED",
  "DISPUTED",
]);

export const ecosystemSchema = z.enum([
  "NPM",
  "PYPI",
  "GO",
  "MAVEN",
  "RUBYGEMS",
  "NUGET",
  "CARGO",
  "COMPOSER",
  "GITHUB_ACTIONS",
  "UNKNOWN",
]);

export const incidentTypeSchema = z.enum([
  "CVE",
  "SUPPLY_CHAIN_ATTACK",
  "MALICIOUS_PACKAGE",
  "MAINTAINER_COMPROMISE",
  "CI_CD_COMPROMISE",
  "SECRET_EXFILTRATION",
  "DATA_BREACH",
  "PACKAGE_TYPO_SQUATTING",
  "DEPENDENCY_CONFUSION",
  "OTHER",
]);

export const incidentStatusSchema = z.enum([
  "DRAFT",
  "NEEDS_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export const digestFrequencySchema = z.enum(["DAILY", "WEEKLY", "CRITICAL_ONLY"]);

export const cuidParamSchema = z.string().min(1).max(64);

export const slugParamSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const incidentsQuerySchema = z.object({
  severity: severitySchema.optional(),
  ecosystem: ecosystemSchema.optional(),
  type: incidentTypeSchema.optional(),
  package: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  interests: z.array(z.string().max(50)).optional().default(["npm"]),
  frequency: digestFrequencySchema.optional().default("WEEKLY"),
});

export const adminIncidentCreateSchema = z.object({
  title: z.string().min(1).max(500),
  slug: slugParamSchema,
  severity: severitySchema,
  confidence: confidenceSchema,
  incidentType: incidentTypeSchema,
  beginnerTldr: z.string().max(10000).optional(),
  technicalSummary: z.string().max(50000).optional(),
});

export const adminIncidentPatchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  beginnerTldr: z.string().max(10000).optional(),
  technicalSummary: z.string().max(50000).optional(),
  severity: severitySchema.optional(),
  confidence: confidenceSchema.optional(),
  status: incidentStatusSchema.optional(),
  recommendedActions: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        command: z.string().optional(),
        urgency: z.string(),
      }),
    )
    .optional(),
});

export const aiGenerateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("incident-extraction"),
    incidentId: cuidParamSchema.optional(),
    input: z.object({
      title: z.string().min(1).max(500),
      excerpt: z.string().max(50000),
      url: z.string().url(),
      sourceType: z.string().max(100),
    }),
  }),
  z.object({
    type: z.literal("beginner-tldr"),
    incidentId: cuidParamSchema.optional(),
    input: z.object({
      title: z.string().min(1).max(500),
      severity: z.string().max(50),
      technicalSummary: z.string().max(50000),
      packages: z.array(z.string().max(200)).optional(),
    }),
  }),
  z.object({
    type: z.literal("technical-summary"),
    incidentId: cuidParamSchema.optional(),
    input: z.object({
      title: z.string().min(1).max(500),
      severity: z.string().max(50),
      technicalSummary: z.string().max(50000).optional(),
      packages: z.array(z.string().max(200)).optional(),
      sourceExcerpts: z.array(z.string().max(10000)).optional(),
    }),
  }),
  z.object({
    type: z.literal("source-verification"),
    incidentId: cuidParamSchema,
    input: z.object({
      title: z.string().min(1).max(500),
      claims: z.array(z.string().max(2000)).max(50),
      sourceExcerpts: z.array(z.string().max(10000)).max(20),
    }),
  }),
  z.object({
    type: z.literal("digest-summary"),
    input: z.object({
      incidents: z
        .array(
          z.object({
            title: z.string().max(500),
            beginnerTldr: z.string().max(5000),
          }),
        )
        .max(10),
    }),
  }),
]);

export const aiRemediationSchema = z.object({
  scanReportId: cuidParamSchema,
  scanAccessToken: z.string().min(1).max(64).optional(),
  regenerate: z.boolean().optional().default(false),
});

const uiMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema).optional(),
  content: z.string().optional(),
});

export const copilotChatSchema = z
  .object({
    messages: z.array(uiMessageSchema).max(20).default([]),
    incidentSlug: slugParamSchema.optional(),
    scanReportId: cuidParamSchema.optional(),
    scanAccessToken: z.string().min(1).max(64).optional(),
  })
  .refine(
    (data) => !data.scanReportId || !!data.scanAccessToken,
    {
      message: "scanAccessToken is required when scanReportId is provided",
      path: ["scanAccessToken"],
    },
  );

export const watchlistCreateSchema = z.object({
  packageName: z.string().min(1).max(200),
  ecosystem: ecosystemSchema.default("NPM"),
});

export const userPreferencesPatchSchema = z.object({
  frequency: digestFrequencySchema.optional(),
  interests: z.array(z.string().max(50)).optional(),
});

export const cronDigestQuerySchema = z.object({
  type: z.enum(["weekly", "critical"]).default("weekly"),
});

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeStoredText(value: string, maxLength = 5000): string {
  return value.replace(/\0/g, "").slice(0, maxLength);
}
