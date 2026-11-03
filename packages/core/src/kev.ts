import type { FetchLike } from "./osv";

export const CISA_KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

/**
 * Load CISA's Known Exploited Vulnerabilities catalog as a Set of CVE IDs.
 * Returns an empty set (never throws) so scans keep working offline.
 */
export async function loadKevSet(fetchImpl: FetchLike = (i, init) => fetch(i, init)): Promise<Set<string>> {
  try {
    const res = await fetchImpl(CISA_KEV_URL);
    if (!res.ok) return new Set();
    const data = (await res.json()) as { vulnerabilities?: Array<{ cveID: string }> };
    return new Set((data.vulnerabilities ?? []).map((v) => v.cveID));
  } catch {
    return new Set();
  }
}
