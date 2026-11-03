export interface OsvQueryItem {
  name: string;
  version?: string;
  ecosystem?: string;
}

export interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  severity?: Array<{ type: string; score: string }>;
  affectedVersions: string[];
  patchedVersions: string[];
  aliases: string[];
  published: string;
  modified: string;
}

export interface OsvBatchResult {
  found: OsvVulnerability[];
  notFound: string[];
}

interface OsvRawVuln {
  id: string;
  summary?: string;
  details?: string;
  severity?: Array<{ type: string; score: string }>;
  affected?: Array<{
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string; last_affected?: string }>;
    }>;
    versions?: string[];
  }>;
  aliases?: string[];
  modified: string;
  published: string;
}

interface OsvBatchResponse {
  results: Array<{ vulns?: OsvRawVuln[] }>;
}

function getBaseUrl(): string {
  return process.env["OSV_API_BASE_URL"] ?? "https://api.osv.dev";
}

function parseVuln(raw: OsvRawVuln): OsvVulnerability {
  const affectedVersions: string[] = [];
  const patchedVersions: string[] = [];

  if (raw.affected) {
    for (const affected of raw.affected) {
      if (affected.ranges) {
        for (const range of affected.ranges) {
          for (const event of range.events) {
            if (event.introduced) affectedVersions.push(event.introduced);
            if (event.fixed) patchedVersions.push(event.fixed);
            if (event.last_affected) affectedVersions.push(event.last_affected);
          }
        }
      }
      if (affected.versions) {
        affectedVersions.push(...affected.versions);
      }
    }
  }

  return {
    id: raw.id,
    summary: raw.summary,
    details: raw.details,
    severity: raw.severity,
    affectedVersions,
    patchedVersions,
    aliases: raw.aliases ?? [],
    published: raw.published,
    modified: raw.modified,
  };
}

export async function querySingle(name: string, version: string): Promise<OsvVulnerability[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/v1/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { name, ecosystem: "npm" },
      version,
    }),
  });

  if (!response.ok) {
    throw new Error(`OSV query failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { vulns?: OsvRawVuln[] };
  return (data.vulns ?? []).map(parseVuln);
}

export async function queryBatch(
  dependencies: Array<{ name: string; version: string }>,
): Promise<Record<string, OsvVulnerability[]>> {
  const baseUrl = getBaseUrl();

  const queries = dependencies.map((dep) => ({
    package: { name: dep.name, ecosystem: "npm" },
    version: dep.version,
  }));

  const response = await fetch(`${baseUrl}/v1/querybatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries }),
  });

  if (!response.ok) {
    throw new Error(`OSV batch query failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OsvBatchResponse;
  const result: Record<string, OsvVulnerability[]> = {};

  for (let i = 0; i < dependencies.length; i++) {
    const dep = dependencies[i]!;
    const batchResult = data.results[i];
    const vulns = batchResult?.vulns ?? [];
    result[`${dep.name}@${dep.version}`] = vulns.map(parseVuln);
  }

  return result;
}
