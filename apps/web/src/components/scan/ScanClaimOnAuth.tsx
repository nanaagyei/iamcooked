"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "iamcooked_pending_scans";

export type PendingScan = {
  scanReportId: string;
  accessToken: string;
};

export function getPendingScans(): PendingScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingScan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPendingScan(scan: PendingScan) {
  const existing = getPendingScans();
  const next = [
    scan,
    ...existing.filter((item) => item.scanReportId !== scan.scanReportId),
  ].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearPendingScans() {
  localStorage.removeItem(STORAGE_KEY);
}

export function ScanClaimOnAuth() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const pending = getPendingScans();
    if (pending.length === 0) return;

    void (async () => {
      try {
        await fetch("/api/scan/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scans: pending }),
        });
        clearPendingScans();
      } catch {
        // Keep pending scans for a later attempt.
      }
    })();
  }, [status]);

  return null;
}
