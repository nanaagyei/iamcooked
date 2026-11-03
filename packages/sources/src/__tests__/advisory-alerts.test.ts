import { describe, expect, it, vi } from "vitest";

vi.mock("@iamcooked/db", () => ({ prisma: {} }));
vi.mock("resend", () => ({ Resend: vi.fn() }));

import { selectNewAdvisories } from "../advisory-alerts";

describe("selectNewAdvisories", () => {
  const since = new Date("2026-11-01T00:00:00Z").getTime();
  it("keeps only advisories published in the window and collapses aliases", () => {
    const out = selectNewAdvisories(
      [
        { id: "PYSEC-1", aliases: ["GHSA-new"], published: "2026-11-02T10:00:00Z", modified: "" },
        { id: "GHSA-new", aliases: ["CVE-2026-1"], published: "2026-11-02T10:00:00Z", modified: "", summary: "RCE", database_specific: { severity: "CRITICAL" }, affected: [{ ranges: [{ type: "SEMVER", events: [{ introduced: "0" }, { fixed: "2.0.0" }] }] }] },
        { id: "GHSA-old", published: "2025-01-01T00:00:00Z", modified: "2026-11-02T00:00:00Z" },
        { id: "MAL-2026-9", published: "2026-11-02T12:00:00Z", modified: "" },
      ],
      { ecosystem: "NPM", packageName: "x" },
      since,
    );
    expect(out.map((a) => [a.id, a.severity, a.malware])).toEqual([
      ["GHSA-new", "CRITICAL", false],
      ["MAL-2026-9", "CRITICAL", true],
    ]);
    expect(out[0]!.fixedVersions).toEqual(["2.0.0"]);
    expect(out[0]!.cve).toBe("CVE-2026-1");
  });
});
