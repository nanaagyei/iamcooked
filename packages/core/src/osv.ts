import type { CoreEcosystem } from "./ecosystems";
import { OSV_ECOSYSTEM } from "./ecosystems";

/** Raw OSV record — https://ossf.github.io/osv-schema/ */
export interface OsvRecord {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  related?: string[];
  modified: string;
  published?: string;
  withdrawn?: string;
  severity?: Array<{ type: string; score: string }>;
  affected?: Array<{
    package?: { ecosystem: string; name: string; purl?: string };
    severity?: Array<{ type: string; score: string }>;
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string; last_affected?: string; limit?: string }>;
    }>;
    versions?: string[];
    database_specific?: Record<string, unknown>;
    ecosystem_specific?: Record<string, unknown>;
  }>;
  references?: Array<{ type: string; url: string }>;
  database_specific?: Record<string, unknown>;
}

export interface OsvQuery {
  ecosystem: CoreEcosystem;
  name: string;
  version: string;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface OsvClientOptions {
  baseUrl?: string;
  fetch?: FetchLike;
  /** Max concurrent /v1/vulns/{id} requests when hydrating. */
  concurrency?: number;
  userAgent?: string;
}

const DEFAULT_ORIGIN = "https://api.osv.dev";
const ALLOWED_HOSTS = new Set(["api.osv.dev"]);
const BATCH_LIMIT = 1000;

/** Resolve OSV API origin; reject non-allowlisted hosts to prevent SSRF. */
export function resolveOsvBaseUrl(raw?: string): string {
  if (!raw) return DEFAULT_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) return DEFAULT_ORIGIN;
    return url.origin;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Small OSV.dev client.
 *
 * Important: `/v1/querybatch` only returns `{id, modified}` per vulnerability, so results
 * must be *hydrated* with `/v1/vulns/{id}` to get summaries, severities and fixed versions.
 */
export class OsvClient {
  private readonly base: string;
  private readonly fetchImpl: FetchLike;
  private readonly concurrency: number;
  private readonly headers: Record<string, string>;
  private readonly cache = new Map<string, Promise<OsvRecord | null>>();

  constructor(opts: OsvClientOptions = {}) {
    this.base = resolveOsvBaseUrl(opts.baseUrl);
    this.fetchImpl = opts.fetch ?? ((input, init) => fetch(input, init));
    this.concurrency = opts.concurrency ?? 12;
    this.headers = { "Content-Type": "application/json" };
    if (opts.userAgent) this.headers["User-Agent"] = opts.userAgent;
  }

  /** Returns vulnerability IDs per query, in the same order as `queries`. */
  async queryBatchIds(queries: OsvQuery[]): Promise<string[][]> {
    const results: string[][] = [];
    for (let i = 0; i < queries.length; i += BATCH_LIMIT) {
      const chunk = queries.slice(i, i + BATCH_LIMIT);
      const res = await this.fetchImpl(`${this.base}/v1/querybatch`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          queries: chunk.map((q) => ({
            package: { name: q.name, ecosystem: OSV_ECOSYSTEM[q.ecosystem] },
            version: q.version,
          })),
        }),
      });
      if (!res.ok) throw new Error(`OSV batch query failed: ${res.status} ${res.statusText}`);
      const data = (await res.json()) as { results?: Array<{ vulns?: Array<{ id: string }> }> };
      for (let j = 0; j < chunk.length; j++) {
        results.push((data.results?.[j]?.vulns ?? []).map((v) => v.id));
      }
    }
    return results;
  }

  /** Full record for one vulnerability (cached per client). */
  getVuln(id: string): Promise<OsvRecord | null> {
    let p = this.cache.get(id);
    if (!p) {
      p = (async () => {
        const res = await this.fetchImpl(`${this.base}/v1/vulns/${encodeURIComponent(id)}`, {
          headers: this.headers,
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`OSV vuln lookup failed for ${id}: ${res.status}`);
        return (await res.json()) as OsvRecord;
      })();
      this.cache.set(id, p);
      p.catch(() => this.cache.delete(id));
    }
    return p;
  }

  async getVulns(ids: string[]): Promise<Map<string, OsvRecord>> {
    const unique = [...new Set(ids)];
    const records = await mapLimit(unique, this.concurrency, (id) => this.getVuln(id));
    const map = new Map<string, OsvRecord>();
    records.forEach((r, i) => {
      if (r && !r.withdrawn) map.set(unique[i]!, r);
    });
    return map;
  }

  /** All known vulnerabilities for a package (optionally at a version). Returns full records. */
  async queryPackage(ecosystem: CoreEcosystem, name: string, version?: string): Promise<OsvRecord[]> {
    const vulns: OsvRecord[] = [];
    let pageToken: string | undefined;
    for (let page = 0; page < 10; page++) {
      const res = await this.fetchImpl(`${this.base}/v1/query`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          package: { name, ecosystem: OSV_ECOSYSTEM[ecosystem] },
          ...(version ? { version } : {}),
          ...(pageToken ? { page_token: pageToken } : {}),
        }),
      });
      if (!res.ok) throw new Error(`OSV query failed: ${res.status} ${res.statusText}`);
      const data = (await res.json()) as { vulns?: OsvRecord[]; next_page_token?: string };
      vulns.push(...(data.vulns ?? []).filter((v) => !v.withdrawn));
      pageToken = data.next_page_token;
      if (!pageToken) break;
    }
    return vulns;
  }
}
