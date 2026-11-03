import type { OsvVulnerability } from "./osv";

export interface GitHubAdvisory {
  ghsaId: string;
  summary: string;
  description: string;
  severity: string;
  cvssScore?: number;
  patchedVersions: string[];
  references: string[];
  publishedAt?: string;
}

interface GraphQLResponse {
  data?: {
    securityAdvisory?: {
      ghsaId: string;
      summary: string;
      description: string;
      severity: string;
      cvss?: { score: number };
      publishedAt: string;
      references: Array<{ url: string }>;
      vulnerabilities: {
        nodes: Array<{
          firstPatchedVersion?: { identifier: string } | null;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

function getGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token === "ghp-placeholder") return null;
  return token;
}

export async function lookupAdvisory(ghsaId: string): Promise<GitHubAdvisory | null> {
  const token = getGithubToken();
  if (!token) return null;

  const query = `
    query($ghsaId: String!) {
      securityAdvisory(ghsaId: $ghsaId) {
        ghsaId
        summary
        description
        severity
        publishedAt
        cvss { score }
        references { url }
        vulnerabilities(first: 10) {
          nodes {
            firstPatchedVersion { identifier }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { ghsaId } }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as GraphQLResponse;
  const advisory = data.data?.securityAdvisory;
  if (!advisory) return null;

  const patchedVersions = advisory.vulnerabilities.nodes
    .map((node) => node.firstPatchedVersion?.identifier)
    .filter((v): v is string => Boolean(v));

  return {
    ghsaId: advisory.ghsaId,
    summary: advisory.summary,
    description: advisory.description,
    severity: advisory.severity,
    cvssScore: advisory.cvss?.score,
    patchedVersions,
    references: advisory.references.map((ref) => ref.url),
    publishedAt: advisory.publishedAt,
  };
}

export async function enrichFromGitHub(vuln: OsvVulnerability): Promise<OsvVulnerability> {
  const ghsaAlias = vuln.aliases.find((alias) => alias.startsWith("GHSA-"));
  if (!ghsaAlias) return vuln;

  try {
    const github = await lookupAdvisory(ghsaAlias);
    if (!github) return vuln;

    const mergedPatched = [...new Set([...vuln.patchedVersions, ...github.patchedVersions])];

    return {
      ...vuln,
      summary: vuln.summary ?? github.summary,
      details: vuln.details ?? github.description,
      patchedVersions: mergedPatched,
      aliases: [...new Set([...vuln.aliases, github.ghsaId])],
    };
  } catch {
    return vuln;
  }
}
