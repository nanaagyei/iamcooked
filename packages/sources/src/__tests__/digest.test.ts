import { describe, expect, it } from "vitest";
import {
  buildEcosystemSummary,
  filterIncidentsByInterests,
  filterIncidentsForPackages,
  normalizeInterests,
  pickBeginnerLesson,
  type DigestIncident,
} from "../digest-helpers";

const sampleIncidents: DigestIncident[] = [
  {
    id: "1",
    title: "lodash prototype pollution",
    slug: "lodash-proto",
    severity: "HIGH",
    ecosystem: "NPM",
    beginnerTldr: "A popular utility library has a known flaw.",
    packages: [{ packageName: "lodash", ecosystem: "NPM" }],
  },
  {
    id: "2",
    title: "pypi package compromise",
    slug: "pypi-compromise",
    severity: "CRITICAL",
    ecosystem: "PYPI",
    beginnerTldr: "A malicious PyPI release was published.",
    packages: [{ packageName: "requests-fake", ecosystem: "PYPI" }],
  },
];

describe("digest helpers", () => {
  it("normalizes interests with npm default", () => {
    expect(normalizeInterests(null)).toEqual(["npm"]);
    expect(normalizeInterests(["pypi"])).toEqual(["pypi"]);
  });

  it("filters incidents by subscriber interests", () => {
    const npmOnly = filterIncidentsByInterests(sampleIncidents, ["npm"]);
    expect(npmOnly).toHaveLength(1);
    expect(npmOnly[0]?.slug).toBe("lodash-proto");
  });

  it("filters critical incidents by watched/scanned packages", () => {
    const packages = new Set(["lodash"]);
    const relevant = filterIncidentsForPackages(sampleIncidents, packages);
    expect(relevant).toHaveLength(1);
    expect(relevant[0]?.packages[0]?.packageName).toBe("lodash");
  });

  it("returns empty when no package overlap", () => {
    expect(filterIncidentsForPackages(sampleIncidents, new Set(["express"]))).toEqual([]);
  });

  it("builds ecosystem summary from severities", () => {
    const summary = buildEcosystemSummary(sampleIncidents);
    expect(summary).toContain("critical");
    expect(summary).toContain("high");
  });

  it("rotates beginner lessons", () => {
    const lessonA = pickBeginnerLesson(0);
    const lessonB = pickBeginnerLesson(1);
    expect(lessonA.title).not.toBe(lessonB.title);
    expect(lessonA.url).toMatch(/^\/learn\//);
  });
});
