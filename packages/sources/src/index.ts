export { querySingle, queryBatch } from "./osv";
export type { OsvQueryItem, OsvVulnerability, OsvBatchResult } from "./osv";
export { loadKevCatalog, isInKev } from "./cisa";
export type { CisaVulnerability } from "./cisa";
export { lookupAdvisory, enrichFromGitHub } from "./github-advisory";
export type { GitHubAdvisory } from "./github-advisory";
export { sendWeeklyDigest, sendCriticalAlerts } from "./digest";
export {
  normalizeInterests,
  filterIncidentsByInterests,
  filterIncidentsForPackages,
  buildEcosystemSummary,
  pickBeginnerLesson,
} from "./digest-helpers";
export type { DigestIncident, DigestSubscriber } from "./digest-helpers";
