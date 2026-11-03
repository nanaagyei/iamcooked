export interface CisaVulnerability {
  cveId: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
}

interface CisaCatalog {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: Array<{
    cveID: string;
    vendorProject: string;
    product: string;
    vulnerabilityName: string;
    dateAdded: string;
    shortDescription: string;
    requiredAction: string;
    dueDate: string;
    knownRansomwareCampaignUse: string;
    notes: string;
  }>;
}

const CISA_KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

let catalogCache: CisaVulnerability[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function mapVuln(raw: CisaCatalog["vulnerabilities"][number]): CisaVulnerability {
  return {
    cveId: raw.cveID,
    vendorProject: raw.vendorProject,
    product: raw.product,
    vulnerabilityName: raw.vulnerabilityName,
    dateAdded: raw.dateAdded,
    shortDescription: raw.shortDescription,
    requiredAction: raw.requiredAction,
    dueDate: raw.dueDate,
    knownRansomwareCampaignUse: raw.knownRansomwareCampaignUse,
    notes: raw.notes,
  };
}

export async function loadKevCatalog(): Promise<CisaVulnerability[]> {
  const now = Date.now();
  if (catalogCache && now - lastFetchTime < CACHE_TTL) {
    return catalogCache;
  }

  const response = await fetch(CISA_KEV_URL);

  if (!response.ok) {
    throw new Error(`CISA KEV catalog fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as CisaCatalog;

  catalogCache = data.vulnerabilities.map(mapVuln);
  lastFetchTime = now;

  return catalogCache;
}

export async function isInKev(cveId: string): Promise<boolean> {
  const catalog = await loadKevCatalog();
  return catalog.some((vuln) => vuln.cveId === cveId);
}
