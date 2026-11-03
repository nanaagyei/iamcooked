/**
 * Cookie consent state. iamcooked only sets strictly-necessary cookies today; the
 * "preferences" and "analytics" categories exist so anything added later is opt-in
 * by default and gated on `hasConsent()`.
 */
export type ConsentCategory = "necessary" | "preferences" | "analytics";

export interface ConsentState {
  version: 1;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
}

export const CONSENT_COOKIE = "iamcooked_consent";
export const OPEN_CONSENT_EVENT = "iamcooked:open-cookie-settings";
const MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then we ask again

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("="))) as ConsentState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: { preferences: boolean; analytics: boolean }): ConsentState {
  const state: ConsentState = { version: 1, necessary: true, ...choice, updatedAt: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("iamcooked:consent-changed", { detail: state }));
  return state;
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  return readConsent()?.[category] === true;
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
