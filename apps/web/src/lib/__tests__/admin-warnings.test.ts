import { describe, expect, it } from "vitest";
import { getAdminIncidentWarnings } from "../admin-warnings";

describe("getAdminIncidentWarnings", () => {
  const base = {
    id: "inc-1",
    severity: "HIGH",
    confidence: "LIKELY",
    technicalSummary: "Known issue in lodash.",
    sources: [
      { source: { sourceType: "OSV" } },
      { source: { sourceType: "GITHUB_ADVISORY" } },
    ],
    packages: [
      {
        packageName: "lodash",
        affectedVersions: ["4.17.20"],
        notes: null,
      },
    ],
  };

  it("flags low source count", () => {
    const warnings = getAdminIncidentWarnings({
      ...base,
      sources: [{ source: { sourceType: "OSV" } }],
    });
    expect(warnings.some((w) => w.id === "low-sources")).toBe(true);
  });

  it("flags missing affected versions", () => {
    const warnings = getAdminIncidentWarnings({
      ...base,
      packages: [{ packageName: "lodash", affectedVersions: [], notes: null }],
    });
    expect(warnings.some((w) => w.id === "missing-versions")).toBe(true);
  });

  it("flags critical without KEV source", () => {
    const warnings = getAdminIncidentWarnings({
      ...base,
      severity: "CRITICAL",
    });
    expect(warnings.some((w) => w.id === "kev-unknown")).toBe(true);
  });
});
