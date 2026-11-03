import { randomBytes } from "node:crypto";

/** Opaque bearer token for scan access / unsubscribe links (not a cuid). */
export function createOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}
